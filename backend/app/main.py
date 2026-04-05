from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.config import get_cors_origins
from app.database import Base, engine
from app.routers import sessions


@asynccontextmanager
async def lifespan(app: FastAPI):
    Base.metadata.create_all(bind=engine)
    yield


app = FastAPI(title="PrepAI API", version="1.0.0", lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=get_cors_origins(),
    # Any *.vercel.app (production + preview) without listing each URL in env
    allow_origin_regex=r"https://.*\.vercel\.app$",
    # Matches default fetch() (no credentials); avoids CORS edge cases with credentials
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(sessions.router)


@app.get("/health")
def health():
    return {"status": "ok"}
