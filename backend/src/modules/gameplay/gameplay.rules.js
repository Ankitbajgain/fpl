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

const normalizeCountry = (value) => String(value || '').trim().toLowerCase();

const validateSquad = ({ players, captainId, viceCaptainId, budgetCap = 100, homeCountry = null, maxAwayPlayers = 4 }) => {
  ensure(Array.isArray(players), 'Players must be an array');
  ensure(players.length === SQUAD_LIMITS.TOTAL_PLAYERS, 'Squad must have exactly 11 players');
  const effectiveBudgetCap = Math.min(Number(budgetCap) || SQUAD_LIMITS.BUDGET_CREDITS, SQUAD_LIMITS.BUDGET_CREDITS);

  const idSet = new Set(players.map((p) => Number(p.id)));
  ensure(idSet.size === players.length, 'Duplicate players are not allowed');

  const nameSet = new Set(players.map((p) => String(p.full_name || '').trim().toLowerCase()));
  ensure(nameSet.size === players.length, 'Duplicate player names are not allowed');

  const counts = { WK: 0, BAT: 0, AR: 0, BOWL: 0 };
  const teamCount = {};

  let totalCredits = 0;
  let awayPlayers = 0;
  for (const p of players) {
    ensure(SQUAD_LIMITS.ROLE_LIMITS[p.role], `Invalid role '${p.role}'`);
    totalCredits += Number(p.credit_price || 0);
    counts[p.role] += 1;
    const teamKey = p.league_team_code || `franchise_${p.league_franchise_id || p.franchise_id}`;
    teamCount[teamKey] = (teamCount[teamKey] || 0) + 1;

    if (homeCountry && normalizeCountry(p.country) !== normalizeCountry(homeCountry)) {
      awayPlayers += 1;
    }
  }

  ensure(totalCredits <= effectiveBudgetCap, `Budget exceeded. Used ${totalCredits}, cap ${effectiveBudgetCap}`);
  if (homeCountry) {
    ensure(awayPlayers <= maxAwayPlayers, `Maximum ${maxAwayPlayers} away players allowed`);
  }

  for (const [role, limit] of Object.entries(SQUAD_LIMITS.ROLE_LIMITS)) {
    ensure(counts[role] >= limit.min && counts[role] <= limit.max, `${role} must be between ${limit.min} and ${limit.max}`);
  }

  for (const [teamKey, c] of Object.entries(teamCount)) {
    ensure(c <= SQUAD_LIMITS.MAX_PER_FRANCHISE, `Too many players from team ${teamKey}. Maximum ${SQUAD_LIMITS.MAX_PER_FRANCHISE}`);
  }

  ensure(idSet.has(Number(captainId)), 'Captain must be part of squad');
  ensure(idSet.has(Number(viceCaptainId)), 'Vice-Captain must be part of squad');
  ensure(Number(captainId) !== Number(viceCaptainId), 'Captain and Vice-Captain must be different');

  return {
    valid: true,
    totalCredits,
    awayPlayers,
    homeCountry,
    roleCounts: counts,
    teamCount,
  };
};

const isSquadLocked = ({ fixtureStartAt, tossAt, lockMinutesBeforeToss = 30, now = new Date() }) => {
  const tossTime = tossAt ? new Date(tossAt) : new Date(fixtureStartAt);
  const lockAt = new Date(tossTime.getTime() - lockMinutesBeforeToss * 60 * 1000);
  return now >= lockAt;
};

const transferPenalty = ({ usedTransfers, freeTransfers, penaltyPerTransfer = 4 }) => {
  if (usedTransfers <= freeTransfers) return 0;
  return (usedTransfers - freeTransfers) * penaltyPerTransfer;
};

const applyBooster = ({ basePoints, isCaptain, isViceCaptain, booster }) => {
  if (!isCaptain && !isViceCaptain) return basePoints;
  if (isCaptain && booster === 'TRIPLE_CAPTAIN') return basePoints * 3;
  if (isCaptain) return basePoints * 2;
  if (isViceCaptain) return basePoints * 1.5;
  return basePoints;
};

const calculateCricketFantasyPoints = ({ stats, teamWon = false, isAway = false, config = {} }) => {
  const rules = {
    run: 1,
    boundary: 1,
    six: 2,
    fifty: 8,
    hundred: 16,
    wicket: 25,
    maiden: 8,
    threeWicketHaul: 12,
    catch: 8,
    stumpingOrDirectHit: 12,
    duck: -2,
    poorEconomy: -2,
    droppedCatch: -1,
    winBonus: 10,
    losePenalty: -10,
    awayMultiplier: 1.1,
    ...config,
  };

  let points = 0;

  points += (stats.runs || 0) * rules.run;
  points += (stats.fours || 0) * rules.boundary;
  points += (stats.sixes || 0) * rules.six;

  if ((stats.runs || 0) >= 50) points += rules.fifty;
  if ((stats.runs || 0) >= 100) points += rules.hundred;

  points += (stats.wickets || 0) * rules.wicket;
  points += (stats.maidens || 0) * rules.maiden;
  if (stats.wickets >= 3) points += rules.threeWicketHaul;

  points += (stats.catches || 0) * rules.catch;
  points += (stats.stumpings || 0) * rules.stumpingOrDirectHit;
  points += (stats.direct_hit_runouts || 0) * rules.stumpingOrDirectHit;

  if (stats.is_duck) points += rules.duck;
  if (stats.poor_economy) points += rules.poorEconomy;
  points += (stats.dropped_catches || 0) * rules.droppedCatch;

  points += teamWon ? rules.winBonus : rules.losePenalty;

  if (isAway) points *= rules.awayMultiplier;

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
