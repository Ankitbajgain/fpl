-- ============================================================
-- Migration: Fantasy Points System + Transfer Window Timing
-- Run once against the new_fpl database.
-- ============================================================
USE new_fpl;

-- ── fixtures: match type, end time, transfer window open time ──────────────
ALTER TABLE fixtures
  ADD COLUMN IF NOT EXISTS match_type ENUM('T20','ODI','TEST','T10') NOT NULL DEFAULT 'T20'
    AFTER venue,
  ADD COLUMN IF NOT EXISTS ended_at DATETIME NULL
    AFTER status,
  ADD COLUMN IF NOT EXISTS transfer_window_opens_at DATETIME NULL
    AFTER ended_at;

-- ── player_live_stats: additional bowling / fielding / meta columns ─────────
ALTER TABLE player_live_stats
  ADD COLUMN IF NOT EXISTS balls_bowled          INT           NOT NULL DEFAULT 0
    AFTER economy_rate,
  ADD COLUMN IF NOT EXISTS runs_conceded         INT           NOT NULL DEFAULT 0
    AFTER balls_bowled,
  ADD COLUMN IF NOT EXISTS lbw_wickets           INT           NOT NULL DEFAULT 0
    AFTER runs_conceded,
  ADD COLUMN IF NOT EXISTS bowled_wickets        INT           NOT NULL DEFAULT 0
    AFTER lbw_wickets,
  ADD COLUMN IF NOT EXISTS is_playing_xi         TINYINT(1)    NOT NULL DEFAULT 0
    AFTER bowled_wickets,
  ADD COLUMN IF NOT EXISTS did_bat               TINYINT(1)    NOT NULL DEFAULT 0
    AFTER is_playing_xi,
  ADD COLUMN IF NOT EXISTS four_wicket_haul      TINYINT(1)    NOT NULL DEFAULT 0
    AFTER did_bat,
  ADD COLUMN IF NOT EXISTS five_wicket_haul      TINYINT(1)    NOT NULL DEFAULT 0
    AFTER four_wicket_haul,
  ADD COLUMN IF NOT EXISTS indirect_runout_throws  INT         NOT NULL DEFAULT 0
    AFTER five_wicket_haul,
  ADD COLUMN IF NOT EXISTS indirect_runout_catches INT         NOT NULL DEFAULT 0
    AFTER indirect_runout_throws,
  ADD COLUMN IF NOT EXISTS fantasy_points        DECIMAL(8,2)  NOT NULL DEFAULT 0
    AFTER indirect_runout_catches;

-- ── manager_squad_players: store per-player points (post captain/vc mult.) ──
ALTER TABLE manager_squad_players
  ADD COLUMN IF NOT EXISTS fantasy_points DECIMAL(8,2) NOT NULL DEFAULT 0;
