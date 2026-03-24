-- Multi-League FPL Demo Seed Data
-- Populates nations, competitions, leagues, and mappings

USE new_fpl;

-- ============================================================================
-- NATIONS (Cricket-playing nations)
-- ============================================================================
INSERT IGNORE INTO nations (id, name, iso_code, flag_emoji) VALUES
(1, 'India', 'IND', '🇮🇳'),
(2, 'Pakistan', 'PAK', '🇵🇰'),
(3, 'Australia', 'AUS', '🇦🇺'),
(4, 'England', 'ENG', '🇬🇧'),
(5, 'West Indies', 'WIC', '🌴'),
(6, 'South Africa', 'RSA', '🇿🇦'),
(7, 'New Zealand', 'NZL', '🇳🇿'),
(8, 'Sri Lanka', 'LKA', '🇱🇰'),
(9, 'Bangladesh', 'BGD', '🇧🇩'),
(10, 'United Arab Emirates', 'ARE', '🇦🇪'),
(11, 'Canada', 'CAN', '🇨🇦'),
(12, 'United States', 'USA', '🇺🇸'),
(13, 'Nepal', 'NPL', '🇳🇵'),
(14, 'Afghanistan', 'AFG', '🇦🇫');

-- ============================================================================
-- COMPETITIONS (Major T20 Leagues)
-- ============================================================================
INSERT IGNORE INTO competitions (id, name, short_name, nation_id, organization, established_year, is_active) VALUES
(1, 'Indian Premier League', 'IPL', 1, 'Board of Control for Cricket in India (BCCI)', 2008, 1),
(2, 'Pakistan Super League', 'PSL', 2, 'Pakistan Cricket Board (PCB)', 2015, 1),
(3, 'Big Bash League', 'BBL', 3, 'Cricket Australia (CA)', 2011, 1),
(4, 'Caribbean Premier League', 'CPL', 5, 'Cricket West Indies (CWI)', 2013, 1),
(5, 'Bangladesh Premier League', 'BPL', 9, 'Bangladesh Cricket Board (BCB)', 2012, 1),
(6, 'Lanka Premier League', 'LPL', 8, 'Sri Lanka Cricket (SLC)', 2020, 1),
(7, 'International League T20', 'ILT20', 10, 'Emirates Cricket Board (ECB)', 2023, 1),
(8, 'SA20', 'SA20', 6, 'Cricket South Africa (CSA)', 2023, 1),
(9, 'Global T20 Canada', 'GT20', 11, 'Cricket Canada', 2018, 1),
(10, 'Major League Cricket', 'MLC', 12, 'USA Cricket', 2023, 1);

-- ============================================================================
-- LEAGUE SEASONS (2025 Season - concurrent competitions)
-- ============================================================================
INSERT IGNORE INTO league_seasons (id, competition_id, year, season_name, start_date, end_date, status, budget_cap) VALUES
('IPL_2024', 1, 2024, 'IPL 2024', '2024-03-22', '2024-05-26', 'completed', 100.0),
('IPL_2025', 1, 2025, 'IPL 2025', '2025-04-01', '2025-05-25', 'active', 100.0),
('PSL_2025', 2, 2025, 'PSL 2025', '2025-02-15', '2025-03-23', 'active', 100.0),
('BBL_2025', 3, 2025, 'BBL 2024-25', '2024-12-14', '2025-02-01', 'active', 100.0),
('CPL_2025', 4, 2025, 'CPL 2025', '2025-08-15', '2025-09-29', 'draft', 100.0),
('BPL_2025', 5, 2025, 'BPL 2024-25', '2024-12-28', '2025-02-16', 'active', 100.0),
('LPL_2025', 6, 2025, 'LPL 2025', '2025-07-01', '2025-08-15', 'draft', 100.0),
('ILT20_2025', 7, 2025, 'ILT20 2025', '2025-01-12', '2025-02-09', 'completed', 100.0),
('SA20_2025', 8, 2025, 'SA20 2025', '2025-01-09', '2025-02-16', 'completed', 100.0);

-- ============================================================================
-- LEAGUE FRANCHISES (Map global franchises to each league)
-- ============================================================================

-- IPL 2025 Franchises
INSERT IGNORE INTO league_franchises (league_season_id, franchise_id, display_name, team_code, is_active) 
SELECT 'IPL_2025', id, name, short_name, is_active FROM franchises 
WHERE short_name IN ('MI', 'CSK', 'RCB', 'KKR', 'DC', 'RR', 'PBKS', 'SRH', 'GT', 'LSG', 'DMU');

-- Legacy IPL 2024 season for pre-existing fixtures and squads
INSERT IGNORE INTO league_franchises (league_season_id, franchise_id, display_name, team_code, is_active)
SELECT 'IPL_2024', id, name, short_name, is_active FROM franchises
WHERE short_name IN ('MI', 'CSK', 'RCB', 'KKR', 'DC', 'RR', 'PBKS', 'SRH', 'GT', 'LSG', 'DMU');

-- PSL 2025 Franchises (using relevant franchises with Pakistani association)
INSERT IGNORE INTO league_franchises (league_season_id, franchise_id, display_name, team_code) VALUES
('PSL_2025', 1, 'Karachi Kings', 'KK'),
('PSL_2025', 2, 'Islamabad United', 'IU'),
('PSL_2025', 3, 'Lahore Qalandars', 'LQ'),
('PSL_2025', 4, 'Multan Sultans', 'MS'),
('PSL_2025', 5, 'Peshawar Zalmi', 'PZ'),
('PSL_2025', 6, 'Quetta Gladiators', 'QG');

