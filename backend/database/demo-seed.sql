USE new_fpl;

SET @admin_hash = '$2a$12$Csg56tv4n63vcN9rUht5sOyAhgIZeELBhlw1nRfallDuhUV9GYZdC';
SET @manager_hash = '$2a$12$Ifl52slzLz1gecXvovQJZeNem67/nHnS2RPxpWAi99e2lQmXHs86e';
SET @manager2_hash = '$2a$12$X4O8gv09qXGnm2FCVJfVV.M.C9S.J510Cnme8m.4KQZXeRyGGvmrq';

INSERT INTO users (name, email, password_hash, phone, role)
SELECT 'Admin User', 'admin@newfpl.local', @admin_hash, '9000000001', 'admin'
FROM DUAL
WHERE NOT EXISTS (SELECT 1 FROM users WHERE email = 'admin@newfpl.local');

INSERT INTO users (name, email, password_hash, phone, role)
SELECT 'Demo Manager', 'manager1@newfpl.local', @manager_hash, '9000000002', 'manager'
FROM DUAL
WHERE NOT EXISTS (SELECT 1 FROM users WHERE email = 'manager1@newfpl.local');

INSERT INTO users (name, email, password_hash, phone, role)
SELECT 'Second Manager', 'manager2@newfpl.local', @manager2_hash, '9000000003', 'manager'
FROM DUAL
WHERE NOT EXISTS (SELECT 1 FROM users WHERE email = 'manager2@newfpl.local');

INSERT INTO franchises (name, short_name, home_city)
SELECT 'Mumbai Indians', 'MI', 'Mumbai'
FROM DUAL
WHERE NOT EXISTS (SELECT 1 FROM franchises WHERE short_name = 'MI');

INSERT INTO franchises (name, short_name, home_city)
SELECT 'Chennai Super Kings', 'CSK', 'Chennai'
FROM DUAL
WHERE NOT EXISTS (SELECT 1 FROM franchises WHERE short_name = 'CSK');

INSERT INTO franchises (name, short_name, home_city)
SELECT 'Royal Challengers Bengaluru', 'RCB', 'Bengaluru'
FROM DUAL
WHERE NOT EXISTS (SELECT 1 FROM franchises WHERE short_name = 'RCB');

INSERT INTO franchises (name, short_name, home_city)
SELECT 'Kolkata Knight Riders', 'KKR', 'Kolkata'
FROM DUAL
WHERE NOT EXISTS (SELECT 1 FROM franchises WHERE short_name = 'KKR');

INSERT INTO franchises (name, short_name, home_city)
SELECT 'India XI', 'IND', 'Mumbai'
FROM DUAL
WHERE NOT EXISTS (SELECT 1 FROM franchises WHERE short_name = 'IND');

INSERT INTO franchises (name, short_name, home_city)
SELECT 'Australia XI', 'AUS', 'Sydney'
FROM DUAL
WHERE NOT EXISTS (SELECT 1 FROM franchises WHERE short_name = 'AUS');

INSERT INTO franchises (name, short_name, home_city)
SELECT 'England XI', 'ENG', 'London'
FROM DUAL
WHERE NOT EXISTS (SELECT 1 FROM franchises WHERE short_name = 'ENG');

INSERT INTO franchises (name, short_name, home_city)
SELECT 'Nepal XI', 'NEP', 'Kathmandu'
FROM DUAL
WHERE NOT EXISTS (SELECT 1 FROM franchises WHERE short_name = 'NEP');

INSERT INTO franchises (name, short_name, home_city)
SELECT 'New Zealand XI', 'NZ', 'Auckland'
FROM DUAL
WHERE NOT EXISTS (SELECT 1 FROM franchises WHERE short_name = 'NZ');

INSERT INTO franchises (name, short_name, home_city)
SELECT 'South Africa XI', 'SA', 'Cape Town'
FROM DUAL
WHERE NOT EXISTS (SELECT 1 FROM franchises WHERE short_name = 'SA');

INSERT INTO franchises (name, short_name, home_city)
SELECT 'Pakistan XI', 'PAK', 'Lahore'
FROM DUAL
WHERE NOT EXISTS (SELECT 1 FROM franchises WHERE short_name = 'PAK');

INSERT INTO franchises (name, short_name, home_city)
SELECT 'Bangladesh XI', 'BAN', 'Dhaka'
FROM DUAL
WHERE NOT EXISTS (SELECT 1 FROM franchises WHERE short_name = 'BAN');

INSERT INTO franchises (name, short_name, home_city)
SELECT 'Sri Lanka XI', 'SL', 'Colombo'
FROM DUAL
WHERE NOT EXISTS (SELECT 1 FROM franchises WHERE short_name = 'SL');

INSERT INTO franchises (name, short_name, home_city)
SELECT 'Afghanistan XI', 'AFG', 'Kabul'
FROM DUAL
WHERE NOT EXISTS (SELECT 1 FROM franchises WHERE short_name = 'AFG');

INSERT INTO franchises (name, short_name, home_city)
SELECT 'West Indies XI', 'WI', 'Bridgetown'
FROM DUAL
WHERE NOT EXISTS (SELECT 1 FROM franchises WHERE short_name = 'WI');

INSERT INTO franchises (name, short_name, home_city)
SELECT 'Ireland XI', 'IRE', 'Dublin'
FROM DUAL
WHERE NOT EXISTS (SELECT 1 FROM franchises WHERE short_name = 'IRE');

INSERT INTO franchises (name, short_name, home_city)
SELECT 'Netherlands XI', 'NED', 'Amsterdam'
FROM DUAL
WHERE NOT EXISTS (SELECT 1 FROM franchises WHERE short_name = 'NED');

