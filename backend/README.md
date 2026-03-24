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
- API reference: `/api/v1/api-reference`

## Seed Demo Data

```bash
cd backend
docker exec -i new-fpl-mysql mysql -uroot -proot new_fpl < database/demo-seed.sql
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
