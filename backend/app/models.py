import enum
import uuid
from datetime import date, datetime

from sqlalchemy import Date, DateTime, Enum, ForeignKey, Integer, String, Text, func
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from .database import Base


class Status(str, enum.Enum):
    applied = "applied"
    screening_call = "screening_call"
    interview = "interview"
    offer = "offer"
    rejected = "rejected"
    no_response = "no_response"


class User(Base):
    __tablename__ = "users"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    email: Mapped[str] = mapped_column(String(255), unique=True, index=True, nullable=False)
    password_hash: Mapped[str] = mapped_column(String(255), nullable=False)
    full_name: Mapped[str] = mapped_column(String(120), nullable=False)
    phone: Mapped[str | None] = mapped_column(String(40))
    location: Mapped[str | None] = mapped_column(String(120))
    target_roles: Mapped[str | None] = mapped_column(String(200))
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())

    cvs: Mapped[list["CvVersion"]] = relationship(back_populates="user", cascade="all, delete-orphan")
    applications: Mapped[list["Application"]] = relationship(back_populates="user", cascade="all, delete-orphan")


class CvVersion(Base):
    """One uploaded CV file. Applications point at the version that was sent,
    so a record can always answer "which CV did they read?"."""

    __tablename__ = "cv_versions"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("users.id", ondelete="CASCADE"), index=True)
    label: Mapped[str] = mapped_column(String(120), nullable=False)
    file_name: Mapped[str] = mapped_column(String(255), nullable=False)
    file_path: Mapped[str] = mapped_column(Text, nullable=False)
    file_size: Mapped[int] = mapped_column(Integer, nullable=False)
    content_type: Mapped[str] = mapped_column(String(120), nullable=False)
    # Comma-separated terms this version actually covers. The frontend diffs a
    # pasted JD against this list to show keyword coverage.
    terms: Mapped[str | None] = mapped_column(Text)
    is_default: Mapped[bool] = mapped_column(default=False, nullable=False)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())

    user: Mapped[User] = relationship(back_populates="cvs")
    applications: Mapped[list["Application"]] = relationship(back_populates="cv_version")


class Application(Base):
    __tablename__ = "applications"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    reference: Mapped[str] = mapped_column(String(16), index=True, nullable=False)
    user_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("users.id", ondelete="CASCADE"), index=True)
    cv_version_id: Mapped[uuid.UUID | None] = mapped_column(ForeignKey("cv_versions.id", ondelete="SET NULL"))

    role: Mapped[str] = mapped_column(String(160), nullable=False)
    company: Mapped[str] = mapped_column(String(160), nullable=False, index=True)
    location: Mapped[str | None] = mapped_column(String(120))
    source: Mapped[str | None] = mapped_column(String(120))
    posting_url: Mapped[str | None] = mapped_column(Text)
    jd_title: Mapped[str | None] = mapped_column(String(200))
    jd_text: Mapped[str | None] = mapped_column(Text)
    notes: Mapped[str | None] = mapped_column(Text)
    applied_on: Mapped[date] = mapped_column(Date, nullable=False)
    status: Mapped[Status] = mapped_column(Enum(Status, name="application_status"), default=Status.applied, nullable=False)
    remind_after_days: Mapped[int | None] = mapped_column(Integer, default=10)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())

    user: Mapped[User] = relationship(back_populates="applications")
    cv_version: Mapped["CvVersion | None"] = relationship(back_populates="applications")
    events: Mapped[list["Event"]] = relationship(back_populates="application", cascade="all, delete-orphan", order_by="Event.happened_on")


class Event(Base):
    """A dated line on the record's timeline: applied, call, interview, decision."""

    __tablename__ = "application_events"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    application_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("applications.id", ondelete="CASCADE"), index=True)
    happened_on: Mapped[date] = mapped_column(Date, nullable=False)
    label: Mapped[str] = mapped_column(String(240), nullable=False)

    application: Mapped[Application] = relationship(back_populates="events")
