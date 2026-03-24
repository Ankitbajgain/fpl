# Fantasy Cricket Backend - Codebase Overview

## 1. DATABASE SCHEMA

### Core Tables & Relationships

#### **Users Table**
- `id` (PK): User identifier
- `name`, `email` (UNIQUE), `phone`: User credentials
- `password_hash`: Bcrypt hashed password
- `wallet_balance`: User's account balance
- `role`: ENUM('manager', 'admin')
- `is_active`: Account status
- `created_at`, `updated_at`: Timestamps

#### **Franchises Table** (Teams)
- `id` (PK): Franchise identifier
- `name` (UNIQUE), `short_name` (UNIQUE): Franchise name (e.g., 'Mumbai Indians', 'MI')
- `home_city`: City location
- `is_active`: Status
- Sample franchises: MI, CSK, RCB, KKR (IPL), IND, AUS, ENG, NEP, NZ, SA, PAK, BAN, SL, AFG, WI, IRE

#### **Players Table**
- `id` (PK): Player identifier
- `full_name`: Player name
- `role`: ENUM('WK', 'BAT', 'AR', 'BOWL') - Wicket Keeper, Batter, All-Rounder, Bowler
- `franchise_id` (FK): \→ Franchises
- `credit_price`: Player cost (0.5 to 11.0 credits, used in squad building)
- `is_active`: Availability for selection
- `ownership_percent`: Current selection percentage
- Sample query returns: `{id, full_name, role, credit_price, franchise_id}`

#### **Players ↔ Franchises Relationship**
- **Foreign Key**: `players.franchise_id` → `franchises.id`
- **Cardinality**: One franchise has many players
- **Example**: All India team members link via `franchise_id = 5` (IND)

#### **Fixtures Table**
- `id` (PK): Match identifier
- `home_franchise_id`, `away_franchise_id` (FK): Teams playing
- `venue`: Match location
- `starts_at`, `toss_at`, `lock_at`: Match timing
- `status`: ENUM('SCHEDULED', 'LIVE', 'COMPLETED', 'CANCELLED')
- `winner_franchise_id` (FK): Winning team (post-match)
- `motm_player_id` (FK): Man of the Match player

#### **Manager Squads Table**
- `id` (PK): Squad identifier
- `user_id` (FK): \→ Users - which manager owns this squad
- `fixture_id` (FK): \→ Fixtures - for which match
- `budget_cap`: Always 100 credits
- `total_spent`: Sum of selected player credits
- `transfers_used`, `free_transfers`: Transfer tracking
- `transfer_penalty_points`: Deducted points for excess transfers
- `captain_player_id`, `vice_captain_player_id` (FK): Squad leaders
- `impact_player_id` (FK, nullable): Optional impact selection
- `booster`: ENUM('NONE', 'TRIPLE_CAPTAIN', 'FREE_HIT', 'WILDCARD', 'IMPACT_PLAYER')
- `is_locked`: Cannot be edited after lock time
- `points_total`: Accumulated fantasy points
- `rank_global`: Manager's ranking
- **Unique Constraint**: `(user_id, fixture_id)` — One squad per manager per fixture

#### **Manager Squad Players Table** (Many-to-Many)
- `squad_id` (FK): \→ Manager Squads
- `player_id` (FK): \→ Players
- `is_starting_xi`: Boolean - playing in main XI
- **Primary Key**: `(squad_id, player_id)`
- Supports 15-player squad (11 starting + 4 bench)

#### **Player Live Stats Table**
- `id` (PK): Stat record
- `fixture_id`, `player_id`, `franchise_id` (FK): Context
- **Batting Stats**: `runs`, `fours`, `sixes`, `balls_faced`, `is_duck`
- **Bowling Stats**: `wickets`, `maidens`, `economy_rate`, `three_wicket_haul`
- **Fielding Stats**: `catches`, `stumpings`, `direct_hit_runouts`, `dropped_catches`
- **Unique Constraint**: `(fixture_id, player_id)` — One stat set per player per match

#### **Supporting Tables**
- **Boosters Usage**: Tracks which booster each user used in each season
- **Private Leagues**: Manager-created leagues with invite codes
- **H2H Fixtures**: Head-to-head matchups between managers
- **Predictions**: Manager predictions (toss winner, match winner, MOTM, top scorers)
- **Quiz Questions & Answers**: Fixture-specific quiz with timer validation
- **Push Notifications**: In-app alerts
- **Admin Logs**: Price changes and user bans
- **Dream Teams**: System-generated optimal squad for each fixture
- **AI Recommendations**: ML-based player suggestions

---

## 2. API STRUCTURE

### Authentication Module (`/api/v1/auth`)

#### POST `/auth/register`
- **Purpose**: Create new manager account
- **Body**: `{ name, email, password, phone }`
- **Response**: 
  ```json
  {
    "user": { id, name, email, phone, role: "manager" },
    "accessToken": "JWT"
  }
  ```

#### POST `/auth/login`
- **Purpose**: Authenticate manager
- **Body**: `{ email, password }`
- **Response**: User object + JWT token

