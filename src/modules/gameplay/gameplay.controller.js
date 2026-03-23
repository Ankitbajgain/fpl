const gameplayService = require('./gameplay.service');
const catchAsync = require('../../utils/catchAsync');
const { sendSuccess } = require('../../utils/apiResponse');

const validateSquadSelection = catchAsync(async (req, res) => {
  const result = await gameplayService.validateSquadSelection(req.body);
  sendSuccess(res, 200, 'Squad validation successful', result);
});

const getTransferMeta = catchAsync(async (req, res) => {
  const result = gameplayService.calculateTransferMeta(req.body);
  sendSuccess(res, 200, 'Transfer meta calculated', result);
});

const getLivePointsForPlayer = catchAsync(async (req, res) => {
  const result = gameplayService.calculateLivePointsForPlayer(req.body);
  sendSuccess(res, 200, 'Player points calculated', result);
});

const getPredictionPoints = catchAsync(async (req, res) => {
  const result = gameplayService.predictionPoints(req.body);
  sendSuccess(res, 200, 'Prediction points calculated', { points: result });
});

const getQuizPoints = catchAsync(async (req, res) => {
  const result = gameplayService.quizPoints(req.body);
  sendSuccess(res, 200, 'Quiz points calculated', { points: result });
});

module.exports = {
  validateSquadSelection,
  getTransferMeta,
  getLivePointsForPlayer,
  getPredictionPoints,
  getQuizPoints,
};
