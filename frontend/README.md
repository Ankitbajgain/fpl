# New FPL Frontend

Responsive fantasy-cricket frontend built with React, Tailwind CSS, and Redux Toolkit.

## Tech Stack

- React 19 (Vite)
- Redux Toolkit + React Redux
- Tailwind CSS 3 + PostCSS
- ESLint

## Features Implemented

- Fully responsive layout for mobile, tablet, and desktop
- Redux-driven squad state (players, selection, favorites, mode, formation)
- Backend auth integration:
	- Login using `/api/v1/auth/login`
	- Session restore using `/api/v1/auth/me`
	- Logout clears token + auth state
- Squad validation integration:
	- Validates selected squad using `/api/v1/gameplay/squad/validate`
	- Displays API success/error in UI
- Tailwind-based custom visual system (typography, color tokens, cards, layout)

## Project Structure

```txt
frontend/
├── public/
├── src/
│   ├── app/
│   │   └── store.js                 # Redux store config
│   ├── assets/
│   ├── features/
│   │   └── squad/
│   │       └── squadSlice.js        # Squad + auth + validation state
│   ├── App.jsx                      # Main responsive UI + API calls
│   ├── index.css                    # Tailwind + global base styles
│   └── main.jsx                     # React root + Redux Provider
├── index.html
├── postcss.config.js
├── tailwind.config.js
├── vite.config.js                   # Dev proxy to backend
└── package.json
```

## Prerequisites

- Node.js 20+ (recommended)
- npm 10+
- Backend running at `http://localhost:5001`

## Installation

From monorepo root:

```bash
cd frontend
npm install
```

## Run in Development

```bash
cd frontend
npm run dev
```

Frontend URL:

- `http://localhost:5173`

## Build for Production

```bash
cd frontend
npm run build
```

Preview build output:

```bash
cd frontend
npm run preview
```

## Available Scripts

- `npm run dev` -> Start Vite dev server
- `npm run build` -> Build production assets
- `npm run preview` -> Preview production build
- `npm run lint` -> Run ESLint

## Backend Integration Details

### Dev Proxy

Configured in `vite.config.js`:

- `/api` -> `http://localhost:5001`
- `/health` -> `http://localhost:5001`

This avoids CORS issues during local development.

### Auth Flow

1. User submits email/password in sidebar login form.
2. UI calls `POST /api/v1/auth/login`.
3. On success, JWT is stored in `localStorage` under key:
	 - `newfpl_access_token`
4. On app load, frontend tries `GET /api/v1/auth/me` using stored token.
5. If token is invalid/expired, token is removed and user is logged out.

### Squad Validation Flow

1. User selects players from player cards.
2. User chooses captain + vice-captain from selected players.
3. UI calls `POST /api/v1/gameplay/squad/validate` with:
	 - `playerIds`
	 - `captainId`
	 - `viceCaptainId`
	 - `budgetCap`
4. Response is shown in the integration panel.

## Redux State Model

Managed in `src/features/squad/squadSlice.js`.

Key state fields:

- `players` -> Local player pool used by UI cards
- `selectedIds` -> Current squad player IDs
- `budgetCap` -> Budget limit used for stats/validation payload
- `formation` -> Selected formation value
- `mode` -> Selected game mode
- `favorites` -> Favorited player IDs
- `authToken` -> JWT from backend login
- `currentUser` -> Authenticated user profile
- `validationResult` -> Last successful squad validation result
- `validationError` -> Last validation error message

Core actions:

- `togglePlayer`
- `toggleFavorite`
- `setMode`
- `setFormation`
- `setAuthSession`
- `clearAuthSession`
- `setValidationResult`
- `setValidationError`
- `clearValidationState`

## Responsive Design Notes

- Mobile-first spacing and typography via Tailwind utility classes
- Adaptive layout structure:
	- Single-column behavior on small screens
	- Multi-column cards/grids on larger screens
- Sidebar + player grid reflow for tablet and desktop breakpoints
- Touch-friendly controls and large action buttons for phone usage

## Demo Credentials (Backend Seed)

If backend demo seed is loaded, use:

- Email: `manager1@newfpl.local`
- Password: `ManagerPass123`

## Troubleshooting

### 1) Login fails with network error

- Ensure backend is running on `http://localhost:5001`
- Confirm Vite dev server is started from `frontend/`

### 2) Validation says login required

- Login first using sidebar form
- Check browser storage for `newfpl_access_token`

### 3) Validation fails with player error

- Backend database must contain corresponding player IDs
- Re-run backend seed if needed

### 4) Tailwind styles not applied

- Ensure `src/index.css` includes Tailwind directives
- Restart dev server after config changes

## Next Suggested Improvements

- Replace local player pool with live API-driven player list
- Add fixtures API integration and filter players by fixture
- Add route-based pages (Login, Dashboard, Squad, Profile)
- Add optimistic loading states and toast notifications
- Add persisted Redux state and refresh-safe UI preferences

