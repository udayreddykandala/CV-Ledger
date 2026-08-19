# CV Ledger

A private job-application log. One record per application, tying together the
job description, the link to the posting, and the exact CV file you sent — so
when an unknown number calls you know what they read.

- **Frontend** — React 18 + Vite + React Router, styled on the Industry design system.
- **Backend** — FastAPI, SQLAlchemy 2, JWT auth, multipart uploads.
- **Database** — PostgreSQL.

## Screens

| Route | What it does |
| --- | --- |
| `/login`, `/signup` | JWT auth; the token lives in localStorage |
| `/applications` | Stats, a fourteen-day calendar strip, search, status filters, the record table |
| `/applications/new` | Log a record: role, company, link, pasted JD, CV upload or reuse — ends on the confetti + check animation |
| `/applications/:id` | Full record: JD, keyword diff against the CV sent, status, timeline, notes |
| `/cvs` | CV library: every version, its covered terms, and which companies got it |
| `/profile` | Profile and target roles |

Two features worth knowing about:

- **Keyword diff** (`frontend/src/components/KeywordDiff.jsx`) — pulls the significant terms out of the pasted JD and compares them against the `terms` field on the CV version that was sent, giving a coverage percentage plus matched/missing lists. Runs entirely client-side.
- **Calendar strip** (`frontend/src/components/CalendarStrip.jsx`) — fourteen days from today, filled from real timeline events plus chase reminders derived from `applied_on + remind_after_days` on records with no reply.

## Run locally

Backend:

```bash
cd backend
createdb cvledger
python -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt
cp .env.example .env          # set JWT_SECRET and DATABASE_URL
uvicorn app.main:app --reload # http://localhost:8000/docs
```

Frontend:

```bash
cd frontend
npm install
cp .env.example .env          # VITE_API_URL=http://localhost:8000
npm run dev                   # http://localhost:5173
```

## Deploy

Vercel builds static sites, so the React app goes there and the Python API goes
somewhere that runs a container. Three steps:

**1. Database — Neon or Supabase (free)**

Create a Postgres database and copy the connection string. Convert the scheme to
the driver this project uses:

```
postgresql://user:pass@host/db   →   postgresql+psycopg://user:pass@host/db
```

**2. Backend — Render**

`render.yaml` at the repo root is a blueprint: in Render, *New → Blueprint*,
point it at this repo, and it provisions the web service, a Postgres instance and
a 1 GB disk for uploads. Set `ALLOWED_ORIGINS` to your Vercel URL once you have
it. If you prefer your own Postgres from step 1, replace the `fromDatabase`
block with `DATABASE_URL` as a plain value.

Fly.io or Railway work the same way from `backend/Dockerfile`.

**3. Frontend — Vercel**

*New Project → import this repo*, then:

- Root directory: `frontend`
- Framework preset: Vite (auto-detected)
- Environment variable: `VITE_API_URL` = your Render URL, e.g. `https://cv-ledger-api.onrender.com`

Redeploy after setting `ALLOWED_ORIGINS` on the backend, or the browser will
block the API calls as cross-origin.

## Notes

- Tables are created on startup via `Base.metadata.create_all`. Switch to Alembic before you have data you care about (`alembic` is already in requirements).
- Uploads are written to `UPLOAD_DIR/<user_id>/<uuid>.<ext>` on local disk. On Render's free tier that disk survives restarts but not a service delete — move to S3 or R2 for anything long-lived by swapping `stored.write_bytes` in `backend/app/routers/cvs.py`.
- Everything is scoped to the authenticated user. There is no employer or admin view by design.
- Passwords are bcrypt via passlib; tokens are HS256 JWTs valid 12 hours.
