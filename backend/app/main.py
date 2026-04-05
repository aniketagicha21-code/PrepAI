import logging
from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from starlette.middleware.base import BaseHTTPMiddleware
from starlette.requests import Request
from starlette.responses import JSONResponse

from app.database import Base, engine
from app.routers import sessions

logger = logging.getLogger("uvicorn.error")


def _cors_hdrs(origin: str | None) -> dict[str, str]:
    allow = origin or "*"
    return {
        "access-control-allow-origin": allow,
        "access-control-allow-methods": "*",
        "access-control-allow-headers": "*",
    }


class UnhandledErrorCORSMiddleware(BaseHTTPMiddleware):
    """500s from unhandled exceptions skip normal CORS — browsers show 'Load failed'. Add CORS here."""

    async def dispatch(self, request: Request, call_next):
        try:
            return await call_next(request)
        except Exception:
            logger.exception("Unhandled API error")
            return JSONResponse(
                status_code=500,
                content={
                    "detail": "Server error — verify DATABASE_URL and OPENAI_API_KEY on Render, then check logs.",
                },
                headers=_cors_hdrs(request.headers.get("origin")),
            )


@asynccontextmanager
async def lifespan(app: FastAPI):
    Base.metadata.create_all(bind=engine)
    yield


app = FastAPI(title="PrepAI API", version="1.0.0", lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.add_middleware(UnhandledErrorCORSMiddleware)

app.include_router(sessions.router)


@app.get("/health")
def health():
    return {"status": "ok"}
