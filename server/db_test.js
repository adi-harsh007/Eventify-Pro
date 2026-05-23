const mysql = require('mysql2/promise');
require('dotenv').config();
async function run() {
    const pool = mysql.createPool({
        host: process.env.MYSQL_HOST,
        port: process.env.MYSQL_PORT,
        user: process.env.MYSQL_USER,
        password: process.env.MYSQL_PASSWORD,
        database: process.env.MYSQL_DATABASE
    });
    const [rows] = await pool.query("SELECT id, title, date, time, CONCAT(date, ' ', time) as dt, NOW() as now FROM events WHERE CONCAT(date, ' ', time) >= NOW()");
    console.log(rows);
    process.exit(0);
}
run();
