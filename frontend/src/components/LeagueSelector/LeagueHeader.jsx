import { useSelector } from 'react-redux'

export function LeagueHeader() {
  const { leagues, selectedLeagueSeason } = useSelector((state) => state.squad)

  const currentLeague = leagues.find((l) => l.id === selectedLeagueSeason)

  if (!currentLeague) return null

  return (
    <div className="flex items-center justify-between rounded-xl border border-[#e4ddd2] bg-white px-4 py-3">
      <div className="flex items-center gap-3">
        <span className="text-2xl">{currentLeague.flag}</span>
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
  )
}
