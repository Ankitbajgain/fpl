const express = require('express');
const router = express.Router();
const gameplayController = require('./gameplay.controller');
const { protect } = require('../../middlewares/auth.middleware');

// All gameplay routes require a valid bearer token.
router.use(protect);

// ============================================================================
// MULTI-LEAGUE ENDPOINTS
// ============================================================================

// Get all active competitions/leagues
router.get('/leagues', gameplayController.getLeagues);

// Get fixtures for a specific league
router.get('/leagues/:leagueSeasonId/fixtures', gameplayController.getLeagueFixtures);

// Fetch players for a specific league season (replaces generic /players for multi-league)
router.get('/leagues/:leagueSeasonId/players', gameplayController.getPlayersForLeague);

// ============================================================================
// LEGACY ENDPOINTS (Backward compatibility)
// ============================================================================

// Fetch all active players for frontend squad builder tabs.
router.get('/players', gameplayController.getActivePlayers);

// Check whether a selected squad satisfies budget, role, and franchise constraints.
router.post('/squad/validate', gameplayController.validateSquadSelection);

// Calculate lock status and transfer penalty for a fixture window.
router.post('/transfers/meta', gameplayController.getTransferMeta);

// Calculate fantasy points for a single player's live match stats.
router.post('/points/player', gameplayController.getLivePointsForPlayer);

// Calculate prediction game points from predicted vs actual results.
router.post('/prediction/points', gameplayController.getPredictionPoints);

// Calculate quiz mode points, including timer-window validation.
router.post('/quiz/points', gameplayController.getQuizPoints);

module.exports = router;
