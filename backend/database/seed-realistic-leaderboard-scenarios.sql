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
-- 2) Ensure key players exist for realistic lineups
-- ------------------------------------------------------------
INSERT INTO players (full_name, role, franchise_id, credit_price, is_active)
SELECT 'Ishan Kishan', 'WK', @mi, 9.0, 1 FROM DUAL
WHERE NOT EXISTS (SELECT 1 FROM players WHERE full_name = 'Ishan Kishan' AND franchise_id = @mi);
INSERT INTO players (full_name, role, franchise_id, credit_price, is_active)
SELECT 'Rohit Sharma', 'BAT', @mi, 9.5, 1 FROM DUAL
WHERE NOT EXISTS (SELECT 1 FROM players WHERE full_name = 'Rohit Sharma' AND franchise_id = @mi);
INSERT INTO players (full_name, role, franchise_id, credit_price, is_active)
SELECT 'Suryakumar Yadav', 'BAT', @mi, 9.5, 1 FROM DUAL
WHERE NOT EXISTS (SELECT 1 FROM players WHERE full_name = 'Suryakumar Yadav' AND franchise_id = @mi);
INSERT INTO players (full_name, role, franchise_id, credit_price, is_active)
SELECT 'Hardik Pandya', 'AR', @mi, 9.5, 1 FROM DUAL
WHERE NOT EXISTS (SELECT 1 FROM players WHERE full_name = 'Hardik Pandya' AND franchise_id = @mi);
INSERT INTO players (full_name, role, franchise_id, credit_price, is_active)
SELECT 'Jasprit Bumrah', 'BOWL', @mi, 9.5, 1 FROM DUAL
WHERE NOT EXISTS (SELECT 1 FROM players WHERE full_name = 'Jasprit Bumrah' AND franchise_id = @mi);
INSERT INTO players (full_name, role, franchise_id, credit_price, is_active)
SELECT 'Tilak Varma', 'BAT', @mi, 8.5, 1 FROM DUAL
WHERE NOT EXISTS (SELECT 1 FROM players WHERE full_name = 'Tilak Varma' AND franchise_id = @mi);

INSERT INTO players (full_name, role, franchise_id, credit_price, is_active)
SELECT 'MS Dhoni', 'WK', @csk, 8.0, 1 FROM DUAL
WHERE NOT EXISTS (SELECT 1 FROM players WHERE full_name = 'MS Dhoni' AND franchise_id = @csk);
INSERT INTO players (full_name, role, franchise_id, credit_price, is_active)
SELECT 'Ruturaj Gaikwad', 'BAT', @csk, 9.0, 1 FROM DUAL
WHERE NOT EXISTS (SELECT 1 FROM players WHERE full_name = 'Ruturaj Gaikwad' AND franchise_id = @csk);
INSERT INTO players (full_name, role, franchise_id, credit_price, is_active)
SELECT 'Shivam Dube', 'AR', @csk, 8.5, 1 FROM DUAL
WHERE NOT EXISTS (SELECT 1 FROM players WHERE full_name = 'Shivam Dube' AND franchise_id = @csk);
INSERT INTO players (full_name, role, franchise_id, credit_price, is_active)
SELECT 'Ravindra Jadeja', 'AR', @csk, 9.5, 1 FROM DUAL
WHERE NOT EXISTS (SELECT 1 FROM players WHERE full_name = 'Ravindra Jadeja' AND franchise_id = @csk);
INSERT INTO players (full_name, role, franchise_id, credit_price, is_active)
SELECT 'Matheesha Pathirana', 'BOWL', @csk, 8.5, 1 FROM DUAL
WHERE NOT EXISTS (SELECT 1 FROM players WHERE full_name = 'Matheesha Pathirana' AND franchise_id = @csk);
INSERT INTO players (full_name, role, franchise_id, credit_price, is_active)
SELECT 'Deepak Chahar', 'BOWL', @csk, 8.0, 1 FROM DUAL
WHERE NOT EXISTS (SELECT 1 FROM players WHERE full_name = 'Deepak Chahar' AND franchise_id = @csk);

