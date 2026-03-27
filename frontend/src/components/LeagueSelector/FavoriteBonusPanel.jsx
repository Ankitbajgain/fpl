import { useEffect, useMemo, useState } from 'react'

export function FavoriteBonusPanel({ authToken, selectedLeagueSeason }) {
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')
  const [nations, setNations] = useState([])
  const [franchises, setFranchises] = useState([])
  const [favoriteNationId, setFavoriteNationId] = useState('')
  const [favoriteLeagueFranchiseId, setFavoriteLeagueFranchiseId] = useState('')
  const [multipliers, setMultipliers] = useState({ favoriteNation: 1.2, favoriteFranchise: 1.5 })
  const [locked, setLocked] = useState(false)
  const [firstMatchStartsAt, setFirstMatchStartsAt] = useState(null)

  const bonusPreview = useMemo(() => {
    const nation = Number(multipliers.favoriteNation || 1.2)
    const franchise = Number(multipliers.favoriteFranchise || 1.5)
    return (nation * franchise).toFixed(2)
  }, [multipliers])

  useEffect(() => {
    const fetchPreferences = async () => {
      if (!authToken || !selectedLeagueSeason) return

      setLoading(true)
      setError('')
      setNotice('')

      try {
        const response = await fetch(`/api/v1/gameplay/leagues/${selectedLeagueSeason}/favorites`, {
          headers: { Authorization: `Bearer ${authToken}` },
        })
        const payload = await response.json()

        if (!response.ok || !payload.success || !payload.data) {
          setError(payload.message || 'Unable to load bonus preferences')
          setLoading(false)
          return
        }

        const data = payload.data
        setMultipliers(data.multipliers || { favoriteNation: 1.2, favoriteFranchise: 1.5 })
        setLocked(Boolean(data.locked))
        setFirstMatchStartsAt(data.firstMatchStartsAt || null)
        setNations(Array.isArray(data.options?.nations) ? data.options.nations : [])
        setFranchises(Array.isArray(data.options?.franchises) ? data.options.franchises : [])
        setFavoriteNationId(data.selected?.favoriteNationId ? String(data.selected.favoriteNationId) : '')
        setFavoriteLeagueFranchiseId(
          data.selected?.favoriteLeagueFranchiseId ? String(data.selected.favoriteLeagueFranchiseId) : '',
        )
        setLoading(false)
      } catch {
        setError('Network error while loading bonus preferences')
        setLoading(false)
      }
    }

    fetchPreferences()
  }, [authToken, selectedLeagueSeason])

  const handleSave = async () => {
    if (!authToken || !selectedLeagueSeason) return

    setSaving(true)
    setError('')
    setNotice('')

    try {
      const response = await fetch(`/api/v1/gameplay/leagues/${selectedLeagueSeason}/favorites`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${authToken}`,
        },
        body: JSON.stringify({
          favoriteNationId: favoriteNationId ? Number(favoriteNationId) : null,
          favoriteLeagueFranchiseId: favoriteLeagueFranchiseId ? Number(favoriteLeagueFranchiseId) : null,
        }),
      })

      const payload = await response.json()
      if (!response.ok || !payload.success || !payload.data) {
        setError(payload.message || 'Unable to save bonus preferences')
        setSaving(false)
        return
      }

      const data = payload.data
      setMultipliers(data.multipliers || { favoriteNation: 1.2, favoriteFranchise: 1.5 })
        setLocked(Boolean(data.locked))
        setFirstMatchStartsAt(data.firstMatchStartsAt || null)
      setFavoriteNationId(data.selected?.favoriteNationId ? String(data.selected.favoriteNationId) : '')
      setFavoriteLeagueFranchiseId(
        data.selected?.favoriteLeagueFranchiseId ? String(data.selected.favoriteLeagueFranchiseId) : '',
      )
      setNotice('Favorite bonus preferences saved successfully.')
      setSaving(false)
    } catch {
      setError('Network error while saving bonus preferences')
      setSaving(false)
    }
  }

  return (
    <section className="rounded-3xl border border-[#e4ddd2] bg-white p-5 shadow-card">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="font-heading text-2xl">Favorite Team Bonus</h2>
          <p className="mt-1 text-sm text-[#5f6a76]">
            Select one nation and one franchise for this league. Matching squad players get point multipliers.
          </p>
        </div>
        <div className="rounded-xl bg-[#eef9f5] px-3 py-2 text-xs text-[#0e6f59]">
          <p>
            Nation: <span className="font-semibold">{Number(multipliers.favoriteNation || 1.2).toFixed(1)}x</span>
          </p>
          <p>
            Franchise: <span className="font-semibold">{Number(multipliers.favoriteFranchise || 1.5).toFixed(1)}x</span>
          </p>
          <p>
            Both: <span className="font-semibold">{bonusPreview}x</span>
          </p>
        </div>
      </div>

      <div className="mt-4 grid gap-4 lg:grid-cols-2">
        <div>
          <label className="block text-xs font-semibold uppercase tracking-[0.12em] text-[#6a7683]">
            Favorite Nation
          </label>
          <select
            value={favoriteNationId}
            onChange={(event) => setFavoriteNationId(event.target.value)}
            disabled={loading || saving || locked}
            className="mt-1 w-full rounded-lg border border-[#ddd2c3] bg-white px-3 py-2 text-sm disabled:opacity-60"
          >
            <option value="">No nation bonus</option>
            {nations.map((nation) => (
              <option key={nation.id} value={nation.id}>
                {nation.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-xs font-semibold uppercase tracking-[0.12em] text-[#6a7683]">
            Favorite Franchise (League Team)
          </label>
          <select
            value={favoriteLeagueFranchiseId}
            onChange={(event) => setFavoriteLeagueFranchiseId(event.target.value)}
            disabled={loading || saving || locked}
            className="mt-1 w-full rounded-lg border border-[#ddd2c3] bg-white px-3 py-2 text-sm disabled:opacity-60"
          >
            <option value="">No franchise bonus</option>
            {franchises.map((franchise) => (
              <option key={franchise.id} value={franchise.id}>
                {franchise.teamCode} - {franchise.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="mt-3 flex flex-wrap items-center gap-3">
        <button
          type="button"
          onClick={handleSave}
          disabled={loading || saving || locked}
          className="rounded-lg bg-[#0e6f59] px-3 py-2 text-sm font-semibold text-white hover:bg-[#0b5f4c] disabled:cursor-not-allowed disabled:opacity-60"
        >
          {saving ? 'Saving...' : 'Save Bonus Preferences'}
        </button>
        {loading ? <p className="text-xs text-[#6a7683]">Loading preferences...</p> : null}
      </div>

      {notice ? <p className="mt-3 rounded-xl bg-[#eef9f5] px-3 py-2 text-xs font-semibold text-[#0e6f59]">{notice}</p> : null}
      {error ? <p className="mt-3 rounded-xl bg-[#fdecea] px-3 py-2 text-xs font-semibold text-[#8a3d35]">{error}</p> : null}
      {locked ? (
        <p className="mt-3 rounded-xl bg-[#fff3cd] px-3 py-2 text-xs font-semibold text-[#856404]">
          Preferences are locked because Match 1 has started.
          {firstMatchStartsAt ? ` First match start: ${new Date(firstMatchStartsAt).toLocaleString()}.` : ''}
        </p>
      ) : null}
    </section>
  )
}
