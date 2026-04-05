from io import BytesIO

from openai import OpenAI

from app.config import settings

client = OpenAI(api_key=settings.openai_api_key)


def transcribe_audio_bytes(data: bytes, filename: str) -> str:
    bio = BytesIO(data)
    bio.name = filename or "audio.webm"
    tr = client.audio.transcriptions.create(
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
