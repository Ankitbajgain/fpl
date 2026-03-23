# New FPL Backend (Cricket-First, MySQL-Only)

Backend for a fantasy cricket product inspired by FPL, designed to scale to other sports.

## Stack
- Node.js + Express
- MySQL (phpMyAdmin friendly)
- JWT auth
- Cron jobs for deadline locking

## Current Scope
This repository is now cleaned to a MySQL-only backend and currently focuses on:
- Authentication (register, login, profile)
- Core gameplay rule engine (squad constraints, transfer penalty, boosters, scoring math)
- Gameplay utility APIs
- Deadline locking job
- Full schema to support advanced features

## Project Structure
```txt
.
├── database/
│   └── schema.sql
├── src/
│   ├── app.js
│   ├── config/
│   │   ├── env.js
│   │   ├── index.js
│   │   └── mysql.js
│   ├── jobs/
│   │   └── deadlineLock.job.js
│   ├── middlewares/
│   │   ├── auth.middleware.js
│   │   ├── error.middleware.js
│   │   ├── logger.middleware.js
│   │   └── rateLimiter.middleware.js
│   ├── modules/
│   │   ├── auth/
│   │   │   ├── auth.controller.js
│   │   │   ├── auth.routes.js
│   │   │   └── auth.service.js
│   │   └── gameplay/
│   │       ├── gameplay.controller.js
│   │       ├── gameplay.routes.js
│   │       ├── gameplay.rules.js
│   │       └── gameplay.service.js
│   ├── routes/v1/
│   │   └── index.js
│   └── utils/
│       ├── apiResponse.js
│       ├── AppError.js
│       ├── catchAsync.js
│       └── logger.js
├── .env.example
├── index.js
└── package.json
```

## Setup

### 1) Install dependencies
```bash
npm install
```

## Docker Setup

This project includes a ready-to-run Docker setup for:
- Backend API
- MySQL 8
- phpMyAdmin

Files:
- `Dockerfile`
- `docker-compose.yml`
- `.dockerignore`
- `.env.docker.example`

### Start the full stack
```bash
docker compose up --build
```

If port `5000` is already taken on your machine, this setup exposes the backend on host port `5001` by default.
You can change it by setting `APP_HOST_PORT`.

### Services
- Backend API: `http://localhost:5001`
- Health check: `http://localhost:5001/health`
- phpMyAdmin: `http://localhost:8080`
- MySQL host from local machine: `127.0.0.1:3306`

### Default Docker credentials
- MySQL database: `new_fpl`
- MySQL user: `root`
- MySQL password: `root`
- phpMyAdmin server host: `mysql`

### Notes
- The schema is auto-imported on first MySQL startup from `database/schema.sql`.
- Database files are stored in the Docker volume `mysql_data`.
- Container port stays `5000`, host port defaults to `5001` to avoid macOS conflicts.
- If you want to reset the database completely:
```bash
docker compose down -v
docker compose up --build
```

### Stop the stack
```bash
docker compose down
```

### 2) Configure environment
Copy `.env.example` to `.env` and set values.

Required keys:
- `MYSQL_HOST`
- `MYSQL_PORT`
- `MYSQL_DATABASE`
- `MYSQL_USER`
- `MYSQL_PASSWORD`
- `JWT_SECRET`
- `JWT_EXPIRES_IN`

### 3) Import schema in phpMyAdmin
1. Open phpMyAdmin
2. Create database if needed (or let script create it)
3. Import `database/schema.sql`

### 4) Run server
```bash
npm run dev
```

Health endpoint:
- `GET /health`

## Authentication APIs
Base path: `/api/v1/auth`

### Register
- `POST /register`
- Body:
```json
{
  "name": "Ankit",
  "email": "ankit@example.com",
  "password": "StrongPass123",
  "phone": "9999999999"
}
```

### Login
- `POST /login`
- Body:
```json
{
  "email": "ankit@example.com",
  "password": "StrongPass123"
}
```
- Returns JWT access token.

### My Profile
- `GET /me`
- Header: `Authorization: Bearer <accessToken>`

## Gameplay APIs
Base path: `/api/v1/gameplay`
All gameplay routes require bearer auth.

