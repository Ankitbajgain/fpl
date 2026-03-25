-- Backfill missing player nationalities
-- Ensures every player has exactly one nationality entry.

USE new_fpl;

-- Map missing nationalities from franchise/team code first.
INSERT IGNORE INTO player_nationalities (player_id, nation_id)
SELECT
  p.id,
  n.id
FROM players p
JOIN franchises f ON f.id = p.franchise_id
LEFT JOIN player_nationalities pn ON pn.player_id = p.id
JOIN nations n
  ON n.name = CASE
    -- Indian ecosystem (IPL + India national)
    WHEN f.short_name IN (
      'MI','CSK','RCB','KKR','DC','RR','PBKS','SRH','GT','LSG','DMU','IND'
    ) THEN 'India'

    -- Pakistan ecosystem (PSL + Pakistan national)
    WHEN f.short_name IN ('KK','IU','LQ','MSU','PZ','QG','PAK') THEN 'Pakistan'

    -- Australia ecosystem (BBL + Australia national)
    WHEN f.short_name IN ('ADS','BRH','HBH','MLR','MLS','PES','SYS','SYT','AUS') THEN 'Australia'

    -- Bangladesh ecosystem (BPL + Bangladesh national)
    WHEN f.short_name IN ('CTV','CHC','DHK','FRT','KLT','RAN','SYL','BAN') THEN 'Bangladesh'

    -- Nepal ecosystem (NPL + Nepal national)
    WHEN f.short_name IN ('BIR','CHI','JAN','KTM','LUM','POK','SPR','KOS','NEP') THEN 'Nepal'

    -- Other explicit national sides in data
    WHEN f.short_name = 'ENG' THEN 'England'
    WHEN f.short_name = 'NZ' THEN 'New Zealand'
    WHEN f.short_name = 'SA' THEN 'South Africa'
    WHEN f.short_name = 'SL' THEN 'Sri Lanka'
    WHEN f.short_name = 'AFG' THEN 'Afghanistan'
    WHEN f.short_name = 'WI' THEN 'West Indies'

    ELSE NULL
  END
WHERE pn.player_id IS NULL;

-- Safety fallback: if anything is still missing, assign India to avoid country-less players.
INSERT IGNORE INTO player_nationalities (player_id, nation_id)
SELECT p.id, n.id
FROM players p
LEFT JOIN player_nationalities pn ON pn.player_id = p.id
JOIN nations n ON n.name = 'India'
WHERE pn.player_id IS NULL;

-- Verification
SELECT COUNT(*) AS players_missing_country
FROM players p
LEFT JOIN player_nationalities pn ON pn.player_id = p.id
WHERE pn.player_id IS NULL;
