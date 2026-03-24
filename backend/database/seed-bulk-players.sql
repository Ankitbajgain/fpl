-- Bulk synthetic players + league distribution seed
-- Creates 1000 deterministic players: Seed Player 0001 ... Seed Player 1000
-- Distribution for playable active leagues:
--   0001-0350: in all playable active leagues
--   0351-0800: in exactly one playable active league
--   0801-1000: in no league

USE new_fpl;

-- Prerequisite note: run demo-seed.sql and seed-multi-league.sql first.

DROP TEMPORARY TABLE IF EXISTS tmp_numbers;
CREATE TEMPORARY TABLE tmp_numbers (n INT PRIMARY KEY);

INSERT INTO tmp_numbers (n)
WITH RECURSIVE seq AS (
  SELECT 1 AS n
  UNION ALL
  SELECT n + 1 FROM seq WHERE n < 1000
)
SELECT n FROM seq;

DROP TEMPORARY TABLE IF EXISTS tmp_franchise_pool;
CREATE TEMPORARY TABLE tmp_franchise_pool AS
SELECT
  ROW_NUMBER() OVER (ORDER BY id) AS rn,
  id AS franchise_id
FROM franchises
WHERE is_active = 1;

SET @franchise_count := (SELECT COUNT(*) FROM tmp_franchise_pool);

-- Idempotent player insert keyed by deterministic full_name.
INSERT INTO players (full_name, role, franchise_id, credit_price, is_active, ownership_percent)
SELECT
  CONCAT('Seed Player ', LPAD(tn.n, 4, '0')) AS full_name,
  CASE MOD(tn.n, 4)
    WHEN 1 THEN 'WK'
    WHEN 2 THEN 'BAT'
    WHEN 3 THEN 'AR'
    ELSE 'BOWL'
  END AS role,
  tfp.franchise_id,
  ROUND(6.0 + (MOD(tn.n, 45) / 10), 1) AS credit_price,
  1 AS is_active,
  0 AS ownership_percent
FROM tmp_numbers tn
JOIN tmp_franchise_pool tfp ON tfp.rn = 1 + MOD(tn.n - 1, @franchise_count)
WHERE NOT EXISTS (
  SELECT 1
  FROM players p
  WHERE p.full_name = CONCAT('Seed Player ', LPAD(tn.n, 4, '0'))
);

DROP TEMPORARY TABLE IF EXISTS tmp_seed_players;
CREATE TEMPORARY TABLE tmp_seed_players AS
SELECT
  p.id,
  CAST(SUBSTRING(p.full_name, 13) AS UNSIGNED) AS seed_no,
  p.credit_price
FROM players p
WHERE p.full_name REGEXP '^Seed Player [0-9]{4}$';

-- Assign deterministic nationalities for new synthetic players.
INSERT IGNORE INTO player_nationalities (player_id, nation_id)
SELECT
  tsp.id,
  1 + MOD(tsp.seed_no - 1, 14) AS nation_id
FROM tmp_seed_players tsp;

-- Playable active leagues are active leagues that actually have league_franchises.
DROP TEMPORARY TABLE IF EXISTS tmp_playable_active_leagues;
CREATE TEMPORARY TABLE tmp_playable_active_leagues AS
SELECT
  ROW_NUMBER() OVER (ORDER BY ls.id) AS rn,
  ls.id AS league_season_id
FROM league_seasons ls
WHERE ls.status = 'active'
  AND EXISTS (
    SELECT 1
    FROM league_franchises lf
    WHERE lf.league_season_id = ls.id
  );

SET @playable_active_league_count := (SELECT COUNT(*) FROM tmp_playable_active_leagues);

DROP TEMPORARY TABLE IF EXISTS tmp_active_league_franchise_pool;
CREATE TEMPORARY TABLE tmp_active_league_franchise_pool AS
SELECT
  lf.league_season_id,
  ROW_NUMBER() OVER (PARTITION BY lf.league_season_id ORDER BY lf.id) AS rn,
  lf.id AS league_franchise_id
FROM league_franchises lf
JOIN tmp_playable_active_leagues pal ON pal.league_season_id = lf.league_season_id
WHERE lf.is_active = 1;

DROP TEMPORARY TABLE IF EXISTS tmp_active_league_counts;
CREATE TEMPORARY TABLE tmp_active_league_counts AS
SELECT
  league_season_id,
  COUNT(*) AS franchise_count
FROM tmp_active_league_franchise_pool
GROUP BY league_season_id;

-- Group A: Seed 0001-0350 -> add to all playable active leagues.
INSERT IGNORE INTO league_season_players (league_season_id, player_id, league_franchise_id, base_credits, is_active)
SELECT
  pal.league_season_id,
  tsp.id,
  talfp.league_franchise_id,
  ROUND(tsp.credit_price + ((CAST(MOD(tsp.seed_no + pal.rn, 5) AS SIGNED) - 2) * 0.1), 1) AS base_credits,
  1 AS is_active
FROM tmp_seed_players tsp
JOIN tmp_playable_active_leagues pal
JOIN tmp_active_league_counts talc ON talc.league_season_id = pal.league_season_id
JOIN tmp_active_league_franchise_pool talfp
  ON talfp.league_season_id = pal.league_season_id
 AND talfp.rn = 1 + MOD(tsp.seed_no + pal.rn - 1, talc.franchise_count)
WHERE tsp.seed_no BETWEEN 1 AND 350;

-- Group B: Seed 0351-0800 -> add to exactly one playable active league.
INSERT IGNORE INTO league_season_players (league_season_id, player_id, league_franchise_id, base_credits, is_active)
SELECT
  pal.league_season_id,
  tsp.id,
  talfp.league_franchise_id,
  ROUND(tsp.credit_price + ((CAST(MOD(tsp.seed_no + pal.rn, 7) AS SIGNED) - 3) * 0.1), 1) AS base_credits,
  1 AS is_active
FROM tmp_seed_players tsp
JOIN tmp_playable_active_leagues pal
  ON pal.rn = 1 + MOD(tsp.seed_no - 351, @playable_active_league_count)
JOIN tmp_active_league_counts talc ON talc.league_season_id = pal.league_season_id
JOIN tmp_active_league_franchise_pool talfp
  ON talfp.league_season_id = pal.league_season_id
 AND talfp.rn = 1 + MOD(tsp.seed_no + pal.rn - 1, talc.franchise_count)
WHERE tsp.seed_no BETWEEN 351 AND 800;

-- Group C: Seed 0801-1000 -> intentionally in no league.

-- Quick summary output.
SELECT
  SUM(CASE WHEN seed_no BETWEEN 1 AND 350 THEN 1 ELSE 0 END) AS all_active_seed_players,
  SUM(CASE WHEN seed_no BETWEEN 351 AND 800 THEN 1 ELSE 0 END) AS one_active_seed_players,
  SUM(CASE WHEN seed_no BETWEEN 801 AND 1000 THEN 1 ELSE 0 END) AS no_league_seed_players,
  @playable_active_league_count AS playable_active_leagues
FROM tmp_seed_players;
