const express = require('express');
const { protect } = require('../../middlewares/auth.middleware');
const privateLeaguesController = require('./privateLeagues.controller');

const router = express.Router();

router.use(protect);

router.get('/', privateLeaguesController.listMyLeagues);
router.post('/', privateLeaguesController.createPrivateLeague);
router.post('/join', privateLeaguesController.joinPrivateLeague);
router.get('/:leagueId', privateLeaguesController.getPrivateLeagueDetail);
router.post('/:leagueId/leave', privateLeaguesController.leavePrivateLeague);
router.delete('/:leagueId/members/:userId', privateLeaguesController.removeMember);

module.exports = router;