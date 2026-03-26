USE new_fpl;

SET @league := 'PSL_2025';
SET @f1 := (SELECT id FROM fixtures WHERE league_season_id=@league ORDER BY starts_at ASC LIMIT 1);
SET @f2 := (SELECT id FROM fixtures WHERE league_season_id=@league ORDER BY starts_at ASC LIMIT 1 OFFSET 1);

SET @mi := (SELECT id FROM franchises WHERE short_name='MI' LIMIT 1);
SET @kkr := (SELECT id FROM franchises WHERE short_name='KKR' LIMIT 1);
SET @rcb := (SELECT id FROM franchises WHERE short_name='RCB' LIMIT 1);
SET @csk := (SELECT id FROM franchises WHERE short_name='CSK' LIMIT 1);

SET @sky := (SELECT id FROM players WHERE full_name='Suryakumar Yadav' LIMIT 1);
SET @narine := (SELECT id FROM players WHERE full_name='Sunil Narine' LIMIT 1);
SET @ishan := (SELECT id FROM players WHERE full_name='Ishan Kishan' LIMIT 1);
SET @rohit := (SELECT id FROM players WHERE full_name='Rohit Sharma' LIMIT 1);
SET @hardik := (SELECT id FROM players WHERE full_name='Hardik Pandya' LIMIT 1);
SET @bumrah := (SELECT id FROM players WHERE full_name='Jasprit Bumrah' LIMIT 1);
SET @ruturaj := (SELECT id FROM players WHERE full_name='Ruturaj Gaikwad' LIMIT 1);
SET @jadeja := (SELECT id FROM players WHERE full_name='Ravindra Jadeja' LIMIT 1);
SET @dube := (SELECT id FROM players WHERE full_name='Shivam Dube' LIMIT 1);
SET @pathirana := (SELECT id FROM players WHERE full_name='Matheesha Pathirana' LIMIT 1);
SET @kohli := (SELECT id FROM players WHERE full_name='Virat Kohli' LIMIT 1);
SET @patidar := (SELECT id FROM players WHERE full_name='Rajat Patidar' LIMIT 1);
SET @maxwell := (SELECT id FROM players WHERE full_name='Glenn Maxwell' LIMIT 1);
SET @siraj := (SELECT id FROM players WHERE full_name='Mohammed Siraj' LIMIT 1);
SET @salt := (SELECT id FROM players WHERE full_name='Phil Salt' LIMIT 1);
SET @shreyas := (SELECT id FROM players WHERE full_name='Shreyas Iyer' LIMIT 1);
SET @rinku := (SELECT id FROM players WHERE full_name='Rinku Singh' LIMIT 1);
SET @starc := (SELECT id FROM players WHERE full_name='Mitchell Starc' LIMIT 1);

UPDATE fixtures
SET status='COMPLETED', match_type='T20', winner_franchise_id=@mi, motm_player_id=@sky,
    ended_at=DATE_SUB(NOW(), INTERVAL 5 DAY), transfer_window_opens_at=DATE_SUB(NOW(), INTERVAL 4 DAY),
    points_finalized_at=DATE_SUB(NOW(), INTERVAL 4 DAY)
WHERE id=@f1;

UPDATE fixtures
SET status='COMPLETED', match_type='T20', winner_franchise_id=@kkr, motm_player_id=@narine,
    ended_at=DATE_SUB(NOW(), INTERVAL 3 DAY), transfer_window_opens_at=DATE_SUB(NOW(), INTERVAL 3 DAY),
    points_finalized_at=DATE_SUB(NOW(), INTERVAL 3 DAY)
WHERE id=@f2;

INSERT INTO player_live_stats (
  fixture_id, player_id, franchise_id, runs, fours, sixes, balls_faced, is_duck,
  wickets, maidens, economy_rate, three_wicket_haul, catches, stumpings,
  direct_hit_runouts, dropped_catches, fantasy_points
) VALUES
(@f1,@sky,@mi,78,9,2,52,0,0,0,0,0,1,0,0,0,68.0),
(@f1,@rohit,@mi,44,5,1,31,0,0,0,0,0,0,0,0,0,34.5),
(@f1,@hardik,@mi,27,2,1,18,0,1,0,7.2,0,1,0,0,0,44.0),
(@f1,@bumrah,@mi,2,0,0,3,0,3,1,5.2,1,0,0,0,0,70.0),
(@f1,@ruturaj,@csk,57,6,2,42,0,0,0,0,0,0,0,0,0,51.0),
(@f1,@jadeja,@csk,22,1,1,17,0,2,0,6.8,0,2,0,1,0,58.0),
(@f1,@dube,@csk,31,2,2,19,0,0,0,0,0,0,0,0,1,26.5),
(@f1,@pathirana,@csk,0,0,0,0,0,2,0,7.9,0,0,0,0,0,28.0),
(@f2,@kohli,@rcb,83,10,2,55,0,0,0,0,0,0,0,0,0,70.0),
(@f2,@patidar,@rcb,28,3,1,20,0,0,0,0,0,0,0,0,0,24.0),
(@f2,@maxwell,@rcb,21,1,2,14,0,1,0,7.5,0,1,0,0,1,31.5),
(@f2,@siraj,@rcb,3,0,0,4,0,1,0,8.3,0,0,0,0,0,16.0),
(@f2,@salt,@kkr,37,4,2,22,0,0,0,0,0,1,0,0,0,34.5),
(@f2,@shreyas,@kkr,49,5,1,33,0,0,0,0,0,0,0,0,0,42.0),
(@f2,@rinku,@kkr,32,2,2,19,0,0,0,0,0,1,0,0,0,29.5),
(@f2,@narine,@kkr,36,3,2,20,0,3,1,5.6,1,1,0,0,0,86.0),
(@f2,@starc,@kkr,4,0,0,6,0,2,0,6.9,0,0,0,0,0,29.0)
ON DUPLICATE KEY UPDATE
  runs=VALUES(runs), fours=VALUES(fours), sixes=VALUES(sixes), balls_faced=VALUES(balls_faced),
  is_duck=VALUES(is_duck), wickets=VALUES(wickets), maidens=VALUES(maidens), economy_rate=VALUES(economy_rate),
  three_wicket_haul=VALUES(three_wicket_haul), catches=VALUES(catches), stumpings=VALUES(stumpings),
  direct_hit_runouts=VALUES(direct_hit_runouts), dropped_catches=VALUES(dropped_catches),
  fantasy_points=VALUES(fantasy_points), updated_at=CURRENT_TIMESTAMP;

SELECT f.id, f.status, f.points_finalized_at, COUNT(pls.player_id) AS stats_rows
FROM fixtures f LEFT JOIN player_live_stats pls ON pls.fixture_id=f.id
WHERE f.league_season_id=@league
GROUP BY f.id, f.status, f.points_finalized_at
ORDER BY f.id;
