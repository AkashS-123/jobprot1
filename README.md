# Fieldnote — Role-Based Job Portal

A job portal built with **React + TypeScript + Tailwind CSS** on the frontend and **json-server** as a mock REST API. Supports two roles — **Candidate** and **HR** — with strict role-based access control on the client.

## Features

**Candidate**
- Search jobs by keyword, filter by location, job type, and minimum salary, with pagination
- View full job details
- Apply to jobs with a short note (cover letter)
- Save / unsave jobs for later
- Track application status (Applied → Under review → Shortlisted → Interview → Offered/Rejected)
- Manage profile (headline, skills, bio, resume link, experience)

**HR**
- Create, edit, close/reopen, and delete job postings
- View applicants per job, filter by status and by candidate skill
- Update application status per candidate
- View full candidate profiles
- Recruitment pipeline board — all applicants across all postings, grouped by status

**Access control**
- Every route is wrapped in `ProtectedRoute`, which checks the logged-in user's role and redirects if it doesn't match. Candidates cannot reach `/hr/*` routes and HR users cannot reach candidate-only routes (apply, save, profile, etc). The job details page is shared, but the "Apply" flow is hidden for HR viewers.

## Project structure

```
src/
  api/          Axios calls to json-server (jobs, applications, savedJobs, users)
  components/    Navbar, JobCard, Pagination, StatusBadge, ProtectedRoute
  context/       AuthContext (mock auth, session persisted in localStorage)
  pages/
    candidate/   JobListings, JobDetails, Applications, SavedJobs, Profile
    hr/          Dashboard, JobForm, Applicants, CandidateProfile, Pipeline
  types/         Shared TypeScript types
db.json          json-server mock database (users, jobs, applications, savedJobs)
```

## Getting started

```bash
npm install

# Run the mock API and the frontend together
npm run dev:all
```

This starts:
- json-server on **http://localhost:4000** (reads/writes `db.json`)
- Vite dev server on **http://localhost:5173**

Or run them separately:

```bash
npm run server   # json-server on port 4000
npm run dev      # Vite dev server on port 5173
```

## Demo accounts

| Role      | Email                        | Password    |
|-----------|-------------------------------|-------------|
| Candidate | ava.candidate@example.com     | password123 |
| Candidate | diego.dev@example.com         | password123 |
| HR        | rhea.hr@example.com           | password123 |
| HR        | marcus.hr@example.com         | password123 |

You can also register a new account and choose a role on the sign-up page.

## Notes on the mock API

- Authentication is fully mocked: `db.json` stores plaintext passwords for demo purposes only — this is **not** how you'd handle credentials in production (no server-side hashing, no real sessions).
- `json-server` supports the query params used throughout the app (`_page`, `_limit`, `_sort`, `q`, `*_like`, `*_gte`), which power search, filtering, and pagination without any custom backend code.
- Because there's no real backend, business rules like "only the HR user who posted a job can edit it" or "a candidate can only see their own applications" are enforced in the frontend query logic and route guards, not by a server. For a production system, these checks would need to be enforced server-side as well.

## Build for production

```bash
npm run build
npm run preview
```

## Deploying

This app has two moving pieces: a **static frontend** (Vite build output) and a **json-server API** (a Node process that needs to stay running, since it reads/writes `db.json`). They need to be deployed separately.

### 1. Deploy the API (json-server) — e.g. on Render

1. Push this repo to GitHub.
2. On [render.com](https://render.com), click **New → Web Service**, connect the repo. Render will detect `render.yaml` automatically (or set manually):
   - Build command: `npm install`
   - Start command: `npx json-server --watch db.json --host 0.0.0.0 --port $PORT`
3. Deploy. Note the resulting URL, e.g. `https://job-portal-api.onrender.com`.

Any Node host works the same way (Railway, Fly.io, Cyclic, a VPS, etc.) — the start command is the only thing that matters.

**Important caveat:** `json-server` writes to `db.json` on disk. On most free/ephemeral hosts (Render's free tier included), the filesystem resets on redeploy or after periods of inactivity, so data written at runtime (new applications, saved jobs, etc.) won't persist long-term. This is fine for a demo; for a real deployment, swap `json-server` for a real backend with a persistent database (Postgres, etc.) — the `src/api/*.ts` files are written as a thin, swappable data layer for exactly that reason.

### 2. Deploy the frontend — e.g. on Vercel or Netlify

1. Push the repo to GitHub (same repo is fine).
2. On [vercel.com](https://vercel.com) (or Netlify), import the project.
   - Build command: `npm run build`
   - Output directory: `dist`
3. Set an environment variable in the hosting dashboard:
   - `VITE_API_URL` = the API URL from step 1 (e.g. `https://job-portal-api.onrender.com`)
4. Deploy.

`vercel.json` and `public/_redirects` are already included so client-side routes (like `/jobs/j1`) don't 404 on refresh, on Vercel and Netlify respectively.

### 3. Verify

Visit your frontend URL, log in with a demo account, and confirm jobs load — that confirms the frontend is successfully reaching the deployed API. Open the browser network tab if something looks off; a blank job list usually means `VITE_API_URL` is missing or pointing at the wrong host, or the API is asleep (free-tier hosts often spin down and take ~30s to wake on the first request).
