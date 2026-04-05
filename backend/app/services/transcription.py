from io import BytesIO

from app.config import settings
from app.openai_client import openai_client


def transcribe_audio_bytes(data: bytes, filename: str) -> str:
    bio = BytesIO(data)
    bio.name = filename or "audio.webm"
    tr = openai_client.audio.transcriptions.create(
        model=settings.whisper_model,
        file=bio,
        response_format="text",
    )
    if isinstance(tr, str):
        return tr.strip()
    text = getattr(tr, "text", None)
    if isinstance(text, str):
        return text.strip()
    return str(tr).strip()
