# New FPL Frontend

Manager-facing frontend for squad creation, transfers, private leagues, and live leaderboards.

## Stack

- React 19
- Vite 8
- Redux Toolkit + React Redux
- Tailwind CSS 3
- ESLint

## Run

```bash
cd frontend
npm install
npm run dev
```

URL:

- `http://localhost:5173`

Backend requirement:

- API available at `http://localhost:5001`

## Build

```bash
cd frontend
npm run build
npm run preview
```

## Dev Proxy

Configured in [frontend/vite.config.js](vite.config.js):

- `/api` -> `http://localhost:5001`
- `/health` -> `http://localhost:5001`

## Major Features

- Auth login/register/session restore.
- Multi-league selector.
- Fixture selector with upcoming-fixture auto-selection.
- Squad builder with:
	- role limits
	- budget checks
	- away-player constraints
	- captain/vice-captain handling
- Transfer apply flow to upcoming fixture window.
- Private leagues:
	- create
	- join by invite code
	- list and detail
	- standings table
- Favorite bonus preferences panel:
	- choose 1 favorite nation (from all nations)
	- choose 1 favorite franchise (league-scoped)
	- lock-aware UI when setup window closes

## Current Gameplay Rules Reflected in UI

- Favorite nation multiplier: `1.2x`
- Favorite franchise multiplier: `1.5x`
- Transfer pool: up to `160` transfers through Match `70`
- Team setup and transfers are tied to upcoming fixture before lock
- Mid-season joiners can access all features and set up before upcoming match

## Key API Calls Used

- Auth:
	- `POST /api/v1/auth/login`
	- `POST /api/v1/auth/register`
	- `GET /api/v1/auth/me`
- Gameplay:
	- `GET /api/v1/gameplay/leagues`
	- `GET /api/v1/gameplay/leagues/:leagueSeasonId/fixtures`
	- `GET /api/v1/gameplay/leagues/:leagueSeasonId/players`
	- `GET /api/v1/gameplay/leagues/:leagueSeasonId/transfer-window`
	- `GET /api/v1/gameplay/leagues/:leagueSeasonId/leaderboard`
	- `POST /api/v1/gameplay/squad/validate`
	- `POST /api/v1/gameplay/leagues/:leagueSeasonId/fixtures/:fixtureId/squad/apply`
	- `GET /api/v1/gameplay/leagues/:leagueSeasonId/favorites`
	- `PUT /api/v1/gameplay/leagues/:leagueSeasonId/favorites`
- Private leagues:
	- `GET /api/v1/private-leagues`
	- `POST /api/v1/private-leagues`
	- `POST /api/v1/private-leagues/join`
	- `GET /api/v1/private-leagues/:leagueId`
	- `POST /api/v1/private-leagues/:leagueId/leave`

## Project Layout

```txt
frontend/
	src/
		app/store.js
		components/
		features/squad/squadSlice.js
		hooks/useAuth.js
		App.jsx
```

## Demo Credentials

- `manager1@newfpl.local` / `ManagerPass123`
- `manager2@newfpl.local` / `ManagerPass123`

## Troubleshooting

### Route exists in code but FE gets 404

Rebuild backend app container:

```bash
cd backend
docker compose -p new-fpl up -d --build app
```

### Favorites panel says route not found

Backend container is stale. Rebuild app container and refresh browser.

### UI stuck on old fixture

Logout/login or reselect league to force refetch of fixtures and upcoming match.

### Network/auth errors

- Verify backend URL and token in storage.
- Check browser devtools for `401` vs `404` vs CORS/proxy issues.

