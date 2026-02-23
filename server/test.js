require('dotenv').config();
const { getDB, initDB } = require('./lib/db');

async function test() {
    try {
        await initDB();
        const pool = getDB();
        const [rows] = await pool.query('SHOW COLUMNS FROM events');
        console.log("Columns:", rows.map(r => r.Field).join(', '));

        const [testQuery] = await pool.query(
            `SELECT e.*, u.name AS creator_name, u.email AS creator_email
             FROM events e LEFT JOIN users u ON e.organizer_id = u.id
             ORDER BY e.created_at DESC LIMIT 1`
        );
        console.log("Query success:", testQuery.length);
    } catch (e) {
        console.error("Query failed:", e.message);
    }
    process.exit(0);
}

test();
