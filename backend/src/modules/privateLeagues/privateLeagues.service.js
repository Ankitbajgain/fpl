const { randomBytes } = require('crypto');
const { pool } = require('../../config/mysql');
const AppError = require('../../utils/AppError');

const MAX_PRIVATE_LEAGUE_MEMBERSHIPS_PER_USER = 25;
const MAX_PRIVATE_LEAGUES_CREATED_PER_USER = 5;

const normalizeInviteCode = (value) => String(value || '').trim().toUpperCase();
const normalizeLeagueName = (value) => String(value || '').trim().replace(/\s+/g, ' ');

const mapLeagueSummary = (row) => ({
  id: Number(row.id),
  leagueSeasonId: row.league_season_id,
  seasonName: row.season_name,
  competition: row.competition,
  name: row.name,
  inviteCode: row.invite_code,
  isOverall: Number(row.is_overall) === 1,
  isActive: Number(row.is_active) === 1,
  creatorUserId: Number(row.creator_user_id),
  adminUserId: Number(row.admin_user_id),
  myRole: row.my_role || null,
  joinedAt: row.joined_at || null,
  memberCount: Number(row.member_count || 0),
  createdAt: row.created_at,
  updatedAt: row.updated_at,
  share: {
    inviteCode: row.invite_code,
    shareText: `Join ${row.name} in ${row.season_name} with code ${row.invite_code}`,
  },
});

const getLeagueSeason = async (leagueSeasonId, executor = pool) => {
  const [rows] = await executor.query(
    `SELECT ls.id, ls.season_name, ls.status, c.short_name AS competition
     FROM league_seasons ls
     JOIN competitions c ON c.id = ls.competition_id
     WHERE ls.id = ?
     LIMIT 1`,
    [leagueSeasonId]
  );

  if (!rows.length) {
    throw new AppError('League season not found', 404);
  }

  return rows[0];
};

const getPrivateLeagueMembershipCount = async (userId, executor = pool) => {
  const [rows] = await executor.query(
    `SELECT COUNT(*) AS total
     FROM private_league_members plm
     JOIN private_leagues pl ON pl.id = plm.league_id
     WHERE plm.user_id = ?
       AND pl.is_active = 1
       AND pl.is_overall = 0`,
    [userId]
  );

  return Number(rows[0]?.total || 0);
};

const getPrivateLeaguesCreatedCount = async (userId, executor = pool) => {
  const [rows] = await executor.query(
    `SELECT COUNT(*) AS total
     FROM private_leagues pl
     WHERE pl.creator_user_id = ?
       AND pl.is_active = 1
       AND pl.is_overall = 0`,
    [userId]
  );

  return Number(rows[0]?.total || 0);
};

const enforcePrivateLeagueMembershipLimit = async (userId, executor = pool) => {
  const total = await getPrivateLeagueMembershipCount(userId, executor);
  if (total >= MAX_PRIVATE_LEAGUE_MEMBERSHIPS_PER_USER) {
    throw new AppError(`A manager can join up to ${MAX_PRIVATE_LEAGUE_MEMBERSHIPS_PER_USER} private leagues`, 400);
  }
};

const enforcePrivateLeagueCreateLimit = async (userId, executor = pool) => {
  const total = await getPrivateLeaguesCreatedCount(userId, executor);
  if (total >= MAX_PRIVATE_LEAGUES_CREATED_PER_USER) {
    throw new AppError(`A manager can create up to ${MAX_PRIVATE_LEAGUES_CREATED_PER_USER} private leagues`, 400);
  }
};

