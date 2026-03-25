import { useState, useMemo } from 'react'

export default function TransferPolicyPanel({ policy, onSave, saving }) {
  const [form, setForm] = useState(null)

  const current = useMemo(() => {
    if (!policy) return null
    if (!form || form.leagueSeasonId !== policy.leagueSeasonId) {
      return {
        leagueSeasonId: policy.leagueSeasonId,
        leagueStageMatchCount: policy.leagueStageMatchCount,
        leagueStageTransferCap: policy.leagueStageTransferCap,
        playoffTransferCap: policy.playoffTransferCap,
        qualifier1MatchNumber: policy.qualifier1MatchNumber,
        unlimitedPreMatch1: policy.unlimitedPreMatch1,
        unlimitedBetweenLeagueAndQ1: policy.unlimitedBetweenLeagueAndQ1,
      }
    }
    return form
  }, [form, policy])

  if (!policy || !current) {
    return <div className="panel"><h2>Transfer Policy</h2><p>Loading...</p></div>
  }

  const update = (key, value) => setForm({ ...current, [key]: value })

  return (
    <div className="panel">
      <h2>Transfer Policy</h2>
      <p className="muted">Source: {policy.source}</p>
      <div className="grid two">
        <label>League Stage Matches</label>
        <input type="number" value={current.leagueStageMatchCount} onChange={(e) => update('leagueStageMatchCount', Number(e.target.value))} />

        <label>League Stage Transfer Cap</label>
        <input type="number" value={current.leagueStageTransferCap} onChange={(e) => update('leagueStageTransferCap', Number(e.target.value))} />

        <label>Playoff Transfer Cap</label>
        <input type="number" value={current.playoffTransferCap} onChange={(e) => update('playoffTransferCap', Number(e.target.value))} />

        <label>Qualifier 1 Match Number</label>
        <input type="number" value={current.qualifier1MatchNumber} onChange={(e) => update('qualifier1MatchNumber', Number(e.target.value))} />
      </div>

      <div className="row">
        <label><input type="checkbox" checked={current.unlimitedPreMatch1} onChange={(e) => update('unlimitedPreMatch1', e.target.checked)} /> Unlimited pre Match 1</label>
        <label><input type="checkbox" checked={current.unlimitedBetweenLeagueAndQ1} onChange={(e) => update('unlimitedBetweenLeagueAndQ1', e.target.checked)} /> Unlimited between League and Q1</label>
      </div>

      <button onClick={() => onSave(current)} disabled={saving}>{saving ? 'Saving...' : 'Save Policy'}</button>
    </div>
  )
}
