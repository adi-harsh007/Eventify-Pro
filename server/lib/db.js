const { Pool, types } = require('pg');
const logger = require('./logger');

// Keep PostgreSQL DATE (OID 1082) as 'YYYY-MM-DD' strings to avoid timezone day-shifts
types.setTypeParser(1082, (val) => val);

let pool = null;

/**
 * Build and return a configured PostgreSQL connection pool.
 */
function createPool() {
    const connectionString = process.env.DATABASE_URL;
    const isLocalUrl =
        connectionString &&
        (connectionString.includes('localhost') || connectionString.includes('127.0.0.1'));
    const useSSL =
        process.env.DB_SSL === 'true' ||
        (Boolean(connectionString) && !isLocalUrl && process.env.DB_SSL !== 'false');

    const config = connectionString
        ? {
              connectionString,
              ssl: useSSL ? { rejectUnauthorized: false } : false,
              max: 10,
              idleTimeoutMillis: 30000,
              connectionTimeoutMillis: 15000,
          }
        : {
              host: process.env.PGHOST || 'localhost',
              port: parseInt(process.env.PGPORT, 10) || 5432,
              user: process.env.PGUSER || 'postgres',
              password: process.env.PGPASSWORD,
              database: process.env.PGDATABASE || 'eventify_pro',
              ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : false,
              max: 10,
              idleTimeoutMillis: 30000,
              connectionTimeoutMillis: 15000,
          };

    return new Pool(config);
}

/**
 * Create tables, indexes, and idempotent schema migrations.
 */
