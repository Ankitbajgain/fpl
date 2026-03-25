-- Cleanup duplicate players by full_name
-- Keeps the smallest player id as canonical and remaps all references.
-- Safe to run multiple times.

USE new_fpl;

DROP TEMPORARY TABLE IF EXISTS tmp_canonical_players;
CREATE TEMPORARY TABLE tmp_canonical_players AS
SELECT
  LOWER(TRIM(full_name)) AS normalized_name,
  MIN(id) AS canonical_id,
  COUNT(*) AS row_count
FROM players
GROUP BY LOWER(TRIM(full_name))
HAVING COUNT(*) > 1;

DROP TEMPORARY TABLE IF EXISTS tmp_duplicate_map;
CREATE TEMPORARY TABLE tmp_duplicate_map AS
SELECT
  p.id AS duplicate_id,
  tcp.canonical_id
FROM players p
JOIN tmp_canonical_players tcp
  ON LOWER(TRIM(p.full_name)) = tcp.normalized_name
WHERE p.id <> tcp.canonical_id;

DROP TEMPORARY TABLE IF EXISTS tmp_affected_player_ids;
CREATE TEMPORARY TABLE tmp_affected_player_ids (
  player_id BIGINT UNSIGNED PRIMARY KEY
);

INSERT IGNORE INTO tmp_affected_player_ids (player_id)
SELECT duplicate_id FROM tmp_duplicate_map;

INSERT IGNORE INTO tmp_affected_player_ids (player_id)
SELECT canonical_id FROM tmp_duplicate_map;

-- If there are no duplicates, all statements below are effectively no-ops.

-- Simple foreign key updates (no unique conflict risk)
UPDATE fixtures f
JOIN tmp_duplicate_map m ON f.motm_player_id = m.duplicate_id
SET f.motm_player_id = m.canonical_id;

UPDATE manager_squads ms
JOIN tmp_duplicate_map m ON ms.captain_player_id = m.duplicate_id
SET ms.captain_player_id = m.canonical_id;

UPDATE manager_squads ms
JOIN tmp_duplicate_map m ON ms.vice_captain_player_id = m.duplicate_id
SET ms.vice_captain_player_id = m.canonical_id;

UPDATE manager_squads ms
JOIN tmp_duplicate_map m ON ms.impact_player_id = m.duplicate_id
SET ms.impact_player_id = m.canonical_id;

UPDATE predictions pr
JOIN tmp_duplicate_map m ON pr.predicted_motm_player_id = m.duplicate_id
SET pr.predicted_motm_player_id = m.canonical_id;

UPDATE predictions pr
JOIN tmp_duplicate_map m ON pr.predicted_top_scorer_id = m.duplicate_id
SET pr.predicted_top_scorer_id = m.canonical_id;

UPDATE predictions pr
JOIN tmp_duplicate_map m ON pr.predicted_top_wicket_taker_id = m.duplicate_id
SET pr.predicted_top_wicket_taker_id = m.canonical_id;

UPDATE admin_player_price_logs apl
JOIN tmp_duplicate_map m ON apl.player_id = m.duplicate_id
SET apl.player_id = m.canonical_id;

UPDATE ai_recommendations ar
JOIN tmp_duplicate_map m ON ar.player_id = m.duplicate_id
SET ar.player_id = m.canonical_id;

-- Merge manager_squad_players on (squad_id, player_id)
DROP TEMPORARY TABLE IF EXISTS tmp_squad_players_merged;
CREATE TEMPORARY TABLE tmp_squad_players_merged AS
SELECT
  msp.squad_id,
  COALESCE(m.canonical_id, msp.player_id) AS player_id,
  MAX(msp.is_starting_xi) AS is_starting_xi
FROM manager_squad_players msp
LEFT JOIN tmp_duplicate_map m ON msp.player_id = m.duplicate_id
WHERE msp.player_id IN (SELECT player_id FROM tmp_affected_player_ids)
GROUP BY msp.squad_id, COALESCE(m.canonical_id, msp.player_id);

DELETE FROM manager_squad_players
WHERE player_id IN (SELECT player_id FROM tmp_affected_player_ids);

INSERT IGNORE INTO manager_squad_players (squad_id, player_id, is_starting_xi)
SELECT squad_id, player_id, is_starting_xi
FROM tmp_squad_players_merged;

-- Merge league_season_players on (league_season_id, player_id, league_franchise_id)
DROP TEMPORARY TABLE IF EXISTS tmp_lsp_merged;
CREATE TEMPORARY TABLE tmp_lsp_merged AS
SELECT
  lsp.league_season_id,
  COALESCE(m.canonical_id, lsp.player_id) AS player_id,
  lsp.league_franchise_id,
  MAX(lsp.base_credits) AS base_credits,
  MAX(lsp.is_active) AS is_active
FROM league_season_players lsp
LEFT JOIN tmp_duplicate_map m ON lsp.player_id = m.duplicate_id
WHERE lsp.player_id IN (SELECT player_id FROM tmp_affected_player_ids)
GROUP BY lsp.league_season_id, COALESCE(m.canonical_id, lsp.player_id), lsp.league_franchise_id;

DELETE FROM league_season_players
WHERE player_id IN (SELECT player_id FROM tmp_affected_player_ids);

