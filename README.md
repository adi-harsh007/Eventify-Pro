# Eventify Pro - Comprehensive Feature & Role Documentation

This document provides a detailed breakdown of the features, user capabilities, and third-party integrations (such as the Gemini API) within the Eventify Pro platform.

---

## 1. User Roles & Capabilities

The platform operates on a strict Role-Based Access Control (RBAC) system, separating standard attendees from platform administrators.

### 👤 Regular Users (Attendees)
Regular users have access to the public and attendee-facing features of the platform:
*   **Authentication & Security:**
    *   Sign up securely via Email and OTP verification.
    *   Single Sign-On (SSO) using Google OAuth.
    *   Account recovery via secure Forgot/Reset Password flows.
*   **Event Discovery:**
    *   Browse a paginated, infinite-scroll feed of upcoming events.
    *   View a public landing page feed (no authentication required) showcasing live, real-time top events.
*   **Event Registration:**
    *   Register for events with a single click.
    *   Register for team-based events by providing a custom `teamName`.
    *   Cancel/Leave an event they previously registered for.
*   **Mega Events:**
    *   View real-time status and lineups for special "Mega Events."
    *   Join Mega Events if capacity permits.
*   **Dashboard:**
    *   Access a personal dashboard to view all active registrations and upcoming commitments.
*   **Feedback/Reviews:**
    *   Submit feedback/reviews (rating + comment) for events they attended (past events only).
    *   These reviews are displayed publicly on the landing page feed and in event details modals.

### 🛡️ Administrators (Organizers/Admins)
Administrators possess all regular user capabilities, alongside a suite of powerful management tools:
*   **Event Management Lifecycle:**
    *   **Create:** Draft new events, specifying title, category, date, location, and total capacity.
    *   **Update:** Modify existing event details, change schedules, or update capacities.
    *   **Delete:** Remove cancelled or outdated events from the platform.
*   **Media Management:**
    *   Upload high-quality event banners securely. Images are automatically optimized and hosted via Cloudinary.
*   **Attendee Management:**
    *   View a comprehensive list of all registered users on the platform.
    *   View specific registration lists for individual events to manage attendance.
    *   Remove or revoke registrations on behalf of users if necessary.
*   **Mega Events Control:**
    *   Update and broadcast new JSON-based lineup data for Mega Events in real-time.
*   **Internal Productivity (Admin Dashboard):**
    *   Access an integrated **Todo List** (Create, Read, Update, Delete tasks) to track administrative duties, event planning progress, and team workflows directly within the app.
*   **Feedback Management:**
    *   View all submitted feedback with star ratings and comments, and delete feedback entries as needed for moderation.

---

## 2. Google Gemini AI Integration

Eventify Pro utilizes the official `@google/genai` SDK to power intelligent features across the platform.

### ✨ EventBot (AI Assistant)
*   **Primary Use Case:** Intelligent chatbot assistant for users navigating the platform.
*   **Features:**
    *   Provides instant, context-aware answers regarding Eventify Pro features, campus events, and scheduling.
    *   Available across the Landing Page, User Dashboard, and Admin Dashboard via a sleek, floating UI.
*   **Security & Cost Control:** 
    *   Strictly sandboxed to answer only Eventify-related queries.
    *   Guest users are limited to **1 message per IP**.
    *   Authenticated users are limited to **5 messages per login session**.
    *   All limits are securely enforced at the backend level to prevent front-end bypasses.

### 📝 Automated Event Description Generation
*   **Primary Use Case:** Assisting administrators with content creation.
*   **How it Works:** 
    1. During event creation, an Admin inputs the event `Title` and `Category`.
    2. The Admin clicks the "Generate ✨" button.
    3. The backend sanitizes the inputs (preventing prompt injection) and securely forwards them to the `gemini-2.5-flash` model.
    4. The resulting rich, engaging text is instantly populated into the description field.
*   **Security & Cost Control:** To prevent abuse and API exhaustion, the AI generation endpoint (`POST /api/ai/generate`) is protected by a dedicated, strict rate limiter allowing only **5 AI generation requests per 15 minutes per IP address**.

---

## 3. Core Technical Features & Architecture

*   **Robust Security:**
    *   Global rate limiting (200 requests/15m) to prevent DDoS.
    *   Strict auth rate limiting (15 requests/15m) to prevent brute-force attacks.
    *   Helmet.js for secure HTTP headers.
    *   Payload size restrictions to prevent buffer overflow attacks.
*   **Storage Infrastructure:**
    *   **MySQL 8:** Serves as the primary relational database, maintaining strict referential integrity between Users, Events, and Registrations.
    *   **Cloudinary:** Handles all image uploads (via `multer-storage-cloudinary`), applying automatic width-limiting and format optimization for lightning-fast image delivery.
    *   **Redis:** Configured to handle fast in-memory caching and session/rate-limit tracking to ensure the API remains highly responsive under load.
*   **Public API Layer:**
    *   Features a fully unprotected `GET /api/events/public` endpoint specifically designed to serve authentic, live database content directly to the landing page, proving full-stack integration to visitors without requiring JWT tokens.
