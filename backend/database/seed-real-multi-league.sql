-- Real multi-league seed
-- 1) Removes synthetic Seed Player #### data
-- 2) Seeds real players across IPL, PSL, BPL, BBL, NPL
-- 3) Supports cross-league player participation with one nationality per player

USE new_fpl;

-- ---------------------------------------------------------------------------
-- Remove synthetic Seed Player #### data
-- ---------------------------------------------------------------------------
DROP TEMPORARY TABLE IF EXISTS tmp_synthetic_players;
CREATE TEMPORARY TABLE tmp_synthetic_players AS
SELECT id AS player_id
FROM players
WHERE full_name REGEXP '^Seed Player [0-9]{4}$';

DELETE FROM league_season_players
WHERE player_id IN (SELECT player_id FROM tmp_synthetic_players);

DELETE FROM player_nationalities
WHERE player_id IN (SELECT player_id FROM tmp_synthetic_players);

DELETE FROM manager_squad_players
WHERE player_id IN (SELECT player_id FROM tmp_synthetic_players);

DELETE FROM player_live_stats
WHERE player_id IN (SELECT player_id FROM tmp_synthetic_players);

DELETE FROM admin_player_price_logs
WHERE player_id IN (SELECT player_id FROM tmp_synthetic_players);

DELETE FROM dream_team_players
WHERE player_id IN (SELECT player_id FROM tmp_synthetic_players);

DELETE FROM ai_recommendations
WHERE player_id IN (SELECT player_id FROM tmp_synthetic_players);

DELETE FROM predictions
WHERE predicted_motm_player_id IN (SELECT player_id FROM tmp_synthetic_players);

DELETE FROM predictions
WHERE predicted_top_scorer_id IN (SELECT player_id FROM tmp_synthetic_players);

DELETE FROM predictions
WHERE predicted_top_wicket_taker_id IN (SELECT player_id FROM tmp_synthetic_players);

UPDATE fixtures
SET motm_player_id = NULL
WHERE motm_player_id IN (SELECT player_id FROM tmp_synthetic_players);

DELETE FROM players
WHERE id IN (SELECT player_id FROM tmp_synthetic_players);

-- ---------------------------------------------------------------------------
-- Nations, competitions, league seasons
-- ---------------------------------------------------------------------------
INSERT INTO nations (name, iso_code, flag_emoji)
SELECT 'Nepal', 'NPL', 'NP'
FROM DUAL
WHERE NOT EXISTS (SELECT 1 FROM nations WHERE iso_code = 'NPL');

INSERT INTO competitions (name, short_name, nation_id, organization, established_year, is_active)
SELECT 'Nepal Premier League', 'NPL', n.id, 'Cricket Association of Nepal', 2024, 1
FROM nations n
WHERE n.iso_code = 'NPL'
  AND NOT EXISTS (SELECT 1 FROM competitions WHERE short_name = 'NPL');

INSERT INTO league_seasons (id, competition_id, year, season_name, start_date, end_date, status, budget_cap, total_fixtures)
SELECT 'NPL_2025', c.id, 2025, 'NPL 2025', '2025-11-15', '2025-12-30', 'active', 100.0, 0
FROM competitions c
WHERE c.short_name = 'NPL'
ON DUPLICATE KEY UPDATE
  status = VALUES(status),
  budget_cap = VALUES(budget_cap);

UPDATE league_seasons SET status = 'active' WHERE id IN ('IPL_2025', 'PSL_2025', 'BBL_2025', 'BPL_2025');

-- ---------------------------------------------------------------------------
-- Franchise catalog (create missing global franchises)
-- ---------------------------------------------------------------------------
INSERT INTO franchises (name, short_name, home_city)
SELECT 'Karachi Kings', 'KK', 'Karachi'
FROM DUAL WHERE NOT EXISTS (SELECT 1 FROM franchises WHERE short_name = 'KK');

INSERT INTO franchises (name, short_name, home_city)
SELECT 'Islamabad United', 'IU', 'Islamabad'
FROM DUAL WHERE NOT EXISTS (SELECT 1 FROM franchises WHERE short_name = 'IU');