INSERT IGNORE INTO league_season_players (league_season_id, player_id, league_franchise_id, base_credits, is_active)
SELECT league_season_id, player_id, league_franchise_id, base_credits, is_active
FROM tmp_lsp_merged;

-- Merge player_live_stats on (fixture_id, player_id)
DROP TEMPORARY TABLE IF EXISTS tmp_live_stats_merged;
CREATE TEMPORARY TABLE tmp_live_stats_merged AS
SELECT
  pls.fixture_id,
  COALESCE(m.canonical_id, pls.player_id) AS player_id,
  MAX(pls.franchise_id) AS franchise_id,
  MAX(pls.runs) AS runs,
  MAX(pls.fours) AS fours,
  MAX(pls.sixes) AS sixes,
  MAX(pls.balls_faced) AS balls_faced,
  MAX(pls.is_duck) AS is_duck,
  MAX(pls.wickets) AS wickets,
  MAX(pls.maidens) AS maidens,
  MAX(pls.economy_rate) AS economy_rate,
  MAX(pls.three_wicket_haul) AS three_wicket_haul,
  MAX(pls.catches) AS catches,
  MAX(pls.stumpings) AS stumpings,
  MAX(pls.direct_hit_runouts) AS direct_hit_runouts,
  MAX(pls.dropped_catches) AS dropped_catches
FROM player_live_stats pls
LEFT JOIN tmp_duplicate_map m ON pls.player_id = m.duplicate_id
WHERE pls.player_id IN (SELECT player_id FROM tmp_affected_player_ids)
GROUP BY pls.fixture_id, COALESCE(m.canonical_id, pls.player_id);

DELETE FROM player_live_stats
WHERE player_id IN (SELECT player_id FROM tmp_affected_player_ids);

INSERT INTO player_live_stats (
  fixture_id, player_id, franchise_id, runs, fours, sixes, balls_faced,
  is_duck, wickets, maidens, economy_rate, three_wicket_haul, catches,
  stumpings, direct_hit_runouts, dropped_catches
)
SELECT
  fixture_id, player_id, franchise_id, runs, fours, sixes, balls_faced,
  is_duck, wickets, maidens, economy_rate, three_wicket_haul, catches,
  stumpings, direct_hit_runouts, dropped_catches
FROM tmp_live_stats_merged;

-- Merge dream_team_players on (dream_team_id, player_id)
DROP TEMPORARY TABLE IF EXISTS tmp_dream_players_merged;
CREATE TEMPORARY TABLE tmp_dream_players_merged AS
SELECT
  dtp.dream_team_id,
  COALESCE(m.canonical_id, dtp.player_id) AS player_id,
  MAX(dtp.role) AS role
FROM dream_team_players dtp
LEFT JOIN tmp_duplicate_map m ON dtp.player_id = m.duplicate_id
WHERE dtp.player_id IN (SELECT player_id FROM tmp_affected_player_ids)
GROUP BY dtp.dream_team_id, COALESCE(m.canonical_id, dtp.player_id);

DELETE FROM dream_team_players
WHERE player_id IN (SELECT player_id FROM tmp_affected_player_ids);

INSERT IGNORE INTO dream_team_players (dream_team_id, player_id, role)
SELECT dream_team_id, player_id, role
FROM tmp_dream_players_merged;

-- Merge player_nationalities to canonical player ids
DROP TEMPORARY TABLE IF EXISTS tmp_player_nationality_merged;
CREATE TEMPORARY TABLE tmp_player_nationality_merged AS
SELECT
  m.canonical_id AS player_id,
  COALESCE(
    MAX(CASE WHEN pn.player_id = m.canonical_id THEN pn.nation_id END),
    MAX(CASE WHEN pn.player_id = m.duplicate_id THEN pn.nation_id END)
  ) AS nation_id
FROM tmp_duplicate_map m
LEFT JOIN player_nationalities pn
  ON pn.player_id = m.canonical_id OR pn.player_id = m.duplicate_id
GROUP BY m.canonical_id;

DELETE FROM player_nationalities
WHERE player_id IN (SELECT player_id FROM tmp_affected_player_ids);

INSERT IGNORE INTO player_nationalities (player_id, nation_id)
SELECT player_id, nation_id
FROM tmp_player_nationality_merged
WHERE nation_id IS NOT NULL;

-- Finally remove duplicate player rows
DELETE p
FROM players p
JOIN tmp_duplicate_map m ON p.id = m.duplicate_id;

-- Optional safety: enforce unique full_name for future inserts.
SET @has_uq_players_full_name := (
  SELECT COUNT(*)
  FROM information_schema.statistics
  WHERE table_schema = DATABASE()
    AND table_name = 'players'
    AND index_name = 'uq_players_full_name'
);

SET @create_uq_sql := IF(
  @has_uq_players_full_name = 0,
  'ALTER TABLE players ADD UNIQUE KEY uq_players_full_name (full_name)',
  'SELECT 1'
);

PREPARE stmt FROM @create_uq_sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Verification output
SELECT COUNT(*) AS duplicate_name_groups_remaining
FROM (
  SELECT LOWER(TRIM(full_name)) AS normalized_name
  FROM players
  GROUP BY LOWER(TRIM(full_name))
  HAVING COUNT(*) > 1
) t;
