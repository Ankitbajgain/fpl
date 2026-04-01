export function FilterPanel({
  mode,
  homeCountry,
  creditSort,
  homeAwayFilter,
  teamFilter,
  allTeams,
  searchQuery,
  onSearchChange,
  onCreditSortChange,
  onHomeAwayChange,
  onTeamFilterChange,
  isLocked,
}) {
  return (
    <div
      className={`space-y-3 rounded-xl border p-3 ${isLocked ? "border-red-200 bg-red-50" : "border-[#e3ebf5] bg-[#f8fbff]"}`}
    >
      <div>
        <label className="block text-xs font-semibold uppercase tracking-[0.12em] text-[#6a7683]">
          Search
        </label>
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Name, team, country..."
          disabled={isLocked}
          className="mt-1 w-full rounded-lg border border-[#ddd2c3] bg-white px-3 py-2 text-sm disabled:opacity-60"
        />
      </div>

      <div>
        <label className="block text-xs font-semibold uppercase tracking-[0.12em] text-[#6a7683]">
          Credits
        </label>
        <select
          value={creditSort}
          onChange={(e) => onCreditSortChange(e.target.value)}
          disabled={isLocked}
          className="mt-1 w-full rounded-lg border border-[#ddd2c3] bg-white px-3 py-2 text-sm disabled:opacity-60"
        >
          <option value="desc">High to Low</option>
          <option value="asc">Low to High</option>
        </select>
      </div>

      {mode === "Classic" && (
        <div>
          <label className="block text-xs font-semibold uppercase tracking-[0.12em] text-[#6a7683]">
            Home / Away
          </label>
          <select
            value={homeAwayFilter}
            onChange={(e) => onHomeAwayChange(e.target.value)}
            disabled={isLocked}
            className="mt-1 w-full rounded-lg border border-[#ddd2c3] bg-white px-3 py-2 text-sm disabled:opacity-60"
          >
            <option value="all">All Players</option>
            <option value="home">Home ({homeCountry || "League"})</option>
            <option value="away">Away 🛫</option>
          </select>
        </div>
      )}

      <div>
        <label className="block text-xs font-semibold uppercase tracking-[0.12em] text-[#6a7683]">
          {mode === "Classic" ? "Franchise" : "National Team"}
        </label>
        <select
          value={teamFilter}
          onChange={(e) => onTeamFilterChange(e.target.value)}
          disabled={isLocked}
          className="mt-1 w-full rounded-lg border border-[#ddd2c3] bg-white px-3 py-2 text-sm disabled:opacity-60"
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
  );
}