SET @mi_id = (SELECT id FROM franchises WHERE short_name = 'MI' LIMIT 1);
SET @csk_id = (SELECT id FROM franchises WHERE short_name = 'CSK' LIMIT 1);
SET @rcb_id = (SELECT id FROM franchises WHERE short_name = 'RCB' LIMIT 1);
SET @kkr_id = (SELECT id FROM franchises WHERE short_name = 'KKR' LIMIT 1);

INSERT INTO players (full_name, role, franchise_id, credit_price)
SELECT 'Ishan Kishan', 'WK', @mi_id, 9.0 FROM DUAL
WHERE NOT EXISTS (SELECT 1 FROM players WHERE full_name = 'Ishan Kishan' AND franchise_id = @mi_id);
INSERT INTO players (full_name, role, franchise_id, credit_price)
SELECT 'Rohit Sharma', 'BAT', @mi_id, 9.5 FROM DUAL
WHERE NOT EXISTS (SELECT 1 FROM players WHERE full_name = 'Rohit Sharma' AND franchise_id = @mi_id);
INSERT INTO players (full_name, role, franchise_id, credit_price)
SELECT 'Suryakumar Yadav', 'BAT', @mi_id, 9.5 FROM DUAL
WHERE NOT EXISTS (SELECT 1 FROM players WHERE full_name = 'Suryakumar Yadav' AND franchise_id = @mi_id);
INSERT INTO players (full_name, role, franchise_id, credit_price)
SELECT 'Hardik Pandya', 'AR', @mi_id, 9.5 FROM DUAL
WHERE NOT EXISTS (SELECT 1 FROM players WHERE full_name = 'Hardik Pandya' AND franchise_id = @mi_id);
INSERT INTO players (full_name, role, franchise_id, credit_price)
SELECT 'Jasprit Bumrah', 'BOWL', @mi_id, 9.0 FROM DUAL
WHERE NOT EXISTS (SELECT 1 FROM players WHERE full_name = 'Jasprit Bumrah' AND franchise_id = @mi_id);

INSERT INTO players (full_name, role, franchise_id, credit_price)
SELECT 'MS Dhoni', 'WK', @csk_id, 8.0 FROM DUAL
WHERE NOT EXISTS (SELECT 1 FROM players WHERE full_name = 'MS Dhoni' AND franchise_id = @csk_id);
INSERT INTO players (full_name, role, franchise_id, credit_price)
SELECT 'Ruturaj Gaikwad', 'BAT', @csk_id, 9.0 FROM DUAL
WHERE NOT EXISTS (SELECT 1 FROM players WHERE full_name = 'Ruturaj Gaikwad' AND franchise_id = @csk_id);
INSERT INTO players (full_name, role, franchise_id, credit_price)
SELECT 'Shivam Dube', 'AR', @csk_id, 8.5 FROM DUAL
WHERE NOT EXISTS (SELECT 1 FROM players WHERE full_name = 'Shivam Dube' AND franchise_id = @csk_id);
INSERT INTO players (full_name, role, franchise_id, credit_price)
SELECT 'Ravindra Jadeja', 'AR', @csk_id, 9.5 FROM DUAL
WHERE NOT EXISTS (SELECT 1 FROM players WHERE full_name = 'Ravindra Jadeja' AND franchise_id = @csk_id);
INSERT INTO players (full_name, role, franchise_id, credit_price)
SELECT 'Matheesha Pathirana', 'BOWL', @csk_id, 8.5 FROM DUAL
WHERE NOT EXISTS (SELECT 1 FROM players WHERE full_name = 'Matheesha Pathirana' AND franchise_id = @csk_id);

INSERT INTO players (full_name, role, franchise_id, credit_price)
SELECT 'Dinesh Karthik', 'WK', @rcb_id, 8.0 FROM DUAL
WHERE NOT EXISTS (SELECT 1 FROM players WHERE full_name = 'Dinesh Karthik' AND franchise_id = @rcb_id);
INSERT INTO players (full_name, role, franchise_id, credit_price)
SELECT 'Virat Kohli', 'BAT', @rcb_id, 10.0 FROM DUAL
WHERE NOT EXISTS (SELECT 1 FROM players WHERE full_name = 'Virat Kohli' AND franchise_id = @rcb_id);
INSERT INTO players (full_name, role, franchise_id, credit_price)
SELECT 'Rajat Patidar', 'BAT', @rcb_id, 8.5 FROM DUAL
WHERE NOT EXISTS (SELECT 1 FROM players WHERE full_name = 'Rajat Patidar' AND franchise_id = @rcb_id);
INSERT INTO players (full_name, role, franchise_id, credit_price)
SELECT 'Glenn Maxwell', 'AR', @rcb_id, 9.0 FROM DUAL
WHERE NOT EXISTS (SELECT 1 FROM players WHERE full_name = 'Glenn Maxwell' AND franchise_id = @rcb_id);
INSERT INTO players (full_name, role, franchise_id, credit_price)
SELECT 'Mohammed Siraj', 'BOWL', @rcb_id, 8.5 FROM DUAL
WHERE NOT EXISTS (SELECT 1 FROM players WHERE full_name = 'Mohammed Siraj' AND franchise_id = @rcb_id);

