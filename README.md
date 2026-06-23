# Smart AI Resume Analyzer — MERN Stack

Full MERN port of the original Streamlit/Python project.

## Stack

- **MongoDB** — resumes, analyses, feedback, admin
- **Express** — REST API
- **React + Vite** — SPA UI
- **Node.js** — runtime
- **Google Gemini** — AI resume analysis

## Quick start

### Prerequisites

- Node.js 18+
- MongoDB (local or Atlas)

### 1. Install

```bash
cd mern-stack
npm run install:all
```

### 2. Configure server

```bash
cp server/.env.example server/.env
```

Edit `server/.env`:

- `MONGODB_URI` — e.g. `mongodb://127.0.0.1:27017/resume_analyzer`
- `JWT_SECRET` — random string
- `GOOGLE_API_KEY` — from [Google AI Studio](https://aistudio.google.com/app/apikey) (required for AI Analyzer)

### 3. Seed admin user

```bash
npm run seed
```

Default: `admin@example.com` / `admin123`

### 4. Run (development)

Terminal 1 — MongoDB (if not running):

```bash
docker compose up mongo -d
```

Terminal 2:

```bash
npm run dev
```

- Frontend: http://localhost:5173  
- API: http://localhost:5000/api/health  

### Production

```bash
npm run build
cd server && npm start
```

Serve `client/dist` via Express (static) when `NODE_ENV=production`.

## Features

| Page | Description |
|------|-------------|
| Resume Analyzer | Standard ATS + keyword analysis; AI analysis with Gemini |
| Resume Builder | DOCX download (4 templates) |
| Dashboard | Stats charts; admin export & logs |
| Job Search | Multi-portal links + market insights |
| Feedback | Submit + aggregate stats |

## API routes

- `POST /api/analyze/standard` — multipart resume + category/role
- `POST /api/ai/analyze` — multipart resume + optional job description
- `POST /api/builder/generate` — JSON resume data → DOCX
- `GET /api/dashboard/stats` — public metrics
- `GET /api/jobs/search` — portal URLs
- `POST /api/feedback` — user feedback

## Original project

The Python/Streamlit version remains in `Smart-AI-Resume-Analyzer-main/`.
