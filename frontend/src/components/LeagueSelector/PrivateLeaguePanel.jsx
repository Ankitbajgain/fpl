import { useCallback, useEffect, useState } from 'react'

export function PrivateLeaguePanel({ authToken, selectedLeagueSeason, currentUser }) {
  const [leagues, setLeagues] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')
  const [name, setName] = useState('')
  const [inviteCode, setInviteCode] = useState('')
  const [actionLoading, setActionLoading] = useState(false)
  const [detailsById, setDetailsById] = useState({})

  const fetchPrivateLeagues = useCallback(async () => {
    if (!authToken || !selectedLeagueSeason) return

    setLoading(true)
    setError('')

    try {
      const response = await fetch(`/api/v1/private-leagues?leagueSeasonId=${selectedLeagueSeason}`, {
        headers: { Authorization: `Bearer ${authToken}` },
      })
      const payload = await response.json()

      if (!response.ok || !payload.success || !Array.isArray(payload.data)) {
        setError(payload.message || 'Unable to load private leagues')
        setLoading(false)
        return
      }

      setLeagues(payload.data)
      setLoading(false)
    } catch {
      setError('Network error while loading private leagues')
      setLoading(false)
    }
  }, [authToken, selectedLeagueSeason])

  useEffect(() => {
    setDetailsById({})
    setNotice('')
    fetchPrivateLeagues()
  }, [fetchPrivateLeagues])

  const handleCreateLeague = async (event) => {
    event.preventDefault()

    const trimmedName = String(name || '').trim()
    if (!trimmedName) {
      setNotice('Enter a private league name first.')
      return
    }

    setActionLoading(true)
    setNotice('')

    try {
      const response = await fetch('/api/v1/private-leagues', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${authToken}`,
        },
        body: JSON.stringify({
          leagueSeasonId: selectedLeagueSeason,
          name: trimmedName,
        }),
      })
      const payload = await response.json()

      if (!response.ok || !payload.success) {
        setNotice(payload.message || 'Unable to create private league')
        setActionLoading(false)
        return
      }

      setName('')
      setNotice('Private league created successfully.')
      await fetchPrivateLeagues()
      setActionLoading(false)
    } catch {
      setNotice('Network error while creating private league')
      setActionLoading(false)
    }
  }

  const handleJoinLeague = async (event) => {
    event.preventDefault()

    const code = String(inviteCode || '').trim().toUpperCase()
    if (!code) {
      setNotice('Enter invite code to join.')
      return
    }

    setActionLoading(true)
    setNotice('')

    try {
      const response = await fetch('/api/v1/private-leagues/join', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${authToken}`,
        },
        body: JSON.stringify({ inviteCode: code }),
      })
      const payload = await response.json()

      if (!response.ok || !payload.success) {
        setNotice(payload.message || 'Unable to join private league')
        setActionLoading(false)
        return
      }

      setInviteCode('')
      setNotice('Joined private league successfully.')
      await fetchPrivateLeagues()
      setActionLoading(false)
    } catch {
      setNotice('Network error while joining private league')
      setActionLoading(false)
    }
  }

  const handleLeaveLeague = async (leagueId) => {
    setActionLoading(true)
    setNotice('')

    try {
      const response = await fetch(`/api/v1/private-leagues/${leagueId}/leave`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${authToken}` },
      })
      const payload = await response.json()

      if (!response.ok || !payload.success) {
        setNotice(payload.message || 'Unable to leave private league')
        setActionLoading(false)
        return
      }

      setNotice('Left private league successfully.')
      await fetchPrivateLeagues()
      setActionLoading(false)
    } catch {
      setNotice('Network error while leaving private league')
      setActionLoading(false)
    }
  }

  const handleToggleDetails = async (leagueId) => {
    if (detailsById[leagueId]) {
      setDetailsById((prev) => {
        const next = { ...prev }
        delete next[leagueId]
        return next
      })
      return
    }

    setActionLoading(true)
    setNotice('')
    try {
      const response = await fetch(`/api/v1/private-leagues/${leagueId}`, {
        headers: { Authorization: `Bearer ${authToken}` },
      })
      const payload = await response.json()

      if (!response.ok || !payload.success || !payload.data) {
        setNotice(payload.message || 'Unable to load league details')
        setActionLoading(false)
        return
      }

      setDetailsById((prev) => ({
        ...prev,
        [leagueId]: payload.data,
      }))
      setActionLoading(false)
    } catch {
      setNotice('Network error while loading league details')
      setActionLoading(false)
    }
  }

  const memberRole = (league) => String(league.myRole || '').toLowerCase()

  return (
    <section className="rounded-3xl border border-[#e4ddd2] bg-white p-5 shadow-card">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h2 className="font-heading text-2xl">Private Leagues</h2>
          <p className="mt-1 text-sm text-[#5f6a76]">
            Create your own league, share invite code, and track standings with friends.
          </p>
          <p className="mt-1 text-xs text-[#6a7683]">
            Limits: join up to 25 private leagues, create up to 5 private leagues.
          </p>
        </div>
        <button
          type="button"
          onClick={fetchPrivateLeagues}
          disabled={loading || actionLoading}
          className="rounded-lg border border-[#d8cfbf] px-3 py-1.5 text-xs font-semibold text-[#38424d] hover:bg-[#f7f2e9] disabled:cursor-not-allowed disabled:opacity-60"
        >
          Refresh
        </button>
      </div>

      <div className="mt-4 grid gap-4 lg:grid-cols-2">
        <form onSubmit={handleCreateLeague} className="rounded-2xl border border-[#e4ddd2] bg-[#fffaf2] p-4">
          <p className="text-sm font-semibold text-[#38424d]">Create Private League</p>
          <input
            value={name}
            onChange={(event) => setName(event.target.value)}
            placeholder="League name"
            maxLength={80}
            className="mt-2 w-full rounded-lg border border-[#d8cfbf] bg-white px-3 py-2 text-sm outline-none focus:border-[#0e6f59]"
          />
          <button
            type="submit"
            disabled={actionLoading || !selectedLeagueSeason}
            className="mt-3 rounded-lg bg-[#0e6f59] px-3 py-2 text-sm font-semibold text-white hover:bg-[#0b5f4c] disabled:cursor-not-allowed disabled:opacity-60"
          >
            {actionLoading ? 'Please wait...' : 'Create'}
          </button>
        </form>

        <form onSubmit={handleJoinLeague} className="rounded-2xl border border-[#e4ddd2] bg-[#eef9f5] p-4">
          <p className="text-sm font-semibold text-[#38424d]">Join by Invite Code</p>
          <input
            value={inviteCode}
            onChange={(event) => setInviteCode(event.target.value.toUpperCase())}
            placeholder="Enter invite code"
            maxLength={20}
            className="mt-2 w-full rounded-lg border border-[#cde8df] bg-white px-3 py-2 text-sm uppercase outline-none focus:border-[#0e6f59]"
          />
          <button
            type="submit"
            disabled={actionLoading}
            className="mt-3 rounded-lg bg-[#13382f] px-3 py-2 text-sm font-semibold text-white hover:bg-[#0f2d26] disabled:cursor-not-allowed disabled:opacity-60"
          >
            {actionLoading ? 'Please wait...' : 'Join'}
          </button>
        </form>
      </div>

      {notice ? (
        <p className="mt-3 rounded-xl bg-[#f4efe5] px-3 py-2 text-xs font-semibold text-[#5a4d3b]">{notice}</p>
      ) : null}
      {error ? (
        <p className="mt-3 rounded-xl bg-[#fdecea] px-3 py-2 text-xs font-semibold text-[#8a3d35]">{error}</p>
      ) : null}

      <div className="mt-4 space-y-3">
        {loading ? (
          <div className="rounded-xl border border-[#e4ddd2] bg-[#faf6ef] p-3 text-sm text-[#5f6a76]">Loading private leagues...</div>
        ) : leagues.length ? (
          leagues.map((league) => {
            const isAdmin = memberRole(league) === 'admin'
            const details = detailsById[league.id]
            const canLeave = !league.isOverall

            return (
              <article key={league.id} className="rounded-2xl border border-[#e4ddd2] bg-white p-4">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className="font-heading text-lg leading-tight">{league.name}</p>
                    <p className="mt-1 text-xs uppercase tracking-[0.12em] text-[#6a7683]">
                      {league.competition} • {league.seasonName}
                    </p>
                    <div className="mt-2 flex flex-wrap gap-2 text-xs">
                      <span className="rounded-full bg-[#e7f4ef] px-2.5 py-1 font-semibold text-[#0e6f59]">
                        Members: {league.memberCount}
                      </span>
                      <span className="rounded-full bg-[#e8f0ff] px-2.5 py-1 font-semibold text-[#294a9b]">
                        Invite: {league.inviteCode}
                      </span>
                      <span className={`rounded-full px-2.5 py-1 font-semibold ${isAdmin ? 'bg-[#fff3cd] text-[#856404]' : 'bg-[#f0f3f6] text-[#58606a]'}`}>
                        {String(league.myRole || 'member').toUpperCase()}
                      </span>
                      {league.isOverall ? (
                        <span className="rounded-full bg-[#f7d9d5] px-2.5 py-1 font-semibold text-[#8a3d35]">OVERALL</span>
                      ) : null}
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    <button
                      type="button"
                      onClick={() => handleToggleDetails(league.id)}
                      disabled={actionLoading}
                      className="rounded-lg border border-[#d8cfbf] px-3 py-1.5 text-xs font-semibold text-[#38424d] hover:bg-[#f7f2e9] disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      {details ? 'Hide Standings' : 'View Standings'}
                    </button>
                    {canLeave ? (
                      <button
                        type="button"
                        onClick={() => handleLeaveLeague(league.id)}
                        disabled={actionLoading}
                        className="rounded-lg border border-[#efc3bb] bg-[#fff4f2] px-3 py-1.5 text-xs font-semibold text-[#9a3d2e] hover:bg-[#ffe9e4] disabled:cursor-not-allowed disabled:opacity-60"
                      >
                        Leave
                      </button>
                    ) : null}
                  </div>
                </div>

                {details ? (
                  <div className="mt-3 rounded-xl border border-[#e4ddd2] bg-[#faf6ef] p-3">
                    <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[#6a7683]">Private League Leaderboard</p>
                    {Array.isArray(details.standings) && details.standings.length ? (
                      <div className="mt-2 overflow-x-auto rounded-lg border border-[#e4ddd2] bg-white">
                        <table className="min-w-full text-left text-xs">
                          <thead className="bg-[#f3efe7] text-[#5f6a76]">
                            <tr>
                              <th className="px-2 py-2 font-semibold">Rank</th>
                              <th className="px-2 py-2 font-semibold">Manager</th>
                              <th className="px-2 py-2 font-semibold">Role</th>
                              <th className="px-2 py-2 font-semibold">Matches</th>
                              <th className="px-2 py-2 font-semibold text-right">Points</th>
                            </tr>
                          </thead>
                          <tbody>
                            {details.standings.map((item) => (
                              <tr key={item.userId} className="border-t border-[#f0ebe1]">
                                <td className="px-2 py-1.5 font-semibold text-[#38424d]">#{item.rank}</td>
                                <td className="px-2 py-1.5 text-[#38424d]">
                                  {item.name}
                                  {Number(item.userId) === Number(currentUser?.id) ? ' (You)' : ''}
                                </td>
                                <td className="px-2 py-1.5 text-[#6a7683]">{String(item.role || 'member').toUpperCase()}</td>
                                <td className="px-2 py-1.5 text-[#6a7683]">{Number(item.matches || 0)}</td>
                                <td className="px-2 py-1.5 text-right font-semibold text-[#0e6f59]">
                                  {Number(item.totalPoints || 0).toFixed(2)}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    ) : (
                      <p className="mt-2 text-xs text-[#5f6a76]">No finalized standings yet.</p>
                    )}
                  </div>
                ) : null}
              </article>
            )
          })
        ) : (
          <div className="rounded-xl border border-[#e4ddd2] bg-[#faf6ef] p-3 text-sm text-[#5f6a76]">
            You are not in any private league for this season yet.
          </div>
        )}
      </div>
    </section>
  )
}