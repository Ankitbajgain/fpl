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
docker exec -i new-fpl-mysql mysql -uroot -proot new_fpl < database/schema.sql
```

## Consolidated Database Script

The database SQL files have been consolidated into a single script:

1. Base schema
2. Demo seed data
3. Multi-league seed data
4. Transfer policy setup
5. Duplicate cleanup and nationality backfill
6. Leaderboard migrations and sample leaderboard data
7. Transfer-window testing date shifts

```bash
cd backend
docker exec -i new-fpl-mysql mysql -uroot -proot new_fpl < database/schema.sql
```

If you are starting fresh with Docker, the MySQL container also initializes from `database/schema.sql` automatically.

## Included Sections

The consolidated script includes the previously separate maintenance and demo sections:

- multi-league player seeding
- duplicate player cleanup
- transfer policy setup
- player nationality backfill
- leaderboard compatibility migrations
- PSL leaderboard demo data
- realistic IPL leaderboard scenarios
- match-date shifting for transfer-window testing

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
