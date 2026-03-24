// Player filtering and sorting logic

export const getHomeCountry = (mode) => {
  return mode === 'Classic' ? 'India' : null
}

export const getUniqueTeams = (players) => {
  const teams = new Set(players.map((p) => p.team))
  return Array.from(teams).sort()
}

export const filterPlayersByRole = (players, role) => {
  return players.filter((player) => player.role === role)
}

export const applyHomeAwayFilter = (players, mode, filter, homeCountry) => {
  if (mode !== 'Classic' || filter === 'all') {
    return players
  }

  return players.filter((player) => {
    const isHome = player.country === homeCountry
    return filter === 'home' ? isHome : !isHome
  })
}

export const applyTeamFilter = (players, teamFilter) => {
  if (!teamFilter) return players
  return players.filter((player) => player.team === teamFilter)
}

export const sortByCredits = (players, sortOrder) => {
  return [...players].sort((a, b) => {
    return sortOrder === 'desc' ? b.credits - a.credits : a.credits - b.credits
  })
}

export const searchPlayers = (players, query) => {
  if (!query) return players

  const lowerQuery = query.trim().toLowerCase()
  return players.filter(
    (player) =>
      player.name.toLowerCase().includes(lowerQuery) ||
      player.team.toLowerCase().includes(lowerQuery) ||
      player.country.toLowerCase().includes(lowerQuery),
  )
}

export const sortSelectedPlayersFirst = (players, selectedIds) => {
  return [...players].sort((a, b) => {
    const aIndex = selectedIds.indexOf(a.id)
    const bIndex = selectedIds.indexOf(b.id)
    if (aIndex === -1 && bIndex === -1) return 0
    if (aIndex === -1) return 1
    if (bIndex === -1) return -1
    return aIndex - bIndex
  })
}
