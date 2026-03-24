const baseUrl = process.env.SMOKE_BASE_URL || 'http://localhost:5001';
const email = process.env.SMOKE_EMAIL || 'manager1@newfpl.local';
const password = process.env.SMOKE_PASSWORD || 'ManagerPass123';

async function call(path, options = {}) {
  const response = await fetch(`${baseUrl}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(options.headers || {}),
    },
  });

  const text = await response.text();
  let body;

  try {
    body = JSON.parse(text);
  } catch {
    body = text;
  }

  return {
    ok: response.ok,
    status: response.status,
    body,
  };
}

function assert(condition, message) {
  if (!condition) {
    throw new Error(message);
  }
}

async function main() {
  console.log(`Smoke testing multi-league API at ${baseUrl}`);

  const login = await call('/api/v1/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  });

  assert(login.ok, `Login failed with status ${login.status}`);
  assert(login.body?.success, `Login response unsuccessful: ${JSON.stringify(login.body)}`);

  const token = login.body?.data?.accessToken;
  assert(token, 'Login response did not include an access token');

  const authHeaders = { Authorization: `Bearer ${token}` };

  const leagues = await call('/api/v1/gameplay/leagues', {
    method: 'GET',
    headers: authHeaders,
  });

  assert(leagues.ok, `Leagues endpoint failed with status ${leagues.status}`);
  assert(leagues.body?.success, `Leagues response unsuccessful: ${JSON.stringify(leagues.body)}`);
  assert(Array.isArray(leagues.body?.data), 'Leagues response did not return an array');
  assert(leagues.body.data.length > 0, 'Leagues response returned no leagues');

  const candidateLeagues = leagues.body.data.filter((league) => league.status === 'active');
  assert(candidateLeagues.length > 0, 'No active leagues found in leagues response');

  let activeLeague = null;
  let players = null;

  for (const league of candidateLeagues) {
    const candidatePlayers = await call(`/api/v1/gameplay/leagues/${league.id}/players`, {
      method: 'GET',
      headers: authHeaders,
    });

    assert(candidatePlayers.ok, `Players endpoint failed for ${league.id} with status ${candidatePlayers.status}`);
    assert(
      candidatePlayers.body?.success,
      `Players response unsuccessful for ${league.id}: ${JSON.stringify(candidatePlayers.body)}`,
    );
    assert(Array.isArray(candidatePlayers.body?.data), `Players response for ${league.id} did not return an array`);

    if (candidatePlayers.body.data.length >= 11) {
      activeLeague = league;
      players = candidatePlayers;
      break;
    }
  }

  assert(activeLeague?.id, 'No active league returned at least 11 players');

  const fixtures = await call(`/api/v1/gameplay/leagues/${activeLeague.id}/fixtures`, {
    method: 'GET',
    headers: authHeaders,
  });

  assert(fixtures.ok, `Fixtures endpoint failed with status ${fixtures.status}`);
  assert(fixtures.body?.success, `Fixtures response unsuccessful: ${JSON.stringify(fixtures.body)}`);
  assert(Array.isArray(fixtures.body?.data), 'Fixtures response did not return an array');

  if (fixtures.body.data.length > 0) {
    const firstFixture = fixtures.body.data[0];
    assert(firstFixture.homeCode, 'Fixture response is missing homeCode');
    assert(firstFixture.awayCode, 'Fixture response is missing awayCode');
  }

  const firstPlayer = players.body.data[0];
  assert(firstPlayer.id, 'Player response is missing id');
  assert(firstPlayer.role, 'Player response is missing role');
  assert(typeof firstPlayer.credits === 'number', 'Player response is missing numeric credits');
  assert(firstPlayer.team, 'Player response is missing team');

  console.log('Smoke test passed');
  console.log(
    JSON.stringify(
      {
        leagueChecked: activeLeague.id,
        leagueCount: leagues.body.data.length,
        fixtureCount: fixtures.body.data.length,
        playerCount: players.body.data.length,
      },
      null,
      2,
    ),
  );
}

main().catch((error) => {
  console.error('Smoke test failed');
  console.error(error.message);
  process.exit(1);
});