INSERT INTO players (full_name, role, franchise_id, credit_price)
SELECT 'Phil Salt', 'WK', @kkr_id, 8.5 FROM DUAL
WHERE NOT EXISTS (SELECT 1 FROM players WHERE full_name = 'Phil Salt' AND franchise_id = @kkr_id);
INSERT INTO players (full_name, role, franchise_id, credit_price)
SELECT 'Shreyas Iyer', 'BAT', @kkr_id, 9.0 FROM DUAL
WHERE NOT EXISTS (SELECT 1 FROM players WHERE full_name = 'Shreyas Iyer' AND franchise_id = @kkr_id);
INSERT INTO players (full_name, role, franchise_id, credit_price)
SELECT 'Rinku Singh', 'BAT', @kkr_id, 8.5 FROM DUAL
WHERE NOT EXISTS (SELECT 1 FROM players WHERE full_name = 'Rinku Singh' AND franchise_id = @kkr_id);
INSERT INTO players (full_name, role, franchise_id, credit_price)
SELECT 'Sunil Narine', 'AR', @kkr_id, 9.5 FROM DUAL
WHERE NOT EXISTS (SELECT 1 FROM players WHERE full_name = 'Sunil Narine' AND franchise_id = @kkr_id);
INSERT INTO players (full_name, role, franchise_id, credit_price)
SELECT 'Mitchell Starc', 'BOWL', @kkr_id, 9.0 FROM DUAL
WHERE NOT EXISTS (SELECT 1 FROM players WHERE full_name = 'Mitchell Starc' AND franchise_id = @kkr_id);

DROP TEMPORARY TABLE IF EXISTS tmp_seed_players;
CREATE TEMPORARY TABLE tmp_seed_players (
  full_name VARCHAR(120) NOT NULL,
  role ENUM('WK','BAT','AR','BOWL') NOT NULL,
  short_name VARCHAR(10) NOT NULL,
  credit_price DECIMAL(5,1) NOT NULL
);