#### GET `/auth/me`
- **Purpose**: Get current user profile
- **Auth**: Bearer token required
- **Response**: User profile with wallet, role, timestamps

---

### Gameplay Module (`/api/v1/gameplay`)

All endpoints require Bearer token authentication. Endpoints are **validation & calculation utilities** (not storage):

#### GET `/gameplay/players`
- **Purpose**: Fetch all active players for squad builder
- **Returns**: Array of players with structure:
  ```json
  [
    {
      "id": 1,
      "name": "Virat Kohli",
      "role": "BAT",
      "credits": 11.0,
      "team": "RCB",
      "country": "India"
    }
  ]
  ```
- **Note**: Players filtered by role, credits (0.5 - 11.0), status

#### POST `/gameplay/squad/validate`
- **Purpose**: Validate if squad selection is legal
- **Body**:
  ```json
  {
    "playerIds": [1, 2, 3, ..., 11],
    "captainId": 1,
    "viceCaptainId": 2,
    "budgetCap": 100
  }
  ```
- **Validations**:
  - Exactly 11 players
  - Budget ≤ 100 credits
  - Role constraints: WK (1-4), BAT (3-6), AR (1-4), BOWL (3-6)
  - Max 7 players from same franchise
  - Captain & Vice-Captain must be in squad and different
- **Response**: `{ valid: true, totalCredits, roleCounts, franchiseCount }`

#### POST `/gameplay/transfers/meta`
- **Purpose**: Check squad lock status & transfer penalty
- **Body**:
  ```json
  {
    "usedTransfers": 3,
    "freeTransfers": 2,
    "fixtureStartAt": "2026-04-02T19:30:00Z",
    "tossAt": "2026-04-02T19:00:00Z"
  }
  ```
- **Logic**: Squad locks 30 minutes before toss
- **Response**: `{ locked: boolean, penalty: number }`

#### POST `/gameplay/points/player`
- **Purpose**: Calculate fantasy points for single player
- **Body**:
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
- **Scoring Rules**:
  - Runs: 1 pt each
  - Fours: 1 pt each
  - Sixes: 2 pts each
  - 50-run milestone: 8 pts
  - 100-run milestone: 16 pts
  - Wicket: 25 pts each
  - Maiden over: 8 pts
  - 3-wicket haul: 12 pts
  - Catch/Stumping/Direct Hit: 12 pts
  - Duck: -2 pts
  - Poor economy: -2 pts
  - Dropped catch: -1 pt
  - Team win: +10 pts
  - Team loss: -10 pts
  - Away match: ×1.1 multiplier
- **Booster Multipliers**:
  - Captain: ×2 points
  - Captain + TRIPLE_CAPTAIN: ×3 points
  - Vice-Captain: ×1.5 points
- **Response**: `{ basePoints, boostedPoints }`

#### POST `/gameplay/prediction/points`
- **Purpose**: Score prediction game (toss, winner, MOTM, top scorers)
- **Body**:
  ```json
  {
    "predicted": {
      "tossWinnerId": 1,
      "matchWinnerId": 1,
      "motmPlayerId": 2,
      "topScorerId": 2,
      "topWicketTakerId": 8
    },
    "actual": { /* same structure */ }
  }
  ```
- **Scoring**:
  - Correct toss: 5 pts
  - Correct match winner: 10 pts
  - Correct MOTM: 12 pts
  - Correct top scorer: 8 pts
  - Correct top wicket-taker: 8 pts
- **Response**: `{ points: number }`

#### POST `/gameplay/quiz/points`
- **Purpose**: Validate quiz answer within time window
- **Body**:
  ```json
  {
    "selectedOption": "B",
    "correctOption": "B",
    "answeredAt": "2026-04-02T17:15:00Z",
    "startsAt": "2026-04-02T17:00:00Z",
    "endsAt": "2026-04-02T18:00:00Z",
    "maxPoints": 5
  }
  ```
- **Logic**: Must answer within `[startsAt, endsAt]` window
- **Response**: `{ points: number }` (maxPoints or 0)

---

## 3. DATA MODEL & RELATIONSHIPS (Visual)

```
┌─────────────────────────────────────────────────────────────┐
│                        Users                                │
│  PK: id | name | email | password_hash | phone | role      │
└──────────────┬──────────────────────────┬────────────────────┘
               │                          │
         [1:M] │                    [1:M] │
               ▼                          ▼
    ┌──────────────────────┐    ┌──────────────────────────┐
    │  Manager Squads      │    │  Push Notifications      │
    │  (user_id, fixture)  │    │  (notifications about)   │
    │  PK: id              │    │                          │
    └──────┬───────────────┘    └──────────────────────────┘
           │
      [1:M]│ squad_id
           ▼
    ┌──────────────────────────┐
    │ Manager Squad Players    │ ◄─── Links 11 players to squad
    │ PK: (squad_id, player)   │
    └──────────┬───────────────┘
               │
          [M:1]│ player_id
               ▼
    ┌──────────────────────────────┐
    │        Players               │
    │ PK: id | full_name | role    │
    │ credit_price | franchise_id  │
    └──────────┬───────────────────┘
               │
          [M:1]│ franchise_id
               ▼
    ┌──────────────────────────┐
    │      Franchises (Teams)  │
    │ PK: id | name | city     │
    │ short_name: MI, CSK, etc │
    └──────────────────────────┘

Fixtures ─ home/away franchises, determines player|_live_stats
Players ◄─ linked via franchise_id
Manager Squads ◄─ linked to fixture_id & user_id
```

