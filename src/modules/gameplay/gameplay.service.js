const { pool } = require('../../config/mysql');
const {
  validateSquad,
  isSquadLocked,
  transferPenalty,
  applyBooster,
  calculateCricketFantasyPoints,
} = require('./gameplay.rules');

const getPlayersByIds = async (playerIds) => {
  if (!playerIds.length) return [];
  const placeholders = playerIds.map(() => '?').join(',');
  const [rows] = await pool.query(
    `SELECT id, role, franchise_id, credit_price FROM players WHERE id IN (${placeholders}) AND is_active = 1`,
    playerIds
  );
  return rows;
};

const validateSquadSelection = async ({ playerIds, captainId, viceCaptainId, budgetCap = 100 }) => {
  const players = await getPlayersByIds(playerIds);
  if (players.length !== playerIds.length) {
    throw new Error('One or more selected players are invalid or inactive');
  }
  return validateSquad({ players, captainId, viceCaptainId, budgetCap });
};

const calculateTransferMeta = ({ usedTransfers, freeTransfers, fixtureStartAt, tossAt }) => {
  const locked = isSquadLocked({ fixtureStartAt, tossAt, lockMinutesBeforeToss: 30 });
  const penalty = transferPenalty({ usedTransfers, freeTransfers, penaltyPerTransfer: 4 });
  return { locked, penalty };
};

const calculateLivePointsForPlayer = ({ stats, teamWon, isAway, isCaptain, isViceCaptain, booster }) => {
  const basePoints = calculateCricketFantasyPoints({ stats, teamWon, isAway });
  const boostedPoints = applyBooster({ basePoints, isCaptain, isViceCaptain, booster });
  return { basePoints, boostedPoints };
};

const predictionPoints = ({ predicted, actual }) => {
  let points = 0;
  if (predicted.tossWinnerId && predicted.tossWinnerId === actual.tossWinnerId) points += 5;
  if (predicted.matchWinnerId && predicted.matchWinnerId === actual.matchWinnerId) points += 10;
  if (predicted.motmPlayerId && predicted.motmPlayerId === actual.motmPlayerId) points += 12;
  if (predicted.topScorerId && predicted.topScorerId === actual.topScorerId) points += 8;
  if (predicted.topWicketTakerId && predicted.topWicketTakerId === actual.topWicketTakerId) points += 8;
  return points;
};

const quizPoints = ({ selectedOption, correctOption, answeredAt, startsAt, endsAt, maxPoints = 5 }) => {
  const inWindow = new Date(answeredAt) >= new Date(startsAt) && new Date(answeredAt) <= new Date(endsAt);
  if (!inWindow) return 0;
  return selectedOption === correctOption ? maxPoints : 0;
};

module.exports = {
  validateSquadSelection,
  calculateTransferMeta,
  calculateLivePointsForPlayer,
  predictionPoints,
  quizPoints,
};