### Validate Squad Constraints
- `POST /squad/validate`
- Body:
```json
{
  "playerIds": [1,2,3,4,5,6,7,8,9,10,11],
  "captainId": 1,
  "viceCaptainId": 2,
  "budgetCap": 100
}
```

### Transfer Meta and Penalty
- `POST /transfers/meta`
- Body:
```json
{
  "usedTransfers": 3,
  "freeTransfers": 2,
  "fixtureStartAt": "2026-04-01T14:00:00Z",
  "tossAt": "2026-04-01T13:30:00Z"
}
```

### Player Points Calculation
- `POST /points/player`
- Body:
```json
{
  "stats": {
    "runs": 65,
    "fours": 7,
    "sixes": 2,
    "wickets": 0,
    "maidens": 0,
    "catches": 1,
    "stumpings": 0,
    "direct_hit_runouts": 0,
    "is_duck": false,
    "poor_economy": false,
    "dropped_catches": 0
  },
  "teamWon": true,
  "isAway": false,
  "isCaptain": true,
  "isViceCaptain": false,
  "booster": "TRIPLE_CAPTAIN"
}
```

### Prediction Points
- `POST /prediction/points`

### Quiz Points
- `POST /quiz/points`

## Requirement Mapping (Your Requested Product Logic)

### 1. Core Gameplay and Squad Management
Implemented in rule engine:
- Budget cap: 100 credits
- Team of 11 players
- Role composition:
  - WK: exactly 1
  - BAT: 3-5
  - AR: 1-3
  - BOWL: 3-5
- Max 7 players from one franchise
- Captain and vice-captain validation
- Transfer penalty: `-4` per extra transfer over free limit
- Deadline lock helper (before toss/start)

Files:
- `src/modules/gameplay/gameplay.rules.js`
- `src/modules/gameplay/gameplay.service.js`

### 2. Boosters (Chips)
Implemented in scoring multiplier logic:
- Triple Captain (3x)
- Captain (2x)
- Vice-Captain (1.5x)

Schema support added for:
- Free Hit
- Wildcard
- Impact Player

Files:
- `src/modules/gameplay/gameplay.rules.js`
- `database/schema.sql` (`manager_squads`, `boosters_usage`)

### 3. Real-Time Scoring System
Implemented point math for:
- Batting, bowling, fielding
- Milestones (50/100)
- Negative points
- Team result bonus/penalty
- Away multiplier (1.1x)

Live provider ingestion pipeline is not yet connected.
Schema includes `player_live_stats` to store feed data.

### 4. League and Social Features
Schema support available:
- Global leaderboard basis via squad points/ranks
- Private leagues and invite code
- H2H fixtures

Tables:
- `private_leagues`, `private_league_members`, `h2h_fixtures`

### 5. Technical and CMS Requirements
Implemented:
- Deadline lock cron job (`deadlineLock.job.js`)
- Deadline push notification inserts (`push_notifications`)

Schema support available for CMS:
- Player price updates (`admin_player_price_logs`)
- User bans (`admin_user_bans`)

Not yet implemented:
- Live third-party provider adapter (Sportradar/Roanuz/CricketData)
- Admin APIs and dashboard endpoints

### 6. Recommendations and Analytics
Schema support available:
- AI recommendations (`ai_recommendations`)
- Dream team (`dream_teams`, `dream_team_players`)
- Ownership stats (`players.ownership_percent`)

### 7. Game Modes
Implemented helper scoring APIs:
- Prediction points logic
- Quiz points logic with timer window validation

Schema support:
- `predictions`, `quiz_questions`, `quiz_answers`

## Security Notes
- Passwords are hashed with bcrypt.
- JWT bearer auth protects gameplay routes.
- Add HTTPS and secure token storage in production clients.
- Add refresh token + revocation store for stronger session control.

## Recommended Next Build Steps
1. Add refresh token flow and logout invalidation.
2. Add admin routes to manage players, prices, fixture results, and bans.
3. Build live score ingestion worker and point recalculation queue.
4. Add persistent squad creation/update APIs using `manager_squads` tables.
5. Add leaderboard APIs for global, private league, and H2H views.
# fpl
# fpl
# fpl
