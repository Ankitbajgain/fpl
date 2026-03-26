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
