# New FPL Backend

Backend service for the New FPL platform.

This directory is the only supported backend source tree. Make server-side changes here.

## Stack

- Node.js + Express
- MySQL
- JWT auth
- Cron jobs

## Run Locally

```bash
cd backend
npm install
npm run dev
```

Default API URL:

- http://localhost:5001

## Run with Docker

```bash
cd backend
docker compose up --build
```

Default service URLs:

- API: http://localhost:5001
- phpMyAdmin: http://localhost:8080

## API Groups

- Auth: `/api/v1/auth`
- Gameplay: `/api/v1/gameplay`
- Admin dashboard: `/api/v1/admin`
- API reference: `/api/v1/api-reference`

## Seed Demo Data

```bash
cd backend
docker exec -i new-fpl-mysql mysql -uroot -proot new_fpl < database/demo-seed.sql
```

## Recommended Seed Flow

Use this sequence for a clean, consistent local dataset:

1. `demo-seed.sql`
2. `seed-real-multi-league.sql`
3. `create-transfer-policy.sql`
4. `cleanup-duplicate-players.sql`
5. `backfill-player-nationalities.sql`

```bash
cd backend
docker exec -i new-fpl-mysql mysql -uroot -proot new_fpl < database/demo-seed.sql
docker exec -i new-fpl-mysql mysql -uroot -proot new_fpl < database/seed-real-multi-league.sql
docker exec -i new-fpl-mysql mysql -uroot -proot new_fpl < database/create-transfer-policy.sql
docker exec -i new-fpl-mysql mysql -uroot -proot new_fpl < database/cleanup-duplicate-players.sql
docker exec -i new-fpl-mysql mysql -uroot -proot new_fpl < database/backfill-player-nationalities.sql
```

## Optional Maintenance Scripts

### Seed Real Multi-League Players (Cleanup + IPL/PSL/BPL/BBL/NPL)

Removes synthetic `Seed Player ####` rows and seeds real cross-league player mappings with one nationality per player:

```bash
cd backend
docker exec -i new-fpl-mysql mysql -uroot -proot new_fpl < database/seed-real-multi-league.sql
```

### Cleanup Duplicate Players

Merges duplicate player rows (same full_name) into canonical player IDs, remaps references, and enforces unique full_name:

```bash
cd backend
docker exec -i new-fpl-mysql mysql -uroot -proot new_fpl < database/cleanup-duplicate-players.sql
```

### Create Transfer Policies

Creates league-level transfer policy settings used by transfer/meta APIs and admin updates:

```bash
cd backend
docker exec -i new-fpl-mysql mysql -uroot -proot new_fpl < database/create-transfer-policy.sql
```

### Backfill Missing Player Countries

Ensures every player has a nationality entry in `player_nationalities`:

```bash
cd backend
docker exec -i new-fpl-mysql mysql -uroot -proot new_fpl < database/backfill-player-nationalities.sql
```

## Smoke Test

Verify auth and the multi-league endpoints with:

```bash
cd backend
npm run smoke:multi-league
```

Override the base URL or credentials if needed:

```bash
SMOKE_BASE_URL=http://localhost:5001 \
SMOKE_EMAIL=manager1@newfpl.local \
SMOKE_PASSWORD=ManagerPass123 \
npm run smoke:multi-league
```
