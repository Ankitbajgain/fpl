const { pool } = require('../../config/mysql');
const AppError = require('../../utils/AppError');

const listLeagueFranchises = async (leagueSeasonId) => {
  const [rows] = await pool.query(
    `SELECT lf.id, lf.franchise_id, lf.display_name, lf.team_code, f.name, f.short_name
     FROM league_franchises lf
     JOIN franchises f ON f.id = lf.franchise_id
     WHERE lf.league_season_id = ? AND lf.is_active = 1
     ORDER BY lf.team_code ASC, f.name ASC`,
    [leagueSeasonId]
  );

  return rows.map((row) => ({
    id: Number(row.id),
    franchiseId: Number(row.franchise_id),
    teamCode: row.team_code || row.short_name,
    displayName: row.display_name || row.name,
  }));
};

const listLeagueFixturesAdmin = async (leagueSeasonId) => {
  const [rows] = await pool.query(
    `SELECT
      f.id,
      f.league_season_id,
      f.home_franchise_id,
      f.away_franchise_id,
      f.venue,
      f.match_type,
      f.starts_at,
      f.toss_at,
      f.lock_at,
      f.status,
      f.ended_at,
      f.transfer_window_opens_at,
      COALESCE(lfh.team_code, fh.short_name) AS home_code,
      COALESCE(lfa.team_code, fa.short_name) AS away_code,
      COALESCE(lfh.display_name, fh.name) AS home_name,
      COALESCE(lfa.display_name, fa.name) AS away_name
     FROM fixtures f
     JOIN franchises fh ON fh.id = f.home_franchise_id
     JOIN franchises fa ON fa.id = f.away_franchise_id
     LEFT JOIN league_franchises lfh ON lfh.league_season_id = f.league_season_id AND lfh.franchise_id = f.home_franchise_id
     LEFT JOIN league_franchises lfa ON lfa.league_season_id = f.league_season_id AND lfa.franchise_id = f.away_franchise_id
     WHERE f.league_season_id = ?
     ORDER BY f.starts_at ASC, f.id ASC`,
    [leagueSeasonId]
  );

  return rows.map((row) => ({
    id: Number(row.id),
    leagueSeasonId: row.league_season_id,
    homeFranchiseId: Number(row.home_franchise_id),
    awayFranchiseId: Number(row.away_franchise_id),
    homeCode: row.home_code,
    awayCode: row.away_code,
    homeName: row.home_name,
    awayName: row.away_name,
    venue: row.venue,
    matchType: row.match_type || 'T20',
    startsAt: row.starts_at,
    tossAt: row.toss_at,
    lockAt: row.lock_at,
    status: row.status,
    endedAt: row.ended_at || null,
    transferWindowOpensAt: row.transfer_window_opens_at || null,
  }));
};

const ensureLeagueExists = async (leagueSeasonId) => {
  const [rows] = await pool.query('SELECT id FROM league_seasons WHERE id = ? LIMIT 1', [leagueSeasonId]);
  if (!rows.length) throw new AppError('League season not found', 404);
};

const validateFixturePayload = async ({ leagueSeasonId, homeFranchiseId, awayFranchiseId, startsAt, tossAt, lockAt }) => {
  await ensureLeagueExists(leagueSeasonId);

  if (!homeFranchiseId || !awayFranchiseId) throw new AppError('homeFranchiseId and awayFranchiseId are required', 400);
  if (Number(homeFranchiseId) === Number(awayFranchiseId)) throw new AppError('Home and away teams must be different', 400);
  if (!startsAt) throw new AppError('startsAt is required', 400);

  const [leagueFranchiseRows] = await pool.query(
    `SELECT franchise_id
     FROM league_franchises
     WHERE league_season_id = ? AND franchise_id IN (?, ?)` ,
    [leagueSeasonId, Number(homeFranchiseId), Number(awayFranchiseId)]
  );

  if (leagueFranchiseRows.length !== 2) {
    throw new AppError('One or both franchises are not mapped to this league season', 400);
  }

  const startsAtDate = new Date(startsAt);
  if (Number.isNaN(startsAtDate.getTime())) throw new AppError('Invalid startsAt date', 400);

  const tossAtDate = tossAt ? new Date(tossAt) : new Date(startsAtDate.getTime() - 30 * 60 * 1000);
  if (Number.isNaN(tossAtDate.getTime())) throw new AppError('Invalid tossAt date', 400);

  const lockAtDate = lockAt ? new Date(lockAt) : new Date(startsAtDate.getTime() - 15 * 60 * 1000);
  if (Number.isNaN(lockAtDate.getTime())) throw new AppError('Invalid lockAt date', 400);

  return {
    startsAtDate,
    tossAtDate,
    lockAtDate,
  };
};

