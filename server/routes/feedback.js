const express = require('express');
const rateLimit = require('express-rate-limit');
const { getDB } = require('../lib/db');
const logger = require('../lib/logger');

const router = express.Router();

// Rate limiter for feedback submissions (anti-spam)
const feedbackLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 3, // Max 3 feedback submissions per 15 min per IP
    message: { message: 'Too many feedback submissions. Please try again later.' },
    standardHeaders: true,
    legacyHeaders: false,
});

// GET /api/feedback — fetch all feedbacks (public, no auth required)
router.get('/', async (req, res) => {
    try {
        const pool = getDB();
        const [rows] = await pool.query(
            'SELECT id, name, role, rating, comment, created_at FROM feedbacks ORDER BY created_at DESC'
        );
        res.json({ feedbacks: rows });
    } catch (error) {
        logger.error('Get feedbacks error:', error);
        res.status(500).json({ message: 'Failed to fetch feedbacks.' });
    }
});

// POST /api/feedback — submit a new feedback (public, rate-limited)
router.post('/', feedbackLimiter, async (req, res) => {
    try {
        const { name, email, role, rating, comment } = req.body;

        // Validation
        if (!name || !email || !comment) {
            return res.status(400).json({ message: 'Name, email, and comment are required.' });
        }

        const parsedRating = parseInt(rating);
        if (isNaN(parsedRating) || parsedRating < 1 || parsedRating > 5) {
            return res.status(400).json({ message: 'Rating must be between 1 and 5.' });
        }

        // Sanitize inputs
        const safeName = String(name).slice(0, 100).replace(/[<>]/g, '');
        const safeEmail = String(email).slice(0, 255).replace(/[<>]/g, '');
        const safeRole = String(role || 'Visitor').slice(0, 50).replace(/[<>]/g, '');
        const safeComment = String(comment).slice(0, 1000).replace(/[<>]/g, '');

        const pool = getDB();
        const [result] = await pool.query(
            'INSERT INTO feedbacks (name, email, role, rating, comment) VALUES (?, ?, ?, ?, ?)',
            [safeName, safeEmail, safeRole, parsedRating, safeComment]
        );

        const [rows] = await pool.query('SELECT id, name, role, rating, comment, created_at FROM feedbacks WHERE id = ?', [result.insertId]);

        logger.info(`Feedback submitted by ${safeName} (${safeEmail})`);
        res.status(201).json({ feedback: rows[0] });
    } catch (error) {
        logger.error('Submit feedback error:', error);
        res.status(500).json({ message: 'Failed to submit feedback.' });
    }
});

module.exports = router;
