import uuid
from datetime import date

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import or_
from sqlalchemy.orm import Session

from ..database import get_db
from ..models import Application, CvVersion, Event, Status, User
from ..schemas import ApplicationIn, ApplicationOut, ApplicationUpdate, EventIn, EventOut
from ..security import current_user

router = APIRouter(prefix="/api/applications", tags=["applications"])


def _owned(app_id: uuid.UUID, user: User, db: Session) -> Application:
    app = db.get(Application, app_id)
    if app is None or app.user_id != user.id:
        raise HTTPException(status_code=404, detail="Not found")
    return app


def _next_reference(user: User, db: Session) -> str:
    count = db.query(Application).filter(Application.user_id == user.id).count()
    return f"REC-{100 + count + 1}"


@router.post("", response_model=ApplicationOut, status_code=201)
def create_application(body: ApplicationIn, user: User = Depends(current_user), db: Session = Depends(get_db)):
    if body.cv_version_id:
        cv = db.get(CvVersion, body.cv_version_id)
        if cv is None or cv.user_id != user.id:
            raise HTTPException(status_code=400, detail="Unknown CV version")

    app = Application(reference=_next_reference(user, db), user_id=user.id, **body.model_dump())
    app.events.append(Event(happened_on=body.applied_on, label="Application logged"))
    db.add(app)
    db.commit()
    db.refresh(app)
    return app


@router.get("", response_model=list[ApplicationOut])
def my_applications(
    q: str | None = None,
    status: Status | None = None,
    user: User = Depends(current_user),
    db: Session = Depends(get_db),
):
    """The dashboard list. `q` searches company, role and CV filename — the
    query you run when a number you don't recognise calls you."""
    query = db.query(Application).outerjoin(CvVersion).filter(Application.user_id == user.id)
    if status:
        query = query.filter(Application.status == status)
    if q:
        like = f"%{q}%"
        query = query.filter(
            or_(Application.company.ilike(like), Application.role.ilike(like), CvVersion.file_name.ilike(like))
        )
    return query.order_by(Application.applied_on.desc()).all()


@router.get("/{app_id}", response_model=ApplicationOut)
def get_application(app_id: uuid.UUID, user: User = Depends(current_user), db: Session = Depends(get_db)):
    return _owned(app_id, user, db)


@router.patch("/{app_id}", response_model=ApplicationOut)
def update_application(
    app_id: uuid.UUID,
    body: ApplicationUpdate,
    user: User = Depends(current_user),
    db: Session = Depends(get_db),
):
    app = _owned(app_id, user, db)
    changes = body.model_dump(exclude_unset=True)
    if "status" in changes and changes["status"] != app.status:
        app.events.append(Event(happened_on=date.today(), label=f"Status set to {changes['status'].value}"))
    for field, value in changes.items():
        setattr(app, field, value)
    db.commit()
    db.refresh(app)
    return app


@router.post("/{app_id}/events", response_model=EventOut, status_code=201)
def add_event(
    app_id: uuid.UUID,
    body: EventIn,
    user: User = Depends(current_user),
    db: Session = Depends(get_db),
):
    app = _owned(app_id, user, db)
    event = Event(application_id=app.id, **body.model_dump())
    db.add(event)
    db.commit()
    db.refresh(event)
    return event


@router.delete("/{app_id}", status_code=204)
def delete_application(app_id: uuid.UUID, user: User = Depends(current_user), db: Session = Depends(get_db)):
    db.delete(_owned(app_id, user, db))
    db.commit()
    return None
