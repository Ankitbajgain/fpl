import { useDispatch, useSelector } from 'react-redux'
import { toggleFavorite } from '../../features/squad/squadSlice'

export function PlayerCard({ player, isSelected, onToggle, mode }) {
  const dispatch = useDispatch()
  const { favorites } = useSelector((state) => state.squad)
  const isFavorite = favorites.includes(player.id)

  return (
    <article
      className={`rounded-2xl border p-4 transition ${
        isSelected ? 'border-[#0e6f59] bg-[#eef9f5]' : 'border-[#eee5d8] bg-[#fffcf8]'
      }`}
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className="font-heading text-lg leading-tight">{player.name}</h3>
          <p className="text-xs uppercase tracking-[0.12em] text-[#6a7482]">
            {player.team}
            {mode === 'Classic' && player.country !== 'India' && <span className="ml-1">🛫</span>}
          </p>
          <p className="text-xs text-[#5f7080]">{player.country}</p>
        </div>
        <button
          onClick={() => dispatch(toggleFavorite(player.id))}
          className={`rounded-lg px-2 py-1 text-xs font-semibold ${
            isFavorite ? 'bg-[#fca66e] text-white' : 'bg-[#efe6d7] text-[#5c6570]'
          }`}
        >
          {isFavorite ? 'Fav' : 'Mark'}
        </button>
      </div>

      <div className="mt-4 flex items-center justify-between text-sm text-[#52606f]">
        <span>{player.role}</span>
        <span>{player.credits.toFixed(1)} Cr</span>
      </div>

      <button
        onClick={() => onToggle(player)}
        className={`mt-4 w-full rounded-xl px-3 py-2 text-sm font-semibold transition ${
          isSelected
            ? 'bg-[#143f35] text-white hover:bg-[#0e342a]'
            : 'bg-[#ec8456] text-white hover:bg-[#df7547]'
        }`}
      >
        {isSelected ? 'Remove from Squad' : 'Add to Squad'}
      </button>
    </article>
  )
}
