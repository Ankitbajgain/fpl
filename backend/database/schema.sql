-- ============================================================
-- Consolidated from schema.sql
-- ============================================================

CREATE DATABASE IF NOT EXISTS new_fpl CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE new_fpl;

CREATE TABLE users (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  email VARCHAR(150) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  phone VARCHAR(20),
  wallet_balance DECIMAL(12,2) NOT NULL DEFAULT 0,
  role ENUM('manager','admin') NOT NULL DEFAULT 'manager',
  is_active TINYINT(1) NOT NULL DEFAULT 1,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE franchises (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(120) NOT NULL UNIQUE,
  short_name VARCHAR(10) NOT NULL UNIQUE,
  home_city VARCHAR(80),
  is_active TINYINT(1) NOT NULL DEFAULT 1,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE nations (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(120) NOT NULL UNIQUE,
  iso_code VARCHAR(10) NOT NULL UNIQUE,
  flag_emoji VARCHAR(16) NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE competitions (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(120) NOT NULL UNIQUE,
  short_name VARCHAR(20) NOT NULL UNIQUE,
  nation_id BIGINT UNSIGNED NOT NULL,
  organization VARCHAR(160) NULL,
  established_year INT NULL,
  is_active TINYINT(1) NOT NULL DEFAULT 1,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_competitions_nation FOREIGN KEY (nation_id) REFERENCES nations(id)
);

CREATE TABLE league_seasons (
  id VARCHAR(50) PRIMARY KEY,
  competition_id BIGINT UNSIGNED NOT NULL,
  year INT NOT NULL,
  season_name VARCHAR(120) NOT NULL,
  start_date DATE NULL,
  end_date DATE NULL,
  status ENUM('upcoming','active','completed','archived') NOT NULL DEFAULT 'upcoming',
  budget_cap DECIMAL(6,1) NOT NULL DEFAULT 100.0,
  total_fixtures INT NOT NULL DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_league_seasons_competition FOREIGN KEY (competition_id) REFERENCES competitions(id)
);

CREATE TABLE players (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  full_name VARCHAR(120) NOT NULL,
  role ENUM('WK','BAT','AR','BOWL') NOT NULL,
  franchise_id BIGINT UNSIGNED NOT NULL,
  credit_price DECIMAL(5,1) NOT NULL,
  is_active TINYINT(1) NOT NULL DEFAULT 1,
  ownership_percent DECIMAL(5,2) NOT NULL DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_players_franchise FOREIGN KEY (franchise_id) REFERENCES franchises(id)
);

CREATE TABLE fixtures (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  league_season_id VARCHAR(50) NULL,
  home_franchise_id BIGINT UNSIGNED NOT NULL,
  away_franchise_id BIGINT UNSIGNED NOT NULL,
  venue VARCHAR(120),
  starts_at DATETIME NOT NULL,
  toss_at DATETIME,
  lock_at DATETIME NOT NULL,
  status ENUM('SCHEDULED','LIVE','COMPLETED','CANCELLED') NOT NULL DEFAULT 'SCHEDULED',
  winner_franchise_id BIGINT UNSIGNED NULL,
  motm_player_id BIGINT UNSIGNED NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_fixture_league FOREIGN KEY (league_season_id) REFERENCES league_seasons(id),
  CONSTRAINT fk_fixture_home FOREIGN KEY (home_franchise_id) REFERENCES franchises(id),
  CONSTRAINT fk_fixture_away FOREIGN KEY (away_franchise_id) REFERENCES franchises(id),
  CONSTRAINT fk_fixture_winner FOREIGN KEY (winner_franchise_id) REFERENCES franchises(id),
  CONSTRAINT fk_fixture_motm FOREIGN KEY (motm_player_id) REFERENCES players(id)
);

CREATE TABLE league_franchises (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  league_season_id VARCHAR(50) NOT NULL,
  franchise_id BIGINT UNSIGNED NOT NULL,
  display_name VARCHAR(120) NULL,
  team_code VARCHAR(10) NOT NULL,
  is_active TINYINT(1) NOT NULL DEFAULT 1,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY uq_league_franchise_pair (league_season_id, franchise_id),
  UNIQUE KEY uq_league_team_code (league_season_id, team_code),
  CONSTRAINT fk_league_franchises_season FOREIGN KEY (league_season_id) REFERENCES league_seasons(id) ON DELETE CASCADE,
  CONSTRAINT fk_league_franchises_franchise FOREIGN KEY (franchise_id) REFERENCES franchises(id) ON DELETE CASCADE
);

CREATE TABLE player_nationalities (
  player_id BIGINT UNSIGNED PRIMARY KEY,
  nation_id BIGINT UNSIGNED NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_player_nationalities_player FOREIGN KEY (player_id) REFERENCES players(id) ON DELETE CASCADE,
  CONSTRAINT fk_player_nationalities_nation FOREIGN KEY (nation_id) REFERENCES nations(id)
);

CREATE TABLE league_season_players (
  league_season_id VARCHAR(50) NOT NULL,
  player_id BIGINT UNSIGNED NOT NULL,
  league_franchise_id BIGINT UNSIGNED NOT NULL,
  base_credits DECIMAL(5,1) NOT NULL,
  is_active TINYINT(1) NOT NULL DEFAULT 1,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (league_season_id, player_id, league_franchise_id),
  CONSTRAINT fk_lsp_season FOREIGN KEY (league_season_id) REFERENCES league_seasons(id) ON DELETE CASCADE,
  CONSTRAINT fk_lsp_player FOREIGN KEY (player_id) REFERENCES players(id) ON DELETE CASCADE,
  CONSTRAINT fk_lsp_franchise FOREIGN KEY (league_franchise_id) REFERENCES league_franchises(id) ON DELETE CASCADE
);

CREATE TABLE manager_squads (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  user_id BIGINT UNSIGNED NOT NULL,
  fixture_id BIGINT UNSIGNED NOT NULL,
  league_season_id VARCHAR(50) NULL,
  budget_cap DECIMAL(6,1) NOT NULL DEFAULT 100.0,
  total_spent DECIMAL(6,1) NOT NULL DEFAULT 0,
  transfers_used INT NOT NULL DEFAULT 0,
  free_transfers INT NOT NULL DEFAULT 2,
  transfer_penalty_points INT NOT NULL DEFAULT 0,
  captain_player_id BIGINT UNSIGNED NOT NULL,
  vice_captain_player_id BIGINT UNSIGNED NOT NULL,
  impact_player_id BIGINT UNSIGNED NULL,
  booster ENUM('NONE','TRIPLE_CAPTAIN','FREE_HIT','WILDCARD','IMPACT_PLAYER') NOT NULL DEFAULT 'NONE',
  is_locked TINYINT(1) NOT NULL DEFAULT 0,
  points_total DECIMAL(8,2) NOT NULL DEFAULT 0,
  rank_global INT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY uq_manager_fixture (user_id, fixture_id),
  KEY idx_manager_squads_league_season (league_season_id),
  CONSTRAINT fk_squad_user FOREIGN KEY (user_id) REFERENCES users(id),
  CONSTRAINT fk_squad_fixture FOREIGN KEY (fixture_id) REFERENCES fixtures(id),
  CONSTRAINT fk_squad_league FOREIGN KEY (league_season_id) REFERENCES league_seasons(id),
  CONSTRAINT fk_squad_captain FOREIGN KEY (captain_player_id) REFERENCES players(id),
  CONSTRAINT fk_squad_vice FOREIGN KEY (vice_captain_player_id) REFERENCES players(id),
  CONSTRAINT fk_squad_impact FOREIGN KEY (impact_player_id) REFERENCES players(id)
);

CREATE TABLE manager_squad_players (
  squad_id BIGINT UNSIGNED NOT NULL,
  player_id BIGINT UNSIGNED NOT NULL,
  is_starting_xi TINYINT(1) NOT NULL DEFAULT 1,
  PRIMARY KEY (squad_id, player_id),
  CONSTRAINT fk_squad_players_squad FOREIGN KEY (squad_id) REFERENCES manager_squads(id) ON DELETE CASCADE,
  CONSTRAINT fk_squad_players_player FOREIGN KEY (player_id) REFERENCES players(id)
);

CREATE TABLE boosters_usage (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  user_id BIGINT UNSIGNED NOT NULL,
  season VARCHAR(20) NOT NULL,
  booster ENUM('TRIPLE_CAPTAIN','FREE_HIT','WILDCARD','IMPACT_PLAYER') NOT NULL,
  used_in_fixture_id BIGINT UNSIGNED NOT NULL,
  used_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY uq_user_booster_season (user_id, season, booster),
  CONSTRAINT fk_booster_user FOREIGN KEY (user_id) REFERENCES users(id),
  CONSTRAINT fk_booster_fixture FOREIGN KEY (used_in_fixture_id) REFERENCES fixtures(id)
);

CREATE TABLE player_live_stats (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  fixture_id BIGINT UNSIGNED NOT NULL,
  player_id BIGINT UNSIGNED NOT NULL,
  franchise_id BIGINT UNSIGNED NOT NULL,
  runs INT NOT NULL DEFAULT 0,
  fours INT NOT NULL DEFAULT 0,
  sixes INT NOT NULL DEFAULT 0,
  balls_faced INT NOT NULL DEFAULT 0,
  is_duck TINYINT(1) NOT NULL DEFAULT 0,
  wickets INT NOT NULL DEFAULT 0,
  maidens INT NOT NULL DEFAULT 0,
  economy_rate DECIMAL(4,2) DEFAULT 0,
  three_wicket_haul TINYINT(1) NOT NULL DEFAULT 0,
  catches INT NOT NULL DEFAULT 0,
  stumpings INT NOT NULL DEFAULT 0,
  direct_hit_runouts INT NOT NULL DEFAULT 0,
  dropped_catches INT NOT NULL DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY uq_fixture_player_stat (fixture_id, player_id),
  CONSTRAINT fk_stat_fixture FOREIGN KEY (fixture_id) REFERENCES fixtures(id),
  CONSTRAINT fk_stat_player FOREIGN KEY (player_id) REFERENCES players(id),
  CONSTRAINT fk_stat_franchise FOREIGN KEY (franchise_id) REFERENCES franchises(id)
);

CREATE TABLE private_leagues (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  league_season_id VARCHAR(50) NOT NULL,
  creator_user_id BIGINT UNSIGNED NOT NULL,
  admin_user_id BIGINT UNSIGNED NOT NULL,
  name VARCHAR(120) NOT NULL,
  invite_code VARCHAR(20) NOT NULL UNIQUE,
  is_overall TINYINT(1) NOT NULL DEFAULT 0,
  is_active TINYINT(1) NOT NULL DEFAULT 1,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY uq_private_league_name_per_season (league_season_id, name),
  KEY idx_private_leagues_season_active (league_season_id, is_active),
  CONSTRAINT fk_private_league_season FOREIGN KEY (league_season_id) REFERENCES league_seasons(id) ON DELETE CASCADE,
  CONSTRAINT fk_league_creator FOREIGN KEY (creator_user_id) REFERENCES users(id),
  CONSTRAINT fk_private_league_admin FOREIGN KEY (admin_user_id) REFERENCES users(id)
);

CREATE TABLE private_league_members (
  league_id BIGINT UNSIGNED NOT NULL,
  user_id BIGINT UNSIGNED NOT NULL,
  role ENUM('admin','member') NOT NULL DEFAULT 'member',
  joined_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  KEY idx_private_league_member_joined (league_id, joined_at),
  PRIMARY KEY (league_id, user_id),
  CONSTRAINT fk_league_members_league FOREIGN KEY (league_id) REFERENCES private_leagues(id) ON DELETE CASCADE,
  CONSTRAINT fk_league_members_user FOREIGN KEY (user_id) REFERENCES users(id)
);

CREATE TABLE h2h_fixtures (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  fixture_id BIGINT UNSIGNED NOT NULL,
  user_a_id BIGINT UNSIGNED NOT NULL,
  user_b_id BIGINT UNSIGNED NOT NULL,
  winner_user_id BIGINT UNSIGNED NULL,
  status ENUM('SCHEDULED','DONE') NOT NULL DEFAULT 'SCHEDULED',
  CONSTRAINT fk_h2h_fixture FOREIGN KEY (fixture_id) REFERENCES fixtures(id),
  CONSTRAINT fk_h2h_user_a FOREIGN KEY (user_a_id) REFERENCES users(id),
  CONSTRAINT fk_h2h_user_b FOREIGN KEY (user_b_id) REFERENCES users(id),
  CONSTRAINT fk_h2h_winner FOREIGN KEY (winner_user_id) REFERENCES users(id)
);

CREATE TABLE predictions (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  fixture_id BIGINT UNSIGNED NOT NULL,
  user_id BIGINT UNSIGNED NOT NULL,
  predicted_toss_winner_id BIGINT UNSIGNED,
  predicted_match_winner_id BIGINT UNSIGNED,
  predicted_motm_player_id BIGINT UNSIGNED,
  predicted_top_scorer_id BIGINT UNSIGNED,
  predicted_top_wicket_taker_id BIGINT UNSIGNED,
  points_earned INT NOT NULL DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY uq_prediction_user_fixture (user_id, fixture_id),
  CONSTRAINT fk_prediction_fixture FOREIGN KEY (fixture_id) REFERENCES fixtures(id),
  CONSTRAINT fk_prediction_user FOREIGN KEY (user_id) REFERENCES users(id),
  CONSTRAINT fk_prediction_toss FOREIGN KEY (predicted_toss_winner_id) REFERENCES franchises(id),
  CONSTRAINT fk_prediction_winner FOREIGN KEY (predicted_match_winner_id) REFERENCES franchises(id),
  CONSTRAINT fk_prediction_motm FOREIGN KEY (predicted_motm_player_id) REFERENCES players(id),
  CONSTRAINT fk_prediction_top_scorer FOREIGN KEY (predicted_top_scorer_id) REFERENCES players(id),
  CONSTRAINT fk_prediction_top_wkt FOREIGN KEY (predicted_top_wicket_taker_id) REFERENCES players(id)
);

CREATE TABLE quiz_questions (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  fixture_id BIGINT UNSIGNED NOT NULL,
  question_text VARCHAR(500) NOT NULL,
  option_a VARCHAR(255) NOT NULL,
  option_b VARCHAR(255) NOT NULL,
  option_c VARCHAR(255) NOT NULL,
  option_d VARCHAR(255) NOT NULL,
  correct_option ENUM('A','B','C','D') NOT NULL,
  starts_at DATETIME NOT NULL,
  ends_at DATETIME NOT NULL,
  points INT NOT NULL DEFAULT 5,
  CONSTRAINT fk_quiz_fixture FOREIGN KEY (fixture_id) REFERENCES fixtures(id)
);

CREATE TABLE quiz_answers (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  question_id BIGINT UNSIGNED NOT NULL,
  user_id BIGINT UNSIGNED NOT NULL,
  selected_option ENUM('A','B','C','D') NOT NULL,
  answered_at DATETIME NOT NULL,
  is_correct TINYINT(1) NOT NULL DEFAULT 0,
  points_earned INT NOT NULL DEFAULT 0,
  UNIQUE KEY uq_answer_once (question_id, user_id),
  CONSTRAINT fk_answer_question FOREIGN KEY (question_id) REFERENCES quiz_questions(id),
  CONSTRAINT fk_answer_user FOREIGN KEY (user_id) REFERENCES users(id)
);

CREATE TABLE push_notifications (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  user_id BIGINT UNSIGNED NOT NULL,
  type ENUM('DEADLINE_ALERT','LINEUPS_ANNOUNCED','FINAL_POINTS') NOT NULL,
  title VARCHAR(120) NOT NULL,
  body VARCHAR(255) NOT NULL,
  is_read TINYINT(1) NOT NULL DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_notification_user FOREIGN KEY (user_id) REFERENCES users(id)
);

CREATE TABLE admin_player_price_logs (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  admin_user_id BIGINT UNSIGNED NOT NULL,
  player_id BIGINT UNSIGNED NOT NULL,
  old_price DECIMAL(5,1) NOT NULL,
  new_price DECIMAL(5,1) NOT NULL,
  reason VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_price_log_admin FOREIGN KEY (admin_user_id) REFERENCES users(id),
  CONSTRAINT fk_price_log_player FOREIGN KEY (player_id) REFERENCES players(id)
);

CREATE TABLE admin_user_bans (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  admin_user_id BIGINT UNSIGNED NOT NULL,
  banned_user_id BIGINT UNSIGNED NOT NULL,
  reason VARCHAR(255) NOT NULL,
  starts_at DATETIME NOT NULL,
  ends_at DATETIME,
  is_active TINYINT(1) NOT NULL DEFAULT 1,
  CONSTRAINT fk_ban_admin FOREIGN KEY (admin_user_id) REFERENCES users(id),
  CONSTRAINT fk_ban_user FOREIGN KEY (banned_user_id) REFERENCES users(id)
);

CREATE TABLE dream_teams (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  fixture_id BIGINT UNSIGNED NOT NULL,
  generated_at DATETIME NOT NULL,
  total_points DECIMAL(8,2) NOT NULL,
  CONSTRAINT fk_dream_fixture FOREIGN KEY (fixture_id) REFERENCES fixtures(id)
);

CREATE TABLE dream_team_players (
  dream_team_id BIGINT UNSIGNED NOT NULL,
  player_id BIGINT UNSIGNED NOT NULL,
  role ENUM('WK','BAT','AR','BOWL') NOT NULL,
  PRIMARY KEY (dream_team_id, player_id),
  CONSTRAINT fk_dream_players_team FOREIGN KEY (dream_team_id) REFERENCES dream_teams(id) ON DELETE CASCADE,
  CONSTRAINT fk_dream_players_player FOREIGN KEY (player_id) REFERENCES players(id)
);

CREATE TABLE ai_recommendations (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  fixture_id BIGINT UNSIGNED NOT NULL,
  player_id BIGINT UNSIGNED NOT NULL,
  reason VARCHAR(255) NOT NULL,
  confidence_score DECIMAL(5,2) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_ai_fixture FOREIGN KEY (fixture_id) REFERENCES fixtures(id),
  CONSTRAINT fk_ai_player FOREIGN KEY (player_id) REFERENCES players(id)
);

INSERT INTO nations (name, iso_code, flag_emoji)
SELECT 'India', 'IND', 'IN' FROM DUAL
WHERE NOT EXISTS (SELECT 1 FROM nations WHERE iso_code = 'IND');

INSERT INTO nations (name, iso_code, flag_emoji)
SELECT 'Pakistan', 'PAK', 'PK' FROM DUAL
WHERE NOT EXISTS (SELECT 1 FROM nations WHERE iso_code = 'PAK');

INSERT INTO nations (name, iso_code, flag_emoji)
SELECT 'Australia', 'AUS', 'AU' FROM DUAL
WHERE NOT EXISTS (SELECT 1 FROM nations WHERE iso_code = 'AUS');

INSERT INTO nations (name, iso_code, flag_emoji)
SELECT 'Bangladesh', 'BGD', 'BD' FROM DUAL
WHERE NOT EXISTS (SELECT 1 FROM nations WHERE iso_code = 'BGD');

INSERT INTO nations (name, iso_code, flag_emoji)
SELECT 'Nepal', 'NPL', 'NP' FROM DUAL
WHERE NOT EXISTS (SELECT 1 FROM nations WHERE iso_code = 'NPL');

INSERT INTO nations (name, iso_code, flag_emoji)
SELECT 'England', 'ENG', 'GB' FROM DUAL
WHERE NOT EXISTS (SELECT 1 FROM nations WHERE iso_code = 'ENG');

INSERT INTO nations (name, iso_code, flag_emoji)
SELECT 'New Zealand', 'NZL', 'NZ' FROM DUAL
WHERE NOT EXISTS (SELECT 1 FROM nations WHERE iso_code = 'NZL');

INSERT INTO nations (name, iso_code, flag_emoji)
SELECT 'South Africa', 'RSA', 'ZA' FROM DUAL
WHERE NOT EXISTS (SELECT 1 FROM nations WHERE iso_code = 'RSA');

INSERT INTO nations (name, iso_code, flag_emoji)
SELECT 'Sri Lanka', 'LKA', 'LK' FROM DUAL
WHERE NOT EXISTS (SELECT 1 FROM nations WHERE iso_code = 'LKA');

INSERT INTO nations (name, iso_code, flag_emoji)
SELECT 'Afghanistan', 'AFG', 'AF' FROM DUAL
WHERE NOT EXISTS (SELECT 1 FROM nations WHERE iso_code = 'AFG');

INSERT INTO nations (name, iso_code, flag_emoji)
SELECT 'West Indies', 'WI', 'WI' FROM DUAL
WHERE NOT EXISTS (SELECT 1 FROM nations WHERE iso_code = 'WI');

INSERT INTO nations (name, iso_code, flag_emoji)
SELECT 'Ireland', 'IRE', 'IE' FROM DUAL
WHERE NOT EXISTS (SELECT 1 FROM nations WHERE iso_code = 'IRE');

INSERT INTO nations (name, iso_code, flag_emoji)
SELECT 'Netherlands', 'NED', 'NL' FROM DUAL
WHERE NOT EXISTS (SELECT 1 FROM nations WHERE iso_code = 'NED');

INSERT INTO competitions (name, short_name, nation_id, organization, established_year, is_active)
SELECT 'Indian Premier League', 'IPL', n.id, 'BCCI', 2008, 1
FROM nations n
WHERE n.iso_code = 'IND'
  AND NOT EXISTS (SELECT 1 FROM competitions WHERE short_name = 'IPL');

INSERT INTO competitions (name, short_name, nation_id, organization, established_year, is_active)
SELECT 'Pakistan Super League', 'PSL', n.id, 'PCB', 2015, 1
FROM nations n
WHERE n.iso_code = 'PAK'
  AND NOT EXISTS (SELECT 1 FROM competitions WHERE short_name = 'PSL');

INSERT INTO competitions (name, short_name, nation_id, organization, established_year, is_active)
SELECT 'Big Bash League', 'BBL', n.id, 'Cricket Australia', 2011, 1
FROM nations n
WHERE n.iso_code = 'AUS'
  AND NOT EXISTS (SELECT 1 FROM competitions WHERE short_name = 'BBL');

INSERT INTO competitions (name, short_name, nation_id, organization, established_year, is_active)
SELECT 'Bangladesh Premier League', 'BPL', n.id, 'BCB', 2012, 1
FROM nations n
WHERE n.iso_code = 'BGD'
  AND NOT EXISTS (SELECT 1 FROM competitions WHERE short_name = 'BPL');

INSERT INTO competitions (name, short_name, nation_id, organization, established_year, is_active)
SELECT 'Nepal Premier League', 'NPL', n.id, 'Cricket Association of Nepal', 2024, 1
FROM nations n
WHERE n.iso_code = 'NPL'
  AND NOT EXISTS (SELECT 1 FROM competitions WHERE short_name = 'NPL');

INSERT INTO league_seasons (id, competition_id, year, season_name, start_date, end_date, status, budget_cap, total_fixtures)
SELECT 'IPL_2025', c.id, 2025, 'IPL 2025', '2025-03-20', '2025-05-26', 'active', 100.0, 70
FROM competitions c
WHERE c.short_name = 'IPL'
  AND NOT EXISTS (SELECT 1 FROM league_seasons WHERE id = 'IPL_2025');

INSERT INTO league_seasons (id, competition_id, year, season_name, start_date, end_date, status, budget_cap, total_fixtures)
SELECT 'PSL_2025', c.id, 2025, 'PSL 2025', '2025-02-15', '2025-03-25', 'active', 100.0, 34
FROM competitions c
WHERE c.short_name = 'PSL'
  AND NOT EXISTS (SELECT 1 FROM league_seasons WHERE id = 'PSL_2025');

INSERT INTO league_seasons (id, competition_id, year, season_name, start_date, end_date, status, budget_cap, total_fixtures)
SELECT 'BBL_2025', c.id, 2025, 'BBL 2025', '2025-12-10', '2026-01-28', 'active', 100.0, 44
FROM competitions c
WHERE c.short_name = 'BBL'
  AND NOT EXISTS (SELECT 1 FROM league_seasons WHERE id = 'BBL_2025');

INSERT INTO league_seasons (id, competition_id, year, season_name, start_date, end_date, status, budget_cap, total_fixtures)
SELECT 'BPL_2025', c.id, 2025, 'BPL 2025', '2025-01-05', '2025-02-18', 'active', 100.0, 34
FROM competitions c
WHERE c.short_name = 'BPL'
  AND NOT EXISTS (SELECT 1 FROM league_seasons WHERE id = 'BPL_2025');

INSERT INTO league_seasons (id, competition_id, year, season_name, start_date, end_date, status, budget_cap, total_fixtures)
SELECT 'NPL_2025', c.id, 2025, 'NPL 2025', '2025-11-15', '2025-12-30', 'active', 100.0, 30
FROM competitions c
WHERE c.short_name = 'NPL'
  AND NOT EXISTS (SELECT 1 FROM league_seasons WHERE id = 'NPL_2025');


-- ============================================================
-- Consolidated from demo-seed.sql
-- ============================================================

USE new_fpl;

SET @admin_hash = '$2a$12$Csg56tv4n63vcN9rUht5sOyAhgIZeELBhlw1nRfallDuhUV9GYZdC';
SET @manager_hash = '$2a$12$Ifl52slzLz1gecXvovQJZeNem67/nHnS2RPxpWAi99e2lQmXHs86e';
SET @manager2_hash = '$2a$12$X4O8gv09qXGnm2FCVJfVV.M.C9S.J510Cnme8m.4KQZXeRyGGvmrq';

INSERT INTO users (name, email, password_hash, phone, role)
SELECT 'Admin User', 'admin@newfpl.local', @admin_hash, '9000000001', 'admin'
FROM DUAL
WHERE NOT EXISTS (SELECT 1 FROM users WHERE email = 'admin@newfpl.local');

INSERT INTO users (name, email, password_hash, phone, role)
SELECT 'Demo Manager', 'manager1@newfpl.local', @manager_hash, '9000000002', 'manager'
FROM DUAL
WHERE NOT EXISTS (SELECT 1 FROM users WHERE email = 'manager1@newfpl.local');

INSERT INTO users (name, email, password_hash, phone, role)
SELECT 'Second Manager', 'manager2@newfpl.local', @manager2_hash, '9000000003', 'manager'
FROM DUAL
WHERE NOT EXISTS (SELECT 1 FROM users WHERE email = 'manager2@newfpl.local');

INSERT INTO franchises (name, short_name, home_city)
SELECT 'Mumbai Indians', 'MI', 'Mumbai'
FROM DUAL
WHERE NOT EXISTS (SELECT 1 FROM franchises WHERE short_name = 'MI');

INSERT INTO franchises (name, short_name, home_city)
SELECT 'Chennai Super Kings', 'CSK', 'Chennai'
FROM DUAL
WHERE NOT EXISTS (SELECT 1 FROM franchises WHERE short_name = 'CSK');

INSERT INTO franchises (name, short_name, home_city)
SELECT 'Royal Challengers Bengaluru', 'RCB', 'Bengaluru'
FROM DUAL
WHERE NOT EXISTS (SELECT 1 FROM franchises WHERE short_name = 'RCB');

INSERT INTO franchises (name, short_name, home_city)
SELECT 'Kolkata Knight Riders', 'KKR', 'Kolkata'
FROM DUAL
WHERE NOT EXISTS (SELECT 1 FROM franchises WHERE short_name = 'KKR');

INSERT INTO franchises (name, short_name, home_city)
SELECT 'Delhi Capitals', 'DC', 'Delhi'
FROM DUAL
WHERE NOT EXISTS (SELECT 1 FROM franchises WHERE short_name = 'DC');

INSERT INTO franchises (name, short_name, home_city)
SELECT 'Rajasthan Royals', 'RR', 'Jaipur'
FROM DUAL
WHERE NOT EXISTS (SELECT 1 FROM franchises WHERE short_name = 'RR');

INSERT INTO franchises (name, short_name, home_city)
SELECT 'Punjab Kings', 'PBKS', 'Mohali'
FROM DUAL
WHERE NOT EXISTS (SELECT 1 FROM franchises WHERE short_name = 'PBKS');

INSERT INTO franchises (name, short_name, home_city)
SELECT 'Sunrisers Hyderabad', 'SRH', 'Hyderabad'
FROM DUAL
WHERE NOT EXISTS (SELECT 1 FROM franchises WHERE short_name = 'SRH');

INSERT INTO franchises (name, short_name, home_city)
SELECT 'Gujarat Titans', 'GT', 'Ahmedabad'
FROM DUAL
WHERE NOT EXISTS (SELECT 1 FROM franchises WHERE short_name = 'GT');

INSERT INTO franchises (name, short_name, home_city)
SELECT 'Lucknow Super Giants', 'LSG', 'Lucknow'
FROM DUAL
WHERE NOT EXISTS (SELECT 1 FROM franchises WHERE short_name = 'LSG');

INSERT INTO franchises (name, short_name, home_city)
SELECT 'India XI', 'IND', 'Mumbai'
FROM DUAL
WHERE NOT EXISTS (SELECT 1 FROM franchises WHERE short_name = 'IND');

INSERT INTO franchises (name, short_name, home_city)
SELECT 'Australia XI', 'AUS', 'Sydney'
FROM DUAL
WHERE NOT EXISTS (SELECT 1 FROM franchises WHERE short_name = 'AUS');

INSERT INTO franchises (name, short_name, home_city)
SELECT 'England XI', 'ENG', 'London'
FROM DUAL
WHERE NOT EXISTS (SELECT 1 FROM franchises WHERE short_name = 'ENG');

INSERT INTO franchises (name, short_name, home_city)
SELECT 'Nepal XI', 'NEP', 'Kathmandu'
FROM DUAL
WHERE NOT EXISTS (SELECT 1 FROM franchises WHERE short_name = 'NEP');

INSERT INTO franchises (name, short_name, home_city)
SELECT 'New Zealand XI', 'NZ', 'Auckland'
FROM DUAL
WHERE NOT EXISTS (SELECT 1 FROM franchises WHERE short_name = 'NZ');

INSERT INTO franchises (name, short_name, home_city)
SELECT 'South Africa XI', 'SA', 'Cape Town'
FROM DUAL
WHERE NOT EXISTS (SELECT 1 FROM franchises WHERE short_name = 'SA');

INSERT INTO franchises (name, short_name, home_city)
SELECT 'Pakistan XI', 'PAK', 'Lahore'
FROM DUAL
WHERE NOT EXISTS (SELECT 1 FROM franchises WHERE short_name = 'PAK');

INSERT INTO franchises (name, short_name, home_city)
SELECT 'Bangladesh XI', 'BAN', 'Dhaka'
FROM DUAL
WHERE NOT EXISTS (SELECT 1 FROM franchises WHERE short_name = 'BAN');

INSERT INTO franchises (name, short_name, home_city)
SELECT 'Sri Lanka XI', 'SL', 'Colombo'
FROM DUAL
WHERE NOT EXISTS (SELECT 1 FROM franchises WHERE short_name = 'SL');

INSERT INTO franchises (name, short_name, home_city)
SELECT 'Afghanistan XI', 'AFG', 'Kabul'
FROM DUAL
WHERE NOT EXISTS (SELECT 1 FROM franchises WHERE short_name = 'AFG');

INSERT INTO franchises (name, short_name, home_city)
SELECT 'West Indies XI', 'WI', 'Bridgetown'
FROM DUAL
WHERE NOT EXISTS (SELECT 1 FROM franchises WHERE short_name = 'WI');

INSERT INTO franchises (name, short_name, home_city)
SELECT 'Ireland XI', 'IRE', 'Dublin'
FROM DUAL
WHERE NOT EXISTS (SELECT 1 FROM franchises WHERE short_name = 'IRE');

INSERT INTO franchises (name, short_name, home_city)
SELECT 'Netherlands XI', 'NED', 'Amsterdam'
FROM DUAL
WHERE NOT EXISTS (SELECT 1 FROM franchises WHERE short_name = 'NED');

SET @mi_id = (SELECT id FROM franchises WHERE short_name = 'MI' LIMIT 1);
SET @csk_id = (SELECT id FROM franchises WHERE short_name = 'CSK' LIMIT 1);
SET @rcb_id = (SELECT id FROM franchises WHERE short_name = 'RCB' LIMIT 1);
SET @kkr_id = (SELECT id FROM franchises WHERE short_name = 'KKR' LIMIT 1);

INSERT INTO players (full_name, role, franchise_id, credit_price)
SELECT 'Ishan Kishan', 'WK', @mi_id, 9.0 FROM DUAL
WHERE NOT EXISTS (SELECT 1 FROM players WHERE full_name = 'Ishan Kishan' AND franchise_id = @mi_id);
INSERT INTO players (full_name, role, franchise_id, credit_price)
SELECT 'Rohit Sharma', 'BAT', @mi_id, 9.5 FROM DUAL
WHERE NOT EXISTS (SELECT 1 FROM players WHERE full_name = 'Rohit Sharma' AND franchise_id = @mi_id);
INSERT INTO players (full_name, role, franchise_id, credit_price)
SELECT 'Suryakumar Yadav', 'BAT', @mi_id, 9.5 FROM DUAL
WHERE NOT EXISTS (SELECT 1 FROM players WHERE full_name = 'Suryakumar Yadav' AND franchise_id = @mi_id);
INSERT INTO players (full_name, role, franchise_id, credit_price)
SELECT 'Hardik Pandya', 'AR', @mi_id, 9.5 FROM DUAL
WHERE NOT EXISTS (SELECT 1 FROM players WHERE full_name = 'Hardik Pandya' AND franchise_id = @mi_id);
INSERT INTO players (full_name, role, franchise_id, credit_price)
SELECT 'Jasprit Bumrah', 'BOWL', @mi_id, 9.0 FROM DUAL
WHERE NOT EXISTS (SELECT 1 FROM players WHERE full_name = 'Jasprit Bumrah' AND franchise_id = @mi_id);

INSERT INTO players (full_name, role, franchise_id, credit_price)
SELECT 'MS Dhoni', 'WK', @csk_id, 8.0 FROM DUAL
WHERE NOT EXISTS (SELECT 1 FROM players WHERE full_name = 'MS Dhoni' AND franchise_id = @csk_id);
INSERT INTO players (full_name, role, franchise_id, credit_price)
SELECT 'Ruturaj Gaikwad', 'BAT', @csk_id, 9.0 FROM DUAL
WHERE NOT EXISTS (SELECT 1 FROM players WHERE full_name = 'Ruturaj Gaikwad' AND franchise_id = @csk_id);
INSERT INTO players (full_name, role, franchise_id, credit_price)
SELECT 'Shivam Dube', 'AR', @csk_id, 8.5 FROM DUAL
WHERE NOT EXISTS (SELECT 1 FROM players WHERE full_name = 'Shivam Dube' AND franchise_id = @csk_id);
INSERT INTO players (full_name, role, franchise_id, credit_price)
SELECT 'Ravindra Jadeja', 'AR', @csk_id, 9.5 FROM DUAL
WHERE NOT EXISTS (SELECT 1 FROM players WHERE full_name = 'Ravindra Jadeja' AND franchise_id = @csk_id);
INSERT INTO players (full_name, role, franchise_id, credit_price)
SELECT 'Matheesha Pathirana', 'BOWL', @csk_id, 8.5 FROM DUAL
WHERE NOT EXISTS (SELECT 1 FROM players WHERE full_name = 'Matheesha Pathirana' AND franchise_id = @csk_id);

INSERT INTO players (full_name, role, franchise_id, credit_price)
SELECT 'Dinesh Karthik', 'WK', @rcb_id, 8.0 FROM DUAL
WHERE NOT EXISTS (SELECT 1 FROM players WHERE full_name = 'Dinesh Karthik' AND franchise_id = @rcb_id);
INSERT INTO players (full_name, role, franchise_id, credit_price)
SELECT 'Virat Kohli', 'BAT', @rcb_id, 10.0 FROM DUAL
WHERE NOT EXISTS (SELECT 1 FROM players WHERE full_name = 'Virat Kohli' AND franchise_id = @rcb_id);
INSERT INTO players (full_name, role, franchise_id, credit_price)
SELECT 'Rajat Patidar', 'BAT', @rcb_id, 8.5 FROM DUAL
WHERE NOT EXISTS (SELECT 1 FROM players WHERE full_name = 'Rajat Patidar' AND franchise_id = @rcb_id);
INSERT INTO players (full_name, role, franchise_id, credit_price)
SELECT 'Glenn Maxwell', 'AR', @rcb_id, 9.0 FROM DUAL
WHERE NOT EXISTS (SELECT 1 FROM players WHERE full_name = 'Glenn Maxwell' AND franchise_id = @rcb_id);
INSERT INTO players (full_name, role, franchise_id, credit_price)
SELECT 'Mohammed Siraj', 'BOWL', @rcb_id, 8.5 FROM DUAL
WHERE NOT EXISTS (SELECT 1 FROM players WHERE full_name = 'Mohammed Siraj' AND franchise_id = @rcb_id);

INSERT INTO players (full_name, role, franchise_id, credit_price)
SELECT 'Phil Salt', 'WK', @kkr_id, 8.5 FROM DUAL
WHERE NOT EXISTS (SELECT 1 FROM players WHERE full_name = 'Phil Salt' AND franchise_id = @kkr_id);
INSERT INTO players (full_name, role, franchise_id, credit_price)
SELECT 'Shreyas Iyer', 'BAT', @kkr_id, 9.0 FROM DUAL
WHERE NOT EXISTS (SELECT 1 FROM players WHERE full_name = 'Shreyas Iyer' AND franchise_id = @kkr_id);
INSERT INTO players (full_name, role, franchise_id, credit_price)
SELECT 'Rinku Singh', 'BAT', @kkr_id, 8.5 FROM DUAL
WHERE NOT EXISTS (SELECT 1 FROM players WHERE full_name = 'Rinku Singh' AND franchise_id = @kkr_id);
INSERT INTO players (full_name, role, franchise_id, credit_price)
SELECT 'Sunil Narine', 'AR', @kkr_id, 9.5 FROM DUAL
WHERE NOT EXISTS (SELECT 1 FROM players WHERE full_name = 'Sunil Narine' AND franchise_id = @kkr_id);
INSERT INTO players (full_name, role, franchise_id, credit_price)
SELECT 'Mitchell Starc', 'BOWL', @kkr_id, 9.0 FROM DUAL
WHERE NOT EXISTS (SELECT 1 FROM players WHERE full_name = 'Mitchell Starc' AND franchise_id = @kkr_id);

DROP TEMPORARY TABLE IF EXISTS tmp_seed_players;
CREATE TEMPORARY TABLE tmp_seed_players (
  full_name VARCHAR(120) NOT NULL,
  role ENUM('WK','BAT','AR','BOWL') NOT NULL,
  short_name VARCHAR(10) NOT NULL,
  credit_price DECIMAL(5,1) NOT NULL
);

-- Credits are performance-tiered for current form: 10.0 elite, 9.0-9.5 strong, 8.0-8.5 stable, 7.0-7.5 developing.
INSERT INTO tmp_seed_players (full_name, role, short_name, credit_price) VALUES
('Shubman Gill', 'BAT', 'IND', 10.0),
('Yashasvi Jaiswal', 'BAT', 'IND', 9.5),
('KL Rahul', 'WK', 'IND', 9.0),
('Rishabh Pant', 'WK', 'IND', 9.5),
('Sanju Samson', 'WK', 'IND', 8.5),
('Tilak Varma', 'BAT', 'IND', 8.5),
('Axar Patel', 'AR', 'IND', 8.5),
('Kuldeep Yadav', 'BOWL', 'IND', 8.5),
('Arshdeep Singh', 'BOWL', 'IND', 8.0),
('Ravichandran Ashwin', 'AR', 'IND', 8.0),
('Pat Cummins', 'BOWL', 'AUS', 9.5),
('Josh Hazlewood', 'BOWL', 'AUS', 9.0),
('Adam Zampa', 'BOWL', 'AUS', 8.5),
('Travis Head', 'BAT', 'AUS', 9.5),
('Steve Smith', 'BAT', 'AUS', 8.5),
('Marnus Labuschagne', 'BAT', 'AUS', 8.0),
('Josh Inglis', 'WK', 'AUS', 8.5),
('Alex Carey', 'WK', 'AUS', 8.0),
('Marcus Stoinis', 'AR', 'AUS', 8.5),
('Cameron Green', 'AR', 'AUS', 8.5),
('Jos Buttler', 'WK', 'ENG', 9.5),
('Jonny Bairstow', 'WK', 'ENG', 8.5),
('Ben Stokes', 'AR', 'ENG', 9.0),
('Moeen Ali', 'AR', 'ENG', 8.5),
('Sam Curran', 'AR', 'ENG', 8.5),
('Harry Brook', 'BAT', 'ENG', 9.0),
('Joe Root', 'BAT', 'ENG', 9.0),
('Dawid Malan', 'BAT', 'ENG', 8.0),
('Jofra Archer', 'BOWL', 'ENG', 8.5),
('Adil Rashid', 'BOWL', 'ENG', 8.0),
('Rohit Paudel', 'BAT', 'NEP', 8.0),
('Aasif Sheikh', 'WK', 'NEP', 7.5),
('Kushal Bhurtel', 'BAT', 'NEP', 7.5),
('Kushal Malla', 'AR', 'NEP', 8.0),
('Dipendra Singh Airee', 'AR', 'NEP', 8.5),
('Gulshan Jha', 'AR', 'NEP', 7.5),
('Sompal Kami', 'BOWL', 'NEP', 7.5),
('Karan KC', 'BOWL', 'NEP', 8.0),
('Sandeep Lamichhane', 'BOWL', 'NEP', 8.5),
('Lalit Rajbanshi', 'BOWL', 'NEP', 7.0),
('Kane Williamson', 'BAT', 'NZ', 9.0),
('Rachin Ravindra', 'AR', 'NZ', 9.0),
('Daryl Mitchell', 'AR', 'NZ', 8.5),
('Glenn Phillips', 'WK', 'NZ', 8.5),
('Tom Latham', 'WK', 'NZ', 8.0),
('Devon Conway', 'BAT', 'NZ', 8.5),
('Finn Allen', 'BAT', 'NZ', 8.0),
('Mitchell Santner', 'AR', 'NZ', 8.5),
('Trent Boult', 'BOWL', 'NZ', 9.0),
('Tim Southee', 'BOWL', 'NZ', 8.0),
('Quinton de Kock', 'WK', 'SA', 9.0),
('Heinrich Klaasen', 'WK', 'SA', 9.0),
('Aiden Markram', 'BAT', 'SA', 8.5),
('David Miller', 'BAT', 'SA', 8.5),
('Rassie van der Dussen', 'BAT', 'SA', 8.0),
('Marco Jansen', 'AR', 'SA', 8.5),
('Andile Phehlukwayo', 'AR', 'SA', 7.5),
('Kagiso Rabada', 'BOWL', 'SA', 9.5),
('Anrich Nortje', 'BOWL', 'SA', 8.5),
('Keshav Maharaj', 'BOWL', 'SA', 8.0),
('Babar Azam', 'BAT', 'PAK', 9.5),
('Mohammad Rizwan', 'WK', 'PAK', 9.5),
('Fakhar Zaman', 'BAT', 'PAK', 8.5),
('Saim Ayub', 'BAT', 'PAK', 8.0),
('Iftikhar Ahmed', 'AR', 'PAK', 7.5),
('Shadab Khan', 'AR', 'PAK', 8.5),
('Imad Wasim', 'AR', 'PAK', 8.0),
('Shaheen Afridi', 'BOWL', 'PAK', 9.5),
('Haris Rauf', 'BOWL', 'PAK', 8.5),
('Naseem Shah', 'BOWL', 'PAK', 8.5),
('Litton Das', 'WK', 'BAN', 8.0),
('Najmul Hossain Shanto', 'BAT', 'BAN', 8.0),
('Towhid Hridoy', 'BAT', 'BAN', 7.5),
('Soumya Sarkar', 'AR', 'BAN', 7.5),
('Shakib Al Hasan', 'AR', 'BAN', 9.0),
('Mehidy Hasan Miraz', 'AR', 'BAN', 8.5),
('Mahmudullah', 'AR', 'BAN', 7.5),
('Mustafizur Rahman', 'BOWL', 'BAN', 8.5),
('Taskin Ahmed', 'BOWL', 'BAN', 8.0),
('Shoriful Islam', 'BOWL', 'BAN', 7.5),
('Kusal Mendis', 'WK', 'SL', 8.5),
('Pathum Nissanka', 'BAT', 'SL', 8.5),
('Charith Asalanka', 'BAT', 'SL', 8.0),
('Sadeera Samarawickrama', 'WK', 'SL', 7.5),
('Wanindu Hasaranga', 'AR', 'SL', 9.0),
('Dasun Shanaka', 'AR', 'SL', 8.0),
('Dunith Wellalage', 'AR', 'SL', 8.0),
('Maheesh Theekshana', 'BOWL', 'SL', 8.5),
('Dushmantha Chameera', 'BOWL', 'SL', 8.0),
('Nuwan Thushara', 'BOWL', 'SL', 7.5),
('Rahmanullah Gurbaz', 'WK', 'AFG', 8.5),
('Ibrahim Zadran', 'BAT', 'AFG', 8.0),
('Rahmat Shah', 'BAT', 'AFG', 7.5),
('Najibullah Zadran', 'BAT', 'AFG', 7.5),
('Mohammad Nabi', 'AR', 'AFG', 8.5),
('Azmatullah Omarzai', 'AR', 'AFG', 8.5),
('Rashid Khan', 'AR', 'AFG', 10.0),
('Mujeeb Ur Rahman', 'BOWL', 'AFG', 8.5),
('Fazalhaq Farooqi', 'BOWL', 'AFG', 8.0),
('Naveen ul Haq', 'BOWL', 'AFG', 8.0),
('Nicholas Pooran', 'WK', 'WI', 9.0),
('Shai Hope', 'WK', 'WI', 8.0),
('Brandon King', 'BAT', 'WI', 8.0),
('Kyle Mayers', 'AR', 'WI', 8.0),
('Rovman Powell', 'BAT', 'WI', 8.0),
('Shimron Hetmyer', 'BAT', 'WI', 8.0),
('Andre Russell', 'AR', 'WI', 9.0),
('Jason Holder', 'AR', 'WI', 8.5),
('Akeal Hosein', 'BOWL', 'WI', 8.0),
('Alzarri Joseph', 'BOWL', 'WI', 8.5),
('Paul Stirling', 'BAT', 'IRE', 8.0),
('Andrew Balbirnie', 'BAT', 'IRE', 7.5),
('Harry Tector', 'BAT', 'IRE', 8.0),
('Lorcan Tucker', 'WK', 'IRE', 7.5),
('George Dockrell', 'AR', 'IRE', 7.5),
('Curtis Campher', 'AR', 'IRE', 8.0),
('Mark Adair', 'AR', 'IRE', 8.0),
('Joshua Little', 'BOWL', 'IRE', 8.0),
('Barry McCarthy', 'BOWL', 'IRE', 7.5),
('Ben White', 'BOWL', 'IRE', 7.0),
('Scott Edwards', 'WK', 'NED', 7.5),
('Max ODowd', 'BAT', 'NED', 7.5),
('Vikramjit Singh', 'BAT', 'NED', 7.0),
('Bas de Leede', 'AR', 'NED', 8.0),
('Teja Nidamanuru', 'BAT', 'NED', 7.0),
('Sybrand Engelbrecht', 'AR', 'NED', 7.5),
('Roelof van der Merwe', 'AR', 'NED', 7.5),
('Logan van Beek', 'BOWL', 'NED', 7.5),
('Fred Klaassen', 'BOWL', 'NED', 7.0),
('Aryan Dutt', 'BOWL', 'NED', 7.5);

INSERT INTO players (full_name, role, franchise_id, credit_price, is_active, ownership_percent)
SELECT
  tsp.full_name,
  tsp.role,
  f.id,
  tsp.credit_price,
  1,
  ROUND(LEAST(88.0, GREATEST(6.0, (tsp.credit_price - 6.5) * 14.0)), 2)
FROM tmp_seed_players tsp
JOIN franchises f ON f.short_name = tsp.short_name
WHERE NOT EXISTS (
  SELECT 1
  FROM players p
  WHERE p.full_name = tsp.full_name AND p.franchise_id = f.id
);

DROP TEMPORARY TABLE IF EXISTS tmp_seed_players;

SET @ishan_id = (SELECT id FROM players WHERE full_name = 'Ishan Kishan' AND franchise_id = @mi_id LIMIT 1);
SET @rohit_id = (SELECT id FROM players WHERE full_name = 'Rohit Sharma' AND franchise_id = @mi_id LIMIT 1);
SET @sky_id = (SELECT id FROM players WHERE full_name = 'Suryakumar Yadav' AND franchise_id = @mi_id LIMIT 1);
SET @hardik_id = (SELECT id FROM players WHERE full_name = 'Hardik Pandya' AND franchise_id = @mi_id LIMIT 1);
SET @bumrah_id = (SELECT id FROM players WHERE full_name = 'Jasprit Bumrah' AND franchise_id = @mi_id LIMIT 1);
SET @dhoni_id = (SELECT id FROM players WHERE full_name = 'MS Dhoni' AND franchise_id = @csk_id LIMIT 1);
SET @ruturaj_id = (SELECT id FROM players WHERE full_name = 'Ruturaj Gaikwad' AND franchise_id = @csk_id LIMIT 1);
SET @dube_id = (SELECT id FROM players WHERE full_name = 'Shivam Dube' AND franchise_id = @csk_id LIMIT 1);
SET @jadeja_id = (SELECT id FROM players WHERE full_name = 'Ravindra Jadeja' AND franchise_id = @csk_id LIMIT 1);
SET @pathirana_id = (SELECT id FROM players WHERE full_name = 'Matheesha Pathirana' AND franchise_id = @csk_id LIMIT 1);
SET @dk_id = (SELECT id FROM players WHERE full_name = 'Dinesh Karthik' AND franchise_id = @rcb_id LIMIT 1);
SET @kohli_id = (SELECT id FROM players WHERE full_name = 'Virat Kohli' AND franchise_id = @rcb_id LIMIT 1);
SET @patidar_id = (SELECT id FROM players WHERE full_name = 'Rajat Patidar' AND franchise_id = @rcb_id LIMIT 1);
SET @maxwell_id = (SELECT id FROM players WHERE full_name = 'Glenn Maxwell' AND franchise_id = @rcb_id LIMIT 1);
SET @siraj_id = (SELECT id FROM players WHERE full_name = 'Mohammed Siraj' AND franchise_id = @rcb_id LIMIT 1);
SET @salt_id = (SELECT id FROM players WHERE full_name = 'Phil Salt' AND franchise_id = @kkr_id LIMIT 1);
SET @shreyas_id = (SELECT id FROM players WHERE full_name = 'Shreyas Iyer' AND franchise_id = @kkr_id LIMIT 1);
SET @rinku_id = (SELECT id FROM players WHERE full_name = 'Rinku Singh' AND franchise_id = @kkr_id LIMIT 1);
SET @narine_id = (SELECT id FROM players WHERE full_name = 'Sunil Narine' AND franchise_id = @kkr_id LIMIT 1);
SET @starc_id = (SELECT id FROM players WHERE full_name = 'Mitchell Starc' AND franchise_id = @kkr_id LIMIT 1);

INSERT INTO fixtures (league_season_id, home_franchise_id, away_franchise_id, venue, starts_at, toss_at, lock_at, status, winner_franchise_id, motm_player_id)
SELECT 'IPL_2025', @mi_id, @csk_id, 'Wankhede Stadium', '2026-04-02 19:30:00', '2026-04-02 19:00:00', '2026-04-02 18:30:00', 'SCHEDULED', NULL, NULL
FROM DUAL
WHERE NOT EXISTS (SELECT 1 FROM fixtures WHERE league_season_id = 'IPL_2025' AND venue = 'Wankhede Stadium' AND starts_at = '2026-04-02 19:30:00');

INSERT INTO fixtures (league_season_id, home_franchise_id, away_franchise_id, venue, starts_at, toss_at, lock_at, status, winner_franchise_id, motm_player_id)
SELECT 'IPL_2025', @rcb_id, @kkr_id, 'M. Chinnaswamy Stadium', '2026-04-03 19:30:00', '2026-04-03 19:00:00', '2026-04-03 18:30:00', 'LIVE', @kkr_id, @narine_id
FROM DUAL
WHERE NOT EXISTS (SELECT 1 FROM fixtures WHERE league_season_id = 'IPL_2025' AND venue = 'M. Chinnaswamy Stadium' AND starts_at = '2026-04-03 19:30:00');

INSERT INTO fixtures (league_season_id, home_franchise_id, away_franchise_id, venue, starts_at, toss_at, lock_at, status, winner_franchise_id, motm_player_id)
SELECT 'IPL_2025', @csk_id, @rcb_id, 'MA Chidambaram Stadium', '2026-04-05 15:30:00', '2026-04-05 15:00:00', '2026-04-05 14:30:00', 'COMPLETED', @csk_id, @jadeja_id
FROM DUAL
WHERE NOT EXISTS (SELECT 1 FROM fixtures WHERE league_season_id = 'IPL_2025' AND venue = 'MA Chidambaram Stadium' AND starts_at = '2026-04-05 15:30:00');

SET @fixture_1_id = (SELECT id FROM fixtures WHERE venue = 'Wankhede Stadium' AND starts_at = '2026-04-02 19:30:00' LIMIT 1);
SET @fixture_2_id = (SELECT id FROM fixtures WHERE venue = 'M. Chinnaswamy Stadium' AND starts_at = '2026-04-03 19:30:00' LIMIT 1);
SET @fixture_3_id = (SELECT id FROM fixtures WHERE venue = 'MA Chidambaram Stadium' AND starts_at = '2026-04-05 15:30:00' LIMIT 1);
SET @manager1_id = (SELECT id FROM users WHERE email = 'manager1@newfpl.local' LIMIT 1);
SET @manager2_id = (SELECT id FROM users WHERE email = 'manager2@newfpl.local' LIMIT 1);
SET @admin_id = (SELECT id FROM users WHERE email = 'admin@newfpl.local' LIMIT 1);

INSERT INTO manager_squads (
  user_id, fixture_id, league_season_id, budget_cap, total_spent, transfers_used, free_transfers,
  transfer_penalty_points, captain_player_id, vice_captain_player_id, impact_player_id,
  booster, is_locked, points_total, rank_global
)
SELECT @manager1_id, @fixture_1_id, 'IPL_2025', 100.0, 98.0, 1, 2, 0, @sky_id, @jadeja_id, @hardik_id, 'NONE', 0, 0, 1
FROM DUAL
WHERE NOT EXISTS (SELECT 1 FROM manager_squads WHERE user_id = @manager1_id AND fixture_id = @fixture_1_id);

INSERT INTO manager_squads (
  user_id, fixture_id, league_season_id, budget_cap, total_spent, transfers_used, free_transfers,
  transfer_penalty_points, captain_player_id, vice_captain_player_id, impact_player_id,
  booster, is_locked, points_total, rank_global
)
SELECT @manager2_id, @fixture_1_id, 'IPL_2025', 100.0, 97.5, 2, 2, 0, @ruturaj_id, @bumrah_id, @dube_id, 'TRIPLE_CAPTAIN', 0, 0, 2
FROM DUAL
WHERE NOT EXISTS (SELECT 1 FROM manager_squads WHERE user_id = @manager2_id AND fixture_id = @fixture_1_id);

INSERT INTO manager_squads (
  user_id, fixture_id, league_season_id, budget_cap, total_spent, transfers_used, free_transfers,
  transfer_penalty_points, captain_player_id, vice_captain_player_id, impact_player_id,
  booster, is_locked, points_total, rank_global
)
SELECT @manager1_id, @fixture_2_id, 'IPL_2025', 100.0, 96.5, 0, 2, 0, @kohli_id, @narine_id, @maxwell_id, 'NONE', 0, 54.5, 1
FROM DUAL
WHERE NOT EXISTS (SELECT 1 FROM manager_squads WHERE user_id = @manager1_id AND fixture_id = @fixture_2_id);

INSERT INTO manager_squads (
  user_id, fixture_id, league_season_id, budget_cap, total_spent, transfers_used, free_transfers,
  transfer_penalty_points, captain_player_id, vice_captain_player_id, impact_player_id,
  booster, is_locked, points_total, rank_global
)
SELECT @manager2_id, @fixture_3_id, 'IPL_2025', 100.0, 95.0, 1, 2, 0, @jadeja_id, @kohli_id, @siraj_id, 'NONE', 1, 88.0, 1
FROM DUAL
WHERE NOT EXISTS (SELECT 1 FROM manager_squads WHERE user_id = @manager2_id AND fixture_id = @fixture_3_id);

SET @squad_f1_m1 = (SELECT id FROM manager_squads WHERE user_id = @manager1_id AND fixture_id = @fixture_1_id LIMIT 1);
SET @squad_f1_m2 = (SELECT id FROM manager_squads WHERE user_id = @manager2_id AND fixture_id = @fixture_1_id LIMIT 1);
SET @squad_f2_m1 = (SELECT id FROM manager_squads WHERE user_id = @manager1_id AND fixture_id = @fixture_2_id LIMIT 1);
SET @squad_f3_m2 = (SELECT id FROM manager_squads WHERE user_id = @manager2_id AND fixture_id = @fixture_3_id LIMIT 1);

INSERT IGNORE INTO manager_squad_players (squad_id, player_id, is_starting_xi) VALUES
(@squad_f1_m1, @ishan_id, 1), (@squad_f1_m1, @rohit_id, 1), (@squad_f1_m1, @sky_id, 1), (@squad_f1_m1, @hardik_id, 1), (@squad_f1_m1, @bumrah_id, 1), (@squad_f1_m1, @dhoni_id, 1), (@squad_f1_m1, @ruturaj_id, 1), (@squad_f1_m1, @dube_id, 1), (@squad_f1_m1, @jadeja_id, 1), (@squad_f1_m1, @pathirana_id, 1), (@squad_f1_m1, @kohli_id, 1),
(@squad_f1_m2, @ishan_id, 1), (@squad_f1_m2, @rohit_id, 1), (@squad_f1_m2, @sky_id, 1), (@squad_f1_m2, @hardik_id, 1), (@squad_f1_m2, @bumrah_id, 1), (@squad_f1_m2, @dhoni_id, 1), (@squad_f1_m2, @ruturaj_id, 1), (@squad_f1_m2, @dube_id, 1), (@squad_f1_m2, @jadeja_id, 1), (@squad_f1_m2, @pathirana_id, 1), (@squad_f1_m2, @narine_id, 1),
(@squad_f2_m1, @dk_id, 1), (@squad_f2_m1, @kohli_id, 1), (@squad_f2_m1, @patidar_id, 1), (@squad_f2_m1, @maxwell_id, 1), (@squad_f2_m1, @siraj_id, 1), (@squad_f2_m1, @salt_id, 1), (@squad_f2_m1, @shreyas_id, 1), (@squad_f2_m1, @rinku_id, 1), (@squad_f2_m1, @narine_id, 1), (@squad_f2_m1, @starc_id, 1), (@squad_f2_m1, @jadeja_id, 1),
(@squad_f3_m2, @dhoni_id, 1), (@squad_f3_m2, @ruturaj_id, 1), (@squad_f3_m2, @dube_id, 1), (@squad_f3_m2, @jadeja_id, 1), (@squad_f3_m2, @pathirana_id, 1), (@squad_f3_m2, @dk_id, 1), (@squad_f3_m2, @kohli_id, 1), (@squad_f3_m2, @patidar_id, 1), (@squad_f3_m2, @maxwell_id, 1), (@squad_f3_m2, @siraj_id, 1), (@squad_f3_m2, @hardik_id, 1);

INSERT INTO boosters_usage (user_id, season, booster, used_in_fixture_id)
SELECT @manager2_id, 'IPL2026', 'TRIPLE_CAPTAIN', @fixture_1_id
FROM DUAL
WHERE NOT EXISTS (
  SELECT 1 FROM boosters_usage WHERE user_id = @manager2_id AND season = 'IPL2026' AND booster = 'TRIPLE_CAPTAIN'
);

INSERT INTO player_live_stats (
  fixture_id, player_id, franchise_id, runs, fours, sixes, balls_faced,
  is_duck, wickets, maidens, economy_rate, three_wicket_haul, catches,
  stumpings, direct_hit_runouts, dropped_catches
) VALUES
(@fixture_1_id, @sky_id, @mi_id, 72, 8, 3, 47, 0, 0, 0, 0.00, 0, 1, 0, 0, 0),
(@fixture_1_id, @bumrah_id, @mi_id, 3, 0, 0, 4, 0, 2, 1, 5.50, 0, 0, 0, 0, 0),
(@fixture_1_id, @ruturaj_id, @csk_id, 58, 6, 2, 41, 0, 0, 0, 0.00, 0, 0, 0, 0, 0),
(@fixture_1_id, @jadeja_id, @csk_id, 24, 1, 1, 17, 0, 1, 0, 6.75, 0, 2, 0, 1, 0),
(@fixture_2_id, @kohli_id, @rcb_id, 81, 9, 2, 52, 0, 0, 0, 0.00, 0, 0, 0, 0, 0),
(@fixture_2_id, @siraj_id, @rcb_id, 4, 0, 0, 6, 0, 1, 0, 8.25, 0, 1, 0, 0, 0),
(@fixture_2_id, @narine_id, @kkr_id, 33, 2, 2, 18, 0, 3, 1, 5.75, 1, 1, 0, 0, 0),
(@fixture_2_id, @starc_id, @kkr_id, 6, 0, 0, 5, 0, 2, 0, 7.10, 0, 0, 0, 0, 0),
(@fixture_3_id, @jadeja_id, @csk_id, 41, 3, 2, 24, 0, 2, 0, 6.20, 0, 2, 0, 0, 0),
(@fixture_3_id, @pathirana_id, @csk_id, 0, 0, 0, 0, 0, 3, 1, 5.40, 1, 0, 0, 0, 0),
(@fixture_3_id, @kohli_id, @rcb_id, 63, 7, 2, 46, 0, 0, 0, 0.00, 0, 0, 0, 0, 0),
(@fixture_3_id, @siraj_id, @rcb_id, 2, 0, 0, 5, 0, 1, 0, 8.80, 0, 0, 0, 0, 0)
ON DUPLICATE KEY UPDATE
  runs = VALUES(runs),
  fours = VALUES(fours),
  sixes = VALUES(sixes),
  balls_faced = VALUES(balls_faced),
  is_duck = VALUES(is_duck),
  wickets = VALUES(wickets),
  maidens = VALUES(maidens),
  economy_rate = VALUES(economy_rate),
  three_wicket_haul = VALUES(three_wicket_haul),
  catches = VALUES(catches),
  stumpings = VALUES(stumpings),
  direct_hit_runouts = VALUES(direct_hit_runouts),
  dropped_catches = VALUES(dropped_catches),
  updated_at = CURRENT_TIMESTAMP;

INSERT INTO private_leagues (league_season_id, creator_user_id, admin_user_id, name, invite_code, is_overall, is_active)
SELECT 'IPL_2025', @manager1_id, @manager1_id, 'Office Champions League', 'OFFICE2026', 0, 1
FROM DUAL
WHERE NOT EXISTS (SELECT 1 FROM private_leagues WHERE invite_code = 'OFFICE2026');

SET @league_id = (SELECT id FROM private_leagues WHERE invite_code = 'OFFICE2026' LIMIT 1);

INSERT IGNORE INTO private_league_members (league_id, user_id, role)
VALUES (@league_id, @manager1_id, 'admin'), (@league_id, @manager2_id, 'member');

INSERT INTO h2h_fixtures (fixture_id, user_a_id, user_b_id, winner_user_id, status)
SELECT @fixture_2_id, @manager1_id, @manager2_id, NULL, 'SCHEDULED'
FROM DUAL
WHERE NOT EXISTS (
  SELECT 1 FROM h2h_fixtures WHERE fixture_id = @fixture_2_id AND user_a_id = @manager1_id AND user_b_id = @manager2_id
);

INSERT INTO predictions (
  fixture_id, user_id, predicted_toss_winner_id, predicted_match_winner_id,
  predicted_motm_player_id, predicted_top_scorer_id, predicted_top_wicket_taker_id, points_earned
)
SELECT @fixture_2_id, @manager1_id, @rcb_id, @kkr_id, @narine_id, @kohli_id, @narine_id, 0
FROM DUAL
WHERE NOT EXISTS (SELECT 1 FROM predictions WHERE fixture_id = @fixture_2_id AND user_id = @manager1_id);

INSERT INTO quiz_questions (
  fixture_id, question_text, option_a, option_b, option_c, option_d,
  correct_option, starts_at, ends_at, points
)
SELECT @fixture_2_id, 'Who will take the most wickets in Bengaluru?', 'Mohammed Siraj', 'Mitchell Starc', 'Sunil Narine', 'Glenn Maxwell', 'C', '2026-04-03 18:00:00', '2026-04-03 19:00:00', 5
FROM DUAL
WHERE NOT EXISTS (
  SELECT 1 FROM quiz_questions WHERE fixture_id = @fixture_2_id AND question_text = 'Who will take the most wickets in Bengaluru?'
);

SET @quiz_id = (
  SELECT id FROM quiz_questions WHERE fixture_id = @fixture_2_id AND question_text = 'Who will take the most wickets in Bengaluru?' LIMIT 1
);

INSERT INTO quiz_answers (question_id, user_id, selected_option, answered_at, is_correct, points_earned)
SELECT @quiz_id, @manager1_id, 'C', '2026-04-03 18:15:00', 1, 5
FROM DUAL
WHERE NOT EXISTS (SELECT 1 FROM quiz_answers WHERE question_id = @quiz_id AND user_id = @manager1_id);

INSERT INTO push_notifications (user_id, type, title, body, is_read)
SELECT @manager1_id, 'DEADLINE_ALERT', 'Bengaluru deadline approaching', 'Your RCB vs KKR squad locks in 30 minutes.', 0
FROM DUAL
WHERE NOT EXISTS (
  SELECT 1 FROM push_notifications WHERE user_id = @manager1_id AND title = 'Bengaluru deadline approaching'
);

INSERT INTO admin_player_price_logs (admin_user_id, player_id, old_price, new_price, reason)
SELECT @admin_id, @narine_id, 9.0, 9.5, 'Promoted up the order and bowling full quota'
FROM DUAL
WHERE NOT EXISTS (
  SELECT 1 FROM admin_player_price_logs WHERE admin_user_id = @admin_id AND player_id = @narine_id AND reason = 'Promoted up the order and bowling full quota'
);

INSERT INTO admin_user_bans (admin_user_id, banned_user_id, reason, starts_at, ends_at, is_active)
SELECT @admin_id, @manager2_id, 'Demo disciplinary action', '2026-04-01 00:00:00', '2026-04-03 00:00:00', 0
FROM DUAL
WHERE NOT EXISTS (
  SELECT 1 FROM admin_user_bans WHERE admin_user_id = @admin_id AND banned_user_id = @manager2_id AND reason = 'Demo disciplinary action'
);

INSERT INTO dream_teams (fixture_id, generated_at, total_points)
SELECT @fixture_3_id, '2026-04-05 22:45:00', 139.5
FROM DUAL
WHERE NOT EXISTS (SELECT 1 FROM dream_teams WHERE fixture_id = @fixture_3_id);

SET @dream_team_id = (SELECT id FROM dream_teams WHERE fixture_id = @fixture_3_id LIMIT 1);

INSERT IGNORE INTO dream_team_players (dream_team_id, player_id, role) VALUES
(@dream_team_id, @dhoni_id, 'WK'),
(@dream_team_id, @ruturaj_id, 'BAT'),
(@dream_team_id, @kohli_id, 'BAT'),
(@dream_team_id, @patidar_id, 'BAT'),
(@dream_team_id, @sky_id, 'BAT'),
(@dream_team_id, @jadeja_id, 'AR'),
(@dream_team_id, @hardik_id, 'AR'),
(@dream_team_id, @pathirana_id, 'BOWL'),
(@dream_team_id, @siraj_id, 'BOWL'),
(@dream_team_id, @bumrah_id, 'BOWL'),
(@dream_team_id, @starc_id, 'BOWL');

INSERT INTO ai_recommendations (fixture_id, player_id, reason, confidence_score)
SELECT @fixture_2_id, @narine_id, 'Dual scoring upside with powerplay bowling and pinch-hitting role', 89.40
FROM DUAL
WHERE NOT EXISTS (SELECT 1 FROM ai_recommendations WHERE fixture_id = @fixture_2_id AND player_id = @narine_id);

SELECT 'franchises' AS table_name, COUNT(*) AS total FROM franchises
UNION ALL
SELECT 'players', COUNT(*) FROM players
UNION ALL
SELECT 'fixtures', COUNT(*) FROM fixtures
UNION ALL
SELECT 'manager_squads', COUNT(*) FROM manager_squads
UNION ALL
SELECT 'manager_squad_players', COUNT(*) FROM manager_squad_players
UNION ALL
SELECT 'player_live_stats', COUNT(*) FROM player_live_stats
UNION ALL
SELECT 'private_leagues', COUNT(*) FROM private_leagues
UNION ALL
SELECT 'private_league_members', COUNT(*) FROM private_league_members
UNION ALL
SELECT 'predictions', COUNT(*) FROM predictions
UNION ALL
SELECT 'quiz_questions', COUNT(*) FROM quiz_questions
UNION ALL
SELECT 'quiz_answers', COUNT(*) FROM quiz_answers
UNION ALL
SELECT 'push_notifications', COUNT(*) FROM push_notifications
UNION ALL
SELECT 'dream_teams', COUNT(*) FROM dream_teams
UNION ALL
SELECT 'dream_team_players', COUNT(*) FROM dream_team_players
UNION ALL
SELECT 'ai_recommendations', COUNT(*) FROM ai_recommendations;


-- ============================================================
-- Consolidated from seed-real-multi-league.sql
-- ============================================================

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
-- Baseline fixtures so every active league has selectable matches on first boot
-- ---------------------------------------------------------------------------
SET @psl_kk = (SELECT franchise_id FROM league_franchises WHERE league_season_id = 'PSL_2025' AND team_code = 'KK' LIMIT 1);
SET @psl_iu = (SELECT franchise_id FROM league_franchises WHERE league_season_id = 'PSL_2025' AND team_code = 'IU' LIMIT 1);
SET @psl_lq = (SELECT franchise_id FROM league_franchises WHERE league_season_id = 'PSL_2025' AND team_code = 'LQ' LIMIT 1);
SET @psl_msu = (SELECT franchise_id FROM league_franchises WHERE league_season_id = 'PSL_2025' AND team_code = 'MSU' LIMIT 1);
SET @bpl_frt = (SELECT franchise_id FROM league_franchises WHERE league_season_id = 'BPL_2025' AND team_code = 'FRT' LIMIT 1);
SET @bpl_syl = (SELECT franchise_id FROM league_franchises WHERE league_season_id = 'BPL_2025' AND team_code = 'SYL' LIMIT 1);
SET @bbl_ads = (SELECT franchise_id FROM league_franchises WHERE league_season_id = 'BBL_2025' AND team_code = 'ADS' LIMIT 1);
SET @bbl_sys = (SELECT franchise_id FROM league_franchises WHERE league_season_id = 'BBL_2025' AND team_code = 'SYS' LIMIT 1);
SET @npl_ktm = (SELECT franchise_id FROM league_franchises WHERE league_season_id = 'NPL_2025' AND team_code = 'KTM' LIMIT 1);
SET @npl_pok = (SELECT franchise_id FROM league_franchises WHERE league_season_id = 'NPL_2025' AND team_code = 'POK' LIMIT 1);

INSERT INTO fixtures (league_season_id, home_franchise_id, away_franchise_id, venue, starts_at, toss_at, lock_at, status, winner_franchise_id, motm_player_id)
SELECT 'PSL_2025', @psl_kk, @psl_iu, 'National Stadium, Karachi', '2026-04-07 19:30:00', '2026-04-07 19:00:00', '2026-04-07 18:45:00', 'SCHEDULED', NULL, NULL
FROM DUAL
WHERE @psl_kk IS NOT NULL AND @psl_iu IS NOT NULL
  AND NOT EXISTS (
    SELECT 1 FROM fixtures
    WHERE league_season_id = 'PSL_2025' AND venue = 'National Stadium, Karachi' AND starts_at = '2026-04-07 19:30:00'
  );

INSERT INTO fixtures (league_season_id, home_franchise_id, away_franchise_id, venue, starts_at, toss_at, lock_at, status, winner_franchise_id, motm_player_id)
SELECT 'PSL_2025', @psl_lq, @psl_msu, 'Gaddafi Stadium, Lahore', '2026-04-08 19:30:00', '2026-04-08 19:00:00', '2026-04-08 18:45:00', 'SCHEDULED', NULL, NULL
FROM DUAL
WHERE @psl_lq IS NOT NULL AND @psl_msu IS NOT NULL
  AND NOT EXISTS (
    SELECT 1 FROM fixtures
    WHERE league_season_id = 'PSL_2025' AND venue = 'Gaddafi Stadium, Lahore' AND starts_at = '2026-04-08 19:30:00'
  );

INSERT INTO fixtures (league_season_id, home_franchise_id, away_franchise_id, venue, starts_at, toss_at, lock_at, status, winner_franchise_id, motm_player_id)
SELECT 'BPL_2025', @bpl_frt, @bpl_syl, 'Sher-e-Bangla National Stadium, Dhaka', '2026-04-09 18:30:00', '2026-04-09 18:00:00', '2026-04-09 17:45:00', 'SCHEDULED', NULL, NULL
FROM DUAL
WHERE @bpl_frt IS NOT NULL AND @bpl_syl IS NOT NULL
  AND NOT EXISTS (
    SELECT 1 FROM fixtures
    WHERE league_season_id = 'BPL_2025' AND venue = 'Sher-e-Bangla National Stadium, Dhaka' AND starts_at = '2026-04-09 18:30:00'
  );

INSERT INTO fixtures (league_season_id, home_franchise_id, away_franchise_id, venue, starts_at, toss_at, lock_at, status, winner_franchise_id, motm_player_id)
SELECT 'BBL_2025', @bbl_ads, @bbl_sys, 'Adelaide Oval', '2026-04-10 18:10:00', '2026-04-10 17:40:00', '2026-04-10 17:25:00', 'SCHEDULED', NULL, NULL
FROM DUAL
WHERE @bbl_ads IS NOT NULL AND @bbl_sys IS NOT NULL
  AND NOT EXISTS (
    SELECT 1 FROM fixtures
    WHERE league_season_id = 'BBL_2025' AND venue = 'Adelaide Oval' AND starts_at = '2026-04-10 18:10:00'
  );

INSERT INTO fixtures (league_season_id, home_franchise_id, away_franchise_id, venue, starts_at, toss_at, lock_at, status, winner_franchise_id, motm_player_id)
SELECT 'NPL_2025', @npl_ktm, @npl_pok, 'Tribhuvan University International Cricket Ground', '2026-04-11 13:00:00', '2026-04-11 12:30:00', '2026-04-11 12:15:00', 'SCHEDULED', NULL, NULL
FROM DUAL
WHERE @npl_ktm IS NOT NULL AND @npl_pok IS NOT NULL
  AND NOT EXISTS (
    SELECT 1 FROM fixtures
    WHERE league_season_id = 'NPL_2025' AND venue = 'Tribhuvan University International Cricket Ground' AND starts_at = '2026-04-11 13:00:00'
  );

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


-- ============================================================
-- Consolidated from create-transfer-policy.sql
-- ============================================================

-- Create transfer policy table for league-specific transfer rules
-- Run once after schema.sql is initialized.

USE new_fpl;

CREATE TABLE IF NOT EXISTS league_transfer_policies (
  league_season_id VARCHAR(50) PRIMARY KEY,
  league_stage_match_count INT NOT NULL,
  league_stage_transfer_cap INT NOT NULL DEFAULT 160,
  playoff_transfer_cap INT NOT NULL DEFAULT 10,
  qualifier1_match_number INT NOT NULL,
  unlimited_pre_match1 TINYINT(1) NOT NULL DEFAULT 1,
  unlimited_between_league_and_q1 TINYINT(1) NOT NULL DEFAULT 1,
  updated_by_admin_user_id BIGINT UNSIGNED NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_transfer_policy_league
    FOREIGN KEY (league_season_id) REFERENCES league_seasons(id)
    ON DELETE CASCADE,
  CONSTRAINT fk_transfer_policy_admin
    FOREIGN KEY (updated_by_admin_user_id) REFERENCES users(id)
    ON DELETE SET NULL,
  CONSTRAINT chk_transfer_policy_stage_matches CHECK (league_stage_match_count >= 1),
  CONSTRAINT chk_transfer_policy_stage_cap CHECK (league_stage_transfer_cap >= 0),
  CONSTRAINT chk_transfer_policy_playoff_cap CHECK (playoff_transfer_cap >= 0),
  CONSTRAINT chk_transfer_policy_q1_match CHECK (qualifier1_match_number >= 2)
);

-- Seed defaults for existing leagues (admin can override later from dashboard/API).
INSERT INTO league_transfer_policies (
  league_season_id,
  league_stage_match_count,
  league_stage_transfer_cap,
  playoff_transfer_cap,
  qualifier1_match_number,
  unlimited_pre_match1,
  unlimited_between_league_and_q1
)
SELECT
  ls.id,
  CASE
    WHEN c.short_name = 'IPL' THEN 70
    ELSE GREATEST(1, COALESCE(ls.total_fixtures, 1))
  END AS league_stage_match_count,
  160 AS league_stage_transfer_cap,
  10 AS playoff_transfer_cap,
  CASE
    WHEN c.short_name = 'IPL' THEN 71
    ELSE GREATEST(2, COALESCE(ls.total_fixtures, 1) + 1)
  END AS qualifier1_match_number,
  1 AS unlimited_pre_match1,
  1 AS unlimited_between_league_and_q1
FROM league_seasons ls
JOIN competitions c ON c.id = ls.competition_id
WHERE NOT EXISTS (
  SELECT 1 FROM league_transfer_policies ltp WHERE ltp.league_season_id = ls.id
);

SELECT COUNT(*) AS transfer_policies_total FROM league_transfer_policies;


-- ============================================================
-- Consolidated from cleanup-duplicate-players.sql
-- ============================================================

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


-- ============================================================
-- Consolidated from backfill-player-nationalities.sql
-- ============================================================

-- Backfill missing player nationalities
-- Ensures every player has exactly one nationality entry.

USE new_fpl;

-- Map missing nationalities from franchise/team code first.
INSERT IGNORE INTO player_nationalities (player_id, nation_id)
SELECT
  p.id,
  n.id
FROM players p
JOIN franchises f ON f.id = p.franchise_id
LEFT JOIN player_nationalities pn ON pn.player_id = p.id
JOIN nations n
  ON n.name = CASE
    -- Indian ecosystem (IPL + India national)
    WHEN f.short_name IN (
      'MI','CSK','RCB','KKR','DC','RR','PBKS','SRH','GT','LSG','DMU','IND'
    ) THEN 'India'

    -- Pakistan ecosystem (PSL + Pakistan national)
    WHEN f.short_name IN ('KK','IU','LQ','MSU','PZ','QG','PAK') THEN 'Pakistan'

    -- Australia ecosystem (BBL + Australia national)
    WHEN f.short_name IN ('ADS','BRH','HBH','MLR','MLS','PES','SYS','SYT','AUS') THEN 'Australia'

    -- Bangladesh ecosystem (BPL + Bangladesh national)
    WHEN f.short_name IN ('CTV','CHC','DHK','FRT','KLT','RAN','SYL','BAN') THEN 'Bangladesh'

    -- Nepal ecosystem (NPL + Nepal national)
    WHEN f.short_name IN ('BIR','CHI','JAN','KTM','LUM','POK','SPR','KOS','NEP') THEN 'Nepal'

    -- Other explicit national sides in data
    WHEN f.short_name = 'ENG' THEN 'England'
    WHEN f.short_name = 'NZ' THEN 'New Zealand'
    WHEN f.short_name = 'SA' THEN 'South Africa'
    WHEN f.short_name = 'SL' THEN 'Sri Lanka'
    WHEN f.short_name = 'AFG' THEN 'Afghanistan'
    WHEN f.short_name = 'WI' THEN 'West Indies'

    ELSE NULL
  END
WHERE pn.player_id IS NULL;

-- Safety fallback: if anything is still missing, assign India to avoid country-less players.
INSERT IGNORE INTO player_nationalities (player_id, nation_id)
SELECT p.id, n.id
FROM players p
LEFT JOIN player_nationalities pn ON pn.player_id = p.id
JOIN nations n ON n.name = 'India'
WHERE pn.player_id IS NULL;

-- Verification
SELECT COUNT(*) AS players_missing_country
FROM players p
LEFT JOIN player_nationalities pn ON pn.player_id = p.id
WHERE pn.player_id IS NULL;


-- ============================================================
-- Consolidated from add-leaderboard-columns-compatible.sql
-- ============================================================

-- Compatibility migration for MySQL variants that reject
-- multi-ADD ... IF NOT EXISTS syntax.
USE new_fpl;

SET @db = 'new_fpl';

-- fixtures.match_type
SET @sql = IF(
  (SELECT COUNT(*) FROM information_schema.COLUMNS
   WHERE TABLE_SCHEMA=@db AND TABLE_NAME='fixtures' AND COLUMN_NAME='match_type') = 0,
  "ALTER TABLE fixtures ADD COLUMN match_type ENUM('T20','ODI','TEST','T10') NOT NULL DEFAULT 'T20' AFTER venue",
  'SELECT 1'
);
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

-- fixtures.ended_at
SET @sql = IF(
  (SELECT COUNT(*) FROM information_schema.COLUMNS
   WHERE TABLE_SCHEMA=@db AND TABLE_NAME='fixtures' AND COLUMN_NAME='ended_at') = 0,
  "ALTER TABLE fixtures ADD COLUMN ended_at DATETIME NULL AFTER status",
  'SELECT 1'
);
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

-- fixtures.transfer_window_opens_at
SET @sql = IF(
  (SELECT COUNT(*) FROM information_schema.COLUMNS
   WHERE TABLE_SCHEMA=@db AND TABLE_NAME='fixtures' AND COLUMN_NAME='transfer_window_opens_at') = 0,
  "ALTER TABLE fixtures ADD COLUMN transfer_window_opens_at DATETIME NULL AFTER ended_at",
  'SELECT 1'
);
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

-- fixtures.points_finalized_at
SET @sql = IF(
  (SELECT COUNT(*) FROM information_schema.COLUMNS
   WHERE TABLE_SCHEMA=@db AND TABLE_NAME='fixtures' AND COLUMN_NAME='points_finalized_at') = 0,
  "ALTER TABLE fixtures ADD COLUMN points_finalized_at DATETIME NULL AFTER transfer_window_opens_at",
  'SELECT 1'
);
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

-- manager_squad_players.fantasy_points
SET @sql = IF(
  (SELECT COUNT(*) FROM information_schema.COLUMNS
   WHERE TABLE_SCHEMA=@db AND TABLE_NAME='manager_squad_players' AND COLUMN_NAME='fantasy_points') = 0,
  "ALTER TABLE manager_squad_players ADD COLUMN fantasy_points DECIMAL(8,2) NOT NULL DEFAULT 0",
  'SELECT 1'
);
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

-- player_live_stats.fantasy_points
SET @sql = IF(
  (SELECT COUNT(*) FROM information_schema.COLUMNS
   WHERE TABLE_SCHEMA=@db AND TABLE_NAME='player_live_stats' AND COLUMN_NAME='fantasy_points') = 0,
  "ALTER TABLE player_live_stats ADD COLUMN fantasy_points DECIMAL(8,2) NOT NULL DEFAULT 0",
  'SELECT 1'
);
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

-- Optional index for finalized lookup
SET @sql = IF(
  (SELECT COUNT(*) FROM information_schema.STATISTICS
   WHERE TABLE_SCHEMA=@db AND TABLE_NAME='fixtures' AND INDEX_NAME='idx_fixture_points_finalized_at') = 0,
  "ALTER TABLE fixtures ADD INDEX idx_fixture_points_finalized_at (points_finalized_at)",
  'SELECT 1'
);
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;


-- ============================================================
-- Consolidated from add-points-transfer-window.sql
-- ============================================================

-- ============================================================
-- Migration: Fantasy Points System + Transfer Window Timing
-- Run once against the new_fpl database.
-- ============================================================
USE new_fpl;

SET @db = 'new_fpl';

SET @sql = IF(
  (SELECT COUNT(*) FROM information_schema.COLUMNS
   WHERE TABLE_SCHEMA=@db AND TABLE_NAME='player_live_stats' AND COLUMN_NAME='balls_bowled') = 0,
  "ALTER TABLE player_live_stats ADD COLUMN balls_bowled INT NOT NULL DEFAULT 0 AFTER economy_rate",
  'SELECT 1'
);
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

SET @sql = IF(
  (SELECT COUNT(*) FROM information_schema.COLUMNS
   WHERE TABLE_SCHEMA=@db AND TABLE_NAME='player_live_stats' AND COLUMN_NAME='runs_conceded') = 0,
  "ALTER TABLE player_live_stats ADD COLUMN runs_conceded INT NOT NULL DEFAULT 0 AFTER balls_bowled",
  'SELECT 1'
);
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

SET @sql = IF(
  (SELECT COUNT(*) FROM information_schema.COLUMNS
   WHERE TABLE_SCHEMA=@db AND TABLE_NAME='player_live_stats' AND COLUMN_NAME='lbw_wickets') = 0,
  "ALTER TABLE player_live_stats ADD COLUMN lbw_wickets INT NOT NULL DEFAULT 0 AFTER runs_conceded",
  'SELECT 1'
);
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

SET @sql = IF(
  (SELECT COUNT(*) FROM information_schema.COLUMNS
   WHERE TABLE_SCHEMA=@db AND TABLE_NAME='player_live_stats' AND COLUMN_NAME='bowled_wickets') = 0,
  "ALTER TABLE player_live_stats ADD COLUMN bowled_wickets INT NOT NULL DEFAULT 0 AFTER lbw_wickets",
  'SELECT 1'
);
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

SET @sql = IF(
  (SELECT COUNT(*) FROM information_schema.COLUMNS
   WHERE TABLE_SCHEMA=@db AND TABLE_NAME='player_live_stats' AND COLUMN_NAME='is_playing_xi') = 0,
  "ALTER TABLE player_live_stats ADD COLUMN is_playing_xi TINYINT(1) NOT NULL DEFAULT 0 AFTER bowled_wickets",
  'SELECT 1'
);
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

SET @sql = IF(
  (SELECT COUNT(*) FROM information_schema.COLUMNS
   WHERE TABLE_SCHEMA=@db AND TABLE_NAME='player_live_stats' AND COLUMN_NAME='did_bat') = 0,
  "ALTER TABLE player_live_stats ADD COLUMN did_bat TINYINT(1) NOT NULL DEFAULT 0 AFTER is_playing_xi",
  'SELECT 1'
);
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

SET @sql = IF(
  (SELECT COUNT(*) FROM information_schema.COLUMNS
   WHERE TABLE_SCHEMA=@db AND TABLE_NAME='player_live_stats' AND COLUMN_NAME='four_wicket_haul') = 0,
  "ALTER TABLE player_live_stats ADD COLUMN four_wicket_haul TINYINT(1) NOT NULL DEFAULT 0 AFTER did_bat",
  'SELECT 1'
);
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

SET @sql = IF(
  (SELECT COUNT(*) FROM information_schema.COLUMNS
   WHERE TABLE_SCHEMA=@db AND TABLE_NAME='player_live_stats' AND COLUMN_NAME='five_wicket_haul') = 0,
  "ALTER TABLE player_live_stats ADD COLUMN five_wicket_haul TINYINT(1) NOT NULL DEFAULT 0 AFTER four_wicket_haul",
  'SELECT 1'
);
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

SET @sql = IF(
  (SELECT COUNT(*) FROM information_schema.COLUMNS
   WHERE TABLE_SCHEMA=@db AND TABLE_NAME='player_live_stats' AND COLUMN_NAME='indirect_runout_throws') = 0,
  "ALTER TABLE player_live_stats ADD COLUMN indirect_runout_throws INT NOT NULL DEFAULT 0 AFTER five_wicket_haul",
  'SELECT 1'
);
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

SET @sql = IF(
  (SELECT COUNT(*) FROM information_schema.COLUMNS
   WHERE TABLE_SCHEMA=@db AND TABLE_NAME='player_live_stats' AND COLUMN_NAME='indirect_runout_catches') = 0,
  "ALTER TABLE player_live_stats ADD COLUMN indirect_runout_catches INT NOT NULL DEFAULT 0 AFTER indirect_runout_throws",
  'SELECT 1'
);
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

SET @sql = IF(
  (SELECT COUNT(*) FROM information_schema.COLUMNS
   WHERE TABLE_SCHEMA=@db AND TABLE_NAME='manager_squad_players' AND COLUMN_NAME='fantasy_points') = 0,
  "ALTER TABLE manager_squad_players ADD COLUMN fantasy_points DECIMAL(8,2) NOT NULL DEFAULT 0",
  'SELECT 1'
);
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;


-- ============================================================
-- Consolidated from add-leaderboard-finalization.sql
-- ============================================================

-- ============================================================
-- Migration: Leaderboard Finalization Tracking
-- Run once against the new_fpl database.
-- ============================================================
USE new_fpl;

SET @db = 'new_fpl';

SET @sql = IF(
  (SELECT COUNT(*) FROM information_schema.COLUMNS
   WHERE TABLE_SCHEMA=@db AND TABLE_NAME='fixtures' AND COLUMN_NAME='points_finalized_at') = 0,
  "ALTER TABLE fixtures ADD COLUMN points_finalized_at DATETIME NULL AFTER transfer_window_opens_at",
  'SELECT 1'
);
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

SET @sql = IF(
  (SELECT COUNT(*) FROM information_schema.STATISTICS
   WHERE TABLE_SCHEMA=@db AND TABLE_NAME='fixtures' AND INDEX_NAME='idx_fixture_points_finalized_at') = 0,
  "ALTER TABLE fixtures ADD INDEX idx_fixture_points_finalized_at (points_finalized_at)",
  'SELECT 1'
);
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;


-- ============================================================
-- Consolidated from seed-psl-leaderboard-compatible.sql
-- ============================================================

USE new_fpl;

SET @league := 'PSL_2025';
SET @f1 := (SELECT id FROM fixtures WHERE league_season_id=@league ORDER BY starts_at ASC LIMIT 1);
SET @f2 := (SELECT id FROM fixtures WHERE league_season_id=@league ORDER BY starts_at ASC LIMIT 1 OFFSET 1);

SET @mi := (SELECT id FROM franchises WHERE short_name='MI' LIMIT 1);
SET @kkr := (SELECT id FROM franchises WHERE short_name='KKR' LIMIT 1);
SET @rcb := (SELECT id FROM franchises WHERE short_name='RCB' LIMIT 1);
SET @csk := (SELECT id FROM franchises WHERE short_name='CSK' LIMIT 1);

SET @sky := (SELECT id FROM players WHERE full_name='Suryakumar Yadav' LIMIT 1);
SET @narine := (SELECT id FROM players WHERE full_name='Sunil Narine' LIMIT 1);
SET @ishan := (SELECT id FROM players WHERE full_name='Ishan Kishan' LIMIT 1);
SET @rohit := (SELECT id FROM players WHERE full_name='Rohit Sharma' LIMIT 1);
SET @hardik := (SELECT id FROM players WHERE full_name='Hardik Pandya' LIMIT 1);
SET @bumrah := (SELECT id FROM players WHERE full_name='Jasprit Bumrah' LIMIT 1);
SET @ruturaj := (SELECT id FROM players WHERE full_name='Ruturaj Gaikwad' LIMIT 1);
SET @jadeja := (SELECT id FROM players WHERE full_name='Ravindra Jadeja' LIMIT 1);
SET @dube := (SELECT id FROM players WHERE full_name='Shivam Dube' LIMIT 1);
SET @pathirana := (SELECT id FROM players WHERE full_name='Matheesha Pathirana' LIMIT 1);
SET @kohli := (SELECT id FROM players WHERE full_name='Virat Kohli' LIMIT 1);
SET @patidar := (SELECT id FROM players WHERE full_name='Rajat Patidar' LIMIT 1);
SET @maxwell := (SELECT id FROM players WHERE full_name='Glenn Maxwell' LIMIT 1);
SET @siraj := (SELECT id FROM players WHERE full_name='Mohammed Siraj' LIMIT 1);
SET @salt := (SELECT id FROM players WHERE full_name='Phil Salt' LIMIT 1);
SET @shreyas := (SELECT id FROM players WHERE full_name='Shreyas Iyer' LIMIT 1);
SET @rinku := (SELECT id FROM players WHERE full_name='Rinku Singh' LIMIT 1);
SET @starc := (SELECT id FROM players WHERE full_name='Mitchell Starc' LIMIT 1);

UPDATE fixtures
SET status='COMPLETED', match_type='T20', winner_franchise_id=@mi, motm_player_id=@sky,
    ended_at=DATE_SUB(NOW(), INTERVAL 5 DAY), transfer_window_opens_at=DATE_SUB(NOW(), INTERVAL 4 DAY),
    points_finalized_at=DATE_SUB(NOW(), INTERVAL 4 DAY)
WHERE id=@f1;

UPDATE fixtures
SET status='COMPLETED', match_type='T20', winner_franchise_id=@kkr, motm_player_id=@narine,
    ended_at=DATE_SUB(NOW(), INTERVAL 3 DAY), transfer_window_opens_at=DATE_SUB(NOW(), INTERVAL 3 DAY),
    points_finalized_at=DATE_SUB(NOW(), INTERVAL 3 DAY)
WHERE id=@f2;

INSERT INTO player_live_stats (
  fixture_id, player_id, franchise_id, runs, fours, sixes, balls_faced, is_duck,
  wickets, maidens, economy_rate, three_wicket_haul, catches, stumpings,
  direct_hit_runouts, dropped_catches, fantasy_points
) VALUES
(@f1,@sky,@mi,78,9,2,52,0,0,0,0,0,1,0,0,0,68.0),
(@f1,@rohit,@mi,44,5,1,31,0,0,0,0,0,0,0,0,0,34.5),
(@f1,@hardik,@mi,27,2,1,18,0,1,0,7.2,0,1,0,0,0,44.0),
(@f1,@bumrah,@mi,2,0,0,3,0,3,1,5.2,1,0,0,0,0,70.0),
(@f1,@ruturaj,@csk,57,6,2,42,0,0,0,0,0,0,0,0,0,51.0),
(@f1,@jadeja,@csk,22,1,1,17,0,2,0,6.8,0,2,0,1,0,58.0),
(@f1,@dube,@csk,31,2,2,19,0,0,0,0,0,0,0,0,1,26.5),
(@f1,@pathirana,@csk,0,0,0,0,0,2,0,7.9,0,0,0,0,0,28.0),
(@f2,@kohli,@rcb,83,10,2,55,0,0,0,0,0,0,0,0,0,70.0),
(@f2,@patidar,@rcb,28,3,1,20,0,0,0,0,0,0,0,0,0,24.0),
(@f2,@maxwell,@rcb,21,1,2,14,0,1,0,7.5,0,1,0,0,1,31.5),
(@f2,@siraj,@rcb,3,0,0,4,0,1,0,8.3,0,0,0,0,0,16.0),
(@f2,@salt,@kkr,37,4,2,22,0,0,0,0,0,1,0,0,0,34.5),
(@f2,@shreyas,@kkr,49,5,1,33,0,0,0,0,0,0,0,0,0,42.0),
(@f2,@rinku,@kkr,32,2,2,19,0,0,0,0,0,1,0,0,0,29.5),
(@f2,@narine,@kkr,36,3,2,20,0,3,1,5.6,1,1,0,0,0,86.0),
(@f2,@starc,@kkr,4,0,0,6,0,2,0,6.9,0,0,0,0,0,29.0)
ON DUPLICATE KEY UPDATE
  runs=VALUES(runs), fours=VALUES(fours), sixes=VALUES(sixes), balls_faced=VALUES(balls_faced),
  is_duck=VALUES(is_duck), wickets=VALUES(wickets), maidens=VALUES(maidens), economy_rate=VALUES(economy_rate),
  three_wicket_haul=VALUES(three_wicket_haul), catches=VALUES(catches), stumpings=VALUES(stumpings),
  direct_hit_runouts=VALUES(direct_hit_runouts), dropped_catches=VALUES(dropped_catches),
  fantasy_points=VALUES(fantasy_points), updated_at=CURRENT_TIMESTAMP;

SELECT f.id, f.status, f.points_finalized_at, COUNT(pls.player_id) AS stats_rows
FROM fixtures f LEFT JOIN player_live_stats pls ON pls.fixture_id=f.id
WHERE f.league_season_id=@league
GROUP BY f.id, f.status, f.points_finalized_at
ORDER BY f.id;


-- ============================================================
-- Consolidated from seed-psl-manager-leaderboard.sql
-- ============================================================

USE new_fpl;

SET @manager_hash = '$2a$12$Ifl52slzLz1gecXvovQJZeNem67/nHnS2RPxpWAi99e2lQmXHs86e';

INSERT INTO users (name, email, password_hash, phone, role)
SELECT 'Demo Manager 3', 'manager3@newfpl.local', @manager_hash, '9000000004', 'manager'
FROM DUAL
WHERE NOT EXISTS (SELECT 1 FROM users WHERE email = 'manager3@newfpl.local');

INSERT INTO users (name, email, password_hash, phone, role)
SELECT 'Demo Manager 4', 'manager4@newfpl.local', @manager_hash, '9000000005', 'manager'
FROM DUAL
WHERE NOT EXISTS (SELECT 1 FROM users WHERE email = 'manager4@newfpl.local');

SET @league := 'PSL_2025';
SET @f1 := (SELECT id FROM fixtures WHERE league_season_id=@league ORDER BY starts_at ASC LIMIT 1);
SET @f2 := (SELECT id FROM fixtures WHERE league_season_id=@league ORDER BY starts_at ASC LIMIT 1 OFFSET 1);

SET @u1 := (SELECT id FROM users WHERE email='manager1@newfpl.local' LIMIT 1);
SET @u2 := (SELECT id FROM users WHERE email='manager2@newfpl.local' LIMIT 1);
SET @u3 := (SELECT id FROM users WHERE email='manager3@newfpl.local' LIMIT 1);
SET @u4 := (SELECT id FROM users WHERE email='manager4@newfpl.local' LIMIT 1);

SET @kohli := (SELECT id FROM players WHERE full_name='Virat Kohli' LIMIT 1);
SET @narine := (SELECT id FROM players WHERE full_name='Sunil Narine' LIMIT 1);
SET @sky := (SELECT id FROM players WHERE full_name='Suryakumar Yadav' LIMIT 1);
SET @bumrah := (SELECT id FROM players WHERE full_name='Jasprit Bumrah' LIMIT 1);

-- manager cumulative example:
-- manager1: 500 (f1) + 450 (f2) = 950

INSERT INTO manager_squads (
  user_id, fixture_id, budget_cap, total_spent, transfers_used, free_transfers,
  transfer_penalty_points, captain_player_id, vice_captain_player_id,
  booster, is_locked, points_total, rank_global
)
VALUES
(@u1, @f1, 100.0, 98.0, 2, 2, 0, @sky,    @bumrah, 'NONE', 1, 500.0, NULL),
(@u1, @f2, 100.0, 97.0, 3, 2, 0, @kohli,  @narine, 'NONE', 1, 450.0, NULL),

(@u2, @f1, 100.0, 97.5, 2, 2, 0, @narine, @kohli,  'NONE', 1, 470.0, NULL),
(@u2, @f2, 100.0, 97.0, 2, 2, 0, @kohli,  @narine, 'NONE', 1, 480.0, NULL),

(@u3, @f1, 100.0, 96.0, 3, 2, 4, @sky,    @kohli,  'NONE', 1, 420.0, NULL),
(@u3, @f2, 100.0, 95.5, 3, 2, 4, @narine, @kohli,  'NONE', 1, 430.0, NULL),

(@u4, @f1, 100.0, 95.0, 3, 2, 4, @bumrah, @sky,    'NONE', 1, 390.0, NULL),
(@u4, @f2, 100.0, 95.0, 3, 2, 4, @narine, @kohli,  'NONE', 1, 410.0, NULL)
ON DUPLICATE KEY UPDATE
  total_spent = VALUES(total_spent),
  transfers_used = VALUES(transfers_used),
  free_transfers = VALUES(free_transfers),
  transfer_penalty_points = VALUES(transfer_penalty_points),
  captain_player_id = VALUES(captain_player_id),
  vice_captain_player_id = VALUES(vice_captain_player_id),
  booster = VALUES(booster),
  is_locked = VALUES(is_locked),
  points_total = VALUES(points_total),
  updated_at = CURRENT_TIMESTAMP;

SELECT
  u.email,
  SUM(ms.points_total) AS cumulative_points,
  COUNT(*) AS matches_count
FROM manager_squads ms
JOIN users u ON u.id = ms.user_id
JOIN fixtures f ON f.id = ms.fixture_id
WHERE f.league_season_id = @league
  AND f.status = 'COMPLETED'
  AND f.points_finalized_at IS NOT NULL
GROUP BY u.email
ORDER BY cumulative_points DESC;


-- ============================================================
-- Consolidated from seed-psl-leaderboard-data.sql
-- ============================================================

USE new_fpl;

-- Populate PSL_2025 with completed fixtures + realistic player stats
-- so /leaderboard/players returns data.

SET @league := 'PSL_2025';

SET @f1 := (
  SELECT id FROM fixtures
  WHERE league_season_id = @league
  ORDER BY starts_at ASC
  LIMIT 1
);
SET @f2 := (
  SELECT id FROM fixtures
  WHERE league_season_id = @league
  ORDER BY starts_at ASC
  LIMIT 1 OFFSET 1
);

-- Player ids (existing seeded catalog)
SET @ishan := (SELECT id FROM players WHERE full_name = 'Ishan Kishan' LIMIT 1);
SET @rohit := (SELECT id FROM players WHERE full_name = 'Rohit Sharma' LIMIT 1);
SET @sky := (SELECT id FROM players WHERE full_name = 'Suryakumar Yadav' LIMIT 1);
SET @hardik := (SELECT id FROM players WHERE full_name = 'Hardik Pandya' LIMIT 1);
SET @bumrah := (SELECT id FROM players WHERE full_name = 'Jasprit Bumrah' LIMIT 1);
SET @dhoni := (SELECT id FROM players WHERE full_name = 'MS Dhoni' LIMIT 1);
SET @ruturaj := (SELECT id FROM players WHERE full_name = 'Ruturaj Gaikwad' LIMIT 1);
SET @dube := (SELECT id FROM players WHERE full_name = 'Shivam Dube' LIMIT 1);
SET @jadeja := (SELECT id FROM players WHERE full_name = 'Ravindra Jadeja' LIMIT 1);
SET @pathirana := (SELECT id FROM players WHERE full_name = 'Matheesha Pathirana' LIMIT 1);
SET @kohli := (SELECT id FROM players WHERE full_name = 'Virat Kohli' LIMIT 1);
SET @patidar := (SELECT id FROM players WHERE full_name = 'Rajat Patidar' LIMIT 1);
SET @maxwell := (SELECT id FROM players WHERE full_name = 'Glenn Maxwell' LIMIT 1);
SET @siraj := (SELECT id FROM players WHERE full_name = 'Mohammed Siraj' LIMIT 1);
SET @salt := (SELECT id FROM players WHERE full_name = 'Phil Salt' LIMIT 1);
SET @shreyas := (SELECT id FROM players WHERE full_name = 'Shreyas Iyer' LIMIT 1);
SET @rinku := (SELECT id FROM players WHERE full_name = 'Rinku Singh' LIMIT 1);
SET @narine := (SELECT id FROM players WHERE full_name = 'Sunil Narine' LIMIT 1);
SET @starc := (SELECT id FROM players WHERE full_name = 'Mitchell Starc' LIMIT 1);

SET @mi := (SELECT id FROM franchises WHERE short_name = 'MI' LIMIT 1);
SET @csk := (SELECT id FROM franchises WHERE short_name = 'CSK' LIMIT 1);
SET @rcb := (SELECT id FROM franchises WHERE short_name = 'RCB' LIMIT 1);
SET @kkr := (SELECT id FROM franchises WHERE short_name = 'KKR' LIMIT 1);

-- Mark fixtures as completed + finalized
UPDATE fixtures
SET
  status = 'COMPLETED',
  match_type = 'T20',
  winner_franchise_id = @mi,
  motm_player_id = @sky,
  ended_at = DATE_SUB(NOW(), INTERVAL 5 DAY),
  transfer_window_opens_at = DATE_SUB(NOW(), INTERVAL 4 DAY),
  points_finalized_at = DATE_SUB(NOW(), INTERVAL 4 DAY)
WHERE id = @f1;

UPDATE fixtures
SET
  status = 'COMPLETED',
  match_type = 'T20',
  winner_franchise_id = @kkr,
  motm_player_id = @narine,
  ended_at = DATE_SUB(NOW(), INTERVAL 3 DAY),
  transfer_window_opens_at = DATE_SUB(NOW(), INTERVAL 3 DAY) + INTERVAL 15 MINUTE,
  points_finalized_at = DATE_SUB(NOW(), INTERVAL 3 DAY) + INTERVAL 10 MINUTE
WHERE id = @f2;

-- Match 1 stats: MI vs CSK style outcome
INSERT INTO player_live_stats (
  fixture_id, player_id, franchise_id,
  runs, fours, sixes, balls_faced, is_duck,
  wickets, maidens, economy_rate, balls_bowled, runs_conceded,
  lbw_wickets, bowled_wickets,
  is_playing_xi, did_bat, three_wicket_haul, four_wicket_haul, five_wicket_haul,
  catches, stumpings, direct_hit_runouts, indirect_runout_throws, indirect_runout_catches,
  dropped_catches, fantasy_points
) VALUES
(@f1, @sky, @mi, 78, 9, 2, 52, 0, 0, 0, 0.00, 0, 0, 0, 0, 1, 1, 0, 0, 0, 1, 0, 0, 0, 0, 0, 68.00),
(@f1, @rohit, @mi, 44, 5, 1, 31, 0, 0, 0, 0.00, 0, 0, 0, 0, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 34.50),
(@f1, @hardik, @mi, 27, 2, 1, 18, 0, 1, 0, 7.20, 24, 29, 0, 1, 1, 1, 0, 0, 0, 1, 0, 0, 0, 0, 0, 44.00),
(@f1, @bumrah, @mi, 2, 0, 0, 3, 0, 3, 1, 5.20, 24, 21, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 70.00),
(@f1, @ruturaj, @csk, 57, 6, 2, 42, 0, 0, 0, 0.00, 0, 0, 0, 0, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 51.00),
(@f1, @jadeja, @csk, 22, 1, 1, 17, 0, 2, 0, 6.80, 24, 27, 0, 1, 1, 1, 0, 0, 0, 2, 0, 1, 0, 0, 0, 58.00),
(@f1, @dube, @csk, 31, 2, 2, 19, 0, 0, 0, 0.00, 0, 0, 0, 0, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 1, 26.50),
(@f1, @pathirana, @csk, 0, 0, 0, 0, 0, 2, 0, 7.90, 24, 31, 0, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 28.00)
ON DUPLICATE KEY UPDATE
  runs = VALUES(runs), fours = VALUES(fours), sixes = VALUES(sixes), balls_faced = VALUES(balls_faced),
  is_duck = VALUES(is_duck), wickets = VALUES(wickets), maidens = VALUES(maidens), economy_rate = VALUES(economy_rate),
  balls_bowled = VALUES(balls_bowled), runs_conceded = VALUES(runs_conceded),
  lbw_wickets = VALUES(lbw_wickets), bowled_wickets = VALUES(bowled_wickets),
  is_playing_xi = VALUES(is_playing_xi), did_bat = VALUES(did_bat),
  three_wicket_haul = VALUES(three_wicket_haul), four_wicket_haul = VALUES(four_wicket_haul), five_wicket_haul = VALUES(five_wicket_haul),
  catches = VALUES(catches), stumpings = VALUES(stumpings), direct_hit_runouts = VALUES(direct_hit_runouts),
  indirect_runout_throws = VALUES(indirect_runout_throws), indirect_runout_catches = VALUES(indirect_runout_catches),
  dropped_catches = VALUES(dropped_catches), fantasy_points = VALUES(fantasy_points), updated_at = CURRENT_TIMESTAMP;

-- Match 2 stats: RCB vs KKR style outcome
INSERT INTO player_live_stats (
  fixture_id, player_id, franchise_id,
  runs, fours, sixes, balls_faced, is_duck,
  wickets, maidens, economy_rate, balls_bowled, runs_conceded,
  lbw_wickets, bowled_wickets,
  is_playing_xi, did_bat, three_wicket_haul, four_wicket_haul, five_wicket_haul,
  catches, stumpings, direct_hit_runouts, indirect_runout_throws, indirect_runout_catches,
  dropped_catches, fantasy_points
) VALUES
(@f2, @kohli, @rcb, 83, 10, 2, 55, 0, 0, 0, 0.00, 0, 0, 0, 0, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 70.00),
(@f2, @patidar, @rcb, 28, 3, 1, 20, 0, 0, 0, 0.00, 0, 0, 0, 0, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 24.00),
(@f2, @maxwell, @rcb, 21, 1, 2, 14, 0, 1, 0, 7.50, 12, 15, 0, 0, 1, 1, 0, 0, 0, 1, 0, 0, 0, 0, 1, 31.50),
(@f2, @siraj, @rcb, 3, 0, 0, 4, 0, 1, 0, 8.30, 24, 33, 0, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 16.00),
(@f2, @salt, @kkr, 37, 4, 2, 22, 0, 0, 0, 0.00, 0, 0, 0, 0, 1, 1, 0, 0, 0, 1, 0, 0, 0, 0, 0, 34.50),
(@f2, @shreyas, @kkr, 49, 5, 1, 33, 0, 0, 0, 0.00, 0, 0, 0, 0, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 42.00),
(@f2, @rinku, @kkr, 32, 2, 2, 19, 0, 0, 0, 0.00, 0, 0, 0, 0, 1, 1, 0, 0, 0, 1, 0, 0, 0, 0, 0, 29.50),
(@f2, @narine, @kkr, 36, 3, 2, 20, 0, 3, 1, 5.60, 24, 22, 1, 1, 1, 1, 1, 0, 0, 1, 0, 0, 0, 0, 0, 86.00),
(@f2, @starc, @kkr, 4, 0, 0, 6, 0, 2, 0, 6.90, 24, 28, 0, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 29.00)
ON DUPLICATE KEY UPDATE
  runs = VALUES(runs), fours = VALUES(fours), sixes = VALUES(sixes), balls_faced = VALUES(balls_faced),
  is_duck = VALUES(is_duck), wickets = VALUES(wickets), maidens = VALUES(maidens), economy_rate = VALUES(economy_rate),
  balls_bowled = VALUES(balls_bowled), runs_conceded = VALUES(runs_conceded),
  lbw_wickets = VALUES(lbw_wickets), bowled_wickets = VALUES(bowled_wickets),
  is_playing_xi = VALUES(is_playing_xi), did_bat = VALUES(did_bat),
  three_wicket_haul = VALUES(three_wicket_haul), four_wicket_haul = VALUES(four_wicket_haul), five_wicket_haul = VALUES(five_wicket_haul),
  catches = VALUES(catches), stumpings = VALUES(stumpings), direct_hit_runouts = VALUES(direct_hit_runouts),
  indirect_runout_throws = VALUES(indirect_runout_throws), indirect_runout_catches = VALUES(indirect_runout_catches),
  dropped_catches = VALUES(dropped_catches), fantasy_points = VALUES(fantasy_points), updated_at = CURRENT_TIMESTAMP;

SELECT
  f.id,
  f.league_season_id,
  f.status,
  f.points_finalized_at,
  COUNT(pls.player_id) AS player_stats
FROM fixtures f
LEFT JOIN player_live_stats pls ON pls.fixture_id = f.id
WHERE f.league_season_id = @league
GROUP BY f.id, f.league_season_id, f.status, f.points_finalized_at
ORDER BY f.starts_at;


-- ============================================================
-- Consolidated from seed-realistic-leaderboard-scenarios.sql
-- ============================================================

-- ============================================================
-- Realistic Leaderboard Scenario Seed (IPL_2025)
-- Goal:
-- 1) Multiple users
-- 2) Multiple completed fixtures
-- 3) Different playing XI per fixture/user
-- 4) Different points distribution (real-life style variance)
-- ============================================================

