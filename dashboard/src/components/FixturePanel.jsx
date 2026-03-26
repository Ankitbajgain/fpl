import { useMemo, useState } from 'react'

const MATCH_TYPES = ['T20', 'ODI', 'TEST', 'T10']

const STATS_TEMPLATE = JSON.stringify([
  {
    playerId: 1,
    is_playing_xi: true,
    did_bat: true,
    runs: 0,
    fours: 0,
    sixes: 0,
    balls_faced: 0,
    is_duck: false,
    wickets: 0,
    maidens: 0,
    balls_bowled: 0,
    runs_conceded: 0,
    lbw_wickets: 0,
    bowled_wickets: 0,
    catches: 0,
    stumpings: 0,
    direct_hit_runouts: 0,
    indirect_runout_throws: 0,
    indirect_runout_catches: 0,
    dropped_catches: 0,
  },
], null, 2)

const initialCreate = {
  homeFranchiseId: '',
  awayFranchiseId: '',
  venue: '',
  startsAt: '',
  tossAt: '',
  lockAt: '',
  status: 'SCHEDULED',
  matchType: 'T20',
}

export default function FixturePanel({ fixtures, franchises, onCreate, onUpdate, onDelete, onPushStats, onFinalizePoints, busy }) {
  const [createForm, setCreateForm] = useState(initialCreate)
  const [editingId, setEditingId] = useState(null)
  const [editForm, setEditForm] = useState({})
  const [statsFixtureId, setStatsFixtureId] = useState(null)
  const [statsText, setStatsText] = useState(STATS_TEMPLATE)

  const sortedFixtures = useMemo(
    () => [...fixtures].sort((a, b) => new Date(a.startsAt) - new Date(b.startsAt)),
    [fixtures],
  )

  const startEdit = (fixture) => {
    setEditingId(fixture.id)
    setEditForm({
      homeFranchiseId: fixture.homeFranchiseId,
      awayFranchiseId: fixture.awayFranchiseId,
      venue: fixture.venue || '',
      startsAt: fixture.startsAt?.slice(0, 16) || '',
      tossAt: fixture.tossAt?.slice(0, 16) || '',
      lockAt: fixture.lockAt?.slice(0, 16) || '',
      status: fixture.status,
      matchType: fixture.matchType || 'T20',
    })
  }

  const handleStatsSubmit = (fixtureId) => {
    try {
      const arr = JSON.parse(statsText)
      onPushStats(fixtureId, arr)
      setStatsFixtureId(null)
      setStatsText(STATS_TEMPLATE)
    } catch {
      alert('Invalid JSON - fix the stats array and try again.')
    }
  }

  return (
    <div className="panel">
      <h2>Fixtures Management</h2>

      <div className="fixture-create">
        <h3>Add Fixture</h3>
        <div className="grid three">
          <select value={createForm.homeFranchiseId} onChange={(e) => setCreateForm({ ...createForm, homeFranchiseId: e.target.value })}>
            <option value="">Home Team</option>
            {franchises.map((f) => <option key={f.franchiseId} value={f.franchiseId}>{f.teamCode} - {f.displayName}</option>)}
          </select>
          <select value={createForm.awayFranchiseId} onChange={(e) => setCreateForm({ ...createForm, awayFranchiseId: e.target.value })}>
            <option value="">Away Team</option>
            {franchises.map((f) => <option key={f.franchiseId} value={f.franchiseId}>{f.teamCode} - {f.displayName}</option>)}
          </select>
          <select value={createForm.status} onChange={(e) => setCreateForm({ ...createForm, status: e.target.value })}>
            <option value="SCHEDULED">SCHEDULED</option>
            <option value="LIVE">LIVE</option>
            <option value="COMPLETED">COMPLETED</option>
            <option value="CANCELLED">CANCELLED</option>
          </select>
          <select value={createForm.matchType} onChange={(e) => setCreateForm({ ...createForm, matchType: e.target.value })}>
            {MATCH_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
          </select>
          <input placeholder="Venue" value={createForm.venue} onChange={(e) => setCreateForm({ ...createForm, venue: e.target.value })} />
          <input type="datetime-local" value={createForm.startsAt} onChange={(e) => setCreateForm({ ...createForm, startsAt: e.target.value })} />
          <input type="datetime-local" value={createForm.tossAt} onChange={(e) => setCreateForm({ ...createForm, tossAt: e.target.value })} />
          <input type="datetime-local" value={createForm.lockAt} onChange={(e) => setCreateForm({ ...createForm, lockAt: e.target.value })} />
          <button onClick={() => onCreate(createForm)} disabled={busy}>Create</button>
        </div>
      </div>

      <div className="fixture-list">
        {sortedFixtures.map((fixture) => {
          const editing = editingId === fixture.id
          return (
            <div key={fixture.id} className="fixture-card">
              <div className="fixture-head">
                <strong>#{fixture.id} {fixture.homeCode} vs {fixture.awayCode}</strong>
                <span>{fixture.status}</span>
                {fixture.matchType ? <span className="badge" style={{ background: '#e7f0ff', color: '#2c4ba0', marginLeft: 6 }}>{fixture.matchType}</span> : null}
              </div>

              {editing ? (
                <div className="grid three">
                  <select value={editForm.homeFranchiseId} onChange={(e) => setEditForm({ ...editForm, homeFranchiseId: Number(e.target.value) })}>
                    {franchises.map((f) => <option key={f.franchiseId} value={f.franchiseId}>{f.teamCode} - {f.displayName}</option>)}
                  </select>
                  <select value={editForm.awayFranchiseId} onChange={(e) => setEditForm({ ...editForm, awayFranchiseId: Number(e.target.value) })}>
                    {franchises.map((f) => <option key={f.franchiseId} value={f.franchiseId}>{f.teamCode} - {f.displayName}</option>)}
                  </select>
                  <select value={editForm.status} onChange={(e) => setEditForm({ ...editForm, status: e.target.value })}>
                    <option value="SCHEDULED">SCHEDULED</option>
                    <option value="LIVE">LIVE</option>
                    <option value="COMPLETED">COMPLETED</option>
                    <option value="CANCELLED">CANCELLED</option>
                  </select>
                  <select value={editForm.matchType || 'T20'} onChange={(e) => setEditForm({ ...editForm, matchType: e.target.value })}>
                    {MATCH_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
                  </select>
                  <input value={editForm.venue || ''} onChange={(e) => setEditForm({ ...editForm, venue: e.target.value })} />
                  <input type="datetime-local" value={editForm.startsAt || ''} onChange={(e) => setEditForm({ ...editForm, startsAt: e.target.value })} />
                  <input type="datetime-local" value={editForm.tossAt || ''} onChange={(e) => setEditForm({ ...editForm, tossAt: e.target.value })} />
                  <input type="datetime-local" value={editForm.lockAt || ''} onChange={(e) => setEditForm({ ...editForm, lockAt: e.target.value })} />
                </div>
              ) : (
                <p className="muted">{new Date(fixture.startsAt).toLocaleString()} | {fixture.venue || 'No venue'}</p>
              )}

              <div className="row">
                {editing ? (
                  <>
                    <button onClick={() => onUpdate(fixture.id, editForm)} disabled={busy}>Save</button>
                    <button className="secondary" onClick={() => setEditingId(null)} disabled={busy}>Cancel</button>
                  </>
                ) : (
                  <button onClick={() => startEdit(fixture)} disabled={busy}>Edit</button>
                )}
                <button className="danger" onClick={() => onDelete(fixture.id)} disabled={busy}>Delete</button>
                {fixture.status === 'COMPLETED' && onFinalizePoints ? (
                  <button style={{ background: '#6f42c1', color: '#fff' }} onClick={() => onFinalizePoints(fixture.id)} disabled={busy}>
                    Finalize Points
                  </button>
                ) : null}
                {onPushStats ? (
                  <button
                    className="secondary"
                    onClick={() => {
                      setStatsFixtureId(statsFixtureId === fixture.id ? null : fixture.id)
                      setStatsText(STATS_TEMPLATE)
                    }}
                    disabled={busy}
                  >
                    {statsFixtureId === fixture.id ? 'Hide Stats' : 'Push Stats'}
                  </button>
                ) : null}
              </div>

              {statsFixtureId === fixture.id ? (
                <div style={{ marginTop: 8 }}>
                  <p className="muted" style={{ marginBottom: 4 }}>
                    Paste player stats JSON array. Edit player IDs and values accordingly.
                  </p>
                  <textarea
                    rows={14}
                    style={{ width: '100%', fontFamily: 'monospace', fontSize: 12, padding: 8, boxSizing: 'border-box' }}
                    value={statsText}
                    onChange={(e) => setStatsText(e.target.value)}
                  />
                  <div className="row" style={{ marginTop: 6 }}>
                    <button onClick={() => handleStatsSubmit(fixture.id)} disabled={busy}>Submit Stats</button>
                    <button className="secondary" onClick={() => setStatsFixtureId(null)}>Cancel</button>
                  </div>
                </div>
              ) : null}
            </div>
          )
        })}
      </div>
    </div>
  )
}