const createFixture = async ({
  leagueSeasonId,
  homeFranchiseId,
  awayFranchiseId,
  venue,
  matchType = 'T20',
  startsAt,
  tossAt,
  lockAt,
  status = 'SCHEDULED',
}) => {
  const validMatchTypes = ['T20', 'ODI', 'TEST', 'T10'];
  const safeMatchType = validMatchTypes.includes(String(matchType).toUpperCase())
    ? String(matchType).toUpperCase()
    : 'T20';

  const { startsAtDate, tossAtDate, lockAtDate } = await validateFixturePayload({
    leagueSeasonId,
    homeFranchiseId,
    awayFranchiseId,
    startsAt,
    tossAt,
    lockAt,
  });

  const [result] = await pool.query(
    `INSERT INTO fixtures (
      league_season_id,
      home_franchise_id,
      away_franchise_id,
      venue,
      match_type,
      starts_at,
      toss_at,
      lock_at,
      status
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      leagueSeasonId,
      Number(homeFranchiseId),
      Number(awayFranchiseId),
      venue || null,
      safeMatchType,
      startsAtDate,
      tossAtDate,
      lockAtDate,
      status,
    ]
  );

  const fixtures = await listLeagueFixturesAdmin(leagueSeasonId);
  return fixtures.find((fixture) => fixture.id === Number(result.insertId)) || null;
};

const updateFixture = async ({
  leagueSeasonId,
  fixtureId,
  homeFranchiseId,
  awayFranchiseId,
  venue,
  matchType,
  startsAt,
  tossAt,
  lockAt,
  status,
}) => {
  const [existingRows] = await pool.query(
    'SELECT id, league_season_id, home_franchise_id, away_franchise_id, starts_at, toss_at, lock_at, venue, match_type, status FROM fixtures WHERE id = ? AND league_season_id = ? LIMIT 1',
    [fixtureId, leagueSeasonId]
  );

  if (!existingRows.length) throw new AppError('Fixture not found for this league', 404);
  const existing = existingRows[0];

  const validMatchTypes = ['T20', 'ODI', 'TEST', 'T10'];
  const safeMatchType = matchType && validMatchTypes.includes(String(matchType).toUpperCase())
    ? String(matchType).toUpperCase()
    : existing.match_type || 'T20';

  const nextPayload = {
    homeFranchiseId: homeFranchiseId ? Number(homeFranchiseId) : Number(existing.home_franchise_id),
    awayFranchiseId: awayFranchiseId ? Number(awayFranchiseId) : Number(existing.away_franchise_id),
    startsAt: startsAt || existing.starts_at,
    tossAt: tossAt || existing.toss_at,
    lockAt: lockAt || existing.lock_at,
  };

  const { startsAtDate, tossAtDate, lockAtDate } = await validateFixturePayload({
    leagueSeasonId,
    ...nextPayload,
  });

  const nextStatus = status || existing.status;

  await pool.query(
    `UPDATE fixtures
     SET home_franchise_id = ?,
         away_franchise_id = ?,
         venue = ?,
         match_type = ?,
         starts_at = ?,
         toss_at = ?,
         lock_at = ?,
         status = ?
     WHERE id = ? AND league_season_id = ?`,
    [
      nextPayload.homeFranchiseId,
      nextPayload.awayFranchiseId,
      venue ?? existing.venue,
      safeMatchType,
      startsAtDate,
      tossAtDate,
      lockAtDate,
      nextStatus,
      Number(fixtureId),
      leagueSeasonId,
    ]
  );

  // When a match is marked COMPLETED:
  //  1. Record ended_at (now if not supplied)
  //  2. Open the transfer window for the next scheduled fixture
  //     (transfer_window_opens_at = ended_at + 15 minutes)
  if (nextStatus === 'COMPLETED' && existing.status !== 'COMPLETED') {
    const endedAt = new Date();
    await pool.query(
      `UPDATE fixtures SET ended_at = ? WHERE id = ?`,
      [endedAt, Number(fixtureId)]
    );

    const [nextFixRows] = await pool.query(
      `SELECT id FROM fixtures
       WHERE league_season_id = ? AND status = 'SCHEDULED'
       ORDER BY starts_at ASC, id ASC
       LIMIT 1`,
      [leagueSeasonId]
    );

    if (nextFixRows.length) {
      const windowOpensAt = new Date(endedAt.getTime() + 15 * 60 * 1000);
      await pool.query(
        `UPDATE fixtures SET transfer_window_opens_at = ? WHERE id = ?`,
        [windowOpensAt, Number(nextFixRows[0].id)]
      );
    }
  }

  const fixtures = await listLeagueFixturesAdmin(leagueSeasonId);
  return fixtures.find((fixture) => fixture.id === Number(fixtureId)) || null;
};

const deleteFixture = async ({ leagueSeasonId, fixtureId }) => {
  const [result] = await pool.query(
    'DELETE FROM fixtures WHERE id = ? AND league_season_id = ?',
    [Number(fixtureId), leagueSeasonId]
  );

  if (result.affectedRows === 0) throw new AppError('Fixture not found for this league', 404);
};

const syncFixtures = async ({ leagueSeasonId, source = 'demo', fixtures = [], apiUrl = '' }) => {
  await ensureLeagueExists(leagueSeasonId);

  let normalizedFixtures = [];

  if (source === 'payload') {
    normalizedFixtures = Array.isArray(fixtures) ? fixtures : [];
  } else if (source === 'external') {
    if (!apiUrl) throw new AppError('apiUrl is required when source is external', 400);
    const response = await fetch(apiUrl);
    if (!response.ok) throw new AppError(`Failed to fetch external fixtures: ${response.status}`, 400);
    const payload = await response.json();
    normalizedFixtures = Array.isArray(payload?.fixtures) ? payload.fixtures : [];
  } else {
    const franchises = await listLeagueFranchises(leagueSeasonId);
    const now = Date.now();
    normalizedFixtures = franchises.slice(0, 6).reduce((acc, _, idx, arr) => {
      if (idx % 2 !== 0 || idx + 1 >= arr.length) return acc;
      const home = arr[idx];
      const away = arr[idx + 1];
      const startsAt = new Date(now + (idx + 1) * 24 * 60 * 60 * 1000);
      acc.push({
        homeFranchiseId: home.franchiseId,
        awayFranchiseId: away.franchiseId,
        venue: `${home.displayName} Home Ground`,
        startsAt: startsAt.toISOString(),
        tossAt: new Date(startsAt.getTime() - 30 * 60 * 1000).toISOString(),
        lockAt: new Date(startsAt.getTime() - 15 * 60 * 1000).toISOString(),
        status: 'SCHEDULED',
      });
      return acc;
    }, []);
  }

  if (!normalizedFixtures.length) {
    return { inserted: 0, updated: 0, total: 0 };
  }

  let inserted = 0;
  let updated = 0;

  for (const item of normalizedFixtures) {
    const homeFranchiseId = Number(item.homeFranchiseId || item.home_franchise_id);
    const awayFranchiseId = Number(item.awayFranchiseId || item.away_franchise_id);
    const startsAt = item.startsAt || item.starts_at;

    const { startsAtDate, tossAtDate, lockAtDate } = await validateFixturePayload({
      leagueSeasonId,
      homeFranchiseId,
      awayFranchiseId,
      startsAt,
      tossAt: item.tossAt || item.toss_at,
      lockAt: item.lockAt || item.lock_at,
    });

    const [existingRows] = await pool.query(
      `SELECT id
       FROM fixtures
       WHERE league_season_id = ?
         AND home_franchise_id = ?
         AND away_franchise_id = ?
         AND DATE(starts_at) = DATE(?)
       LIMIT 1`,
      [leagueSeasonId, homeFranchiseId, awayFranchiseId, startsAtDate]
    );

    if (existingRows.length) {
      await pool.query(
        `UPDATE fixtures
         SET venue = ?, starts_at = ?, toss_at = ?, lock_at = ?, status = ?
         WHERE id = ?`,
        [
          item.venue || null,
          startsAtDate,
          tossAtDate,
          lockAtDate,
          item.status || 'SCHEDULED',
          Number(existingRows[0].id),
        ]
      );
      updated += 1;
    } else {
      await pool.query(
        `INSERT INTO fixtures (
          league_season_id, home_franchise_id, away_franchise_id,
          venue, starts_at, toss_at, lock_at, status
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          leagueSeasonId,
          homeFranchiseId,
          awayFranchiseId,
          item.venue || null,
          startsAtDate,
          tossAtDate,
          lockAtDate,
          item.status || 'SCHEDULED',
        ]
      );
      inserted += 1;
    }
  }

  return {
    inserted,
    updated,
    total: inserted + updated,
  };
};

