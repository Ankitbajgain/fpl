import { useDispatch, useSelector } from 'react-redux'
import { selectLeague } from '../../features/squad/squadSlice'

export function LeagueHeader() {
  const dispatch = useDispatch()
  const { leagues, selectedLeagueSeason } = useSelector((state) => state.squad)

  const currentLeague = leagues.find((l) => l.id === selectedLeagueSeason)
  const switchableLeagues = leagues.filter((league) => league.status === 'active')

  if (!currentLeague) return null

  return (
    <div className="space-y-3 rounded-xl border border-[#e4ddd2] bg-white px-4 py-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div>
            <p className="text-xs uppercase tracking-[0.12em] text-[#6a7683]">{currentLeague.competition}</p>
            <p className="font-heading text-lg text-[#0e6f59]">{currentLeague.name}</p>
          </div>
        </div>

        <div className="text-right">
          <p className="text-xs uppercase tracking-[0.12em] text-[#6a7683]">Budget</p>
          <p className="font-heading text-xl">100 Cr</p>
        </div>
      </div>

      <div className="flex gap-2 overflow-x-auto pb-1">
        {switchableLeagues.map((league) => {
          const isActiveTab = league.id === selectedLeagueSeason
          return (
            <button
              key={league.id}
              type="button"
              onClick={() => dispatch(selectLeague(league.id))}
              className={`whitespace-nowrap rounded-full border px-3 py-1.5 text-xs font-semibold transition ${
                isActiveTab
                  ? 'border-[#0e6f59] bg-[#eef9f5] text-[#0e6f59]'
                  : 'border-[#e4ddd2] bg-white text-[#4d5966] hover:bg-[#f7f2e9]'
              }`}
            >
              {league.competition}
            </button>
          )
        })}
      </div>
    </div>
  )
}
