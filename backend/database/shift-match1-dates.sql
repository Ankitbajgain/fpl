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
