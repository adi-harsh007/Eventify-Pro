const mysql = require('mysql2/promise');

async function runSQL() {
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
        console.log('Connecting to database...');

        // 1. Users Table
        await pool.query(`
            CREATE TABLE IF NOT EXISTS users (
                id INT AUTO_INCREMENT PRIMARY KEY,
                name VARCHAR(255) NOT NULL,
                email VARCHAR(255) UNIQUE NOT NULL,
                password VARCHAR(255),
                role ENUM('user', 'admin') DEFAULT 'user',
                department VARCHAR(50),
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                google_id VARCHAR(255)
            )
        `);
        console.log('✅ users table created/verified');

        // 2. Events Table
        await pool.query(`
            CREATE TABLE IF NOT EXISTS events (
                id INT AUTO_INCREMENT PRIMARY KEY,
                title VARCHAR(255) NOT NULL,
                description TEXT,
                date DATE NOT NULL,
                time TIME NOT NULL,
                location VARCHAR(255) NOT NULL,
                category ENUM('Hackathon','Tech Competition','Sports Event','Cultural Fest','Music Concert','Workshop','Conference','Meetup','Webinar','Social','Other') NOT NULL DEFAULT 'Other',
                department VARCHAR(50) DEFAULT 'General',
                image_url VARCHAR(500) DEFAULT '',
                capacity INT DEFAULT 100,
                price DECIMAL(10, 2) DEFAULT 0.00,
                organizer_id INT NOT NULL,
                status ENUM('upcoming', 'ongoing', 'completed', 'cancelled') DEFAULT 'upcoming',
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (organizer_id) REFERENCES users(id) ON DELETE CASCADE
            )
        `);
        console.log('✅ events table created/verified');

        // 3. Registrations Table
        await pool.query(`
            CREATE TABLE IF NOT EXISTS registrations (
                id INT AUTO_INCREMENT PRIMARY KEY,
                user_id INT NOT NULL,
                event_id INT NOT NULL,
                status ENUM('registered', 'attended', 'cancelled') DEFAULT 'registered',
                registration_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                UNIQUE KEY unique_registration (user_id, event_id),
                FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
                FOREIGN KEY (event_id) REFERENCES events(id) ON DELETE CASCADE
            )
        `);
        console.log('✅ registrations table created/verified');

        console.log('\n🎉 ALL DATABASE TABLES SUCCESSFULLY INITIALIZED! 🎉');
        process.exit(0);
    } catch (e) {
        console.error('❌ Database Initialization Failed:', e);
        process.exit(1);
    }
}

runSQL();