---

## 4. KEY FEATURES IMPLEMENTED

### Fixture Management
- Fixtures have timing: `toss_at`, `starts_at`, `lock_at`
- Squad becomes immutable 30 minutes before toss
- Post-match: winner, MOTM recorded

### Squad Building
- **11-player constraint** with specific role distribution
- **100-credit budget** with price-based selection
- **Captain & Vice-Captain** (different players)
- **7-player franchise limit** (no team stacking)
- **Formation support**: `1-4-2-4` (WK-BAT-AR-BOWL)

### Transfer System
- **Free transfers**: 2 per fixture (configurable)
- **Paid transfers**: Cost 4 points each for transfers beyond free quota
- **One squad per manager per fixture**: `(user_id, fixture_id)` uniqueness

### Scoring System
- **Base points** from live stats + multipliers
- **Booster system**: Triple Captain (×3), Free Hit, Wildcard, Impact Player
- **Franchise bonuses**: Away match ×1.1 multiplier, win/loss penalties

### Prediction Game
- Predict toss winner, match winner, MOTM, top scorers, top wicket-taker
- **Separate scoring** from main squad game

### Quiz Game
- Fixture-specific questions with time windows
- Answer validation within (starts_at, ends_at)

### Leagues & Competition
- Global rankings
- Private leagues with managers
- Head-to-head (H2H) fixtures

---

## 5. API RESPONSE FORMAT

### Success Response
```json
{
  "success": true,
  "message": "Player points calculated",
  "data": { /* endpoint-specific */ }
}
```

### Error Response (via error middleware)
```json
{
  "success": false,
  "message": "Error description",
  "statusCode": 400
}
```

---

## 6. AUTHENTICATION & SECURITY

- **JWT Token**: 7-day expiry (configurable via `JWT_EXPIRES_IN`)
- **Bearer Token**: Required for all gameplay endpoints
- **Rate Limiting**: Global rate limiter on `/api` routes
- **Helmet**: Security headers on all responses
- **CORS**: Configurable allowed origins
- **Password**: Bcrypt hashed (salt rounds: 12)

---

## 7. FRONTEND INTEGRATION POINTS

### Squad Builder (React + Redux)
- **Redux State** (`squadSlice`):
  - `players`: All active players from `/gameplay/players`
  - `selectedIds`: 11 selected player IDs
  - `mode`: 'Classic', 'H2H', 'Turbo'
  - `formation`: '1-4-2-4'
  - `validationResult`: Response from `/gameplay/squad/validate`

### Components
- **PlayerPool**: Displays players by role, team, credits
- **Sidebar**: Shows formation, selected players, budget
- **Auth**: Login/Register panel
- **StatCard**: Player card with name, role, team, credits

### Frontend Role Constraints (mirrored from backend)
```javascript
roleRules = {
  WK: { min: 1, max: 4 },
  BAT: { min: 3, max: 6 },
  AR: { min: 1, max: 4 },
  BOWL: { min: 3, max: 6 }
}
```

---

## 8. CURRENT LIMITATIONS & OBSERVATIONS

1. **Calculation-only endpoints**: `/gameplay/*` are **not storage operations** - they're validation utilities
   - Squad selection itself is NOT persisted via these endpoints
   - Need separate endpoint to save manager_squads & manager_squad_players

2. **No transfer endpoint**: Transfer logic exists (penalty calculation) but no creation endpoint

3. **No live stats ingestion**: Player stats structure exists but no endpoint to update player_live_stats

4. **No fixture creation**: Fixtures seem to be seeded; no admin endpoint to create new ones

5. **Missing endpoints**:
   - `POST /squads` - Save squad selection
   - `PUT /squads/{id}` - Update squad (transfers)
   - `GET /squads` - Fetch user's squads
   - `POST /fixtures/{id}/stats/{playerId}` - Record live stats
   - `POST /fixtures/{id}/complete` - Mark fixture complete, finalize points

---

## 9. SCALABILITY NOTES

- **Database**: MySQL with proper foreign keys and indexes
- **Players are franchise-agnostic**: Can be reused for different sports/leagues
- **Fixture-based isolation**: Each fixture has its own stats, squads, scores
- **Season/League support**: `boosters_usage` has season field, `private_leagues` support leagues

---

## Summary

**Current system** is a **Fantasy Cricket engine** with:
- ✅ Player pool management (11 players, 100 credits, role constraints)
- ✅ Squad validation logic
- ✅ Scoring engine (live stats → fantasy points)
- ✅ Transfer & booster mechanics
- ✅ Prediction & quiz games
- ✅ League & ranking system

**Architecture**: Calculation-heavy backend (no persistence in gameplay endpoints) + React frontend with Redux state management. Missing: persistence endpoints for squad creation & live stat ingestion.
