import uuid
from pathlib import Path

from fastapi import APIRouter, Depends, File, Form, HTTPException, UploadFile
from fastapi.responses import FileResponse
from sqlalchemy.orm import Session

from ..config import settings
from ..database import get_db
from ..models import CvVersion, User
from ..schemas import CvOut
from ..security import current_user

router = APIRouter(prefix="/api/cvs", tags=["cv versions"])

ALLOWED = {
    "application/pdf",
    "application/msword",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
}


@router.post("", response_model=CvOut, status_code=201)
async def upload_cv(
    file: UploadFile = File(...),
    label: str = Form("Untitled version"),
    terms: str = Form(""),
    is_default: bool = Form(False),
    user: User = Depends(current_user),
    db: Session = Depends(get_db),
):
    if file.content_type not in ALLOWED:
        raise HTTPException(status_code=415, detail="Upload a PDF or DOCX file")

    payload = await file.read()
    if len(payload) > settings.max_upload_bytes:
        raise HTTPException(status_code=413, detail="File exceeds 10 MB")

    folder = Path(settings.upload_dir) / str(user.id)
    folder.mkdir(parents=True, exist_ok=True)
    stored = folder / f"{uuid.uuid4()}{Path(file.filename).suffix.lower()}"
    stored.write_bytes(payload)

    if is_default:
        db.query(CvVersion).filter(CvVersion.user_id == user.id).update({CvVersion.is_default: False})

    version = CvVersion(
        user_id=user.id,
        label=label,
        file_name=file.filename,
        file_path=str(stored),
        file_size=len(payload),
        content_type=file.content_type,
        terms=terms or None,
        is_default=is_default,
    )
    db.add(version)
    db.commit()
    db.refresh(version)
    return version


@router.get("", response_model=list[CvOut])
def my_cvs(user: User = Depends(current_user), db: Session = Depends(get_db)):
    return (
        db.query(CvVersion)
        .filter(CvVersion.user_id == user.id)
        .order_by(CvVersion.created_at.desc())
        .all()
    )


@router.get("/{cv_id}/download")
def download_cv(cv_id: uuid.UUID, user: User = Depends(current_user), db: Session = Depends(get_db)):
    version = db.get(CvVersion, cv_id)
    if version is None or version.user_id != user.id:
        raise HTTPException(status_code=404, detail="Not found")
    return FileResponse(version.file_path, filename=version.file_name, media_type=version.content_type)


@router.delete("/{cv_id}", status_code=204)
def delete_cv(cv_id: uuid.UUID, user: User = Depends(current_user), db: Session = Depends(get_db)):
    version = db.get(CvVersion, cv_id)
    if version is None or version.user_id != user.id:
        raise HTTPException(status_code=404, detail="Not found")
    db.delete(version)
    db.commit()
    return None