INSERT INTO franchises (name, short_name, home_city)
SELECT 'Lahore Qalandars', 'LQ', 'Lahore'
FROM DUAL WHERE NOT EXISTS (SELECT 1 FROM franchises WHERE short_name = 'LQ');

INSERT INTO franchises (name, short_name, home_city)
SELECT 'Multan Sultans', 'MSU', 'Multan'
FROM DUAL WHERE NOT EXISTS (SELECT 1 FROM franchises WHERE short_name = 'MSU');

INSERT INTO franchises (name, short_name, home_city)
SELECT 'Peshawar Zalmi', 'PZ', 'Peshawar'
FROM DUAL WHERE NOT EXISTS (SELECT 1 FROM franchises WHERE short_name = 'PZ');

INSERT INTO franchises (name, short_name, home_city)
SELECT 'Quetta Gladiators', 'QG', 'Quetta'
FROM DUAL WHERE NOT EXISTS (SELECT 1 FROM franchises WHERE short_name = 'QG');

INSERT INTO franchises (name, short_name, home_city)
SELECT 'Adelaide Strikers', 'ADS', 'Adelaide'
FROM DUAL WHERE NOT EXISTS (SELECT 1 FROM franchises WHERE short_name = 'ADS');

INSERT INTO franchises (name, short_name, home_city)
SELECT 'Brisbane Heat', 'BRH', 'Brisbane'
FROM DUAL WHERE NOT EXISTS (SELECT 1 FROM franchises WHERE short_name = 'BRH');

INSERT INTO franchises (name, short_name, home_city)
SELECT 'Hobart Hurricanes', 'HBH', 'Hobart'
FROM DUAL WHERE NOT EXISTS (SELECT 1 FROM franchises WHERE short_name = 'HBH');

INSERT INTO franchises (name, short_name, home_city)
SELECT 'Melbourne Renegades', 'MLR', 'Melbourne'
FROM DUAL WHERE NOT EXISTS (SELECT 1 FROM franchises WHERE short_name = 'MLR');

INSERT INTO franchises (name, short_name, home_city)
SELECT 'Melbourne Stars', 'MLS', 'Melbourne'
FROM DUAL WHERE NOT EXISTS (SELECT 1 FROM franchises WHERE short_name = 'MLS');

INSERT INTO franchises (name, short_name, home_city)
SELECT 'Perth Scorchers', 'PES', 'Perth'
FROM DUAL WHERE NOT EXISTS (SELECT 1 FROM franchises WHERE short_name = 'PES');

INSERT INTO franchises (name, short_name, home_city)
SELECT 'Sydney Sixers', 'SYS', 'Sydney'
FROM DUAL WHERE NOT EXISTS (SELECT 1 FROM franchises WHERE short_name = 'SYS');

INSERT INTO franchises (name, short_name, home_city)
SELECT 'Sydney Thunder', 'SYT', 'Sydney'
FROM DUAL WHERE NOT EXISTS (SELECT 1 FROM franchises WHERE short_name = 'SYT');

INSERT INTO franchises (name, short_name, home_city)
SELECT 'Comilla Victorians', 'CTV', 'Comilla'
FROM DUAL WHERE NOT EXISTS (SELECT 1 FROM franchises WHERE short_name = 'CTV');

INSERT INTO franchises (name, short_name, home_city)
SELECT 'Chattogram Challengers', 'CHC', 'Chattogram'
FROM DUAL WHERE NOT EXISTS (SELECT 1 FROM franchises WHERE short_name = 'CHC');

INSERT INTO franchises (name, short_name, home_city)
SELECT 'Durdanto Dhaka', 'DHK', 'Dhaka'
FROM DUAL WHERE NOT EXISTS (SELECT 1 FROM franchises WHERE short_name = 'DHK');

INSERT INTO franchises (name, short_name, home_city)
SELECT 'Fortune Barishal', 'FRT', 'Barishal'
FROM DUAL WHERE NOT EXISTS (SELECT 1 FROM franchises WHERE short_name = 'FRT');

