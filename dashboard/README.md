# New FPL Admin Dashboard

Admin control panel for managing leagues, fixtures, transfer windows, and transfer policy.

## Features

- Admin login via backend auth
- League selection
- Match 1 transfer-window lock countdown (15-minute pre-start lock)
- Fixture CRUD (create, update, delete)
- Fixture sync modes:
  - `demo` generated schedule
  - `payload` JSON fixtures
  - `external` API URL with `fixtures` array in response
- Transfer policy editor

## Run Locally

```bash
cd dashboard
npm install
npm run dev
```

Default URL:

- http://localhost:5175

## Backend requirement

Backend must be running on `http://localhost:5001`.

```bash
cd backend
docker compose up -d --build
```

## Admin credentials (demo seed)

- Email: `admin@newfpl.local`
- Password: `AdminPass123`

## Notes

- Vite dev proxy forwards `/api` requests to `http://localhost:5001`.
- API routes consumed are under `/api/v1/admin` and `/api/v1/gameplay/leagues`.
