const express = require('express');
const { getDB } = require('../lib/db');
const { authenticate, requireAdmin } = require('../middleware/auth');
const { cacheInvalidate } = require('../lib/redis');
const logger = require('../lib/logger');

const router = express.Router();

// All admin routes require authentication + admin role
router.use(authenticate, requireAdmin);

// GET /api/admin/events — list all events
router.get('/events', async (req, res) => {
    try {
        const pool = getDB();
        const { rows } = await pool.query(
            `SELECT e.*, u.name AS creator_name, u.email AS creator_email
             FROM events e LEFT JOIN users u ON e.created_by = u.id
             ORDER BY e.created_at DESC`
        );
        res.json(rows);
    } catch (error) {
        logger.error('Admin get events error:', error);
        res.status(500).json({ message: 'Failed to fetch events.' });
    }
});

// PATCH /api/admin/events/:id — edit any event
router.patch('/events/:id', async (req, res) => {
    try {
        const pool = getDB();
        const { rows: existing } = await pool.query('SELECT id FROM events WHERE id = $1', [req.params.id]);
        if (existing.length === 0) {
            return res.status(404).json({ message: 'Event not found.' });
        }

        const { title, description, date, time, location, capacity, category, imageUrl } = req.body;

        const { rows: updated } = await pool.query(
            `UPDATE events SET title = COALESCE($1, title), description = COALESCE($2, description),
             date = COALESCE($3, date), time = COALESCE($4, time), location = COALESCE($5, location),
             capacity = COALESCE($6, capacity), category = COALESCE($7, category),
             image_url = COALESCE($8, image_url) WHERE id = $9
             RETURNING *`,
            [
                title ?? null,
                description ?? null,
                date ?? null,
                time ?? null,
                location ?? null,
                capacity ?? null,
                category ?? null,
                imageUrl ?? null,
                req.params.id
            ]
        );

        await cacheInvalidate('feed:*');
        await cacheInvalidate('discovery:*');

        logger.info(`Admin updated event ${req.params.id}`);
        res.json(updated[0]);
    } catch (error) {
        logger.error('Admin update event error:', error);
        res.status(500).json({ message: 'Failed to update event.' });
    }
});

// DELETE /api/admin/events/:id — delete any event
router.delete('/events/:id', async (req, res) => {
    try {
        const pool = getDB();
        const { rows: existing } = await pool.query('SELECT * FROM events WHERE id = $1', [req.params.id]);
        if (existing.length === 0) {
            return res.status(404).json({ message: 'Event not found.' });
        }

        await pool.query('DELETE FROM registrations WHERE event_id = $1', [req.params.id]);
        await pool.query('DELETE FROM events WHERE id = $1', [req.params.id]);
        await cacheInvalidate('feed:*');
        await cacheInvalidate('discovery:*');

        logger.info(`Admin deleted event ${req.params.id}`);
        res.json({ message: 'Event deleted successfully.' });
    } catch (error) {
        logger.error('Admin delete event error:', error);
        res.status(500).json({ message: 'Failed to delete event.' });
    }
});

// GET /api/admin/events/:id/registrations — view registrations for an event
router.get('/events/:id/registrations', async (req, res) => {
    try {
        const pool = getDB();
        const { rows } = await pool.query(
            `SELECT r.id, r.user_id, r.event_id, r.created_at, u.name, u.email
             FROM registrations r LEFT JOIN users u ON r.user_id = u.id
             WHERE r.event_id = $1
             ORDER BY r.created_at DESC`,
            [req.params.id]
        );
        res.json(rows);
    } catch (error) {
        logger.error('Admin get registrations error:', error);
        res.status(500).json({ message: 'Failed to fetch registrations.' });
    }
});

// DELETE /api/admin/registrations/:id — remove a registration
router.delete('/registrations/:id', async (req, res) => {
    const pool = getDB();
    const client = await pool.connect();
    let inTx = false;

    try {
        await client.query('BEGIN');
        inTx = true;

        const { rows: regs } = await client.query('SELECT * FROM registrations WHERE id = $1', [req.params.id]);
        if (regs.length === 0) {
            await client.query('ROLLBACK');
            inTx = false;
            return res.status(404).json({ message: 'Registration not found.' });
        }

        const reg = regs[0];
        await client.query('DELETE FROM registrations WHERE id = $1', [req.params.id]);
        await client.query(
            'UPDATE events SET registered_count = GREATEST(registered_count - 1, 0) WHERE id = $1',
            [reg.event_id]
        );

        await client.query('COMMIT');
        inTx = false;

        logger.info(`Admin removed registration ${req.params.id}`);
        res.json({ message: 'Registration removed successfully.' });
    } catch (error) {
        if (inTx) {
            try { await client.query('ROLLBACK'); } catch (_) { /* ignore rollback errors */ }
        }
        logger.error('Admin remove registration error:', error);
        res.status(500).json({ message: 'Failed to remove registration.' });
    } finally {
        client.release();
    }
});

// GET /api/admin/users — list all users
router.get('/users', async (req, res) => {
    try {
        const pool = getDB();
        const { rows } = await pool.query('SELECT id, name, email, created_at FROM users ORDER BY created_at DESC');
        res.json(rows);
    } catch (error) {
        logger.error('Admin get users error:', error);
        res.status(500).json({ message: 'Failed to fetch users.' });
    }
});

// GET /api/admin/feedback — list all feedback across all events
router.get('/feedback', async (req, res) => {
    try {
        const pool = getDB();
        const { rows } = await pool.query(
            `SELECT f.id, f.rating, f.comment, f.created_at,
                    u.name AS user_name, u.email AS user_email,
                    e.title AS event_title
             FROM event_feedbacks f
             JOIN users u ON f.user_id = u.id
             JOIN events e ON f.event_id = e.id
             ORDER BY f.created_at DESC`
        );
        res.json(rows);
    } catch (error) {
        logger.error('Admin get feedback error:', error);
        res.status(500).json({ message: 'Failed to fetch feedback.' });
    }
});

// DELETE /api/admin/feedback/:id — delete a specific feedback
router.delete('/feedback/:id', async (req, res) => {
    try {
        const pool = getDB();
        const { rows: existing } = await pool.query('SELECT id FROM event_feedbacks WHERE id = $1', [req.params.id]);
        if (existing.length === 0) {
            return res.status(404).json({ message: 'Feedback not found.' });
        }

        await pool.query('DELETE FROM event_feedbacks WHERE id = $1', [req.params.id]);
        logger.info(`Admin deleted feedback ${req.params.id}`);
        res.json({ message: 'Feedback deleted successfully.' });
    } catch (error) {
        logger.error('Admin delete feedback error:', error);
        res.status(500).json({ message: 'Failed to delete feedback.' });
    }
});

module.exports = router;
