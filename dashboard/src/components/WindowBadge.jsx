import { useEffect, useState } from 'react'

export default function WindowBadge({ leagueSeasonId, token }) {
  const [status, setStatus] = useState(null)
  const [countdown, setCountdown] = useState('')

  // Poll the transfer window status API every 10 s
  useEffect(() => {
    let iid
    const poll = async () => {
      if (!leagueSeasonId || !token) return
      try {
        const res = await fetch(`/api/v1/gameplay/leagues/${leagueSeasonId}/transfer-window`, {
          headers: { Authorization: `Bearer ${token}` },
        })
        const payload = await res.json()
        if (res.ok && payload.success) setStatus(payload.data)
      } catch { /* silent */ }
    }
    if (leagueSeasonId && token) {
      poll()
      iid = setInterval(poll, 10000)
    }
    return () => clearInterval(iid)
  }, [leagueSeasonId, token])

  // Live countdown tick (1 s)
  useEffect(() => {
    if (!status) { setCountdown(''); return }
    const targetDate =
      status.status === 'WAITING' ? status.windowOpensAt
      : status.status === 'OPEN'   ? status.windowClosesAt
      : null
    if (!targetDate) { setCountdown(status.status === 'LOCKED' ? 'LOCKED' : '-'); return }

    const tick = () => {
      const diff = new Date(targetDate).getTime() - Date.now()
      if (diff <= 0) { setCountdown(status.status === 'WAITING' ? 'Opening...' : 'LOCKED'); return }
      const t = Math.floor(diff / 1000)
      const h = Math.floor(t / 3600)
      const m = Math.floor((t % 3600) / 60)
      const s = t % 60
      setCountdown(h > 0 ? `${h}h ${m}m ${s}s` : m > 0 ? `${m}m ${s}s` : `${s}s`)
    }
    tick()
    const timer = setInterval(tick, 1000)
    return () => clearInterval(timer)
  }, [status?.status, status?.windowOpensAt, status?.windowClosesAt])

  if (!leagueSeasonId) {
    return <div className="panel"><h2>Transfer Window</h2><p className="muted">Select a league first</p></div>
  }

  if (!status) {
    return <div className="panel"><h2>Transfer Window</h2><p className="muted">Loading...</p></div>
  }

  const isLocked  = status.status === 'LOCKED'
  const isWaiting = status.status === 'WAITING'
  const isOpen    = status.status === 'OPEN'
  const badgeClass = isLocked ? 'locked' : isWaiting ? 'waiting' : 'open'

  return (
    <div className={`panel badge ${badgeClass}`}>
      <h2>Transfer Window</h2>
      <p>{isLocked ? 'Locked' : isWaiting ? 'Waiting' : 'Open'}</p>
      <p className="timer">{countdown}</p>
      {isWaiting && status.windowOpensAt ? (
        <p className="muted">Opens: {new Date(status.windowOpensAt).toLocaleString()}</p>
      ) : null}
      {isOpen && status.windowClosesAt ? (
        <p className="muted">Closes: {new Date(status.windowClosesAt).toLocaleString()}</p>
      ) : null}
      {isLocked && status.windowClosesAt ? (
        <p className="muted">Locked at: {new Date(status.windowClosesAt).toLocaleString()}</p>
      ) : null}
      {isWaiting ? (
        <p className="muted" style={{ fontSize: '11px', marginTop: 4 }}>
          Window opens 15 min after previous match ends
        </p>
      ) : null}
      {status.nextFixtureId ? (
        <p className="muted">Next fixture: #{status.nextFixtureId}</p>
      ) : null}
    </div>
  )
}
