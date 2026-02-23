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
        const db = await getDB();
        const [rows] = await db.query('SELECT * FROM admin_todos ORDER BY created_at ASC');
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
        const db = await getDB();
        const [result] = await db.query(
            'INSERT INTO admin_todos (text, completed) VALUES (?, false)',
            [text.trim()]
        );
        res.status(201).json({
            id: result.insertId,
            text: text.trim(),
            completed: false
        });
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
        const db = await getDB();
        await db.query(
            'UPDATE admin_todos SET completed = ? WHERE id = ?',
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
        const db = await getDB();
        await db.query('DELETE FROM admin_todos WHERE id = ?', [id]);
        res.json({ message: 'Todo deleted successfully' });
    } catch (err) {
        logger.error('Error deleting admin todo:', err);
        res.status(500).json({ message: 'Internal server error' });
    }
});

module.exports = router;
