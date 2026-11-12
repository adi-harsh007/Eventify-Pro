const express = require('express');
const { getDB } = require('../lib/db');
const { cacheGet, cacheSet } = require('../lib/redis');
const logger = require('../lib/logger');

const router = express.Router();

/**
 * GET /api/discovery — Global Discovery Endpoint
 * Returns all events with cursor-based pagination and Redis caching.
 */
router.get('/', async (req, res) => {
    try {
        const { cursor, limit: rawLimit } = req.query;
        const limit = Math.min(parseInt(rawLimit, 10) || 20, 50);

        const cacheKey = `discovery:cursor:${cursor || 'first'}:limit:${limit}`;
        const cached = await cacheGet(cacheKey);
        if (cached) return res.json(cached);

        const pool = getDB();
        let sql = 'SELECT id, title, description, date, time, location, capacity, registered_count, category, image_url, created_at FROM events';
        const params = [];

        if (cursor) {
            try {
                const decoded = JSON.parse(Buffer.from(cursor, 'base64').toString('utf-8'));
                params.push(decoded.created_at, decoded.id);
                sql += ' WHERE (created_at < $1) OR (created_at = $1 AND id < $2)';
            } catch {
                // Invalid cursor, ignore
            }
        }

        params.push(limit + 1);
        sql += ` ORDER BY created_at DESC, id DESC LIMIT $${params.length}`;

        const { rows } = await pool.query(sql, params);
        const hasMore = rows.length > limit;
        const results = hasMore ? rows.slice(0, limit) : rows;
        const nextCursor = hasMore
            ? Buffer.from(JSON.stringify({
                created_at: results[results.length - 1].created_at,
                id: results[results.length - 1].id
            })).toString('base64')
            : null;

        const response = { events: results, nextCursor, hasMore };
        await cacheSet(cacheKey, response, 60);

        res.json(response);
    } catch (error) {
        logger.error('Discovery endpoint error:', error);
        res.status(500).json({ message: 'Failed to fetch discovery feed.' });
    }
});

module.exports = router;