-- BBL 2024-25 Franchises
INSERT IGNORE INTO league_franchises (league_season_id, franchise_id, display_name, team_code) VALUES
('BBL_2025', 7, 'Adelaide Strikers', 'AS'),
('BBL_2025', 8, 'Brisbane Heat', 'BH'),
('BBL_2025', 9, 'Hobart Hurricanes', 'HH'),
('BBL_2025', 10, 'Melbourne Renegades', 'MR'),
('BBL_2025', 11, 'Melbourne Stars', 'MS'),
('BBL_2025', 12, 'Perth Scorchers', 'PS'),
('BBL_2025', 13, 'Sydney Sixers', 'SS'),
('BBL_2025', 14, 'Sydney Thunder', 'ST');

-- ============================================================================
-- PLAYER NATIONALITIES (Fixed - one per player)
-- Map existing players to their nations
-- ============================================================================

-- Indian Players
INSERT IGNORE INTO player_nationalities (player_id, nation_id)
SELECT id, 1 FROM players 
WHERE full_name IN (
  'Virat Kohli', 'Rohit Sharma', 'Hardik Pandya', 'Jasprit Bumrah',
  'Ravichandran Ashwin', 'MS Dhoni', 'AB de Villiers', 'David Warner',
  'KL Rahul', 'Ravindra Jadeja', 'Suresh Raina', 'Bhuvneshwar Kumar'
) LIMIT 100;

-- Pakistani Players
INSERT IGNORE INTO player_nationalities (player_id, nation_id)
SELECT id, 2 FROM players 
WHERE full_name IN (
  'Babar Azam', 'Muhammad Hasnain', 'Imam-ul-Haq', 'Hafeez'
) LIMIT 100;

-- Australian Players
INSERT IGNORE INTO player_nationalities (player_id, nation_id)
SELECT id, 3 FROM players 
WHERE full_name LIKE '%Smith%' OR full_name LIKE '%Warner%' OR full_name LIKE '%Starc%'
LIMIT 100;

-- Set default nationality for any unmapped players (India for now)
INSERT IGNORE INTO player_nationalities (player_id, nation_id)
SELECT id, 1 FROM players 
WHERE id NOT IN (SELECT player_id FROM player_nationalities)
LIMIT 1000;

-- ============================================================================
-- LEAGUE SEASON PLAYERS (Map available players per league with credits)
-- ============================================================================

-- IPL 2025: All existing players with their current credits
INSERT IGNORE INTO league_season_players (league_season_id, player_id, league_franchise_id, base_credits)
SELECT 
  'IPL_2025',
  p.id,
  lf.id,
  p.credit_price
FROM players p
JOIN franchises f ON p.franchise_id = f.id
JOIN league_franchises lf ON lf.league_season_id = 'IPL_2025' AND lf.franchise_id = f.id
WHERE p.is_active = 1;

-- PSL 2025: Use same players (Virat can play for both IPL and PSL)
INSERT IGNORE INTO league_season_players (league_season_id, player_id, league_franchise_id, base_credits)
SELECT 
  'PSL_2025',
  p.id,
  lf.id,
  p.credit_price * 0.95  -- Slight adjustment for PSL credits
FROM players p
JOIN franchises f ON p.franchise_id = f.id
JOIN league_franchises lf ON lf.league_season_id = 'PSL_2025' AND lf.franchise_id = f.id
WHERE p.is_active = 1
AND NOT EXISTS (
  SELECT 1 FROM league_season_players 
  WHERE league_season_id = 'PSL_2025' AND player_id = p.id
);

-- ============================================================================
-- FIXTURES - Add league_season_id to existing fixtures
-- ============================================================================
UPDATE fixtures SET league_season_id = 'IPL_2024' WHERE league_season_id IS NULL;

-- ============================================================================
-- MANAGER SQUADS - Add league_season_id to existing squads
-- ============================================================================
UPDATE manager_squads SET league_season_id = 'IPL_2024' WHERE league_season_id IS NULL;

-- ============================================================================
-- SAMPLE FIXTURES FOR IPL 2025
-- ============================================================================
INSERT IGNORE INTO fixtures (league_season_id, home_franchise_id, away_franchise_id, venue, starts_at, toss_at, lock_at, status) VALUES
('IPL_2025', 1, 2, 'Wankhede Stadium, Mumbai', '2025-04-01 19:30:00', '2025-04-01 19:00:00', '2025-04-01 19:15:00', 'SCHEDULED'),
('IPL_2025', 3, 4, 'Eden Gardens, Kolkata', '2025-04-02 19:30:00', '2025-04-02 19:00:00', '2025-04-02 19:15:00', 'SCHEDULED'),
('IPL_2025', 5, 6, 'Arun Jaitley Stadium, Delhi', '2025-04-03 15:30:00', '2025-04-03 15:00:00', '2025-04-03 15:15:00', 'SCHEDULED');

-- ============================================================================
-- SAMPLE FIXTURES FOR PSL 2025
-- ============================================================================
INSERT IGNORE INTO fixtures (league_season_id, home_franchise_id, away_franchise_id, venue, starts_at, toss_at, lock_at, status) VALUES
('PSL_2025', 1, 2, 'National Stadium, Karachi', '2025-02-15 19:00:00', '2025-02-15 18:30:00', '2025-02-15 18:45:00', 'SCHEDULED'),
('PSL_2025', 3, 4, 'Lahore Qalandars Ground', '2025-02-16 19:00:00', '2025-02-16 18:30:00', '2025-02-16 18:45:00', 'SCHEDULED');