INSERT INTO franchises (name, short_name, home_city)
SELECT 'Khulna Tigers', 'KLT', 'Khulna'
FROM DUAL WHERE NOT EXISTS (SELECT 1 FROM franchises WHERE short_name = 'KLT');

INSERT INTO franchises (name, short_name, home_city)
SELECT 'Rangpur Riders', 'RAN', 'Rangpur'
FROM DUAL WHERE NOT EXISTS (SELECT 1 FROM franchises WHERE short_name = 'RAN');

INSERT INTO franchises (name, short_name, home_city)
SELECT 'Sylhet Strikers', 'SYL', 'Sylhet'
FROM DUAL WHERE NOT EXISTS (SELECT 1 FROM franchises WHERE short_name = 'SYL');

INSERT INTO franchises (name, short_name, home_city)
SELECT 'Biratnagar Warriors', 'BIR', 'Biratnagar'
FROM DUAL WHERE NOT EXISTS (SELECT 1 FROM franchises WHERE short_name = 'BIR');

INSERT INTO franchises (name, short_name, home_city)
SELECT 'Chitwan Tigers', 'CHI', 'Chitwan'
FROM DUAL WHERE NOT EXISTS (SELECT 1 FROM franchises WHERE short_name = 'CHI');

INSERT INTO franchises (name, short_name, home_city)
SELECT 'Janakpur Royals', 'JAN', 'Janakpur'
FROM DUAL WHERE NOT EXISTS (SELECT 1 FROM franchises WHERE short_name = 'JAN');

INSERT INTO franchises (name, short_name, home_city)
SELECT 'Kathmandu Knights', 'KTM', 'Kathmandu'
FROM DUAL WHERE NOT EXISTS (SELECT 1 FROM franchises WHERE short_name = 'KTM');

INSERT INTO franchises (name, short_name, home_city)
SELECT 'Lumbini Lions', 'LUM', 'Bhairahawa'
FROM DUAL WHERE NOT EXISTS (SELECT 1 FROM franchises WHERE short_name = 'LUM');

INSERT INTO franchises (name, short_name, home_city)
SELECT 'Pokhara Avengers', 'POK', 'Pokhara'
FROM DUAL WHERE NOT EXISTS (SELECT 1 FROM franchises WHERE short_name = 'POK');

INSERT INTO franchises (name, short_name, home_city)
SELECT 'Sudurpaschim Royals', 'SPR', 'Dhangadhi'
FROM DUAL WHERE NOT EXISTS (SELECT 1 FROM franchises WHERE short_name = 'SPR');

INSERT INTO franchises (name, short_name, home_city)
SELECT 'Koshi Strikers', 'KOS', 'Itahari'
FROM DUAL WHERE NOT EXISTS (SELECT 1 FROM franchises WHERE short_name = 'KOS');

-- ---------------------------------------------------------------------------
-- League franchise mappings
-- ---------------------------------------------------------------------------
INSERT IGNORE INTO league_franchises (league_season_id, franchise_id, display_name, team_code, is_active)
SELECT 'IPL_2025', id, name, short_name, 1
FROM franchises
WHERE short_name IN ('MI', 'CSK', 'RCB', 'KKR', 'DC', 'RR', 'PBKS', 'SRH', 'GT', 'LSG');

INSERT IGNORE INTO league_franchises (league_season_id, franchise_id, display_name, team_code, is_active)
SELECT 'PSL_2025', id, name, short_name, 1
FROM franchises
WHERE short_name IN ('KK', 'IU', 'LQ', 'MSU', 'PZ', 'QG');

INSERT IGNORE INTO league_franchises (league_season_id, franchise_id, display_name, team_code, is_active)
SELECT 'BBL_2025', id, name, short_name, 1
FROM franchises
WHERE short_name IN ('ADS', 'BRH', 'HBH', 'MLR', 'MLS', 'PES', 'SYS', 'SYT');

