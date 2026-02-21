const mysql = require('mysql2/promise');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });

async function run() {
    try {
        const pool = mysql.createPool({
            host: process.env.MYSQL_HOST || 'localhost',
            port: process.env.MYSQL_PORT || 3306,
            user: process.env.MYSQL_USER || 'root',
            password: process.env.MYSQL_PASSWORD,
            database: process.env.MYSQL_DATABASE || 'eventify_pro',
            waitForConnections: true,
            connectionLimit: 10,
            queueLimit: 0
        });

        console.log('Running migration to update ENUM category...');
        await pool.query(`
            ALTER TABLE events 
            MODIFY COLUMN category ENUM(
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
            ) NOT NULL DEFAULT 'Other';
        `);
        console.log('Migration successful: Updated category ENUM.');

        // Ensure image_url is a varchar(500) if not already
        await pool.query(`
            ALTER TABLE events
            MODIFY COLUMN image_url VARCHAR(500) DEFAULT '';
        `);
        console.log('Migration successful: Ensured image_url column is correct.');

        // Ensure department column exists
        try {
            await pool.query(`
                ALTER TABLE events ADD COLUMN department VARCHAR(50) DEFAULT 'General';
            `);
            console.log('Migration successful: Added missing department column.');
        } catch (colErr) {
            if (colErr.code === 'ER_DUP_FIELDNAME') {
                console.log('department column already exists.');
            } else {
                throw colErr;
            }
        }

        process.exit(0);
    } catch (e) {
        console.error('Migration failed:', e);
        process.exit(1);
    }
}

run();
