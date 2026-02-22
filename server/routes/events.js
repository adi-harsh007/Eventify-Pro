const express = require('express');
const { getDB } = require('../lib/db');
const { authenticate, requireAdmin } = require('../middleware/auth');
const { cacheGet, cacheSet, cacheInvalidate } = require('../lib/redis');
const logger = require('../lib/logger');

const router = express.Router();

// ── Helpers ────────────────────────────────────────

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
        const { title, description, date, time, location, capacity, category, department, imageUrl } = req.body;

        if (!title || !description || !date || !time || !location || !capacity) {
            return res.status(400).json({ message: 'Title, description, date, time, location, and capacity are required.' });
        }

        const pool = getDB();
        const [result] = await pool.query(
            `INSERT INTO events (title, description, date, time, location, capacity, category, department, image_url, organizer_id)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [title, description, date, time, location, capacity, category || 'Other', department || 'General', imageUrl || '', req.user.id]
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
        if (event.organizer_id !== req.user.id && !req.user.isAdmin) {
            return res.status(403).json({ message: 'You can only edit your own events.' });
        }

        const { title, description, date, time, location, capacity, category, department, imageUrl } = req.body;

        await pool.query(
            `UPDATE events SET title = COALESCE(?, title), description = COALESCE(?, description),
             date = COALESCE(?, date), time = COALESCE(?, time), location = COALESCE(?, location),
             capacity = COALESCE(?, capacity), category = COALESCE(?, category),
             department = COALESCE(?, department),
             image_url = COALESCE(?, image_url) WHERE id = ?`,
            [title, description, date, time, location, capacity, category, department, imageUrl, req.params.id]
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
        if (event.organizer_id !== req.user.id && !req.user.isAdmin) {
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

module.exports = router;
