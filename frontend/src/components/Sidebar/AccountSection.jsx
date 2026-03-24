export function AccountSection({
  currentUser,
  selectedPlayers,
  captainId,
  viceCaptainId,
  validateLoading,
  validationResult,
  validationError,
  onCaptainChange,
  onViceCaptainChange,
  onValidate,
  onLogout,
}) {
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
    </div>
  )
}
