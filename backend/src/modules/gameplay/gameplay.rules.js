const SQUAD_LIMITS = {
  TOTAL_PLAYERS: 11,
  BUDGET_CREDITS: 100,
  MAX_PER_FRANCHISE: 7,
  ROLE_LIMITS: {
    WK: { min: 1, max: 4 },
    BAT: { min: 3, max: 6 },
    AR: { min: 1, max: 4 },
    BOWL: { min: 3, max: 6 },
  },
};

const ensure = (condition, message) => {
  if (!condition) throw new Error(message);
};

const normalizeCountry = (value) =>
  String(value || "")
    .trim()
    .toLowerCase();

const validateSquad = ({
  players,
  captainId,
  viceCaptainId,
  budgetCap = 100,
  homeCountry = null,
  maxAwayPlayers = 4,
}) => {
  ensure(Array.isArray(players), "Players must be an array");
  ensure(
    players.length === SQUAD_LIMITS.TOTAL_PLAYERS,
    "Squad must have exactly 11 players",
  );
  const effectiveBudgetCap = Math.min(
    Number(budgetCap) || SQUAD_LIMITS.BUDGET_CREDITS,
    SQUAD_LIMITS.BUDGET_CREDITS,
  );

  const idSet = new Set(players.map((p) => Number(p.id)));
  ensure(idSet.size === players.length, "Duplicate players are not allowed");

  const nameSet = new Set(
    players.map((p) =>
      String(p.full_name || "")
        .trim()
        .toLowerCase(),
    ),
  );
  ensure(
    nameSet.size === players.length,
    "Duplicate player names are not allowed",
  );

  const counts = { WK: 0, BAT: 0, AR: 0, BOWL: 0 };
  const teamCount = {};

  let totalCredits = 0;
  let awayPlayers = 0;
  for (const p of players) {
    ensure(SQUAD_LIMITS.ROLE_LIMITS[p.role], `Invalid role '${p.role}'`);
    totalCredits += Number(p.credit_price || 0);
    counts[p.role] += 1;
    const teamKey =
      p.league_team_code ||
      `franchise_${p.league_franchise_id || p.franchise_id}`;
    teamCount[teamKey] = (teamCount[teamKey] || 0) + 1;

    if (
      homeCountry &&
      normalizeCountry(p.country) !== normalizeCountry(homeCountry)
    ) {
      awayPlayers += 1;
    }
  }

  ensure(
    totalCredits <= effectiveBudgetCap,
    `Budget exceeded. Used ${totalCredits}, cap ${effectiveBudgetCap}`,
  );
  if (homeCountry) {
    ensure(
      awayPlayers <= maxAwayPlayers,
      `Maximum ${maxAwayPlayers} away players allowed`,
    );
  }

  for (const [role, limit] of Object.entries(SQUAD_LIMITS.ROLE_LIMITS)) {
    ensure(
      counts[role] >= limit.min && counts[role] <= limit.max,
      `${role} must be between ${limit.min} and ${limit.max}`,
    );
  }

  for (const [teamKey, c] of Object.entries(teamCount)) {
    ensure(
      c <= SQUAD_LIMITS.MAX_PER_FRANCHISE,
      `Too many players from team ${teamKey}. Maximum ${SQUAD_LIMITS.MAX_PER_FRANCHISE}`,
    );
  }

  ensure(idSet.has(Number(captainId)), "Captain must be part of squad");
  ensure(
    idSet.has(Number(viceCaptainId)),
    "Vice-Captain must be part of squad",
  );
  ensure(
    Number(captainId) !== Number(viceCaptainId),
    "Captain and Vice-Captain must be different",
  );

  return {
    valid: true,
    totalCredits,
    awayPlayers,
    homeCountry,
    roleCounts: counts,
    teamCount,
  };
};

const isSquadLocked = ({
  fixtureStartAt,
  tossAt,
  lockMinutesBeforeToss = 30,
  now = new Date(),
}) => {
  const tossTime = tossAt ? new Date(tossAt) : new Date(fixtureStartAt);
  const lockAt = new Date(
    tossTime.getTime() - lockMinutesBeforeToss * 60 * 1000,
  );
  return now >= lockAt;
};

const transferPenalty = ({
  usedTransfers,
  freeTransfers,
  penaltyPerTransfer = 4,
}) => {
  if (usedTransfers <= freeTransfers) return 0;
  return (usedTransfers - freeTransfers) * penaltyPerTransfer;
};

const applyBooster = ({ basePoints, isCaptain, isViceCaptain, booster }) => {
  if (!isCaptain && !isViceCaptain) return basePoints;
  if (isCaptain && booster === "TRIPLE_CAPTAIN") return basePoints * 3;
  if (isCaptain) return basePoints * 2;
  if (isViceCaptain) return basePoints * 1.5;
  return basePoints;
};

/**
 * Calculate cricket fantasy points following Dream11 rules.
 *
 * @param {object} stats           – row from player_live_stats (or equivalent object)
 * @param {string} matchType       – 'T20' | 'ODI' | 'TEST' | 'T10'  (default 'T20')
 * @param {object} config          – optional overrides (not normally needed)
 * @returns {number}               – total fantasy points (rounded to 2 dp)
 */
