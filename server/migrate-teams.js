const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });
const { createPool } = require('./lib/db');

async function migrateTeamFlags() {
    const pool = createPool();

    try {
        console.log('Connecting to PostgreSQL database for migration...');

        await pool.query('ALTER TABLE events ADD COLUMN IF NOT EXISTS is_team_event BOOLEAN DEFAULT FALSE');
        console.log('✅ Ensured is_team_event on events table');

        await pool.query('ALTER TABLE events ADD COLUMN IF NOT EXISTS max_team_size INTEGER DEFAULT 1');
        console.log('✅ Ensured max_team_size on events table');

        await pool.query('ALTER TABLE registrations ADD COLUMN IF NOT EXISTS team_name VARCHAR(100) DEFAULT NULL');
        console.log('✅ Ensured team_name on registrations table');

        console.log('Migration completed.');
    } catch (e) {
        console.error('Migration failed:', e);
        process.exitCode = 1;
    } finally {
        await pool.end();
    }
}

migrateTeamFlags();