INSERT IGNORE INTO league_franchises (league_season_id, franchise_id, display_name, team_code, is_active)
SELECT 'BPL_2025', id, name, short_name, 1
FROM franchises
WHERE short_name IN ('CTV', 'CHC', 'DHK', 'FRT', 'KLT', 'RAN', 'SYL');

INSERT IGNORE INTO league_franchises (league_season_id, franchise_id, display_name, team_code, is_active)
SELECT 'NPL_2025', id, name, short_name, 1
FROM franchises
WHERE short_name IN ('BIR', 'CHI', 'JAN', 'KTM', 'LUM', 'POK', 'SPR', 'KOS');

-- ---------------------------------------------------------------------------
-- Real players: one record per player, one nationality per player
-- ---------------------------------------------------------------------------
DROP TEMPORARY TABLE IF EXISTS tmp_player_profiles;
CREATE TEMPORARY TABLE tmp_player_profiles (
  full_name VARCHAR(120) NOT NULL,
  role ENUM('WK','BAT','AR','BOWL') NOT NULL,
  nation_iso VARCHAR(3) NOT NULL,
  base_franchise_code VARCHAR(10) NOT NULL,
  base_credit DECIMAL(5,1) NOT NULL,
  PRIMARY KEY (full_name)
);

INSERT INTO tmp_player_profiles (full_name, role, nation_iso, base_franchise_code, base_credit) VALUES
('Virat Kohli', 'BAT', 'IND', 'RCB', 10.0),
('Rohit Sharma', 'BAT', 'IND', 'MI', 9.5),
('Jasprit Bumrah', 'BOWL', 'IND', 'MI', 9.5),
('Ruturaj Gaikwad', 'BAT', 'IND', 'CSK', 9.0),
('Ravindra Jadeja', 'AR', 'IND', 'CSK', 9.5),
('Shubman Gill', 'BAT', 'IND', 'GT', 10.0),
('KL Rahul', 'WK', 'IND', 'LSG', 9.0),
('Rishabh Pant', 'WK', 'IND', 'DC', 9.5),
('Hardik Pandya', 'AR', 'IND', 'MI', 9.5),
('Suryakumar Yadav', 'BAT', 'IND', 'MI', 9.5),
('Babar Azam', 'BAT', 'PAK', 'PZ', 9.5),
('Mohammad Rizwan', 'WK', 'PAK', 'MSU', 9.5),
('Shaheen Shah Afridi', 'BOWL', 'PAK', 'LQ', 9.5),
('Shadab Khan', 'AR', 'PAK', 'IU', 8.5),
('Fakhar Zaman', 'BAT', 'PAK', 'LQ', 8.5),
('Saim Ayub', 'BAT', 'PAK', 'PZ', 8.0),
('Haris Rauf', 'BOWL', 'PAK', 'LQ', 8.5),
('Travis Head', 'BAT', 'AUS', 'SRH', 9.5),
('Pat Cummins', 'AR', 'AUS', 'SRH', 9.0),
('David Warner', 'BAT', 'AUS', 'DC', 8.5),
('Glenn Maxwell', 'AR', 'AUS', 'RCB', 9.0),
('Marcus Stoinis', 'AR', 'AUS', 'LSG', 8.5),
('Steve Smith', 'BAT', 'AUS', 'SYS', 8.0),
('Josh Hazlewood', 'BOWL', 'AUS', 'RCB', 8.5),
('Jos Buttler', 'WK', 'ENG', 'RR', 9.5),
('Sam Curran', 'AR', 'ENG', 'PBKS', 8.5),
('Moeen Ali', 'AR', 'ENG', 'CSK', 8.5),
('Phil Salt', 'WK', 'ENG', 'KKR', 8.5),
('Liam Livingstone', 'AR', 'ENG', 'PBKS', 9.0),
('Quinton de Kock', 'WK', 'RSA', 'LSG', 9.0),
('Kagiso Rabada', 'BOWL', 'RSA', 'PBKS', 9.0),
('Anrich Nortje', 'BOWL', 'RSA', 'DC', 8.0),
('Aiden Markram', 'AR', 'RSA', 'SRH', 8.5),
('Heinrich Klaasen', 'WK', 'RSA', 'SRH', 9.0),
('Kane Williamson', 'BAT', 'NZL', 'GT', 8.5),
('Rachin Ravindra', 'AR', 'NZL', 'CSK', 8.5),
('Trent Boult', 'BOWL', 'NZL', 'RR', 9.0),
('Mustafizur Rahman', 'BOWL', 'BGD', 'CSK', 8.0),
('Shakib Al Hasan', 'AR', 'BGD', 'FRT', 9.0),
('Litton Das', 'WK', 'BGD', 'CTV', 8.0),
('Rashid Khan', 'AR', 'AFG', 'GT', 10.0),
('Rahmanullah Gurbaz', 'WK', 'AFG', 'KKR', 8.0),
('Mohammad Nabi', 'AR', 'AFG', 'MI', 8.0),
('Rohit Paudel', 'BAT', 'NPL', 'KTM', 8.0),
('Dipendra Singh Airee', 'AR', 'NPL', 'JAN', 8.5),
('Kushal Malla', 'AR', 'NPL', 'BIR', 8.0),
('Sandeep Lamichhane', 'BOWL', 'NPL', 'POK', 8.5),
('Aasif Sheikh', 'WK', 'NPL', 'LUM', 7.5),
('Karan KC', 'BOWL', 'NPL', 'SPR', 8.0),
('Sompal Kami', 'BOWL', 'NPL', 'KOS', 7.5),
('Gulshan Jha', 'AR', 'NPL', 'CHI', 7.5);

