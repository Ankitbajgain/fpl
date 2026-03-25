import { RoleTabs } from './RoleTabs'
import { FilterPanel } from './FilterPanel'
import { PlayerGrid } from './PlayerGrid'

export function SelectedPlayersPanel({ onAutoSelect, isLoading, selectionMessage, isLocked }) {
  return (
    <div className="mt-4 rounded-xl bg-[#f8f2e8] p-3">
      <button
        onClick={onAutoSelect}
        disabled={isLoading || isLocked}
        className="w-full rounded-lg bg-[#173f34] px-3 py-2 text-sm font-semibold text-white disabled:opacity-60"
      >
        {isLocked ? '🔒 Auto Select Locked' : 'Auto Select Random 11'}
      </button>
      {isLocked ? <p className="mt-2 text-xs text-red-600">Transfer window is locked. No changes allowed.</p> : null}
      {selectionMessage ? <p className="mt-2 text-xs text-[#44505c]">{selectionMessage}</p> : null}
    </div>
  )
}

export function PlayerPool({
  mode,
  homeCountry,
  activeTab,
  displayedPlayers,
  selectedIds,
  creditSort,
  homeAwayFilter,
  teamFilter,
  allTeams,
  searchQuery,
  playersLoading,
  playersError,
  selectionMessage,
  transferWindowLocked,
  onTabChange,
  onTogglePlayer,
  onAutoSelect,
  onSearchChange,
  onCreditSortChange,
  onHomeAwayChange,
  onTeamFilterChange,
}) {
  const handleTogglePlayer = (player) => {
    if (transferWindowLocked) return
    onTogglePlayer(player)
  }

  const handleTabChange = (tab) => {
    if (transferWindowLocked) return
    onTabChange(tab)
  }

  const handleSearchChange = (query) => {
    if (transferWindowLocked) return
    onSearchChange(query)
  }

  const handleCreditSortChange = (sort) => {
    if (transferWindowLocked) return
    onCreditSortChange(sort)
  }

  const handleHomeAwayChange = (filter) => {
    if (transferWindowLocked) return
    onHomeAwayChange(filter)
  }

  const handleTeamFilterChange = (team) => {
    if (transferWindowLocked) return
    onTeamFilterChange(team)
  }

  const handleAutoSelect = () => {
    if (transferWindowLocked) return
    onAutoSelect()
  }

  return (
    <section className={`rounded-3xl border shadow-card ${
      transferWindowLocked
        ? 'border-red-400 bg-red-50'
        : 'border-[#e4ddd2] bg-white'
    } p-5`}>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h2 className="font-heading text-xl">Player Pool</h2>
        {transferWindowLocked ? (
          <p className="text-sm font-semibold text-red-600">🔒 Transfer Window Locked - No Changes Allowed</p>
        ) : (
          <p className="text-sm text-[#667481]">Tap cards to add/remove players from your squad.</p>
        )}
      </div>

      <div className="mt-4">
        <RoleTabs activeTab={activeTab} onTabChange={handleTabChange} isLocked={transferWindowLocked} />
      </div>

      {activeTab === 'SELECTED' ? (
        <SelectedPlayersPanel
          onAutoSelect={handleAutoSelect}
          isLoading={playersLoading}
          selectionMessage={selectionMessage}
          isLocked={transferWindowLocked}
        />
      ) : (
        <div className="mt-4">
          <FilterPanel
            mode={mode}
            homeCountry={homeCountry}
            creditSort={creditSort}
            homeAwayFilter={homeAwayFilter}
            teamFilter={teamFilter}
            allTeams={allTeams}
            searchQuery={searchQuery}
            onSearchChange={handleSearchChange}
            onCreditSortChange={handleCreditSortChange}
            onHomeAwayChange={handleHomeAwayChange}
            onTeamFilterChange={handleTeamFilterChange}
            isLocked={transferWindowLocked}
          />
        </div>
      )}

      {playersLoading ? (
        <p className="mt-4 rounded-xl bg-[#f8f2e8] px-3 py-2 text-sm text-[#5f6a76]">
          Loading players from backend...
        </p>
      ) : null}

      {playersError ? (
        <p className="mt-4 rounded-xl bg-[#fff1f1] px-3 py-2 text-sm text-red-700">{playersError}</p>
      ) : null}

      <PlayerGrid
        players={displayedPlayers}
        selectedIds={selectedIds}
        onTogglePlayer={handleTogglePlayer}
        mode={mode}
        homeCountry={homeCountry}
        isLocked={transferWindowLocked}
      />
    </section>
  )
}
