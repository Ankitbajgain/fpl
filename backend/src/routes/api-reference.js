const apiReference = {
	baseUrl: 'http://localhost:5001/api/v1',
	publicRoutes: [
		{
			method: 'GET',
			path: '/health',
			purpose: 'Quick server health check.',
			authRequired: false,
			response: {
				status: 'ok',
				timestamp: '2026-03-24T05:41:13.578Z',
			},
		},
		{
			method: 'POST',
			path: '/api/v1/auth/register',
			purpose: 'Create a new manager account and return an access token.',
			authRequired: false,
			body: {
				name: 'Ankit',
				email: 'ankit@example.com',
				password: 'StrongPass123',
				phone: '9999999999',
			},
		},
		{
			method: 'POST',
			path: '/api/v1/auth/login',
			purpose: 'Log in an existing user and return an access token.',
			authRequired: false,
			body: {
				email: 'ankit@example.com',
				password: 'StrongPass123',
			},
		},
	],
	protectedRoutes: [
		{
			method: 'GET',
			path: '/api/v1/auth/me',
			purpose: 'Return the currently logged-in user profile.',
			authRequired: true,
		},
		{
			method: 'POST',
			path: '/api/v1/gameplay/squad/validate',
			purpose: 'Validate budget, role limits, franchise limits, and captain assignments.',
			authRequired: true,
			body: {
				playerIds: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11],
				captainId: 1,
				viceCaptainId: 2,
				budgetCap: 100,
			},
		},
		{
			method: 'POST',
			path: '/api/v1/gameplay/transfers/meta',
			purpose: 'Calculate lock status and transfer penalties.',
			authRequired: true,
			body: {
				usedTransfers: 3,
				freeTransfers: 2,
				fixtureStartAt: '2026-04-02T19:30:00Z',
				tossAt: '2026-04-02T19:00:00Z',
			},
		},
		{
			method: 'POST',
			path: '/api/v1/gameplay/points/player',
			purpose: 'Calculate fantasy points for a player stat line.',
			authRequired: true,
			body: {
				stats: {
					runs: 65,
					fours: 7,
					sixes: 2,
					wickets: 0,
					maidens: 0,
					catches: 1,
					stumpings: 0,
					direct_hit_runouts: 0,
					is_duck: false,
					poor_economy: false,
					dropped_catches: 0,
				},
				teamWon: true,
				isAway: false,
				isCaptain: true,
				isViceCaptain: false,
				booster: 'TRIPLE_CAPTAIN',
			},
		},
		{
			method: 'POST',
			path: '/api/v1/gameplay/prediction/points',
			purpose: 'Compare predicted and actual outcomes for prediction-mode scoring.',
			authRequired: true,
			body: {
				predicted: {
					tossWinnerId: 1,
					matchWinnerId: 1,
					motmPlayerId: 2,
					topScorerId: 2,
					topWicketTakerId: 8,
				},
				actual: {
					tossWinnerId: 1,
					matchWinnerId: 1,
					motmPlayerId: 2,
					topScorerId: 2,
					topWicketTakerId: 8,
				},
			},
		},
		{
			method: 'POST',
			path: '/api/v1/gameplay/quiz/points',
			purpose: 'Validate quiz answers inside the active timer window.',
			authRequired: true,
			body: {
				selectedOption: 'B',
				correctOption: 'B',
				answeredAt: '2026-04-02T17:15:00Z',
				startsAt: '2026-04-02T17:00:00Z',
				endsAt: '2026-04-02T18:00:00Z',
				maxPoints: 5,
			},
		},
	],
};

module.exports = apiReference;
