# New FPL Admin Dashboard

Admin UI for fixture operations, transfer policy controls, and match-point lifecycle management.

## Stack

- React 19
- Vite 8

## Run

```bash
cd dashboard
npm install
npm run dev
```

URL:

- `http://localhost:5175`

## Backend Dependency

Backend must be up at `http://localhost:5001`:

```bash
cd backend
docker compose -p new-fpl up -d --build
```

## Login

- `admin@newfpl.local` / `AdminPass123`

## Features

- Admin authentication integration.
- League selection and season-specific operations.
- Fixture management:
  - create
  - update
  - delete
- Fixture sync modes:
  - `demo`
  - `payload`
  - `external`
- Transfer policy management for league season.
- Transfer-window visibility for operational monitoring.
- Match points finalization triggers (for leaderboard updates).

## API Groups Used

- `/api/v1/admin/*`
- `/api/v1/gameplay/leagues/*`

## Dev Proxy

Configured in [dashboard/vite.config.js](vite.config.js):

- local dashboard port: `5175`
- `/api` proxied to backend

## Common Admin Flow

1. Login as admin.
2. Select league season.
3. Manage fixtures or sync fixture data.
4. Update transfer policy if needed.
5. Finalize completed fixture points.
6. Verify manager/player leaderboards update in manager frontend.

## Troubleshooting

### Dashboard loads but API fails

- Ensure backend is running and healthy.
- Confirm proxy target is `http://localhost:5001`.

### New backend route not visible in dashboard

Rebuild app container:

```bash
cd backend
docker compose -p new-fpl up -d --build app
```

### Admin login fails

- Re-run schema/seed script:

```bash
cd backend
docker exec -i new-fpl-mysql mysql -uroot -proot new_fpl < database/schema.sql
```
