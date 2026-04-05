import json

from openai import OpenAI

from app.config import settings
from app.schemas import InterviewType, QuestionItem, Role

client = OpenAI(api_key=settings.openai_api_key)

ROLE_LABELS: dict[Role, str] = {
    "swe": "Software Engineer (general algorithms, systems, coding practices)",
    "ml_engineer": "Machine Learning Engineer (ML systems, modeling, data, deployment)",
    "frontend": "Frontend Engineer (JavaScript/TypeScript, React, performance, UX engineering)",
    "backend": "Backend Engineer (APIs, databases, scalability, distributed systems)",
    "full_stack": "Full Stack Engineer (end-to-end product, frontend and backend tradeoffs)",
}

TYPE_LABELS: dict[InterviewType, str] = {
    "technical": "technical interview (problem solving, depth of knowledge, tradeoffs)",
    "behavioral": "behavioral interview (STAR-style, leadership principles, past experience)",
    "mixed": "mix of technical and behavioral prompts appropriate to the role",
}


def generate_questions(interview_type: InterviewType, role: Role) -> list[QuestionItem]:
    system = (
        "You generate exactly five distinct interview questions as JSON only. "
        "No markdown, no prose outside JSON. "
        "Questions must be specific to the role and interview style given — not generic 'tell me about yourself' unless mixed/behavioral calls for it. "
        "For technical, include at least one that requires structured reasoning (complexity, design, or debugging mindset) where appropriate for the role."
    )
    user = (
        f"Interview style: {TYPE_LABELS[interview_type]}\n"
        f"Target role: {ROLE_LABELS[role]}\n"
        'Return JSON: {"questions": ["q1","q2","q3","q4","q5"]} '
        "Each string is one complete question ending with ?"
    )
    completion = client.chat.completions.create(
        model=settings.openai_model,
        response_format={"type": "json_object"},
        messages=[
            {"role": "system", "content": system},
            {"role": "user", "content": user},
        ],
        temperature=0.85,
    )
    raw = completion.choices[0].message.content or "{}"
    data = json.loads(raw)
    qs = data.get("questions")
    if not isinstance(qs, list) or len(qs) != 5:
        raise ValueError("Model returned invalid questions payload")
    cleaned: list[str] = []
    for q in qs:
        if not isinstance(q, str) or not q.strip():
            raise ValueError("Invalid question entry")
        t = q.strip()
        if not t.endswith("?"):
            t += "?"
        cleaned.append(t)
    return [QuestionItem(order=i, text=cleaned[i]) for i in range(5)]


def score_answer(question_text: str, transcript: str, filler_count: int, length_words: int) -> dict:
    system = (
        "You are an expert FAANG interview coach. Evaluate the spoken answer transcript against the question. "
        "Return ONLY valid JSON matching this shape:\n"
        '{"clarity_score": <1-10 int>, "structure_score": <1-10 int>, '
        '"question_answered": <true/false>, '
        '"feedback_summary": "<2-4 sentences: strengths, gaps, one concrete improvement>"}\n'
        "clarity: how understandable and precise the answer is. "
        "structure: logical flow, STAR or technical structure where appropriate. "
        "question_answered: true if the response materially addresses what was asked. "
        "Do NOT include filler_word_count or answer_length in JSON; they are measured separately."
    )
    user = (
        f"Question:\n{question_text}\n\n"
        f"Transcript:\n{transcript}\n\n"
        f"(For your context only — measured programmatically: filler_word_count={filler_count}, answer_length_words={length_words})"
    )
    completion = client.chat.completions.create(
        model=settings.openai_model,
        response_format={"type": "json_object"},
        messages=[
            {"role": "system", "content": system},
            {"role": "user", "content": user},
        ],
        temperature=0.35,
    )
    raw = completion.choices[0].message.content or "{}"
    data = json.loads(raw)
    for key in ("clarity_score", "structure_score", "question_answered", "feedback_summary"):
        if key not in data:
            raise ValueError(f"Missing key in feedback: {key}")
    clarity = int(data["clarity_score"])
    structure = int(data["structure_score"])
    clarity = max(1, min(10, clarity))
    structure = max(1, min(10, structure))
    summary = str(data["feedback_summary"]).strip()
    answered = bool(data["question_answered"])
    return {
        "clarity_score": clarity,
        "structure_score": structure,
        "question_answered": answered,
        "feedback_summary": summary,
    }
