const express = require('express');
const { getDB } = require('../lib/db');
const { authenticate, requireAdmin } = require('../middleware/auth');
const { cacheGet, cacheSet, cacheInvalidate } = require('../lib/redis');
const logger = require('../lib/logger');

const router = express.Router();

// ── Helpers ────────────────────────────────────────

const { normalizeEventDateTime } = require('../lib/date');

function decodeCursor(cursor) {
    try {
        return JSON.parse(Buffer.from(cursor, 'base64').toString('utf-8'));
    } catch { return null; }
}

function encodeCursor(row) {
    return Buffer.from(JSON.stringify({
        created_at: row.created_at,
        id: row.id
    })).toString('base64');
}

// GET /api/events/public — fetch top 5 upcoming events for landing page
router.get('/public', async (req, res) => {
    try {
        const pool = getDB();
        // Fetch top 5 upcoming events
        const [rows] = await pool.query(
            "SELECT id, title, description, date, time, location, category, image_url FROM events WHERE CONCAT(date, ' ', time) >= NOW() ORDER BY date ASC, time ASC LIMIT 5"
        );
        res.json({ events: rows });
    } catch (error) {
        logger.error('Get public events error:', error);
        res.status(500).json({ message: 'Failed to fetch public events.' });
    }
});

// GET /api/events — fetch events with cursor-based pagination
router.get('/', authenticate, async (req, res) => {
    try {
        const { cursor, limit: rawLimit } = req.query;
        const limit = Math.min(parseInt(rawLimit) || 20, 50);

        const cacheKey = `feed:global:cursor:${cursor || 'first'}:limit:${limit}`;
        const cached = await cacheGet(cacheKey);
        if (cached) return res.json(cached);

        const pool = getDB();
        let sql = 'SELECT * FROM events';
        const params = [];

        if (cursor) {
            const decoded = decodeCursor(cursor);
            if (decoded) {
                sql += ' WHERE (created_at < ?) OR (created_at = ? AND id < ?)';
                params.push(decoded.created_at, decoded.created_at, decoded.id);
            }
        }

        sql += ' ORDER BY created_at DESC, id DESC LIMIT ?';
        params.push(limit + 1);

        const [rows] = await pool.query(sql, params);
        const hasMore = rows.length > limit;
        const results = hasMore ? rows.slice(0, limit) : rows;
        const nextCursor = hasMore ? encodeCursor(results[results.length - 1]) : null;

        const response = { events: results, nextCursor, hasMore };
        await cacheSet(cacheKey, response, 60);

        res.json(response);
    } catch (error) {
        logger.error('Get events error:', error);
        res.status(500).json({ message: 'Failed to fetch events.' });
    }
});

