-- Populate league_franchises for all leagues
INSERT IGNORE
INTO league_franchises
(league_season_id, franchise_id, display_name, team_code, is_active)
SELECT 'IPL_2025', id, name, short_name, 1
FROM franchises
WHERE short_name IN ('MI', 'CSK', 'RCB', 'KKR', 'DC', 'RR', 'PBKS', 'SRH', 'GT', 'LSG');

INSERT IGNORE
INTO league_franchises
(league_season_id, franchise_id, display_name, team_code, is_active)
SELECT 'PSL_2025', id, name, short_name, 1
FROM franchises
WHERE short_name IN ('KK', 'IU', 'LQ', 'MSU', 'PZ', 'QG');

INSERT IGNORE
INTO league_franchises
(league_season_id, franchise_id, display_name, team_code, is_active)
SELECT 'BBL_2025', id, name, short_name, 1
FROM franchises
WHERE short_name IN ('ADS', 'BRH', 'HBH', 'MLR', 'MLS', 'PES', 'SYS', 'SYT');

INSERT IGNORE
INTO league_franchises
(league_season_id, franchise_id, display_name, team_code, is_active)
SELECT 'BPL_2025', id, name, short_name, 1
FROM franchises
WHERE short_name IN ('CTV', 'CHC', 'DHK', 'FRT', 'KLT', 'RAN', 'SYL');

INSERT IGNORE
INTO league_franchises
(league_season_id, franchise_id, display_name, team_code, is_active)
SELECT 'NPL_2025', id, name, short_name, 1
FROM franchises
WHERE short_name IN ('BIR', 'CHI', 'JAN', 'KTM', 'LUM', 'POK', 'SPR', 'KOS');
