import uuid
from datetime import datetime, timezone

from sqlalchemy import Boolean, DateTime, ForeignKey, Integer, String, Text, Uuid
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database import Base


def utc_now():
    return datetime.now(timezone.utc)


class InterviewSession(Base):
    __tablename__ = "interview_sessions"

    id: Mapped[uuid.UUID] = mapped_column(Uuid(as_uuid=True), primary_key=True, default=uuid.uuid4)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utc_now)
    interview_type: Mapped[str] = mapped_column(String(32), nullable=False)
    role: Mapped[str] = mapped_column(String(64), nullable=False)

    answers: Mapped[list["QuestionAnswer"]] = relationship(
        "QuestionAnswer",
        back_populates="session",
        cascade="all, delete-orphan",
        order_by="QuestionAnswer.question_order",
    )


class QuestionAnswer(Base):
    __tablename__ = "question_answers"

    id: Mapped[uuid.UUID] = mapped_column(Uuid(as_uuid=True), primary_key=True, default=uuid.uuid4)
    session_id: Mapped[uuid.UUID] = mapped_column(
        Uuid(as_uuid=True),
        ForeignKey("interview_sessions.id", ondelete="CASCADE"),
        nullable=False,
    )
    question_order: Mapped[int] = mapped_column(Integer, nullable=False)
    question_text: Mapped[str] = mapped_column(Text, nullable=False)
    transcript: Mapped[str] = mapped_column(Text, nullable=False, default="")
    clarity_score: Mapped[int] = mapped_column(Integer, nullable=False)
    structure_score: Mapped[int] = mapped_column(Integer, nullable=False)
    filler_word_count: Mapped[int] = mapped_column(Integer, nullable=False)
    answer_length_words: Mapped[int] = mapped_column(Integer, nullable=False)
    question_answered: Mapped[bool] = mapped_column(Boolean, nullable=False)
    feedback_summary: Mapped[str] = mapped_column(Text, nullable=False, default="")

    session: Mapped["InterviewSession"] = relationship("InterviewSession", back_populates="answers")
