import { useEffect, useMemo, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import {
  clearValidationState,
  setPlayers,
  setSelectedIds,
  setValidationError,
  setValidationResult,
  setMode,
  togglePlayer,
  clearAuthSession,
} from './features/squad/squadSlice'
import { useAuth } from './hooks/useAuth'
import { AuthPanel } from './components/Auth/AuthPanel'
import { Header } from './components/Header/Header'
import { Sidebar } from './components/Sidebar/Sidebar'
import { PlayerPool } from './components/PlayerPool/PlayerPool'
import { LeagueSelector } from './components/LeagueSelector/LeagueSelector'
import { LeagueHeader } from './components/LeagueSelector/LeagueHeader'
import { FixtureSelector } from './components/LeagueSelector/FixtureSelector'
import { PrivateLeaguePanel } from './components/LeagueSelector/PrivateLeaguePanel'
import {
  getHomeCountry,
  getUniqueTeams,
  filterPlayersByRole,
  applyHomeAwayFilter,
  applyTeamFilter,
  sortByCredits,
  searchPlayers,
  sortSelectedPlayersFirst,
} from './utils/playerFiltering'
import { calculateFormation, generateValidRoleCombinations } from './utils/formation'
import { budgetCap, roleKeys, roleRules } from './constants/gameConfig'

function App() {
  const dispatch = useDispatch()
  const {
    players,
    selectedIds,
    mode,
    validationResult,
    validationError,
    selectedLeagueSeason,
    leagues,
  } = useSelector((state) => state.squad)

  // Auth hook
  const {
    authToken,
    currentUser,
    authLoading,
    authError,
    setAuthError,
    handleLogin,
    handleRegister,
    restoreSession,
    handleLogout: authLogout,
  } = useAuth()

  // UI state
  const [activeRoleTab, setActiveRoleTab] = useState('SELECTED')
  const [playersLoading, setPlayersLoading] = useState(false)
  const [playersError, setPlayersError] = useState('')
  const [searchQuery, setSearchQuery] = useState('')
  const [creditSort, setCreditSort] = useState('desc')
  const [homeAwayFilter, setHomeAwayFilter] = useState('all')
  const [teamFilter, setTeamFilter] = useState('')
  const [selectionMessage, setSelectionMessage] = useState('')
  const [validateLoading, setValidateLoading] = useState(false)
  const [applyLoading, setApplyLoading] = useState(false)
  const [applyMessage, setApplyMessage] = useState('')
  const [transferMeta, setTransferMeta] = useState(null)
  const [transferMetaLoading, setTransferMetaLoading] = useState(false)
  const [transferMetaError, setTransferMetaError] = useState('')
  const [transferPolicy, setTransferPolicy] = useState(null)
  const [transferPolicyLoading, setTransferPolicyLoading] = useState(false)
  const [transferPolicyError, setTransferPolicyError] = useState('')
  const [transferWindowStatus, setTransferWindowStatus] = useState(null)
  const [playerLeaderboard, setPlayerLeaderboard] = useState([])
  const [managerLeaderboard, setManagerLeaderboard] = useState([])
  const [leaderboardLoading, setLeaderboardLoading] = useState(false)
  const [managerLeaderboardLoading, setManagerLeaderboardLoading] = useState(false)
  const [leaderboardError, setLeaderboardError] = useState('')
  const [managerLeaderboardError, setManagerLeaderboardError] = useState('')
  const [captainId, setCaptainId] = useState(selectedIds[0] ?? '')
  const [viceCaptainId, setViceCaptainId] = useState(selectedIds[1] ?? '')
  const [authNotice, setAuthNotice] = useState('')
  const [selectedFixture, setSelectedFixture] = useState(null)

  // Computed values
  const selectedPlayers = useMemo(
    () => players.filter((player) => selectedIds.includes(player.id)),
    [players, selectedIds],
  )

  const roleCounts = useMemo(
    () =>
      selectedPlayers.reduce(
        (counts, player) => {
          counts[player.role] += 1
          return counts
        },
        { WK: 0, BAT: 0, AR: 0, BOWL: 0 },
      ),
    [selectedPlayers],
  )

  const selectedLeague = useMemo(
    () => leagues.find((league) => league.id === selectedLeagueSeason) || null,
    [leagues, selectedLeagueSeason],
  )

  const homeCountry = useMemo(() => getHomeCountry(mode, selectedLeague?.nation), [mode, selectedLeague])
  const allTeams = useMemo(() => getUniqueTeams(players), [players])

  const filteredPlayers = useMemo(() => {
    if (activeRoleTab === 'SELECTED') return selectedPlayers

    let list = filterPlayersByRole(players, activeRoleTab)
    list = applyHomeAwayFilter(list, mode, homeAwayFilter, homeCountry)
    list = applyTeamFilter(list, teamFilter)
    list = sortByCredits(list, creditSort)

    return list
  }, [activeRoleTab, players, selectedPlayers, mode, homeAwayFilter, teamFilter, creditSort, homeCountry])

  const displayedPlayers = useMemo(() => {
    if (activeRoleTab === 'SELECTED') {
      return sortSelectedPlayersFirst(filteredPlayers, selectedIds)
    }
    return searchPlayers(filteredPlayers, searchQuery)
  }, [activeRoleTab, filteredPlayers, searchQuery, selectedIds])

  const creditsUsed = selectedPlayers.reduce((sum, player) => sum + player.credits, 0)
  const creditsLeft = Math.max(0, budgetCap - creditsUsed)

  // Effects
  useEffect(() => {
    restoreSession()
  }, [])

  useEffect(() => {
    setSelectedFixture(null)
    setTransferMeta(null)
    setTransferMetaError('')
    setTransferPolicy(null)
    setTransferPolicyError('')
    setApplyMessage('')
    setTransferWindowStatus(null)
    setPlayerLeaderboard([])
    setManagerLeaderboard([])
    setLeaderboardError('')
    setManagerLeaderboardError('')
  }, [selectedLeagueSeason])

  useEffect(() => {
    const fetchTransferPolicy = async () => {
      if (!authToken || !selectedLeagueSeason) return

      setTransferPolicyLoading(true)
      setTransferPolicyError('')

      try {
        const response = await fetch(`/api/v1/gameplay/leagues/${selectedLeagueSeason}/transfers/policy`, {
          headers: { Authorization: `Bearer ${authToken}` },
        })
        const payload = await response.json()

        if (!response.ok || !payload.success) {
          setTransferPolicyError(payload.message || 'Unable to load transfer policy')
          setTransferPolicyLoading(false)
          return
        }

        setTransferPolicy(payload.data)
        setTransferPolicyLoading(false)
      } catch {
        setTransferPolicyError('Network error while loading transfer policy')
        setTransferPolicyLoading(false)
      }
    }

    fetchTransferPolicy()
  }, [authToken, selectedLeagueSeason])

  // Poll real-time transfer window status every 10 s
  useEffect(() => {
    let intervalId
    const fetchWindowStatus = async () => {
      if (!authToken || !selectedLeagueSeason) return
      try {
        const response = await fetch(
          `/api/v1/gameplay/leagues/${selectedLeagueSeason}/transfer-window`,
          { headers: { Authorization: `Bearer ${authToken}` } },
        )
        const payload = await response.json()
        if (response.ok && payload.success) setTransferWindowStatus(payload.data)
      } catch { /* silent */ }
    }
    if (authToken && selectedLeagueSeason) {
      fetchWindowStatus()
      intervalId = setInterval(fetchWindowStatus, 10000)
    }
    return () => clearInterval(intervalId)
  }, [authToken, selectedLeagueSeason])

  // Poll combined leaderboard every 20 s
  useEffect(() => {
    let intervalId

    const fetchLeaderboard = async () => {
      if (!authToken || !selectedLeagueSeason) return

      setLeaderboardLoading(true)
      setManagerLeaderboardLoading(true)
      setLeaderboardError('')
      setManagerLeaderboardError('')
      try {
        const response = await fetch(
          `/api/v1/gameplay/leagues/${selectedLeagueSeason}/leaderboard?playersLimit=10&managersLimit=10`,
          { headers: { Authorization: `Bearer ${authToken}` } },
        )
        const payload = await response.json()
        if (!response.ok || !payload.success) {
          setLeaderboardError(payload.message || 'Unable to load leaderboard')
          setManagerLeaderboardError(payload.message || 'Unable to load manager leaderboard')
          setLeaderboardLoading(false)
          setManagerLeaderboardLoading(false)
          return
        }
        setPlayerLeaderboard(Array.isArray(payload.data?.players) ? payload.data.players : [])
        setManagerLeaderboard(Array.isArray(payload.data?.managers) ? payload.data.managers : [])
        setLeaderboardLoading(false)
        setManagerLeaderboardLoading(false)
      } catch {
        setLeaderboardError('Network error while loading leaderboard')
        setManagerLeaderboardError('Network error while loading manager leaderboard')
        setLeaderboardLoading(false)
        setManagerLeaderboardLoading(false)
      }
    }

    if (authToken && selectedLeagueSeason) {
      fetchLeaderboard()
      intervalId = setInterval(fetchLeaderboard, 20000)
    }

    return () => clearInterval(intervalId)
  }, [authToken, selectedLeagueSeason])

  useEffect(() => {
    const fetchTransferMeta = async () => {
      if (!authToken || !selectedLeagueSeason || !selectedFixture) return

      setTransferMetaLoading(true)
      setTransferMetaError('')

      try {
        const response = await fetch('/api/v1/gameplay/transfers/meta', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${authToken}`,
          },
          body: JSON.stringify({
            usedTransfers: 0,
            freeTransfers: 0,
            fixtureStartAt: selectedFixture.startsAt,
            tossAt: selectedFixture.tossAt,
            leagueSeasonId: selectedLeagueSeason,
          }),
        })

        const payload = await response.json()
        if (!response.ok || !payload.success) {
          setTransferMetaError(payload.message || 'Unable to fetch transfer window details')
          setTransferMetaLoading(false)
          return
        }

        setTransferMeta(payload.data)
        setTransferMetaLoading(false)
      } catch {
        setTransferMetaError('Network error while loading transfer details')
        setTransferMetaLoading(false)
      }
    }

    fetchTransferMeta()
  }, [authToken, selectedLeagueSeason, selectedFixture])

  useEffect(() => {
    const fetchPlayers = async () => {
      if (!authToken || !selectedLeagueSeason) return

      setPlayersLoading(true)
      setPlayersError('')

      try {
        const response = await fetch(`/api/v1/gameplay/leagues/${selectedLeagueSeason}/players`, {
          headers: { Authorization: `Bearer ${authToken}` },
        })

        const payload = await response.json()
        if (!response.ok || !payload.success || !Array.isArray(payload.data)) {
          setPlayersError(payload.message || 'Unable to load players list')
          setPlayersLoading(false)
          return
        }

        dispatch(setPlayers(payload.data))
        setPlayersLoading(false)
      } catch {
        setPlayersError('Network error while loading players')
        setPlayersLoading(false)
      }
    }

    fetchPlayers()
  }, [authToken, selectedLeagueSeason, dispatch])

  useEffect(() => {
    if (!selectedIds.length) {
      setCaptainId('')
      setViceCaptainId('')
      return
    }

    if (!selectedIds.includes(Number(captainId))) {
      setCaptainId(selectedIds[0])
    }

    if (!selectedIds.includes(Number(viceCaptainId)) || Number(viceCaptainId) === Number(captainId)) {
      const fallbackVice = selectedIds.find((id) => id !== Number(captainId)) ?? selectedIds[0]
      setViceCaptainId(fallbackVice)
    }
  }, [captainId, selectedIds, viceCaptainId])

  // Handlers
  const handleTogglePlayer = (player) => {
    const selected = selectedIds.includes(player.id)

    if (selected) {
      dispatch(togglePlayer(player.id))
      setSelectionMessage('')
      return
    }

    if (selectedIds.length >= 11) {
      setSelectionMessage('You can select maximum 11 players.')
      return
    }

    const rule = roleRules[player.role]
    if (rule && roleCounts[player.role] >= rule.max) {
      setSelectionMessage(`${player.role} can be maximum ${rule.max}.`)
      return
    }

    const normalizedName = String(player.name || '').trim().toLowerCase()
    const hasSameName = selectedPlayers.some(
      (selectedPlayer) =>
        selectedPlayer.id !== player.id && String(selectedPlayer.name || '').trim().toLowerCase() === normalizedName,
    )
    if (hasSameName) {
      setSelectionMessage('Duplicate player is not allowed in squad.')
      return
    }

    const normalizeCountry = (value) => String(value || '').trim().toLowerCase()
    const awayCount = selectedPlayers.filter(
      (selectedPlayer) => normalizeCountry(selectedPlayer.country) !== normalizeCountry(homeCountry),
    ).length
    const nextIsAway = normalizeCountry(player.country) !== normalizeCountry(homeCountry)
    if (mode === 'Classic' && nextIsAway && awayCount >= 4) {
      setSelectionMessage('Maximum 4 away players are allowed.')
      return
    }

    const sameTeamCount = selectedPlayers.filter(
      (selectedPlayer) => String(selectedPlayer.team || '').trim().toLowerCase() === String(player.team || '').trim().toLowerCase(),
    ).length
    if (sameTeamCount >= 7) {
      setSelectionMessage(`Maximum 7 players are allowed from ${player.team}.`)
      return
    }

    if (creditsUsed + player.credits > budgetCap) {
      setSelectionMessage(`Budget exceeded. Total cannot be above ${budgetCap} credits.`)
      return
    }

    dispatch(togglePlayer(player.id))
    setSelectionMessage('')
  }

  const handleAutoSelectPlayers = () => {
    if (players.length < 11) {
      setSelectionMessage('Not enough players to auto select 11.')
      return
    }

    const rolePlayers = roleKeys.reduce((acc, role) => {
      acc[role] = players.filter((player) => player.role === role)
      return acc
    }, {})

    for (const role of roleKeys) {
      if (rolePlayers[role].length < roleRules[role].min) {
        setSelectionMessage(`Not enough ${role} players to satisfy minimum ${roleRules[role].min}.`)
        return
      }
    }

    const validRoleCombinations = generateValidRoleCombinations(roleRules)

    let bestSelection = null
    let bestTotal = 0

    for (let attempt = 0; attempt < 3000; attempt += 1) {
      const combo = validRoleCombinations[Math.floor(Math.random() * validRoleCombinations.length)]
      const picked = []

      for (const role of roleKeys) {
        const shuffled = [...rolePlayers[role]].sort(() => Math.random() - 0.5)
        const required = combo[role]
        if (shuffled.length < required) {
          picked.length = 0
          break
        }
        picked.push(...shuffled.slice(0, required))
      }

      if (picked.length !== 11) {
        continue
      }

      const total = picked.reduce((sum, player) => sum + player.credits, 0)
      const awayCount = picked.filter(
        (player) => String(player.country || '').trim().toLowerCase() !== String(homeCountry || '').trim().toLowerCase(),
      ).length
      const teamCounts = picked.reduce((acc, player) => {
        const teamKey = String(player.team || '').trim().toLowerCase()
        acc[teamKey] = (acc[teamKey] || 0) + 1
        return acc
      }, {})
      const exceedsTeamLimit = Object.values(teamCounts).some((count) => count > 7)

      if (total <= budgetCap && awayCount <= 4 && !exceedsTeamLimit && total > bestTotal) {
        bestSelection = picked
        bestTotal = total
      }

      if (Math.abs(total - budgetCap) < 0.001 && awayCount <= 4 && !exceedsTeamLimit) {
        bestSelection = picked
        bestTotal = total
        break
      }
    }

    if (!bestSelection) {
      setSelectionMessage('Could not find a random 11-player squad within 100 credits, max 4 away players, and max 7 players per team. Try again.')
      return
    }

    dispatch(setSelectedIds(bestSelection.map((player) => player.id)))
    setSelectionMessage(
      bestTotal === budgetCap
        ? 'Random squad selected with 100 credits.'
        : `Random squad selected with ${bestTotal.toFixed(1)} credits (<= 100).`,
    )
    dispatch(clearValidationState())
  }

  const handleValidateSquad = async () => {
    if (!authToken) {
      dispatch(setValidationError('Please login first to validate the squad.'))
      return
    }

    if (selectedIds.length !== 11) {
      dispatch(setValidationError('Select exactly 11 players before validation.'))
      return
    }

    if (!captainId || !viceCaptainId || Number(captainId) === Number(viceCaptainId)) {
      dispatch(setValidationError('Captain and vice-captain must be different selected players.'))
      return
    }

    setValidateLoading(true)

    try {
      const response = await fetch('/api/v1/gameplay/squad/validate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${authToken}`,
        },
        body: JSON.stringify({
          playerIds: selectedIds,
          captainId: Number(captainId),
          viceCaptainId: Number(viceCaptainId),
          budgetCap,
          leagueSeasonId: selectedLeagueSeason,
        }),
      })

      const payload = await response.json()
      if (!response.ok || !payload.success) {
        dispatch(setValidationError(payload.message || 'Validation failed'))
        setValidateLoading(false)
        return
      }

      dispatch(setValidationResult(payload.data))
      setValidateLoading(false)
    } catch {
      dispatch(setValidationError('Network error while validating squad.'))
      setValidateLoading(false)
    }
  }

  const handleLogout = () => {
    dispatch(clearAuthSession())
    dispatch(clearValidationState())
    authLogout()
    setAuthError('')
    setAuthNotice('')
  }

  const handleApplyTransfers = async () => {
    if (!authToken || !selectedLeagueSeason || !selectedFixture) {
      setApplyMessage('Select league and fixture first.')
      return
    }

    if (selectedIds.length !== 11) {
      setApplyMessage('Select exactly 11 players before applying transfers.')
      return
    }

    if (!captainId || !viceCaptainId || Number(captainId) === Number(viceCaptainId)) {
      setApplyMessage('Captain and vice-captain must be different selected players.')
      return
    }

    setApplyLoading(true)
    setApplyMessage('')

    try {
      const response = await fetch(
        `/api/v1/gameplay/leagues/${selectedLeagueSeason}/fixtures/${selectedFixture.id}/squad/apply`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${authToken}`,
          },
          body: JSON.stringify({
            playerIds: selectedIds,
            captainId: Number(captainId),
            viceCaptainId: Number(viceCaptainId),
            budgetCap,
          }),
        },
      )

      const payload = await response.json()
      if (!response.ok || !payload.success) {
        setApplyMessage(payload.message || 'Failed to apply transfers')
        setApplyLoading(false)
        return
      }

      const result = payload.data
      const scopeText = result.deferredToNextFixture
        ? `Applied to upcoming fixture #${result.appliedToFixtureId} (current fixture already started).`
        : `Applied to fixture #${result.appliedToFixtureId}.`

      setApplyMessage(`${scopeText} Transfers used now: ${result.transfersUsed}.`)

      // Refresh transfer meta after successful apply
      const metaResponse = await fetch('/api/v1/gameplay/transfers/meta', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${authToken}`,
        },
        body: JSON.stringify({
          usedTransfers: 0,
          freeTransfers: 0,
          fixtureStartAt: selectedFixture.startsAt,
          tossAt: selectedFixture.tossAt,
          leagueSeasonId: selectedLeagueSeason,
        }),
      })

      const metaPayload = await metaResponse.json()
      if (metaResponse.ok && metaPayload.success) {
        setTransferMeta(metaPayload.data)
      }

      setApplyLoading(false)
    } catch {
      setApplyMessage('Network error while applying transfers.')
      setApplyLoading(false)
    }
  }

  // Render: Not authenticated
  if (!authToken || !currentUser) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-mist px-4 py-10 font-body text-ink">
        <AuthPanel
          onLogin={handleLogin}
          onRegister={handleRegister}
          isLoading={authLoading}
          error={authError}
          notice={authNotice}
          setError={setAuthError}
          setNotice={setAuthNotice}
        />
      </div>
    )
  }

  // Render: League selector (after auth, before squad builder)
  if (!selectedLeagueSeason) {
    return <LeagueSelector />
  }

  // Render: Fixture selector (after league selected, before squad builder)
  if (!selectedFixture) {
    return (
      <div className="mx-auto max-w-5xl space-y-6 px-4 py-6 sm:px-6">
        <PrivateLeaguePanel
          authToken={authToken}
          selectedLeagueSeason={selectedLeagueSeason}
          currentUser={currentUser}
        />
        <FixtureSelector selectedFixture={selectedFixture} onSelectFixture={setSelectedFixture} />
      </div>
    )
  }

  // Render: Authenticated
  return (
    <div className="min-h-screen bg-mist font-body text-ink">
      <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        <LeagueHeader />
        <Header selectedCount={selectedIds.length} creditsUsed={creditsUsed} creditsLeft={creditsLeft} />

        <section className="mt-6">
          <PrivateLeaguePanel
            authToken={authToken}
            selectedLeagueSeason={selectedLeagueSeason}
            currentUser={currentUser}
          />
        </section>

        <section className="mt-6 grid gap-6 lg:grid-cols-[0.75fr_1.25fr]">
          <Sidebar
            mode={mode}
            roleCounts={roleCounts}
            currentUser={currentUser}
            selectedPlayers={selectedPlayers}
            captainId={captainId}
            viceCaptainId={viceCaptainId}
            validateLoading={validateLoading}
            validationResult={validationResult}
            validationError={validationError}
            transferMeta={transferMeta}
            transferMetaLoading={transferMetaLoading}
            transferMetaError={transferMetaError}
            transferPolicy={transferPolicy}
            transferPolicyLoading={transferPolicyLoading}
            transferPolicyError={transferPolicyError}
            transferWindowStatus={transferWindowStatus}
            playerLeaderboard={playerLeaderboard}
            managerLeaderboard={managerLeaderboard}
            leaderboardLoading={leaderboardLoading}
            managerLeaderboardLoading={managerLeaderboardLoading}
            leaderboardError={leaderboardError}
            managerLeaderboardError={managerLeaderboardError}
            applyLoading={applyLoading}
            applyMessage={applyMessage}
            onModeChange={(newMode) => dispatch(setMode(newMode))}
            onCaptainChange={setCaptainId}
            onViceCaptainChange={setViceCaptainId}
            onValidate={handleValidateSquad}
            onApplyTransfers={handleApplyTransfers}
            onLogout={handleLogout}
          />

          <PlayerPool
            mode={mode}
            homeCountry={homeCountry}
            activeTab={activeRoleTab}
            displayedPlayers={displayedPlayers}
            selectedIds={selectedIds}
            creditSort={creditSort}
            homeAwayFilter={homeAwayFilter}
            teamFilter={teamFilter}
            allTeams={allTeams}
            searchQuery={searchQuery}
            playersLoading={playersLoading}
            playersError={playersError}
            selectionMessage={selectionMessage}
            transferWindowLocked={
              transferWindowStatus
                ? !transferWindowStatus.windowOpen
                : transferMeta?.locked || false
            }
            onTabChange={(tab) => {
              setActiveRoleTab(tab)
              setSelectionMessage('')
            }}
            onTogglePlayer={handleTogglePlayer}
            onAutoSelect={handleAutoSelectPlayers}
            onSearchChange={setSearchQuery}
            onCreditSortChange={setCreditSort}
            onHomeAwayChange={setHomeAwayFilter}
            onTeamFilterChange={setTeamFilter}
          />
        </section>
      </main>
    </div>
  )
}

export default App