USE new_fpl;

-- ------------------------------------------------------------
-- 0) Ensure manager users exist
-- ------------------------------------------------------------
SET @manager_hash = '$2a$12$Ifl52slzLz1gecXvovQJZeNem67/nHnS2RPxpWAi99e2lQmXHs86e';

INSERT INTO users (name, email, password_hash, phone, role)
SELECT 'Demo Manager 3', 'manager3@newfpl.local', @manager_hash, '9000000004', 'manager'
FROM DUAL
WHERE NOT EXISTS (SELECT 1 FROM users WHERE email = 'manager3@newfpl.local');

INSERT INTO users (name, email, password_hash, phone, role)
SELECT 'Demo Manager 4', 'manager4@newfpl.local', @manager_hash, '9000000005', 'manager'
FROM DUAL
WHERE NOT EXISTS (SELECT 1 FROM users WHERE email = 'manager4@newfpl.local');

SET @u1 = (SELECT id FROM users WHERE email = 'manager1@newfpl.local' LIMIT 1);
SET @u2 = (SELECT id FROM users WHERE email = 'manager2@newfpl.local' LIMIT 1);
SET @u3 = (SELECT id FROM users WHERE email = 'manager3@newfpl.local' LIMIT 1);
SET @u4 = (SELECT id FROM users WHERE email = 'manager4@newfpl.local' LIMIT 1);

