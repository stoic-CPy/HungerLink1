# HungerLink — Full-Stack Food Donation Platform

Connects restaurant/hotel **Donors** with **NGOs** so surplus food gets
collected instead of wasted. This repo merges the three previously
disconnected frontend fragments (`auth-react`, `donor-dashboard-react`,
`ngo_react`) into one app and adds the backend + database that didn't
exist before.

## Architecture

```
React Frontend (Vite)
        |
        v
  REST API (Express, JWT auth)
        |
        v
  PostgreSQL (users, donor_profiles, ngo_profiles, donations)
```

## What actually exists vs. what I built

The three uploaded zips were **UI-only** — React components with no
`package.json`, no backend, no database, and no real API calls (login,
register, and donations all just wrote to component state or
`localStorage`, with `TODO(Flask API)` comments marking where a real
backend was meant to go).

I built:
- A real Express + PostgreSQL backend (`/backend`) — nothing existed
  here before, so this isn't "modified," it's new.
- A merged Vite app (`/frontend`) combining all three UI fragments
  into one router, with every stub replaced by a real `fetch` call to
  the new backend.

The visual design, copy, and layout from the original files are
preserved as-is — only the data layer changed.

## Project structure

```
hungerlink/
  backend/
    server.js              Express app entry point
    db/schema.sql           Table definitions (users, profiles, donations)
    db/migrate.js           Applies schema.sql (idempotent, safe to rerun)
    db/pool.js               PostgreSQL connection pool
    middleware/auth.js       JWT verification + role guard
    routes/auth.js           register / login / me
    routes/donor.js          donor profile + donation CRUD
    routes/ngo.js             ngo profile + browse/accept/complete donations
    .env.example
  frontend/
    src/
      App.jsx                 top-level router
      api/client.js           fetch wrapper (adds JWT, handles errors)
      context/AuthContext.jsx  login/register/logout/session
      context/DonationsContext.jsx  donor's donations, API-backed
      pages/auth/               Welcome, Login, Register
      pages/donor/               Dashboard, AddFood, MyDonations, TotalDonations,
                                   Profile, Settings, HelpSupport, Logout
      pages/ngo/                 NgoDashboard (accept/complete donations), NgoAdminProfile
      components/                DonorLayout, ProtectedRoute
      styles/                    original CSS, unchanged
    vercel.json                SPA rewrite rules
    .env.example
```

## Database

`donations.status` moves through: `Pending` → `Accepted` (by an NGO)
→ `Completed`. A donor can delete their own donation at any point
(matches the original UI's "click a donation to remove it" behavior).

Run once against a fresh database:

```bash
cd backend
cp .env.example .env       # fill in DATABASE_URL and JWT_SECRET
npm install
npm run migrate
```

`npm run migrate` just executes `db/schema.sql`, which uses
`CREATE TABLE IF NOT EXISTS` — safe to rerun, never destructive.

## Running locally

```bash
# Terminal 1 - backend
cd backend
cp .env.example .env   # set DATABASE_URL (a local or hosted Postgres) and JWT_SECRET
npm install
npm run migrate
npm run dev             # http://localhost:4000

# Terminal 2 - frontend
cd frontend
cp .env.example .env    # VITE_API_URL=http://localhost:4000/api (already the default)
npm install
npm run dev              # http://localhost:5173
```

Register a Donor account and an NGO account (two different browser
sessions or incognito windows are easiest for testing both sides),
add a donation as the Donor, then accept it as the NGO — the status
updates in both dashboards because both are reading the same
database through the API.

## Deploying

I can't push a live deployment from this environment (no network
access in this sandbox, no hosting credentials), so here's the exact
path to take it live yourself:

**Backend** — Express + PostgreSQL needs a platform that runs a
persistent Node process (not a good fit for Vercel's serverless
functions without rework). Render, Railway, or Fly.io all work with
zero code changes:
1. Push this repo to GitHub.
2. Create a new Postgres instance on the platform (or use Neon/Supabase separately).
3. Create a new Web Service pointing at `/backend`, build command
   `npm install`, start command `npm start`.
4. Set env vars: `DATABASE_URL`, `JWT_SECRET` (generate with
   `node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"`),
   `CORS_ORIGIN` (your frontend's URL once deployed).
5. Run `npm run migrate` once (most platforms let you run a one-off
   command, or run it locally pointed at the production `DATABASE_URL`).

**Frontend** — Vercel is a good fit as-is:
1. Import the repo into Vercel, set the project root to `/frontend`.
2. It will pick up `vercel.json` automatically (build command
   `npm run build`, output `dist`, SPA rewrites so `/donor/...` and
   `/ngo/...` don't 404 on refresh).
3. Set env var `VITE_API_URL` to your deployed backend's URL + `/api`
   (e.g. `https://hungerlink-api.onrender.com/api`).
4. Once the backend is live, update its `CORS_ORIGIN` env var to your
   Vercel URL and redeploy the backend.

## Environment variables

**backend/.env**
- `DATABASE_URL` — PostgreSQL connection string
- `JWT_SECRET` — random secret for signing session tokens
- `JWT_EXPIRES_IN` — token lifetime (default `7d`)
- `PORT` — API port (default `4000`)
- `CORS_ORIGIN` — comma-separated list of allowed frontend origins

**frontend/.env**
- `VITE_API_URL` — base URL of the deployed API, e.g.
  `https://your-backend.onrender.com/api`

No secret values are committed anywhere in this repo — only
`.env.example` files with variable names.

## Security notes

- Passwords are hashed with bcrypt (10 rounds), never stored in plaintext.
- Sessions are stateless JWTs, verified on every protected request.
- Role checks happen server-side (`requireRole`) on every donor/NGO
  route — the frontend's `ProtectedRoute` is a UX convenience, not the
  actual security boundary.
- CORS is restricted to the configured origin(s), not wide open.
- Errors returned to the client are generic messages; stack traces and
  DB internals are logged server-side only.

## What I verified in this session

- All backend JS files pass `node --check` (syntax-valid).
- All 22 frontend JS/JSX files pass a TypeScript-compiler JSX/syntax
  parse with zero errors.
- I did **not** run `npm install` or `npm run build` (no network
  access in this sandbox) and did **not** deploy anywhere, so I can't
  claim the full install → build → run pipeline has been exercised
  end-to-end. Please run the "Running locally" steps above as your
  first real test — if anything breaks there, send me the error and
  I'll fix it directly in this code.

## Status

⚠️ **Code-complete, not deployed.** Backend and frontend are fully
built, wired to each other, and passed static syntax checks. Live
deployment and a real `npm install`/`npm run build`/runtime test are
still needed and require your own hosting accounts (Vercel + a
Postgres-hosting platform).
