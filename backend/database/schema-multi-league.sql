-- Multi-League FPL Schema Enhancements
-- Adds support for multiple simultaneous competitions (IPL, PSL, BBL, etc.)
-- Maintains backward compatibility with existing single-league data

USE new_fpl;

-- ============================================================================
-- NEW TABLES FOR MULTI-LEAGUE SUPPORT
-- ============================================================================

-- Nations/Countries registry
CREATE TABLE IF NOT EXISTS nations (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL UNIQUE,
  iso_code VARCHAR(3) NOT NULL UNIQUE,
  flag_emoji VARCHAR(10),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Competitions (IPL, PSL, BBL, etc.)
CREATE TABLE IF NOT EXISTS competitions (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(120) NOT NULL UNIQUE,              -- "Indian Premier League"
  short_name VARCHAR(20) NOT NULL UNIQUE,        -- "IPL"
  nation_id BIGINT UNSIGNED NOT NULL,            -- Links to nations table (India for IPL)
  organization VARCHAR(120),                     -- "BCCI", "PCB", etc.
  established_year INT,
  logo_url VARCHAR(255),
  is_active TINYINT(1) NOT NULL DEFAULT 1,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_competition_nation FOREIGN KEY (nation_id) REFERENCES nations(id)
);

-- League Seasons (IPL 2024, PSL 2025, etc.)
CREATE TABLE IF NOT EXISTS league_seasons (
  id VARCHAR(50) PRIMARY KEY,                    -- "IPL_2025", "PSL_2025", etc.
  competition_id BIGINT UNSIGNED NOT NULL,
  year INT NOT NULL,
  season_name VARCHAR(100),                     -- "IPL 2025", "PSL 2025", etc.
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  status ENUM('draft','active','completed') NOT NULL DEFAULT 'draft',
  budget_cap DECIMAL(6,1) NOT NULL DEFAULT 100.0,
  total_fixtures INT DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_league_season_competition FOREIGN KEY (competition_id) REFERENCES competitions(id)
);

-- League-specific Franchises (maps global franchises to specific leagues)
CREATE TABLE IF NOT EXISTS league_franchises (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  league_season_id VARCHAR(50) NOT NULL,
  franchise_id BIGINT UNSIGNED NOT NULL,
  display_name VARCHAR(120),                     -- Override franchise name for this league
  team_code VARCHAR(10),                         -- "MI", "CSK", "IU", etc.
  badge_url VARCHAR(255),                        -- League-specific badge
  is_active TINYINT(1) NOT NULL DEFAULT 1,
  UNIQUE KEY uq_league_franchise (league_season_id, franchise_id),
  CONSTRAINT fk_league_franchise_season FOREIGN KEY (league_season_id) REFERENCES league_seasons(id),
  CONSTRAINT fk_league_franchise_franchise FOREIGN KEY (franchise_id) REFERENCES franchises(id)
);

-- Player nationalities (fixed field - each player has ONE nationality)
CREATE TABLE IF NOT EXISTS player_nationalities (
  player_id BIGINT UNSIGNED PRIMARY KEY,
  nation_id BIGINT UNSIGNED NOT NULL,
  UNIQUE KEY (player_id),
  CONSTRAINT fk_player_nat_player FOREIGN KEY (player_id) REFERENCES players(id),
  CONSTRAINT fk_player_nat_nation FOREIGN KEY (nation_id) REFERENCES nations(id)
);

-- League Season Players (availability & credits per league)
CREATE TABLE IF NOT EXISTS league_season_players (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  league_season_id VARCHAR(50) NOT NULL,
  player_id BIGINT UNSIGNED NOT NULL,
  league_franchise_id BIGINT UNSIGNED NOT NULL,
  base_credits DECIMAL(5,1) NOT NULL,
  is_active TINYINT(1) NOT NULL DEFAULT 1,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY uq_league_season_player (league_season_id, player_id, league_franchise_id),
  CONSTRAINT fk_lsp_league_season FOREIGN KEY (league_season_id) REFERENCES league_seasons(id),
  CONSTRAINT fk_lsp_player FOREIGN KEY (player_id) REFERENCES players(id),
  CONSTRAINT fk_lsp_franchise FOREIGN KEY (league_franchise_id) REFERENCES league_franchises(id)
);

-- ============================================================================
-- MODIFICATIONS TO EXISTING TABLES
-- ============================================================================

-- Add league_season_id to fixtures
ALTER TABLE fixtures ADD COLUMN league_season_id VARCHAR(50) DEFAULT NULL;

-- Add league_season_id to manager_squads
ALTER TABLE manager_squads ADD COLUMN league_season_id VARCHAR(50) DEFAULT NULL;

-- Add new foreign keys
ALTER TABLE fixtures ADD CONSTRAINT fk_fixture_league_season 
  FOREIGN KEY (league_season_id) REFERENCES league_seasons(id);

ALTER TABLE manager_squads ADD CONSTRAINT fk_squad_league_season 
  FOREIGN KEY (league_season_id) REFERENCES league_seasons(id);

-- ============================================================================
-- INDEXES FOR PERFORMANCE
-- ============================================================================

CREATE INDEX idx_competitions_nation ON competitions(nation_id);
CREATE INDEX idx_league_seasons_competition ON league_seasons(competition_id);
CREATE INDEX idx_league_seasons_status ON league_seasons(status);
CREATE INDEX idx_league_franchises_league ON league_franchises(league_season_id);
CREATE INDEX idx_league_franchises_franchise ON league_franchises(franchise_id);
CREATE INDEX idx_league_season_players_league ON league_season_players(league_season_id);
CREATE INDEX idx_league_season_players_player ON league_season_players(player_id);
CREATE INDEX idx_league_season_players_franchise ON league_season_players(league_franchise_id);
CREATE INDEX idx_fixtures_league_season ON fixtures(league_season_id);
CREATE INDEX idx_manager_squads_league ON manager_squads(league_season_id);
CREATE INDEX idx_manager_squads_league_user ON manager_squads(league_season_id, user_id);
