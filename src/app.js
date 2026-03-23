const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const compression = require('compression');

const v1Routes = require('./routes/v1');
const errorHandler = require('./middlewares/error.middleware');
const requestLogger = require('./middlewares/logger.middleware');
const { defaultLimiter } = require('./middlewares/rateLimiter.middleware');
const AppError = require('./utils/AppError');

const app = express();

// Security headers
app.use(helmet());

// CORS
app.use(cors({ origin: process.env.ALLOWED_ORIGINS?.split(',') || '*', credentials: true }));

// Body parsing
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true, limit: '10kb' }));

// Compress responses
app.use(compression());

// Request logging
app.use(requestLogger);

// Global rate limiter
app.use('/api', defaultLimiter);

// Routes
app.use('/api/v1', v1Routes);

// Health check
app.get('/health', (req, res) => res.status(200).json({ status: 'ok', timestamp: new Date() }));

// 404 handler
app.all('*', (req, res, next) => {
  next(new AppError(`Route ${req.originalUrl} not found`, 404));
});

// Global error handler
app.use(errorHandler);

module.exports = app;
