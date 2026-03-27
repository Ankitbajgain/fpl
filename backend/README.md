# New FPL Backend

Backend API for New FPL.

This folder is the server-side source of truth.

## Stack

- Node.js 22+
- Express 4
- MySQL 8.4
- JWT auth
- Cron job for deadline lock operations

## Service URLs

- API: `http://localhost:5001`
- MySQL: `localhost:3306`
- phpMyAdmin: `http://localhost:8080`

## Run

### Docker (recommended)

```bash
cd backend
docker compose -p new-fpl up -d --build
```

### Local Node (without Docker app container)

```bash
cd backend
npm install
npm run dev
```

If running local Node, ensure MySQL is reachable via env config.

## Database

Single canonical SQL script:

- [database/schema.sql](database/schema.sql)

Run/re-run:

```bash
cd backend
docker exec -i new-fpl-mysql mysql -uroot -proot new_fpl < database/schema.sql
```

The script includes:

- schema creation
- migrations
- demo seed users/fixtures
- multi-league seed
- private-league QA seed
- leaderboard compatibility + sample data
- transfer-window date shifting helpers

## Scripts

- `npm run dev` - nodemon server
- `npm run start` - production server
- `npm run smoke:multi-league` - smoke tests

## API Surface

### Auth

- `POST /api/v1/auth/register`
- `POST /api/v1/auth/login`
- `GET /api/v1/auth/me`

### Gameplay

- `GET /api/v1/gameplay/leagues`
- `GET /api/v1/gameplay/leagues/:leagueSeasonId/fixtures`
- `GET /api/v1/gameplay/leagues/:leagueSeasonId/players`
- `POST /api/v1/gameplay/leagues/:leagueSeasonId/fixtures/:fixtureId/squad/apply`
- `GET /api/v1/gameplay/leagues/:leagueSeasonId/transfer-window`
- `GET /api/v1/gameplay/leagues/:leagueSeasonId/leaderboard`
- `GET /api/v1/gameplay/leagues/:leagueSeasonId/leaderboard/players`
- `GET /api/v1/gameplay/leagues/:leagueSeasonId/leaderboard/managers`
- `GET /api/v1/gameplay/leagues/:leagueSeasonId/favorites`
- `PUT /api/v1/gameplay/leagues/:leagueSeasonId/favorites`

### Private Leagues

- `GET /api/v1/private-leagues`
- `POST /api/v1/private-leagues`
- `POST /api/v1/private-leagues/join`
- `GET /api/v1/private-leagues/:leagueId`
- `POST /api/v1/private-leagues/:leagueId/leave`
- `DELETE /api/v1/private-leagues/:leagueId/members/:userId`

### Admin

- Fixtures management, sync, live-stats upsert
- transfer policy updates
- points finalization

## Important Gameplay Rules (Current)

- Favorite bonus:
	- favorite nation match: `1.2x`
	- favorite franchise match: `1.5x`
	- both match: stacked multiplier
- Favorite selections are league-scoped and user-scoped.
- Favorite franchise dropdown is league-specific (for example IPL shows IPL teams only).
- Favorite changes lock after setup window closes.
- Transfer policy:
	- all users get up to `160` transfers through Match `70`
	- transfers are applied to upcoming fixture only
	- transfer window locks 15 minutes before fixture start
- Mid-season join behavior:
	- users can access all features immediately
	- users can create/setup team for upcoming fixture before lock
	- users begin at `0` in any contest and earn from future matches

## Leaderboard and Points Behavior

- `finalizeMatchPoints` computes and persists player/squad fantasy points.
- Manager leaderboard reads cumulative `manager_squads.points_total` for finalized fixtures.
- Private-league standings count points only from fixtures on/after member `joined_at`.

## Smoke Test

```bash
cd backend
npm run smoke:multi-league
```

Override env:

```bash
SMOKE_BASE_URL=http://localhost:5001 \
SMOKE_EMAIL=manager1@newfpl.local \
SMOKE_PASSWORD=ManagerPass123 \
npm run smoke:multi-league
```

## Troubleshooting

### Route not found after code updates

```bash
cd backend
docker compose -p new-fpl up -d --build app
```

### phpMyAdmin "Cannot connect: invalid settings"

Usually a compose-network split. Ensure all containers are in one compose project:

```bash
cd backend
docker compose -p new-fpl up -d --build
docker compose -p new-fpl ps
```

### SQL/column/table errors

```bash
cd backend
docker exec -i new-fpl-mysql mysql -uroot -proot new_fpl < database/schema.sql
```
