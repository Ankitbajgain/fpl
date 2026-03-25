import { useMemo, useState } from 'react'

const initialCreate = {
  homeFranchiseId: '',
  awayFranchiseId: '',
  venue: '',
  startsAt: '',
  tossAt: '',
  lockAt: '',
  status: 'SCHEDULED',
}

export default function FixturePanel({ fixtures, franchises, onCreate, onUpdate, onDelete, busy }) {
  const [createForm, setCreateForm] = useState(initialCreate)
  const [editingId, setEditingId] = useState(null)
  const [editForm, setEditForm] = useState({})

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
    })
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
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
