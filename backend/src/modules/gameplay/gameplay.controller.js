const gameplayService = require('./gameplay.service');
const catchAsync = require('../../utils/catchAsync');
const { sendSuccess } = require('../../utils/apiResponse');
const { pool } = require('../../config/mysql');

// ============================================================================
// MULTI-LEAGUE ENDPOINTS
// ============================================================================

const getLeagues = catchAsync(async (req, res) => {
  const [rows] = await pool.query(
    `SELECT 
      ls.id,
      ls.season_name,
      c.short_name AS competition,
      c.name AS competition_full,
      n.name AS nation,
      n.flag_emoji,
      ls.year,
      ls.status,
      ls.start_date,
      ls.end_date,
      COUNT(f.id) AS total_fixtures
    FROM league_seasons ls
    JOIN competitions c ON c.id = ls.competition_id
    JOIN nations n ON n.id = c.nation_id
    LEFT JOIN fixtures f ON f.league_season_id = ls.id
    WHERE ls.status IN ('active', 'draft')
    GROUP BY ls.id
    ORDER BY ls.start_date ASC`
  );

  const leagues = rows.map((row) => ({
    id: row.id,
    name: row.season_name,
    competition: row.competition,
    competitionFull: row.competition_full,
    nation: row.nation,
    flag: row.flag_emoji,
    year: row.year,
    status: row.status,
    startDate: row.start_date,
    endDate: row.end_date,
    totalFixtures: row.total_fixtures,
  }));

  sendSuccess(res, 200, 'Active leagues fetched', leagues);
});

const getLeagueFixtures = catchAsync(async (req, res) => {
  const { leagueSeasonId } = req.params;

  const [rows] = await pool.query(
    `SELECT 
      f.id,
      f.venue,
      f.starts_at,
      f.toss_at,
      f.lock_at,
      f.status,
      COALESCE(hf.display_name, fh.name) AS home_team,
      COALESCE(af.display_name, fa.name) AS away_team,
      COALESCE(hf.team_code, fh.short_name) AS home_code,
      COALESCE(af.team_code, fa.short_name) AS away_code
    FROM fixtures f
    JOIN franchises fh ON fh.id = f.home_franchise_id
    JOIN franchises fa ON fa.id = f.away_franchise_id
    LEFT JOIN league_franchises hf ON hf.franchise_id = f.home_franchise_id AND hf.league_season_id = ?
    LEFT JOIN league_franchises af ON af.franchise_id = f.away_franchise_id AND af.league_season_id = ?
    WHERE f.league_season_id = ?
    ORDER BY f.starts_at ASC`,
    [leagueSeasonId, leagueSeasonId, leagueSeasonId]
  );

  const fixtures = rows.map((row) => ({
    id: row.id,
    homeTeam: row.home_team,
    awayTeam: row.away_team,
    homeCode: row.home_code,
    awayCode: row.away_code,
    venue: row.venue,
    startsAt: row.starts_at,
    tossAt: row.toss_at,
    lockAt: row.lock_at,
    status: row.status,
  }));

  sendSuccess(res, 200, 'League fixtures fetched', fixtures);
});

const getPlayersForLeague = catchAsync(async (req, res) => {
  const { leagueSeasonId } = req.params;
  const players = await gameplayService.listPlayersForLeague(leagueSeasonId);
  sendSuccess(res, 200, 'League players fetched', players);
});

const applySquadTransfers = catchAsync(async (req, res) => {
  const { leagueSeasonId, fixtureId } = req.params;
  const result = await gameplayService.applySquadTransfers({
    userId: req.user?.id,
    leagueSeasonId,
    requestedFixtureId: Number(fixtureId),
    playerIds: req.body.playerIds,
    captainId: Number(req.body.captainId),
    viceCaptainId: Number(req.body.viceCaptainId),
    impactPlayerId: req.body.impactPlayerId ? Number(req.body.impactPlayerId) : null,
    booster: req.body.booster || 'NONE',
    budgetCap: req.body.budgetCap || 100,
  });

  sendSuccess(res, 200, 'Transfers applied successfully', result);
});

const getLeagueTransferPolicy = catchAsync(async (req, res) => {
  const { leagueSeasonId } = req.params;
  const policy = await gameplayService.getLeagueTransferPolicy(leagueSeasonId);
  sendSuccess(res, 200, 'League transfer policy fetched', policy);
});

