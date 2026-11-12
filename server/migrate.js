const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });
const { createPool } = require('./lib/db');

async function run() {
    const pool = createPool();

    try {
        console.log('Running PostgreSQL migration to update category constraint & columns...');

        // Ensure category constraint supports all current categories
        await pool.query(`
            DO $$
            DECLARE
                c_name text;
            BEGIN
                SELECT conname INTO c_name
                FROM pg_constraint
                WHERE conrelid = 'events'::regclass
                  AND contype = 'c'
                  AND pg_get_constraintdef(oid) ILIKE '%category%';

                IF c_name IS NOT NULL THEN
                    EXECUTE format('ALTER TABLE events DROP CONSTRAINT %I', c_name);
                END IF;
            END $$;
        `);

        await pool.query(`
            ALTER TABLE events
            ALTER COLUMN category TYPE VARCHAR(50),
            ALTER COLUMN category SET DEFAULT 'Other',
            ADD CONSTRAINT events_category_check CHECK (category IN (
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
            ));
        `);
        console.log('Migration successful: Updated category CHECK constraint.');

        await pool.query(`
            ALTER TABLE events
            ALTER COLUMN image_url TYPE VARCHAR(500),
            ALTER COLUMN image_url SET DEFAULT '';
        `);
        console.log('Migration successful: Ensured image_url column is correct.');

        await pool.query(`
            ALTER TABLE events ADD COLUMN IF NOT EXISTS department VARCHAR(50) DEFAULT 'General';
        `);
        console.log('Migration successful: Ensured department column exists.');
    } catch (e) {
        console.error('Migration failed:', e);
        process.exitCode = 1;
    } finally {
        await pool.end();
    }
}

run();