// POST /api/events — create event (admin only)
router.post('/', authenticate, requireAdmin, async (req, res) => {
    try {
        const { title, description, date, time, location, capacity, category, department, imageUrl, is_team_event, max_team_size } = req.body;

        if (!title || !description || !date || !time || !location || !capacity) {
            return res.status(400).json({ message: 'Title, description, date, time, location, and capacity are required.' });
        }

        const pool = getDB();
        const [result] = await pool.query(
            `INSERT INTO events (title, description, date, time, location, capacity, category, department, image_url, is_team_event, max_team_size, created_by)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [title, description, date, time, location, capacity, category || 'Other', department || 'General', imageUrl || '', is_team_event || false, max_team_size || 1, req.user.id]
        );

        const [rows] = await pool.query('SELECT * FROM events WHERE id = ?', [result.insertId]);
        await cacheInvalidate('feed:*');
        await cacheInvalidate('discovery:*');

        logger.info(`Event created: ${title} (${result.insertId})`);
        res.status(201).json(rows[0]);
    } catch (error) {
        logger.error('Create event error:', error);
        res.status(500).json({ message: 'Failed to create event.' });
    }
});

// PUT /api/events/:id — edit event (creator or admin)
router.put('/:id', authenticate, async (req, res) => {
    try {
        const pool = getDB();
        const [rows] = await pool.query('SELECT * FROM events WHERE id = ?', [req.params.id]);
        if (rows.length === 0) {
            return res.status(404).json({ message: 'Event not found.' });
        }

        const event = rows[0];
        if (event.created_by !== req.user.id && !req.user.isAdmin) {
            return res.status(403).json({ message: 'You can only edit your own events.' });
        }

        const { title, description, date, time, location, capacity, category, department, imageUrl, is_team_event, max_team_size } = req.body;

        await pool.query(
            `UPDATE events SET title = COALESCE(?, title), description = COALESCE(?, description),
             date = COALESCE(?, date), time = COALESCE(?, time), location = COALESCE(?, location),
             capacity = COALESCE(?, capacity), category = COALESCE(?, category),
             department = COALESCE(?, department),
             image_url = COALESCE(?, image_url),
             is_team_event = COALESCE(?, is_team_event),
             max_team_size = COALESCE(?, max_team_size)
             WHERE id = ?`,
            [title, description, date, time, location, capacity, category, department, imageUrl, is_team_event, max_team_size, req.params.id]
        );

        const [updated] = await pool.query('SELECT * FROM events WHERE id = ?', [req.params.id]);
        await cacheInvalidate('feed:*');
        await cacheInvalidate('discovery:*');

        logger.info(`Event updated: ${updated[0].title} (${req.params.id})`);
        res.json(updated[0]);
    } catch (error) {
        logger.error('Update event error:', error);
        res.status(500).json({ message: 'Failed to update event.' });
    }
});

// DELETE /api/events/:id — delete event (creator or admin)
router.delete('/:id', authenticate, async (req, res) => {
    try {
        const pool = getDB();
        const [rows] = await pool.query('SELECT * FROM events WHERE id = ?', [req.params.id]);
        if (rows.length === 0) {
            return res.status(404).json({ message: 'Event not found.' });
        }

        const event = rows[0];
        if (event.created_by !== req.user.id && !req.user.isAdmin) {
            return res.status(403).json({ message: 'You can only delete your own events.' });
        }

        await pool.query('DELETE FROM registrations WHERE event_id = ?', [req.params.id]);
        await pool.query('DELETE FROM events WHERE id = ?', [req.params.id]);
        await cacheInvalidate('feed:*');
        await cacheInvalidate('discovery:*');

        logger.info(`Event deleted: ${event.title} (${req.params.id})`);
        res.json({ message: 'Event deleted successfully.' });
    } catch (error) {
        logger.error('Delete event error:', error);
        res.status(500).json({ message: 'Failed to delete event.' });
    }
});

// GET /api/events/:id/feedback — fetch all feedback for a specific event (visible only after event ends)
router.get('/:id/feedback', async (req, res) => {
    try {
        const pool = getDB();
        
        // Check if event exists and get its date/time
        const [eventRows] = await pool.query('SELECT date, time FROM events WHERE id = ?', [req.params.id]);
        if (eventRows.length === 0) {
            return res.status(404).json({ message: 'Event not found.' });
        }
        
        const event = eventRows[0];
        const eventDateTime = normalizeEventDateTime(event);
        if (eventDateTime > new Date()) {
            return res.json({ feedbacks: [] }); // Empty array before event ends
        }

        const [rows] = await pool.query(
            `SELECT ef.id, ef.rating, ef.comment, ef.created_at, u.name as user_name
             FROM event_feedbacks ef
             JOIN users u ON ef.user_id = u.id
             WHERE ef.event_id = ?
             ORDER BY ef.created_at DESC`,
            [req.params.id]
        );
        res.json({ feedbacks: rows });
    } catch (error) {
        logger.error('Get event feedback error:', error);
        res.status(500).json({ message: 'Failed to fetch event feedback.' });
    }
});

// POST /api/events/:id/feedback — submit feedback for a specific event (only registered & ended)
router.post('/:id/feedback', authenticate, async (req, res) => {
    try {
        const { rating, comment } = req.body;
        const eventId = req.params.id;
        const userId = req.user.id;

        if (!rating || !comment) {
            return res.status(400).json({ message: 'Rating and comment are required.' });
        }

        const parsedRating = parseInt(rating);
        if (isNaN(parsedRating) || parsedRating < 1 || parsedRating > 5) {
            return res.status(400).json({ message: 'Rating must be between 1 and 5.' });
        }

        const pool = getDB();
        
        // Check if event exists and get date/time
        const [eventRows] = await pool.query('SELECT date, time FROM events WHERE id = ?', [eventId]);
        if (eventRows.length === 0) {
            return res.status(404).json({ message: 'Event not found.' });
        }

        const event = eventRows[0];
        const eventDateTime = normalizeEventDateTime(event);
        if (eventDateTime > new Date()) {
            return res.status(400).json({ message: 'You can only review an event after it has ended!' });
        }

        // Verify that the user is registered for the event
        const [regRows] = await pool.query(
            'SELECT id FROM registrations WHERE event_id = ? AND user_id = ?',
            [eventId, userId]
        );
        if (regRows.length === 0) {
            return res.status(403).json({ message: 'Only registered attendees can leave feedback for this event!' });
        }

        // Insert new feedback
        try {
            await pool.query(
                'INSERT INTO event_feedbacks (event_id, user_id, rating, comment) VALUES (?, ?, ?, ?)',
                [eventId, userId, parsedRating, comment]
            );
        } catch (dbErr) {
            if (dbErr.code === 'ER_DUP_ENTRY') {
                return res.status(400).json({ message: 'You have already submitted feedback for this event!' });
            }
            throw dbErr;
        }

        // Fetch user info for real-time frontend update response
        const [feedbackRows] = await pool.query(
            `SELECT ef.id, ef.rating, ef.comment, ef.created_at, u.name as user_name
             FROM event_feedbacks ef
             JOIN users u ON ef.user_id = u.id
             WHERE ef.event_id = ? AND ef.user_id = ?`,
            [eventId, userId]
        );

        logger.info(`Event feedback submitted by User ID ${userId} for Event ID ${eventId}`);
        res.status(201).json({ feedback: feedbackRows[0] });
    } catch (error) {
        logger.error('Submit event feedback error:', error);
        res.status(500).json({ message: 'Failed to submit event feedback.' });
    }
});

module.exports = router;
