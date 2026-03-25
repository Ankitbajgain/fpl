# New FPL Monorepo

This repository contains two separate applications:

- Backend API: [backend](backend)
- Frontend app: [frontend](frontend)
- Admin dashboard app: [dashboard](dashboard)

The backend source of truth is the [backend](backend) directory. There is no supported backend runtime under the repository root.

## Documentation

- Backend documentation: [backend/README.md](backend/README.md)
- Frontend documentation: [frontend/README.md](frontend/README.md)
- Dashboard documentation: [dashboard/README.md](dashboard/README.md)

## Quick Start

### 1) Start backend

```bash
cd backend
npm install
npm run dev
```

Backend URL:

- http://localhost:5001

### 2) Start frontend

```bash
cd frontend
npm install
npm run dev
```

Frontend URL:

- http://localhost:5173

### 3) Start admin dashboard

```bash
cd dashboard
npm install
npm run dev
```

Dashboard URL:

- http://localhost:5175

## Full Stack (Optional)

If using Docker for backend services:

```bash
cd backend
docker compose up --build
```

Then run frontend separately:

```bash
cd frontend
npm run dev
```

## Backend Smoke Test

Run the backend smoke test after booting the API and loading demo data:

```bash
cd backend
npm run smoke:multi-league
```

Optional environment overrides:

```bash
SMOKE_BASE_URL=http://localhost:5001 \
SMOKE_EMAIL=manager1@newfpl.local \
SMOKE_PASSWORD=ManagerPass123 \
npm run smoke:multi-league
```

## Notes

- Frontend dev proxy forwards `/api` calls to backend (`http://localhost:5001`).
- Recommended backend SQL sequence:

```bash
cd backend
docker exec -i new-fpl-mysql mysql -uroot -proot new_fpl < database/demo-seed.sql
docker exec -i new-fpl-mysql mysql -uroot -proot new_fpl < database/seed-real-multi-league.sql
docker exec -i new-fpl-mysql mysql -uroot -proot new_fpl < database/create-transfer-policy.sql
docker exec -i new-fpl-mysql mysql -uroot -proot new_fpl < database/cleanup-duplicate-players.sql
docker exec -i new-fpl-mysql mysql -uroot -proot new_fpl < database/backfill-player-nationalities.sql
```

- Optional maintenance SQL scripts are documented in [backend/README.md](backend/README.md).
