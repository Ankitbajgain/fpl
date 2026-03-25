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
