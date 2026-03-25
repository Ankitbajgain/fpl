import { useEffect, useState } from 'react'

export default function WindowBadge({ fixtures }) {
  const [countdown, setCountdown] = useState('')

  const firstFixture = fixtures && fixtures.length ? [...fixtures].sort((a, b) => new Date(a.startsAt) - new Date(b.startsAt))[0] : null
  const closeAt = firstFixture ? new Date(new Date(firstFixture.startsAt).getTime() - 15 * 60 * 1000) : null

  useEffect(() => {
    if (!closeAt) {
      setCountdown('No fixture available')
      return
    }

    const tick = () => {
      const diff = closeAt.getTime() - Date.now()
      if (diff <= 0) {
        setCountdown('LOCKED')
        return
      }
      const total = Math.floor(diff / 1000)
      const h = Math.floor(total / 3600)
      const m = Math.floor((total % 3600) / 60)
      const s = total % 60
      setCountdown(`${h}h ${m}m ${s}s`)
    }

    tick()
    const timer = setInterval(tick, 1000)
    return () => clearInterval(timer)
  }, [firstFixture?.id])

  if (!firstFixture) {
    return <div className="panel"><h2>Match 1 Window</h2><p>No fixtures configured</p></div>
  }

  const locked = countdown === 'LOCKED'
  return (
    <div className={`panel badge ${locked ? 'locked' : 'open'}`}>
      <h2>Match 1 Window</h2>
      <p>{locked ? 'Locked' : 'Open'}</p>
      <p className="timer">{countdown}</p>
      <p className="muted">Deadline: {closeAt.toLocaleString()}</p>
      <p className="muted">Fixture: {firstFixture.homeCode} vs {firstFixture.awayCode}</p>
    </div>
  )
}
