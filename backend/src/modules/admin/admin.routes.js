const express = require('express');
const router = express.Router();
const adminController = require('./admin.controller');
const { protect, restrictTo } = require('../../middlewares/auth.middleware');

router.use(protect);
router.use(restrictTo('admin'));

router.get('/leagues/:leagueSeasonId/franchises', adminController.getLeagueFranchises);

router.get('/leagues/:leagueSeasonId/fixtures', adminController.getLeagueFixtures);
router.post('/leagues/:leagueSeasonId/fixtures', adminController.createLeagueFixture);
router.put('/leagues/:leagueSeasonId/fixtures/:fixtureId', adminController.updateLeagueFixture);
router.delete('/leagues/:leagueSeasonId/fixtures/:fixtureId', adminController.deleteLeagueFixture);
router.post('/leagues/:leagueSeasonId/fixtures/sync', adminController.syncLeagueFixtures);

router.get('/leagues/:leagueSeasonId/transfers/policy', adminController.getLeagueTransferPolicy);
router.put('/leagues/:leagueSeasonId/transfers/policy', adminController.updateLeagueTransferPolicy);

// Push player stats for a fixture (before or after COMPLETED)
router.post('/leagues/:leagueSeasonId/fixtures/:fixtureId/stats', adminController.upsertMatchStats);

// Finalize and persist fantasy points for all squads in a completed fixture
router.post('/leagues/:leagueSeasonId/fixtures/:fixtureId/finalize-points', adminController.triggerFinalizePoints);

module.exports = router;
