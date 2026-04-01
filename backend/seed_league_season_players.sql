-- Populate league_season_players by assigning players to their franchises' leagues
-- This assigns all players to their franchise's league season with credit pricing

-- First, create a temporary table with player-to-league assignments from the schema mappings
DROP TEMPORARY
TABLE
IF EXISTS tmp_player_assignments;
CREATE TEMPORARY TABLE tmp_player_assignments
(
  full_name VARCHAR
(120) NOT NULL,
  league_season_id VARCHAR
(50) NOT NULL,
  team_code VARCHAR
(10) NOT NULL,
  league_credit DECIMAL
(5,1) NOT NULL
);

-- Insert the player assignments (from the schema file)
INSERT INTO tmp_player_assignments
VALUES
    ('Virat Kohli', 'IPL_2025', 'RCB', 10.0),
    ('Rohit Sharma', 'IPL_2025', 'MI', 9.5),
    ('Jasprit Bumrah', 'IPL_2025', 'MI', 9.5),
    ('Ruturaj Gaikwad', 'IPL_2025', 'CSK', 9.0),
    ('Ravindra Jadeja', 'IPL_2025', 'CSK', 9.5),
    ('Shubman Gill', 'IPL_2025', 'GT', 10.0),
    ('KL Rahul', 'IPL_2025', 'LSG', 9.0),
    ('Rishabh Pant', 'IPL_2025', 'DC', 9.5),
    ('Hardik Pandya', 'IPL_2025', 'MI', 9.5),
    ('Suryakumar Yadav', 'IPL_2025', 'MI', 9.5),
    ('Jos Buttler', 'IPL_2025', 'RR', 9.5),
    ('Sam Curran', 'IPL_2025', 'PBKS', 8.5),
    ('Moeen Ali', 'IPL_2025', 'CSK', 8.5),
    ('Phil Salt', 'IPL_2025', 'KKR', 8.5),
    ('Liam Livingstone', 'IPL_2025', 'PBKS', 9.0),
    ('Quinton de Kock', 'IPL_2025', 'LSG', 9.0),
    ('Kagiso Rabada', 'IPL_2025', 'PBKS', 9.0),
    ('Anrich Nortje', 'IPL_2025', 'DC', 8.0),
    ('Aiden Markram', 'IPL_2025', 'SRH', 8.5),
    ('Heinrich Klaasen', 'IPL_2025', 'SRH', 9.0),
    ('Kane Williamson', 'IPL_2025', 'GT', 8.5),
    ('Rachin Ravindra', 'IPL_2025', 'CSK', 8.5),
    ('Trent Boult', 'IPL_2025', 'RR', 9.0),
    ('Mustafizur Rahman', 'IPL_2025', 'CSK', 8.0),
    ('Rashid Khan', 'IPL_2025', 'GT', 10.0),
    ('Rahmanullah Gurbaz', 'IPL_2025', 'KKR', 8.0),
    ('Mohammad Nabi', 'IPL_2025', 'MI', 8.0),
    ('Babar Azam', 'PSL_2025', 'PZ', 9.5),
    ('Mohammad Rizwan', 'PSL_2025', 'MSU', 9.5),
    ('Shaheen Shah Afridi', 'PSL_2025', 'LQ', 9.5),
    ('Shadab Khan', 'PSL_2025', 'IU', 8.5),
    ('Fakhar Zaman', 'PSL_2025', 'LQ', 8.5),
    ('Saim Ayub', 'PSL_2025', 'PZ', 8.0),
    ('Haris Rauf', 'PSL_2025', 'LQ', 8.5),
    ('David Warner', 'PSL_2025', 'KK', 8.5),
    ('Travis Head', 'PSL_2025', 'KK', 9.0),
    ('Rashid Khan', 'PSL_2025', 'LQ', 9.8),
    ('Phil Salt', 'PSL_2025', 'IU', 8.7),
    ('Shakib Al Hasan', 'PSL_2025', 'IU', 8.3),
    ('Quinton de Kock', 'PSL_2025', 'KK', 9.0),
    ('Kagiso Rabada', 'PSL_2025', 'QG', 9.0),
    ('Steve Smith', 'BBL_2025', 'SYS', 8.0),
    ('Travis Head', 'BBL_2025', 'ADS', 9.0),
    ('Pat Cummins', 'BBL_2025', 'SYT', 8.8),
    ('Glenn Maxwell', 'BBL_2025', 'MLS', 9.0),
    ('Marcus Stoinis', 'BBL_2025', 'MLS', 8.5),
    ('Josh Hazlewood', 'BBL_2025', 'SYS', 8.5),
    ('Rashid Khan', 'BBL_2025', 'ADS', 9.8),
    ('Phil Salt', 'BBL_2025', 'SYS', 8.5),
    ('Rachin Ravindra', 'BBL_2025', 'BRH', 8.3),
    ('Babar Azam', 'BBL_2025', 'HBH', 9.1),
    ('Shaheen Shah Afridi', 'BBL_2025', 'MLR', 9.1),
    ('Rohit Sharma', 'BBL_2025', 'PES', 9.0),
    ('Litton Das', 'BPL_2025', 'CV', 8.0),
    ('Shakib Al Hasan', 'BPL_2025', 'FB', 9.0),
    ('Mustafizur Rahman', 'BPL_2025', 'DD', 8.2),
    ('Rashid Khan', 'BPL_2025', 'FB', 9.8),
    ('Babar Azam', 'BPL_2025', 'RAN', 9.3),
    ('Mohammad Rizwan', 'BPL_2025', 'SS', 9.2),
    ('Shaheen Shah Afridi', 'BPL_2025', 'SS', 9.0),
    ('Quinton de Kock', 'BPL_2025', 'CC', 8.8),
    ('David Warner', 'BPL_2025', 'KT', 8.4),
    ('Trent Boult', 'BPL_2025', 'KT', 8.8),
    ('Rohit Paudel', 'NPL_2025', 'KTM', 8.0),
    ('Dipendra Singh Airee', 'NPL_2025', 'JAN', 8.5),
    ('Kushal Malla', 'NPL_2025', 'BIR', 8.0),
    ('Sandeep Lamichhane', 'NPL_2025', 'POK', 8.5),
    ('Aasif Sheikh', 'NPL_2025', 'LUM', 7.5),
    ('Karan KC', 'NPL_2025', 'SPR', 8.0),
    ('Sompal Kami', 'NPL_2025', 'KOS', 7.5),
    ('Gulshan Jha', 'NPL_2025', 'CHI', 7.5),
    ('Shakib Al Hasan', 'NPL_2025', 'KTM', 8.8),
    ('Rashid Khan', 'NPL_2025', 'POK', 9.5),
    ('Babar Azam', 'NPL_2025', 'JAN', 9.2),
    ('Quinton de Kock', 'NPL_2025', 'LUM', 8.6);

-- Now insert into league_season_players
INSERT IGNORE
INTO league_season_players
(league_season_id, player_id, league_franchise_id, base_credits, is_active)
SELECT
    tpa.league_season_id,
    p.id,
    lf.id,
    tpa.league_credit,
    1
FROM tmp_player_assignments tpa
    JOIN players p ON p.full_name = tpa.full_name
    JOIN league_franchises lf
    ON lf.league_season_id = tpa.league_season_id
        AND lf.team_code = tpa.team_code;

-- Verify results
SELECT
    (SELECT COUNT(*)
    FROM league_season_players
    WHERE league_season_id = 'IPL_2025') AS ipl_players,
    (SELECT COUNT(*)
    FROM league_season_players
    WHERE league_season_id = 'PSL_2025') AS psl_players,
    (SELECT COUNT(*)
    FROM league_season_players
    WHERE league_season_id = 'BBL_2025') AS bbl_players,
    (SELECT COUNT(*)
    FROM league_season_players
    WHERE league_season_id = 'BPL_2025') AS bpl_players,
    (SELECT COUNT(*)
    FROM league_season_players
    WHERE league_season_id = 'NPL_2025') AS npl_players;