async function ensureSchema(targetPool, { seedFeedbacks = false } = {}) {
    // 1. Users
    await targetPool.query(`
        CREATE TABLE IF NOT EXISTS users (
            id SERIAL PRIMARY KEY,
            name VARCHAR(255) NOT NULL,
            email VARCHAR(255) UNIQUE NOT NULL,
            password VARCHAR(255),
            role VARCHAR(20) NOT NULL DEFAULT 'user' CHECK (role IN ('user', 'admin')),
            department VARCHAR(50),
            google_id VARCHAR(255) UNIQUE,
            created_at TIMESTAMPTZ DEFAULT NOW(),
            updated_at TIMESTAMPTZ DEFAULT NOW()
        )
    `);
    await targetPool.query('CREATE INDEX IF NOT EXISTS idx_users_email ON users (email)');

    // 2. Events
    await targetPool.query(`
        CREATE TABLE IF NOT EXISTS events (
            id SERIAL PRIMARY KEY,
            title VARCHAR(255) NOT NULL,
            description TEXT NOT NULL,
            date DATE NOT NULL,
            time TIME NOT NULL,
            location VARCHAR(255) NOT NULL,
            category VARCHAR(50) NOT NULL DEFAULT 'Other' CHECK (category IN (
                'Hackathon', 'Tech Competition', 'Sports Event', 'Cultural Fest',
                'Music Concert', 'Workshop', 'Conference', 'Meetup', 'Webinar', 'Social', 'Other'
            )),
            department VARCHAR(50) DEFAULT 'General',
            image_url VARCHAR(500) DEFAULT '',
            is_team_event BOOLEAN DEFAULT FALSE,
            max_team_size INTEGER DEFAULT 1,
            capacity INTEGER NOT NULL DEFAULT 100 CHECK (capacity > 0),
            registered_count INTEGER NOT NULL DEFAULT 0,
            price NUMERIC(10, 2) DEFAULT 0.00,
            created_by INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
            status VARCHAR(20) NOT NULL DEFAULT 'upcoming' CHECK (status IN ('upcoming', 'ongoing', 'completed', 'cancelled')),
            created_at TIMESTAMPTZ DEFAULT NOW(),
            updated_at TIMESTAMPTZ DEFAULT NOW()
        )
    `);
    await targetPool.query('CREATE INDEX IF NOT EXISTS idx_events_created_at ON events (created_at DESC, id DESC)');

    // 3. Registrations
    await targetPool.query(`
        CREATE TABLE IF NOT EXISTS registrations (
            id SERIAL PRIMARY KEY,
            user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
            event_id INTEGER NOT NULL REFERENCES events(id) ON DELETE CASCADE,
            team_name VARCHAR(100) DEFAULT NULL,
            status VARCHAR(20) NOT NULL DEFAULT 'registered' CHECK (status IN ('registered', 'attended', 'cancelled')),
            created_at TIMESTAMPTZ DEFAULT NOW(),
            UNIQUE (user_id, event_id)
        )
    `);

    // 4. OTP Codes
    await targetPool.query(`
        CREATE TABLE IF NOT EXISTS otp_codes (
            id SERIAL PRIMARY KEY,
            email VARCHAR(255) UNIQUE NOT NULL,
            code VARCHAR(6) NOT NULL,
            expires_at TIMESTAMPTZ NOT NULL,
            attempts INTEGER DEFAULT 0,
            created_at TIMESTAMPTZ DEFAULT NOW()
        )
    `);

    // 5. Mega Event Lineup
    await targetPool.query(`
        CREATE TABLE IF NOT EXISTS mega_event_lineup (
            id SERIAL PRIMARY KEY,
            day_label VARCHAR(50) NOT NULL,
            title VARCHAR(255) NOT NULL,
            description TEXT,
            event_date DATE,
            event_time TIME,
            icon_name VARCHAR(50) DEFAULT 'Calendar'
        )
    `);
    const { rows: lineupRows } = await targetPool.query('SELECT COUNT(*)::int AS count FROM mega_event_lineup');
    if (lineupRows[0].count === 0) {
        await targetPool.query(`
            INSERT INTO mega_event_lineup (day_label, title, description, icon_name) VALUES
            ('Day 1', 'Cultural Night', 'Experience the vibrant arts, dance, and traditional performances.', 'Calendar'),
            ('Day 2', 'DJ Night', 'Get ready to drop the beat with top campus DJs and intense light shows.', 'Music'),
            ('Day 3', 'Star Night', 'A live concert featuring a celebrity guest to close the fest in style.', 'Star')
        `);
    }

    // 6. Mega Registrations
    await targetPool.query(`
        CREATE TABLE IF NOT EXISTS mega_registrations (
            id SERIAL PRIMARY KEY,
            user_id INTEGER NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
            status VARCHAR(20) NOT NULL DEFAULT 'registered' CHECK (status IN ('registered', 'cancelled')),
            registration_date TIMESTAMPTZ DEFAULT NOW()
        )
    `);

    // 7. Admin Todos
    await targetPool.query(`
        CREATE TABLE IF NOT EXISTS admin_todos (
            id SERIAL PRIMARY KEY,
            text VARCHAR(255) NOT NULL,
            completed BOOLEAN DEFAULT FALSE,
            created_at TIMESTAMPTZ DEFAULT NOW()
        )
    `);

    // 8. Global Feedbacks
    await targetPool.query(`
        CREATE TABLE IF NOT EXISTS feedbacks (
            id SERIAL PRIMARY KEY,
            name VARCHAR(100) NOT NULL,
            email VARCHAR(255) NOT NULL,
            role VARCHAR(50) DEFAULT 'Visitor',
            rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
            comment TEXT NOT NULL,
            created_at TIMESTAMPTZ DEFAULT NOW()
        )
    `);
    await targetPool.query('CREATE INDEX IF NOT EXISTS idx_feedback_created ON feedbacks (created_at DESC)');

    if (seedFeedbacks) {
        const { rows: feedbackRows } = await targetPool.query('SELECT COUNT(*)::int AS count FROM feedbacks');
        if (feedbackRows[0].count === 0) {
            await targetPool.query(`
                INSERT INTO feedbacks (name, email, role, rating, comment) VALUES
                ('Arjun Mehta', 'arjun.mehta@university.edu', 'CS Student', 5, 'Eventify Pro completely changed how I discover campus events. The UI is gorgeous, registering for hackathons takes seconds, and the ticket management dashboard is incredibly intuitive. Best campus tool I have ever used!'),
                ('Dr. Priya Sharma', 'priya.sharma@college.ac.in', 'Faculty Organizer', 5, 'As an event organizer, the admin panel is a dream. I can create events with AI-generated descriptions, upload banners via Cloudinary, and track registrations in real-time. The Gemini integration alone saves me hours of copywriting.'),
                ('Rahul Krishnan', 'rahul.k@techcorp.com', 'Tech Recruiter', 4, 'I reviewed this platform as part of a candidate evaluation. The full-stack architecture — React + Node + PostgreSQL + Redis + Cloudinary — is impressive. Clean code, proper auth flows, and thoughtful rate limiting. Very well engineered.'),
                ('Sneha Patel', 'sneha.patel@student.edu', 'Event Enthusiast', 5, 'From cultural fests to music concerts, everything is organized beautifully. I love how I can see all my upcoming events in one place. The team registration feature for hackathons is a game changer!'),
                ('Vikram Desai', 'vikram.d@startup.io', 'Startup Founder', 4, 'The technical decisions here are solid — cursor-based pagination, Redis caching, Helmet security headers, and Cloudinary media pipeline. This is production-grade engineering, not a toy project.')
            `);
        }
    }

    // 9. Event Feedbacks
    await targetPool.query(`
        CREATE TABLE IF NOT EXISTS event_feedbacks (
            id SERIAL PRIMARY KEY,
            event_id INTEGER NOT NULL REFERENCES events(id) ON DELETE CASCADE,
            user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
            rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
            comment TEXT NOT NULL,
            created_at TIMESTAMPTZ DEFAULT NOW(),
            UNIQUE (event_id, user_id)
        )
    `);

    // Idempotent column migrations for existing tables
    await targetPool.query('ALTER TABLE otp_codes ADD COLUMN IF NOT EXISTS attempts INTEGER DEFAULT 0');
    await targetPool.query('ALTER TABLE events ADD COLUMN IF NOT EXISTS is_team_event BOOLEAN DEFAULT FALSE');
    await targetPool.query('ALTER TABLE events ADD COLUMN IF NOT EXISTS max_team_size INTEGER DEFAULT 1');
    await targetPool.query('ALTER TABLE events ADD COLUMN IF NOT EXISTS registered_count INTEGER NOT NULL DEFAULT 0');
    await targetPool.query("ALTER TABLE events ADD COLUMN IF NOT EXISTS department VARCHAR(50) DEFAULT 'General'");
    await targetPool.query('ALTER TABLE registrations ADD COLUMN IF NOT EXISTS team_name VARCHAR(100) DEFAULT NULL');
    await targetPool.query('ALTER TABLE registrations ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ DEFAULT NOW()');
}

/**
 * Create and verify the PostgreSQL connection pool.
 */
async function initDB() {
    pool = createPool();

    try {
        await pool.query('SELECT 1');
        logger.info('✅ PostgreSQL pool ready');

        await ensureSchema(pool);
        logger.info('✅ Database schema and migrations fully verified');
    } catch (err) {
        logger.error('Database connection failed:', err);
        process.exit(1);
    }

    return pool;
}

/**
 * Get the active pool instance.
 */
function getDB() {
    if (!pool) throw new Error('Database not initialised. Call initDB() first.');
    return pool;
}

module.exports = { initDB, getDB, createPool, ensureSchema };