-- Credits are performance-tiered for current form: 10.0 elite, 9.0-9.5 strong, 8.0-8.5 stable, 7.0-7.5 developing.
INSERT INTO tmp_seed_players (full_name, role, short_name, credit_price) VALUES
('Shubman Gill', 'BAT', 'IND', 10.0),
('Yashasvi Jaiswal', 'BAT', 'IND', 9.5),
('KL Rahul', 'WK', 'IND', 9.0),
('Rishabh Pant', 'WK', 'IND', 9.5),
('Sanju Samson', 'WK', 'IND', 8.5),
('Tilak Varma', 'BAT', 'IND', 8.5),
('Axar Patel', 'AR', 'IND', 8.5),
('Kuldeep Yadav', 'BOWL', 'IND', 8.5),
('Arshdeep Singh', 'BOWL', 'IND', 8.0),
('Ravichandran Ashwin', 'AR', 'IND', 8.0),
('Pat Cummins', 'BOWL', 'AUS', 9.5),
('Josh Hazlewood', 'BOWL', 'AUS', 9.0),
('Adam Zampa', 'BOWL', 'AUS', 8.5),
('Travis Head', 'BAT', 'AUS', 9.5),
('Steve Smith', 'BAT', 'AUS', 8.5),
('Marnus Labuschagne', 'BAT', 'AUS', 8.0),
('Josh Inglis', 'WK', 'AUS', 8.5),
('Alex Carey', 'WK', 'AUS', 8.0),
('Marcus Stoinis', 'AR', 'AUS', 8.5),
('Cameron Green', 'AR', 'AUS', 8.5),
('Jos Buttler', 'WK', 'ENG', 9.5),
('Jonny Bairstow', 'WK', 'ENG', 8.5),
('Ben Stokes', 'AR', 'ENG', 9.0),
('Moeen Ali', 'AR', 'ENG', 8.5),
('Sam Curran', 'AR', 'ENG', 8.5),
('Harry Brook', 'BAT', 'ENG', 9.0),
('Joe Root', 'BAT', 'ENG', 9.0),
('Dawid Malan', 'BAT', 'ENG', 8.0),
('Jofra Archer', 'BOWL', 'ENG', 8.5),
('Adil Rashid', 'BOWL', 'ENG', 8.0),
('Rohit Paudel', 'BAT', 'NEP', 8.0),
('Aasif Sheikh', 'WK', 'NEP', 7.5),
('Kushal Bhurtel', 'BAT', 'NEP', 7.5),
('Kushal Malla', 'AR', 'NEP', 8.0),
('Dipendra Singh Airee', 'AR', 'NEP', 8.5),
('Gulshan Jha', 'AR', 'NEP', 7.5),
('Sompal Kami', 'BOWL', 'NEP', 7.5),
('Karan KC', 'BOWL', 'NEP', 8.0),
('Sandeep Lamichhane', 'BOWL', 'NEP', 8.5),
('Lalit Rajbanshi', 'BOWL', 'NEP', 7.0),
('Kane Williamson', 'BAT', 'NZ', 9.0),
('Rachin Ravindra', 'AR', 'NZ', 9.0),
('Daryl Mitchell', 'AR', 'NZ', 8.5),
('Glenn Phillips', 'WK', 'NZ', 8.5),
('Tom Latham', 'WK', 'NZ', 8.0),
('Devon Conway', 'BAT', 'NZ', 8.5),
('Finn Allen', 'BAT', 'NZ', 8.0),
('Mitchell Santner', 'AR', 'NZ', 8.5),
('Trent Boult', 'BOWL', 'NZ', 9.0),
('Tim Southee', 'BOWL', 'NZ', 8.0),
('Quinton de Kock', 'WK', 'SA', 9.0),
('Heinrich Klaasen', 'WK', 'SA', 9.0),
('Aiden Markram', 'BAT', 'SA', 8.5),
('David Miller', 'BAT', 'SA', 8.5),
('Rassie van der Dussen', 'BAT', 'SA', 8.0),
('Marco Jansen', 'AR', 'SA', 8.5),
('Andile Phehlukwayo', 'AR', 'SA', 7.5),
('Kagiso Rabada', 'BOWL', 'SA', 9.5),
('Anrich Nortje', 'BOWL', 'SA', 8.5),
('Keshav Maharaj', 'BOWL', 'SA', 8.0),
('Babar Azam', 'BAT', 'PAK', 9.5),
('Mohammad Rizwan', 'WK', 'PAK', 9.5),
('Fakhar Zaman', 'BAT', 'PAK', 8.5),
('Saim Ayub', 'BAT', 'PAK', 8.0),
('Iftikhar Ahmed', 'AR', 'PAK', 7.5),
('Shadab Khan', 'AR', 'PAK', 8.5),
('Imad Wasim', 'AR', 'PAK', 8.0),
('Shaheen Afridi', 'BOWL', 'PAK', 9.5),
('Haris Rauf', 'BOWL', 'PAK', 8.5),
('Naseem Shah', 'BOWL', 'PAK', 8.5),
('Litton Das', 'WK', 'BAN', 8.0),
('Najmul Hossain Shanto', 'BAT', 'BAN', 8.0),
('Towhid Hridoy', 'BAT', 'BAN', 7.5),
('Soumya Sarkar', 'AR', 'BAN', 7.5),
('Shakib Al Hasan', 'AR', 'BAN', 9.0),
('Mehidy Hasan Miraz', 'AR', 'BAN', 8.5),
('Mahmudullah', 'AR', 'BAN', 7.5),
('Mustafizur Rahman', 'BOWL', 'BAN', 8.5),
('Taskin Ahmed', 'BOWL', 'BAN', 8.0),
('Shoriful Islam', 'BOWL', 'BAN', 7.5),
('Kusal Mendis', 'WK', 'SL', 8.5),
('Pathum Nissanka', 'BAT', 'SL', 8.5),
('Charith Asalanka', 'BAT', 'SL', 8.0),
('Sadeera Samarawickrama', 'WK', 'SL', 7.5),
('Wanindu Hasaranga', 'AR', 'SL', 9.0),
('Dasun Shanaka', 'AR', 'SL', 8.0),
('Dunith Wellalage', 'AR', 'SL', 8.0),
('Maheesh Theekshana', 'BOWL', 'SL', 8.5),
('Dushmantha Chameera', 'BOWL', 'SL', 8.0),
('Nuwan Thushara', 'BOWL', 'SL', 7.5),
('Rahmanullah Gurbaz', 'WK', 'AFG', 8.5),
('Ibrahim Zadran', 'BAT', 'AFG', 8.0),
('Rahmat Shah', 'BAT', 'AFG', 7.5),
('Najibullah Zadran', 'BAT', 'AFG', 7.5),
('Mohammad Nabi', 'AR', 'AFG', 8.5),
('Azmatullah Omarzai', 'AR', 'AFG', 8.5),
('Rashid Khan', 'AR', 'AFG', 10.0),
('Mujeeb Ur Rahman', 'BOWL', 'AFG', 8.5),
('Fazalhaq Farooqi', 'BOWL', 'AFG', 8.0),
('Naveen ul Haq', 'BOWL', 'AFG', 8.0),
('Nicholas Pooran', 'WK', 'WI', 9.0),
('Shai Hope', 'WK', 'WI', 8.0),
('Brandon King', 'BAT', 'WI', 8.0),
('Kyle Mayers', 'AR', 'WI', 8.0),
('Rovman Powell', 'BAT', 'WI', 8.0),
('Shimron Hetmyer', 'BAT', 'WI', 8.0),
('Andre Russell', 'AR', 'WI', 9.0),
('Jason Holder', 'AR', 'WI', 8.5),
('Akeal Hosein', 'BOWL', 'WI', 8.0),
('Alzarri Joseph', 'BOWL', 'WI', 8.5),
('Paul Stirling', 'BAT', 'IRE', 8.0),
('Andrew Balbirnie', 'BAT', 'IRE', 7.5),
('Harry Tector', 'BAT', 'IRE', 8.0),
('Lorcan Tucker', 'WK', 'IRE', 7.5),
('George Dockrell', 'AR', 'IRE', 7.5),
('Curtis Campher', 'AR', 'IRE', 8.0),
('Mark Adair', 'AR', 'IRE', 8.0),
('Joshua Little', 'BOWL', 'IRE', 8.0),
('Barry McCarthy', 'BOWL', 'IRE', 7.5),
('Ben White', 'BOWL', 'IRE', 7.0),
('Scott Edwards', 'WK', 'NED', 7.5),
('Max ODowd', 'BAT', 'NED', 7.5),
('Vikramjit Singh', 'BAT', 'NED', 7.0),
('Bas de Leede', 'AR', 'NED', 8.0),
('Teja Nidamanuru', 'BAT', 'NED', 7.0),
('Sybrand Engelbrecht', 'AR', 'NED', 7.5),
('Roelof van der Merwe', 'AR', 'NED', 7.5),
('Logan van Beek', 'BOWL', 'NED', 7.5),
('Fred Klaassen', 'BOWL', 'NED', 7.0),
('Aryan Dutt', 'BOWL', 'NED', 7.5);

INSERT INTO players (full_name, role, franchise_id, credit_price, is_active, ownership_percent)
SELECT
  tsp.full_name,
  tsp.role,
  f.id,
  tsp.credit_price,
  1,
  ROUND(LEAST(88.0, GREATEST(6.0, (tsp.credit_price - 6.5) * 14.0)), 2)
