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