-- ------------------------------------------------------------
-- 1) Resolve league + franchise ids
-- ------------------------------------------------------------
SET @league_id = 'IPL_2025';

SET @mi = (
  SELECT lf.franchise_id FROM league_franchises lf
  WHERE lf.league_season_id = @league_id AND lf.team_code = 'MI' LIMIT 1
);
SET @csk = (
  SELECT lf.franchise_id FROM league_franchises lf
  WHERE lf.league_season_id = @league_id AND lf.team_code = 'CSK' LIMIT 1
);
SET @rcb = (
  SELECT lf.franchise_id FROM league_franchises lf
  WHERE lf.league_season_id = @league_id AND lf.team_code = 'RCB' LIMIT 1
);
SET @kkr = (
  SELECT lf.franchise_id FROM league_franchises lf
  WHERE lf.league_season_id = @league_id AND lf.team_code = 'KKR' LIMIT 1
);

-- ------------------------------------------------------------
-- 2) Ensure only missing players exist for realistic lineups
-- ------------------------------------------------------------
INSERT INTO players (full_name, role, franchise_id, credit_price, is_active)
SELECT 'Deepak Chahar', 'BOWL', @csk, 8.0, 1 FROM DUAL
WHERE NOT EXISTS (SELECT 1 FROM players WHERE full_name = 'Deepak Chahar');

