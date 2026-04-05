import uuid

from fastapi import APIRouter, Depends, File, Form, HTTPException, UploadFile
from sqlalchemy.orm import Session

from app.database import get_db
from app.models import InterviewSession, QuestionAnswer
from app.schemas import (
    AnswerFeedback,
    AnswerOut,
    ImprovementPoint,
    SessionCreateRequest,
    SessionCreateResponse,
    SessionDetailOut,
    SessionFullSummaryOut,
    SessionSummaryOut,
    SubmitAnswerResponse,
    SubmitTextRequest,
)
from app.services.filler_words import count_filler_words, word_count
from app.services.questions import generate_questions, score_answer
from app.services.summary import generate_improvement_tips
from app.services.transcription import transcribe_audio_bytes

router = APIRouter(prefix="/api/sessions", tags=["sessions"])


def _persist_scored_answer(qrow: QuestionAnswer, transcript: str, db: Session) -> SubmitAnswerResponse:
    transcript = transcript.strip()
    fillers = count_filler_words(transcript)
    words = word_count(transcript)
    scored = score_answer(qrow.question_text, transcript, fillers, words)
    qrow.transcript = transcript
    qrow.clarity_score = scored["clarity_score"]
    qrow.structure_score = scored["structure_score"]
    qrow.filler_word_count = fillers
    qrow.answer_length_words = words
    qrow.question_answered = scored["question_answered"]
    qrow.feedback_summary = scored["feedback_summary"]
    db.commit()
    db.refresh(qrow)
    fb = AnswerFeedback(
        clarity_score=qrow.clarity_score,
        structure_score=qrow.structure_score,
        filler_word_count=qrow.filler_word_count,
        answer_length_words=qrow.answer_length_words,
        question_answered=qrow.question_answered,
        feedback_summary=qrow.feedback_summary,
    )
    return SubmitAnswerResponse(answer_id=qrow.id, transcript=transcript, feedback=fb)


@router.post("", response_model=SessionCreateResponse)
def create_session(body: SessionCreateRequest, db: Session = Depends(get_db)):
    questions = generate_questions(body.interview_type, body.role)
    texts = [q.text for q in questions]
    sess = InterviewSession(
        interview_type=body.interview_type,
        role=body.role,
    )
    db.add(sess)
    db.flush()
    for i, text in enumerate(texts):
        db.add(
            QuestionAnswer(
                session_id=sess.id,
                question_order=i,
                question_text=text,
                transcript="",
                clarity_score=0,
                structure_score=0,
                filler_word_count=0,
                answer_length_words=0,
                question_answered=False,
                feedback_summary="",
            )
        )
    db.commit()
    db.refresh(sess)
    return SessionCreateResponse(
        session_id=sess.id,
        interview_type=sess.interview_type,
        role=sess.role,
        questions=questions,
    )


@router.post("/{session_id}/answers", response_model=SubmitAnswerResponse)
async def submit_answer(
    session_id: uuid.UUID,
    question_order: int = Form(..., ge=0, le=4),
    audio: UploadFile = File(...),
    db: Session = Depends(get_db),
):
    sess = db.get(InterviewSession, session_id)
    if not sess:
        raise HTTPException(status_code=404, detail="Session not found")

    qrow = (
        db.query(QuestionAnswer)
        .filter(
            QuestionAnswer.session_id == session_id,
            QuestionAnswer.question_order == question_order,
        )
        .one_or_none()
    )
    if not qrow:
        raise HTTPException(status_code=404, detail="Question not found for this session")

    raw = await audio.read()
    if not raw:
        raise HTTPException(status_code=400, detail="Empty audio file")

    filename = audio.filename or "recording.webm"
    transcript = transcribe_audio_bytes(raw, filename)
    return _persist_scored_answer(qrow, transcript, db)


@router.post("/{session_id}/answers-text", response_model=SubmitAnswerResponse)
def submit_answer_text(
    session_id: uuid.UUID,
    body: SubmitTextRequest,
    db: Session = Depends(get_db),
):
    sess = db.get(InterviewSession, session_id)
    if not sess:
        raise HTTPException(status_code=404, detail="Session not found")
    qrow = (
        db.query(QuestionAnswer)
        .filter(
            QuestionAnswer.session_id == session_id,
            QuestionAnswer.question_order == body.question_order,
        )
        .one_or_none()
    )
    if not qrow:
        raise HTTPException(status_code=404, detail="Question not found for this session")
    if not body.transcript.strip():
        raise HTTPException(status_code=400, detail="Transcript is empty")
    return _persist_scored_answer(qrow, body.transcript, db)


