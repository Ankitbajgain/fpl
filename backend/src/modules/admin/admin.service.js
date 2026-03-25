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
      f.starts_at,
      f.toss_at,
      f.lock_at,
      f.status,
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
    startsAt: row.starts_at,
    tossAt: row.toss_at,
    lockAt: row.lock_at,
    status: row.status,
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
  startsAt,
  tossAt,
  lockAt,
  status = 'SCHEDULED',
}) => {
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
      starts_at,
      toss_at,
      lock_at,
      status
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      leagueSeasonId,
      Number(homeFranchiseId),
      Number(awayFranchiseId),
      venue || null,
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
  startsAt,
  tossAt,
  lockAt,
  status,
}) => {
  const [existingRows] = await pool.query(
    'SELECT id, league_season_id, home_franchise_id, away_franchise_id, starts_at, toss_at, lock_at, venue, status FROM fixtures WHERE id = ? AND league_season_id = ? LIMIT 1',
    [fixtureId, leagueSeasonId]
  );

  if (!existingRows.length) throw new AppError('Fixture not found for this league', 404);
  const existing = existingRows[0];

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

  await pool.query(
    `UPDATE fixtures
     SET home_franchise_id = ?,
         away_franchise_id = ?,
         venue = ?,
         starts_at = ?,
         toss_at = ?,
         lock_at = ?,
         status = ?
     WHERE id = ? AND league_season_id = ?`,
    [
      nextPayload.homeFranchiseId,
      nextPayload.awayFranchiseId,
      venue ?? existing.venue,
      startsAtDate,
      tossAtDate,
      lockAtDate,
      status || existing.status,
      Number(fixtureId),
      leagueSeasonId,
    ]
  );

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

module.exports = {
  listLeagueFranchises,
  listLeagueFixturesAdmin,
  createFixture,
  updateFixture,
  deleteFixture,
  syncFixtures,
};
