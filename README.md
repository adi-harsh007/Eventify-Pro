# 🎉 Eventify Pro — Full-Stack Event Management System

A modern, production-ready event management platform with role-based access control, OTP email verification, and AI-powered event descriptions.

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- MySQL 8.0+ running locally

### Installation

```bash
# Install frontend dependencies
npm install

# Install backend dependencies
cd server
npm install
```

### Environment Setup

**Backend** (`server/.env`):
```env
MYSQL_HOST=localhost
MYSQL_PORT=3306
MYSQL_USER=root
MYSQL_PASSWORD=<your-database-password>
MYSQL_DATABASE=eventify_pro

JWT_SECRET=<generate-a-strong-random-secret>
# Generate with: node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"

GOOGLE_CLIENT_ID=<your-google-client-id>

SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=<your-email@gmail.com>
SMTP_PASS=<your-google-app-password>
FROM_EMAIL=<your-email@gmail.com>

GEMINI_API_KEY=<your-gemini-api-key>
ADMIN_EMAILS=<admin@yourdomain.com>

CLOUDINARY_CLOUD_NAME=<your-cloud-name>
CLOUDINARY_API_KEY=<your-api-key>
CLOUDINARY_API_SECRET=<your-api-secret>

# Production only:
# NODE_ENV=production
# CORS_ORIGIN=https://your-frontend-url.com
```

**Frontend** (`.env.local`):
```env
VITE_GOOGLE_CLIENT_ID=<your-google-client-id>
```

### Running the Application

**Terminal 1 — Backend API:**
```bash
cd server
npm run dev
# ✅ MySQL pool ready
# 🚀 Server running on port 3000
```

**Terminal 2 — Frontend:**
```bash
npm run dev
# Open: http://localhost:5173
```

## ✨ Features

- **OTP Email Verification** — Secure signup with 6-digit email codes
- **Google Sign-In** — One-click login with Google OAuth 2.0
- **Role-Based Auth** — Admin & User roles with JWT security
- **Admin Dashboard** — Create/edit/delete events, view registrations
- **User Dashboard** — Browse events, join/leave, category filters
- **AI-Powered** — Gemini API generates event descriptions
- **Mobile Responsive** — Full mobile navigation & layouts

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 19, TypeScript, Vite, Tailwind CSS |
| Backend | Node.js, Express |
| Database | MySQL 8.0 |
| Auth | JWT, bcryptjs, Google OAuth 2.0 |
| Email | Nodemailer (Gmail SMTP) |
| AI | Google Gemini API |

## 🔒 Security

- bcrypt password hashing (12 rounds)
- JWT token authentication
- OTP email verification for signups
- Rate limiting on auth endpoints
- Helmet security headers
- CORS origin restriction
- File upload type/size validation
- Input sanitization

---

Built with ❤️ using React, Express, and MySQL
