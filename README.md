# Eventify Pro

Eventify Pro is a full-stack campus and organization event management platform built with React, TypeScript, Express, PostgreSQL (Supabase), Redis, Cloudinary, and Google Gemini AI. It provides a public showcase landing page, attendee discovery and registration workflows (including team events and mega-event lineups), and an administrative console for managing events, attendees, feedback, and internal tasks.

---

## Table of Contents

- [User Roles and Capabilities](#user-roles-and-capabilities)
- [Google Gemini AI Integration](#google-gemini-ai-integration)
- [Architecture and Tech Stack](#architecture-and-tech-stack)
- [Project Structure](#project-structure)
- [Local Development Setup](#local-development-setup)
- [Environment Variables](#environment-variables)
- [API Overview](#api-overview)
- [Deployment Notes](#deployment-notes)

---

## User Roles and Capabilities

The platform enforces Role-Based Access Control (RBAC) via JWT authentication and an administrator email allowlist (`ADMIN_EMAILS`), separating standard attendees from administrators.

### Regular Users (Attendees)

- **Authentication and Security:**
  - Email registration with 6-digit OTP verification and brute-force attempt locking.
  - Single Sign-On (SSO) using Google OAuth (`@react-oauth/google` + `google-auth-library`).
  - Account recovery via OTP-verified Forgot/Reset Password flows.
  - Optional university/organization email domain restriction (`ALLOWED_EMAIL_DOMAIN`).
- **Event Discovery:**
  - Public landing page feed (`GET /api/events/public`) displaying live upcoming events without requiring login.
  - Authenticated event feed and global discovery feed with cursor-based pagination.
- **Event Registration:**
  - Single-click registration and cancellation backed by PostgreSQL transactions (`SELECT ... FOR UPDATE`) to prevent overbooking.
  - Support for team-based events with custom `teamName` validation and per-team capacity limits.
- **Mega Events:**
  - View real-time multi-day lineup schedules and register for Mega Event passes.
- **Personal Dashboard:**
  - Track active registrations and upcoming commitments.
- **Reviews and Feedback:**
  - Submit ratings and reviews for past events they registered for, plus general platform testimonials.

### Administrators (Organizers)

Administrators retain all attendee capabilities along with management tools:

- **Event Management Lifecycle:** Create, update, and delete events with capacity, category, department, schedule, and team-size controls.
- **Media Pipeline:** Upload event banners through Cloudinary (`multer-storage-cloudinary`) with automatic optimization and 5 MB upload limits.
- **Attendee Management:** View registered users, inspect per-event registration rosters, and remove registrations when needed.
- **Mega Event Control:** Update multi-day Mega Event lineup entries in real time.
- **Admin Todo List:** Create, toggle, and delete internal administrative tasks directly from the dashboard.
- **Feedback Moderation:** Inspect event reviews and remove inappropriate entries.

---

## Google Gemini AI Integration

Eventify Pro uses the official `@google/genai` SDK (`gemini-2.5-flash`) on the backend:

### EventBot (AI Assistant)

- Context-aware floating assistant available on the Landing Page, User Dashboard, and Admin Dashboard.
- Scoped via system instructions to answer questions related to Eventify Pro, campus events, scheduling, and event management.
- Backend-enforced usage limits: 1 message per IP for guests and 5 messages per session for authenticated users, plus IP rate limiting (5 requests per 15 minutes).

### Automated Event Description Generation

- Assists administrators during event creation via `POST /api/ai/generate`.
- Sanitizes `title` and `category` inputs on the server before generating a concise three-sentence event description.
- Protected by a dedicated rate limiter (5 requests per 15 minutes per IP).

---

## Architecture and Tech Stack

- **Frontend:** React 19, TypeScript, Vite, Tailwind CSS v4, React Router v7, Framer Motion, Radix UI, Lucide Icons.
- **Backend:** Node.js, Express, `pg` (PostgreSQL), `bcryptjs`, `jsonwebtoken`, `helmet`, `express-rate-limit`, `winston`.
- **Primary Database:** PostgreSQL 17 hosted on Supabase (`DATABASE_URL` with SSL/TLS). Schema covers `users`, `events`, `registrations`, `otp_codes`, `mega_event_lineup`, `mega_registrations`, `admin_todos`, `feedbacks`, and `event_feedbacks`.
- **Caching:** Redis via `ioredis` (optional; the API degrades gracefully when Redis is unavailable).
- **Media and Email:** Cloudinary for image storage and Nodemailer (SMTP) for OTP and password-reset emails.

---

## Project Structure

```text
eventify-pro/
├── App.tsx                 # Root React router, auth state, and layout
├── apiService.ts           # Frontend API client
├── components/             # Landing sections, dashboards, modals, and UI primitives
├── public/                 # Static assets
├── vercel.json             # Vercel SPA rewrites and COOP headers
├── vite.config.ts          # Vite configuration (port 5173)
└── server/
    ├── server.js           # Express app, middleware, AI endpoints, health checks
    ├── init-db.js          # Idempotent PostgreSQL schema creation and seed script
    ├── migrate.js          # Category/column migration script
    ├── migrate-teams.js    # Team-event columns migration script
    ├── schema.sql          # Reference PostgreSQL DDL schema
    ├── lib/
    │   ├── db.js           # pg Pool configuration, DATE parser, schema verifier
    │   ├── redis.js        # Optional Redis client and cache helpers
    │   ├── date.js         # Event date/time normalization
    │   ├── email.js        # Nodemailer SMTP helper
    │   └── logger.js       # Winston logger
    ├── middleware/
    │   └── auth.js         # JWT verification and admin/domain checks
    └── routes/
        ├── auth.js         # OTP, signup, login, Google OAuth, password reset
        ├── events.js       # Public feed, paginated feed, CRUD, event feedback
        ├── discovery.js    # Cursor-paginated global discovery feed
        ├── registrations.js# Transactional join/leave event endpoints
        ├── mega-events.js  # Mega event status, registration, and lineup admin
        ├── admin.js        # Admin event, user, registration, and feedback management
        ├── admin-todos.js  # Admin todo CRUD
        └── feedback.js     # Public testimonials GET/POST
```

---

## Local Development Setup

### Prerequisites

- Node.js 18+ and npm
- A PostgreSQL database (such as a Supabase project using the Session Pooler connection string)
- Optional: Redis instance for feed caching

### 1. Install Dependencies

```bash
# Frontend dependencies (workspace root)
npm install

# Backend dependencies
npm --prefix server install
```

### 2. Configure Environment Variables

Create `.env.local` in the project root and `server/.env` in `server/` using the variables listed in [Environment Variables](#environment-variables).

### 3. Initialize the Database

```bash
node server/init-db.js
```

This creates all required tables, indexes, and default seed data (`mega_event_lineup` and `feedbacks`), and exits cleanly when complete. You can also run `server/schema.sql` directly against PostgreSQL.

### 4. Start Frontend and Backend

```bash
# Start backend API (runs init-db.js, migrate-teams.js, and server.js on port 3000)
npm --prefix server start

# Start frontend dev server (port 5173)
npm run dev
```

For backend development with file watching:

```bash
npm --prefix server run dev
```

---

## Environment Variables

### Frontend (`.env.local`)

| Variable | Required | Description |
| :--- | :--- | :--- |
| `VITE_GOOGLE_CLIENT_ID` | Yes | Google OAuth 2.0 Client ID |
| `VITE_API_URL` | No | Backend base URL (defaults to `http://localhost:3000`) |

### Backend (`server/.env`)

| Variable | Required | Description |
| :--- | :--- | :--- |
| `DATABASE_URL` | Yes | PostgreSQL connection string (e.g., Supabase Session Pooler URI) |
| `DB_SSL` | No | Set to `true` for cloud PostgreSQL TLS connections (`false` to disable) |
| `PORT` | No | Express server port (defaults to `3000`) |
| `CORS_ORIGIN` | No | Allowed frontend origin (defaults to `http://localhost:5173`) |
| `JWT_SECRET` | Yes | Secret key used to sign JWT tokens |
| `GOOGLE_CLIENT_ID` | Yes | Google OAuth Client ID for ID token verification |
| `ADMIN_EMAILS` | No | Comma-separated list of admin email addresses |
| `ALLOWED_EMAIL_DOMAIN` | No | Optional email domain restriction (e.g., `university.edu`) |
| `GEMINI_API_KEY` | Yes (for AI) | Google Gemini API key (`VITE_GEMINI_API_KEY` also accepted) |
| `REDIS_URL` | No | Redis connection URI (defaults to `redis://127.0.0.1:6379`; optional) |
| `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS`, `FROM_EMAIL` | Yes (for OTP/Reset) | SMTP configuration for sending verification and password-reset emails |
| `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET` | Yes (for uploads) | Cloudinary credentials for banner image uploads |
| `LOG_LEVEL` | No | Winston log level |
| `NODE_ENV` | No | Runtime environment (`development` or `production`) |

---

## API Overview

- **Health:** `GET /api/health`, `GET /api/health/db`
- **Auth:** `POST /api/auth/send-otp`, `POST /api/auth/signup`, `POST /api/auth/login`, `GET /api/auth/me`, `POST /api/auth/google`, `POST /api/auth/forgot-password`, `POST /api/auth/reset-password`
- **Events:** `GET /api/events/public`, `GET /api/events`, `POST /api/events`, `PUT /api/events/:id`, `DELETE /api/events/:id`, `GET /api/events/:id/feedback`, `POST /api/events/:id/feedback`
- **Discovery:** `GET /api/discovery`
- **Registrations:** `GET /api/registrations`, `GET /api/registrations/all`, `GET /api/registrations/users`, `POST /api/registrations`, `DELETE /api/registrations/:eventId`
- **Mega Events:** `GET /api/mega-events/status`, `POST /api/mega-events/register`, `GET /api/mega-events/lineup`, `PUT /api/mega-events/admin/lineup/:id`
- **Admin:** `GET /api/admin/events`, `PATCH /api/admin/events/:id`, `DELETE /api/admin/events/:id`, `GET /api/admin/events/:id/registrations`, `DELETE /api/admin/registrations/:id`, `GET /api/admin/users`, `GET /api/admin/feedback`, `DELETE /api/admin/feedback/:id`
- **Admin Todos:** `GET /api/admin-todos`, `POST /api/admin-todos`, `PUT /api/admin-todos/:id`, `DELETE /api/admin-todos/:id`
- **Testimonials:** `GET /api/feedback`, `POST /api/feedback`
- **AI and Uploads:** `POST /api/ai/generate`, `POST /api/ai/chat`, `POST /api/upload`

---

## Deployment Notes

- **Frontend (Vercel):** Configured via `vercel.json` with SPA fallback rewrites and `Cross-Origin-Opener-Policy: same-origin-allow-popups` for Google Sign-In popups. Set `VITE_API_URL` and `VITE_GOOGLE_CLIENT_ID` in Vercel environment settings.
- **Backend (Render or Node Host):** Set `DATABASE_URL` (use the IPv4-compatible Supabase Session Pooler URI on port `5432`) and `DB_SSL=true`, along with `CORS_ORIGIN`, `JWT_SECRET`, `GOOGLE_CLIENT_ID`, `ADMIN_EMAILS`, `GEMINI_API_KEY`, Cloudinary, and SMTP variables. Use `npm start` or `node server.js` as the start command.
