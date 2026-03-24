import { PlayerCard } from './PlayerCard'

export function PlayerGrid({ players, selectedIds, onTogglePlayer, mode }) {
  if (!players.length) {
    return (
      <p className="mt-4 rounded-xl bg-[#f8f2e8] px-3 py-2 text-sm text-[#5f6a76]">
        No players found for this tab.
      </p>
    )
  }

  return (
    <div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
      {players.map((player) => (
        <PlayerCard
          key={player.id}
          player={player}
          isSelected={selectedIds.includes(player.id)}
          onToggle={onTogglePlayer}
          mode={mode}
        />
      ))}
    </div>
  )
}
