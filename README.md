# PrepAI

Production-style mock interview coach: **GPT-4** generates role-specific questions, **Whisper** transcribes recordings, and the API returns **structured scores** (clarity, structure, filler words, length, on-topic) persisted in **PostgreSQL**. Frontend: **React + Vite + Tailwind**. Backend: **FastAPI**.

## Local development

### Prerequisites

- Node.js 20+
- Python 3.11+
- Docker (for local PostgreSQL) or any PostgreSQL 16 instance
- OpenAI API key with access to the models you configure (`gpt-4o` and `whisper-1` recommended)

### 1. Start PostgreSQL

```bash
cd /path/to/PrepAI
docker compose up -d
```

### 2. Backend

```bash
cd backend
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
cp .env.example .env
```

Edit `backend/.env` — set `OPENAI_API_KEY` and confirm `DATABASE_URL` (default matches `docker-compose.yml`).

```bash
uvicorn app.main:app --reload --host 127.0.0.1 --port 8000
```

### 3. Frontend

```bash
cd frontend
npm install
cp .env.example .env.local
```

Leave `VITE_API_URL` empty for local dev (Vite proxies `/api` to port 8000).

```bash
npm run dev
```

Open [http://localhost:5173](http://localhost:5173). Allow microphone access when recording.

## Environment variables

### Backend (`backend/.env`)

| Variable | Required | Description |
|----------|----------|-------------|
| `DATABASE_URL` | Yes | SQLAlchemy URL, e.g. `postgresql://user:pass@host:5432/dbname`. Render’s `postgres://` URLs are normalized automatically. |
| `OPENAI_API_KEY` | Yes | OpenAI secret key. |
| `OPENAI_MODEL` | No | Chat model for questions + scoring (default `gpt-4o`). |
| `WHISPER_MODEL` | No | Default `whisper-1`. |
| `CORS_ORIGINS` | No | Comma-separated allowed browser origins. Example: `http://localhost:5173,https://your-app.vercel.app` |

### Frontend (Vercel / `frontend/.env.local`)

| Variable | Required | Description |
|----------|----------|-------------|
| `VITE_API_URL` | For production | Full origin of the API **without** trailing slash, e.g. `https://prepai-api.onrender.com`. Empty string = same-origin or dev proxy. |

## Deploy

### Backend — Render

1. Create a **PostgreSQL** instance on Render; copy its **Internal Database URL** (or external if needed).
2. New **Web Service** → connect this repo; set **Root Directory** to `backend`.
3. **Build command:** `pip install -r requirements.txt`
4. **Start command:** `uvicorn app.main:app --host 0.0.0.0 --port $PORT`
5. Environment: `DATABASE_URL`, `OPENAI_API_KEY`, `CORS_ORIGINS` (your Vercel URL + optional preview URLs).

Optional: use the included `render.yaml` from the Render Blueprint flow.

### Frontend — Vercel

1. Import the repo; set **Root Directory** to `frontend`.
2. Framework preset: **Vite**.
3. Add environment variable `VITE_API_URL` = your Render service URL (no trailing slash).
4. Deploy.

## Push to GitHub (`github.com/aniketagicha21-codex/PrepAI`)

After you create an empty repo named **PrepAI** under that account:

```bash
cd /path/to/PrepAI
git add .
git commit -m "Initial PrepAI: FastAPI, React, PostgreSQL, OpenAI"
git branch -M main
git remote add origin https://github.com/aniketagicha21-codex/PrepAI.git
git push -u origin main
```

If `origin` already exists, use `git remote set-url origin https://github.com/aniketagicha21-codex/PrepAI.git` then push.

## API overview

- `POST /api/sessions` — body `{ "interview_type": "technical"|"behavioral"|"mixed", "role": "swe"|"ml_engineer"|"frontend"|"backend"|"full_stack" }` → creates session, five GPT questions, placeholder rows.
- `POST /api/sessions/{id}/answers` — `multipart/form-data`: `question_order` (0–4), `audio` file → Whisper + GPT scoring + DB update.
- `GET /api/sessions` — session summaries with averages and filler totals.
- `GET /api/sessions/improvement-series` — time series for charts.
- `GET /api/sessions/{id}` — full session with all answers.
- `GET /health` — health check for monitors.

## License

MIT — use freely in portfolios and interviews.