const updateLeagueTransferPolicy = catchAsync(async (req, res) => {
  const { leagueSeasonId } = req.params;
  const policy = await gameplayService.upsertLeagueTransferPolicy({
    leagueSeasonId,
    leagueStageMatchCount: req.body.leagueStageMatchCount,
    leagueStageTransferCap: req.body.leagueStageTransferCap,
    playoffTransferCap: req.body.playoffTransferCap,
    qualifier1MatchNumber: req.body.qualifier1MatchNumber,
    unlimitedPreMatch1: req.body.unlimitedPreMatch1,
    unlimitedBetweenLeagueAndQ1: req.body.unlimitedBetweenLeagueAndQ1,
    adminUserId: req.user?.id,
  });
  sendSuccess(res, 200, 'League transfer policy updated', policy);
});

// ============================================================================
// LEGACY ENDPOINTS (Backward compatibility)
// ============================================================================

const getActivePlayers = catchAsync(async (req, res) => {
  const players = await gameplayService.listActivePlayers();
  sendSuccess(res, 200, 'Active players fetched', players);
});

const validateSquadSelection = catchAsync(async (req, res) => {
  const result = await gameplayService.validateSquadSelection(req.body);
  sendSuccess(res, 200, 'Squad validation successful', result);
});

const getTransferMeta = catchAsync(async (req, res) => {
  const result = await gameplayService.calculateTransferMeta({
    ...req.body,
    userId: req.user?.id,
  });
  sendSuccess(res, 200, 'Transfer meta calculated', result);
});

const getLivePointsForPlayer = catchAsync(async (req, res) => {
  const result = gameplayService.calculateLivePointsForPlayer({
    ...req.body,
    matchType: req.body.matchType || 'T20',
  });
  sendSuccess(res, 200, 'Player points calculated', result);
});

const getTransferWindowStatus = catchAsync(async (req, res) => {
  const { leagueSeasonId } = req.params;
  const result = await gameplayService.getTransferWindowStatus(leagueSeasonId);
  sendSuccess(res, 200, 'Transfer window status', result);
});

const finalizeMatchPoints = catchAsync(async (req, res) => {
  const { fixtureId } = req.params;
  const result = await gameplayService.finalizeMatchPoints(Number(fixtureId));
  sendSuccess(res, 200, 'Match points finalized', result);
});

const getPlayerLeaderboard = catchAsync(async (req, res) => {
  const { leagueSeasonId } = req.params;
  const limit = req.query.limit ? Number(req.query.limit) : 100;
  const result = await gameplayService.getPlayerLeaderboard(leagueSeasonId, { limit });
  sendSuccess(res, 200, 'Player leaderboard fetched', result);
});

const getManagerLeaderboard = catchAsync(async (req, res) => {
  const { leagueSeasonId } = req.params;
  const limit = req.query.limit ? Number(req.query.limit) : 100;
  const result = await gameplayService.getManagerLeaderboard(leagueSeasonId, { limit });
  sendSuccess(res, 200, 'Manager leaderboard fetched', result);
});

const getCombinedLeaderboard = catchAsync(async (req, res) => {
  const { leagueSeasonId } = req.params;
  const playersLimit = req.query.playersLimit ? Number(req.query.playersLimit) : 100;
  const managersLimit = req.query.managersLimit ? Number(req.query.managersLimit) : 100;
  const result = await gameplayService.getCombinedLeaderboard(leagueSeasonId, { playersLimit, managersLimit });
  sendSuccess(res, 200, 'Combined leaderboard fetched', result);
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
  // Multi-league
  getLeagues,
  getLeagueFixtures,
  getPlayersForLeague,
  getLeagueTransferPolicy,
  updateLeagueTransferPolicy,
  applySquadTransfers,
  getTransferWindowStatus,
  finalizeMatchPoints,
  getPlayerLeaderboard,
  getManagerLeaderboard,
  getCombinedLeaderboard,
  // Legacy
  getActivePlayers,
  validateSquadSelection,
  getTransferMeta,
  getLivePointsForPlayer,
  getPredictionPoints,
  getQuizPoints,
};

