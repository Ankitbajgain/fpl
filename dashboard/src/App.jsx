import { useEffect, useMemo, useState } from 'react'
import LoginPanel from './components/LoginPanel'
import LeaguePicker from './components/LeaguePicker'
import TransferPolicyPanel from './components/TransferPolicyPanel'
import FixturePanel from './components/FixturePanel'
import SyncPanel from './components/SyncPanel'
import WindowBadge from './components/WindowBadge'
import LeaderboardPanel from './components/LeaderboardPanel'
import ManagerLeaderboardPanel from './components/ManagerLeaderboardPanel'

const authHeaders = (token) => ({
  'Content-Type': 'application/json',
  Authorization: `Bearer ${token}`,
})

export default function App() {
  const [token, setToken] = useState(localStorage.getItem('dashboard_admin_token') || '')
  const [user, setUser] = useState(null)
  const [authError, setAuthError] = useState('')
  const [loadingLogin, setLoadingLogin] = useState(false)

  const [leagues, setLeagues] = useState([])
  const [selectedLeague, setSelectedLeague] = useState('')
  const [fixtures, setFixtures] = useState([])
  const [franchises, setFranchises] = useState([])
  const [policy, setPolicy] = useState(null)
  const [leaderboardRows, setLeaderboardRows] = useState([])
  const [managerLeaderboardRows, setManagerLeaderboardRows] = useState([])
  const [leaderboardLoading, setLeaderboardLoading] = useState(false)
  const [managerLeaderboardLoading, setManagerLeaderboardLoading] = useState(false)
  const [leaderboardError, setLeaderboardError] = useState('')
  const [managerLeaderboardError, setManagerLeaderboardError] = useState('')

  const [busyFixtures, setBusyFixtures] = useState(false)
  const [busyPolicy, setBusyPolicy] = useState(false)
  const [busySync, setBusySync] = useState(false)
  const [notice, setNotice] = useState('')
  const [error, setError] = useState('')

  const isAuthenticated = !!token && !!user

  const notify = (msg) => {
    setNotice(msg)
    setError('')
  }

  const fail = (msg) => {
    setError(msg)
    setNotice('')
  }

  const fetchJson = async (url, options = {}) => {
    const response = await fetch(url, options)
    const payload = await response.json()
    if (!response.ok || !payload.success) {
      throw new Error(payload.message || 'Request failed')
    }
    return payload.data
  }

  const login = async (email, password) => {
    setLoadingLogin(true)
    setAuthError('')

    try {
      const data = await fetchJson('/api/v1/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      })

      if (data.user?.role !== 'admin') {
        throw new Error('Only admin users can access this dashboard')
      }

      setToken(data.accessToken)
      setUser(data.user)
      localStorage.setItem('dashboard_admin_token', data.accessToken)
      setLoadingLogin(false)
    } catch (e) {
      setAuthError(e.message)
      setLoadingLogin(false)
    }
  }

  const logout = () => {
    localStorage.removeItem('dashboard_admin_token')
    setToken('')
    setUser(null)
    setLeagues([])
    setSelectedLeague('')
    setFixtures([])
    setPolicy(null)
    setLeaderboardRows([])
    setManagerLeaderboardRows([])
    setLeaderboardError('')
    setManagerLeaderboardError('')
  }

  const loadLeagues = async () => {
    if (!token) return
    try {
      const data = await fetchJson('/api/v1/gameplay/leagues', { headers: authHeaders(token) })
      setLeagues(data)
      if (!selectedLeague && data.length) setSelectedLeague(data[0].id)
    } catch (e) {
      fail(e.message)
    }
  }

  const loadLeagueData = async (leagueSeasonId) => {
    if (!token || !leagueSeasonId) return
    try {
      const [fixtureData, franchiseData, policyData] = await Promise.all([
        fetchJson(`/api/v1/admin/leagues/${leagueSeasonId}/fixtures`, { headers: authHeaders(token) }),
        fetchJson(`/api/v1/admin/leagues/${leagueSeasonId}/franchises`, { headers: authHeaders(token) }),
        fetchJson(`/api/v1/admin/leagues/${leagueSeasonId}/transfers/policy`, { headers: authHeaders(token) }),
      ])
      setFixtures(fixtureData)
      setFranchises(franchiseData)
      setPolicy(policyData)
    } catch (e) {
      fail(e.message)
    }
  }

  const loadLeaderboard = async (leagueSeasonId) => {
    if (!token || !leagueSeasonId) return
    setLeaderboardLoading(true)
    setManagerLeaderboardLoading(true)
    setLeaderboardError('')
    setManagerLeaderboardError('')
    try {
      const data = await fetchJson(`/api/v1/gameplay/leagues/${leagueSeasonId}/leaderboard?playersLimit=20&managersLimit=20`, {
        headers: authHeaders(token),
      })
      setLeaderboardRows(Array.isArray(data?.players) ? data.players : [])
      setManagerLeaderboardRows(Array.isArray(data?.managers) ? data.managers : [])
    } catch (e) {
      setLeaderboardError(e.message)
      setManagerLeaderboardError(e.message)
    } finally {
      setLeaderboardLoading(false)
      setManagerLeaderboardLoading(false)
    }
  }

  useEffect(() => {
    const restore = async () => {
      if (!token) return
      try {
        const me = await fetchJson('/api/v1/auth/me', { headers: authHeaders(token) })
        if (me.role !== 'admin') throw new Error('Only admin users can access this dashboard')
        setUser(me)
      } catch {
        logout()
      }
    }
    restore()
  }, [])

  useEffect(() => {
    if (isAuthenticated) loadLeagues()
  }, [isAuthenticated])

  useEffect(() => {
    if (selectedLeague && token) loadLeagueData(selectedLeague)
  }, [selectedLeague, token])

  useEffect(() => {
    let intervalId
    if (selectedLeague && token) {
      loadLeaderboard(selectedLeague)
      intervalId = setInterval(() => loadLeaderboard(selectedLeague), 20000)
    }
    return () => clearInterval(intervalId)
  }, [selectedLeague, token])

  const handleCreateFixture = async (form) => {
    setBusyFixtures(true)
    try {
      await fetchJson(`/api/v1/admin/leagues/${selectedLeague}/fixtures`, {
        method: 'POST',
        headers: authHeaders(token),
        body: JSON.stringify(form),
      })
      await loadLeagueData(selectedLeague)
      notify('Fixture created')
    } catch (e) {
      fail(e.message)
    } finally {
      setBusyFixtures(false)
    }
  }

  const handleUpdateFixture = async (fixtureId, form) => {
    setBusyFixtures(true)
    try {
      await fetchJson(`/api/v1/admin/leagues/${selectedLeague}/fixtures/${fixtureId}`, {
        method: 'PUT',
        headers: authHeaders(token),
        body: JSON.stringify(form),
      })
      await loadLeagueData(selectedLeague)
      notify('Fixture updated')
    } catch (e) {
      fail(e.message)
    } finally {
      setBusyFixtures(false)
    }
  }

  const handleDeleteFixture = async (fixtureId) => {
    setBusyFixtures(true)
    try {
      await fetchJson(`/api/v1/admin/leagues/${selectedLeague}/fixtures/${fixtureId}`, {
        method: 'DELETE',
        headers: authHeaders(token),
      })
      await loadLeagueData(selectedLeague)
      notify('Fixture deleted')
    } catch (e) {
      fail(e.message)
    } finally {
      setBusyFixtures(false)
    }
  }

  const handlePolicySave = async (form) => {
    setBusyPolicy(true)
    try {
      const data = await fetchJson(`/api/v1/admin/leagues/${selectedLeague}/transfers/policy`, {
        method: 'PUT',
        headers: authHeaders(token),
        body: JSON.stringify(form),
      })
      setPolicy(data)
      notify('Transfer policy updated')
    } catch (e) {
      fail(e.message)
    } finally {
      setBusyPolicy(false)
    }
  }

  const handlePushStats = async (fixtureId, statsArray) => {
    setBusyFixtures(true)
    try {
      const data = await fetchJson(`/api/v1/admin/leagues/${selectedLeague}/fixtures/${fixtureId}/stats`, {
        method: 'POST',
        headers: authHeaders(token),
        body: JSON.stringify({ stats: statsArray }),
      })
      notify(`Stats pushed: ${data.updated} player(s) updated`)
    } catch (e) {
      fail(e.message)
    } finally {
      setBusyFixtures(false)
    }
  }

  const handleFinalizePoints = async (fixtureId) => {
    setBusyFixtures(true)
    try {
      const data = await fetchJson(`/api/v1/admin/leagues/${selectedLeague}/fixtures/${fixtureId}/finalize-points`, {
        method: 'POST',
        headers: authHeaders(token),
      })
      notify(`Points finalized: ${data.squadsProcessed} squad(s), ${data.playersProcessed} player(s)`)
      await loadLeagueData(selectedLeague)
      await loadLeaderboard(selectedLeague)
    } catch (e) {
      fail(e.message)
    } finally {
      setBusyFixtures(false)
    }
  }

  const handleSync = async (payload) => {
    setBusySync(true)
    try {
      const data = await fetchJson(`/api/v1/admin/leagues/${selectedLeague}/fixtures/sync`, {
        method: 'POST',
        headers: authHeaders(token),
        body: JSON.stringify(payload),
      })
      await loadLeagueData(selectedLeague)
      notify(`Sync complete: inserted ${data.inserted}, updated ${data.updated}`)
    } catch (e) {
      fail(e.message)
    } finally {
      setBusySync(false)
    }
  }

  const leagueName = useMemo(() => {
    return leagues.find((l) => l.id === selectedLeague)?.name || ''
  }, [leagues, selectedLeague])

  if (!isAuthenticated) {
    return (
      <main className="shell auth-shell">
        <LoginPanel onLogin={login} loading={loadingLogin} error={authError} />
      </main>
    )
  }

  return (
    <main className="shell">
      <header className="topbar">
        <div>
          <h1>New FPL Control Room</h1>
          <p>{user?.name} ({user?.email})</p>
        </div>
        <button className="secondary" onClick={logout}>Logout</button>
      </header>

      {notice ? <div className="flash ok">{notice}</div> : null}
      {error ? <div className="flash err">{error}</div> : null}

      <section className="layout">
        <div className="left-col">
          <LeaguePicker leagues={leagues} selectedLeague={selectedLeague} onSelect={setSelectedLeague} />
          <WindowBadge leagueSeasonId={selectedLeague} token={token} />
          <LeaderboardPanel rows={leaderboardRows} loading={leaderboardLoading} error={leaderboardError} />
          <ManagerLeaderboardPanel rows={managerLeaderboardRows} loading={managerLeaderboardLoading} error={managerLeaderboardError} />
          <SyncPanel onSync={handleSync} busy={busySync} />
        </div>

        <div className="right-col">
          <div className="panel"><h2>Working League</h2><p>{leagueName || '-'}</p></div>
          <TransferPolicyPanel policy={policy} onSave={handlePolicySave} saving={busyPolicy} />
          <FixturePanel
            fixtures={fixtures}
            franchises={franchises}
            onCreate={handleCreateFixture}
            onUpdate={handleUpdateFixture}
            onDelete={handleDeleteFixture}
            onPushStats={handlePushStats}
            onFinalizePoints={handleFinalizePoints}
            busy={busyFixtures}
          />
        </div>
      </section>
    </main>
  )
}
