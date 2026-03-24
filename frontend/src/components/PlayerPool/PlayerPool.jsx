import { RoleTabs } from './RoleTabs'
import { FilterPanel } from './FilterPanel'
import { PlayerGrid } from './PlayerGrid'

export function SelectedPlayersPanel({ onAutoSelect, isLoading, selectionMessage }) {
  return (
    <div className="mt-4 rounded-xl bg-[#f8f2e8] p-3">
      <button
        onClick={onAutoSelect}
        disabled={isLoading}
        className="w-full rounded-lg bg-[#173f34] px-3 py-2 text-sm font-semibold text-white disabled:opacity-60"
      >
        Auto Select Random 11
      </button>
      {selectionMessage ? <p className="mt-2 text-xs text-[#44505c]">{selectionMessage}</p> : null}
    </div>
  )
}

export function PlayerPool({
  mode,
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
  onTabChange,
  onTogglePlayer,
  onAutoSelect,
  onSearchChange,
  onCreditSortChange,
  onHomeAwayChange,
  onTeamFilterChange,
}) {
  return (
    <section className="rounded-3xl border border-[#e4ddd2] bg-white p-5 shadow-card">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h2 className="font-heading text-xl">Player Pool</h2>
        <p className="text-sm text-[#667481]">Tap cards to add/remove players from your squad.</p>
      </div>

      <div className="mt-4">
        <RoleTabs activeTab={activeTab} onTabChange={onTabChange} />
      </div>

      {activeTab === 'SELECTED' ? (
        <SelectedPlayersPanel onAutoSelect={onAutoSelect} isLoading={playersLoading} selectionMessage={selectionMessage} />
      ) : (
        <div className="mt-4">
          <FilterPanel
            mode={mode}
            creditSort={creditSort}
            homeAwayFilter={homeAwayFilter}
            teamFilter={teamFilter}
            allTeams={allTeams}
            searchQuery={searchQuery}
            onSearchChange={onSearchChange}
            onCreditSortChange={onCreditSortChange}
            onHomeAwayChange={onHomeAwayChange}
            onTeamFilterChange={onTeamFilterChange}
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

      <PlayerGrid players={displayedPlayers} selectedIds={selectedIds} onTogglePlayer={onTogglePlayer} mode={mode} />
    </section>
  )
}
