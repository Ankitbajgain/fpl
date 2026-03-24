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

  const homeCountry = useMemo(() => getHomeCountry(mode), [mode])
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

      if (total <= budgetCap && total > bestTotal) {
        bestSelection = picked
        bestTotal = total
      }

      if (Math.abs(total - budgetCap) < 0.001) {
        bestSelection = picked
        bestTotal = total
        break
      }
    }

    if (!bestSelection) {
      setSelectionMessage('Could not find a random 11-player squad within 100 credits. Try again.')
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
    return <FixtureSelector selectedFixture={selectedFixture} onSelectFixture={setSelectedFixture} />
  }

  // Render: Authenticated
  return (
    <div className="min-h-screen bg-mist font-body text-ink">
      <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        <LeagueHeader />
        <Header selectedCount={selectedIds.length} creditsUsed={creditsUsed} creditsLeft={creditsLeft} />

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
            onModeChange={(newMode) => dispatch(setMode(newMode))}
            onCaptainChange={setCaptainId}
            onViceCaptainChange={setViceCaptainId}
            onValidate={handleValidateSquad}
            onLogout={handleLogout}
          />

          <PlayerPool
            mode={mode}
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
