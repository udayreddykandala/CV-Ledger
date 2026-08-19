import uuid
from datetime import date, datetime

from pydantic import BaseModel, ConfigDict, EmailStr, Field

from .models import Status


class SignUp(BaseModel):
    email: EmailStr
    password: str = Field(min_length=8, max_length=128)
    full_name: str


class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"


class UserOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    email: EmailStr
    full_name: str
    phone: str | None
    location: str | None
    target_roles: str | None


class ProfileUpdate(BaseModel):
    full_name: str | None = None
    phone: str | None = None
    location: str | None = None
    target_roles: str | None = None


class CvOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    label: str
    file_name: str
    file_size: int
    terms: str | None
    is_default: bool
    created_at: datetime


class EventIn(BaseModel):
    happened_on: date
    label: str


class EventOut(EventIn):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID


class ApplicationIn(BaseModel):
    role: str
    company: str
    location: str | None = None
    source: str | None = None
    posting_url: str | None = None
    jd_title: str | None = None
    jd_text: str | None = None
    notes: str | None = None
    applied_on: date
    cv_version_id: uuid.UUID | None = None
    remind_after_days: int | None = 10


class ApplicationUpdate(BaseModel):
    role: str | None = None
    company: str | None = None
    location: str | None = None
    source: str | None = None
    posting_url: str | None = None
    jd_title: str | None = None
    jd_text: str | None = None
    notes: str | None = None
    status: Status | None = None
    cv_version_id: uuid.UUID | None = None


class ApplicationOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    reference: str
    role: str
    company: str
    location: str | None
    source: str | None
    posting_url: str | None
    jd_title: str | None
    jd_text: str | None
    notes: str | None
    applied_on: date
    status: Status
    cv_version: CvOut | None
    events: list[EventOut]