@router.get("/{session_id}/summary", response_model=SessionFullSummaryOut)
def session_full_summary(session_id: uuid.UUID, db: Session = Depends(get_db)):
    sess = db.get(InterviewSession, session_id)
    if not sess:
        raise HTTPException(status_code=404, detail="Session not found")
    answered = [a for a in sess.answers if a.transcript.strip()]
    if not answered:
        raise HTTPException(status_code=400, detail="No answered questions in this session")
    n = len(answered)
    avg_c = sum(a.clarity_score for a in answered) / n
    avg_s = sum(a.structure_score for a in answered) / n
    avg_f = sum(a.filler_word_count for a in answered) / n
    avg_w = sum(a.answer_length_words for a in answered) / n

    def pair_score(a: QuestionAnswer) -> int:
        return a.clarity_score + a.structure_score

    best = max(answered, key=pair_score)
    worst = min(answered, key=pair_score)
    items = [
        {
            "order": a.question_order,
            "question": a.question_text,
            "clarity": a.clarity_score,
            "structure": a.structure_score,
            "filler": a.filler_word_count,
            "words": a.answer_length_words,
            "answered": a.question_answered,
            "summary": a.feedback_summary,
        }
        for a in sorted(answered, key=lambda x: x.question_order)
    ]
    tips = generate_improvement_tips(sess.interview_type, sess.role, items)
    return SessionFullSummaryOut(
        session_id=sess.id,
        answered_count=n,
        avg_clarity=round(avg_c, 2),
        avg_structure=round(avg_s, 2),
        avg_filler_words=round(avg_f, 2),
        avg_length_words=round(avg_w, 2),
        best_question_order=best.question_order,
        worst_question_order=worst.question_order,
        best_question_text=best.question_text,
        worst_question_text=worst.question_text,
        improvement_tips=tips,
    )


@router.get("", response_model=list[SessionSummaryOut])
def list_sessions(db: Session = Depends(get_db)):
    sessions = db.query(InterviewSession).order_by(InterviewSession.created_at.desc()).all()
    out: list[SessionSummaryOut] = []
    for s in sessions:
        ans = [a for a in s.answers if a.transcript.strip()]
        if ans:
            avg_c = sum(a.clarity_score for a in ans) / len(ans)
            avg_s = sum(a.structure_score for a in ans) / len(ans)
            fillers = sum(a.filler_word_count for a in ans)
        else:
            avg_c = None
            avg_s = None
            fillers = 0
        completed = sum(1 for a in s.answers if a.transcript.strip())
        out.append(
            SessionSummaryOut(
                id=s.id,
                created_at=s.created_at,
                interview_type=s.interview_type,
                role=s.role,
                avg_clarity=round(avg_c, 2) if avg_c is not None else None,
                avg_structure=round(avg_s, 2) if avg_s is not None else None,
                total_filler_words=fillers,
                questions_completed=completed,
            )
        )
    return out


@router.get("/improvement-series", response_model=list[ImprovementPoint])
def improvement_series(db: Session = Depends(get_db)):
    sessions = (
        db.query(InterviewSession)
        .order_by(InterviewSession.created_at.asc())
        .all()
    )
    points: list[ImprovementPoint] = []
    for s in sessions:
        ans = [a for a in s.answers if a.transcript.strip()]
        if not ans:
            continue
        avg_c = sum(a.clarity_score for a in ans) / len(ans)
        avg_s = sum(a.structure_score for a in ans) / len(ans)
        points.append(
            ImprovementPoint(
                date=s.created_at,
                session_id=s.id,
                avg_clarity=round(avg_c, 2),
                avg_structure=round(avg_s, 2),
            )
        )
    return points


@router.get("/{session_id}", response_model=SessionDetailOut)
def get_session(session_id: uuid.UUID, db: Session = Depends(get_db)):
    sess = db.get(InterviewSession, session_id)
    if not sess:
        raise HTTPException(status_code=404, detail="Session not found")
    answers = sorted(sess.answers, key=lambda a: a.question_order)
    return SessionDetailOut(
        id=sess.id,
        created_at=sess.created_at,
        interview_type=sess.interview_type,
        role=sess.role,
        answers=[AnswerOut.model_validate(a) for a in answers],
    )
