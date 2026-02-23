const express = require('express');
const router = express.Router();
const { getDB } = require('../lib/db');
const { authenticate } = require('../middleware/auth');
const logger = require('../lib/logger');

// Get mega event status
router.get('/status', authenticate, async (req, res) => {
    try {
        const db = await getDB();
        const [rows] = await db.query("SELECT status FROM mega_registrations WHERE user_id = ? AND status = 'registered'", [req.user.id]);
        res.json({ hasTicket: rows.length > 0 });
    } catch (err) {
        logger.error('Error fetching mega event status:', err);
        res.status(500).json({ message: 'Internal server error' });
    }
});

// Register for mega event
router.post('/register', authenticate, async (req, res) => {
    try {
        const db = await getDB();
        await db.query(`
            INSERT INTO mega_registrations (user_id, status) 
            VALUES (?, 'registered') 
            ON DUPLICATE KEY UPDATE status = 'registered'
        `, [req.user.id]);

        res.json({ message: 'Successfully registered for the Mega Event' });
    } catch (err) {
        logger.error('Error registering for mega event:', err);
        res.status(500).json({ message: 'Internal server error' });
    }
});

// Get lineup
router.get('/lineup', authenticate, async (req, res) => {
    try {
        const db = await getDB();
        const [rows] = await db.query('SELECT * FROM mega_event_lineup ORDER BY id ASC');
        res.json(rows);
    } catch (err) {
        logger.error('Error fetching lineup:', err);
        res.status(500).json({ message: 'Internal server error' });
    }
});

// Admin update lineup item
router.put('/admin/lineup/:id', authenticate, async (req, res) => {
    if (!req.user || !req.user.isAdmin) {
        return res.status(403).json({ message: 'Forbidden: Admin access required.' });
    }
    const { id } = req.params;
    const { day_label, title, description, event_date, event_time, icon_name } = req.body;

    try {
        const db = await getDB();
        await db.query(`
            UPDATE mega_event_lineup 
            SET day_label = ?, title = ?, description = ?, event_date = ?, event_time = ?, icon_name = ?
            WHERE id = ?
        `, [day_label, title, description, event_date, event_time, icon_name, id]);

        res.json({ message: 'Lineup updated successfully' });
    } catch (err) {
        logger.error('Error updating lineup:', err);
        res.status(500).json({ message: 'Internal server error' });
    }
});

module.exports = router;
