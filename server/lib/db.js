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
        try {
            await pool.query('ALTER TABLE otp_codes ADD COLUMN attempts INT DEFAULT 0');
        } catch (e) {
            // Column already exists, ignore
        }
        logger.info('✅ OTP tables verified');
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