INSERT INTO players (full_name, role, franchise_id, credit_price, is_active)
SELECT 'Faf du Plessis', 'BAT', @rcb, 9.0, 1 FROM DUAL
WHERE NOT EXISTS (SELECT 1 FROM players WHERE full_name = 'Faf du Plessis');

INSERT INTO players (full_name, role, franchise_id, credit_price, is_active)
SELECT 'Andre Russell', 'AR', @kkr, 9.5, 1 FROM DUAL
WHERE NOT EXISTS (SELECT 1 FROM players WHERE full_name = 'Andre Russell');

SET @ishan      = (SELECT id FROM players WHERE full_name = 'Ishan Kishan' AND franchise_id = @mi LIMIT 1);
SET @rohit      = (SELECT id FROM players WHERE full_name = 'Rohit Sharma' AND franchise_id = @mi LIMIT 1);
SET @sky        = (SELECT id FROM players WHERE full_name = 'Suryakumar Yadav' AND franchise_id = @mi LIMIT 1);
SET @hardik     = (SELECT id FROM players WHERE full_name = 'Hardik Pandya' AND franchise_id = @mi LIMIT 1);
SET @bumrah     = (SELECT id FROM players WHERE full_name = 'Jasprit Bumrah' AND franchise_id = @mi LIMIT 1);
SET @tilak      = (SELECT id FROM players WHERE full_name = 'Tilak Varma' LIMIT 1);
SET @dhoni      = (SELECT id FROM players WHERE full_name = 'MS Dhoni' AND franchise_id = @csk LIMIT 1);
SET @ruturaj    = (SELECT id FROM players WHERE full_name = 'Ruturaj Gaikwad' AND franchise_id = @csk LIMIT 1);
SET @dube       = (SELECT id FROM players WHERE full_name = 'Shivam Dube' AND franchise_id = @csk LIMIT 1);
SET @jadeja     = (SELECT id FROM players WHERE full_name = 'Ravindra Jadeja' AND franchise_id = @csk LIMIT 1);
SET @pathirana  = (SELECT id FROM players WHERE full_name = 'Matheesha Pathirana' AND franchise_id = @csk LIMIT 1);
SET @chahar     = (SELECT id FROM players WHERE full_name = 'Deepak Chahar' AND franchise_id = @csk LIMIT 1);
SET @dk         = (SELECT id FROM players WHERE full_name = 'Dinesh Karthik' AND franchise_id = @rcb LIMIT 1);
SET @kohli      = (SELECT id FROM players WHERE full_name = 'Virat Kohli' AND franchise_id = @rcb LIMIT 1);
SET @patidar    = (SELECT id FROM players WHERE full_name = 'Rajat Patidar' AND franchise_id = @rcb LIMIT 1);
SET @maxwell    = (SELECT id FROM players WHERE full_name = 'Glenn Maxwell' AND franchise_id = @rcb LIMIT 1);
SET @siraj      = (SELECT id FROM players WHERE full_name = 'Mohammed Siraj' AND franchise_id = @rcb LIMIT 1);
SET @faf        = (SELECT id FROM players WHERE full_name = 'Faf du Plessis' AND franchise_id = @rcb LIMIT 1);
SET @salt       = (SELECT id FROM players WHERE full_name = 'Phil Salt' AND franchise_id = @kkr LIMIT 1);
SET @shreyas    = (SELECT id FROM players WHERE full_name = 'Shreyas Iyer' AND franchise_id = @kkr LIMIT 1);
SET @rinku      = (SELECT id FROM players WHERE full_name = 'Rinku Singh' AND franchise_id = @kkr LIMIT 1);
SET @narine     = (SELECT id FROM players WHERE full_name = 'Sunil Narine' AND franchise_id = @kkr LIMIT 1);
SET @starc      = (SELECT id FROM players WHERE full_name = 'Mitchell Starc' AND franchise_id = @kkr LIMIT 1);
SET @russell    = (SELECT id FROM players WHERE full_name = 'Andre Russell' LIMIT 1);