/**
 * Bulk-upsert player match stats for a fixture.
 * Admin can push stats before or after marking the fixture COMPLETED.
 * Points are NOT calculated here – call finalizeMatchPoints separately.
 *
 * @param {number|string} fixtureId
 * @param {Array}         statsArray  – array of stat objects (see player_live_stats schema)
 */
const upsertPlayerMatchStats = async (fixtureId, statsArray) => {
  if (!Array.isArray(statsArray) || !statsArray.length) {
    throw new AppError('statsArray must be a non-empty array', 400);
  }

  const [fixRows] = await pool.query(
    'SELECT id FROM fixtures WHERE id = ? LIMIT 1',
    [Number(fixtureId)]
  );
  if (!fixRows.length) throw new AppError('Fixture not found', 404);

  const results = [];

  for (const stat of statsArray) {
    const playerId = Number(stat.playerId || stat.player_id);
    if (!playerId) continue;

    const [playerRows] = await pool.query(
      'SELECT id, franchise_id FROM players WHERE id = ? LIMIT 1',
      [playerId]
    );
    if (!playerRows.length) continue;

    const franchiseId = Number(playerRows[0].franchise_id);

    // Auto-derive haul flags and economy from supplied data
    const wickets      = Number(stat.wickets       || 0);
    const ballsBowled  = Number(stat.balls_bowled  || 0);
    const runsConceded = Number(stat.runs_conceded || 0);
    const economy = ballsBowled > 0
      ? Number(((runsConceded / ballsBowled) * 6).toFixed(2))
      : Number(stat.economy_rate || 0);

    await pool.query(
      `INSERT INTO player_live_stats (
         fixture_id, player_id, franchise_id,
         runs, fours, sixes, balls_faced,
         is_duck, did_bat, is_playing_xi,
         wickets, maidens, economy_rate, balls_bowled, runs_conceded,
         lbw_wickets, bowled_wickets,
         three_wicket_haul, four_wicket_haul, five_wicket_haul,
         catches, stumpings, direct_hit_runouts,
         indirect_runout_throws, indirect_runout_catches,
         dropped_catches
       ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
       ON DUPLICATE KEY UPDATE
         runs                   = VALUES(runs),
         fours                  = VALUES(fours),
         sixes                  = VALUES(sixes),
         balls_faced            = VALUES(balls_faced),
         is_duck                = VALUES(is_duck),
         did_bat                = VALUES(did_bat),
         is_playing_xi          = VALUES(is_playing_xi),
         wickets                = VALUES(wickets),
         maidens                = VALUES(maidens),
         economy_rate           = VALUES(economy_rate),
         balls_bowled           = VALUES(balls_bowled),
         runs_conceded          = VALUES(runs_conceded),
         lbw_wickets            = VALUES(lbw_wickets),
         bowled_wickets         = VALUES(bowled_wickets),
         three_wicket_haul      = VALUES(three_wicket_haul),
         four_wicket_haul       = VALUES(four_wicket_haul),
         five_wicket_haul       = VALUES(five_wicket_haul),
         catches                = VALUES(catches),
         stumpings              = VALUES(stumpings),
         direct_hit_runouts     = VALUES(direct_hit_runouts),
         indirect_runout_throws  = VALUES(indirect_runout_throws),
         indirect_runout_catches = VALUES(indirect_runout_catches),
         dropped_catches        = VALUES(dropped_catches)`,
      [
        Number(fixtureId), playerId, franchiseId,
        Number(stat.runs        || 0),
        Number(stat.fours       || 0),
        Number(stat.sixes       || 0),
        Number(stat.balls_faced || 0),
        stat.is_duck       ? 1 : 0,
        stat.did_bat       ? 1 : 0,
        stat.is_playing_xi ? 1 : 0,
        wickets,
        Number(stat.maidens || 0),
        economy,
        ballsBowled,
        runsConceded,
        Number(stat.lbw_wickets  || 0),
        Number(stat.bowled_wickets || 0),
        wickets >= 3 ? 1 : 0,
        wickets >= 4 ? 1 : 0,
        wickets >= 5 ? 1 : 0,
        Number(stat.catches              || 0),
        Number(stat.stumpings            || 0),
        Number(stat.direct_hit_runouts   || 0),
        Number(stat.indirect_runout_throws  || 0),
        Number(stat.indirect_runout_catches || 0),
        Number(stat.dropped_catches      || 0),
      ]
    );

    results.push({ playerId, status: 'upserted' });
  }

  return { fixtureId: Number(fixtureId), updated: results.length, players: results };
};

module.exports = {
  listLeagueFranchises,
  listLeagueFixturesAdmin,
  createFixture,
  updateFixture,
  deleteFixture,
  syncFixtures,
  upsertPlayerMatchStats,
};