const calculateCricketFantasyPoints = ({
  stats,
  matchType = "T20",
  config = {},
}) => {
  const type = String(matchType || "T20").toUpperCase();
  let points = 0;

  // ── Playing XI bonus (+2) ────────────────────────────────────────────────
  if (stats.is_playing_xi) {
    points += 2;
  }

  // ── Batting ──────────────────────────────────────────────────────────────
  const runs = stats.runs || 0;
  const fours = stats.fours || 0;
  const sixes = stats.sixes || 0;
  const ballsFaced = stats.balls_faced || 0;

  points += runs * 0.5; // +0.5 per run
  points += fours * 0.5; // +0.5 boundary bonus
  points += sixes * 1; // +1 six bonus

  // Milestone bonuses (cumulative)
  if (runs >= 50) points += 4; // half-century
  if (runs >= 100) points += 8; // century
  if (runs >= 150) points += 12; // 150-run bonus
  if (runs >= 200) points += 16; // 200-run bonus

  // Duck: -2 (player batted, scored 0, was dismissed)
  // "If dismissed without facing a ball, no strike-rate points" is handled below.
  if (stats.did_bat && stats.is_duck) {
    points -= 2;
  }

  // Strike-rate bonus/penalty — T20 & T10 only, min 10 balls faced
  if ((type === "T20" || type === "T10") && ballsFaced >= 10) {
    const sr = (runs / ballsFaced) * 100;
    if (sr >= 170) points += 6;
    else if (sr > 150 && sr < 170) points += 4;
    else if (sr >= 130 && sr <= 150) points += 2;
    // 70.01–129.99 → no bonus/penalty
    else if (sr >= 60.01 && sr <= 70) points -= 2;
    else if (sr >= 50.01 && sr <= 60) points -= 4;
    else if (sr <= 50) points -= 6;
  }

  // ── Bowling ──────────────────────────────────────────────────────────────
  const wickets = stats.wickets || 0;
  const maidens = stats.maidens || 0;
  const economyRate = stats.economy_rate || 0;
  const ballsBowled = stats.balls_bowled || 0;
  const lbwWickets = stats.lbw_wickets || 0;
  const bowledWickets = stats.bowled_wickets || 0;

  points += wickets * 10; // +10 per wicket (excl. run-outs)

  // Wicket haul bonuses — cumulative per rules note
  if (wickets >= 3) points += 6; // 3-wicket haul
  if (wickets >= 4) points += 8; // 4-wicket haul
  if (wickets >= 5) points += 10; // 5-wicket haul

  // LBW / Bowled bonus: +2 per dismissal
  points += (lbwWickets + bowledWickets) * 2;

  // Maiden overs: +4 (not in Test)
  if (type !== "TEST") {
    points += maidens * 4;
  }

  // Economy rate bonus/penalty
  // Minimum overs: T20 → 2 overs (12 balls), ODI → 5 overs (30 balls), T10 → 1 over (6 balls)
  const minBalls = type === "ODI" ? 30 : type === "T20" ? 12 : 6;
  if (type !== "TEST" && ballsBowled >= minBalls) {
    const econ = Number(economyRate);
    if (type === "T10") {
      if (econ <= 3.9) points += 4;
      else if (econ >= 4.0 && econ <= 4.9) points += 3;
      else if (econ >= 5.0 && econ <= 5.9) points += 2;
      else if (econ >= 10.0 && econ <= 11.0) points -= 2;
      else if (econ >= 11.1 && econ <= 12.0) points -= 3;
      else if (econ >= 12.1) points -= 4;
    } else {
      // T20 & ODI share the same economy bands
      if (econ <= 3.9) points += 6;
      else if (econ >= 4.0 && econ <= 4.9) points += 4;
      else if (econ >= 5.0 && econ <= 5.9) points += 2;
      else if (econ >= 10.0 && econ <= 11.0) points -= 2;
      else if (econ >= 11.1 && econ <= 12.0) points -= 4;
      else if (econ >= 12.1) points -= 6;
    }
  }

  // ── Fielding ─────────────────────────────────────────────────────────────
  const catches = stats.catches || 0;
  const stumpings = stats.stumpings || 0;
  const directRunouts = stats.direct_hit_runouts || 0;
  const indirectThrows = stats.indirect_runout_throws || 0;
  const indirectCatches = stats.indirect_runout_catches || 0;

  points += catches * 4; // +4 per catch
  points += stumpings * 6; // +6 per stumping
  points += directRunouts * 6; // +6 direct run-out
  // Non-direct run-out: +4 for thrower, +2 for last catcher
  points += indirectThrows * 4;
  points += indirectCatches * 2;

  // Catch haul bonuses (cumulative)
  if (catches >= 3) points += 4; // 3-catch haul
  if (catches >= 4) points += 6; // 4-catch haul
  if (catches >= 5) points += 8; // 5-catch haul

  // Allow callers to override any value after base calculation
  if (typeof config.pointsAdjust === "number") {
    points += config.pointsAdjust;
  }

  return Number(points.toFixed(2));
};

module.exports = {
  SQUAD_LIMITS,
  validateSquad,
  isSquadLocked,
  transferPenalty,
  applyBooster,
  calculateCricketFantasyPoints,
};