-- ------------------------------------------------------------
-- 3) Create three completed fixtures in IPL_2025
-- ------------------------------------------------------------
INSERT INTO fixtures (
  league_season_id, home_franchise_id, away_franchise_id, venue, match_type,
  starts_at, toss_at, lock_at, status, winner_franchise_id, motm_player_id,
  ended_at, transfer_window_opens_at, points_finalized_at
)
SELECT @league_id, @mi, @csk, 'Wankhede Stadium', 'T20',
       '2026-03-18 19:30:00', '2026-03-18 19:00:00', '2026-03-18 18:45:00',
       'COMPLETED', @mi, @sky,
       '2026-03-18 23:00:00', '2026-03-18 23:15:00', '2026-03-18 23:10:00'
FROM DUAL
WHERE NOT EXISTS (
  SELECT 1 FROM fixtures
  WHERE league_season_id = @league_id AND venue = 'Wankhede Stadium' AND starts_at = '2026-03-18 19:30:00'
);

INSERT INTO fixtures (
  league_season_id, home_franchise_id, away_franchise_id, venue, match_type,
  starts_at, toss_at, lock_at, status, winner_franchise_id, motm_player_id,
  ended_at, transfer_window_opens_at, points_finalized_at
)
SELECT @league_id, @rcb, @kkr, 'M. Chinnaswamy Stadium', 'T20',
       '2026-03-20 19:30:00', '2026-03-20 19:00:00', '2026-03-20 18:45:00',
       'COMPLETED', @kkr, @narine,
       '2026-03-20 23:05:00', '2026-03-20 23:20:00', '2026-03-20 23:14:00'
