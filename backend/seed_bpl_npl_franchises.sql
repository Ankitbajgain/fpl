-- Populate league_franchises for BPL using actual short codes
INSERT IGNORE
INTO league_franchises
(league_season_id, franchise_id, display_name, team_code, is_active)
SELECT 'BPL_2025', id, name, short_name, 1
FROM franchises
WHERE short_name IN ('CV', 'DD', 'CC', 'KT', 'SS', 'FB');

-- Create NPL franchises (they don't exist yet)
INSERT IGNORE
INTO franchises
(name, short_name, home_city, is_active) VALUES
('Biratnagar Birds', 'BIR', 'Biratnagar', 1),
('Chitwan Rhinos', 'CHI', 'Chitwan', 1),
('Janakpur Jaguars', 'JAN', 'Janakpur', 1),
('Kathmandu Kings', 'KTM', 'Kathmandu', 1),
('Lalitpur Lions', 'LUM', 'Lalitpur', 1),
('Pokhara Panthers', 'POK', 'Pokhara', 1),
('Sindhuli Strikers', 'SPR', 'Sindhuli', 1),
('Karnali Kings', 'KOS', 'Karnali', 1);

-- Populate league_franchises for NPL
INSERT IGNORE
INTO league_franchises
(league_season_id, franchise_id, display_name, team_code, is_active)
SELECT 'NPL_2025', id, name, short_name, 1
FROM franchises
WHERE short_name IN ('BIR', 'CHI', 'JAN', 'KTM', 'LUM', 'POK', 'SPR', 'KOS');
