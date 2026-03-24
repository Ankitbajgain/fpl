import { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { selectLeague } from '../../features/squad/squadSlice'

export function FixtureSelector({ selectedFixture, onSelectFixture }) {
  const dispatch = useDispatch()
  const { selectedLeagueSeason, authToken } = useSelector((state) => state.squad)
  const [fixtures, setFixtures] = useState([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    const fetchFixtures = async () => {
      if (!selectedLeagueSeason || !authToken) return

      setLoading(true)
      try {
        const response = await fetch(`/api/v1/gameplay/leagues/${selectedLeagueSeason}/fixtures`, {
          headers: { Authorization: `Bearer ${authToken}` },
        })
        const payload = await response.json()
        if (payload.success && Array.isArray(payload.data)) {
          setFixtures(payload.data)
          // Auto-select first fixture if none selected
          if (!selectedFixture && payload.data.length > 0) {
            onSelectFixture(payload.data[0])
          }
        }
      } catch (error) {
        console.error('Failed to fetch fixtures:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchFixtures()
  }, [selectedLeagueSeason, authToken, selectedFixture, onSelectFixture])

  if (loading) {
    return (
      <div className="rounded-2xl bg-white p-6 text-center text-sm text-[#5f6a76]">
        Loading fixtures...
      </div>
    )
  }

  if (!fixtures?.length) {
    return (
      <div className="rounded-2xl bg-white p-6 text-center text-sm text-[#5f6a76]">
        <p>No fixtures available for this league.</p>
        <button
          type="button"
          onClick={() => {
            onSelectFixture(null)
            dispatch(selectLeague(null))
          }}
          className="mt-3 rounded-lg border border-[#d8cfbf] px-3 py-1.5 text-xs font-semibold text-[#38424d] hover:bg-[#f7f2e9]"
        >
          Choose Another League
        </button>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      <h3 className="font-heading text-lg">Up Next</h3>

      {fixtures.map((fixture) => {
        const isSelected = selectedFixture?.id === fixture.id
        const startTime = new Date(fixture.startsAt)
        const isUpcoming = startTime > new Date()

        return (
          <button
            key={fixture.id}
            onClick={() => onSelectFixture(fixture)}
            className={`w-full rounded-xl border p-3 text-left transition ${
              isSelected
                ? 'border-[#0e6f59] bg-[#eef9f5]'
                : 'border-[#e4ddd2] bg-white hover:bg-[#f7f2e9]'
            }`}
          >
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <p className="font-semibold">
                  {fixture.homeCode} <span className="text-[#6a7683]">vs</span> {fixture.awayCode}
                </p>
                <p className="mt-0.5 text-xs text-[#6a7683]">{fixture.venue}</p>
                <p className="mt-1 text-xs font-semibold text-[#5f6a76]">
                  {startTime.toLocaleDateString()} at {startTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </p>
              </div>
              <span
                className={`rounded-full px-2 py-0.5 text-xs font-semibold ${
                  isUpcoming
                    ? 'bg-[#d4edda] text-[#155724]'
                    : fixture.status === 'LIVE'
                      ? 'bg-[#f8d7da] text-[#721c24]'
                      : 'bg-[#e2e3e5] text-[#383d41]'
                }`}
              >
                {fixture.status}
              </span>
            </div>
          </button>
        )
      })}
    </div>
  )
}
