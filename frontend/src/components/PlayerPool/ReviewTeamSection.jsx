import { useState } from "react";

export function ReviewTeamSection({
  selectedPlayers,
  captainId,
  viceCaptainId,
  onCaptainChange,
  onViceCaptainChange,
  creditsUsed,
  roleCounts,
  onBack,
  onValidate,
  validateLoading,
  validationResult,
  validationError,
}) {
  const [localValidationError, setLocalValidationError] = useState("");

  // Validation checks before allowing submit
  const canValidate = () => {
    if (selectedPlayers.length !== 11) {
      setLocalValidationError("Select exactly 11 players to validate");
      return false;
    }
    if (!captainId || !viceCaptainId) {
      setLocalValidationError("Captain and Vice-Captain must be selected");
      return false;
    }
    if (Number(captainId) === Number(viceCaptainId)) {
      setLocalValidationError(
        "Captain and Vice-Captain must be different players",
      );
      return false;
    }
    setLocalValidationError("");
    return true;
  };

  const handleCaptainSelect = (playerId) => {
    if (Number(viceCaptainId) === Number(playerId)) {
      setLocalValidationError("This player is already Vice-Captain");
      return;
    }
    onCaptainChange(playerId);
    setLocalValidationError("");
  };

  const handleViceCaptainSelect = (playerId) => {
    if (Number(captainId) === Number(playerId)) {
      setLocalValidationError("This player is already Captain");
      return;
    }
    onViceCaptainChange(playerId);
    setLocalValidationError("");
  };

  const handleValidateClick = () => {
    if (canValidate()) {
      onValidate();
    }
  };

  return (
    <section className="rounded-3xl border border-gray-200 bg-white p-6 shadow-card">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="font-heading text-2xl text-gray-900">
            Review Your Team
          </h2>
          <p className="mt-1 text-sm text-gray-600">
            Select your captain and vice-captain, then validate your team
          </p>
        </div>
        <button
          onClick={onBack}
          className="rounded-lg px-4 py-2 text-sm font-semibold text-gray-700 border border-gray-300 hover:bg-gray-50 transition"
        >
          ← Back to Selection
        </button>
      </div>

      {/* Team Summary */}
      <div className="mb-6 grid gap-3 sm:grid-cols-4">
        <div className="rounded-xl bg-blue-50 border border-blue-200 p-3">
          <p className="text-xs font-semibold text-blue-600 uppercase">
            Players
          </p>
          <p className="mt-1 text-2xl font-bold text-blue-900">
            {selectedPlayers.length}/11
          </p>
        </div>
        <div className="rounded-xl bg-green-50 border border-green-200 p-3">
          <p className="text-xs font-semibold text-green-600 uppercase">
            Credits
          </p>
          <p className="mt-1 text-2xl font-bold text-green-900">
            {creditsUsed.toFixed(1)}/100
          </p>
        </div>
        <div className="rounded-xl bg-purple-50 border border-purple-200 p-3">
          <p className="text-xs font-semibold text-purple-600 uppercase">
            Captain
          </p>
          <p className="mt-1 text-lg font-bold text-purple-900">
            {selectedPlayers
              .find((p) => Number(p.id) === Number(captainId))
              ?.name.split(" ")[0] || "—"}
          </p>
        </div>
        <div className="rounded-xl bg-orange-50 border border-orange-200 p-3">
          <p className="text-xs font-semibold text-orange-600 uppercase">
            Vice-Captain
          </p>
          <p className="mt-1 text-lg font-bold text-orange-900">
            {selectedPlayers
              .find((p) => Number(p.id) === Number(viceCaptainId))
              ?.name.split(" ")[0] || "—"}
          </p>
        </div>
      </div>

      {/* Error Messages */}
      {localValidationError && (
        <div className="mb-6 rounded-lg bg-red-50 border border-red-200 p-4">
          <p className="text-sm text-red-700 font-semibold">
            ⚠️ {localValidationError}
          </p>
        </div>
      )}
      {validationError && (
        <div className="mb-6 rounded-lg bg-red-50 border border-red-200 p-4">
          <p className="text-sm text-red-700 font-semibold">
            ⚠️ {validationError}
          </p>
        </div>
      )}

      {/* Selected Players Grid */}
      <div className="mb-6">
        <h3 className="mb-4 font-heading text-lg text-gray-900">
          Selected Players – Choose Captain & Vice-Captain
        </h3>
        <div className="grid gap-3 sm:grid-cols-2">
          {selectedPlayers.map((player) => {
            const isCapt = Number(captainId) === Number(player.id);
            const isVc = Number(viceCaptainId) === Number(player.id);

            return (
              <div
                key={player.id}
                className={`rounded-2xl border-2 p-4 transition ${
                  isCapt
                    ? "border-yellow-400 bg-yellow-50"
                    : isVc
                      ? "border-gray-400 bg-gray-50"
                      : "border-gray-200 bg-white"
                }`}
              >
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h4 className="font-semibold text-gray-900">
                      {player.name}
                    </h4>
                    <p className="text-xs text-gray-600">{player.team}</p>
                  </div>
                  <div className="text-right">
                    <span className="inline-block rounded-lg bg-[#0b2b57] text-white text-xs px-2 py-1 font-bold">
                      {player.role}
                    </span>
                    <p className="mt-1 text-sm font-semibold text-gray-900">
                      {player.credits.toFixed(1)} Cr
                    </p>
                  </div>
                </div>

                {/* Captain/VC Toggle Buttons */}
                <div className="flex gap-2">
                  <button
                    onClick={() => handleCaptainSelect(player.id)}
                    className={`flex-1 rounded-lg px-2 py-2 text-xs font-bold transition ${
                      isCapt
                        ? "bg-yellow-400 text-white shadow-md"
                        : "bg-yellow-100 text-yellow-700 hover:bg-yellow-200"
                    }`}
                  >
                    {isCapt ? "⭐ Captain" : "Captain"}
                  </button>
                  <button
                    onClick={() => handleViceCaptainSelect(player.id)}
                    className={`flex-1 rounded-lg px-2 py-2 text-xs font-bold transition ${
                      isVc
                        ? "bg-gray-400 text-white shadow-md"
                        : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                    }`}
                  >
                    {isVc ? "✓ V-Captain" : "V-Captain"}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Validation Result */}
      {validationResult && (
        <div className="mb-6 rounded-lg bg-green-50 border border-green-200 p-4">
          <p className="text-sm font-semibold text-green-700">
            ✓ Team validated successfully!
          </p>
          {validationResult.message && (
            <p className="mt-2 text-xs text-green-600">
              {validationResult.message}
            </p>
          )}
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex gap-3">
        <button
          onClick={onBack}
          className="flex-1 rounded-lg border border-gray-300 px-4 py-3 font-semibold text-gray-700 hover:bg-gray-50 transition"
        >
          ← Back
        </button>
        <button
          onClick={handleValidateClick}
          disabled={validateLoading || selectedPlayers.length !== 11}
          className="flex-1 rounded-lg bg-[#0b2b57] px-4 py-3 font-semibold text-white hover:bg-[#1e4a8a] disabled:opacity-60 disabled:cursor-not-allowed transition"
        >
          {validateLoading ? "🔄 Validating..." : "✓ Validate Team"}
        </button>
      </div>
    </section>
  );
}
