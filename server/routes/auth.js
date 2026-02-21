const express = require('express');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { getDB } = require('../lib/db');
const { getRedis } = require('../lib/redis');
const { isAllowedDomain, getAdminEmails } = require('../middleware/auth');
const { sendEmail } = require('../lib/email');
const { OAuth2Client } = require('google-auth-library');
const logger = require('../lib/logger');

const router = express.Router();

// Email format validator
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const isValidEmail = (email) => EMAIL_REGEX.test(email);

// Generate JWT token
const generateToken = (user) => {
    return jwt.sign(
        { id: user.id },
        process.env.JWT_SECRET,
        { expiresIn: '7d' }
    );
};

// Sanitise user object (strip password)
const sanitiseUser = (row) => {
    const { password, ...user } = row;
    user.isAdmin = getAdminEmails().includes(user.email.toLowerCase());
    return user;
};

// POST /api/auth/send-otp
router.post('/send-otp', async (req, res) => {
    try {
        const { email, name } = req.body;
        if (!email) return res.status(400).json({ message: 'Email is required.' });
        if (!isValidEmail(email)) return res.status(400).json({ message: 'Invalid email.' });

        const pool = getDB();
        const [existing] = await pool.query('SELECT id FROM users WHERE email = ?', [email.toLowerCase()]);
        if (existing.length > 0) {
            // Return generic response to prevent account enumeration (#5)
            return res.json({ message: 'If this email is valid, an OTP has been sent.' });
        }

        const otp = Math.floor(100000 + Math.random() * 900000).toString(); // 6 digit OTP

        // Save OTP directly into MySQL to ensure it survives server reboots/scaling on free tiers
        const expiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5 mins
        await pool.query(
            `INSERT INTO otp_codes (email, code, expires_at, attempts) 
             VALUES (?, ?, ?, 0) 
             ON DUPLICATE KEY UPDATE code = VALUES(code), expires_at = VALUES(expires_at), attempts = 0`,
            [email.toLowerCase(), otp, expiresAt]
        );

        // Best effort: store in Redis if configured (for ultra-fast caching, but optional)
        const redis = getRedis();
        const key = `otp:${email.toLowerCase()}`;
        if (redis) {
            try { await redis.setex(key, 300, otp); } catch (e) { /* ignore */ }
        }

        // Sanitize name to prevent XSS in email
        const safeName = (name || 'User').replace(/[<>&"']/g, '');

        const emailHtml = `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                <h2>Welcome to Eventify Pro, ${safeName}!</h2>
                <p>Use the following OTP to complete your registration. It is valid for 5 minutes.</p>
                <div style="background: #f4f4f4; padding: 15px; text-align: center; font-size: 24px; font-weight: bold; letter-spacing: 5px; border-radius: 5px;">
                    ${otp}
                </div>
            </div>
        `;

        const sent = await sendEmail(email.toLowerCase(), 'Eventify Pro - Verification Code', emailHtml);

        // Developer Intercept: Only log OTP in development mode
        if (process.env.NODE_ENV !== 'production') {
            console.log(`\n========================================`);
            console.log(`\u{1F511} DEVELOPER OTP INTERCEPT:`);
            console.log(`To: ${email}`);
            console.log(`Code: ${otp}`);
            console.log(`========================================\n`);
        }

        if (!sent) {
            if (process.env.NODE_ENV !== 'production') {
                logger.warn(`Email failed to send to ${email}. Continuing in dev mode...`);
                return res.json({ message: 'Email failed but OTP was logged to the terminal!' });
            }
            return res.status(500).json({ message: 'Failed to send verification email.' });
        }

        res.json({ message: 'OTP sent to email successfully.' });
    } catch (error) {
        logger.error('Send OTP error:', error);
        res.status(500).json({ message: 'Server error sending OTP.' });
    }
});

// POST /api/auth/signup
router.post('/signup', async (req, res) => {
    try {
        const { name, email, password: rawPwd, otp } = req.body;

        if (!name || !email || !rawPwd || !otp) {
            return res.status(400).json({ message: 'Name, email, password, and OTP are required.' });
        }
        if (!isValidEmail(email)) {
            return res.status(400).json({ message: 'Please enter a valid email address.' });
        }
        if (!isAllowedDomain(email)) {
            const domain = (process.env.ALLOWED_EMAIL_DOMAIN || '').trim();
            return res.status(400).json({ message: `Only @${domain} email addresses are allowed.` });
        }
        if (rawPwd.length < 6) {
            return res.status(400).json({ message: 'Password must be at least 6 characters.' });
        }

        const pool = getDB();

        // 1. Fetch OTP from MySQL (survives reboots safely)
        const [otpRows] = await pool.query('SELECT code, expires_at, attempts FROM otp_codes WHERE email = ?', [email.toLowerCase()]);

        if (otpRows.length === 0) {
            return res.status(401).json({ message: 'No OTP requested for this email. Please request a new one.' });
        }

        const storedOtp = otpRows[0].code;
        const expiresAt = new Date(otpRows[0].expires_at);
        const attempts = otpRows[0].attempts || 0;

        // Brute-force protection: lock after 5 failed attempts (#6)
        if (attempts >= 5) {
            await pool.query('DELETE FROM otp_codes WHERE email = ?', [email.toLowerCase()]);
            return res.status(429).json({ message: 'Too many failed attempts. Please request a new OTP.' });
        }

        if (expiresAt < new Date()) {
            await pool.query('DELETE FROM otp_codes WHERE email = ?', [email.toLowerCase()]);
            return res.status(401).json({ message: 'OTP has expired. Please request a new one.' });
        }

        if (String(storedOtp).trim() !== String(otp).trim()) {
            // Increment attempt counter on failure
            await pool.query('UPDATE otp_codes SET attempts = attempts + 1 WHERE email = ?', [email.toLowerCase()]);
            return res.status(401).json({ message: 'Invalid OTP code.' });
        }

        // 2. Check if user already exists
        const [existing] = await pool.query('SELECT id FROM users WHERE email = ?', [email.toLowerCase()]);
        if (existing.length > 0) {
            await pool.query('DELETE FROM otp_codes WHERE email = ?', [email.toLowerCase()]);
            return res.status(409).json({ message: 'An account with this email already exists.' });
        }

        // 3. Create the User!
        const salt = await bcrypt.genSalt(12);
        const hash = await bcrypt.hash(rawPwd, salt);

        const [result] = await pool.query(
            'INSERT INTO users (name, email, password) VALUES (?, ?, ?)',
            [name.trim(), email.toLowerCase(), hash]
        );

        // Delete the used OTP code safely
        await pool.query('DELETE FROM otp_codes WHERE email = ?', [email.toLowerCase()]);

        // Clean up from Redis if it was somehow used
        const redis = getRedis();
        if (redis) {
            try { await redis.del(`otp:${email.toLowerCase()}`); } catch (e) { /* ignore */ }
        }

        const user = { id: result.insertId, name: name.trim(), email: email.toLowerCase() };
        user.isAdmin = getAdminEmails().includes(user.email);
        const token = generateToken(user);

        res.status(201).json({ token, user });
    } catch (error) {
        logger.error('Signup error:', error);
        res.status(500).json({ message: 'Server error during signup.' });
    }
});

// POST /api/auth/login
router.post('/login', async (req, res) => {
    try {
        const { email, password: rawPwd } = req.body;

        if (!email || !rawPwd) {
            return res.status(400).json({ message: 'Email and password are required.' });
        }
        if (!isValidEmail(email)) {
            return res.status(400).json({ message: 'Please enter a valid email address.' });
        }
        if (!isAllowedDomain(email)) {
            const domain = (process.env.ALLOWED_EMAIL_DOMAIN || '').trim();
            return res.status(400).json({ message: `Only @${domain} email addresses are allowed.` });
        }

        const pool = getDB();
        const [rows] = await pool.query('SELECT * FROM users WHERE email = ?', [email.toLowerCase()]);
        if (rows.length === 0) {
            return res.status(401).json({ message: 'Invalid credentials.' });
        }

        const user = rows[0];
        if (!user.password) {
            return res.status(401).json({ message: 'This account uses Google Sign-In. Please log in with Google.' });
        }

        const isMatch = await bcrypt.compare(rawPwd, user.password);
        if (!isMatch) {
            return res.status(401).json({ message: 'Invalid credentials.' });
        }

        const token = generateToken(user);
        res.json({ token, user: sanitiseUser(user) });
    } catch (error) {
        logger.error('Login error:', error);
        res.status(500).json({ message: 'Server error during login.' });
    }
});

// GET /api/auth/me — validate token & get current user
router.get('/me', async (req, res) => {
    try {
        const header = req.headers.authorization;
        if (!header || !header.startsWith('Bearer ')) {
            return res.status(401).json({ message: 'No token provided.' });
        }

        const token = header.split(' ')[1];
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        const pool = getDB();
        const [rows] = await pool.query('SELECT id, name, email, google_id, created_at FROM users WHERE id = ?', [decoded.id]);
        if (rows.length === 0) {
            return res.status(401).json({ message: 'User not found.' });
        }

        const user = rows[0];
        user.isAdmin = getAdminEmails().includes(user.email.toLowerCase());
        res.json({ user });
    } catch (error) {
        res.status(401).json({ message: 'Invalid token.' });
    }
});

// POST /api/auth/google — Google Sign-In (ID Token verification with audience check)
router.post('/google', async (req, res) => {
    try {
        const { credential } = req.body;

        if (!credential) {
            return res.status(400).json({ message: 'Google credential is required.' });
        }

        const clientId = process.env.GOOGLE_CLIENT_ID;
        if (!clientId) {
            return res.status(500).json({ message: 'Google OAuth not configured on server.' });
        }

        // Verify ID Token with audience binding (#2)
        const client = new OAuth2Client(clientId);
        let payload;
        try {
            const ticket = await client.verifyIdToken({
                idToken: credential,
                audience: clientId
            });
            payload = ticket.getPayload();
        } catch (verifyErr) {
            // Fallback: try as access token for backward compatibility
            const googleRes = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
                headers: { Authorization: `Bearer ${credential}` }
            });
            if (!googleRes.ok) {
                return res.status(401).json({ message: 'Invalid Google credential.' });
            }
            payload = await googleRes.json();
        }

        const { sub: googleId, email, name, email_verified } = payload;

        if (email_verified === false || email_verified === 'false') {
            return res.status(401).json({ message: 'Google email is not verified.' });
        }
        if (!isAllowedDomain(email)) {
            const domain = (process.env.ALLOWED_EMAIL_DOMAIN || '').trim();
            return res.status(400).json({ message: `Only @${domain} email addresses are allowed.` });
        }

        const pool = getDB();

        // Find existing user by googleId or email
        const [rows] = await pool.query(
            'SELECT * FROM users WHERE google_id = ? OR email = ? LIMIT 1',
            [googleId, email.toLowerCase()]
        );

        let user;
        if (rows.length > 0) {
            user = rows[0];
            if (!user.google_id) {
                await pool.query('UPDATE users SET google_id = ? WHERE id = ?', [googleId, user.id]);
                user.google_id = googleId;
            }
        } else {
            const [result] = await pool.query(
                'INSERT INTO users (name, email, google_id) VALUES (?, ?, ?)',
                [name || email.split('@')[0], email.toLowerCase(), googleId]
            );
            user = { id: result.insertId, name: name || email.split('@')[0], email: email.toLowerCase(), google_id: googleId };
        }

        const token = generateToken(user);
        res.json({ token, user: sanitiseUser(user) });
    } catch (error) {
        logger.error('Google auth error:', error);
        res.status(500).json({ message: 'Server error during Google authentication.' });
    }
});

module.exports = router;
