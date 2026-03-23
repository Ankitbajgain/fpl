const express = require('express');
const router = express.Router();

// Authentication routes: register, login, and current-user profile.
router.use('/auth', require('../../modules/auth/auth.routes'));

// Gameplay utility routes: squad validation, scoring, transfers, prediction, quiz.
router.use('/gameplay', require('../../modules/gameplay/gameplay.routes'));

module.exports = router;
