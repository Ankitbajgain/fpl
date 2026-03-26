const { pool } = require('../../config/mysql');
const AppError = require('../../utils/AppError');
const {
  validateSquad,
  isSquadLocked,
  transferPenalty,
  applyBooster,
  calculateCricketFantasyPoints,
} = require('./gameplay.rules');

const getPlayersByIds = async (playerIds, leagueSeasonId = null) => {
  if (!playerIds.length) return [];
  const placeholders = playerIds.map(() => '?').join(',');

  let rows;
  if (leagueSeasonId) {
    [rows] = await pool.query(
      `SELECT p.id, p.full_name, p.role, p.franchise_id, lsp.base_credits AS credit_price,
              COALESCE(n.name, 'Unknown') AS country,
              lsp.league_franchise_id,
              lf.team_code AS league_team_code
       FROM league_season_players lsp
       JOIN players p ON p.id = lsp.player_id
       JOIN league_franchises lf ON lf.id = lsp.league_franchise_id
       LEFT JOIN player_nationalities pn ON pn.player_id = p.id
       LEFT JOIN nations n ON n.id = pn.nation_id
       WHERE p.id IN (${placeholders})
         AND p.is_active = 1
         AND lsp.league_season_id = ?
         AND lsp.is_active = 1`,
      [...playerIds, leagueSeasonId]
    );
  } else {
    [rows] = await pool.query(
      `SELECT p.id, p.full_name, p.role, p.franchise_id, p.credit_price,
              COALESCE(n.name, 'Unknown') AS country,
              p.franchise_id AS league_franchise_id,
              f.short_name AS league_team_code
       FROM players p
       JOIN franchises f ON f.id = p.franchise_id
       LEFT JOIN player_nationalities pn ON pn.player_id = p.id
       LEFT JOIN nations n ON n.id = pn.nation_id
       WHERE p.id IN (${placeholders}) AND p.is_active = 1`,
      playerIds
    );
  }

  return rows;
};

const getLeagueHomeCountry = async (leagueSeasonId) => {
  if (!leagueSeasonId) return 'India';

  const [rows] = await pool.query(
    `SELECT n.name AS nation
     FROM league_seasons ls
     JOIN competitions c ON c.id = ls.competition_id
     JOIN nations n ON n.id = c.nation_id
     WHERE ls.id = ?
     LIMIT 1`,
    [leagueSeasonId]
  );

  return rows[0]?.nation || 'India';
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
    KK: 'Pakistan',
    IU: 'Pakistan',
    LQ: 'Pakistan',
    MSU: 'Pakistan',
    PZ: 'Pakistan',
    QG: 'Pakistan',
    ADS: 'Australia',
    BRH: 'Australia',
    HBH: 'Australia',
    MLR: 'Australia',
    MLS: 'Australia',
    PES: 'Australia',
    SYS: 'Australia',
    SYT: 'Australia',
    CTV: 'Bangladesh',
    CHC: 'Bangladesh',
    DHK: 'Bangladesh',
    FRT: 'Bangladesh',
    KLT: 'Bangladesh',
    RAN: 'Bangladesh',
    SYL: 'Bangladesh',
    BIR: 'Nepal',
    CHI: 'Nepal',
    JAN: 'Nepal',
    KTM: 'Nepal',
    LUM: 'Nepal',
    POK: 'Nepal',
    SPR: 'Nepal',
    KOS: 'Nepal',
  };
  return countryMap[shortName] || 'Unknown';
};

