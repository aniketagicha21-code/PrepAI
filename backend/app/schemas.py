import uuid
from datetime import datetime
from typing import Literal

from pydantic import BaseModel, Field

InterviewType = Literal["technical", "behavioral", "mixed"]
Role = Literal["swe", "ml_engineer", "frontend", "backend", "full_stack"]


class SessionCreateRequest(BaseModel):
    interview_type: InterviewType
    role: Role


class QuestionItem(BaseModel):
    order: int = Field(ge=0, le=4)
    text: str


class SessionCreateResponse(BaseModel):
    session_id: uuid.UUID
    interview_type: str
    role: str
    questions: list[QuestionItem]


class AnswerFeedback(BaseModel):
    clarity_score: int = Field(ge=1, le=10)
    structure_score: int = Field(ge=1, le=10)
    filler_word_count: int = Field(ge=0)
    answer_length_words: int = Field(ge=0)
    question_answered: bool
    feedback_summary: str


class SubmitAnswerResponse(BaseModel):
    answer_id: uuid.UUID
    transcript: str
    feedback: AnswerFeedback


class SubmitTextRequest(BaseModel):
    question_order: int = Field(ge=0, le=4)
    transcript: str = Field(min_length=1, max_length=12000)


class SessionFullSummaryOut(BaseModel):
    session_id: uuid.UUID
    answered_count: int
    avg_clarity: float
    avg_structure: float
    avg_filler_words: float
    avg_length_words: float
    best_question_order: int | None
    worst_question_order: int | None
    best_question_text: str | None
    worst_question_text: str | None
    improvement_tips: str


class AnswerOut(BaseModel):
    id: uuid.UUID
    question_order: int
    question_text: str
    transcript: str
    clarity_score: int
    structure_score: int
    filler_word_count: int
    answer_length_words: int
    question_answered: bool
    feedback_summary: str

    model_config = {"from_attributes": True}


class SessionSummaryOut(BaseModel):
    id: uuid.UUID
    created_at: datetime
    interview_type: str
    role: str
    avg_clarity: float | None
    avg_structure: float | None
    total_filler_words: int
    questions_completed: int


class SessionDetailOut(BaseModel):
    id: uuid.UUID
    created_at: datetime
    interview_type: str
    role: str
    answers: list[AnswerOut]


class ImprovementPoint(BaseModel):
    date: datetime
    session_id: uuid.UUID
    avg_clarity: float | None
    avg_structure: float | None
