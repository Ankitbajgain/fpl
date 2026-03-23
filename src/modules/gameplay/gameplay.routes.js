const express = require('express');
const router = express.Router();
const gameplayController = require('./gameplay.controller');
const { protect } = require('../../middlewares/auth.middleware');

router.use(protect);
router.post('/squad/validate', gameplayController.validateSquadSelection);
router.post('/transfers/meta', gameplayController.getTransferMeta);
router.post('/points/player', gameplayController.getLivePointsForPlayer);
router.post('/prediction/points', gameplayController.getPredictionPoints);
router.post('/quiz/points', gameplayController.getQuizPoints);

module.exports = router;
