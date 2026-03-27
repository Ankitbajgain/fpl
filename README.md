# New FPL Monorepo

Fantasy-cricket monorepo with separate apps for API, manager UI, and admin UI.

## Apps

- Backend API: [backend](backend)
- Manager Frontend: [frontend](frontend)
- Admin Dashboard: [dashboard](dashboard)
- Codebase notes: [CODEBASE_OVERVIEW.md](CODEBASE_OVERVIEW.md)

## Key Product Rules

- Multi-league play (`IPL_2025`, `PSL_2025`, `BBL_2025`, `BPL_2025`, `NPL_2025`).
- Private leagues per season with invite code flow.
- Favorite bonus preferences per user + league season:
  - 1 favorite nation: `1.2x` on matching players.
  - 1 favorite league franchise: `1.5x` on matching players.
- Transfer cap rule:
  - `160` total transfers available through Match `70`.
  - Transfers are applied to upcoming fixture only.
  - Window locks `15` minutes before fixture start.
- Join timing behavior:
  - Users joining at any point start with `0` points in that contest.
  - Points are earned from future matches only.

## Quick Start

### 1) Start backend stack (API + MySQL + phpMyAdmin)

```bash
cd backend
docker compose -p new-fpl up -d --build
```

URLs:

- API: `http://localhost:5001`
- phpMyAdmin: `http://localhost:8080`
- MySQL: `localhost:3306`

### 2) Run database script

```bash
cd backend
docker exec -i new-fpl-mysql mysql -uroot -proot new_fpl < database/schema.sql
```

### 3) Start manager frontend

```bash
cd frontend
npm install
npm run dev
```

Manager UI URL:

- `http://localhost:5173`

### 4) Start admin dashboard

```bash
cd dashboard
npm install
npm run dev
```

Dashboard URL:

- `http://localhost:5175`

## Demo Accounts

- Admin: `admin@newfpl.local` / `AdminPass123`
- Manager: `manager1@newfpl.local` / `ManagerPass123`
- Manager: `manager2@newfpl.local` / `ManagerPass123`

Additional manager users are seeded for private-league QA.

## Repository Conventions

- Backend source of truth: [backend](backend)
- Database source of truth: [backend/database/schema.sql](backend/database/schema.sql)
- Use one compose project name (`new-fpl`) to avoid cross-network container issues.

## Troubleshooting

### phpMyAdmin cannot connect to MySQL host `mysql`

Cause is usually split compose projects/networks.

```bash
cd backend
docker compose -p new-fpl up -d --build
docker compose -p new-fpl ps
```

### API route returns 404 after code changes

Rebuild app container:

```bash
cd backend
docker compose -p new-fpl up -d --build app
```

### SQL schema mismatch / missing column/table

```bash
cd backend
docker exec -i new-fpl-mysql mysql -uroot -proot new_fpl < database/schema.sql
```

## Per-App Documentation

- Backend details: [backend/README.md](backend/README.md)
- Frontend details: [frontend/README.md](frontend/README.md)
- Dashboard details: [dashboard/README.md](dashboard/README.md)
