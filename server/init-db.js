const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });
const { createPool, ensureSchema } = require('./lib/db');

async function runSQL() {
    const pool = createPool();

    try {
        console.log('Connecting to PostgreSQL database...');
        await pool.query('SELECT 1');
        await ensureSchema(pool, { seedFeedbacks: true });
        console.log('\n🎉 ALL DATABASE TABLES SUCCESSFULLY INITIALIZED! 🎉');
    } catch (e) {
        console.error('❌ Database Initialization Failed:', e);
        process.exitCode = 1;
    } finally {
        await pool.end();
    }
}

runSQL();
