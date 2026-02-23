require('dotenv').config();
const mysql = require('mysql2/promise');

async function migrateTeamFlags() {
    const pool = mysql.createPool({
        host: process.env.MYSQL_HOST,
        port: process.env.MYSQL_PORT,
        user: process.env.MYSQL_USER,
        password: process.env.MYSQL_PASSWORD,
        database: process.env.MYSQL_DATABASE,
        waitForConnections: true,
        connectionLimit: 10,
        queueLimit: 0
    });

    try {
        console.log('Connecting to database for migration...');

        try {
            await pool.query('ALTER TABLE events ADD COLUMN is_team_event BOOLEAN DEFAULT FALSE');
            console.log('✅ Added is_team_event to events table');
        } catch (e) {
            console.log('ℹ️ is_team_event already exists or error:', e.message);
        }

        try {
            await pool.query('ALTER TABLE events ADD COLUMN max_team_size INT DEFAULT 1');
            console.log('✅ Added max_team_size to events table');
        } catch (e) {
            console.log('ℹ️ max_team_size already exists or error:', e.message);
        }

        try {
            await pool.query('ALTER TABLE registrations ADD COLUMN team_name VARCHAR(100) DEFAULT NULL');
            console.log('✅ Added team_name to registrations table');
        } catch (e) {
            console.log('ℹ️ team_name already exists or error:', e.message);
        }

        console.log('Migration completed.');
        process.exit(0);
    } catch (e) {
        console.error('Migration failed:', e);
        process.exit(1);
    }
}

migrateTeamFlags();
