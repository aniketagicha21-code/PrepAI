import httpx
from openai import OpenAI

from app.config import settings

# Avoid hung requests when OpenAI or the network stalls (production feels "stuck forever")
_TIMEOUT = httpx.Timeout(120.0, connect=30.0, read=110.0, write=30.0)

openai_client = OpenAI(
    api_key=settings.openai_api_key,
    timeout=_TIMEOUT,
    max_retries=2,
)