const getLeagueById = async (leagueId, executor = pool) => {
  const [rows] = await executor.query(
    `SELECT
        pl.id,
        pl.league_season_id,
        ls.season_name,
        c.short_name AS competition,
        pl.creator_user_id,
        pl.admin_user_id,
        pl.name,
        pl.invite_code,
        pl.is_overall,
        pl.is_active,
        pl.created_at,
        pl.updated_at,
        COUNT(plm.user_id) AS member_count
     FROM private_leagues pl
     JOIN league_seasons ls ON ls.id = pl.league_season_id
     JOIN competitions c ON c.id = ls.competition_id
     LEFT JOIN private_league_members plm ON plm.league_id = pl.id
     WHERE pl.id = ?
     GROUP BY
        pl.id,
        pl.league_season_id,
        ls.season_name,
        c.short_name,
        pl.creator_user_id,
        pl.admin_user_id,
        pl.name,
        pl.invite_code,
        pl.is_overall,
        pl.is_active,
        pl.created_at,
        pl.updated_at
     LIMIT 1`,
    [Number(leagueId)]
  );

  return rows[0] || null;
};

const getLeagueByInviteCode = async (inviteCode, executor = pool) => {
  const [rows] = await executor.query(
    `SELECT id
     FROM private_leagues
     WHERE invite_code = ? AND is_active = 1
     LIMIT 1`,
    [normalizeInviteCode(inviteCode)]
  );

  if (!rows.length) {
    throw new AppError('Private league not found for this invite code', 404);
  }

  return getLeagueById(rows[0].id, executor);
};

const getMembership = async (leagueId, userId, executor = pool) => {
  const [rows] = await executor.query(
    `SELECT league_id, user_id, role, joined_at
     FROM private_league_members
     WHERE league_id = ? AND user_id = ?
     LIMIT 1`,
    [Number(leagueId), Number(userId)]
  );

  return rows[0] || null;
};

const generateUniqueInviteCode = async (executor = pool) => {
  for (let attempt = 0; attempt < 10; attempt += 1) {
    const inviteCode = randomBytes(4).toString('hex').toUpperCase();
    const [rows] = await executor.query(
      'SELECT id FROM private_leagues WHERE invite_code = ? LIMIT 1',
      [inviteCode]
    );
    if (!rows.length) return inviteCode;
  }

  throw new AppError('Unable to generate a unique invite code right now', 500);
};

const getNextFixtureAfterJoin = async (leagueSeasonId, joinedAt, executor = pool) => {
  const [rows] = await executor.query(
    `SELECT id, starts_at, lock_at
     FROM fixtures
     WHERE league_season_id = ?
       AND lock_at > ?
     ORDER BY lock_at ASC, id ASC
     LIMIT 1`,
    [leagueSeasonId, joinedAt]
  );

  return rows[0] || null;
};

const canRemoveMemberBeforeFirstLock = async (leagueSeasonId, joinedAt, executor = pool) => {
  const fixture = await getNextFixtureAfterJoin(leagueSeasonId, joinedAt, executor);
  if (!fixture) return false;
  return new Date() < new Date(fixture.lock_at);
};

const getLeagueStandings = async (leagueId, executor = pool) => {
  const [rows] = await executor.query(
    `SELECT
        u.id AS user_id,
        u.name,
        u.email,
        plm.role,
        plm.joined_at,
        COUNT(DISTINCT CASE
          WHEN ms.id IS NOT NULL
           AND f.status = 'COMPLETED'
           AND f.points_finalized_at IS NOT NULL
           AND f.starts_at >= plm.joined_at
          THEN ms.fixture_id
        END) AS matches,
        ROUND(COALESCE(SUM(CASE
          WHEN ms.id IS NOT NULL
           AND f.status = 'COMPLETED'
           AND f.points_finalized_at IS NOT NULL
           AND f.starts_at >= plm.joined_at
          THEN ms.points_total
          ELSE 0
        END), 0), 2) AS total_points
     FROM private_leagues pl
     JOIN private_league_members plm ON plm.league_id = pl.id
     JOIN users u ON u.id = plm.user_id
     LEFT JOIN fixtures f ON f.league_season_id = pl.league_season_id
     LEFT JOIN manager_squads ms ON ms.user_id = plm.user_id AND ms.fixture_id = f.id
     WHERE pl.id = ?
     GROUP BY u.id, u.name, u.email, plm.role, plm.joined_at
     ORDER BY total_points DESC, matches DESC, plm.joined_at ASC, u.name ASC`,
    [Number(leagueId)]
  );

  let previousPoints = null;
  let previousRank = 0;

  return rows.map((row, index) => {
    const totalPoints = Number(row.total_points || 0);
    const rank = totalPoints === previousPoints ? previousRank : index + 1;
    previousPoints = totalPoints;
    previousRank = rank;

    return {
      rank,
      userId: Number(row.user_id),
      name: row.name,
      email: row.email,
      role: row.role,
      joinedAt: row.joined_at,
      matches: Number(row.matches || 0),
      totalPoints,
    };
  });
};

