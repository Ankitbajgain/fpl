# New FPL Monorepo

Multi-app fantasy cricket workspace with:

- Backend API (Node.js + Express + MySQL)
- Manager Frontend (React + Vite)
- Admin Dashboard (React + Vite)

## Workspace Structure

- Backend API: [backend](backend)
- Manager frontend: [frontend](frontend)
- Admin dashboard: [dashboard](dashboard)
- Architecture notes: [CODEBASE_OVERVIEW.md](CODEBASE_OVERVIEW.md)

The backend source of truth is under [backend](backend).

## Core Features

- Multi-league support (`IPL_2025`, `PSL_2025`, etc.)
- Fantasy points engine (Dream11-style cricket logic)
- Transfer window lifecycle:
	- Match completes
	- 15-minute cooldown
	- Transfer window opens for next fixture
	- Window locks at fixture lock time
- Leaderboards:
	- Player leaderboard (cumulative player points in league)
	- Manager leaderboard (cumulative squad points across finalized matches)
	- Combined endpoint (players + managers in one call)
- Admin workflows:
	- Fixture management (including `match_type`, completion handling)
	- Match stats upsert
	- Points finalization per fixture

## Prerequisites

- Node.js 18+ (22 recommended)
- npm 9+
- Docker + Docker Compose (recommended for backend + MySQL)

## Run Modes

### Local Node (backend only)

```bash
cd backend
npm install
npm run dev
```

Backend URL:

- `http://localhost:5001`

### Docker (recommended backend stack)

```bash
cd backend
docker compose up --build
```

Services:

- API: `http://localhost:5001`
- MySQL: `localhost:3306`
- phpMyAdmin: `http://localhost:8080`

### Frontend

```bash
cd frontend
npm install
npm run dev
```

Frontend URL:

- `http://localhost:5173`

### Dashboard

```bash
cd dashboard
npm install
npm run dev
```

Dashboard URL:

- `http://localhost:5175`

## Database Setup

For a clean local dataset, run SQL in this order.

### Base seed flow

```bash
cd backend
docker exec -i new-fpl-mysql mysql -uroot -proot new_fpl < database/schema.sql
```

`database/schema.sql` is now the single canonical database script. It contains the base schema, all migrations, the demo seed flow, leaderboard seed data, and the transfer-window test updates.

### Included leaderboard setup

The consolidated script already includes the compatibility migration and the newer points-transfer-window/finalization migrations.

```bash
cd backend
docker exec -i new-fpl-mysql mysql -uroot -proot new_fpl < database/schema.sql
```

### Optional realistic leaderboard data

This is also included in the consolidated script:

```bash
cd backend
docker exec -i new-fpl-mysql mysql -uroot -proot new_fpl < database/schema.sql
```

## Demo Accounts

- Admin: `admin@newfpl.local`
- Manager 1: `manager1@newfpl.local`
- Manager 2: `manager2@newfpl.local`
- Manager 3: `manager3@newfpl.local`
- Manager 4: `manager4@newfpl.local`

Password for manager demo users is set by seed scripts (default used in smoke checks: `ManagerPass123`).

## Leaderboard APIs

All gameplay routes require bearer auth.

### Player leaderboard

`GET /api/v1/gameplay/leagues/:leagueSeasonId/leaderboard/players?limit=10`

Returns cumulative player fantasy points for finalized matches in the league.

### Manager leaderboard

`GET /api/v1/gameplay/leagues/:leagueSeasonId/leaderboard/managers?limit=10`

Returns cumulative manager points where:

- Each fixture contributes `manager_squads.points_total`
- Total is `SUM(points_total)` across finalized matches
- Example: 500 in match 1 + 450 in match 2 = 950 cumulative

### Combined leaderboard

`GET /api/v1/gameplay/leagues/:leagueSeasonId/leaderboard?playersLimit=10&managersLimit=10`

Returns a single payload:

- `players`: player leaderboard rows
- `managers`: manager leaderboard rows
- `generatedAt`: ISO timestamp

## Transfer Window + Finalization Flow

Expected production flow:

1. Fixture status changes to `COMPLETED` and `ended_at` is set.
2. Next fixture gets `transfer_window_opens_at = ended_at + 15 minutes`.
3. During cooldown, points are finalized.
4. Leaderboards update from finalized data.
5. Transfer window opens for the next fixture.

## Smoke Test

Run smoke checks once backend is up:

```bash
cd backend
npm run smoke:multi-league
```

Override target env if needed:

```bash
SMOKE_BASE_URL=http://localhost:5001 \
SMOKE_EMAIL=manager1@newfpl.local \
SMOKE_PASSWORD=ManagerPass123 \
npm run smoke:multi-league
```

## Troubleshooting

### Route not found for leaderboard

- Rebuild and restart backend container with explicit compose file:

```bash
docker compose -f backend/docker-compose.yml up -d --build app
```

### `Too many requests, please try again later`

- Local compose sets `RATE_LIMIT_DISABLE=1` in app environment.
- If you changed compose/env, restore that value and restart app.

### `Unknown column 'pls.fantasy_points'`

- Re-run the consolidated database script:

```bash
docker exec -i new-fpl-mysql mysql -uroot -proot new_fpl < backend/database/schema.sql
```

### Leaderboard shows no rows

- Ensure the league has fixtures where:
	- `status = COMPLETED`
	- `points_finalized_at IS NOT NULL`
- Ensure matching rows exist in:
	- `player_live_stats` for player leaderboard
	- `manager_squads` for manager leaderboard

## Additional Docs

- Backend details: [backend/README.md](backend/README.md)
- Frontend details: [frontend/README.md](frontend/README.md)
- Dashboard details: [dashboard/README.md](dashboard/README.md)
