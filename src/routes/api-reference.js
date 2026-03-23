/**
 * API Reference
 *
 * This file is only for quick developer reference.
 * It does not register routes or run any application logic.
 *
 * Base URL example:
 *   http://localhost:5000/api/v1
 *
 * ---------------------------------------------------------------------------
 * Public Routes
 * ---------------------------------------------------------------------------
 * GET /health
 *   Purpose:
 *   - Quick server health check.
 *   - Returns status and current timestamp.
 *
 * POST /api/v1/auth/register
 *   Purpose:
 *   - Create a new manager account.
 *   - Hashes password and stores user in MySQL.
 *   - Returns user details and JWT access token.
 *   Body:
 *   {
 *     name: string,
 *     email: string,
 *     password: string,
 *     phone?: string
 *   }
 *
 * POST /api/v1/auth/login
 *   Purpose:
 *   - Log in an existing user with email and password.
 *   - Verifies hashed password from MySQL.
 *   - Returns user details and JWT access token.
 *   Body:
 *   {
 *     email: string,
 *     password: string
 *   }
 *
 * ---------------------------------------------------------------------------
 * Protected Routes
 * ---------------------------------------------------------------------------
 * Header for all protected routes:
 *   Authorization: Bearer <accessToken>
 *
 * GET /api/v1/auth/me
 *   Purpose:
 *   - Return the currently logged-in user's profile.
 *   - Useful after login to hydrate frontend session state.
 *
 * POST /api/v1/gameplay/squad/validate
 *   Purpose:
 *   - Validate fantasy squad selection before saving or submitting.
 *   - Checks:
 *     - 11 players exactly
 *     - Budget cap (100 credits)
 *     - Role rules: 1 WK, 3-5 BAT, 1-3 AR, 3-5 BOWL
 *     - Max 7 players from one franchise
 *     - Captain and vice-captain belong to the selected squad
 *   Body:
 *   {
 *     playerIds: number[11],
 *     captainId: number,
 *     viceCaptainId: number,
 *     budgetCap?: number
 *   }
 *
 * POST /api/v1/gameplay/transfers/meta
 *   Purpose:
 *   - Calculate transfer-related state for a fixture.
 *   - Returns whether squad is locked and how many penalty points apply.
 *   - Uses toss/start time and free transfer limit.
 *   Body:
 *   {
 *     usedTransfers: number,
 *     freeTransfers: number,
 *     fixtureStartAt: ISODateString,
 *     tossAt?: ISODateString
 *   }
 *
 * POST /api/v1/gameplay/points/player
 *   Purpose:
 *   - Calculate fantasy points for one player's stats.
 *   - Applies batting, bowling, fielding, milestone, negative, match-result,
 *     away bonus, captain, vice-captain, and Triple Captain logic.
 *   Body:
 *   {
 *     stats: {
 *       runs?: number,
 *       fours?: number,
 *       sixes?: number,
 *       wickets?: number,
 *       maidens?: number,
 *       catches?: number,
 *       stumpings?: number,
 *       direct_hit_runouts?: number,
 *       is_duck?: boolean,
 *       poor_economy?: boolean,
 *       dropped_catches?: number
 *     },
 *     teamWon: boolean,
 *     isAway: boolean,
 *     isCaptain: boolean,
 *     isViceCaptain: boolean,
 *     booster?: 'NONE' | 'TRIPLE_CAPTAIN' | 'FREE_HIT' | 'WILDCARD' | 'IMPACT_PLAYER'
 *   }
 *
 * POST /api/v1/gameplay/prediction/points
 *   Purpose:
 *   - Calculate points for prediction mode.
 *   - Compares predicted toss winner, match winner, player awards, etc.
 *   Body:
 *   {
 *     predicted: {
 *       tossWinnerId?: number,
 *       matchWinnerId?: number,
 *       motmPlayerId?: number,
 *       topScorerId?: number,
 *       topWicketTakerId?: number
 *     },
 *     actual: {
 *       tossWinnerId?: number,
 *       matchWinnerId?: number,
 *       motmPlayerId?: number,
 *       topScorerId?: number,
 *       topWicketTakerId?: number
 *     }
 *   }
 *
 * POST /api/v1/gameplay/quiz/points
 *   Purpose:
 *   - Calculate quiz mode points.
 *   - Checks answer correctness and whether the answer was submitted inside
 *     the allowed timer window.
 *   Body:
 *   {
 *     selectedOption: 'A' | 'B' | 'C' | 'D',
 *     correctOption: 'A' | 'B' | 'C' | 'D',
 *     answeredAt: ISODateString,
 *     startsAt: ISODateString,
 *     endsAt: ISODateString,
 *     maxPoints?: number
 *   }
 *
 * ---------------------------------------------------------------------------
 * Route Summary
 * ---------------------------------------------------------------------------
 * Public:
 *   GET  /health
 *   POST /api/v1/auth/register
 *   POST /api/v1/auth/login
 *
 * Protected:
 *   GET  /api/v1/auth/me
 *   POST /api/v1/gameplay/squad/validate
 *   POST /api/v1/gameplay/transfers/meta
 *   POST /api/v1/gameplay/points/player
 *   POST /api/v1/gameplay/prediction/points
 *   POST /api/v1/gameplay/quiz/points
 */