const getLeagueMembers = async (leagueId, executor = pool) => {
  const [rows] = await executor.query(
    `SELECT u.id AS user_id, u.name, u.email, plm.role, plm.joined_at
     FROM private_league_members plm
     JOIN users u ON u.id = plm.user_id
     WHERE plm.league_id = ?
     ORDER BY plm.joined_at ASC, u.name ASC`,
    [Number(leagueId)]
  );

  return rows.map((row) => ({
    userId: Number(row.user_id),
    name: row.name,
    email: row.email,
    role: row.role,
    joinedAt: row.joined_at,
  }));
};

const getLeagueDetail = async (leagueId, userId, executor = pool) => {
  const league = await getLeagueById(leagueId, executor);
  if (!league || Number(league.is_active) !== 1) {
    throw new AppError('Private league not found', 404);
  }

  const membership = userId ? await getMembership(leagueId, userId, executor) : null;
  if (userId && !membership) {
    throw new AppError('You are not a member of this private league', 403);
  }

  const [members, standings] = await Promise.all([
    getLeagueMembers(leagueId, executor),
    getLeagueStandings(leagueId, executor),
  ]);

  return {
    ...mapLeagueSummary({ ...league, my_role: membership?.role || null, joined_at: membership?.joined_at || null }),
    members,
    standings,
  };
};

const ensureUserIsAdmin = async (leagueId, userId, executor = pool) => {
  const membership = await getMembership(leagueId, userId, executor);
  if (!membership || membership.role !== 'admin') {
    throw new AppError('Only the private league admin can perform this action', 403);
  }
  return membership;
};

const ensureOverallLeague = async ({ leagueSeasonId, userId, executor = pool }) => {
  const [rows] = await executor.query(
    `SELECT id
     FROM private_leagues
     WHERE league_season_id = ? AND is_overall = 1
     LIMIT 1`,
    [leagueSeasonId]
  );

  if (rows.length) {
    return {
      created: false,
      league: await getLeagueById(rows[0].id, executor),
    };
  }

  const season = await getLeagueSeason(leagueSeasonId, executor);
  const inviteCode = await generateUniqueInviteCode(executor);
  const leagueName = `${season.season_name} Overall League`;

  const [result] = await executor.query(
    `INSERT INTO private_leagues (
      league_season_id,
      creator_user_id,
      admin_user_id,
      name,
      invite_code,
      is_overall,
      is_active
    ) VALUES (?, ?, ?, ?, ?, 1, 1)`,
    [leagueSeasonId, Number(userId), Number(userId), leagueName, inviteCode]
  );

  return {
    created: true,
    league: await getLeagueById(result.insertId, executor),
  };
};

const ensureUserInOverallLeague = async ({ userId, leagueSeasonId, executor = pool }) => {
  const overallLeagueResult = await ensureOverallLeague({ leagueSeasonId, userId, executor });
  const overallLeague = overallLeagueResult.league;
  const existingMembership = await getMembership(overallLeague.id, userId, executor);

  if (existingMembership) {
    return {
      joined: false,
      league: mapLeagueSummary({ ...overallLeague, my_role: existingMembership.role, joined_at: existingMembership.joined_at }),
    };
  }

  await executor.query(
    `INSERT INTO private_league_members (league_id, user_id, role)
     VALUES (?, ?, ?)`,
    [overallLeague.id, Number(userId), overallLeagueResult.created ? 'admin' : 'member']
  );

  const membership = await getMembership(overallLeague.id, userId, executor);

  return {
    joined: true,
    league: mapLeagueSummary({ ...overallLeague, my_role: membership?.role || 'member', joined_at: membership?.joined_at || null }),
  };
};

