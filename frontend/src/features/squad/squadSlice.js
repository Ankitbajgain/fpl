import { createSlice } from '@reduxjs/toolkit'

const ROLE_LIMITS = {
  WK: { min: 1, max: 4 },
  BAT: { min: 3, max: 6 },
  AR: { min: 1, max: 4 },
  BOWL: { min: 3, max: 6 },
}

const initialState = {
  // Multi-league support
  leagues: [],                    // Available leagues [{ id, name, competition, nation, ... }]
  selectedLeagueSeason: null,     // Currently selected league (e.g., "IPL_2025")
  squads: {},                    // Squads per league { "IPL_2025": { selectedIds, captain, ... }, "PSL_2025": { ... } }
  
  // Current league/squad state (derived from selectedLeagueSeason)
  players: [],
  selectedIds: [],
  budgetCap: 100,
  formation: '1-4-2-4',
  
  // User state
  mode: 'Classic',
  favorites: {},                 // Favorites per league { "IPL_2025": [1,2,3], "PSL_2025": [4,5,6] }
  authToken: null,
  currentUser: null,
  
  // Validation state
  validationResult: null,
  validationError: null,
  leaguesLoading: false,
  leaguesError: null,
}

const squadSlice = createSlice({
  name: 'squad',
  initialState,
  reducers: {
    // ========================================================================
    // MULTI-LEAGUE ACTIONS
    // ========================================================================
    
    setLeagues(state, action) {
      state.leagues = action.payload
      state.leaguesError = null
    },
    
    setLeaguesLoading(state, action) {
      state.leaguesLoading = action.payload
    },
    
    setLeaguesError(state, action) {
      state.leaguesError = action.payload
    },
    
    selectLeague(state, action) {
      const leagueId = action.payload
      
      // Save current squad state before switching
      if (state.selectedLeagueSeason && !state.squads[state.selectedLeagueSeason]) {
        state.squads[state.selectedLeagueSeason] = {
          selectedIds: state.selectedIds,
          formation: state.formation,
        }
      }
      
      // Switch to new league
      state.selectedLeagueSeason = leagueId
      
      // Restore squad state for new league (or initialize empty)
      const savedSquad = state.squads[leagueId] || { selectedIds: [], formation: '1-4-2-4' }
      state.selectedIds = savedSquad.selectedIds || []
      state.formation = savedSquad.formation || '1-4-2-4'
      state.players = []  // Reset players, will refetch for new league
    },
    
    // ========================================================================
    // PLAYER MANAGEMENT (League-aware in context of selectedLeagueSeason)
    // ========================================================================
    
    togglePlayer(state, action) {
      const id = action.payload
      const exists = state.selectedIds.includes(id)

      if (exists) {
        state.selectedIds = state.selectedIds.filter((playerId) => playerId !== id)
        return
      }

      const player = state.players.find((item) => item.id === id)
      if (!player) return

      const roleCount = state.selectedIds.reduce((count, playerId) => {
        const selectedPlayer = state.players.find((item) => item.id === playerId)
        if (selectedPlayer?.role === player.role) return count + 1
        return count
      }, 0)

      const roleLimit = ROLE_LIMITS[player.role]
      if (roleLimit && roleCount >= roleLimit.max) return

      if (state.selectedIds.length < 11) {
        state.selectedIds.push(id)
      }
    },
    
    setMode(state, action) {
      state.mode = action.payload
    },
    
    setFormation(state, action) {
      state.formation = action.payload
    },
    
    setPlayers(state, action) {
      const players = action.payload
      const playerIds = new Set(players.map((player) => player.id))

      state.players = players
      state.selectedIds = state.selectedIds.filter((id) => playerIds.has(id))
      
      // Update favorites for current league
      if (state.selectedLeagueSeason) {
        const leagueFavorites = state.favorites[state.selectedLeagueSeason] || []
        state.favorites[state.selectedLeagueSeason] = leagueFavorites.filter((id) => playerIds.has(id))
      }
    },
    
    setSelectedIds(state, action) {
      const nextIds = Array.isArray(action.payload) ? action.payload : []
      const validIds = new Set(state.players.map((player) => player.id))
      state.selectedIds = nextIds.filter((id) => validIds.has(id)).slice(0, 11)
    },
    
    toggleFavorite(state, action) {
      const id = action.payload
      const league = state.selectedLeagueSeason
      if (!league) return
      
      if (!state.favorites[league]) {
        state.favorites[league] = []
      }
      
      const exists = state.favorites[league].includes(id)
      if (exists) {
        state.favorites[league] = state.favorites[league].filter((playerId) => playerId !== id)
      } else {
        state.favorites[league].push(id)
      }
    },
    
    // ========================================================================
    // AUTH ACTIONS
    // ========================================================================
    
    setAuthSession(state, action) {
      state.authToken = action.payload.token
      state.currentUser = action.payload.user
    },
    
    clearAuthSession(state) {
      state.authToken = null
      state.currentUser = null
    },
    
    // ========================================================================
    // VALIDATION ACTIONS
    // ========================================================================
    
    setValidationResult(state, action) {
      state.validationResult = action.payload
      state.validationError = null
    },
    
    setValidationError(state, action) {
      state.validationError = action.payload
      state.validationResult = null
    },
    
    clearValidationState(state) {
      state.validationError = null
      state.validationResult = null
    },
  },
})

export const {
  // Multi-league
  setLeagues,
  setLeaguesLoading,
  setLeaguesError,
  selectLeague,
  // Player management
  togglePlayer,
  setMode,
  setFormation,
  setPlayers,
  setSelectedIds,
  toggleFavorite,
  // Auth
  setAuthSession,
  clearAuthSession,
  // Validation
  setValidationResult,
  setValidationError,
  clearValidationState,
} = squadSlice.actions

export default squadSlice.reducer
