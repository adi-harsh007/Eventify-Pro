const express = require('express');
const { getDB } = require('../lib/db');
const { authenticate, requireAdmin } = require('../middleware/auth');
const { normalizeEventDateTime } = require('../lib/date');
const logger = require('../lib/logger');

const router = express.Router();

// GET /api/registrations — get current user's registrations
router.get('/', authenticate, async (req, res) => {
    try {
        const pool = getDB();
        const [rows] = await pool.query(
            'SELECT * FROM registrations WHERE user_id = ?',
            [req.user.id]
        );
        res.json(rows);
    } catch (error) {
        logger.error('Get registrations error:', error);
        res.status(500).json({ message: 'Failed to fetch registrations.' });
    }
});

// GET /api/registrations/all — get all registrations (admin only)
router.get('/all', authenticate, requireAdmin, async (req, res) => {
    try {
        const pool = getDB();
        const [rows] = await pool.query('SELECT * FROM registrations');
        res.json(rows);
    } catch (error) {
        logger.error('Get all registrations error:', error);
        res.status(500).json({ message: 'Failed to fetch registrations.' });
    }
});

// GET /api/registrations/users — get all users (admin only)
router.get('/users', authenticate, requireAdmin, async (req, res) => {
    try {
        const pool = getDB();
        const [rows] = await pool.query('SELECT id, name, email, created_at FROM users');
        res.json(rows);
    } catch (error) {
        logger.error('Get users error:', error);
        res.status(500).json({ message: 'Failed to fetch users.' });
    }
});

/**
 * POST /api/registrations — join an event
 * Uses MySQL transaction + SELECT … FOR UPDATE to prevent overbooking.
 */
router.post('/', authenticate, async (req, res) => {
    const pool = getDB();
    const conn = await pool.getConnection();

    try {
        const { eventId, teamName } = req.body;
        if (!eventId) {
            conn.release();
            return res.status(400).json({ message: 'Event ID is required.' });
        }

        await conn.beginTransaction();

        // Lock the event row
        const [events] = await conn.query(
            'SELECT id, capacity, registered_count, is_team_event, max_team_size FROM events WHERE id = ? FOR UPDATE',
            [eventId]
        );

        if (events.length === 0) {
            await conn.rollback();
            conn.release();
            return res.status(404).json({ message: 'Event not found.' });
        }

        const event = events[0];

        const [eventDateRows] = await conn.query('SELECT date, time FROM events WHERE id = ?', [eventId]);
        const eventDateRow = eventDateRows[0];
        
        try {
            const eventDateTime = normalizeEventDateTime({
                date: eventDateRow.date,
                time: eventDateRow.time
            });
            if (eventDateTime <= new Date()) {
                await conn.rollback();
                conn.release();
                return res.status(400).json({ message: 'This event has already ended. Registration is closed.' });
            }
        } catch (err) {
            logger.error(`Error parsing event date/time for registration (Event ID: ${eventId}):`, err);
            // Optionally, handle error if event date is unparseable
        }

        if (event.registered_count >= event.capacity) {
            await conn.rollback();
            conn.release();
            return res.status(400).json({ message: 'This event is at full capacity.' });
        }

        if (event.is_team_event) {
            if (!teamName) {
                await conn.rollback();
                conn.release();
                return res.status(400).json({ message: 'A team name is required for this event.' });
            }

            // Check how many people are already registered under this team
            const [teamCounts] = await conn.query(
                'SELECT COUNT(*) as member_count FROM registrations WHERE event_id = ? AND team_name = ? FOR UPDATE',
                [eventId, teamName]
            );

            if (teamCounts[0].member_count >= event.max_team_size) {
                await conn.rollback();
                conn.release();
                return res.status(400).json({ message: `Team "${teamName}" is already full (max ${event.max_team_size} members).` });
            }
        }

        // Attempt insert (unique constraint catches duplicates)
        try {
            await conn.query(
                'INSERT INTO registrations (user_id, event_id, team_name) VALUES (?, ?, ?)',
                [req.user.id, eventId, event.is_team_event ? teamName : null]
            );
        } catch (err) {
            if (err.code === 'ER_DUP_ENTRY') {
                await conn.rollback();
                conn.release();
                return res.status(409).json({ message: 'You have already joined this event.' });
            }
            throw err;
        }

        await conn.query(
            'UPDATE events SET registered_count = registered_count + 1 WHERE id = ?',
            [eventId]
        );

        await conn.commit();
        conn.release();

        logger.info(`User ${req.user.id} registered for event ${eventId}`);
        res.status(201).json({ message: 'Successfully joined the event.', userId: req.user.id, eventId });
    } catch (error) {
        await conn.rollback();
        conn.release();
        logger.error('Join event error:', error);
        res.status(500).json({ message: 'Failed to join event.' });
    }
});

// DELETE /api/registrations/:eventId — leave an event
router.delete('/:eventId', authenticate, async (req, res) => {
    const pool = getDB();
    const conn = await pool.getConnection();

    try {
        await conn.beginTransaction();

        const [result] = await conn.query(
            'DELETE FROM registrations WHERE user_id = ? AND event_id = ?',
            [req.user.id, req.params.eventId]
        );

        if (result.affectedRows === 0) {
            await conn.rollback();
            conn.release();
            return res.status(404).json({ message: 'Registration not found.' });
        }

        await conn.query(
            'UPDATE events SET registered_count = GREATEST(registered_count - 1, 0) WHERE id = ?',
            [req.params.eventId]
        );

        await conn.commit();
        conn.release();

        logger.info(`User ${req.user.id} left event ${req.params.eventId}`);
        res.json({ message: 'Successfully left the event.' });
    } catch (error) {
        await conn.rollback();
        conn.release();
        logger.error('Leave event error:', error);
        res.status(500).json({ message: 'Failed to leave event.' });
    }
});

module.exports = router;
