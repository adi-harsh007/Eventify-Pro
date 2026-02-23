require('dotenv').config();
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
                is_team_event BOOLEAN DEFAULT FALSE,
                max_team_size INT DEFAULT 1,
                capacity INT DEFAULT 100,
                registered_count INT NOT NULL DEFAULT 0,
                price DECIMAL(10, 2) DEFAULT 0.00,
                created_by INT NOT NULL,
                status ENUM('upcoming', 'ongoing', 'completed', 'cancelled') DEFAULT 'upcoming',
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE CASCADE
            )
        `);
        // Add registered_count if missing (for existing databases)
        try {
            await pool.query(`ALTER TABLE events ADD COLUMN registered_count INT NOT NULL DEFAULT 0`);
            console.log('  ↳ added missing registered_count column');
        } catch (e) {
            // Column already exists — ignore
        }
        console.log('✅ events table created/verified');

        // 3. Registrations Table
        await pool.query(`
            CREATE TABLE IF NOT EXISTS registrations (
                id INT AUTO_INCREMENT PRIMARY KEY,
                user_id INT NOT NULL,
                event_id INT NOT NULL,
                team_name VARCHAR(100) DEFAULT NULL,
                status ENUM('registered', 'attended', 'cancelled') DEFAULT 'registered',
                registration_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                UNIQUE KEY unique_registration (user_id, event_id),
                FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
                FOREIGN KEY (event_id) REFERENCES events(id) ON DELETE CASCADE
            )
        `);
        console.log('✅ registrations table created/verified');

        // 4. Mega Registrations Table
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
        console.log('✅ mega_registrations table created/verified');

        // 5. Mega Event Lineup Table
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
        // Seed initial data if empty
        const [lineupRows] = await pool.query('SELECT COUNT(*) as count FROM mega_event_lineup');
        if (lineupRows[0].count === 0) {
            await pool.query(`
                INSERT INTO mega_event_lineup (day_label, title, description, icon_name) VALUES 
                ('Day 1', 'Cultural Night', 'Experience the vibrant arts, dance, and traditional performances.', 'Calendar'),
                ('Day 2', 'DJ Night', 'Get ready to drop the beat with top campus DJs and intense light shows.', 'Music'),
                ('Day 3', 'Star Night', 'A live concert featuring a celebrity guest to close the fest in style.', 'Star')
            `);
            console.log('✅ mega_event_lineup seeded with default schedule');
        } else {
            console.log('✅ mega_event_lineup table verified');
        }

        // 6. Admin Todos Table
        await pool.query(`
            CREATE TABLE IF NOT EXISTS admin_todos (
                id INT AUTO_INCREMENT PRIMARY KEY,
                text VARCHAR(255) NOT NULL,
                completed BOOLEAN DEFAULT FALSE,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `);
        console.log('✅ admin_todos table created/verified');

        console.log('\n🎉 ALL DATABASE TABLES SUCCESSFULLY INITIALIZED! 🎉');
        process.exit(0);
    } catch (e) {
        console.error('❌ Database Initialization Failed:', e);
        process.exit(1);
    }
}

runSQL();
