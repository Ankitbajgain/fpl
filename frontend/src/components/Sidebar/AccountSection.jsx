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
    if (!transferMeta?.firstWindowCloseAt) {
      setCountdown('')
      return
    }

    const updateCountdown = () => {
      const now = new Date()
      const closeDate = new Date(transferMeta.firstWindowCloseAt)
      const diffMs = closeDate - now

      if (diffMs <= 0) {
        setCountdown('EXPIRED')
        return
      }

      const totalSeconds = Math.floor(diffMs / 1000)
      const hours = Math.floor(totalSeconds / 3600)
      const minutes = Math.floor((totalSeconds % 3600) / 60)
      const seconds = totalSeconds % 60

      if (hours > 0) {
        setCountdown(`${hours}h ${minutes}m ${seconds}s`)
      } else if (minutes > 0) {
        setCountdown(`${minutes}m ${seconds}s`)
      } else {
        setCountdown(`${seconds}s`)
      }
    }

    updateCountdown()
    const interval = setInterval(updateCountdown, 1000)
    return () => clearInterval(interval)
  }, [transferMeta?.firstWindowCloseAt])

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

        {transferMeta ? (
          <div
            className={`mt-2 rounded-lg p-2 text-center text-xs font-semibold ${
              transferMeta.locked
                ? 'bg-[#f8d7da] text-[#721c24]'
                : 'bg-[#d4edda] text-[#155724]'
            }`}
          >
            <p>{transferMeta.locked ? '🔒 Transfer Window LOCKED' : '🔓 Transfer Window OPEN'}</p>
            {countdown ? (
              <p className="mt-1 font-mono text-sm font-bold tracking-wider">
                ⏱️ {countdown}
              </p>
            ) : null}
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