INSERT INTO players (full_name, role, franchise_id, credit_price, is_active, ownership_percent)
SELECT
  tpp.full_name,
  tpp.role,
  f.id,
  tpp.base_credit,
  1,
  ROUND(LEAST(90.0, GREATEST(8.0, (tpp.base_credit - 6.0) * 14.0)), 2)
FROM tmp_player_profiles tpp
JOIN franchises f ON f.short_name = tpp.base_franchise_code
WHERE NOT EXISTS (
  SELECT 1
  FROM players p
  WHERE p.full_name = tpp.full_name
);

-- Keep existing players fresh with latest canonical role/price and active status.
UPDATE players p
JOIN tmp_player_profiles tpp ON tpp.full_name = p.full_name
SET
  p.role = tpp.role,
  p.credit_price = tpp.base_credit,
  p.is_active = 1;

DROP TEMPORARY TABLE IF EXISTS tmp_canonical_players;
CREATE TEMPORARY TABLE tmp_canonical_players AS
SELECT p.full_name, MIN(p.id) AS player_id
FROM players p
JOIN tmp_player_profiles tpp ON tpp.full_name = p.full_name
GROUP BY p.full_name;

-- Keep only one active canonical row per player name for league mappings.
UPDATE players p
JOIN tmp_canonical_players tcp ON tcp.full_name = p.full_name
SET p.is_active = CASE WHEN p.id = tcp.player_id THEN 1 ELSE 0 END;

DELETE pn
FROM player_nationalities pn
JOIN players p ON p.id = pn.player_id
JOIN tmp_canonical_players tcp ON tcp.full_name = p.full_name
WHERE p.id <> tcp.player_id;

INSERT IGNORE INTO player_nationalities (player_id, nation_id)
SELECT tcp.player_id, n.id
FROM tmp_player_profiles tpp
JOIN tmp_canonical_players tcp ON tcp.full_name = tpp.full_name
JOIN nations n ON n.iso_code = tpp.nation_iso;

UPDATE player_nationalities pn
JOIN tmp_canonical_players tcp ON tcp.player_id = pn.player_id
JOIN tmp_player_profiles tpp ON tpp.full_name = tcp.full_name
JOIN nations n ON n.iso_code = tpp.nation_iso
SET pn.nation_id = n.id;

