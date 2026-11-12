const express = require('express');
const router = express.Router();
const { getDB } = require('../lib/db');
const { authenticate, requireAdmin } = require('../middleware/auth');
const logger = require('../lib/logger');

// Apply auth to all routes
router.use(authenticate, requireAdmin);

// Get all todos
router.get('/', async (req, res) => {
    try {
        const db = getDB();
        const { rows } = await db.query('SELECT * FROM admin_todos ORDER BY created_at ASC');
        res.json(rows);
    } catch (err) {
        logger.error('Error fetching admin todos:', err);
        res.status(500).json({ message: 'Internal server error' });
    }
});

// Create a new todo
router.post('/', async (req, res) => {
    const { text } = req.body;
    if (!text || !text.trim()) {
        return res.status(400).json({ message: 'Todo text is required' });
    }

    try {
        const db = getDB();
        const { rows } = await db.query(
            'INSERT INTO admin_todos (text, completed) VALUES ($1, false) RETURNING id, text, completed',
            [text.trim()]
        );
        res.status(201).json(rows[0]);
    } catch (err) {
        logger.error('Error creating admin todo:', err);
        res.status(500).json({ message: 'Internal server error' });
    }
});

// Update todo completion status
router.put('/:id', async (req, res) => {
    const { id } = req.params;
    const { completed } = req.body;

    try {
        const db = getDB();
        await db.query(
            'UPDATE admin_todos SET completed = $1 WHERE id = $2',
            [completed, id]
        );
        res.json({ message: 'Todo updated successfully' });
    } catch (err) {
        logger.error('Error updating admin todo:', err);
        res.status(500).json({ message: 'Internal server error' });
    }
});

// Delete a todo
router.delete('/:id', async (req, res) => {
    const { id } = req.params;

    try {
        const db = getDB();
        await db.query('DELETE FROM admin_todos WHERE id = $1', [id]);
        res.json({ message: 'Todo deleted successfully' });
    } catch (err) {
        logger.error('Error deleting admin todo:', err);
        res.status(500).json({ message: 'Internal server error' });
    }
});

module.exports = router;