FROM tmp_seed_players tsp
JOIN franchises f ON f.short_name = tsp.short_name
WHERE NOT EXISTS (
  SELECT 1
  FROM players p
  WHERE p.full_name = tsp.full_name AND p.franchise_id = f.id
);

DROP TEMPORARY TABLE IF EXISTS tmp_seed_players;

SET @ishan_id = (SELECT id FROM players WHERE full_name = 'Ishan Kishan' AND franchise_id = @mi_id LIMIT 1);
SET @rohit_id = (SELECT id FROM players WHERE full_name = 'Rohit Sharma' AND franchise_id = @mi_id LIMIT 1);
SET @sky_id = (SELECT id FROM players WHERE full_name = 'Suryakumar Yadav' AND franchise_id = @mi_id LIMIT 1);
SET @hardik_id = (SELECT id FROM players WHERE full_name = 'Hardik Pandya' AND franchise_id = @mi_id LIMIT 1);
SET @bumrah_id = (SELECT id FROM players WHERE full_name = 'Jasprit Bumrah' AND franchise_id = @mi_id LIMIT 1);
SET @dhoni_id = (SELECT id FROM players WHERE full_name = 'MS Dhoni' AND franchise_id = @csk_id LIMIT 1);
SET @ruturaj_id = (SELECT id FROM players WHERE full_name = 'Ruturaj Gaikwad' AND franchise_id = @csk_id LIMIT 1);
SET @dube_id = (SELECT id FROM players WHERE full_name = 'Shivam Dube' AND franchise_id = @csk_id LIMIT 1);
SET @jadeja_id = (SELECT id FROM players WHERE full_name = 'Ravindra Jadeja' AND franchise_id = @csk_id LIMIT 1);
SET @pathirana_id = (SELECT id FROM players WHERE full_name = 'Matheesha Pathirana' AND franchise_id = @csk_id LIMIT 1);
SET @dk_id = (SELECT id FROM players WHERE full_name = 'Dinesh Karthik' AND franchise_id = @rcb_id LIMIT 1);
SET @kohli_id = (SELECT id FROM players WHERE full_name = 'Virat Kohli' AND franchise_id = @rcb_id LIMIT 1);
SET @patidar_id = (SELECT id FROM players WHERE full_name = 'Rajat Patidar' AND franchise_id = @rcb_id LIMIT 1);
SET @maxwell_id = (SELECT id FROM players WHERE full_name = 'Glenn Maxwell' AND franchise_id = @rcb_id LIMIT 1);
SET @siraj_id = (SELECT id FROM players WHERE full_name = 'Mohammed Siraj' AND franchise_id = @rcb_id LIMIT 1);
SET @salt_id = (SELECT id FROM players WHERE full_name = 'Phil Salt' AND franchise_id = @kkr_id LIMIT 1);
SET @shreyas_id = (SELECT id FROM players WHERE full_name = 'Shreyas Iyer' AND franchise_id = @kkr_id LIMIT 1);
SET @rinku_id = (SELECT id FROM players WHERE full_name = 'Rinku Singh' AND franchise_id = @kkr_id LIMIT 1);
SET @narine_id = (SELECT id FROM players WHERE full_name = 'Sunil Narine' AND franchise_id = @kkr_id LIMIT 1);
SET @starc_id = (SELECT id FROM players WHERE full_name = 'Mitchell Starc' AND franchise_id = @kkr_id LIMIT 1);

INSERT INTO fixtures (home_franchise_id, away_franchise_id, venue, starts_at, toss_at, lock_at, status, winner_franchise_id, motm_player_id)
SELECT @mi_id, @csk_id, 'Wankhede Stadium', '2026-04-02 19:30:00', '2026-04-02 19:00:00', '2026-04-02 18:30:00', 'SCHEDULED', NULL, NULL
FROM DUAL
WHERE NOT EXISTS (SELECT 1 FROM fixtures WHERE venue = 'Wankhede Stadium' AND starts_at = '2026-04-02 19:30:00');

INSERT INTO fixtures (home_franchise_id, away_franchise_id, venue, starts_at, toss_at, lock_at, status, winner_franchise_id, motm_player_id)
SELECT @rcb_id, @kkr_id, 'M. Chinnaswamy Stadium', '2026-04-03 19:30:00', '2026-04-03 19:00:00', '2026-04-03 18:30:00', 'LIVE', @kkr_id, @narine_id
FROM DUAL
WHERE NOT EXISTS (SELECT 1 FROM fixtures WHERE venue = 'M. Chinnaswamy Stadium' AND starts_at = '2026-04-03 19:30:00');

INSERT INTO fixtures (home_franchise_id, away_franchise_id, venue, starts_at, toss_at, lock_at, status, winner_franchise_id, motm_player_id)
SELECT @csk_id, @rcb_id, 'MA Chidambaram Stadium', '2026-04-05 15:30:00', '2026-04-05 15:00:00', '2026-04-05 14:30:00', 'COMPLETED', @csk_id, @jadeja_id
FROM DUAL
WHERE NOT EXISTS (SELECT 1 FROM fixtures WHERE venue = 'MA Chidambaram Stadium' AND starts_at = '2026-04-05 15:30:00');