-- ---------------------------------------------------------------------------
-- Cross-league assignments: one player can be in different leagues and teams
-- ---------------------------------------------------------------------------
DROP TEMPORARY TABLE IF EXISTS tmp_player_assignments;
CREATE TEMPORARY TABLE tmp_player_assignments (
  full_name VARCHAR(120) NOT NULL,
  league_season_id VARCHAR(50) NOT NULL,
  team_code VARCHAR(10) NOT NULL,
  league_credit DECIMAL(5,1) NOT NULL
);

INSERT INTO tmp_player_assignments (full_name, league_season_id, team_code, league_credit) VALUES
('Virat Kohli', 'IPL_2025', 'RCB', 10.0),
('Rohit Sharma', 'IPL_2025', 'MI', 9.5),
('Jasprit Bumrah', 'IPL_2025', 'MI', 9.5),
('Ruturaj Gaikwad', 'IPL_2025', 'CSK', 9.0),
('Ravindra Jadeja', 'IPL_2025', 'CSK', 9.5),
('Shubman Gill', 'IPL_2025', 'GT', 10.0),
('KL Rahul', 'IPL_2025', 'LSG', 9.0),
('Rishabh Pant', 'IPL_2025', 'DC', 9.5),
('Hardik Pandya', 'IPL_2025', 'MI', 9.5),
('Suryakumar Yadav', 'IPL_2025', 'MI', 9.5),
('Jos Buttler', 'IPL_2025', 'RR', 9.5),
('Sam Curran', 'IPL_2025', 'PBKS', 8.5),
('Moeen Ali', 'IPL_2025', 'CSK', 8.5),
('Phil Salt', 'IPL_2025', 'KKR', 8.5),
('Liam Livingstone', 'IPL_2025', 'PBKS', 9.0),
('Quinton de Kock', 'IPL_2025', 'LSG', 9.0),
('Kagiso Rabada', 'IPL_2025', 'PBKS', 9.0),
('Anrich Nortje', 'IPL_2025', 'DC', 8.0),
('Aiden Markram', 'IPL_2025', 'SRH', 8.5),
('Heinrich Klaasen', 'IPL_2025', 'SRH', 9.0),
('Kane Williamson', 'IPL_2025', 'GT', 8.5),
('Rachin Ravindra', 'IPL_2025', 'CSK', 8.5),
('Trent Boult', 'IPL_2025', 'RR', 9.0),
('Mustafizur Rahman', 'IPL_2025', 'CSK', 8.0),
('Rashid Khan', 'IPL_2025', 'GT', 10.0),
('Rahmanullah Gurbaz', 'IPL_2025', 'KKR', 8.0),
('Mohammad Nabi', 'IPL_2025', 'MI', 8.0),

('Babar Azam', 'PSL_2025', 'PZ', 9.5),
('Mohammad Rizwan', 'PSL_2025', 'MSU', 9.5),
('Shaheen Shah Afridi', 'PSL_2025', 'LQ', 9.5),
('Shadab Khan', 'PSL_2025', 'IU', 8.5),
('Fakhar Zaman', 'PSL_2025', 'LQ', 8.5),
('Saim Ayub', 'PSL_2025', 'PZ', 8.0),
('Haris Rauf', 'PSL_2025', 'LQ', 8.5),
('David Warner', 'PSL_2025', 'KK', 8.5),
('Travis Head', 'PSL_2025', 'KK', 9.0),
('Rashid Khan', 'PSL_2025', 'LQ', 9.8),
('Phil Salt', 'PSL_2025', 'IU', 8.7),
('Shakib Al Hasan', 'PSL_2025', 'IU', 8.3),
('Quinton de Kock', 'PSL_2025', 'KK', 9.0),
('Kagiso Rabada', 'PSL_2025', 'QG', 9.0),

