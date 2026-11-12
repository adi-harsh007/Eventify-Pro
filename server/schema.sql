-- Eventify Pro — PostgreSQL Schema (Supabase / PostgreSQL 17)

-- ─── Users ──────────────────────────────────────────
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    password VARCHAR(255) DEFAULT NULL,
    role VARCHAR(20) NOT NULL DEFAULT 'user' CHECK (role IN ('user', 'admin')),
    department VARCHAR(50),
    google_id VARCHAR(255) DEFAULT NULL UNIQUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_users_email ON users (email);

-- ─── Events ─────────────────────────────────────────
CREATE TABLE IF NOT EXISTS events (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    date DATE NOT NULL,
    time TIME NOT NULL,
    location VARCHAR(255) NOT NULL,
    capacity INTEGER NOT NULL DEFAULT 100 CHECK (capacity > 0),
    registered_count INTEGER NOT NULL DEFAULT 0,
    category VARCHAR(50) NOT NULL DEFAULT 'Other' CHECK (category IN (
        'Hackathon',
        'Tech Competition',
        'Sports Event',
        'Cultural Fest',
        'Music Concert',
        'Workshop',
        'Conference',
        'Meetup',
        'Webinar',
        'Social',
        'Other'
    )),
    department VARCHAR(50) DEFAULT 'General',
    image_url VARCHAR(500) DEFAULT '',
    is_team_event BOOLEAN DEFAULT FALSE,
    max_team_size INTEGER DEFAULT 1,
    price NUMERIC(10, 2) DEFAULT 0.00,
    status VARCHAR(20) NOT NULL DEFAULT 'upcoming' CHECK (status IN ('upcoming', 'ongoing', 'completed', 'cancelled')),
    created_by INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_events_created_at ON events (created_at DESC, id DESC);

-- ─── Registrations ──────────────────────────────────
CREATE TABLE IF NOT EXISTS registrations (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    event_id INTEGER NOT NULL REFERENCES events(id) ON DELETE CASCADE,
    team_name VARCHAR(100) DEFAULT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'registered' CHECK (status IN ('registered', 'attended', 'cancelled')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE (user_id, event_id)
);

-- ─── OTP Codes ──────────────────────────────────────
CREATE TABLE IF NOT EXISTS otp_codes (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) NOT NULL UNIQUE,
    code VARCHAR(6) NOT NULL,
    expires_at TIMESTAMPTZ NOT NULL,
    attempts INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ─── Mega Event Lineup ──────────────────────────────
CREATE TABLE IF NOT EXISTS mega_event_lineup (
    id SERIAL PRIMARY KEY,
    day_label VARCHAR(50) NOT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    event_date DATE,
    event_time TIME,
    icon_name VARCHAR(50) DEFAULT 'Calendar'
);

-- ─── Mega Registrations ─────────────────────────────
CREATE TABLE IF NOT EXISTS mega_registrations (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
    status VARCHAR(20) NOT NULL DEFAULT 'registered' CHECK (status IN ('registered', 'cancelled')),
    registration_date TIMESTAMPTZ DEFAULT NOW()
);

-- ─── Admin Todos ────────────────────────────────────
CREATE TABLE IF NOT EXISTS admin_todos (
    id SERIAL PRIMARY KEY,
    text VARCHAR(255) NOT NULL,
    completed BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ─── Feedbacks ──────────────────────────────────────
CREATE TABLE IF NOT EXISTS feedbacks (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(255) NOT NULL,
    role VARCHAR(50) DEFAULT 'Visitor',
    rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
    comment TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_feedback_created ON feedbacks (created_at DESC);

-- ─── Event Feedbacks ─────────────────────────────────
CREATE TABLE IF NOT EXISTS event_feedbacks (
    id SERIAL PRIMARY KEY,
    event_id INTEGER NOT NULL REFERENCES events(id) ON DELETE CASCADE,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
    comment TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE (event_id, user_id)
);
