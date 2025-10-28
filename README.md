# Skill Swap Platform

A full-stack web application where users can **exchange skills**, teaching what they know and learning what they want.
Users can browse other's skills, find mutual matches, send swap requests, and manage sessions.

## Features
| Category           | Description                                             |
| ------------------ | ------------------------------------------------------- |
| **Authentication** | Register, login, JWT auth, protected routes             |
| **Profiles**       | Edit name, bio, avatar, and skills (offered/wanted)     |
| **Discovery**      | Browse users with filters and pagination                |
| **Matching**       | Find mutual matches automatically                       |
| **Requests**       | Send, accept, reject, cancel, or complete swap sessions |
| **Persistence**    | Session hydration and token storage                     |
| **Tech Stack**     | React + Zustand + Express + MongoDB + TypeScript        |


## Tech Stack
| Layer        | Technologies                                                         |
| ------------ | -------------------------------------------------------------------- |
| **Frontend** | React (Vite), TypeScript, Zustand, React Router, Axios, Tailwind CSS |
| **Backend**  | Node.js (Express), TypeScript, Mongoose, JWT                         |
| **Tooling**  | ESLint, TypeScript, Vite                                             |
| **Database** | MongoDB                                                              |


## Repository Layout
- `frontend/` – React app (Vite)
- `backend/` – Express API (TypeScript)
- `README.md`

## Quick Start (local)

1) Backend Setup

```bash
cd backend
npm install
# create .env with values shown below
npm run dev
```
Default API URL: `http://localhost:5000/api/v1`.


- **Backend (`backend/.env`):**

```ini
PORT=5000
MONGODB_URI=mongodb://localhost:27017/skill-swap
JWT_SECRET=replace-with-strong-secret
CORS_ORIGIN=http://localhost:5173     # frontend origin for dev

```


2) Frontend

```bash
cd frontend
npm install
# create .env.local (or edit src/lib/api.ts)
npm run dev
```
Default frontend: `http://localhost:5173`.

- **Frontend API base URL:**
- Hard-coded in `frontend/src/lib/api.ts` as `http://localhost:5000/api/v1`.



## Application Overview
### Auth Flow
- User logs in or registers
- API/backend returns `{ token, user }`.
- The token is stored in `localStorage`.
- Axios interceptor attaches `Authorization: Bearer <token>` for every request.
- On app mount/reload, `authStore.fetchUser()` calls `GET /auth/me` to hydrate/restore the user.
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

## API Reference

### Backend
Base URL: `http://localhost:5000/api/v1`

#### Auth Endpoints

| Method | Endpoint         | Description                |
| ------ | ---------------- | -------------------------- |
| `POST` | `/auth/register` | Register a new user        |
| `POST` | `/auth/login`    | Login and get `token`        |
| `GET`  | `/auth/me`       | Get current logged-in user (requires `Authorization`) |


#### User Endpoints

| Method | Endpoint          | Description                                                                |
| ------ | ----------------- | -------------------------------------------------------------------------- |
| `GET`  | `/users`          | Browse users with filters (`search`, `category`, `skill`, `page`, `limit`) |
- `search` is case‑insensitive (name and skills)
- `category` and `skill` are matched case‑insensitively via regex
| `GET`  | `/users/featured` | Get recent/featured users                                                  |
| `GET`  | `/users/me`       | Get current user profile                                                   |
| `PUT`  | `/users/me`       | Update profile (name, bio, avatar, skills)                                 |


#### Match Endpoints

| Method | Endpoint   | Description                                     |
| ------ | ---------- | ----------------------------------------------- |
| `GET`  | `/matches` | Get mutual matches for current user (supports `page`, `limit`) |


#### Session (Swap Requests)

| Method | Endpoint               | Description                                  |                      |
| ------ | ---------------------- | -------------------------------------------- | -------------------- |
| `POST` | `/sessions`            | Create a swap request                        |                      |
| `GET`  | `/sessions/my`         | List my sessions (`type=incoming             | outgoing`, `status`) |
| `PUT`  | `/sessions/:id/status` | Update status (`accepted`, `rejected`, etc.) |                      |





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