const listMyLeagues = async (userId, { leagueSeasonId } = {}, executor = pool) => {
  const params = [Number(userId)];
  let seasonClause = '';
  if (leagueSeasonId) {
    seasonClause = ' AND pl.league_season_id = ?';
    params.push(leagueSeasonId);
  }

  const [rows] = await executor.query(
    `SELECT
        pl.id,
        pl.league_season_id,
        ls.season_name,
        c.short_name AS competition,
        pl.creator_user_id,
        pl.admin_user_id,
        pl.name,
        pl.invite_code,
        pl.is_overall,
        pl.is_active,
        pl.created_at,
        pl.updated_at,
        plm.role AS my_role,
        plm.joined_at,
        COUNT(all_members.user_id) AS member_count
     FROM private_league_members plm
     JOIN private_leagues pl ON pl.id = plm.league_id
     JOIN league_seasons ls ON ls.id = pl.league_season_id
     JOIN competitions c ON c.id = ls.competition_id
     LEFT JOIN private_league_members all_members ON all_members.league_id = pl.id
     WHERE plm.user_id = ? AND pl.is_active = 1${seasonClause}
     GROUP BY
        pl.id,
        pl.league_season_id,
        ls.season_name,
        c.short_name,
        pl.creator_user_id,
        pl.admin_user_id,
        pl.name,
        pl.invite_code,
        pl.is_overall,
        pl.is_active,
        pl.created_at,
        pl.updated_at,
        plm.role,
        plm.joined_at
     ORDER BY pl.is_overall DESC, pl.created_at ASC, pl.id ASC`,
    params
  );

  return rows.map(mapLeagueSummary);
};

const createPrivateLeague = async ({ userId, leagueSeasonId, name }) => {
  const normalizedName = normalizeLeagueName(name);
  if (!normalizedName) {
    throw new AppError('Private league name is required', 400);
  }

  await getLeagueSeason(leagueSeasonId);
  await enforcePrivateLeagueMembershipLimit(userId);
  await enforcePrivateLeagueCreateLimit(userId);

  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();

    const [duplicateRows] = await conn.query(
      `SELECT id FROM private_leagues WHERE league_season_id = ? AND name = ? LIMIT 1`,
      [leagueSeasonId, normalizedName]
    );
    if (duplicateRows.length) {
      throw new AppError('A private league with this name already exists for the selected season', 409);
    }

    const inviteCode = await generateUniqueInviteCode(conn);
    const [result] = await conn.query(
      `INSERT INTO private_leagues (
        league_season_id,
        creator_user_id,
        admin_user_id,
        name,
        invite_code,
        is_overall,
        is_active
      ) VALUES (?, ?, ?, ?, ?, 0, 1)`,
      [leagueSeasonId, Number(userId), Number(userId), normalizedName, inviteCode]
    );

    await conn.query(
      `INSERT INTO private_league_members (league_id, user_id, role)
       VALUES (?, ?, 'admin')`,
      [result.insertId, Number(userId)]
    );

    await conn.commit();
    return getLeagueDetail(result.insertId, userId);
  } catch (error) {
    await conn.rollback();
    throw error;
  } finally {
    conn.release();
  }
};

const joinPrivateLeague = async ({ userId, inviteCode }) => {
  const normalizedCode = normalizeInviteCode(inviteCode);
  if (!normalizedCode) {
    throw new AppError('Invite code is required', 400);
  }

  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();

    const league = await getLeagueByInviteCode(normalizedCode, conn);
    if (Number(league.is_active) !== 1) {
      throw new AppError('This private league is not active', 400);
    }
    if (Number(league.is_overall) === 1) {
      throw new AppError('Overall leagues are joined automatically after first team save', 400);
    }

    const existingMembership = await getMembership(league.id, userId, conn);
    if (existingMembership) {
      throw new AppError('You have already joined this private league', 409);
    }

    await enforcePrivateLeagueMembershipLimit(userId, conn);

    await conn.query(
      `INSERT INTO private_league_members (league_id, user_id, role)
       VALUES (?, ?, 'member')`,
      [league.id, Number(userId)]
    );

    await conn.commit();
    return getLeagueDetail(league.id, userId);
  } catch (error) {
    await conn.rollback();
    throw error;
  } finally {
    conn.release();
  }
};

