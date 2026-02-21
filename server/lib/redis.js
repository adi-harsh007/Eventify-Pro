const Redis = require('ioredis');
const logger = require('./logger');

let redisClient = null;

/**
 * Initialize Redis connection.
 * Redis is treated as optional — the app degrades gracefully if Redis is unavailable.
 */
function initRedis() {
    const redisUrl = process.env.REDIS_URL || 'redis://127.0.0.1:6379';

    redisClient = new Redis(redisUrl, {
        maxRetriesPerRequest: 3,
        retryStrategy(times) {
            if (times > 5) {
                logger.warn('Redis: max retries reached, giving up reconnection.');
                return null; // stop retrying
            }
            return Math.min(times * 200, 2000);
        },
        lazyConnect: true
    });

    redisClient.on('connect', () => logger.info('✅ Connected to Redis'));
    redisClient.on('error', (err) => logger.error('Redis connection error:', err.message));

    // Attempt connection but don't block startup
    redisClient.connect().catch((err) => {
        logger.warn(`Redis unavailable (${err.message}). Running without cache/rate-limit.`);
        redisClient = null;
    });

    return redisClient;
}

/**
 * Get the active Redis client (may be null if Redis is unavailable).
 */
function getRedis() {
    return redisClient;
}

/**
 * Safe cache GET — returns null on failure instead of throwing.
 */
async function cacheGet(key) {
    if (!redisClient) return null;
    try {
        const data = await redisClient.get(key);
        return data ? JSON.parse(data) : null;
    } catch (err) {
        logger.error(`Cache GET error for key ${key}:`, err.message);
        return null;
    }
}

/**
 * Safe cache SET — fails silently on error (circuit-breaking per Section 5.3).
 */
async function cacheSet(key, value, ttlSeconds = 60) {
    if (!redisClient) return;
    try {
        await redisClient.set(key, JSON.stringify(value), 'EX', ttlSeconds);
    } catch (err) {
        logger.error(`Cache SET error for key ${key}:`, err.message);
    }
}

/**
 * Safe cache invalidation — best-effort deletion using SCAN (#11).
 * Uses cursor-based SCAN instead of blocking KEYS command.
 */
async function cacheInvalidate(pattern) {
    if (!redisClient) return;
    try {
        let cursor = '0';
        do {
            const [nextCursor, keys] = await redisClient.scan(cursor, 'MATCH', pattern, 'COUNT', 100);
            cursor = nextCursor;
            if (keys.length > 0) {
                await redisClient.del(...keys);
            }
        } while (cursor !== '0');
    } catch (err) {
        logger.error(`Cache invalidation error for pattern ${pattern}:`, err.message);
    }
}

module.exports = { initRedis, getRedis, cacheGet, cacheSet, cacheInvalidate };