FROM DUAL
WHERE NOT EXISTS (
  SELECT 1 FROM fixtures
  WHERE league_season_id = @league_id AND venue = 'M. Chinnaswamy Stadium' AND starts_at = '2026-03-20 19:30:00'
);

INSERT INTO fixtures (
  league_season_id, home_franchise_id, away_franchise_id, venue, match_type,
  starts_at, toss_at, lock_at, status, winner_franchise_id, motm_player_id,
  ended_at, transfer_window_opens_at, points_finalized_at
)
SELECT @league_id, @csk, @rcb, 'MA Chidambaram Stadium', 'T20',
       '2026-03-22 15:30:00', '2026-03-22 15:00:00', '2026-03-22 14:45:00',
       'COMPLETED', @csk, @jadeja,
       '2026-03-22 19:00:00', '2026-03-22 19:15:00', '2026-03-22 19:08:00'
FROM DUAL
WHERE NOT EXISTS (
  SELECT 1 FROM fixtures
  WHERE league_season_id = @league_id AND venue = 'MA Chidambaram Stadium' AND starts_at = '2026-03-22 15:30:00'
);

SET @f1 = (SELECT id FROM fixtures WHERE league_season_id = @league_id AND venue = 'Wankhede Stadium' AND starts_at = '2026-03-18 19:30:00' LIMIT 1);
SET @f2 = (SELECT id FROM fixtures WHERE league_season_id = @league_id AND venue = 'M. Chinnaswamy Stadium' AND starts_at = '2026-03-20 19:30:00' LIMIT 1);
SET @f3 = (SELECT id FROM fixtures WHERE league_season_id = @league_id AND venue = 'MA Chidambaram Stadium' AND starts_at = '2026-03-22 15:30:00' LIMIT 1);

