const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const multer = require('multer'); // Added multer
const fs = require('fs'); // Added fs
const { GoogleGenAI } = require('@google/genai');

const logger = require('./lib/logger');
const { initDB, getDB } = require('./lib/db');
const { initRedis, getRedis } = require('./lib/redis');
const { authenticate } = require('./middleware/auth');
const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');

// Routes
const authRoutes = require('./routes/auth');
const eventRoutes = require('./routes/events');
const registrationRoutes = require('./routes/registrations');
const discoveryRoutes = require('./routes/discovery');
const adminRoutes = require('./routes/admin');
const megaEventsRoutes = require('./routes/mega-events');
const adminTodosRoutes = require('./routes/admin-todos');

const app = express();
const PORT = process.env.PORT || 3000;

// ── Middleware ───────────────────────────────────────
app.use(cors({
    origin: process.env.CORS_ORIGIN || 'http://localhost:5173',
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(helmet({
    crossOriginOpenerPolicy: { policy: "same-origin-allow-popups" }
}));
app.use(express.json({ limit: '1mb' }));  // #11: Prevent oversized payloads

// Cloudinary Config
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

const storage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: {
        folder: 'eventify_pro_uploads',
        allowed_formats: ['jpg', 'jpeg', 'png', 'webp', 'gif'],
        transformation: [{ width: 1000, crop: 'limit' }] // basic optimization
    }
});

const upload = multer({
    storage,
    limits: { fileSize: 5 * 1024 * 1024 } // 5MB max
});

const limiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 200,
    standardHeaders: true,
    legacyHeaders: false,
    message: { message: 'Too many requests, please try again later.' },
    validate: false
});
app.use(limiter);

// Auth-specific strict rate limiter (#9: prevent brute force on login/signup/OTP)
const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 15, // Max 15 auth requests per 15 min per IP
    message: { message: 'Too many authentication attempts. Please try again later.' }
});
app.use('/api/auth', authLimiter);

// ── Routes ──────────────────────────────────────────

// AI Route with strict rate limiting
const aiLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 5, // Limit each IP to 5 AI requests per window
    message: { message: 'Too many AI generation requests from this IP, please try again after 15 minutes.' }
});

app.post('/api/ai/generate', aiLimiter, async (req, res) => {
    try {
        const apiKey = process.env.VITE_GEMINI_API_KEY || process.env.GEMINI_API_KEY;
        if (!apiKey) {
            return res.status(500).json({ message: 'API key not configured on server.' });
        }

        const { title, category } = req.body;
        if (!title || !category) {
            return res.status(400).json({ message: 'Title and category are required.' });
        }

        // #12: Sanitize inputs before sending to AI
        const safeTitle = String(title).slice(0, 200).replace(/[<>]/g, '');
        const safeCategory = String(category).slice(0, 100).replace(/[<>]/g, '');

        const ai = new GoogleGenAI({ apiKey });
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: `Generate a compelling, professional 3-sentence description for an event titled "${safeTitle}" in the "${safeCategory}" category. Focus on why people should attend.`,
            config: {
                temperature: 0.7,
                topK: 40,
                topP: 0.95,
            },
        });

        res.json({ description: response.text || "No description generated." });
    } catch (error) {
        logger.error("Backend Gemini Error:", error);
        res.status(500).json({ message: "Failed to generate description. Please write manually." });
    }
});

// Image upload endpoint (#5: require authentication, migrated to Cloudinary)
app.post('/api/upload', authenticate, upload.single('image'), (req, res) => {
    if (!req.file) {
        return res.status(400).json({ message: 'No file uploaded or invalid file type.' });
    }
    // Cloudinary adds the secure URL to req.file.path
    const imageUrl = req.file.path;
    res.json({ imageUrl });
});

app.use('/api/auth', authRoutes);
app.use('/api/events', eventRoutes);
app.use('/api/registrations', registrationRoutes);
app.use('/api/discovery', discoveryRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/mega-events', megaEventsRoutes);
app.use('/api/admin-todos', adminTodosRoutes);

app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
// ── Health check (#9: minimal public response) ────────────────────
app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// ── 404 handler ─────────────────────────────────────
app.use((req, res) => {
    res.status(404).json({ message: `Route not found: ${req.method} ${req.originalUrl}` });
});

// ── Error handler ───────────────────────────────────
app.use((err, req, res, next) => {
    logger.error('Unhandled error:', err);
    res.status(500).json({ message: 'Internal server error.' });
});

// ── Start ───────────────────────────────────────────
async function start() {
    try {
        // Init MySQL & run migrations
        await initDB();

        // Init Redis (optional)
        await initRedis();

        app.listen(PORT, () => {
            logger.info(`🚀 Server running on port ${PORT}`);
        });
    } catch (error) {
        logger.error('❌ Failed to start server:', error);
        process.exit(1);
    }
}

start();
