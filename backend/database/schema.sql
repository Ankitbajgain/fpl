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
  CONSTRAINT fk_fixture_home FOREIGN KEY (home_franchise_id) REFERENCES franchises(id),
  CONSTRAINT fk_fixture_away FOREIGN KEY (away_franchise_id) REFERENCES franchises(id),
  CONSTRAINT fk_fixture_winner FOREIGN KEY (winner_franchise_id) REFERENCES franchises(id),
  CONSTRAINT fk_fixture_motm FOREIGN KEY (motm_player_id) REFERENCES players(id)
);

CREATE TABLE manager_squads (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  user_id BIGINT UNSIGNED NOT NULL,
  fixture_id BIGINT UNSIGNED NOT NULL,
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
  CONSTRAINT fk_squad_user FOREIGN KEY (user_id) REFERENCES users(id),
  CONSTRAINT fk_squad_fixture FOREIGN KEY (fixture_id) REFERENCES fixtures(id),
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
  creator_user_id BIGINT UNSIGNED NOT NULL,
  name VARCHAR(120) NOT NULL,
  invite_code VARCHAR(20) NOT NULL UNIQUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_league_creator FOREIGN KEY (creator_user_id) REFERENCES users(id)
);

CREATE TABLE private_league_members (
  league_id BIGINT UNSIGNED NOT NULL,
  user_id BIGINT UNSIGNED NOT NULL,
  joined_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
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
