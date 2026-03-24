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
      hf.display_name AS home_team,
      af.display_name AS away_team,
      hf.team_code AS home_code,
      af.team_code AS away_code
    FROM fixtures f
    JOIN league_franchises hf ON hf.franchise_id = f.home_franchise_id AND hf.league_season_id = ?
    JOIN league_franchises af ON af.franchise_id = f.away_franchise_id AND af.league_season_id = ?
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
  // Multi-league
  getLeagues,
  getLeagueFixtures,
  getPlayersForLeague,
  // Legacy
  getActivePlayers,
  validateSquadSelection,
  getTransferMeta,
  getLivePointsForPlayer,
  getPredictionPoints,
  getQuizPoints,
};

