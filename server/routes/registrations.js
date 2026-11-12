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
        const { rows } = await pool.query(
            'SELECT * FROM registrations WHERE user_id = $1',
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
        const { rows } = await pool.query('SELECT * FROM registrations');
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
        const { rows } = await pool.query('SELECT id, name, email, created_at FROM users');
        res.json(rows);
    } catch (error) {
        logger.error('Get users error:', error);
        res.status(500).json({ message: 'Failed to fetch users.' });
    }
});

/**
 * POST /api/registrations — join an event
 * Uses PostgreSQL transaction + SELECT … FOR UPDATE to prevent overbooking.
 */
router.post('/', authenticate, async (req, res) => {
    const { eventId, teamName } = req.body;
    if (!eventId) {
        return res.status(400).json({ message: 'Event ID is required.' });
    }

    const pool = getDB();
    const client = await pool.connect();
    let inTx = false;

    try {
        await client.query('BEGIN');
        inTx = true;

        // Lock the event row
        const { rows: events } = await client.query(
            'SELECT id, date, time, capacity, registered_count, is_team_event, max_team_size FROM events WHERE id = $1 FOR UPDATE',
            [eventId]
        );

        if (events.length === 0) {
            await client.query('ROLLBACK');
            inTx = false;
            return res.status(404).json({ message: 'Event not found.' });
        }

        const event = events[0];

        try {
            const eventDateTime = normalizeEventDateTime({
                date: event.date,
                time: event.time
            });
            if (eventDateTime <= new Date()) {
                await client.query('ROLLBACK');
                inTx = false;
                return res.status(400).json({ message: 'This event has already ended. Registration is closed.' });
            }
        } catch (err) {
            logger.error(`Error parsing event date/time for registration (Event ID: ${eventId}):`, err);
        }

        if (event.registered_count >= event.capacity) {
            await client.query('ROLLBACK');
            inTx = false;
            return res.status(400).json({ message: 'This event is at full capacity.' });
        }

        if (event.is_team_event) {
            if (!teamName) {
                await client.query('ROLLBACK');
                inTx = false;
                return res.status(400).json({ message: 'A team name is required for this event.' });
            }

            // Event row FOR UPDATE already serializes concurrent joins for this event
            const { rows: teamCounts } = await client.query(
                'SELECT COUNT(*)::int AS member_count FROM registrations WHERE event_id = $1 AND team_name = $2',
                [eventId, teamName]
            );

            if (teamCounts[0].member_count >= event.max_team_size) {
                await client.query('ROLLBACK');
                inTx = false;
                return res.status(400).json({ message: `Team "${teamName}" is already full (max ${event.max_team_size} members).` });
            }
        }

        // Attempt insert (unique constraint catches duplicates)
        try {
            await client.query(
                'INSERT INTO registrations (user_id, event_id, team_name) VALUES ($1, $2, $3)',
                [req.user.id, eventId, event.is_team_event ? teamName : null]
            );
        } catch (err) {
            if (err.code === '23505') {
                await client.query('ROLLBACK');
                inTx = false;
                return res.status(409).json({ message: 'You have already joined this event.' });
            }
            throw err;
        }

        await client.query(
            'UPDATE events SET registered_count = registered_count + 1 WHERE id = $1',
            [eventId]
        );

        await client.query('COMMIT');
        inTx = false;

        logger.info(`User ${req.user.id} registered for event ${eventId}`);
        res.status(201).json({ message: 'Successfully joined the event.', userId: req.user.id, eventId });
    } catch (error) {
        if (inTx) {
            try { await client.query('ROLLBACK'); } catch (_) { /* ignore rollback errors */ }
        }
        logger.error('Join event error:', error);
        res.status(500).json({ message: 'Failed to join event.' });
    } finally {
        client.release();
    }
});

// DELETE /api/registrations/:eventId — leave an event
router.delete('/:eventId', authenticate, async (req, res) => {
    const pool = getDB();
    const client = await pool.connect();
    let inTx = false;

    try {
        await client.query('BEGIN');
        inTx = true;

        const result = await client.query(
            'DELETE FROM registrations WHERE user_id = $1 AND event_id = $2',
            [req.user.id, req.params.eventId]
        );

        if (result.rowCount === 0) {
            await client.query('ROLLBACK');
            inTx = false;
            return res.status(404).json({ message: 'Registration not found.' });
        }

        await client.query(
            'UPDATE events SET registered_count = GREATEST(registered_count - 1, 0) WHERE id = $1',
            [req.params.eventId]
        );

        await client.query('COMMIT');
        inTx = false;

        logger.info(`User ${req.user.id} left event ${req.params.eventId}`);
        res.json({ message: 'Successfully left the event.' });
    } catch (error) {
        if (inTx) {
            try { await client.query('ROLLBACK'); } catch (_) { /* ignore rollback errors */ }
        }
        logger.error('Leave event error:', error);
        res.status(500).json({ message: 'Failed to leave event.' });
    } finally {
        client.release();
    }
});

module.exports = router;
