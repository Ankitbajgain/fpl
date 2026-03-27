const express = require('express');
const router = express.Router();
const apiReference = require('../api-reference');

router.get('/api-reference', (req, res) => {
	res.status(200).json({
		success: true,
		message: 'API reference fetched successfully',
		data: apiReference,
	});
});

// Authentication routes: register, login, and current-user profile.
router.use('/auth', require('../../modules/auth/auth.routes'));

// Gameplay utility routes: squad validation, scoring, transfers, prediction, quiz.
router.use('/gameplay', require('../../modules/gameplay/gameplay.routes'));

// Private league creation, joining, membership, and standings.
router.use('/private-leagues', require('../../modules/privateLeagues/privateLeagues.routes'));

// Admin dashboard routes: fixture management and transfer policy controls.
router.use('/admin', require('../../modules/admin/admin.routes'));

module.exports = router;
