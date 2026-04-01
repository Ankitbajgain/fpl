import { useEffect, useState } from "react";

export function TeamPreviewModal({
  isOpen,
  onClose,
  selectedPlayers,
  captainId,
  viceCaptainId,
  creditsUsed,
}) {
  const [roleDistribution, setRoleDistribution] = useState({});

  useEffect(() => {
    const distribution = selectedPlayers.reduce((acc, player) => {
      acc[player.role] = (acc[player.role] || 0) + 1;
      return acc;
    }, {});
    setRoleDistribution(distribution);
  }, [selectedPlayers]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black bg-opacity-50 p-4">
      <div className="w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-3xl bg-white p-6 shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="font-heading text-2xl text-gray-900">Team Preview</h2>
          <button
            onClick={onClose}
            className="rounded-lg p-2 hover:bg-gray-100 transition"
          >
            <svg
              className="h-6 w-6 text-gray-600"
              fill="none"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Team Stats */}
        <div className="mb-6 grid gap-3 sm:grid-cols-3">
          <div className="rounded-2xl bg-gradient-to-br from-blue-50 to-blue-100 p-4 border border-blue-200">
            <p className="text-xs font-semibold text-blue-600 uppercase tracking-wider">
              Players Selected
            </p>
            <p className="mt-2 text-3xl font-bold text-blue-900">
              {selectedPlayers.length}/11
            </p>
          </div>
          <div className="rounded-2xl bg-gradient-to-br from-green-50 to-green-100 p-4 border border-green-200">
            <p className="text-xs font-semibold text-green-600 uppercase tracking-wider">
              Credits Used
            </p>
            <p className="mt-2 text-3xl font-bold text-green-900">
              {creditsUsed.toFixed(1)}
            </p>
          </div>
          <div className="rounded-2xl bg-gradient-to-br from-purple-50 to-purple-100 p-4 border border-purple-200">
            <p className="text-xs font-semibold text-purple-600 uppercase tracking-wider">
              Credits Left
            </p>
            <p className="mt-2 text-3xl font-bold text-purple-900">
              {(100 - creditsUsed).toFixed(1)}
            </p>
          </div>
        </div>

        {/* Role Distribution */}
        <div className="mb-6">
          <h3 className="mb-3 font-semibold text-gray-900">
            Role Distribution
          </h3>
          <div className="grid gap-2 sm:grid-cols-4">
            {["WK", "BAT", "AR", "BOWL"].map((role) => (
              <div
                key={role}
                className="rounded-lg bg-gray-50 p-3 border border-gray-200 text-center"
              >
                <p className="text-xs font-semibold text-gray-600 uppercase">
                  {role}
                </p>
                <p className="mt-1 text-2xl font-bold text-gray-900">
                  {roleDistribution[role] || 0}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Players List */}
        <div className="mb-6">
          <h3 className="mb-3 font-semibold text-gray-900">Selected Players</h3>
          <div className="space-y-2 max-h-64 overflow-y-auto">
            {selectedPlayers.length === 0 ? (
              <p className="text-center py-8 text-gray-500">
                No players selected yet
              </p>
            ) : (
              selectedPlayers.map((player) => (
                <div
                  key={player.id}
                  className="flex items-center justify-between rounded-lg bg-gray-50 p-3 border border-gray-200"
                >
                  <div className="flex-1">
                    <p className="font-medium text-gray-900">{player.name}</p>
                    <p className="text-xs text-gray-600">{player.team}</p>
                  </div>
                  <div className="flex items-center gap-3 text-right">
                    <div>
                      <span className="inline-block rounded-full bg-[#0b2b57] text-white text-xs px-2 py-1 font-semibold">
                        {player.role}
                      </span>
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900">
                        {player.credits.toFixed(1)}
                      </p>
                      <p className="text-xs text-gray-600">Cr</p>
                    </div>
                    {captainId === player.id && (
                      <span className="inline-block rounded-full bg-yellow-100 text-yellow-700 text-xs px-2 py-1 font-bold">
                        C
                      </span>
                    )}
                    {viceCaptainId === player.id && (
                      <span className="inline-block rounded-full bg-gray-200 text-gray-700 text-xs px-2 py-1 font-bold">
                        VC
                      </span>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Close Button */}
        <button
          onClick={onClose}
          className="w-full rounded-lg bg-[#0b2b57] px-4 py-3 text-center font-semibold text-white hover:bg-[#1e4a8a] transition"
        >
          Got it
        </button>
      </div>
    </div>
  );
}
