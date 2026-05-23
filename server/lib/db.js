const mysql = require('mysql2/promise');
const logger = require('./logger');

let pool = null;

/**
 * Create and return the MySQL connection pool.
 */
async function initDB() {
    pool = mysql.createPool({
        host: process.env.MYSQL_HOST || 'localhost',
        port: parseInt(process.env.MYSQL_PORT) || 3306,
        user: process.env.MYSQL_USER || 'root',
        password: process.env.MYSQL_PASSWORD,
        database: process.env.MYSQL_DATABASE || 'eventify_pro',
        waitForConnections: true,
        connectionLimit: 10,
        queueLimit: 0,
        charset: 'utf8mb4'
    });

    try {
        await pool.query('SELECT 1'); // Test connection
        logger.info('✅ MySQL pool ready');

        // Ensure OTP table exists for deployment environments
        await pool.query(`
            CREATE TABLE IF NOT EXISTS otp_codes (
                id INT AUTO_INCREMENT PRIMARY KEY,
                email VARCHAR(255) NOT NULL,
                code VARCHAR(6) NOT NULL,
                expires_at DATETIME NOT NULL,
                attempts INT DEFAULT 0,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                UNIQUE KEY unique_email (email)
            )
        `);
        // Ensure attempts column exists (migration for existing tables)
        try { await pool.query('ALTER TABLE otp_codes ADD COLUMN attempts INT DEFAULT 0'); } catch (e) { }
        logger.info('✅ OTP tables verified');

        // Mega Event Lineup
        await pool.query(`
            CREATE TABLE IF NOT EXISTS mega_event_lineup (
                id INT AUTO_INCREMENT PRIMARY KEY,
                day_label VARCHAR(50) NOT NULL,
                title VARCHAR(255) NOT NULL,
                description TEXT,
                event_date DATE,
                event_time TIME,
                icon_name VARCHAR(50) DEFAULT 'Calendar'
            )
        `);
        const [lineupRows] = await pool.query('SELECT COUNT(*) as count FROM mega_event_lineup');
        if (lineupRows[0].count === 0) {
            await pool.query(`
                INSERT INTO mega_event_lineup (day_label, title, description, icon_name) VALUES 
                ('Day 1', 'Cultural Night', 'Experience the vibrant arts, dance, and traditional performances.', 'Calendar'),
                ('Day 2', 'DJ Night', 'Get ready to drop the beat with top campus DJs and intense light shows.', 'Music'),
                ('Day 3', 'Star Night', 'A live concert featuring a celebrity guest to close the fest in style.', 'Star')
            `);
        }

        // Mega Registrations
        await pool.query(`
            CREATE TABLE IF NOT EXISTS mega_registrations (
                id INT AUTO_INCREMENT PRIMARY KEY,
                user_id INT NOT NULL,
                status ENUM('registered', 'cancelled') DEFAULT 'registered',
                registration_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                UNIQUE KEY unique_mega_registration (user_id),
                FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
            )
        `);

        // Admin Todos
        await pool.query(`
            CREATE TABLE IF NOT EXISTS admin_todos (
                id INT AUTO_INCREMENT PRIMARY KEY,
                text VARCHAR(255) NOT NULL,
                completed BOOLEAN DEFAULT FALSE,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `);

        // Global Feedbacks
        await pool.query(`
            CREATE TABLE IF NOT EXISTS feedbacks (
                id INT AUTO_INCREMENT PRIMARY KEY,
                name VARCHAR(100) NOT NULL,
                email VARCHAR(255) NOT NULL,
                role VARCHAR(50) DEFAULT 'Visitor',
                rating INT NOT NULL CHECK (rating >= 1 AND rating <= 5),
                comment TEXT NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                INDEX idx_feedback_created (created_at DESC)
            )
        `);

        // Event Feedbacks
        await pool.query(`
            CREATE TABLE IF NOT EXISTS event_feedbacks (
                id INT AUTO_INCREMENT PRIMARY KEY,
                event_id INT NOT NULL,
                user_id INT NOT NULL,
                rating INT NOT NULL CHECK (rating >= 1 AND rating <= 5),
                comment TEXT NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (event_id) REFERENCES events (id) ON DELETE CASCADE,
                FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE,
                UNIQUE KEY uq_event_user_feedback (event_id, user_id)
            )
        `);

        // Schema Migrations (Fail-safe)
        try { await pool.query('ALTER TABLE events CHANGE organizer_id created_by INT NOT NULL'); } catch (e) { }
        try { await pool.query('ALTER TABLE events ADD COLUMN is_team_event BOOLEAN DEFAULT FALSE'); } catch (e) { }
        try { await pool.query('ALTER TABLE events ADD COLUMN max_team_size INT DEFAULT 1'); } catch (e) { }
        try { await pool.query('ALTER TABLE registrations ADD COLUMN team_name VARCHAR(100) DEFAULT NULL'); } catch (e) { }

        logger.info('✅ Database schema and migrations fully verified');
    } catch (err) {
        logger.error('Database connection failed:', err);
        process.exit(1);
    }

    return pool;
}

/**
 * Get the pool instance.
 */
function getDB() {
    if (!pool) throw new Error('Database not initialised. Call initDB() first.');
    return pool;
}

module.exports = { initDB, getDB };
