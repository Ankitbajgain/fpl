import { useDispatch, useSelector } from 'react-redux'
import { toggleFavorite } from '../../features/squad/squadSlice'

export function PlayerCard({ player, isSelected, onToggle, mode, homeCountry, isLocked }) {
  const dispatch = useDispatch()
  const { favorites, selectedLeagueSeason } = useSelector((state) => state.squad)
  const leagueFavorites = selectedLeagueSeason ? favorites[selectedLeagueSeason] || [] : []
  const isFavorite = leagueFavorites.includes(player.id)
  const normalizedHomeCountry = String(homeCountry || '').trim().toLowerCase()
  const normalizedPlayerCountry = String(player.country || '').trim().toLowerCase()
  const isAwayPlayer = mode === 'Classic' && normalizedHomeCountry && normalizedPlayerCountry !== normalizedHomeCountry

  return (
    <article
      className={`rounded-2xl border p-4 transition ${
        isSelected ? 'border-[#0e6f59] bg-[#eef9f5]' : 'border-[#eee5d8] bg-[#fffcf8]'
      } ${isLocked ? 'opacity-60' : ''}`}
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className="font-heading text-lg leading-tight">{player.name}</h3>
          <p className="text-xs uppercase tracking-[0.12em] text-[#6a7482]">
            {player.team}
            {isAwayPlayer && <span className="ml-1">🛫</span>}
          </p>
          <p className="text-xs text-[#5f7080]">{player.country}</p>
        </div>
        <button
          onClick={() => dispatch(toggleFavorite(player.id))}
          disabled={isLocked}
          className={`rounded-lg px-2 py-1 text-xs font-semibold ${
            isFavorite ? 'bg-[#fca66e] text-white' : 'bg-[#efe6d7] text-[#5c6570]'
          } ${isLocked ? 'cursor-not-allowed opacity-50' : ''}`}
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
        disabled={isLocked}
        className={`mt-4 w-full rounded-xl px-3 py-2 text-sm font-semibold transition ${
          isSelected
            ? 'bg-[#143f35] text-white hover:bg-[#0e342a] disabled:opacity-60'
            : 'bg-[#ec8456] text-white hover:bg-[#df7547] disabled:opacity-60'
        }  ${isLocked ? 'cursor-not-allowed' : ''}`}
      >
        {isLocked ? '🔒 Selection Locked' : isSelected ? 'Remove from Squad' : 'Add to Squad'}
      </button>
    </article>
  )
}