-- ------------------------------------------------------------
-- 4) Seed realistic player stats (different players, form swings)
--    fantasy_points prefilled so leaderboard is immediately testable
-- ------------------------------------------------------------
INSERT INTO player_live_stats (
  fixture_id, player_id, franchise_id,
  runs, fours, sixes, balls_faced, is_duck,
  wickets, maidens, economy_rate, balls_bowled, runs_conceded,
  lbw_wickets, bowled_wickets,
  is_playing_xi, did_bat, three_wicket_haul, four_wicket_haul, five_wicket_haul,
  catches, stumpings, direct_hit_runouts, indirect_runout_throws, indirect_runout_catches,
  dropped_catches, fantasy_points
) VALUES
-- Match 1: MI vs CSK
(@f1, @sky,       @mi, 74, 8, 3, 48, 0, 0, 0, 0.00, 0, 0, 0, 0, 1, 1, 0, 0, 0, 1, 0, 0, 0, 0, 0, 66.50),
(@f1, @rohit,     @mi, 35, 4, 1, 26, 0, 0, 0, 0.00, 0, 0, 0, 0, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 25.50),
(@f1, @hardik,    @mi, 28, 2, 1, 17, 0, 1, 0, 7.00, 24, 28, 0, 1, 1, 1, 0, 0, 0, 1, 0, 0, 0, 0, 0, 46.00),
(@f1, @bumrah,    @mi,  2, 0, 0,  3, 0, 3, 1, 5.50, 24, 22, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 66.00),
(@f1, @tilak,     @mi, 16, 2, 0, 14, 0, 0, 0, 0.00, 0, 0, 0, 0, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 12.00),
(@f1, @ruturaj,   @csk, 61, 6, 2, 43, 0, 0, 0, 0.00, 0, 0, 0, 0, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 53.50),
(@f1, @jadeja,    @csk, 24, 1, 1, 18, 0, 2, 0, 6.75, 24, 27, 0, 1, 1, 1, 0, 0, 0, 2, 0, 1, 0, 0, 0, 60.00),
(@f1, @dube,      @csk, 41, 2, 3, 24, 0, 0, 0, 0.00, 0, 0, 0, 0, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 1, 33.00),
(@f1, @dhoni,     @csk, 11, 1, 0,  6, 0, 0, 0, 0.00, 0, 0, 0, 0, 1, 1, 0, 0, 0, 1, 1, 0, 0, 0, 0, 22.50),
(@f1, @pathirana, @csk,  0, 0, 0,  0, 0, 2, 0, 8.20, 24, 33, 0, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 27.00),
(@f1, @chahar,    @csk,  0, 0, 0,  0, 0, 1, 0, 8.00, 24, 32, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 10.00),

-- Match 2: RCB vs KKR
(@f2, @kohli,     @rcb, 82, 9, 2, 56, 0, 0, 0, 0.00, 0, 0, 0, 0, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 68.50),
(@f2, @faf,       @rcb, 47, 5, 2, 31, 0, 0, 0, 0.00, 0, 0, 0, 0, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 39.50),
(@f2, @maxwell,   @rcb, 22, 1, 2, 14, 0, 1, 0, 7.50, 12, 15, 0, 0, 1, 1, 0, 0, 0, 1, 0, 0, 0, 0, 1, 32.00),
(@f2, @siraj,     @rcb,  3, 0, 0,  4, 0, 1, 0, 8.25, 24, 33, 0, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 16.00),
(@f2, @patidar,   @rcb, 19, 2, 1, 13, 0, 0, 0, 0.00, 0, 0, 0, 0, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 15.00),
(@f2, @salt,      @kkr, 39, 4, 2, 21, 0, 0, 0, 0.00, 0, 0, 0, 0, 1, 1, 0, 0, 0, 1, 0, 0, 0, 0, 0, 35.50),
(@f2, @shreyas,   @kkr, 52, 4, 2, 33, 0, 0, 0, 0.00, 0, 0, 0, 0, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 43.00),
(@f2, @rinku,     @kkr, 33, 2, 2, 18, 0, 0, 0, 0.00, 0, 0, 0, 0, 1, 1, 0, 0, 0, 1, 0, 0, 0, 0, 0, 30.50),
(@f2, @narine,    @kkr, 31, 2, 2, 17, 0, 3, 1, 5.75, 24, 23, 1, 1, 1, 1, 1, 0, 0, 1, 0, 0, 0, 0, 0, 84.00),
(@f2, @starc,     @kkr,  4, 0, 0,  6, 0, 2, 0, 6.90, 24, 28, 0, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 29.50),
(@f2, @russell,   @kkr, 21, 1, 2, 12, 0, 2, 0, 8.00, 18, 24, 0, 1, 1, 1, 0, 0, 0, 1, 0, 0, 0, 0, 0, 46.00),

-- Match 3: CSK vs RCB
(@f3, @ruturaj,   @csk, 58, 5, 2, 39, 0, 0, 0, 0.00, 0, 0, 0, 0, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 49.00),
(@f3, @jadeja,    @csk, 39, 2, 2, 24, 0, 2, 0, 6.20, 24, 25, 0, 1, 1, 1, 0, 0, 0, 2, 0, 0, 0, 1, 0, 65.00),
(@f3, @dube,      @csk, 27, 1, 2, 16, 0, 0, 0, 0.00, 0, 0, 0, 0, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 24.50),
(@f3, @pathirana, @csk,  0, 0, 0,  0, 0, 3, 1, 5.40, 24, 21, 1, 2, 1, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 72.00),
(@f3, @chahar,    @csk,  1, 0, 0,  2, 0, 1, 0, 7.70, 24, 31, 0, 0, 1, 1, 0, 0, 0, 1, 0, 0, 0, 0, 0, 16.00),
(@f3, @kohli,     @rcb, 64, 7, 2, 45, 0, 0, 0, 0.00, 0, 0, 0, 0, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 55.50),
(@f3, @faf,       @rcb, 33, 4, 1, 22, 0, 0, 0, 0.00, 0, 0, 0, 0, 1, 1, 0, 0, 0, 1, 0, 0, 0, 0, 0, 29.00),
(@f3, @maxwell,   @rcb, 18, 1, 1, 11, 0, 1, 0, 8.10, 12, 16, 0, 0, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 1, 22.50),
(@f3, @siraj,     @rcb,  2, 0, 0,  4, 0, 1, 0, 8.80, 24, 35, 0, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 14.00),
(@f3, @patidar,   @rcb, 24, 3, 1, 17, 0, 0, 0, 0.00, 0, 0, 0, 0, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 21.00),
(@f3, @dk,        @rcb,  8, 1, 0,  6, 0, 0, 0, 0.00, 0, 0, 0, 0, 1, 1, 0, 0, 0, 1, 1, 0, 0, 0, 0, 18.00)
ON DUPLICATE KEY UPDATE
  runs = VALUES(runs),
  fours = VALUES(fours),
  sixes = VALUES(sixes),
  balls_faced = VALUES(balls_faced),
  is_duck = VALUES(is_duck),
  wickets = VALUES(wickets),
  maidens = VALUES(maidens),
  economy_rate = VALUES(economy_rate),
  balls_bowled = VALUES(balls_bowled),
  runs_conceded = VALUES(runs_conceded),
  lbw_wickets = VALUES(lbw_wickets),
  bowled_wickets = VALUES(bowled_wickets),
  is_playing_xi = VALUES(is_playing_xi),
  did_bat = VALUES(did_bat),
  three_wicket_haul = VALUES(three_wicket_haul),
  four_wicket_haul = VALUES(four_wicket_haul),
  five_wicket_haul = VALUES(five_wicket_haul),
  catches = VALUES(catches),
  stumpings = VALUES(stumpings),
  direct_hit_runouts = VALUES(direct_hit_runouts),
  indirect_runout_throws = VALUES(indirect_runout_throws),
  indirect_runout_catches = VALUES(indirect_runout_catches),
  dropped_catches = VALUES(dropped_catches),
  fantasy_points = VALUES(fantasy_points),
  updated_at = CURRENT_TIMESTAMP;

-- ------------------------------------------------------------
-- 5) Manager squads with different points and different XI
-- ------------------------------------------------------------
INSERT INTO manager_squads (
  user_id, fixture_id, budget_cap, total_spent, transfers_used, free_transfers,
  transfer_penalty_points, captain_player_id, vice_captain_player_id,
  booster, is_locked, points_total, rank_global
)
VALUES
(@u1, @f1, 100.0, 98.5, 2, 2, 0, @sky,    @jadeja,  'NONE',           1, 118.50, 1),
(@u2, @f1, 100.0, 97.0, 3, 2, 0, @ruturaj,@bumrah,  'TRIPLE_CAPTAIN', 1, 109.00, 2),
(@u3, @f1, 100.0, 96.5, 1, 2, 0, @jadeja, @sky,     'NONE',           1, 101.00, 3),
(@u4, @f1, 100.0, 95.5, 2, 2, 4, @hardik, @ruturaj, 'NONE',           1, 92.50,  4),

(@u1, @f2, 100.0, 99.0, 1, 2, 0, @kohli,  @narine,  'NONE',           1, 124.00, 2),
(@u2, @f2, 100.0, 98.0, 2, 2, 0, @narine, @kohli,   'NONE',           1, 132.50, 1),
(@u3, @f2, 100.0, 97.0, 3, 2, 4, @russell,@shreyas, 'NONE',           1, 97.00,  4),
(@u4, @f2, 100.0, 96.0, 2, 2, 0, @kohli,  @salt,    'NONE',           1, 104.50, 3),

(@u1, @f3, 100.0, 98.0, 2, 2, 0, @kohli,  @jadeja,  'NONE',           1, 111.50, 2),
(@u2, @f3, 100.0, 97.5, 1, 2, 0, @jadeja, @kohli,   'NONE',           1, 120.00, 1),
(@u3, @f3, 100.0, 96.5, 3, 2, 4, @pathirana,@ruturaj,'NONE',          1, 98.00,  4),
(@u4, @f3, 100.0, 97.0, 2, 2, 0, @ruturaj,@faf,     'NONE',           1, 103.00, 3)
ON DUPLICATE KEY UPDATE
  total_spent = VALUES(total_spent),
  transfers_used = VALUES(transfers_used),
  free_transfers = VALUES(free_transfers),
  transfer_penalty_points = VALUES(transfer_penalty_points),
  captain_player_id = VALUES(captain_player_id),
  vice_captain_player_id = VALUES(vice_captain_player_id),
  booster = VALUES(booster),
  is_locked = VALUES(is_locked),
  points_total = VALUES(points_total),
  rank_global = VALUES(rank_global),
  updated_at = CURRENT_TIMESTAMP;

SET @s_u1_f1 = (SELECT id FROM manager_squads WHERE user_id = @u1 AND fixture_id = @f1 LIMIT 1);
SET @s_u2_f1 = (SELECT id FROM manager_squads WHERE user_id = @u2 AND fixture_id = @f1 LIMIT 1);
SET @s_u3_f1 = (SELECT id FROM manager_squads WHERE user_id = @u3 AND fixture_id = @f1 LIMIT 1);
SET @s_u4_f1 = (SELECT id FROM manager_squads WHERE user_id = @u4 AND fixture_id = @f1 LIMIT 1);
SET @s_u1_f2 = (SELECT id FROM manager_squads WHERE user_id = @u1 AND fixture_id = @f2 LIMIT 1);
SET @s_u2_f2 = (SELECT id FROM manager_squads WHERE user_id = @u2 AND fixture_id = @f2 LIMIT 1);
SET @s_u3_f2 = (SELECT id FROM manager_squads WHERE user_id = @u3 AND fixture_id = @f2 LIMIT 1);
SET @s_u4_f2 = (SELECT id FROM manager_squads WHERE user_id = @u4 AND fixture_id = @f2 LIMIT 1);
SET @s_u1_f3 = (SELECT id FROM manager_squads WHERE user_id = @u1 AND fixture_id = @f3 LIMIT 1);
SET @s_u2_f3 = (SELECT id FROM manager_squads WHERE user_id = @u2 AND fixture_id = @f3 LIMIT 1);
SET @s_u3_f3 = (SELECT id FROM manager_squads WHERE user_id = @u3 AND fixture_id = @f3 LIMIT 1);
SET @s_u4_f3 = (SELECT id FROM manager_squads WHERE user_id = @u4 AND fixture_id = @f3 LIMIT 1);

DELETE FROM manager_squad_players
WHERE squad_id IN (
  @s_u1_f1, @s_u2_f1, @s_u3_f1, @s_u4_f1,
  @s_u1_f2, @s_u2_f2, @s_u3_f2, @s_u4_f2,
  @s_u1_f3, @s_u2_f3, @s_u3_f3, @s_u4_f3
);

-- Different XI combinations across users and fixtures
INSERT INTO manager_squad_players (squad_id, player_id, is_starting_xi) VALUES
-- F1 U1
(@s_u1_f1, @ishan, 1), (@s_u1_f1, @rohit, 1), (@s_u1_f1, @sky, 1), (@s_u1_f1, @hardik, 1), (@s_u1_f1, @bumrah, 1),
(@s_u1_f1, @tilak, 1), (@s_u1_f1, @dhoni, 1), (@s_u1_f1, @ruturaj, 1), (@s_u1_f1, @dube, 1), (@s_u1_f1, @jadeja, 1), (@s_u1_f1, @pathirana, 1),

-- F1 U2
(@s_u2_f1, @ishan, 1), (@s_u2_f1, @rohit, 1), (@s_u2_f1, @sky, 1), (@s_u2_f1, @hardik, 1), (@s_u2_f1, @bumrah, 1),
(@s_u2_f1, @ruturaj, 1), (@s_u2_f1, @dube, 1), (@s_u2_f1, @jadeja, 1), (@s_u2_f1, @pathirana, 1), (@s_u2_f1, @chahar, 1), (@s_u2_f1, @dhoni, 1),

-- F1 U3
(@s_u3_f1, @ishan, 1), (@s_u3_f1, @rohit, 1), (@s_u3_f1, @hardik, 1), (@s_u3_f1, @bumrah, 1), (@s_u3_f1, @tilak, 1),
(@s_u3_f1, @dhoni, 1), (@s_u3_f1, @ruturaj, 1), (@s_u3_f1, @dube, 1), (@s_u3_f1, @jadeja, 1), (@s_u3_f1, @pathirana, 1), (@s_u3_f1, @chahar, 1),

-- F1 U4
(@s_u4_f1, @ishan, 1), (@s_u4_f1, @rohit, 1), (@s_u4_f1, @sky, 1), (@s_u4_f1, @hardik, 1), (@s_u4_f1, @tilak, 1),
(@s_u4_f1, @dhoni, 1), (@s_u4_f1, @ruturaj, 1), (@s_u4_f1, @dube, 1), (@s_u4_f1, @jadeja, 1), (@s_u4_f1, @pathirana, 1), (@s_u4_f1, @chahar, 1),

-- F2 U1
(@s_u1_f2, @dk, 1), (@s_u1_f2, @kohli, 1), (@s_u1_f2, @faf, 1), (@s_u1_f2, @patidar, 1), (@s_u1_f2, @maxwell, 1),
(@s_u1_f2, @siraj, 1), (@s_u1_f2, @salt, 1), (@s_u1_f2, @shreyas, 1), (@s_u1_f2, @rinku, 1), (@s_u1_f2, @narine, 1), (@s_u1_f2, @starc, 1),

-- F2 U2
(@s_u2_f2, @dk, 1), (@s_u2_f2, @kohli, 1), (@s_u2_f2, @faf, 1), (@s_u2_f2, @maxwell, 1), (@s_u2_f2, @siraj, 1),
(@s_u2_f2, @salt, 1), (@s_u2_f2, @shreyas, 1), (@s_u2_f2, @rinku, 1), (@s_u2_f2, @narine, 1), (@s_u2_f2, @starc, 1), (@s_u2_f2, @russell, 1),

-- F2 U3
(@s_u3_f2, @kohli, 1), (@s_u3_f2, @faf, 1), (@s_u3_f2, @patidar, 1), (@s_u3_f2, @maxwell, 1), (@s_u3_f2, @siraj, 1),
(@s_u3_f2, @salt, 1), (@s_u3_f2, @shreyas, 1), (@s_u3_f2, @rinku, 1), (@s_u3_f2, @narine, 1), (@s_u3_f2, @starc, 1), (@s_u3_f2, @russell, 1),

-- F2 U4
(@s_u4_f2, @dk, 1), (@s_u4_f2, @kohli, 1), (@s_u4_f2, @patidar, 1), (@s_u4_f2, @maxwell, 1), (@s_u4_f2, @siraj, 1),
(@s_u4_f2, @salt, 1), (@s_u4_f2, @shreyas, 1), (@s_u4_f2, @rinku, 1), (@s_u4_f2, @narine, 1), (@s_u4_f2, @starc, 1), (@s_u4_f2, @russell, 1),

-- F3 U1
(@s_u1_f3, @dhoni, 1), (@s_u1_f3, @ruturaj, 1), (@s_u1_f3, @dube, 1), (@s_u1_f3, @jadeja, 1), (@s_u1_f3, @pathirana, 1),
(@s_u1_f3, @chahar, 1), (@s_u1_f3, @dk, 1), (@s_u1_f3, @kohli, 1), (@s_u1_f3, @faf, 1), (@s_u1_f3, @maxwell, 1), (@s_u1_f3, @siraj, 1),

