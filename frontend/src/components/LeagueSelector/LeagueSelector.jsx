import { useEffect, useRef } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { setLeagues, setLeaguesLoading, selectLeague, setLeaguesError } from '../../features/squad/squadSlice'

export function LeagueSelector() {
  const dispatch = useDispatch()
  const { leagues, selectedLeagueSeason, leaguesLoading, leaguesError, authToken } = useSelector((state) => state.squad)
  const hasFetchedLeaguesRef = useRef(false)

  const fetchLeagues = async () => {
    if (!authToken || leaguesLoading) return

    dispatch(setLeaguesLoading(true))
    dispatch(setLeaguesError(null))

    try {
      const response = await fetch('/api/v1/gameplay/leagues', {
        headers: { Authorization: `Bearer ${authToken}` },
      })
      const payload = await response.json()

      if (!response.ok || !payload.success || !Array.isArray(payload.data)) {
        dispatch(setLeaguesError(payload.message || 'Unable to load leagues'))
        return
      }

      dispatch(setLeagues(payload.data))
      if (!selectedLeagueSeason && payload.data.length > 0) {
        const activeWithFixtures = payload.data.find(
          (l) => l.status === 'active' && Number(l.totalFixtures || 0) > 0,
        )
        const activeLeague = payload.data.find((l) => l.status === 'active') || payload.data[0]
        dispatch(selectLeague((activeWithFixtures || activeLeague).id))
      }
    } catch {
      dispatch(setLeaguesError('Network error while loading leagues'))
    } finally {
      dispatch(setLeaguesLoading(false))
    }
  }

  // Fetch available leagues on mount
  useEffect(() => {
    if (!authToken || selectedLeagueSeason || leagues.length > 0 || hasFetchedLeaguesRef.current) {
      return
    }

    hasFetchedLeaguesRef.current = true
    fetchLeagues()
  }, [authToken, leagues.length, selectedLeagueSeason])

  const retryFetchLeagues = () => {
    hasFetchedLeaguesRef.current = false
    fetchLeagues()
  }

  if (leaguesLoading) {
    return (
      <div className="rounded-2xl bg-white p-6 text-center text-sm text-[#5f6a76]">
        Loading available leagues...
      </div>
    )
  }

  if (!leagues?.length) {
    return (
      <div className="rounded-2xl bg-white p-6 text-center text-sm text-[#5f6a76]">
        <p>{leaguesError || 'No leagues available at this time.'}</p>
        <button
          type="button"
          onClick={retryFetchLeagues}
          className="mt-3 rounded-lg border border-[#d8cfbf] px-3 py-1.5 text-xs font-semibold text-[#38424d] hover:bg-[#f7f2e9]"
        >
          Retry
        </button>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <h2 className="font-heading text-2xl">Select a League</h2>
      <p className="text-sm text-[#667481]">
        Choose a league to build your fantasy team. You can play in multiple leagues simultaneously!
      </p>

      <div className="space-y-3">
        {leagues.map((league) => {
          const isSelected = selectedLeagueSeason === league.id
          const isActive = league.status === 'active'

          return (
            <button
              key={league.id}
              onClick={() => dispatch(selectLeague(league.id))}
              disabled={!isActive}
              className={`w-full overflow-hidden rounded-2xl border p-4 text-left transition ${
                isSelected
                  ? 'border-[#0e6f59] bg-[#eef9f5]'
                  : isActive
                    ? 'border-[#e4ddd2] bg-white hover:bg-[#f7f2e9]'
                    : 'border-[#e4ddd2] bg-[#f4ede3] opacity-60'
              }`}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <h3 className="font-heading text-lg leading-tight">{league.name}</h3>
                  </div>

                  <p className="mt-1 text-xs uppercase tracking-[0.12em] text-[#6a7683]">
                    {league.competitionFull}
                  </p>

                  <p className="mt-2 text-sm text-[#5f6a76]">
                    {new Date(league.startDate).toLocaleDateString()} - {new Date(league.endDate).toLocaleDateString()}
                  </p>

                  <div className="mt-2 flex flex-wrap gap-2">
                    <span className="rounded-full bg-[#e7f4ef] px-2.5 py-1 text-xs font-semibold text-[#0e6f59]">
                      {league.totalFixtures} Fixtures
                    </span>
                    <span
                      className={`rounded-full px-2.5 py-1 text-xs font-semibold ${
                        isActive
                          ? 'bg-[#d4edda] text-[#155724]'
                          : league.status === 'draft'
                            ? 'bg-[#fff3cd] text-[#856404]'
                            : 'bg-[#f8d7da] text-[#721c24]'
                      }`}
                    >
                      {league.status.toUpperCase()}
                    </span>
                  </div>
                </div>

                {isSelected && (
                  <div className="flex-shrink-0 text-2xl">✓</div>
                )}
              </div>
            </button>
          )
        })}
      </div>

      <div className="rounded-2xl bg-[#eef9f5] p-4 text-sm text-[#0e6f59]">
        <p className="font-semibold">Multi-League Play</p>
        <p className="mt-1 text-xs leading-relaxed">
          Players appear in multiple leagues with different credit prices. Virat Kohli plays for RCB (IPL) and
          Islamabad United (PSL), but his nationality is India. Build separate squads for each league!
        </p>
      </div>
    </div>
  )
}