SET @fixture_1_id = (SELECT id FROM fixtures WHERE venue = 'Wankhede Stadium' AND starts_at = '2026-04-02 19:30:00' LIMIT 1);
SET @fixture_2_id = (SELECT id FROM fixtures WHERE venue = 'M. Chinnaswamy Stadium' AND starts_at = '2026-04-03 19:30:00' LIMIT 1);
SET @fixture_3_id = (SELECT id FROM fixtures WHERE venue = 'MA Chidambaram Stadium' AND starts_at = '2026-04-05 15:30:00' LIMIT 1);
SET @manager1_id = (SELECT id FROM users WHERE email = 'manager1@newfpl.local' LIMIT 1);
SET @manager2_id = (SELECT id FROM users WHERE email = 'manager2@newfpl.local' LIMIT 1);
SET @admin_id = (SELECT id FROM users WHERE email = 'admin@newfpl.local' LIMIT 1);

INSERT INTO manager_squads (
  user_id, fixture_id, budget_cap, total_spent, transfers_used, free_transfers,
  transfer_penalty_points, captain_player_id, vice_captain_player_id, impact_player_id,
  booster, is_locked, points_total, rank_global
)
SELECT @manager1_id, @fixture_1_id, 100.0, 98.0, 1, 2, 0, @sky_id, @jadeja_id, @hardik_id, 'NONE', 0, 0, 1
FROM DUAL
WHERE NOT EXISTS (SELECT 1 FROM manager_squads WHERE user_id = @manager1_id AND fixture_id = @fixture_1_id);

INSERT INTO manager_squads (
  user_id, fixture_id, budget_cap, total_spent, transfers_used, free_transfers,
  transfer_penalty_points, captain_player_id, vice_captain_player_id, impact_player_id,
  booster, is_locked, points_total, rank_global
)
SELECT @manager2_id, @fixture_1_id, 100.0, 97.5, 2, 2, 0, @ruturaj_id, @bumrah_id, @dube_id, 'TRIPLE_CAPTAIN', 0, 0, 2
FROM DUAL
WHERE NOT EXISTS (SELECT 1 FROM manager_squads WHERE user_id = @manager2_id AND fixture_id = @fixture_1_id);

INSERT INTO manager_squads (
  user_id, fixture_id, budget_cap, total_spent, transfers_used, free_transfers,
  transfer_penalty_points, captain_player_id, vice_captain_player_id, impact_player_id,
  booster, is_locked, points_total, rank_global
)
SELECT @manager1_id, @fixture_2_id, 100.0, 96.5, 0, 2, 0, @kohli_id, @narine_id, @maxwell_id, 'NONE', 0, 54.5, 1
FROM DUAL
WHERE NOT EXISTS (SELECT 1 FROM manager_squads WHERE user_id = @manager1_id AND fixture_id = @fixture_2_id);

INSERT INTO manager_squads (
  user_id, fixture_id, budget_cap, total_spent, transfers_used, free_transfers,
  transfer_penalty_points, captain_player_id, vice_captain_player_id, impact_player_id,
  booster, is_locked, points_total, rank_global
)
SELECT @manager2_id, @fixture_3_id, 100.0, 95.0, 1, 2, 0, @jadeja_id, @kohli_id, @siraj_id, 'NONE', 1, 88.0, 1
FROM DUAL
WHERE NOT EXISTS (SELECT 1 FROM manager_squads WHERE user_id = @manager2_id AND fixture_id = @fixture_3_id);

SET @squad_f1_m1 = (SELECT id FROM manager_squads WHERE user_id = @manager1_id AND fixture_id = @fixture_1_id LIMIT 1);
SET @squad_f1_m2 = (SELECT id FROM manager_squads WHERE user_id = @manager2_id AND fixture_id = @fixture_1_id LIMIT 1);
SET @squad_f2_m1 = (SELECT id FROM manager_squads WHERE user_id = @manager1_id AND fixture_id = @fixture_2_id LIMIT 1);
SET @squad_f3_m2 = (SELECT id FROM manager_squads WHERE user_id = @manager2_id AND fixture_id = @fixture_3_id LIMIT 1);

INSERT IGNORE INTO manager_squad_players (squad_id, player_id, is_starting_xi) VALUES
(@squad_f1_m1, @ishan_id, 1), (@squad_f1_m1, @rohit_id, 1), (@squad_f1_m1, @sky_id, 1), (@squad_f1_m1, @hardik_id, 1), (@squad_f1_m1, @bumrah_id, 1), (@squad_f1_m1, @dhoni_id, 1), (@squad_f1_m1, @ruturaj_id, 1), (@squad_f1_m1, @dube_id, 1), (@squad_f1_m1, @jadeja_id, 1), (@squad_f1_m1, @pathirana_id, 1), (@squad_f1_m1, @kohli_id, 1),
(@squad_f1_m2, @ishan_id, 1), (@squad_f1_m2, @rohit_id, 1), (@squad_f1_m2, @sky_id, 1), (@squad_f1_m2, @hardik_id, 1), (@squad_f1_m2, @bumrah_id, 1), (@squad_f1_m2, @dhoni_id, 1), (@squad_f1_m2, @ruturaj_id, 1), (@squad_f1_m2, @dube_id, 1), (@squad_f1_m2, @jadeja_id, 1), (@squad_f1_m2, @pathirana_id, 1), (@squad_f1_m2, @narine_id, 1),
(@squad_f2_m1, @dk_id, 1), (@squad_f2_m1, @kohli_id, 1), (@squad_f2_m1, @patidar_id, 1), (@squad_f2_m1, @maxwell_id, 1), (@squad_f2_m1, @siraj_id, 1), (@squad_f2_m1, @salt_id, 1), (@squad_f2_m1, @shreyas_id, 1), (@squad_f2_m1, @rinku_id, 1), (@squad_f2_m1, @narine_id, 1), (@squad_f2_m1, @starc_id, 1), (@squad_f2_m1, @jadeja_id, 1),
(@squad_f3_m2, @dhoni_id, 1), (@squad_f3_m2, @ruturaj_id, 1), (@squad_f3_m2, @dube_id, 1), (@squad_f3_m2, @jadeja_id, 1), (@squad_f3_m2, @pathirana_id, 1), (@squad_f3_m2, @dk_id, 1), (@squad_f3_m2, @kohli_id, 1), (@squad_f3_m2, @patidar_id, 1), (@squad_f3_m2, @maxwell_id, 1), (@squad_f3_m2, @siraj_id, 1), (@squad_f3_m2, @hardik_id, 1);