-- F3 U2
(@s_u2_f3, @dhoni, 1), (@s_u2_f3, @ruturaj, 1), (@s_u2_f3, @dube, 1), (@s_u2_f3, @jadeja, 1), (@s_u2_f3, @pathirana, 1),
(@s_u2_f3, @chahar, 1), (@s_u2_f3, @kohli, 1), (@s_u2_f3, @faf, 1), (@s_u2_f3, @patidar, 1), (@s_u2_f3, @maxwell, 1), (@s_u2_f3, @siraj, 1),

-- F3 U3
(@s_u3_f3, @dhoni, 1), (@s_u3_f3, @ruturaj, 1), (@s_u3_f3, @dube, 1), (@s_u3_f3, @jadeja, 1), (@s_u3_f3, @pathirana, 1),
(@s_u3_f3, @chahar, 1), (@s_u3_f3, @dk, 1), (@s_u3_f3, @kohli, 1), (@s_u3_f3, @faf, 1), (@s_u3_f3, @patidar, 1), (@s_u3_f3, @siraj, 1),

-- F3 U4
(@s_u4_f3, @dhoni, 1), (@s_u4_f3, @ruturaj, 1), (@s_u4_f3, @dube, 1), (@s_u4_f3, @jadeja, 1), (@s_u4_f3, @pathirana, 1),
(@s_u4_f3, @chahar, 1), (@s_u4_f3, @dk, 1), (@s_u4_f3, @kohli, 1), (@s_u4_f3, @faf, 1), (@s_u4_f3, @maxwell, 1), (@s_u4_f3, @patidar, 1)
ON DUPLICATE KEY UPDATE
  is_starting_xi = VALUES(is_starting_xi);

-- ------------------------------------------------------------
-- 6) Optional verification queries
-- ------------------------------------------------------------
SELECT
  f.id,
  f.league_season_id,
  f.venue,
  f.status,
  f.points_finalized_at,
  COUNT(DISTINCT pls.player_id) AS stat_players
FROM fixtures f
LEFT JOIN player_live_stats pls ON pls.fixture_id = f.id
WHERE f.id IN (@f1, @f2, @f3)
GROUP BY f.id, f.league_season_id, f.venue, f.status, f.points_finalized_at
ORDER BY f.starts_at;

SELECT
  ms.fixture_id,
  u.email,
  ms.points_total,
  ms.rank_global,
  COUNT(msp.player_id) AS playing_xi
FROM manager_squads ms
JOIN users u ON u.id = ms.user_id
LEFT JOIN manager_squad_players msp ON msp.squad_id = ms.id AND msp.is_starting_xi = 1
WHERE ms.fixture_id IN (@f1, @f2, @f3)
  AND ms.user_id IN (@u1, @u2, @u3, @u4)
GROUP BY ms.fixture_id, u.email, ms.points_total, ms.rank_global
ORDER BY ms.fixture_id, ms.rank_global ASC, ms.points_total DESC;


-- ============================================================
-- Consolidated from shift-match1-dates.sql
-- ============================================================

-- Shift Match 1 (first fixture per league) dates into the future for testing transfer window logic
-- This allows interactive testing of the transfer window UI and application flow

USE new_fpl;

-- For IPL_2025: Move first fixture to 5 days in future
UPDATE fixtures
SET 
  starts_at = DATE_ADD(NOW(), INTERVAL 5 DAY),
  toss_at = DATE_ADD(NOW(), INTERVAL 5 DAY),
  lock_at = DATE_ADD(DATE_ADD(NOW(), INTERVAL 4 DAY), INTERVAL 45 MINUTE)
WHERE league_season_id = 'IPL_2025'
  AND id = (
    SELECT MIN(f.id) 
    FROM (SELECT id FROM fixtures WHERE league_season_id = 'IPL_2025' ORDER BY starts_at ASC LIMIT 1) f
  );

-- For NPL_2025: Move first fixture to 5 days in future
UPDATE fixtures
SET 
  starts_at = DATE_ADD(NOW(), INTERVAL 5 DAY),
  toss_at = DATE_ADD(NOW(), INTERVAL 5 DAY),
  lock_at = DATE_ADD(DATE_ADD(NOW(), INTERVAL 4 DAY), INTERVAL 45 MINUTE)
WHERE league_season_id = 'NPL_2025'
  AND id = (
    SELECT MIN(f.id) 
    FROM (SELECT id FROM fixtures WHERE league_season_id = 'NPL_2025' ORDER BY starts_at ASC LIMIT 1) f
  );

-- Verification: Show updated Match 1 fixtures for both leagues
SELECT 
  league_season_id, 
  id, 
  starts_at, 
  status,
  CONCAT('Match 1 window closes in ', TIMESTAMPDIFF(MINUTE, NOW(), DATE_SUB(starts_at, INTERVAL 15 MINUTE)), ' minutes') AS window_status
FROM fixtures
WHERE league_season_id IN ('IPL_2025', 'NPL_2025')
ORDER BY league_season_id, starts_at ASC
LIMIT 2;


-- ============================================================
-- Private league stress-test seed (real-life QA)
-- ============================================================

USE new_fpl;

SET @bulk_manager_hash = '$2a$12$Ifl52slzLz1gecXvovQJZeNem67/nHnS2RPxpWAi99e2lQmXHs86e';

DROP TEMPORARY TABLE IF EXISTS tmp_private_seed_users;
CREATE TEMPORARY TABLE tmp_private_seed_users (
  name VARCHAR(100) NOT NULL,
  email VARCHAR(150) NOT NULL,
  phone VARCHAR(20) NOT NULL
);

INSERT INTO tmp_private_seed_users (name, email, phone) VALUES
('Aarav Mehta', 'manager03@newfpl.local', '9000000013'),
('Vivaan Sharma', 'manager04@newfpl.local', '9000000014'),
('Aditya Verma', 'manager05@newfpl.local', '9000000015'),
('Krish Iyer', 'manager06@newfpl.local', '9000000016'),
('Arjun Nair', 'manager07@newfpl.local', '9000000017'),
('Rohan Gupta', 'manager08@newfpl.local', '9000000018'),
('Kabir Singh', 'manager09@newfpl.local', '9000000019'),
('Ishaan Rao', 'manager10@newfpl.local', '9000000020'),
('Reyansh Malik', 'manager11@newfpl.local', '9000000021'),
('Dev Patel', 'manager12@newfpl.local', '9000000022'),
('Atharv Joshi', 'manager13@newfpl.local', '9000000023'),
('Om Kapoor', 'manager14@newfpl.local', '9000000024'),
('Samar Khan', 'manager15@newfpl.local', '9000000025'),
('Nivaan Das', 'manager16@newfpl.local', '9000000026'),
('Ayaan Roy', 'manager17@newfpl.local', '9000000027'),
('Yuvan Bhat', 'manager18@newfpl.local', '9000000028'),
('Parth Kulkarni', 'manager19@newfpl.local', '9000000029'),
('Rudra Menon', 'manager20@newfpl.local', '9000000030');

INSERT INTO users (name, email, password_hash, phone, role)
SELECT t.name, t.email, @bulk_manager_hash, t.phone, 'manager'
FROM tmp_private_seed_users t
WHERE NOT EXISTS (
  SELECT 1 FROM users u WHERE u.email = t.email
);

DROP TEMPORARY TABLE IF EXISTS tmp_private_seed_leagues;
CREATE TEMPORARY TABLE tmp_private_seed_leagues (
  league_season_id VARCHAR(50) NOT NULL,
  creator_email VARCHAR(150) NOT NULL,
  admin_email VARCHAR(150) NOT NULL,
  league_name VARCHAR(120) NOT NULL,
  invite_code VARCHAR(20) NOT NULL
);

INSERT INTO tmp_private_seed_leagues (league_season_id, creator_email, admin_email, league_name, invite_code) VALUES
('IPL_2025', 'manager1@newfpl.local', 'manager1@newfpl.local', 'Mumbai Fantasy Masters', 'IPLMUM01'),
('IPL_2025', 'manager2@newfpl.local', 'manager2@newfpl.local', 'Powerplay Predators', 'IPLPWR02'),
('IPL_2025', 'manager03@newfpl.local', 'manager03@newfpl.local', 'Last Over Legends', 'IPLOVR03'),
('IPL_2025', 'manager04@newfpl.local', 'manager04@newfpl.local', 'Captain Choice Club', 'IPLCAP04'),
('PSL_2025', 'manager05@newfpl.local', 'manager05@newfpl.local', 'Lahore Lock Picks', 'PSLLOCK1'),
('BBL_2025', 'manager06@newfpl.local', 'manager06@newfpl.local', 'Big Bash Brains', 'BBLBRAIN'),
('BPL_2025', 'manager07@newfpl.local', 'manager07@newfpl.local', 'Dhaka Draft Room', 'BPLDHK01'),
('NPL_2025', 'manager08@newfpl.local', 'manager08@newfpl.local', 'Kathmandu Kings Circle', 'NPLKTM01');

INSERT INTO private_leagues (league_season_id, creator_user_id, admin_user_id, name, invite_code, is_overall, is_active)
SELECT
  l.league_season_id,
  uc.id,
  ua.id,
  l.league_name,
  l.invite_code,
  0,
  1
FROM tmp_private_seed_leagues l
JOIN users uc ON uc.email = l.creator_email
JOIN users ua ON ua.email = l.admin_email
WHERE NOT EXISTS (
  SELECT 1 FROM private_leagues pl WHERE pl.invite_code = l.invite_code
);

DROP TEMPORARY TABLE IF EXISTS tmp_private_seed_members;
CREATE TEMPORARY TABLE tmp_private_seed_members (
  invite_code VARCHAR(20) NOT NULL,
  member_email VARCHAR(150) NOT NULL,
  member_role ENUM('admin','member') NOT NULL,
  joined_at DATETIME NOT NULL
);

INSERT INTO tmp_private_seed_members (invite_code, member_email, member_role, joined_at) VALUES
('IPLMUM01', 'manager1@newfpl.local', 'admin', '2026-03-25 10:00:00'),
('IPLMUM01', 'manager2@newfpl.local', 'member', '2026-03-25 10:05:00'),
('IPLMUM01', 'manager03@newfpl.local', 'member', '2026-03-25 10:10:00'),
('IPLMUM01', 'manager04@newfpl.local', 'member', '2026-03-25 10:15:00'),
('IPLMUM01', 'manager05@newfpl.local', 'member', '2026-03-25 10:20:00'),
('IPLMUM01', 'manager06@newfpl.local', 'member', '2026-03-25 10:25:00'),
('IPLMUM01', 'manager07@newfpl.local', 'member', '2026-03-25 10:30:00'),
('IPLMUM01', 'manager08@newfpl.local', 'member', '2026-03-25 10:35:00'),

('IPLPWR02', 'manager2@newfpl.local', 'admin', '2026-03-25 11:00:00'),
('IPLPWR02', 'manager09@newfpl.local', 'member', '2026-03-25 11:05:00'),
('IPLPWR02', 'manager10@newfpl.local', 'member', '2026-03-25 11:10:00'),
('IPLPWR02', 'manager11@newfpl.local', 'member', '2026-03-25 11:15:00'),
('IPLPWR02', 'manager12@newfpl.local', 'member', '2026-03-25 11:20:00'),
('IPLPWR02', 'manager13@newfpl.local', 'member', '2026-03-25 11:25:00'),
('IPLPWR02', 'manager14@newfpl.local', 'member', '2026-03-25 11:30:00'),
('IPLPWR02', 'manager15@newfpl.local', 'member', '2026-03-25 11:35:00'),

('IPLOVR03', 'manager03@newfpl.local', 'admin', '2026-03-26 09:00:00'),
('IPLOVR03', 'manager04@newfpl.local', 'member', '2026-03-26 09:05:00'),
('IPLOVR03', 'manager05@newfpl.local', 'member', '2026-03-26 09:10:00'),
('IPLOVR03', 'manager16@newfpl.local', 'member', '2026-03-26 09:15:00'),
('IPLOVR03', 'manager17@newfpl.local', 'member', '2026-03-26 09:20:00'),

('IPLCAP04', 'manager04@newfpl.local', 'admin', '2026-03-26 12:00:00'),
('IPLCAP04', 'manager06@newfpl.local', 'member', '2026-03-26 12:05:00'),
('IPLCAP04', 'manager07@newfpl.local', 'member', '2026-03-26 12:10:00'),
('IPLCAP04', 'manager18@newfpl.local', 'member', '2026-03-26 12:15:00'),
('IPLCAP04', 'manager19@newfpl.local', 'member', '2026-03-26 12:20:00'),

('PSLLOCK1', 'manager05@newfpl.local', 'admin', '2026-03-24 08:00:00'),
('PSLLOCK1', 'manager1@newfpl.local', 'member', '2026-03-24 08:10:00'),
('PSLLOCK1', 'manager2@newfpl.local', 'member', '2026-03-24 08:20:00'),
('PSLLOCK1', 'manager10@newfpl.local', 'member', '2026-03-24 08:30:00'),
('PSLLOCK1', 'manager20@newfpl.local', 'member', '2026-03-24 08:40:00'),

('BBLBRAIN', 'manager06@newfpl.local', 'admin', '2026-03-24 14:00:00'),
('BBLBRAIN', 'manager11@newfpl.local', 'member', '2026-03-24 14:05:00'),
('BBLBRAIN', 'manager12@newfpl.local', 'member', '2026-03-24 14:10:00'),
('BBLBRAIN', 'manager13@newfpl.local', 'member', '2026-03-24 14:15:00'),

('BPLDHK01', 'manager07@newfpl.local', 'admin', '2026-03-23 17:00:00'),
('BPLDHK01', 'manager14@newfpl.local', 'member', '2026-03-23 17:05:00'),
('BPLDHK01', 'manager15@newfpl.local', 'member', '2026-03-23 17:10:00'),
('BPLDHK01', 'manager16@newfpl.local', 'member', '2026-03-23 17:15:00'),

('NPLKTM01', 'manager08@newfpl.local', 'admin', '2026-03-22 18:00:00'),
('NPLKTM01', 'manager17@newfpl.local', 'member', '2026-03-22 18:05:00'),
('NPLKTM01', 'manager18@newfpl.local', 'member', '2026-03-22 18:10:00'),
('NPLKTM01', 'manager19@newfpl.local', 'member', '2026-03-22 18:15:00'),
('NPLKTM01', 'manager20@newfpl.local', 'member', '2026-03-22 18:20:00');

INSERT IGNORE INTO private_league_members (league_id, user_id, role, joined_at)
SELECT
  pl.id,
  u.id,
  m.member_role,
  m.joined_at
FROM tmp_private_seed_members m
JOIN private_leagues pl ON pl.invite_code = m.invite_code
JOIN users u ON u.email = m.member_email;

SET @seed_fixture_completed = (
  SELECT id
  FROM fixtures
  WHERE league_season_id = 'IPL_2025' AND status = 'COMPLETED'
  ORDER BY starts_at DESC, id DESC
  LIMIT 1
);

SET @seed_cap_id = (SELECT id FROM players WHERE full_name = 'Virat Kohli' LIMIT 1);
SET @seed_vc_id = (SELECT id FROM players WHERE full_name = 'Ravindra Jadeja' LIMIT 1);
SET @seed_impact_id = (SELECT id FROM players WHERE full_name = 'Sunil Narine' LIMIT 1);

SET @has_points_finalized_col = (
  SELECT COUNT(*)
  FROM information_schema.columns
  WHERE table_schema = DATABASE()
    AND table_name = 'fixtures'
    AND column_name = 'points_finalized_at'
);

SET @points_sql = IF(
  @has_points_finalized_col > 0 AND @seed_fixture_completed IS NOT NULL,
  CONCAT(
    'UPDATE fixtures SET points_finalized_at = COALESCE(points_finalized_at, NOW()) WHERE id = ',
    @seed_fixture_completed
  ),
  'SELECT 1'
);

PREPARE stmt_points FROM @points_sql;
EXECUTE stmt_points;
DEALLOCATE PREPARE stmt_points;

DROP TEMPORARY TABLE IF EXISTS tmp_private_seed_points;
CREATE TEMPORARY TABLE tmp_private_seed_points (
  manager_email VARCHAR(150) NOT NULL,
  points_total DECIMAL(8,2) NOT NULL,
  total_spent DECIMAL(6,1) NOT NULL,
  transfers_used INT NOT NULL,
  free_transfers INT NOT NULL,
  rank_global INT NULL
);

INSERT INTO tmp_private_seed_points (manager_email, points_total, total_spent, transfers_used, free_transfers, rank_global) VALUES
('manager03@newfpl.local', 96.50, 99.0, 1, 2, 3),
('manager04@newfpl.local', 90.00, 97.5, 2, 1, 4),
('manager05@newfpl.local', 84.50, 96.0, 1, 2, 5),
('manager06@newfpl.local', 78.00, 95.5, 2, 2, 6),
('manager07@newfpl.local', 73.50, 94.0, 0, 2, 7),
('manager08@newfpl.local', 69.00, 93.5, 1, 2, 8),
('manager09@newfpl.local', 65.00, 92.5, 2, 1, 9),
('manager10@newfpl.local', 61.50, 92.0, 1, 2, 10),
('manager11@newfpl.local', 58.00, 91.5, 2, 1, 11),
('manager12@newfpl.local', 54.00, 91.0, 1, 2, 12),
('manager13@newfpl.local', 49.50, 90.5, 2, 1, 13),
('manager14@newfpl.local', 45.00, 90.0, 0, 2, 14),
('manager15@newfpl.local', 41.00, 89.5, 1, 2, 15),
('manager16@newfpl.local', 38.00, 89.0, 2, 1, 16),
('manager17@newfpl.local', 34.50, 88.5, 1, 2, 17),
('manager18@newfpl.local', 31.00, 88.0, 2, 1, 18),
('manager19@newfpl.local', 28.00, 87.5, 1, 2, 19),
('manager20@newfpl.local', 24.50, 87.0, 2, 1, 20);

INSERT INTO manager_squads (
  user_id,
  fixture_id,
  league_season_id,
  budget_cap,
  total_spent,
  transfers_used,
  free_transfers,
  transfer_penalty_points,
  captain_player_id,
  vice_captain_player_id,
  impact_player_id,
  booster,
  is_locked,
  points_total,
  rank_global
)
SELECT
  u.id,
  @seed_fixture_completed,
  'IPL_2025',
  100.0,
  p.total_spent,
  p.transfers_used,
  p.free_transfers,
  0,
  @seed_cap_id,
  @seed_vc_id,
  @seed_impact_id,
  'NONE',
  1,
  p.points_total,
  p.rank_global
FROM tmp_private_seed_points p
JOIN users u ON u.email = p.manager_email
WHERE @seed_fixture_completed IS NOT NULL
  AND @seed_cap_id IS NOT NULL
  AND @seed_vc_id IS NOT NULL
  AND NOT EXISTS (
    SELECT 1
    FROM manager_squads ms
    WHERE ms.user_id = u.id AND ms.fixture_id = @seed_fixture_completed
  );

-- Quick QA summary for private league test data
SELECT
  COUNT(*) AS seeded_private_leagues,
  SUM(CASE WHEN league_season_id = 'IPL_2025' THEN 1 ELSE 0 END) AS ipl_private_leagues
FROM private_leagues
WHERE invite_code IN ('IPLMUM01', 'IPLPWR02', 'IPLOVR03', 'IPLCAP04', 'PSLLOCK1', 'BBLBRAIN', 'BPLDHK01', 'NPLKTM01');

SELECT
  pl.name,
  pl.invite_code,
  COUNT(plm.user_id) AS members
FROM private_leagues pl
LEFT JOIN private_league_members plm ON plm.league_id = pl.id
WHERE pl.invite_code IN ('IPLMUM01', 'IPLPWR02', 'IPLOVR03', 'IPLCAP04', 'PSLLOCK1', 'BBLBRAIN', 'BPLDHK01', 'NPLKTM01')
GROUP BY pl.id, pl.name, pl.invite_code
ORDER BY pl.league_season_id, pl.name;


