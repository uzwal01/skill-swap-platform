# Skill Swap Platform

A full‑stack web app where people exchange skills by matching what they can teach with what they want to learn. Users can browse skills, find mutual matches, send swap requests, and manage their sessions.

## Features
- Authentication: register, login, protected routes, session hydration on reload
- Profile: edit name/title (bio), avatar URL, and skill chips (offered/wanted)
- Discovery: featured users and a Browse page with filters + numbered pagination
- Matching: mutual matches, dedicated paginated Matches page
- Requests: create, accept/reject/cancel/complete, with a paginated Requests page
- API: server‑side pagination envelopes; consistent types shared in the frontend
- DX: React + Vite + Zustand, Express + Mongoose; clear FE/BE separation

## Tech Stack
- Frontend: React (Vite), TypeScript, Zustand, React Router, Axios, Tailwind CSS
- Backend: Node.js (Express), TypeScript, Mongoose/MongoDB, JWT
- Build/Tooling: ESLint, TypeScript, Vite

## Repository Layout
- `frontend/` – React app (Vite)
- `backend/` – Express API (TypeScript)

## Quick Start (local)
Prerequisites: Node 20+, npm, MongoDB running locally (or Docker if you prefer).

1) Backend
- Copy `.env` (see sample below) and install dependencies
```
cd backend
npm ci
# create .env with values shown below
npm run dev
```
The API defaults to `http://localhost:5000/api/v1`.

2) Frontend
- Install dependencies and start Vite dev server
```
cd frontend
npm ci
# create .env.local with VITE_API_URL=http://localhost:5000/api/v1
npm run dev
```
Visit `http://localhost:5173`.

### Environment Variables
Backend (`backend/.env`):
- `PORT=5000`
- `MONGODB_URI=mongodb://localhost:27017/skill-swap`
- `JWT_SECRET=replace-with-strong-secret`
- `CORS_ORIGIN=http://localhost:5173`  # frontend origin for dev

Frontend API base URL
- Currently hard-coded in `frontend/src/lib/api.ts` as `http://localhost:5000/api/v1`.
- Optional: add `frontend/.env.local` with `VITE_API_URL=...` and update `api.ts` to use
  `import.meta.env.VITE_API_URL || 'http://localhost:5000/api/v1'` if you want it configurable.

## Application Overview
### Auth Flow
- On login/register, API returns `{ token, user }`. The token is stored in `localStorage`.
- Axios interceptor attaches `Authorization: Bearer <token>` for every request.
- On app mount, `authStore.fetchUser()` calls `GET /auth/me` to hydrate the user.
- `PrivateRoute` waits when a token exists but the user state isn’t hydrated yet, avoiding a premature redirect to login.

### Data Model (simplified)
User
```
{
  _id: string,
  name: string,
  email: string,
  bio?: string,
  avatarUrl?: string,
  skillsOffered: Array<{ category: string, skill: string }>,
  skillsWanted:  Array<{ category: string, skill: string }>,
  createdAt, updatedAt
}
```

Session
```
{
  _id: string,
  fromUser: User,           // populated
  toUser: User,             // populated
  fromUserSkill: string,
  toUserSkill: string,
  availability?: 'weekdays' | 'weekends' | 'any',
  durationMinutes?: 30 | 60 | 90 | 120,
  status: 'pending' | 'accepted' | 'rejected' | 'cancelled' | 'completed',
  message?: string,
  createdAt, updatedAt
}
```

### Pagination Envelope
Most list endpoints return this shape:
```
{
  data: T[],
  page: number,
  limit: number,
  total: number,
  totalPages: number,
  hasNext: boolean,
  hasPrev: boolean
}
```

The frontend defines `Paginated<T>` and uses numbered pagination across Browse, Matches, and Requests. The page is synced with the URL (e.g., `/browse?page=2`).

## API Reference (summary)
Base URL: `http://localhost:5000/api/v1`

Auth
- `POST /auth/register` – register user
- `POST /auth/login` – login, returns `{ token, user }`
- `GET  /auth/me` – current user (requires `Authorization`)

Users
- `GET  /users` – browse with filters `search`, `category`, `skill`, `page`, `limit`
  - `search` is case‑insensitive (name and skills)
  - `category` and `skill` are matched case‑insensitively via regex
- `GET  /users/featured` – a handful of recent users
- `GET  /users/me` – current user
- `PUT  /users/me` – update profile (name, bio, avatarUrl, skills)

Matches
- `GET  /matches` – mutual matches for the current user (supports `page`, `limit`)

Sessions (Swap Requests)
- `POST /sessions` – create a request `{ toUser, fromUserSkill, toUserSkill, availability?, durationMinutes?, message? }`
- `GET  /sessions/my` – list my sessions (supports `page`, `limit`, `type`=incoming|outgoing, `status`)
- `PUT  /sessions/:id/status` – update status: `accepted | rejected | cancelled | completed`

## Frontend Structure
Routes
- `/` Home – hero + featured users + search handoff to Browse
- `/login`, `/register` – auth forms
- `/browse` – filters (search/category/skill) + numbered pagination
- `/profile` – profile summary, skills, matches tab, swap requests tab
- `/matches` – full paginated matches list
- `/requests` – full paginated requests list with type/status filters

State
- `authStore`: user, token management (login/register/fetchUser/logout)
- `toastStore`: lightweight success/error toasts

Notable Components
- `Navbar`, `UserCard`, `FiltersBar` (Browse filters), `SessionRequestModel` (request modal), `ToastContainer`

## Matching Logic (high level)
- Server gets all users except current
- A match exists if:
  - They can teach a skill I want to learn, and
  - They want to learn a skill I can teach
- Result is paginated server‑side before returning to the client

## Development Notes
- Case‑insensitive filters: `search`, `category`, and `skill` use regex with the `i` flag
- Browse and Home filter out the logged‑in user from lists
- Profile edit uses simple skill chips with remove buttons
- Requests tab shows in‑place actions; the full page (`/requests`) offers pagination and filters

## Deployment (brief)
- Recommended: containerized deploy with Docker and docker‑compose
  - Backend (Node/Express) + MongoDB service
  - Frontend built by Vite and served via Nginx
- Set `CORS_ORIGIN` on the API and `VITE_API_URL` at build time for the frontend
- Optionally place a reverse proxy (Caddy/Traefik) in front for TLS

See `DEPLOYMENT.md` (to be added) for full Dockerfiles, Nginx config, and compose examples.

## Roadmap / Nice‑to‑Have
- Messages tab (real‑time chat)
- Notifications (badges/toasts), email verification, password reset
- Avatar upload, duplicate/empty skill validation, input trimming
- 401 handling via store logout (avoid hard reload)
- DB indexes for search fields; optimize matching with aggregation
- Seed script + demo data
- CI: type‑check, lint, and tests

## License
Private/intern project.
