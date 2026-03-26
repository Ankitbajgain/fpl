-- ============================================================
-- Migration: Leaderboard Finalization Tracking
-- Run once against the new_fpl database.
-- ============================================================
USE new_fpl;

ALTER TABLE fixtures
  ADD COLUMN IF NOT EXISTS points_finalized_at DATETIME NULL
    AFTER transfer_window_opens_at,
  ADD INDEX IF NOT EXISTS idx_fixture_points_finalized_at (points_finalized_at);