INSERT INTO boosters_usage (user_id, season, booster, used_in_fixture_id)
SELECT @manager2_id, 'IPL2026', 'TRIPLE_CAPTAIN', @fixture_1_id
FROM DUAL
WHERE NOT EXISTS (
  SELECT 1 FROM boosters_usage WHERE user_id = @manager2_id AND season = 'IPL2026' AND booster = 'TRIPLE_CAPTAIN'
);

INSERT INTO player_live_stats (
  fixture_id, player_id, franchise_id, runs, fours, sixes, balls_faced,
  is_duck, wickets, maidens, economy_rate, three_wicket_haul, catches,
  stumpings, direct_hit_runouts, dropped_catches
) VALUES
(@fixture_1_id, @sky_id, @mi_id, 72, 8, 3, 47, 0, 0, 0, 0.00, 0, 1, 0, 0, 0),
(@fixture_1_id, @bumrah_id, @mi_id, 3, 0, 0, 4, 0, 2, 1, 5.50, 0, 0, 0, 0, 0),
(@fixture_1_id, @ruturaj_id, @csk_id, 58, 6, 2, 41, 0, 0, 0, 0.00, 0, 0, 0, 0, 0),
(@fixture_1_id, @jadeja_id, @csk_id, 24, 1, 1, 17, 0, 1, 0, 6.75, 0, 2, 0, 1, 0),
(@fixture_2_id, @kohli_id, @rcb_id, 81, 9, 2, 52, 0, 0, 0, 0.00, 0, 0, 0, 0, 0),
(@fixture_2_id, @siraj_id, @rcb_id, 4, 0, 0, 6, 0, 1, 0, 8.25, 0, 1, 0, 0, 0),
(@fixture_2_id, @narine_id, @kkr_id, 33, 2, 2, 18, 0, 3, 1, 5.75, 1, 1, 0, 0, 0),
(@fixture_2_id, @starc_id, @kkr_id, 6, 0, 0, 5, 0, 2, 0, 7.10, 0, 0, 0, 0, 0),
(@fixture_3_id, @jadeja_id, @csk_id, 41, 3, 2, 24, 0, 2, 0, 6.20, 0, 2, 0, 0, 0),
(@fixture_3_id, @pathirana_id, @csk_id, 0, 0, 0, 0, 0, 3, 1, 5.40, 1, 0, 0, 0, 0),
(@fixture_3_id, @kohli_id, @rcb_id, 63, 7, 2, 46, 0, 0, 0, 0.00, 0, 0, 0, 0, 0),
(@fixture_3_id, @siraj_id, @rcb_id, 2, 0, 0, 5, 0, 1, 0, 8.80, 0, 0, 0, 0, 0)
ON DUPLICATE KEY UPDATE
  runs = VALUES(runs),
  fours = VALUES(fours),
  sixes = VALUES(sixes),
  balls_faced = VALUES(balls_faced),
  is_duck = VALUES(is_duck),
  wickets = VALUES(wickets),
  maidens = VALUES(maidens),
  economy_rate = VALUES(economy_rate),
  three_wicket_haul = VALUES(three_wicket_haul),
  catches = VALUES(catches),
  stumpings = VALUES(stumpings),
  direct_hit_runouts = VALUES(direct_hit_runouts),
  dropped_catches = VALUES(dropped_catches),
  updated_at = CURRENT_TIMESTAMP;

INSERT INTO private_leagues (creator_user_id, name, invite_code)
SELECT @manager1_id, 'Office Champions League', 'OFFICE2026'
FROM DUAL
WHERE NOT EXISTS (SELECT 1 FROM private_leagues WHERE invite_code = 'OFFICE2026');

SET @league_id = (SELECT id FROM private_leagues WHERE invite_code = 'OFFICE2026' LIMIT 1);

INSERT IGNORE INTO private_league_members (league_id, user_id)
VALUES (@league_id, @manager1_id), (@league_id, @manager2_id);

INSERT INTO h2h_fixtures (fixture_id, user_a_id, user_b_id, winner_user_id, status)
SELECT @fixture_2_id, @manager1_id, @manager2_id, NULL, 'SCHEDULED'
FROM DUAL
WHERE NOT EXISTS (
  SELECT 1 FROM h2h_fixtures WHERE fixture_id = @fixture_2_id AND user_a_id = @manager1_id AND user_b_id = @manager2_id
);

INSERT INTO predictions (
  fixture_id, user_id, predicted_toss_winner_id, predicted_match_winner_id,
  predicted_motm_player_id, predicted_top_scorer_id, predicted_top_wicket_taker_id, points_earned
)
SELECT @fixture_2_id, @manager1_id, @rcb_id, @kkr_id, @narine_id, @kohli_id, @narine_id, 0
FROM DUAL
WHERE NOT EXISTS (SELECT 1 FROM predictions WHERE fixture_id = @fixture_2_id AND user_id = @manager1_id);

