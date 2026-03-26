import { useState, useEffect } from 'react'

export function AccountSection({
  currentUser,
  selectedPlayers,
  captainId,
  viceCaptainId,
  validateLoading,
  validationResult,
  validationError,
  transferMeta,
  transferMetaLoading,
  transferMetaError,
  transferPolicy,
  transferPolicyLoading,
  transferPolicyError,
  transferWindowStatus,
  playerLeaderboard,
  managerLeaderboard,
  leaderboardLoading,
  managerLeaderboardLoading,
  leaderboardError,
  managerLeaderboardError,
  applyLoading,
  applyMessage,
  onCaptainChange,
  onViceCaptainChange,
  onValidate,
  onApplyTransfers,
  onLogout,
}) {
  const [countdown, setCountdown] = useState('')

  useEffect(() => {
    if (!transferWindowStatus) { setCountdown(''); return }

    const targetDate =
      transferWindowStatus.status === 'WAITING'
        ? transferWindowStatus.windowOpensAt
        : transferWindowStatus.status === 'OPEN'
          ? transferWindowStatus.windowClosesAt
          : null

    if (!targetDate) {
      setCountdown(transferWindowStatus.status === 'LOCKED' ? 'LOCKED' : '')
      return
    }

    const tick = () => {
      const diff = new Date(targetDate).getTime() - Date.now()
      if (diff <= 0) {
        setCountdown(transferWindowStatus.status === 'WAITING' ? 'Opening...' : 'LOCKED')
        return
      }
      const totalSec = Math.floor(diff / 1000)
      const h = Math.floor(totalSec / 3600)
      const m = Math.floor((totalSec % 3600) / 60)
      const s = totalSec % 60
      setCountdown(h > 0 ? `${h}h ${m}m ${s}s` : m > 0 ? `${m}m ${s}s` : `${s}s`)
    }

    tick()
    const interval = setInterval(tick, 1000)
    return () => clearInterval(interval)
  }, [transferWindowStatus?.status, transferWindowStatus?.windowOpensAt, transferWindowStatus?.windowClosesAt])

  return (
    <div className="space-y-3 rounded-2xl border border-[#e8ddcb] bg-[#fff9f0] p-4">
      <p className="text-xs uppercase tracking-[0.15em] text-[#6d7784]">Account</p>

      <div className="rounded-xl bg-[#e7f4ef] p-3 text-sm text-[#214436]">
        <p className="font-semibold">Logged in as {currentUser.name || currentUser.email}</p>
        <p className="text-xs uppercase tracking-[0.12em] text-[#4e6f61]">{currentUser.role}</p>
        <button
          onClick={onLogout}
          className="mt-3 w-full rounded-lg bg-[#173f34] px-3 py-2 text-xs font-semibold text-white"
        >
          Logout
        </button>
      </div>

      <div className="space-y-2 rounded-xl bg-white p-3">
        <label className="block text-xs font-semibold uppercase tracking-[0.12em] text-[#6a7683]">
          Captain
        </label>
        <select
          value={captainId}
          onChange={(e) => onCaptainChange(Number(e.target.value))}
          className="w-full rounded-lg border border-[#ddd2c3] px-3 py-2 text-sm"
        >
          {selectedPlayers.map((player) => (
            <option key={`captain-${player.id}`} value={player.id}>
              {player.name}
            </option>
          ))}
        </select>

        <label className="block pt-1 text-xs font-semibold uppercase tracking-[0.12em] text-[#6a7683]">
          Vice Captain
        </label>
        <select
          value={viceCaptainId}
          onChange={(e) => onViceCaptainChange(Number(e.target.value))}
          className="w-full rounded-lg border border-[#ddd2c3] px-3 py-2 text-sm"
        >
          {selectedPlayers.map((player) => (
            <option key={`vice-${player.id}`} value={player.id}>
              {player.name}
            </option>
          ))}
        </select>

        <button
          onClick={onValidate}
          disabled={validateLoading}
          className="mt-2 w-full rounded-lg bg-[#ec8456] px-3 py-2 text-sm font-semibold text-white disabled:opacity-70"
        >
          {validateLoading ? 'Validating...' : 'Validate Squad with API'}
        </button>

        <button
          onClick={onApplyTransfers}
          disabled={applyLoading}
          className="mt-2 w-full rounded-lg bg-[#0e6f59] px-3 py-2 text-sm font-semibold text-white disabled:opacity-70"
        >
          {applyLoading ? 'Applying...' : 'Apply Transfers'}
        </button>

        {transferWindowStatus ? (
          (() => {
            const isLocked = transferWindowStatus.status === 'LOCKED'
            const isWaiting = transferWindowStatus.status === 'WAITING'
            const isOpen = transferWindowStatus.status === 'OPEN'
            const bgClass = isLocked
              ? 'bg-[#f8d7da] text-[#721c24]'
              : isWaiting
                ? 'bg-[#fff3cd] text-[#856404]'
                : isOpen
                  ? 'bg-[#d4edda] text-[#155724]'
                  : 'bg-[#e2e3e5] text-[#383d41]'
            const statusLabel = isLocked ? 'LOCKED' : isWaiting ? 'WAITING' : isOpen ? 'OPEN' : 'UNKNOWN'
            const deadlineDate = isWaiting
              ? transferWindowStatus.windowOpensAt
              : transferWindowStatus.windowClosesAt

            return (
              <div className={`mt-2 rounded-lg p-2 text-center text-xs font-semibold ${bgClass}`}>
                <p>Transfer Window: {statusLabel}</p>
                {countdown ? (
                  <p className="mt-1 font-mono text-sm font-bold tracking-wider">{countdown}</p>
                ) : null}
                {isWaiting ? (
                  <p className="mt-1 text-xs">Opens after previous match ends (+15 min cooldown)</p>
                ) : null}
                {deadlineDate ? (
                  <p className="mt-1 text-xs">
                    {isWaiting ? 'Opens' : 'Closes'}: {new Date(deadlineDate).toLocaleDateString()} at{' '}
                    {new Date(deadlineDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </p>
                ) : null}
              </div>
            )
          })()
        ) : transferMeta ? (
          <div
            className={`mt-2 rounded-lg p-2 text-center text-xs font-semibold ${
              transferMeta.locked
                ? 'bg-[#f8d7da] text-[#721c24]'
                : 'bg-[#d4edda] text-[#155724]'
            }`}
          >
            <p>Transfer Window: {transferMeta.locked ? 'LOCKED' : 'OPEN'}</p>
            {transferMeta.firstWindowCloseAt ? (
              <p className="mt-1 text-xs">
                Deadline: {new Date(transferMeta.firstWindowCloseAt).toLocaleDateString()} at{' '}
                {new Date(transferMeta.firstWindowCloseAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </p>
            ) : null}
          </div>
        ) : null}
      </div>

      <div className="rounded-xl bg-white p-3 text-sm text-[#243342]">
        <p className="font-semibold">Transfer Window</p>
        {transferMetaLoading ? <p className="mt-1 text-xs text-[#6a7683]">Loading transfer details...</p> : null}
        {transferMetaError ? <p className="mt-1 text-xs text-red-600">{transferMetaError}</p> : null}
        {transferMeta ? (
          <>
            <p className="mt-1 text-xs">Stage: {transferMeta.stage}</p>
            <p className="text-xs">Upcoming Match: {transferMeta.upcomingMatchNo}</p>
            <p className="text-xs">Locked: {transferMeta.locked ? 'Yes' : 'No'}</p>
            <p className="text-xs">
              Transfers: {transferMeta.unlimited ? 'Unlimited' : `${transferMeta.transfersRemaining ?? 0} remaining`}
            </p>
            {!transferMeta.unlimited ? <p className="text-xs">Cap: {transferMeta.transferCap}</p> : null}
          </>
        ) : null}
      </div>

      <div className="rounded-xl bg-white p-3 text-sm text-[#243342]">
        <p className="font-semibold">League Transfer Policy</p>
        {transferPolicyLoading ? <p className="mt-1 text-xs text-[#6a7683]">Loading policy...</p> : null}
        {transferPolicyError ? <p className="mt-1 text-xs text-red-600">{transferPolicyError}</p> : null}
        {transferPolicy ? (
          <>
            <p className="mt-1 text-xs">Source: {transferPolicy.source}</p>
            <p className="text-xs">League Stage Matches: {transferPolicy.leagueStageMatchCount}</p>
            <p className="text-xs">League Stage Cap: {transferPolicy.leagueStageTransferCap}</p>
            <p className="text-xs">Playoff Cap: {transferPolicy.playoffTransferCap}</p>
            <p className="text-xs">Qualifier 1 Match No: {transferPolicy.qualifier1MatchNumber}</p>
          </>
        ) : null}
      </div>

      <div className="rounded-xl bg-white p-3 text-sm text-[#243342]">
        <p className="font-semibold">Player Leaderboard</p>
        <p className="mt-1 text-xs text-[#6a7683]">Updates after each completed match finalization</p>
        {leaderboardLoading ? <p className="mt-2 text-xs text-[#6a7683]">Loading leaderboard...</p> : null}
        {leaderboardError ? <p className="mt-2 text-xs text-red-600">{leaderboardError}</p> : null}
        {!leaderboardLoading && !leaderboardError && (!playerLeaderboard || playerLeaderboard.length === 0) ? (
          <p className="mt-2 text-xs text-[#6a7683]">No finalized leaderboard data yet.</p>
        ) : null}
        {playerLeaderboard && playerLeaderboard.length > 0 ? (
          <div className="mt-2 space-y-1">
            {playerLeaderboard.slice(0, 10).map((row) => (
              <div key={row.playerId} className="flex items-center justify-between rounded-md bg-[#f8f4ec] px-2 py-1">
                <p className="text-xs font-medium">
                  #{row.rank} {row.name} ({row.team})
                </p>
                <p className="text-xs font-semibold">{Number(row.totalPoints || 0).toFixed(2)} pts</p>
              </div>
            ))}
          </div>
        ) : null}
      </div>

      <div className="rounded-xl bg-white p-3 text-sm text-[#243342]">
        <p className="font-semibold">Manager Leaderboard</p>
        <p className="mt-1 text-xs text-[#6a7683]">Cumulative points across finalized matches</p>
        {managerLeaderboardLoading ? <p className="mt-2 text-xs text-[#6a7683]">Loading manager leaderboard...</p> : null}
        {managerLeaderboardError ? <p className="mt-2 text-xs text-red-600">{managerLeaderboardError}</p> : null}
        {!managerLeaderboardLoading && !managerLeaderboardError && (!managerLeaderboard || managerLeaderboard.length === 0) ? (
          <p className="mt-2 text-xs text-[#6a7683]">No finalized manager leaderboard data yet.</p>
        ) : null}
        {managerLeaderboard && managerLeaderboard.length > 0 ? (
          <div className="mt-2 space-y-1">
            {managerLeaderboard.slice(0, 10).map((row) => (
              <div key={row.userId} className="flex items-center justify-between rounded-md bg-[#f1f7ff] px-2 py-1">
                <p className="text-xs font-medium">#{row.rank} {row.name}</p>
                <p className="text-xs font-semibold">{Number(row.totalPoints || 0).toFixed(2)} pts</p>
              </div>
            ))}
          </div>
        ) : null}
      </div>

      {validationResult ? (
        <div className="rounded-xl bg-[#e7f4ef] p-3 text-sm text-[#234336]">
          <p className="font-semibold">Validation passed</p>
          <p>Total Credits: {validationResult.totalCredits}</p>
          <p>WK: {validationResult.roleCounts?.WK ?? 0}</p>
          <p>BAT: {validationResult.roleCounts?.BAT ?? 0}</p>
          <p>AR: {validationResult.roleCounts?.AR ?? 0}</p>
          <p>BOWL: {validationResult.roleCounts?.BOWL ?? 0}</p>
        </div>
      ) : null}

      {validationError ? <p className="text-xs text-red-600">{validationError}</p> : null}
      {applyMessage ? <p className="text-xs text-[#335e51]">{applyMessage}</p> : null}
    </div>
  )
}
