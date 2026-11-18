# CareerAI

CareerAI analyzes a resume, identifies skills and experience, and compares the extracted skills with a set of career roles. It provides resume analysis, skill-gap results, career recommendations, and an analysis history.

## Features

- Create an account and sign in using an HTTP-only session cookie.
- Upload PDF and DOCX resumes (up to 5 MB).
- Extract skills, contact details, education, experience, projects, and certifications from resume text.
- Compare extracted skills against career role requirements and view skill gaps.
- Review a dashboard and previous resume analyses.

The role-fit score is a heuristic based on matched, partially matched, and missing skills. It is not a hiring probability. Semantic skill matching uses the `all-MiniLM-L6-v2` sentence-transformer model when it is available; if the model cannot be loaded, the analyzer falls back to exact skill matching.

## Tech stack

- **Frontend:** React, Vite, Tailwind CSS, React Router
- **Backend:** Python, FastAPI, SQLAlchemy, SQLite
- **Resume processing:** PyMuPDF, python-docx, sentence-transformers

## Requirements

- Python 3.10 or newer
- Node.js 18 or newer (npm is included with Node.js)

## Run locally on Windows

Open two terminals from the project directory.

### 1. Start the backend

```powershell
cd backend
py -m venv .venv
.\.venv\Scripts\Activate.ps1
python -m pip install --upgrade pip
pip install -r requirements.txt
$env:JWT_SECRET = "replace-this-with-a-long-random-secret"
uvicorn app.main:app --reload --host 127.0.0.1 --port 8000
```

If PowerShell prevents environment activation, allow scripts for the current terminal with:

```powershell
Set-ExecutionPolicy -Scope Process -ExecutionPolicy Bypass
.\.venv\Scripts\Activate.ps1
```

### 2. Start the frontend

In a second terminal:

```powershell
cd frontend
npm install
npm run dev
```

Open the frontend URL printed by Vite, usually <http://localhost:5173/>. The Vite development server proxies `/api` requests to the backend at `http://localhost:8000`.

The backend API is at <http://localhost:8000/> and the interactive API documentation is at <http://localhost:8000/docs>.

Press **Ctrl+C** in each terminal to stop its server.

## Run locally on macOS or Linux

In one terminal:

```bash
cd backend
python3 -m venv .venv
source .venv/bin/activate
python -m pip install --upgrade pip
pip install -r requirements.txt
export JWT_SECRET="replace-this-with-a-long-random-secret"
uvicorn app.main:app --reload --host 127.0.0.1 --port 8000
```

In a second terminal:

```bash
cd frontend
npm install
npm run dev
```

Open <http://localhost:5173/>.

## API overview

All application endpoints are under `/api`.

| Method | Endpoint | Purpose |
| --- | --- | --- |
| `POST` | `/auth/signup` | Create an account |
| `POST` | `/auth/login` | Sign in |
| `POST` | `/auth/logout` | Sign out |
| `GET` | `/auth/me` | Get the current user |
| `POST` | `/resumes/upload` | Upload and analyze a resume |
| `GET` | `/resumes/history` | List the current user's analyses |
| `GET` | `/resumes/{id}` | Get an analysis |
| `DELETE` | `/resumes/{id}` | Delete an analysis |
| `GET` | `/analysis/{id}/career-matches` | Get role matches |
| `GET` | `/analysis/{id}/skill-gaps?role={role}` | Get gaps for a role |
| `GET` | `/careers` | List supported roles |
| `GET` | `/dashboard/stats` | Get dashboard statistics |

Interactive request and response schemas are available at `/docs` while the backend is running.

## Data and security notes

- The SQLite database is created as `backend/careerai.db` when the backend starts.
- Set a unique, sufficiently long `JWT_SECRET` for each deployment. Do not commit real secrets or production database files to GitHub.
- The default development secret is not suitable for deployment. Configure secrets through your hosting provider's environment settings before deploying.
- Resume files are processed in memory; extracted analysis data is stored in the local SQLite database.

## Project structure

```text
backend/
  app/
    main.py       # FastAPI application
    routes.py     # Authentication, resume, and analysis endpoints
    db.py         # SQLite models and database session
    nlp.py        # Resume text extraction and skill matching
    roles.py      # Role and skill definitions
    security.py   # Password hashing and session token handling
  requirements.txt
frontend/
  src/
    pages/        # Authentication, dashboard, upload, and analysis pages
    components/   # Shared UI and layout
    api.js        # Axios API client
    App.jsx       # Application routes
```

## Build the frontend

```bash
cd frontend
npm install
npm run build
```

The production frontend files are generated in `frontend/dist/`.