INSERT INTO quiz_questions (
  fixture_id, question_text, option_a, option_b, option_c, option_d,
  correct_option, starts_at, ends_at, points
)
SELECT @fixture_2_id, 'Who will take the most wickets in Bengaluru?', 'Mohammed Siraj', 'Mitchell Starc', 'Sunil Narine', 'Glenn Maxwell', 'C', '2026-04-03 18:00:00', '2026-04-03 19:00:00', 5
FROM DUAL
WHERE NOT EXISTS (
  SELECT 1 FROM quiz_questions WHERE fixture_id = @fixture_2_id AND question_text = 'Who will take the most wickets in Bengaluru?'
);

SET @quiz_id = (
  SELECT id FROM quiz_questions WHERE fixture_id = @fixture_2_id AND question_text = 'Who will take the most wickets in Bengaluru?' LIMIT 1
);

INSERT INTO quiz_answers (question_id, user_id, selected_option, answered_at, is_correct, points_earned)
SELECT @quiz_id, @manager1_id, 'C', '2026-04-03 18:15:00', 1, 5
FROM DUAL
WHERE NOT EXISTS (SELECT 1 FROM quiz_answers WHERE question_id = @quiz_id AND user_id = @manager1_id);

INSERT INTO push_notifications (user_id, type, title, body, is_read)
SELECT @manager1_id, 'DEADLINE_ALERT', 'Bengaluru deadline approaching', 'Your RCB vs KKR squad locks in 30 minutes.', 0
FROM DUAL
WHERE NOT EXISTS (
  SELECT 1 FROM push_notifications WHERE user_id = @manager1_id AND title = 'Bengaluru deadline approaching'
);

INSERT INTO admin_player_price_logs (admin_user_id, player_id, old_price, new_price, reason)
SELECT @admin_id, @narine_id, 9.0, 9.5, 'Promoted up the order and bowling full quota'
FROM DUAL
WHERE NOT EXISTS (
  SELECT 1 FROM admin_player_price_logs WHERE admin_user_id = @admin_id AND player_id = @narine_id AND reason = 'Promoted up the order and bowling full quota'
);

INSERT INTO admin_user_bans (admin_user_id, banned_user_id, reason, starts_at, ends_at, is_active)
SELECT @admin_id, @manager2_id, 'Demo disciplinary action', '2026-04-01 00:00:00', '2026-04-03 00:00:00', 0
FROM DUAL
WHERE NOT EXISTS (
  SELECT 1 FROM admin_user_bans WHERE admin_user_id = @admin_id AND banned_user_id = @manager2_id AND reason = 'Demo disciplinary action'
);

INSERT INTO dream_teams (fixture_id, generated_at, total_points)
SELECT @fixture_3_id, '2026-04-05 22:45:00', 139.5
FROM DUAL
WHERE NOT EXISTS (SELECT 1 FROM dream_teams WHERE fixture_id = @fixture_3_id);

SET @dream_team_id = (SELECT id FROM dream_teams WHERE fixture_id = @fixture_3_id LIMIT 1);

INSERT IGNORE INTO dream_team_players (dream_team_id, player_id, role) VALUES
(@dream_team_id, @dhoni_id, 'WK'),
(@dream_team_id, @ruturaj_id, 'BAT'),
(@dream_team_id, @kohli_id, 'BAT'),
(@dream_team_id, @patidar_id, 'BAT'),
(@dream_team_id, @sky_id, 'BAT'),
(@dream_team_id, @jadeja_id, 'AR'),
(@dream_team_id, @hardik_id, 'AR'),
(@dream_team_id, @pathirana_id, 'BOWL'),
(@dream_team_id, @siraj_id, 'BOWL'),
(@dream_team_id, @bumrah_id, 'BOWL'),
(@dream_team_id, @starc_id, 'BOWL');

INSERT INTO ai_recommendations (fixture_id, player_id, reason, confidence_score)
SELECT @fixture_2_id, @narine_id, 'Dual scoring upside with powerplay bowling and pinch-hitting role', 89.40
FROM DUAL
WHERE NOT EXISTS (SELECT 1 FROM ai_recommendations WHERE fixture_id = @fixture_2_id AND player_id = @narine_id);

SELECT 'franchises' AS table_name, COUNT(*) AS total FROM franchises
UNION ALL
SELECT 'players', COUNT(*) FROM players
UNION ALL
SELECT 'fixtures', COUNT(*) FROM fixtures
UNION ALL
SELECT 'manager_squads', COUNT(*) FROM manager_squads
UNION ALL
SELECT 'manager_squad_players', COUNT(*) FROM manager_squad_players
UNION ALL
SELECT 'player_live_stats', COUNT(*) FROM player_live_stats
UNION ALL
SELECT 'private_leagues', COUNT(*) FROM private_leagues
UNION ALL
SELECT 'private_league_members', COUNT(*) FROM private_league_members
UNION ALL
SELECT 'predictions', COUNT(*) FROM predictions
UNION ALL
SELECT 'quiz_questions', COUNT(*) FROM quiz_questions
UNION ALL
SELECT 'quiz_answers', COUNT(*) FROM quiz_answers
UNION ALL
SELECT 'push_notifications', COUNT(*) FROM push_notifications
UNION ALL
SELECT 'dream_teams', COUNT(*) FROM dream_teams
UNION ALL
SELECT 'dream_team_players', COUNT(*) FROM dream_team_players
UNION ALL
SELECT 'ai_recommendations', COUNT(*) FROM ai_recommendations;
