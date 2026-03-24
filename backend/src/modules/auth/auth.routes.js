const express = require('express');
const authController = require('./auth.controller');
const { protect } = require('../../middlewares/auth.middleware');

const router = express.Router();

// Register a new manager account and return an access token.
router.post('/register', authController.register);

// Log in with email and password and return an access token.
router.post('/login', authController.login);

// Get the currently logged-in user's profile.
router.get('/me', protect, authController.me);

module.exports = router;
