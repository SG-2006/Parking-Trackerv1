# Parking Finder

A full-stack parking spot booking app. Users sign up, log in, and can view real-time availability across multiple parking lots — booking or releasing individual spots, with all state persisted in a relational database.

Built as a step up from a basic CRUD project, focused on adding real depth: authentication, protected routes, relational data modeling, and concurrency-safe booking logic.

## Features

- **Authentication** — signup/login with bcrypt password hashing and JWT-based sessions
- **Protected routes** — booking/releasing a spot requires a valid, verified token (custom Express middleware)
- **Relational data model** — four related tables (`users`, `lots`, `spots`, `bookings`) with foreign key relationships
- **Conflict-safe booking** — the backend checks and enforces spot availability directly against the database, preventing two users from booking the same spot (tested across concurrent sessions)
- **Ownership checks** — a user can only release a spot they personally booked
- **Live-updating frontend** — React app that fetches and re-fetches spot data after every booking/release action, no manual refresh needed
- **Booking history by design** — bookings are stored as their own events (not just a status flag on a spot), so past booking history is preserved even after a spot is released

## Tech stack

**Backend:** Node.js, Express, TypeScript, SQLite (via `better-sqlite3`), bcrypt, jsonwebtoken

**Frontend:** React, TypeScript

## Project structure

```
parking-app/
├── Parking-Backend/
│   └── src/
│       ├── index.ts       # Express app entry point
│       ├── db.ts          # SQLite connection + schema
│       ├── auth.ts        # Signup / login routes
│       ├── middleware.ts  # JWT verification middleware
│       └── spots.ts       # Lots / spots / bookings routes
└── Parking-Frontend/
    └── src/
        └── App.tsx         # Main UI: auth forms, lot/spot display, booking actions
```

## Database schema

- **users** — `id`, `email`, `password_hash`, `role`, `created_at`
- **lots** — `id`, `name`
- **spots** — `id`, `lot_id` (→ lots), `label`, `status`
- **bookings** — `id`, `spot_id` (→ spots), `user_id` (→ users), `created_at`, `status`

## Running locally

**Backend**
```bash
cd Parking-Backend
npm install
npx tsx src/index.ts
```
Runs on `http://localhost:3001`.

**Frontend**
```bash
cd Parking-Frontend
npm install
npm start
```
Runs on `http://localhost:3000`.

## API overview

| Method | Route | Auth required | Description |
|---|---|---|---|
| POST | `/auth/signup` | No | Create a new account |
| POST | `/auth/login` | No | Log in, returns a JWT |
| GET | `/lots` | No | List all parking lots |
| GET | `/spots` | No | List all spots and their status |
| POST | `/bookings` | Yes | Book a specific spot |
| POST | `/bookings/release` | Yes | Release a spot you previously booked |

## What I'd build next (v2)

- Admin routes to add/remove lots and spots through the app itself, rather than seed scripts
- Timed reservations with automatic expiry
- A booking history view for logged-in users
