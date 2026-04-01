import { useMemo, useState } from "react";
import { modeOptions, roleRules } from "../../constants/gameConfig";
import { calculateFormation } from "../../utils/formation";
import { FilterPanel } from "./FilterPanel";
import { PlayerGrid } from "./PlayerGrid";
import { RoleTabs } from "./RoleTabs";
import { TeamPreviewModal } from "./TeamPreviewModal";

export function PlayerPool({
  mode,
  homeCountry,
  roleCounts,
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
  selectedCount,
  creditsUsed,
  creditsLeft,
  onTabChange,
  onTogglePlayer,
  onAutoSelect,
  onSearchChange,
  onCreditSortChange,
  onHomeAwayChange,
  onTeamFilterChange,
  selectedPlayers,
  captainId,
  viceCaptainId,
  validateLoading,
  validationResult,
  validationError,
  applyLoading,
  applyMessage,
  transferMeta,
  transferMetaLoading,
  transferMetaError,
  transferPolicy,
  transferPolicyLoading,
  transferPolicyError,
  onModeChange,
  onCaptainChange,
  onViceCaptainChange,
  onValidate,
  onApplyTransfers,
}) {
  const [showTeamPreview, setShowTeamPreview] = useState(false);
  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);
  const [draftSearchQuery, setDraftSearchQuery] = useState(searchQuery);
  const [draftCreditSort, setDraftCreditSort] = useState(creditSort);
  const [draftHomeAwayFilter, setDraftHomeAwayFilter] =
    useState(homeAwayFilter);
  const [draftTeamFilter, setDraftTeamFilter] = useState(teamFilter);

  const currentFormation = useMemo(
    () => calculateFormation(roleCounts),
    [roleCounts],
  );

  const effectiveTab = activeTab;

  const handleTogglePlayer = (player) => {
    if (transferWindowLocked) return;
    onTogglePlayer(player);
  };

  const handleTabChange = (tab) => {
    if (transferWindowLocked) return;
    onTabChange(tab);
  };

  const handleSearchChange = (query) => {
    if (transferWindowLocked) return;
    onSearchChange(query);
  };

  const handleCreditSortChange = (sort) => {
    if (transferWindowLocked) return;
    onCreditSortChange(sort);
  };

  const handleHomeAwayChange = (filter) => {
    if (transferWindowLocked) return;
    onHomeAwayChange(filter);
  };

  const handleTeamFilterChange = (team) => {
    if (transferWindowLocked) return;
    onTeamFilterChange(team);
  };

  const handleAutoSelect = () => {
    if (transferWindowLocked) return;
    onAutoSelect();
  };

  const handleShowTeamPreview = () => {
    setShowTeamPreview(true);
  };

  const openFilterModal = () => {
    setDraftSearchQuery(searchQuery);
    setDraftCreditSort(creditSort);
    setDraftHomeAwayFilter(homeAwayFilter);
    setDraftTeamFilter(teamFilter);
    setIsFilterModalOpen(true);
  };

  const handleApplyFilters = () => {
    handleSearchChange(draftSearchQuery);
    handleCreditSortChange(draftCreditSort);
    handleHomeAwayChange(draftHomeAwayFilter);
    handleTeamFilterChange(draftTeamFilter);
    setIsFilterModalOpen(false);
  };

  const handleClearDraftFilters = () => {
    setDraftSearchQuery("");
    setDraftCreditSort("desc");
    setDraftHomeAwayFilter("all");
    setDraftTeamFilter("");
  };

  const selectedCaptain = selectedPlayers.find(
    (player) => Number(player.id) === Number(captainId),
  );

  const selectedViceCaptain = selectedPlayers.find(
    (player) => Number(player.id) === Number(viceCaptainId),
  );
  const isRandomAutoSelectError = selectionMessage.includes(
    "Could not find a random 11-player squad",
  );

  return (
    <>
      <section
        className={`rounded-3xl border shadow-card ${
          transferWindowLocked
            ? "border-red-400 bg-red-50"
            : "border-gray-200 bg-white"
        } p-6`}
      >
        {/* Header Section */}
        <div className="mb-6">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between mb-4">
            <div>
              <h2 className="font-heading text-2xl text-gray-900">
                🏏 Player Pool
              </h2>
              <p className="mt-1 text-sm text-gray-600">
                {selectedCount === 11
                  ? "✓ Your squad is complete! Preview and review when ready."
                  : selectedCount > 0
                    ? `${11 - selectedCount} more players needed to complete your squad`
                    : "Select players to build your 11-player squad"}
              </p>
            </div>
            {transferWindowLocked && (
              <span className="inline-flex items-center gap-1 rounded-lg bg-red-100 px-3 py-2 text-sm font-semibold text-red-700">
                🔒 Window Locked
              </span>
            )}
          </div>
        </div>

        <div className="mb-6 grid gap-4 lg:grid-cols-2">
          <div className="rounded-2xl border border-gray-200 bg-white p-4">
            <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[#5c6978]">
              Game Mode
            </p>
            <div className="mt-3 flex flex-wrap gap-2">
              {modeOptions.map((item) => (
                <button
                  key={item}
                  onClick={() => onModeChange(item)}
                  disabled={transferWindowLocked}
                  className={`rounded-xl px-3 py-2 text-sm font-semibold transition ${
                    mode === item
                      ? "bg-[#0b2b57] text-white"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  } disabled:opacity-60`}
                >
                  {item}
                </button>
              ))}
            </div>
          </div>

          <div className="rounded-2xl border border-gray-200 bg-white p-4">
            <div className="flex items-center justify-between">
              <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[#5c6978]">
                Formation (WK-BAT-AR-BOWL)
              </p>
              <span className="rounded-lg bg-[#0b2b57] px-2 py-1 text-xs font-bold text-white">
                {currentFormation}
              </span>
            </div>
            <div className="mt-3 grid grid-cols-2 gap-2 text-sm">
              <div className="rounded-lg bg-[#f5f8ff] p-2">
                WK: {roleCounts.WK} ({roleRules.WK.min}-{roleRules.WK.max})
              </div>
              <div className="rounded-lg bg-[#f5f8ff] p-2">
                BAT: {roleCounts.BAT} ({roleRules.BAT.min}-{roleRules.BAT.max})
              </div>
              <div className="rounded-lg bg-[#f5f8ff] p-2">
                AR: {roleCounts.AR} ({roleRules.AR.min}-{roleRules.AR.max})
              </div>
              <div className="rounded-lg bg-[#f5f8ff] p-2">
                BOWL: {roleCounts.BOWL} ({roleRules.BOWL.min}-
                {roleRules.BOWL.max})
              </div>
            </div>
            <p className="mt-2 text-xs text-[#617082]">
              Formation updates automatically as you pick your XI.
            </p>
          </div>
        </div>

        <div className="mb-6 grid gap-3 sm:grid-cols-3">
          <div className="rounded-2xl border border-[#dbe6f3] bg-[#f5f9ff] p-4">
            <p className="text-xs font-semibold uppercase tracking-wider text-[#2d527f]">
              Current Mode
            </p>
            <p className="mt-2 text-lg font-bold text-[#0b2b57]">{mode}</p>
          </div>
          <div className="rounded-2xl border border-[#d6e9e3] bg-[#f0faf6] p-4">
            <p className="text-xs font-semibold uppercase tracking-wider text-[#2a7258]">
              Credits
            </p>
            <p className="mt-2 text-lg font-bold text-[#14513e]">
              {creditsUsed.toFixed(1)}/100
            </p>
            <p className="text-xs text-[#2d6d56]">
              Left: {creditsLeft.toFixed(1)}
            </p>
          </div>
          <div className="rounded-2xl border border-[#f1dfd5] bg-[#fff6f1] p-4">
            <p className="text-xs font-semibold uppercase tracking-wider text-[#b15b33]">
              Players
            </p>
            <p className="mt-2 text-lg font-bold text-[#8a3f1e]">
              {selectedCount}/11
            </p>
          </div>
        </div>

        <div className="rounded-2xl border border-[#dce6f2] bg-[#f9fbff] p-4">
          <div className="mb-4 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
            <RoleTabs
              activeTab={effectiveTab}
              onTabChange={handleTabChange}
              isLocked={transferWindowLocked}
              roleCounts={roleCounts}
            />

            <div className="flex flex-wrap items-center gap-2">
              <button
                onClick={handleShowTeamPreview}
                disabled={selectedCount === 0 || transferWindowLocked}
                className="rounded-xl bg-[#ef8456] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[#df7547] disabled:opacity-60"
              >
                {selectedCount === 0
                  ? "Preview"
                  : `Preview (${selectedCount}/11)`}
              </button>
              <button
                onClick={handleAutoSelect}
                disabled={playersLoading || transferWindowLocked}
                className="rounded-xl bg-[#0b2b57] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[#1e4a8a] disabled:opacity-60"
              >
                Random 11
              </button>
            </div>

            <button
              onClick={openFilterModal}
              disabled={transferWindowLocked}
              className="rounded-xl border border-[#0b2b57]/20 bg-white px-4 py-2 text-sm font-semibold text-[#0b2b57] transition hover:bg-[#edf3ff] disabled:opacity-60"
            >
              Filter
            </button>
          </div>

          {isRandomAutoSelectError ? (
            <div className="mb-3 rounded-lg border border-yellow-200 bg-yellow-50 px-4 py-3">
              <p className="text-sm font-semibold text-yellow-700">
                ℹ️ {selectionMessage}
              </p>
            </div>
          ) : null}

          <div className="max-h-[55vh] overflow-y-auto rounded-xl border border-[#e4edf7] bg-white p-3">
            <PlayerGrid
              players={displayedPlayers}
              selectedIds={selectedIds}
              onTogglePlayer={handleTogglePlayer}
              mode={mode}
              homeCountry={homeCountry}
              creditsLeft={creditsLeft}
              isLocked={transferWindowLocked}
            />
          </div>
        </div>

        {/* Loading/Error States */}
        {playersLoading && (
          <div className="mt-4 rounded-lg bg-blue-50 border border-blue-200 px-4 py-3">
            <p className="text-sm text-blue-700 font-semibold flex items-center gap-2">
              <span className="animate-spin">⏳</span> Loading players...
            </p>
          </div>
        )}

        {playersError && (
          <div className="mt-4 rounded-lg bg-red-50 border border-red-200 px-4 py-3">
            <p className="text-sm text-red-700 font-semibold">
              ⚠️ {playersError}
            </p>
          </div>
        )}

        {selectionMessage && !isRandomAutoSelectError && (
          <div
            className={`mt-4 rounded-lg px-4 py-3 border ${
              selectionMessage.includes("Budget") ||
              selectionMessage.includes("maximum")
                ? "bg-yellow-50 border-yellow-200"
                : "bg-blue-50 border-blue-200"
            }`}
          >
            <p
              className={`text-sm font-semibold ${
                selectionMessage.includes("Budget") ||
                selectionMessage.includes("maximum")
                  ? "text-yellow-700"
                  : "text-blue-700"
              }`}
            >
              ℹ️ {selectionMessage}
            </p>
          </div>
        )}

        <div className="mt-6 space-y-4 border-t border-gray-200 pt-6">
          <div className="rounded-2xl border border-gray-200 bg-gray-50 p-4">
            <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[#5a6774]">
              Captaincy Setup
            </p>
            <div className="mt-3 grid gap-3 md:grid-cols-2">
              <div>
                <label className="mb-1 block text-xs font-semibold uppercase tracking-[0.1em] text-gray-600">
                  Captain
                </label>
                <select
                  value={captainId}
                  onChange={(e) => onCaptainChange(Number(e.target.value))}
                  disabled={
                    transferWindowLocked || selectedPlayers.length === 0
                  }
                  className="w-full rounded-xl border border-gray-300 bg-white px-3 py-2 text-sm disabled:opacity-60"
                >
                  {selectedPlayers.map((player) => (
                    <option key={`captain-${player.id}`} value={player.id}>
                      {player.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="mb-1 block text-xs font-semibold uppercase tracking-[0.1em] text-gray-600">
                  Vice Captain
                </label>
                <select
                  value={viceCaptainId}
                  onChange={(e) => onViceCaptainChange(Number(e.target.value))}
                  disabled={
                    transferWindowLocked || selectedPlayers.length === 0
                  }
                  className="w-full rounded-xl border border-gray-300 bg-white px-3 py-2 text-sm disabled:opacity-60"
                >
                  {selectedPlayers.map((player) => (
                    <option key={`vice-${player.id}`} value={player.id}>
                      {player.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <div className="mt-3 flex flex-wrap gap-2 text-xs">
              <span className="rounded-full bg-yellow-100 px-3 py-1 text-yellow-800">
                Captain: {selectedCaptain?.name || "Not selected"}
              </span>
              <span className="rounded-full bg-gray-200 px-3 py-1 text-gray-700">
                Vice Captain: {selectedViceCaptain?.name || "Not selected"}
              </span>
            </div>
          </div>

          <div className="grid gap-4 lg:grid-cols-2">
            <div className="rounded-2xl border border-gray-200 bg-white p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[#5a6774]">
                Validate Squad
              </p>
              <button
                onClick={onValidate}
                disabled={validateLoading || transferWindowLocked}
                className="mt-3 w-full rounded-xl bg-[#0b2b57] px-4 py-3 text-sm font-semibold text-white transition hover:bg-[#1e4a8a] disabled:opacity-60"
              >
                {validateLoading ? "Validating..." : "Validate Squad"}
              </button>
              {validationResult && (
                <p className="mt-2 text-sm text-green-700">
                  {validationResult}
                </p>
              )}
              {validationError && (
                <p className="mt-2 text-sm text-red-600">{validationError}</p>
              )}
            </div>

            <div className="rounded-2xl border border-gray-200 bg-white p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[#5a6774]">
                Apply Transfers
              </p>
              <button
                onClick={onApplyTransfers}
                disabled={applyLoading || transferWindowLocked}
                className="mt-3 w-full rounded-xl bg-[#ef8456] px-4 py-3 text-sm font-semibold text-white transition hover:bg-[#df7547] disabled:opacity-60"
              >
                {applyLoading ? "Applying..." : "Apply Transfers"}
              </button>
              {applyMessage ? (
                <p className="mt-2 text-sm text-gray-700">{applyMessage}</p>
              ) : null}
              {transferMetaLoading ? (
                <p className="mt-2 text-xs text-gray-500">
                  Refreshing transfer meta...
                </p>
              ) : null}
              {transferMetaError ? (
                <p className="mt-2 text-xs text-red-600">{transferMetaError}</p>
              ) : null}
              {transferMeta ? (
                <p className="mt-2 text-xs text-gray-600">
                  Penalty: {transferMeta.penaltyPoints || 0} pts | Free:{" "}
                  {transferMeta.freeTransfers ?? 0} | Used:{" "}
                  {transferMeta.usedTransfers ?? 0}
                </p>
              ) : null}
            </div>
          </div>

          <div className="rounded-2xl border border-gray-200 bg-[#f9fafb] p-4">
            <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[#5a6774]">
              Transfer Window and Policy
            </p>
            {transferPolicyLoading ? (
              <p className="mt-2 text-sm text-gray-600">
                Loading transfer policy...
              </p>
            ) : transferPolicyError ? (
              <p className="mt-2 text-sm text-red-600">{transferPolicyError}</p>
            ) : transferPolicy ? (
              <p className="mt-2 text-sm text-gray-700">
                League cap: {transferPolicy.leagueStageTransferCap ?? "-"} |
                Playoff cap: {transferPolicy.playoffTransferCap ?? "-"}
              </p>
            ) : (
              <p className="mt-2 text-sm text-gray-600">Policy unavailable</p>
            )}
          </div>
        </div>
      </section>

      {/* Team Preview Modal */}
      <TeamPreviewModal
        isOpen={showTeamPreview}
        onClose={() => setShowTeamPreview(false)}
        selectedPlayers={selectedPlayers}
        captainId={captainId}
        viceCaptainId={viceCaptainId}
        creditsUsed={creditsUsed}
      />

      {isFilterModalOpen ? (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 p-4 sm:items-center">
          <div className="w-full max-w-lg rounded-2xl border border-[#dce6f2] bg-white p-5 shadow-2xl">
            <div className="mb-4 flex items-center justify-between">
              <div>
                <h3 className="font-heading text-xl text-[#0b2b57]">
                  Filter Players
                </h3>
                <p className="text-xs text-[#64748b]">
                  Choose filters and apply when ready.
                </p>
              </div>
              <button
                onClick={() => setIsFilterModalOpen(false)}
                className="rounded-lg px-2 py-1 text-xl leading-none text-[#5f6f82] hover:bg-[#eef4fb]"
              >
                ×
              </button>
            </div>

            <FilterPanel
              mode={mode}
              homeCountry={homeCountry}
              creditSort={draftCreditSort}
              homeAwayFilter={draftHomeAwayFilter}
              teamFilter={draftTeamFilter}
              allTeams={allTeams}
              searchQuery={draftSearchQuery}
              onSearchChange={setDraftSearchQuery}
              onCreditSortChange={setDraftCreditSort}
              onHomeAwayChange={setDraftHomeAwayFilter}
              onTeamFilterChange={setDraftTeamFilter}
              isLocked={transferWindowLocked}
            />

            <div className="mt-4 grid gap-2 sm:grid-cols-2">
              <button
                onClick={handleClearDraftFilters}
                disabled={transferWindowLocked}
                className="rounded-xl border border-[#d7e2ef] bg-[#f8fbff] px-4 py-2 text-sm font-semibold text-[#35506d] transition hover:bg-[#eef4fb] disabled:opacity-60"
              >
                Clear Filters
              </button>
              <button
                onClick={handleApplyFilters}
                disabled={transferWindowLocked}
                className="rounded-xl bg-[#0b2b57] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[#1e4a8a] disabled:opacity-60"
              >
                Apply Filters
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