('Steve Smith', 'BBL_2025', 'SYS', 8.0),
('Travis Head', 'BBL_2025', 'ADS', 9.0),
('Pat Cummins', 'BBL_2025', 'SYT', 8.8),
('Glenn Maxwell', 'BBL_2025', 'MLS', 9.0),
('Marcus Stoinis', 'BBL_2025', 'MLS', 8.5),
('Josh Hazlewood', 'BBL_2025', 'SYS', 8.5),
('Rashid Khan', 'BBL_2025', 'ADS', 9.8),
('Phil Salt', 'BBL_2025', 'SYS', 8.5),
('Rachin Ravindra', 'BBL_2025', 'BRH', 8.3),
('Babar Azam', 'BBL_2025', 'HBH', 9.1),
('Shaheen Shah Afridi', 'BBL_2025', 'MLR', 9.1),
('Rohit Sharma', 'BBL_2025', 'PES', 9.0),

('Litton Das', 'BPL_2025', 'CTV', 8.0),
('Shakib Al Hasan', 'BPL_2025', 'FRT', 9.0),
('Mustafizur Rahman', 'BPL_2025', 'DHK', 8.2),
('Rashid Khan', 'BPL_2025', 'FRT', 9.8),
('Babar Azam', 'BPL_2025', 'RAN', 9.3),
('Mohammad Rizwan', 'BPL_2025', 'SYL', 9.2),
('Shaheen Shah Afridi', 'BPL_2025', 'SYL', 9.0),
('Quinton de Kock', 'BPL_2025', 'CHC', 8.8),
('David Warner', 'BPL_2025', 'KLT', 8.4),
('Trent Boult', 'BPL_2025', 'KLT', 8.8),

('Rohit Paudel', 'NPL_2025', 'KTM', 8.0),
('Dipendra Singh Airee', 'NPL_2025', 'JAN', 8.5),
('Kushal Malla', 'NPL_2025', 'BIR', 8.0),
('Sandeep Lamichhane', 'NPL_2025', 'POK', 8.5),
('Aasif Sheikh', 'NPL_2025', 'LUM', 7.5),
('Karan KC', 'NPL_2025', 'SPR', 8.0),
('Sompal Kami', 'NPL_2025', 'KOS', 7.5),
('Gulshan Jha', 'NPL_2025', 'CHI', 7.5),
('Shakib Al Hasan', 'NPL_2025', 'KTM', 8.8),
('Rashid Khan', 'NPL_2025', 'POK', 9.5),
('Babar Azam', 'NPL_2025', 'JAN', 9.2),
('Quinton de Kock', 'NPL_2025', 'LUM', 8.6);

-- Replace targeted player mappings per league to avoid stale assignments.
DELETE lsp
FROM league_season_players lsp
JOIN players p ON p.id = lsp.player_id
JOIN tmp_player_assignments tpa
  ON tpa.full_name = p.full_name
 AND tpa.league_season_id = lsp.league_season_id;

INSERT INTO league_season_players (league_season_id, player_id, league_franchise_id, base_credits, is_active)
SELECT
  tpa.league_season_id,
  tcp.player_id,
  lf.id,
  tpa.league_credit,
  1
FROM tmp_player_assignments tpa
JOIN tmp_canonical_players tcp ON tcp.full_name = tpa.full_name
JOIN league_franchises lf
  ON lf.league_season_id = tpa.league_season_id
 AND lf.team_code = tpa.team_code;

-- ---------------------------------------------------------------------------
-- Summary checks
-- ---------------------------------------------------------------------------
SELECT
  (SELECT COUNT(*) FROM players WHERE full_name REGEXP '^Seed Player [0-9]{4}$') AS synthetic_players_remaining,
  (SELECT COUNT(*) FROM player_nationalities pn JOIN players p ON p.id = pn.player_id) AS nationality_rows,
  (SELECT COUNT(*) FROM league_season_players WHERE league_season_id = 'IPL_2025') AS ipl_players,
  (SELECT COUNT(*) FROM league_season_players WHERE league_season_id = 'PSL_2025') AS psl_players,
  (SELECT COUNT(*) FROM league_season_players WHERE league_season_id = 'BBL_2025') AS bbl_players,
  (SELECT COUNT(*) FROM league_season_players WHERE league_season_id = 'BPL_2025') AS bpl_players,
  (SELECT COUNT(*) FROM league_season_players WHERE league_season_id = 'NPL_2025') AS npl_players;
