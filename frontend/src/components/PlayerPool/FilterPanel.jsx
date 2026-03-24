export function FilterPanel({
  mode,
  creditSort,
  homeAwayFilter,
  teamFilter,
  allTeams,
  searchQuery,
  onSearchChange,
  onCreditSortChange,
  onHomeAwayChange,
  onTeamFilterChange,
}) {
  return (
    <div className="space-y-3 rounded-xl bg-[#f8f2e8] p-3">
      <div>
        <label className="block text-xs font-semibold uppercase tracking-[0.12em] text-[#6a7683]">
          Search
        </label>
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Name, team, country..."
          className="mt-1 w-full rounded-lg border border-[#ddd2c3] bg-white px-3 py-2 text-sm"
        />
      </div>

      <div>
        <label className="block text-xs font-semibold uppercase tracking-[0.12em] text-[#6a7683]">
          Credits
        </label>
        <select
          value={creditSort}
          onChange={(e) => onCreditSortChange(e.target.value)}
          className="mt-1 w-full rounded-lg border border-[#ddd2c3] bg-white px-3 py-2 text-sm"
        >
          <option value="desc">High to Low</option>
          <option value="asc">Low to High</option>
        </select>
      </div>

      {mode === 'Classic' && (
        <div>
          <label className="block text-xs font-semibold uppercase tracking-[0.12em] text-[#6a7683]">
            Home / Away
          </label>
          <select
            value={homeAwayFilter}
            onChange={(e) => onHomeAwayChange(e.target.value)}
            className="mt-1 w-full rounded-lg border border-[#ddd2c3] bg-white px-3 py-2 text-sm"
          >
            <option value="all">All Players</option>
            <option value="home">Home (India)</option>
            <option value="away">Away 🛫</option>
          </select>
        </div>
      )}

      <div>
        <label className="block text-xs font-semibold uppercase tracking-[0.12em] text-[#6a7683]">
          {mode === 'Classic' ? 'Franchise' : 'National Team'}
        </label>
        <select
          value={teamFilter}
          onChange={(e) => onTeamFilterChange(e.target.value)}
          className="mt-1 w-full rounded-lg border border-[#ddd2c3] bg-white px-3 py-2 text-sm"
        >
          <option value="">All Teams</option>
          {allTeams.map((team) => (
            <option key={team} value={team}>
              {team}
            </option>
          ))}
        </select>
      </div>
    </div>
  )
}
