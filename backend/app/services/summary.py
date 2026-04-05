import json

from app.config import settings
from app.openai_client import openai_client


def generate_improvement_tips(
    interview_type: str,
    role: str,
    items: list[dict],
) -> str:
    lines = []
    for it in items:
        lines.append(
            f"Q{it['order']+1}: {it['question']}\n"
            f"Scores: clarity {it['clarity']}/10, structure {it['structure']}/10, "
            f"filler words {it['filler']}, length {it['words']} words, on-topic: {it['answered']}\n"
            f"Coach note: {it['summary']}\n"
        )
    blob = "\n".join(lines)
    system = (
        "You are a senior FAANG interview coach. Given a full mock interview session, write concise improvement guidance. "
        "Return JSON only: {\"tips\": \"<3-5 short bullet lines separated by newline characters, actionable>\"} "
        "Focus on patterns across answers, not repeating per-question notes."
    )
    user = f"Interview type: {interview_type}\nRole focus: {role}\n\nSession answers:\n{blob}"
    completion = openai_client.chat.completions.create(
        model=settings.openai_model,
        response_format={"type": "json_object"},
        messages=[
            {"role": "system", "content": system},
            {"role": "user", "content": user},
        ],
        temperature=0.4,
    )
    raw = completion.choices[0].message.content or "{}"
    data = json.loads(raw)
    tips = data.get("tips", "").strip()
    if not tips:
        return "Keep practicing with STAR for behavioral prompts and clarify assumptions early for technical ones."
    return tips
