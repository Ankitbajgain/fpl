import { CurrentSetup } from "./CurrentSetup";
import { FormationDisplay } from "./FormationDisplay";
import { GameModeSelector } from "./GameModeSelector";

export function Sidebar({
  mode,
  roleCounts,
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
  applyLoading,
  applyMessage,
  onModeChange,
  onCaptainChange,
  onViceCaptainChange,
  onValidate,
  onApplyTransfers,
}) {
  return (
    <aside className="space-y-6 rounded-3xl border border-gray-200 bg-white p-5 shadow-card">
      <GameModeSelector mode={mode} onModeChange={onModeChange} />

      <FormationDisplay roleCounts={roleCounts} />

      <CurrentSetup mode={mode} roleCounts={roleCounts} />

      <div className="space-y-3 rounded-2xl border border-gray-200 bg-gray-50 p-4">
        <p className="text-xs uppercase tracking-[0.15em] text-gray-600">
          Squad Setup
        </p>

        <div className="space-y-2 rounded-xl bg-white p-3">
          <label className="block text-xs font-semibold uppercase tracking-[0.12em] text-gray-700">
            Captain
          </label>
          <select
            value={captainId}
            onChange={(e) => onCaptainChange(Number(e.target.value))}
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
          >
            {selectedPlayers.map((player) => (
              <option key={`captain-${player.id}`} value={player.id}>
                {player.name}
              </option>
            ))}
          </select>

          <label className="block pt-1 text-xs font-semibold uppercase tracking-[0.12em] text-gray-700">
            Vice Captain
          </label>
          <select
            value={viceCaptainId}
            onChange={(e) => onViceCaptainChange(Number(e.target.value))}
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
          >
            {selectedPlayers.map((player) => (
              <option key={`vice-${player.id}`} value={player.id}>
                {player.name}
              </option>
            ))}
          </select>
        </div>

        <div className="rounded-xl bg-white p-3">
          <button
            onClick={onValidate}
            disabled={validateLoading}
            className="w-full rounded-lg bg-[#0b2b57] px-3 py-2 text-sm font-semibold text-white hover:bg-[#1e4a8a] disabled:opacity-70 transition"
          >
            {validateLoading ? "Validating..." : "Validate Squad"}
          </button>
          {validationResult && (
            <p className="mt-2 text-xs text-green-700">{validationResult}</p>
          )}
          {validationError && (
            <p className="mt-2 text-xs text-red-600">{validationError}</p>
          )}
        </div>

        <div className="rounded-xl bg-white p-3">
          <button
            onClick={onApplyTransfers}
            disabled={applyLoading}
            className="w-full rounded-lg bg-[#0b2b57] px-3 py-2 text-sm font-semibold text-white hover:bg-[#1e4a8a] disabled:opacity-70 transition"
          >
            {applyLoading ? "Applying..." : "Apply Transfers"}
          </button>
          {applyMessage && (
            <p className="mt-2 text-xs text-[#44505c]">{applyMessage}</p>
          )}
        </div>
      </div>
    </aside>
  );
}
