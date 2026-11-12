const jwt = require('jsonwebtoken');
const { getDB } = require('../lib/db');
const logger = require('../lib/logger');

// ── Admin allowlist (from env) ──────────────────────
const getAdminEmails = () =>
    (process.env.ADMIN_EMAILS || '')
        .split(',')
        .map(e => e.trim().toLowerCase())
        .filter(Boolean);

// ── Allowed email domain (from env) ─────────────────
const getAllowedDomain = () =>
    (process.env.ALLOWED_EMAIL_DOMAIN || '').trim().toLowerCase();

/**
 * Verify JWT and attach user to req.user
 */
const authenticate = async (req, res, next) => {
    try {
        const header = req.headers.authorization;
        if (!header || !header.startsWith('Bearer ')) {
            return res.status(401).json({ message: 'Access denied. No token provided.' });
        }

        const token = header.split(' ')[1];
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        const pool = getDB();
        const { rows } = await pool.query('SELECT id, name, email, google_id, created_at FROM users WHERE id = $1', [decoded.id]);
        if (rows.length === 0) {
            return res.status(401).json({ message: 'Invalid token. User not found.' });
        }

        const user = rows[0];
        user.isAdmin = getAdminEmails().includes(user.email.toLowerCase());
        req.user = user;
        next();
    } catch (error) {
        if (error.name === 'JsonWebTokenError') {
            return res.status(401).json({ message: 'Invalid token.' });
        }
        if (error.name === 'TokenExpiredError') {
            return res.status(401).json({ message: 'Token has expired.' });
        }
        logger.error('Auth middleware error:', error);
        res.status(500).json({ message: 'Server error during authentication.' });
    }
};

/**
 * Require admin privileges (checked via ADMIN_EMAILS env).
 * Must be used AFTER authenticate.
 */
const requireAdmin = (req, res, next) => {
    if (!req.user || !req.user.isAdmin) {
        return res.status(403).json({ message: 'Access denied. Admin privileges required.' });
    }
    next();
};

/**
 * Check that an email belongs to the allowed university domain.
 */
const isAllowedDomain = (email) => {
    const domain = getAllowedDomain();
    if (!domain) return true; // if not configured, allow all
    return email.toLowerCase().endsWith(`@${domain}`);
};

module.exports = { authenticate, requireAdmin, isAllowedDomain, getAdminEmails };
