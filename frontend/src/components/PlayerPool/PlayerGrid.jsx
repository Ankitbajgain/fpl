import { PlayerCard } from "./PlayerCard";

export function PlayerGrid({
  players,
  selectedIds,
  onTogglePlayer,
  mode,
  homeCountry,
  creditsLeft,
  isLocked,
}) {
  if (!players.length) {
    return (
      <div className="mt-4 rounded-2xl border border-[#e6edf5] bg-[#f8fbff] px-4 py-4 text-sm text-[#5f6a76]">
        No players found for this tab or filter combination.
      </div>
    );
  }

  const selectedPlayers = players.filter((player) =>
    selectedIds.includes(player.id),
  );
  const unselectedPlayers = players.filter(
    (player) => !selectedIds.includes(player.id),
  );
  const orderedPlayers = [...selectedPlayers, ...unselectedPlayers];

  return (
    <div
      className={`grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-3 ${isLocked ? "pointer-events-none opacity-60" : ""}`}
    >
      {orderedPlayers.map((player) => (
        <PlayerCard
          key={player.id}
          player={player}
          isSelected={selectedIds.includes(player.id)}
          onToggle={onTogglePlayer}
          mode={mode}
          homeCountry={homeCountry}
          creditsLeft={creditsLeft}
          isLocked={isLocked}
        />
      ))}
    </div>
  );
}