// Get players for a specific league season
const listPlayersForLeague = async (leagueSeasonId) => {
  try {
    const [rows] = await pool.query(
      `SELECT id, full_name, role, credits, team, country
       FROM (
         SELECT 
           p.id,
           p.full_name,
           p.role,
           lsp.base_credits AS credits,
           lf.team_code AS team,
            COALESCE(
              n.name,
              CASE
                WHEN lf.team_code IN ('MI','CSK','RCB','KKR','DC','RR','PBKS','SRH','GT','LSG','DMU','IND') THEN 'India'
                WHEN lf.team_code IN ('KK','IU','LQ','MSU','PZ','QG','PAK') THEN 'Pakistan'
                WHEN lf.team_code IN ('ADS','BRH','HBH','MLR','MLS','PES','SYS','SYT','AUS') THEN 'Australia'
                WHEN lf.team_code IN ('CTV','CHC','DHK','FRT','KLT','RAN','SYL','BAN') THEN 'Bangladesh'
                WHEN lf.team_code IN ('BIR','CHI','JAN','KTM','LUM','POK','SPR','KOS','NEP') THEN 'Nepal'
                ELSE 'India'
              END
            ) AS country,
           ROW_NUMBER() OVER (
             PARTITION BY LOWER(TRIM(p.full_name))
             ORDER BY lsp.base_credits DESC, p.id ASC
           ) AS rn
         FROM league_season_players lsp
         JOIN players p ON p.id = lsp.player_id
         JOIN league_franchises lf ON lf.id = lsp.league_franchise_id
         LEFT JOIN player_nationalities pn ON pn.player_id = p.id
         LEFT JOIN nations n ON n.id = pn.nation_id
         WHERE lsp.league_season_id = ? AND lsp.is_active = 1 AND p.is_active = 1
       ) deduped
       WHERE rn = 1
       ORDER BY role, credits DESC, full_name ASC`,
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

const validateSquadSelection = async ({ playerIds, captainId, viceCaptainId, budgetCap = 100, leagueSeasonId = null }) => {
  const uniqueIds = new Set((playerIds || []).map((id) => Number(id)));
  if (uniqueIds.size !== (playerIds || []).length) {
    throw new Error('Duplicate player selection is not allowed');
  }

  const players = await getPlayersByIds(playerIds, leagueSeasonId);
  if (players.length !== playerIds.length) {
    throw new Error('One or more selected players are invalid or inactive');
  }

  const homeCountry = await getLeagueHomeCountry(leagueSeasonId);

  const normalizedNames = players.map((p) => String(p.full_name || '').trim().toLowerCase());
  if (new Set(normalizedNames).size !== normalizedNames.length) {
    throw new Error('Duplicate player names are not allowed in a squad');
  }

  return validateSquad({ players, captainId, viceCaptainId, budgetCap, homeCountry, maxAwayPlayers: 4 });
};

const getLeagueTransferPolicy = async (leagueSeasonId) => {
  const [leagueRows] = await pool.query(
    `SELECT ls.id, ls.total_fixtures, c.short_name AS competition
     FROM league_seasons ls
     JOIN competitions c ON c.id = ls.competition_id
     WHERE ls.id = ?
     LIMIT 1`,
    [leagueSeasonId]
  );

  if (!leagueRows.length) {
    throw new AppError('League season not found', 404);
  }

  const league = leagueRows[0];
  const defaultLeagueStageMatches = league.competition === 'IPL'
    ? 70
    : Math.max(1, Number(league.total_fixtures || 1));

  try {
    const [policyRows] = await pool.query(
      `SELECT league_season_id, league_stage_match_count, league_stage_transfer_cap,
              playoff_transfer_cap, qualifier1_match_number, unlimited_pre_match1,
              unlimited_between_league_and_q1, updated_at
       FROM league_transfer_policies
       WHERE league_season_id = ?
       LIMIT 1`,
      [leagueSeasonId]
    );

    const policy = policyRows[0] || null;
    const leagueStageMatchCount = Number(policy?.league_stage_match_count || defaultLeagueStageMatches);
    const qualifier1MatchNumber = Number(policy?.qualifier1_match_number || (leagueStageMatchCount + 1));

    return {
      leagueSeasonId,
      leagueStageMatchCount,
      leagueStageTransferCap: Number(policy?.league_stage_transfer_cap || 160),
      playoffTransferCap: Number(policy?.playoff_transfer_cap || 10),
      qualifier1MatchNumber,
      unlimitedPreMatch1: Number(policy?.unlimited_pre_match1 ?? 1) === 1,
      unlimitedBetweenLeagueAndQ1: Number(policy?.unlimited_between_league_and_q1 ?? 1) === 1,
      source: policy ? 'configured' : 'default',
      updatedAt: policy?.updated_at || null,
    };
  } catch (error) {
    if (error.code === 'ER_NO_SUCH_TABLE') {
      return {
        leagueSeasonId,
        leagueStageMatchCount: defaultLeagueStageMatches,
        leagueStageTransferCap: 160,
        playoffTransferCap: 10,
        qualifier1MatchNumber: defaultLeagueStageMatches + 1,
        unlimitedPreMatch1: true,
        unlimitedBetweenLeagueAndQ1: true,
        source: 'default',
        updatedAt: null,
      };
    }
    throw error;
  }
};

const upsertLeagueTransferPolicy = async ({
  leagueSeasonId,
  leagueStageMatchCount,
  leagueStageTransferCap,
  playoffTransferCap,
  qualifier1MatchNumber,
  unlimitedPreMatch1,
  unlimitedBetweenLeagueAndQ1,
  adminUserId,
}) => {
  if (!leagueSeasonId) throw new AppError('leagueSeasonId is required', 400);

  const stageCount = Number(leagueStageMatchCount);
  const stageCap = Number(leagueStageTransferCap);
  const playoffCap = Number(playoffTransferCap);
  const q1MatchNo = Number(qualifier1MatchNumber || (stageCount + 1));

  if (!Number.isInteger(stageCount) || stageCount < 1) throw new AppError('leagueStageMatchCount must be a positive integer', 400);
  if (!Number.isInteger(stageCap) || stageCap < 0) throw new AppError('leagueStageTransferCap must be a non-negative integer', 400);
  if (!Number.isInteger(playoffCap) || playoffCap < 0) throw new AppError('playoffTransferCap must be a non-negative integer', 400);
  if (!Number.isInteger(q1MatchNo) || q1MatchNo < 2) throw new AppError('qualifier1MatchNumber must be an integer >= 2', 400);

  try {
    await pool.query(
      `INSERT INTO league_transfer_policies (
        league_season_id, league_stage_match_count, league_stage_transfer_cap,
        playoff_transfer_cap, qualifier1_match_number, unlimited_pre_match1,
        unlimited_between_league_and_q1, updated_by_admin_user_id
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      ON DUPLICATE KEY UPDATE
        league_stage_match_count = VALUES(league_stage_match_count),
        league_stage_transfer_cap = VALUES(league_stage_transfer_cap),
        playoff_transfer_cap = VALUES(playoff_transfer_cap),
        qualifier1_match_number = VALUES(qualifier1_match_number),
        unlimited_pre_match1 = VALUES(unlimited_pre_match1),
        unlimited_between_league_and_q1 = VALUES(unlimited_between_league_and_q1),
        updated_by_admin_user_id = VALUES(updated_by_admin_user_id),
        updated_at = CURRENT_TIMESTAMP`,
      [
        leagueSeasonId,
        stageCount,
        stageCap,
        playoffCap,
        q1MatchNo,
        unlimitedPreMatch1 ? 1 : 0,
        unlimitedBetweenLeagueAndQ1 ? 1 : 0,
        adminUserId || null,
      ]
    );
  } catch (error) {
    if (error.code === 'ER_NO_SUCH_TABLE') {
      throw new AppError('Transfer policy table not found. Run database/create-transfer-policy.sql first', 400);
    }
    throw error;
  }

  return getLeagueTransferPolicy(leagueSeasonId);
};

const getFirstFixtureForLeague = async (leagueSeasonId) => {
  const [rows] = await pool.query(
    `SELECT id, starts_at, toss_at, lock_at, status
     FROM fixtures
     WHERE league_season_id = ?
     ORDER BY starts_at ASC, id ASC
     LIMIT 1`,
    [leagueSeasonId]
  );

  return rows[0] || null;
};

const calculateTransferMeta = async ({ usedTransfers, freeTransfers, fixtureStartAt, tossAt, leagueSeasonId, userId }) => {
  const locked = isSquadLocked({ fixtureStartAt, tossAt, lockMinutesBeforeToss: 15 });
  const penalty = transferPenalty({ usedTransfers, freeTransfers, penaltyPerTransfer: 4 });

  if (!leagueSeasonId || !userId) {
    return { locked, penalty };
  }

  const policy = await getLeagueTransferPolicy(leagueSeasonId);

  const [fixtureRows] = await pool.query(
    `SELECT id, starts_at, status,
            ROW_NUMBER() OVER (ORDER BY starts_at ASC, id ASC) AS match_no
     FROM fixtures
     WHERE league_season_id = ?
     ORDER BY starts_at ASC, id ASC`,
    [leagueSeasonId]
  );

  const totalFixtures = fixtureRows.length;
  const firstFixture = fixtureRows[0] || null;
  const now = new Date();
  const firstFixtureStartAt = firstFixture?.starts_at ? new Date(firstFixture.starts_at) : null;
  const firstWindowCloseAt = firstFixtureStartAt
    ? new Date(firstFixtureStartAt.getTime() - 15 * 60 * 1000)
    : null;

  const match1WindowOpen = Boolean(firstWindowCloseAt && now < firstWindowCloseAt);

  const [usageRows] = await pool.query(
    `SELECT
      COALESCE(SUM(CASE WHEN nf.match_no BETWEEN 1 AND ? THEN ms.transfers_used ELSE 0 END), 0) AS league_stage_used,
      COALESCE(SUM(CASE WHEN nf.match_no > ? THEN ms.transfers_used ELSE 0 END), 0) AS playoff_used
     FROM manager_squads ms
     JOIN (
       SELECT id, ROW_NUMBER() OVER (ORDER BY starts_at ASC, id ASC) AS match_no
       FROM fixtures
       WHERE league_season_id = ?
     ) nf ON nf.id = ms.fixture_id
     WHERE ms.user_id = ?`,
    [policy.leagueStageMatchCount, policy.qualifier1MatchNumber, leagueSeasonId, userId]
  );

  const leagueStageUsed = Number(usageRows[0]?.league_stage_used || 0);
  const playoffUsed = Number(usageRows[0]?.playoff_used || 0);

  const stage = match1WindowOpen ? 'PRE_MATCH_1_WINDOW' : 'POST_MATCH_1_LOCKED';
  const unlimited = match1WindowOpen;
  const transferCap = match1WindowOpen ? null : 0;
  const transfersRemaining = match1WindowOpen ? null : 0;

  return {
    locked: !match1WindowOpen,
    penalty,
    stage,
    upcomingMatchNo: firstFixture ? 1 : 0,
    totalFixtures,
    unlimited,
    transferCap,
    transfersRemaining,
    lockMinutesBeforeMatch: 15,
    firstFixtureId: firstFixture ? Number(firstFixture.id) : null,
    firstFixtureStartAt: firstFixture?.starts_at || null,
    firstWindowCloseAt: firstWindowCloseAt || null,
    usage: {
      leagueStageUsed,
      playoffUsed,
    },
    policy,
  };
};

const applySquadTransfers = async ({
  userId,
  leagueSeasonId,
  requestedFixtureId,
  playerIds,
  captainId,
  viceCaptainId,
  impactPlayerId = null,
  booster = 'NONE',
  budgetCap = 100,
}) => {
  if (!userId) throw new AppError('User not found in request', 401);
  if (!leagueSeasonId) throw new AppError('leagueSeasonId is required', 400);
  if (!requestedFixtureId) throw new AppError('fixtureId is required', 400);

  await validateSquadSelection({ playerIds, captainId, viceCaptainId, budgetCap, leagueSeasonId });

  const requestedFixture = await getFirstFixtureForLeague(leagueSeasonId);
  if (!requestedFixture) {
    throw new AppError('No fixture found for this league', 404);
  }

  const requestedIsMatch1 = Number(requestedFixtureId) === Number(requestedFixture.id);

  const meta = await calculateTransferMeta({
    usedTransfers: 0,
    freeTransfers: 0,
    fixtureStartAt: requestedFixture.starts_at,
    tossAt: requestedFixture.toss_at,
    leagueSeasonId,
    userId,
  });

  if (meta.locked) {
    throw new AppError('Transfers are locked. Only Match 1 window is open until 15 minutes before start.', 400);
  }

  if (!requestedIsMatch1) {
    throw new AppError(`Transfers can only be applied to Match 1 (fixture ${requestedFixture.id})`, 400);
  }

  const effectiveFixture = requestedFixture;

  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();

    const [existingSquadRows] = await conn.query(
      `SELECT id, transfers_used
       FROM manager_squads
       WHERE user_id = ? AND fixture_id = ?
       LIMIT 1`,
      [userId, effectiveFixture.id]
    );

    const existingSquad = existingSquadRows[0] || null;
    let existingIds = [];

    if (existingSquad) {
      const [existingPlayerRows] = await conn.query(
        `SELECT player_id
         FROM manager_squad_players
         WHERE squad_id = ?`,
        [existingSquad.id]
      );
      existingIds = existingPlayerRows.map((row) => Number(row.player_id));
    }

    const nextIdSet = new Set((playerIds || []).map((id) => Number(id)));
    const prevIdSet = new Set(existingIds);
    let transferDelta = 0;

    if (existingSquad) {
      for (const id of nextIdSet) {
        if (!prevIdSet.has(id)) transferDelta += 1;
      }
    }

    const selectedPlayers = await getPlayersByIds(playerIds, leagueSeasonId);
    const totalSpent = selectedPlayers.reduce((sum, p) => sum + Number(p.credit_price || 0), 0);
    const transfersUsed = Number(existingSquad?.transfers_used || 0) + transferDelta;

    let squadId;
    if (!existingSquad) {
      const [insertSquad] = await conn.query(
        `INSERT INTO manager_squads (
          user_id, fixture_id, league_season_id, budget_cap, total_spent,
          transfers_used, free_transfers, transfer_penalty_points,
          captain_player_id, vice_captain_player_id, impact_player_id,
          booster, is_locked
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 0)`,
        [
          userId,
          effectiveFixture.id,
          leagueSeasonId,
          budgetCap,
          totalSpent,
          transfersUsed,
          0,
          0,
          captainId,
          viceCaptainId,
          impactPlayerId,
          booster,
        ]
      );
      squadId = insertSquad.insertId;
    } else {
      squadId = existingSquad.id;
      await conn.query(
        `UPDATE manager_squads
         SET league_season_id = ?, budget_cap = ?, total_spent = ?, transfers_used = ?,
             captain_player_id = ?, vice_captain_player_id = ?, impact_player_id = ?, booster = ?
         WHERE id = ?`,
        [
          leagueSeasonId,
          budgetCap,
          totalSpent,
          transfersUsed,
          captainId,
          viceCaptainId,
          impactPlayerId,
          booster,
          squadId,
        ]
      );
    }

    await conn.query('DELETE FROM manager_squad_players WHERE squad_id = ?', [squadId]);
    const valueTuples = playerIds.map(() => '(?, ?, 1)').join(', ');
    const insertValues = playerIds.flatMap((id) => [squadId, Number(id)]);
    await conn.query(
      `INSERT INTO manager_squad_players (squad_id, player_id, is_starting_xi)
       VALUES ${valueTuples}`,
      insertValues
    );

    await conn.commit();

    return {
      appliedToFixtureId: Number(effectiveFixture.id),
      requestedFixtureId: Number(requestedFixture.id),
      deferredToNextFixture: false,
      transferDelta,
      transfersUsed,
      totalSpent: Number(totalSpent.toFixed(1)),
      stage: meta.stage,
      unlimited: meta.unlimited,
      transfersRemainingAfterApply: meta.unlimited ? null : Math.max(0, Number(meta.transfersRemaining || 0) - transferDelta),
    };
  } catch (error) {
    await conn.rollback();
    throw error;
  } finally {
    conn.release();
  }
};

const calculateLivePointsForPlayer = ({ stats, matchType = 'T20', isCaptain, isViceCaptain, booster }) => {
  const basePoints = calculateCricketFantasyPoints({ stats, matchType });
  const boostedPoints = applyBooster({ basePoints, isCaptain, isViceCaptain, booster });
  return { basePoints, boostedPoints };
};

// ─── Transfer Window Status ──────────────────────────────────────────────────

const _fmtCountdown = (seconds) => {
  if (seconds === null || seconds <= 0) return '0s';
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  if (h > 0) return `${h}h ${m}m ${s}s`;
  if (m > 0) return `${m}m ${s}s`;
  return `${s}s`;
};

const _resolveLeagueSeasonId = async (leagueSeasonIdentifier) => {
  const raw = String(leagueSeasonIdentifier || '').trim();
  if (!raw) throw new AppError('leagueSeasonId is required', 400);

  const numericId = Number(raw);
  if (Number.isInteger(numericId) && numericId > 0) {
    const [rowsByNumeric] = await pool.query(
      `SELECT id FROM league_seasons WHERE id = ? LIMIT 1`,
      [String(numericId)]
    );
    if (rowsByNumeric.length) return String(rowsByNumeric[0].id);
  }

  // Accept season_name (e.g. "IPL 2025") and competition-year key (e.g. "IPL_2025").
  const [rows] = await pool.query(
    `SELECT ls.id
     FROM league_seasons ls
     JOIN competitions c ON c.id = ls.competition_id
     WHERE ls.season_name = ?
        OR REPLACE(CONCAT(c.short_name, '_', ls.year), ' ', '') = REPLACE(?, ' ', '')
     ORDER BY ls.id DESC
     LIMIT 1`,
    [raw, raw]
  );

  if (!rows.length) {
    throw new AppError(`League season not found for identifier: ${raw}`, 404);
  }
  return String(rows[0].id);
};

/**
 * Returns the live transfer-window status for a league:
 * – WAITING  : previous match ended but the 15-min cooldown has not elapsed yet
 * – OPEN     : window is open (after cooldown and before lock_at)
 * – LOCKED   : lock_at of the next fixture has been reached
 * – NO_UPCOMING_FIXTURE : no scheduled/live fixture found
 */
const getTransferWindowStatus = async (leagueSeasonId) => {
  const now = new Date();

  const [fixtureRows] = await pool.query(
    `SELECT id, starts_at, toss_at, lock_at, status, transfer_window_opens_at
     FROM fixtures
     WHERE league_season_id = ?
       AND status IN ('SCHEDULED','LIVE')
     ORDER BY starts_at ASC
     LIMIT 1`,
    [leagueSeasonId]
  );

  if (!fixtureRows.length) {
    return {
      leagueSeasonId: String(leagueSeasonId),
      status: 'NO_UPCOMING_FIXTURE',
      windowOpen: false,
      nextFixtureId: null,
      windowOpensAt: null,
      windowClosesAt: null,
      secondsToOpen: null,
      secondsToClose: null,
      countdownLabel: 'No upcoming fixture',
    };
  }

  const fixture = fixtureRows[0];
  const lockAt = new Date(fixture.lock_at);
  const windowOpensAt = fixture.transfer_window_opens_at
    ? new Date(fixture.transfer_window_opens_at)
    : null; // null → always open from creation (first fixture)

  const alreadyLocked  = now >= lockAt;
  const windowStarted  = !windowOpensAt || now >= windowOpensAt;
  const windowOpen     = windowStarted && !alreadyLocked;

  const secondsToOpen  = windowOpensAt && !windowStarted
    ? Math.ceil((windowOpensAt.getTime() - now.getTime()) / 1000)
    : null;

  const secondsToClose = !alreadyLocked
    ? Math.ceil((lockAt.getTime() - now.getTime()) / 1000)
    : 0;

  let windowStatus;
  if (alreadyLocked)       windowStatus = 'LOCKED';
  else if (windowOpen)     windowStatus = 'OPEN';
  else                     windowStatus = 'WAITING';

  let countdownLabel;
  if (alreadyLocked)       countdownLabel = 'Transfer window is locked';
  else if (windowOpen)     countdownLabel = `Window closes in ${_fmtCountdown(secondsToClose)}`;
  else                     countdownLabel = `Window opens in ${_fmtCountdown(secondsToOpen)}`;

  return {
    leagueSeasonId: String(leagueSeasonId),
    status: windowStatus,
    windowOpen,
    nextFixtureId: Number(fixture.id),
    windowOpensAt: windowOpensAt?.toISOString() ?? null,
    windowClosesAt: lockAt.toISOString(),
    secondsToOpen,
    secondsToClose,
    countdownLabel,
  };
};

// ─── Leaderboard ─────────────────────────────────────────────────────────────

const getPlayerLeaderboard = async (leagueSeasonIdentifier, { limit = 100 } = {}) => {
  const leagueSeasonId = await _resolveLeagueSeasonId(leagueSeasonIdentifier);
  const safeLimit = Math.min(Math.max(Number(limit) || 100, 1), 500);

  const [rows] = await pool.query(
    `SELECT
        p.id AS player_id,
        p.full_name,
        p.role,
        COALESCE(lf.team_code, fr.short_name) AS team_code,
        COUNT(DISTINCT pls.fixture_id) AS matches,
        ROUND(SUM(pls.fantasy_points), 2) AS total_points,
        ROUND(AVG(pls.fantasy_points), 2) AS avg_points
     FROM player_live_stats pls
     JOIN fixtures f ON f.id = pls.fixture_id
     JOIN players p ON p.id = pls.player_id
     LEFT JOIN league_season_players lsp
       ON lsp.player_id = p.id
      AND lsp.league_season_id = ?
      AND lsp.is_active = 1
     LEFT JOIN league_franchises lf ON lf.id = lsp.league_franchise_id
     LEFT JOIN franchises fr ON fr.id = p.franchise_id
     WHERE f.league_season_id = ?
       AND f.status = 'COMPLETED'
       AND f.points_finalized_at IS NOT NULL
     GROUP BY p.id, p.full_name, p.role, team_code
     ORDER BY total_points DESC, avg_points DESC, p.full_name ASC
     LIMIT ?`,
    [leagueSeasonId, leagueSeasonId, safeLimit]
  );

  let previousPoints = null;
  let previousRank = 0;
  return rows.map((row, index) => {
    const points = Number(row.total_points || 0);
    const rank = points === previousPoints ? previousRank : index + 1;
    previousPoints = points;
    previousRank = rank;

    return {
      rank,
      playerId: Number(row.player_id),
      name: row.full_name,
      role: row.role,
      team: row.team_code,
      matches: Number(row.matches || 0),
      totalPoints: points,
      avgPoints: Number(row.avg_points || 0),
    };
  });
};

const getManagerLeaderboard = async (leagueSeasonIdentifier, { limit = 100 } = {}) => {
  const leagueSeasonId = await _resolveLeagueSeasonId(leagueSeasonIdentifier);
  const safeLimit = Math.min(Math.max(Number(limit) || 100, 1), 500);

  const [rows] = await pool.query(
    `SELECT
        u.id AS user_id,
        u.name,
        u.email,
        COUNT(DISTINCT ms.fixture_id) AS matches,
        ROUND(SUM(ms.points_total), 2) AS total_points,
        ROUND(AVG(ms.points_total), 2) AS avg_points,
        ROUND(MAX(ms.points_total), 2) AS best_match_points
     FROM manager_squads ms
     JOIN fixtures f ON f.id = ms.fixture_id
     JOIN users u ON u.id = ms.user_id
     WHERE f.league_season_id = ?
       AND f.status = 'COMPLETED'
       AND f.points_finalized_at IS NOT NULL
     GROUP BY u.id, u.name, u.email
     ORDER BY total_points DESC, matches DESC, u.name ASC
     LIMIT ?`,
    [leagueSeasonId, safeLimit]
  );

  let previousPoints = null;
  let previousRank = 0;
  return rows.map((row, index) => {
    const points = Number(row.total_points || 0);
    const rank = points === previousPoints ? previousRank : index + 1;
    previousPoints = points;
    previousRank = rank;

    return {
      rank,
      userId: Number(row.user_id),
      name: row.name,
      email: row.email,
      matches: Number(row.matches || 0),
      totalPoints: points,
      avgPoints: Number(row.avg_points || 0),
      bestMatchPoints: Number(row.best_match_points || 0),
    };
  });
};

const getCombinedLeaderboard = async (leagueSeasonIdentifier, { playersLimit = 100, managersLimit = 100 } = {}) => {
  const [players, managers] = await Promise.all([
    getPlayerLeaderboard(leagueSeasonIdentifier, { limit: playersLimit }),
    getManagerLeaderboard(leagueSeasonIdentifier, { limit: managersLimit }),
  ]);

  return {
    players,
    managers,
    generatedAt: new Date().toISOString(),
  };
};

// ─── Points Finalization ─────────────────────────────────────────────────────

/**
 * Calculate and persist fantasy points for all players + squads of a fixture.
 * Fixture must have status = 'COMPLETED'.
 * Captain gets 2× (or 3× with TRIPLE_CAPTAIN booster), VC gets 1.5×.
 */
const finalizeMatchPoints = async (fixtureId) => {
  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();

    // 1. Validate fixture
    const [fixtureRows] = await conn.query(
      `SELECT id, league_season_id, match_type, status FROM fixtures WHERE id = ? LIMIT 1`,
      [Number(fixtureId)]
    );
    if (!fixtureRows.length) throw new AppError('Fixture not found', 404);
    const fixture = fixtureRows[0];
    if (fixture.status !== 'COMPLETED') {
      throw new AppError('Cannot finalize points: fixture is not COMPLETED', 400);
    }

    // 2. Compute base fantasy points per player
    const [statsRows] = await conn.query(
      `SELECT * FROM player_live_stats WHERE fixture_id = ?`,
      [Number(fixtureId)]
    );

    const playerPointsMap = {};
    for (const row of statsRows) {
      const pts = calculateCricketFantasyPoints({
        stats: row,
        matchType: fixture.match_type || 'T20',
      });
      playerPointsMap[Number(row.player_id)] = pts;
      await conn.query(
        `UPDATE player_live_stats SET fantasy_points = ? WHERE fixture_id = ? AND player_id = ?`,
        [pts, Number(fixtureId), Number(row.player_id)]
      );
    }

    // 3. Apply captain / VC multiplier per squad and sum squad totals
    const [squadRows] = await conn.query(
      `SELECT id, captain_player_id, vice_captain_player_id, booster
       FROM manager_squads
       WHERE fixture_id = ?`,
      [Number(fixtureId)]
    );

    for (const squad of squadRows) {
      const [squadPlayers] = await conn.query(
        `SELECT player_id FROM manager_squad_players WHERE squad_id = ? AND is_starting_xi = 1`,
        [squad.id]
      );

      let squadTotal = 0;
      for (const sp of squadPlayers) {
        const playerId   = Number(sp.player_id);
        const basePoints = playerPointsMap[playerId] ?? 0;
        const isCaptain  = playerId === Number(squad.captain_player_id);
        const isViceCap  = playerId === Number(squad.vice_captain_player_id);

        const playerPoints = applyBooster({
          basePoints,
          isCaptain,
          isViceCaptain: isViceCap,
          booster: squad.booster,
        });

        await conn.query(
          `UPDATE manager_squad_players SET fantasy_points = ? WHERE squad_id = ? AND player_id = ?`,
          [Number(playerPoints.toFixed(2)), squad.id, playerId]
        );

        squadTotal += playerPoints;
      }

      await conn.query(
        `UPDATE manager_squads SET points_total = ? WHERE id = ?`,
        [Number(squadTotal.toFixed(2)), squad.id]
      );
    }

    const finalizedAt = new Date();
    await conn.query(
      `UPDATE fixtures SET points_finalized_at = ? WHERE id = ?`,
      [finalizedAt, Number(fixtureId)]
    );

    await conn.commit();
    return {
      fixtureId:        Number(fixtureId),
      leagueSeasonId:   String(fixture.league_season_id),
      matchType:        fixture.match_type,
      playersProcessed: statsRows.length,
      squadsProcessed:  squadRows.length,
      pointsFinalizedAt: finalizedAt.toISOString(),
    };
  } catch (err) {
    await conn.rollback();
    throw err;
  } finally {
    conn.release();
  }
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
  getLeagueTransferPolicy,
  upsertLeagueTransferPolicy,
  validateSquadSelection,
  applySquadTransfers,
  calculateTransferMeta,
  calculateLivePointsForPlayer,
  getTransferWindowStatus,
  getPlayerLeaderboard,
  getManagerLeaderboard,
  getCombinedLeaderboard,
  finalizeMatchPoints,
  predictionPoints,
  quizPoints,
};
