const express = require('express');
const authController = require('./auth.controller');
const { protect } = require('../../middlewares/auth.middleware');
const { authLimiter } = require('../../middlewares/rateLimiter.middleware');

const router = express.Router();

// Register a new manager account and return an access token.
router.post('/register', authLimiter, authController.register);

// Log in with email and password and return an access token.
router.post('/login', authLimiter, authController.login);

// Get the currently logged-in user's profile.
router.get('/me', protect, authController.me);

module.exports = router;