const removeMember = async ({ actorUserId, leagueId, targetUserId }) => {
  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();

    const league = await getLeagueById(leagueId, conn);
    if (!league || Number(league.is_active) !== 1) {
      throw new AppError('Private league not found', 404);
    }
    if (Number(league.is_overall) === 1) {
      throw new AppError('Overall league members cannot be removed manually', 400);
    }

    await ensureUserIsAdmin(leagueId, actorUserId, conn);

    if (Number(actorUserId) === Number(targetUserId)) {
      throw new AppError('Use the leave action to remove yourself from a private league', 400);
    }

    const targetMembership = await getMembership(leagueId, targetUserId, conn);
    if (!targetMembership) {
      throw new AppError('Target user is not a member of this private league', 404);
    }

    const removable = await canRemoveMemberBeforeFirstLock(league.league_season_id, targetMembership.joined_at, conn);
    if (!removable) {
      throw new AppError('This member can only be removed before their first joined match locks', 400);
    }

    await conn.query(
      `DELETE FROM private_league_members WHERE league_id = ? AND user_id = ?`,
      [Number(leagueId), Number(targetUserId)]
    );

    await conn.commit();
    return getLeagueDetail(leagueId, actorUserId);
  } catch (error) {
    await conn.rollback();
    throw error;
  } finally {
    conn.release();
  }
};

const leavePrivateLeague = async ({ userId, leagueId }) => {
  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();

    const league = await getLeagueById(leagueId, conn);
    if (!league || Number(league.is_active) !== 1) {
      throw new AppError('Private league not found', 404);
    }
    if (Number(league.is_overall) === 1) {
      throw new AppError('Overall league membership is automatic and cannot be left manually', 400);
    }

    const membership = await getMembership(leagueId, userId, conn);
    if (!membership) {
      throw new AppError('You are not a member of this private league', 404);
    }

    await conn.query(
      `DELETE FROM private_league_members WHERE league_id = ? AND user_id = ?`,
      [Number(leagueId), Number(userId)]
    );

    if (membership.role === 'admin' || Number(league.admin_user_id) === Number(userId)) {
      const [successorRows] = await conn.query(
        `SELECT user_id
         FROM private_league_members
         WHERE league_id = ?
         ORDER BY joined_at ASC, user_id ASC
         LIMIT 1`,
        [Number(leagueId)]
      );

      if (successorRows.length) {
        const successorUserId = Number(successorRows[0].user_id);
        await conn.query(
          `UPDATE private_leagues SET admin_user_id = ? WHERE id = ?`,
          [successorUserId, Number(leagueId)]
        );
        await conn.query(
          `UPDATE private_league_members SET role = 'admin' WHERE league_id = ? AND user_id = ?`,
          [Number(leagueId), successorUserId]
        );
      } else {
        await conn.query(
          `UPDATE private_leagues SET is_active = 0 WHERE id = ?`,
          [Number(leagueId)]
        );
      }
    }

    await conn.commit();
    return { left: true, leagueId: Number(leagueId) };
  } catch (error) {
    await conn.rollback();
    throw error;
  } finally {
    conn.release();
  }
};

module.exports = {
  MAX_PRIVATE_LEAGUE_MEMBERSHIPS_PER_USER,
  MAX_PRIVATE_LEAGUES_CREATED_PER_USER,
  ensureUserInOverallLeague,
  listMyLeagues,
  createPrivateLeague,
  joinPrivateLeague,
  getLeagueDetail,
  leavePrivateLeague,
  removeMember,
};