INSERT INTO players (full_name, role, franchise_id, credit_price, is_active)
SELECT 'Dinesh Karthik', 'WK', @rcb, 8.0, 1 FROM DUAL
WHERE NOT EXISTS (SELECT 1 FROM players WHERE full_name = 'Dinesh Karthik' AND franchise_id = @rcb);
INSERT INTO players (full_name, role, franchise_id, credit_price, is_active)
SELECT 'Virat Kohli', 'BAT', @rcb, 10.0, 1 FROM DUAL
WHERE NOT EXISTS (SELECT 1 FROM players WHERE full_name = 'Virat Kohli' AND franchise_id = @rcb);
INSERT INTO players (full_name, role, franchise_id, credit_price, is_active)
SELECT 'Rajat Patidar', 'BAT', @rcb, 8.5, 1 FROM DUAL
WHERE NOT EXISTS (SELECT 1 FROM players WHERE full_name = 'Rajat Patidar' AND franchise_id = @rcb);
INSERT INTO players (full_name, role, franchise_id, credit_price, is_active)
SELECT 'Glenn Maxwell', 'AR', @rcb, 9.0, 1 FROM DUAL
WHERE NOT EXISTS (SELECT 1 FROM players WHERE full_name = 'Glenn Maxwell' AND franchise_id = @rcb);
INSERT INTO players (full_name, role, franchise_id, credit_price, is_active)
SELECT 'Mohammed Siraj', 'BOWL', @rcb, 8.5, 1 FROM DUAL
WHERE NOT EXISTS (SELECT 1 FROM players WHERE full_name = 'Mohammed Siraj' AND franchise_id = @rcb);
INSERT INTO players (full_name, role, franchise_id, credit_price, is_active)
SELECT 'Faf du Plessis', 'BAT', @rcb, 9.0, 1 FROM DUAL
WHERE NOT EXISTS (SELECT 1 FROM players WHERE full_name = 'Faf du Plessis' AND franchise_id = @rcb);

INSERT INTO players (full_name, role, franchise_id, credit_price, is_active)
SELECT 'Phil Salt', 'WK', @kkr, 8.5, 1 FROM DUAL
WHERE NOT EXISTS (SELECT 1 FROM players WHERE full_name = 'Phil Salt' AND franchise_id = @kkr);
INSERT INTO players (full_name, role, franchise_id, credit_price, is_active)
SELECT 'Shreyas Iyer', 'BAT', @kkr, 9.0, 1 FROM DUAL
WHERE NOT EXISTS (SELECT 1 FROM players WHERE full_name = 'Shreyas Iyer' AND franchise_id = @kkr);
INSERT INTO players (full_name, role, franchise_id, credit_price, is_active)
SELECT 'Rinku Singh', 'BAT', @kkr, 8.5, 1 FROM DUAL
WHERE NOT EXISTS (SELECT 1 FROM players WHERE full_name = 'Rinku Singh' AND franchise_id = @kkr);
INSERT INTO players (full_name, role, franchise_id, credit_price, is_active)
SELECT 'Sunil Narine', 'AR', @kkr, 9.5, 1 FROM DUAL
WHERE NOT EXISTS (SELECT 1 FROM players WHERE full_name = 'Sunil Narine' AND franchise_id = @kkr);
INSERT INTO players (full_name, role, franchise_id, credit_price, is_active)
SELECT 'Mitchell Starc', 'BOWL', @kkr, 9.0, 1 FROM DUAL
WHERE NOT EXISTS (SELECT 1 FROM players WHERE full_name = 'Mitchell Starc' AND franchise_id = @kkr);
INSERT INTO players (full_name, role, franchise_id, credit_price, is_active)
SELECT 'Andre Russell', 'AR', @kkr, 9.5, 1 FROM DUAL
WHERE NOT EXISTS (SELECT 1 FROM players WHERE full_name = 'Andre Russell' AND franchise_id = @kkr);

SET @ishan      = (SELECT id FROM players WHERE full_name = 'Ishan Kishan' AND franchise_id = @mi LIMIT 1);
SET @rohit      = (SELECT id FROM players WHERE full_name = 'Rohit Sharma' AND franchise_id = @mi LIMIT 1);
SET @sky        = (SELECT id FROM players WHERE full_name = 'Suryakumar Yadav' AND franchise_id = @mi LIMIT 1);
SET @hardik     = (SELECT id FROM players WHERE full_name = 'Hardik Pandya' AND franchise_id = @mi LIMIT 1);
SET @bumrah     = (SELECT id FROM players WHERE full_name = 'Jasprit Bumrah' AND franchise_id = @mi LIMIT 1);
SET @tilak      = (SELECT id FROM players WHERE full_name = 'Tilak Varma' AND franchise_id = @mi LIMIT 1);
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
SET @russell    = (SELECT id FROM players WHERE full_name = 'Andre Russell' AND franchise_id = @kkr LIMIT 1);

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
