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

const getCountryFromFranchise = (shortName) => {
  const countryMap = {
    MI: 'India',
    CSK: 'India',
    RCB: 'India',
    KKR: 'India',
    DC: 'India',
    RR: 'India',
    PBKS: 'India',
    SRH: 'India',
    GT: 'India',
    LSG: 'India',
    DMU: 'India',
    IND: 'India',
    AUS: 'Australia',
    ENG: 'England',
    NEP: 'Nepal',
    NZ: 'New Zealand',
    SA: 'South Africa',
    PAK: 'Pakistan',
    BAN: 'Bangladesh',
    SL: 'Sri Lanka',
    AFG: 'Afghanistan',
    WI: 'West Indies',
    IRE: 'Ireland',
    NED: 'Netherlands',
  };
  return countryMap[shortName] || 'Unknown';
};

// Get players for a specific league season
const listPlayersForLeague = async (leagueSeasonId) => {
  try {
    const [rows] = await pool.query(
      `SELECT 
        p.id,
        p.full_name,
        p.role,
        lsp.base_credits AS credits,
        lf.team_code AS team,
        COALESCE(n.name, 'Unknown') AS country
       FROM league_season_players lsp
       JOIN players p ON p.id = lsp.player_id
       JOIN league_franchises lf ON lf.id = lsp.league_franchise_id
       LEFT JOIN player_nationalities pn ON pn.player_id = p.id
       LEFT JOIN nations n ON n.id = pn.nation_id
       WHERE lsp.league_season_id = ? AND lsp.is_active = 1
       ORDER BY p.role, lsp.base_credits DESC, p.full_name ASC`,
      [leagueSeasonId]
    );

    return rows.map((row) => ({
      id: Number(row.id),
      name: row.full_name,
      role: row.role,
      credits: Number(row.credits),
      team: row.team,
      country: row.country,
    }));
  } catch (error) {
    console.error('Error fetching league players:', error);
    throw error;
  }
};

// Fallback for backward compatibility (single league)
const listActivePlayers = async () => {
  const [rows] = await pool.query(
    `SELECT p.id, p.full_name, p.role, p.credit_price, f.short_name AS team
     FROM players p
     INNER JOIN franchises f ON f.id = p.franchise_id
     WHERE p.is_active = 1
     ORDER BY p.role, p.credit_price DESC, p.full_name ASC`
  );

  return rows.map((row) => ({
    id: Number(row.id),
    name: row.full_name,
    role: row.role,
    credits: Number(row.credit_price),
    team: row.team,
    country: getCountryFromFranchise(row.team),
  }));
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
  listActivePlayers,
  listPlayersForLeague,
  validateSquadSelection,
  calculateTransferMeta,
  calculateLivePointsForPlayer,
  predictionPoints,
  quizPoints,
};
