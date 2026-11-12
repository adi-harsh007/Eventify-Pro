const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const multer = require('multer');
const jwt = require('jsonwebtoken');
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
const feedbackRoutes = require('./routes/feedback');

const app = express();

// Trust the reverse proxy (e.g., Render, Heroku)
// Required for express-rate-limit to accurately identify users' IPs
app.set('trust proxy', 1);

const PORT = process.env.PORT || 3000;

// ── Middleware ───────────────────────────────────────
app.use(cors({
    origin: process.env.CORS_ORIGIN || 'http://localhost:5173',
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(helmet({
    crossOriginOpenerPolicy: false
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

// EventBot Chat Store (in-memory tracking)
const chatUsageStore = new Map();

const CLEANUP_INTERVAL_MS = 15 * 60 * 1000;
const STALE_TTL_MS = 60 * 60 * 1000;
const usageCleanupTimer = setInterval(() => {
    const now = Date.now();
    for (const [key, value] of chatUsageStore.entries()) {
        if (now - value.lastSeen > STALE_TTL_MS) {
            chatUsageStore.delete(key);
        }
    }
}, CLEANUP_INTERVAL_MS);

process.on('SIGTERM', () => clearInterval(usageCleanupTimer));
process.on('SIGINT', () => clearInterval(usageCleanupTimer));

app.post('/api/ai/chat', aiLimiter, async (req, res) => {
    try {
        const apiKey = process.env.VITE_GEMINI_API_KEY || process.env.GEMINI_API_KEY;
        if (!apiKey) return res.status(500).json({ message: 'API key not configured.' });

        const { message, history = [] } = req.body;
        if (!message) return res.status(400).json({ message: 'Message is required.' });

        // Determine identity
        let identityKey = req.ip;
        let isGuest = true;
        
        const authHeader = req.headers.authorization;
        if (authHeader && authHeader.startsWith('Bearer ')) {
            const token = authHeader.split(' ')[1];
            try {
                const payload = jwt.verify(token, process.env.JWT_SECRET);
                identityKey = `user_${payload.id || payload.sub || token}`;
                isGuest = false;
            } catch (err) {
                // Invalid token, treat as guest
            }
        }

        // Enforce Limits
        const limit = isGuest ? 1 : 5;
        const currentData = chatUsageStore.get(identityKey) || { count: 0, lastSeen: Date.now() };
        const currentCount = currentData.count;
        
        chatUsageStore.set(identityKey, { ...currentData, lastSeen: Date.now() });
        
        if (currentCount >= limit) {
            return res.status(429).json({ 
                message: isGuest 
                    ? 'Guest limit reached. Please log in to continue chatting.' 
                    : 'Session limit reached. Please log in again to start a new chat session.',
                limitReached: true,
                isGuest
            });
        }

        // Sanitize input
        const safeMessage = String(message).slice(0, 500);

        const ai = new GoogleGenAI({ apiKey });
        
        const systemInstruction = `You are EventBot, the official AI assistant for Eventify Pro. 
Your goal is to answer questions strictly related to the Eventify Pro platform, campus events, scheduling, and event management. 
If a user asks about topics completely unrelated to Eventify Pro or events (e.g., coding help, general knowledge, math), politely decline and state that you are only here to help with Eventify Pro. Do not answer unnecessary questions. Keep your answers concise and helpful.`;

        // Format history for Gemini API
        const formattedHistory = history.map(msg => ({
            role: msg.role === 'bot' ? 'model' : 'user',
            parts: [{ text: msg.text }]
        }));

        formattedHistory.push({
            role: 'user',
            parts: [{ text: safeMessage }]
        });

        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: formattedHistory,
            config: {
                systemInstruction: systemInstruction,
                temperature: 0.5,
            },
        });

        // Increment count on success
        chatUsageStore.set(identityKey, { count: currentCount + 1, lastSeen: Date.now() });

        res.json({ 
            reply: response.text || "I'm sorry, I couldn't process that.",
            remaining: limit - (currentCount + 1)
        });

    } catch (error) {
        logger.error("EventBot Chat Error:", error);
        res.status(500).json({ message: "Failed to process chat. Please try again." });
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
app.use('/api/feedback', feedbackRoutes);

// ── Health check (#9: minimal public response) ────────────────────
app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.get('/api/health/db', async (req, res) => {
    try {
        const db = getDB();
        const { rows: tables } = await db.query(
            "SELECT tablename FROM pg_tables WHERE schemaname = 'public' ORDER BY tablename"
        );
        res.json({ tables });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
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
        // Init PostgreSQL & run migrations
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
