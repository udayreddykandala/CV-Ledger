from fastapi import APIRouter, Depends, HTTPException
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session

from ..database import get_db
from ..models import User
from ..schemas import SignUp, Token, UserOut
from ..security import create_access_token, current_user, hash_password, verify_password

router = APIRouter(prefix="/api/auth", tags=["auth"])


@router.post("/signup", response_model=Token, status_code=201)
def signup(body: SignUp, db: Session = Depends(get_db)):
    if db.query(User).filter(User.email == body.email).first():
        raise HTTPException(status_code=409, detail="Email already registered")
    user = User(email=str(body.email), password_hash=hash_password(body.password), full_name=body.full_name)
    db.add(user)
    db.commit()
    return Token(access_token=create_access_token(user.email))


@router.post("/login", response_model=Token)
def login(form: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == form.username).first()
    if not user or not verify_password(form.password, user.password_hash):
        raise HTTPException(status_code=401, detail="Incorrect email or password")
    return Token(access_token=create_access_token(user.email))


@router.post("/logout", status_code=204)
def logout():
    """Tokens are stateless: the client drops the token. Kept as an explicit
    endpoint so a deny-list can be added later without a contract change."""
    return None


@router.get("/me", response_model=UserOut)
def me(user: User = Depends(current_user)):
    return user
