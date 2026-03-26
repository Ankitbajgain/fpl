const rateLimit = require('express-rate-limit');

const defaultWindowMs = Number(process.env.RATE_LIMIT_WINDOW_MS || 15 * 60 * 1000);
const defaultMax = Number(process.env.RATE_LIMIT_MAX || 300);
const disableLimiter = process.env.RATE_LIMIT_DISABLE === '1' || process.env.NODE_ENV === 'development';

const defaultLimiter = rateLimit({
  windowMs: defaultWindowMs,
  max: defaultMax,
  standardHeaders: true,
  legacyHeaders: false,
  // Polling endpoints are read-only and intentionally frequent in FE/dashboard.
  skip: (req) => {
    if (disableLimiter) return true;
    const p = req.path || '';
    return p.includes('/gameplay/leagues/')
      && (p.endsWith('/transfer-window') || p.endsWith('/leaderboard/players'));
  },
  message: { success: false, message: 'Too many requests, please try again later.' },
});

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  skip: () => disableLimiter,
  message: { success: false, message: 'Too many auth attempts. Please try again after 15 minutes.' },
});

module.exports = { defaultLimiter, authLimiter };
