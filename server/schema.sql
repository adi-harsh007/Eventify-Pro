-- Eventify Pro — MySQL Schema
-- Run: mysql -u root -p eventify_pro < schema.sql

CREATE DATABASE IF NOT EXISTS eventify_pro CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

USE eventify_pro;

-- ─── Users ──────────────────────────────────────────
CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(50) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    password VARCHAR(255) DEFAULT NULL,
    google_id VARCHAR(255) DEFAULT NULL UNIQUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_email (email)
) ENGINE = InnoDB;

-- ─── Events ─────────────────────────────────────────
CREATE TABLE IF NOT EXISTS events (
    id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(100) NOT NULL,
    description TEXT NOT NULL,
    date VARCHAR(20) NOT NULL,
    time VARCHAR(20) NOT NULL,
    location VARCHAR(255) NOT NULL,
    capacity INT NOT NULL CHECK (capacity > 0),
    registered_count INT NOT NULL DEFAULT 0,
    category ENUM(
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
    ) NOT NULL DEFAULT 'Other',
    department VARCHAR(50) DEFAULT 'General',
    image_url VARCHAR(500) DEFAULT '',
    is_team_event BOOLEAN DEFAULT FALSE,
    max_team_size INT DEFAULT 1,
    created_by INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (created_by) REFERENCES users (id) ON DELETE CASCADE,
    INDEX idx_created_at (created_at DESC, id DESC)
) ENGINE = InnoDB;

-- ─── Registrations ──────────────────────────────────
CREATE TABLE IF NOT EXISTS registrations (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    event_id INT NOT NULL,
    team_name VARCHAR(100) DEFAULT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE KEY uq_user_event (user_id, event_id),
    FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE,
    FOREIGN KEY (event_id) REFERENCES events (id) ON DELETE CASCADE
) ENGINE = InnoDB;