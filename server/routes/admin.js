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
        const [rows] = await pool.query(
            `SELECT e.*, u.name AS creator_name, u.email AS creator_email
             FROM events e LEFT JOIN users u ON e.organizer_id = u.id
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
        const [existing] = await pool.query('SELECT id FROM events WHERE id = ?', [req.params.id]);
        if (existing.length === 0) {
            return res.status(404).json({ message: 'Event not found.' });
        }

        const { title, description, date, time, location, capacity, category, imageUrl } = req.body;

        await pool.query(
            `UPDATE events SET title = COALESCE(?, title), description = COALESCE(?, description),
             date = COALESCE(?, date), time = COALESCE(?, time), location = COALESCE(?, location),
             capacity = COALESCE(?, capacity), category = COALESCE(?, category),
             image_url = COALESCE(?, image_url) WHERE id = ?`,
            [title, description, date, time, location, capacity, category, imageUrl, req.params.id]
        );

        const [updated] = await pool.query('SELECT * FROM events WHERE id = ?', [req.params.id]);
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
        const [existing] = await pool.query('SELECT * FROM events WHERE id = ?', [req.params.id]);
        if (existing.length === 0) {
            return res.status(404).json({ message: 'Event not found.' });
        }

        await pool.query('DELETE FROM registrations WHERE event_id = ?', [req.params.id]);
        await pool.query('DELETE FROM events WHERE id = ?', [req.params.id]);
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
        const [rows] = await pool.query(
            `SELECT r.id, r.user_id, r.event_id, r.created_at, u.name, u.email
             FROM registrations r LEFT JOIN users u ON r.user_id = u.id
             WHERE r.event_id = ?
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
    const conn = await pool.getConnection();
    try {
        await conn.beginTransaction();

        const [regs] = await conn.query('SELECT * FROM registrations WHERE id = ?', [req.params.id]);
        if (regs.length === 0) {
            await conn.rollback();
            conn.release();
            return res.status(404).json({ message: 'Registration not found.' });
        }

        const reg = regs[0];
        await conn.query('DELETE FROM registrations WHERE id = ?', [req.params.id]);
        await conn.query(
            'UPDATE events SET registered_count = GREATEST(registered_count - 1, 0) WHERE id = ?',
            [reg.event_id]
        );

        await conn.commit();
        conn.release();

        logger.info(`Admin removed registration ${req.params.id}`);
        res.json({ message: 'Registration removed successfully.' });
    } catch (error) {
        await conn.rollback();
        conn.release();
        logger.error('Admin remove registration error:', error);
        res.status(500).json({ message: 'Failed to remove registration.' });
    }
});

// GET /api/admin/users — list all users
router.get('/users', async (req, res) => {
    try {
        const pool = getDB();
        const [rows] = await pool.query('SELECT id, name, email, created_at FROM users ORDER BY created_at DESC');
        res.json(rows);
    } catch (error) {
        logger.error('Admin get users error:', error);
        res.status(500).json({ message: 'Failed to fetch users.' });
    }
});

module.exports = router;
