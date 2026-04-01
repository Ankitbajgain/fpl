import { useEffect, useState } from "react";
import { useSelector } from "react-redux";

export function LeaderboardPage() {
  const { authToken, selectedLeagueSeason, leagues } = useSelector(
    (state) => state.squad,
  );

  const [playerLeaderboard, setPlayerLeaderboard] = useState([]);
  const [managerLeaderboard, setManagerLeaderboard] = useState([]);
  const [leaderboardLoading, setLeaderboardLoading] = useState(false);
  const [managerLeaderboardLoading, setManagerLeaderboardLoading] =
    useState(false);
  const [leaderboardError, setLeaderboardError] = useState("");
  const [managerLeaderboardError, setManagerLeaderboardError] = useState("");
  const selectedLeague =
    leagues.find((league) => league.id === selectedLeagueSeason) || null;

  useEffect(() => {
    let intervalId;

    const fetchLeaderboard = async () => {
      if (!authToken || !selectedLeagueSeason) return;

      setLeaderboardLoading(true);
      setManagerLeaderboardLoading(true);
      setLeaderboardError("");
      setManagerLeaderboardError("");
      try {
        const response = await fetch(
          `/api/v1/gameplay/leagues/${selectedLeagueSeason}/leaderboard?playersLimit=50&managersLimit=50`,
          { headers: { Authorization: `Bearer ${authToken}` } },
        );
        const payload = await response.json();
        if (!response.ok || !payload.success) {
          setLeaderboardError(payload.message || "Unable to load leaderboard");
          setManagerLeaderboardError(
            payload.message || "Unable to load manager leaderboard",
          );
          setLeaderboardLoading(false);
          setManagerLeaderboardLoading(false);
          return;
        }
        setPlayerLeaderboard(
          Array.isArray(payload.data?.players) ? payload.data.players : [],
        );
        setManagerLeaderboard(
          Array.isArray(payload.data?.managers) ? payload.data.managers : [],
        );
        setLeaderboardLoading(false);
        setManagerLeaderboardLoading(false);
      } catch {
        setLeaderboardError("Network error while loading leaderboard");
        setManagerLeaderboardError(
          "Network error while loading manager leaderboard",
        );
        setLeaderboardLoading(false);
        setManagerLeaderboardLoading(false);
      }
    };

    if (authToken && selectedLeagueSeason) {
      fetchLeaderboard();
      intervalId = setInterval(fetchLeaderboard, 30000); // Update every 30 seconds
    }

    return () => clearInterval(intervalId);
  }, [authToken, selectedLeagueSeason]);

  if (!selectedLeagueSeason) {
    return (
      <section className="rounded-2xl border border-gray-200 bg-white p-6 shadow-card">
        <h2 className="font-heading text-2xl text-gray-900">
          Overall Leaderboard
        </h2>
        <p className="mt-2 text-sm text-gray-600">
          Select a league to view overall player and manager standings.
        </p>
      </section>
    );
  }

  const TopRankBadge = ({ rank }) => {
    if (rank === 1) {
      return (
        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-yellow-500 text-sm font-bold text-white">
          1
        </div>
      );
    }
    if (rank === 2) {
      return (
        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-500 text-sm font-bold text-white">
          2
        </div>
      );
    }
    if (rank === 3) {
      return (
        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-orange-500 text-sm font-bold text-white">
          3
        </div>
      );
    }
    return (
      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-200 text-sm font-bold text-gray-700">
        {rank}
      </div>
    );
  };

  return (
    <section className="rounded-2xl border border-gray-200 bg-white p-6 shadow-card">
      <div className="mb-6">
        <h2 className="font-heading text-2xl text-gray-900">
          Overall Leaderboard
        </h2>
        <p className="mt-2 text-sm text-gray-600">
          {selectedLeague
            ? `${selectedLeague.name} - ${selectedLeague.competitionFull}`
            : "Loading league information..."}
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Player Leaderboard */}
        <div className="rounded-2xl border border-gray-200 bg-gray-50/40 p-5">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            Player Leaderboard
          </h2>
          <p className="text-sm text-gray-600 mb-4">
            Top performing players based on points earned
          </p>

          {leaderboardLoading && (
            <div className="text-center py-8">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-[#0b2b57]"></div>
              <p className="mt-2 text-sm text-gray-600">
                Loading leaderboard...
              </p>
            </div>
          )}

          {leaderboardError && (
            <div className="rounded-lg bg-red-50 p-4 text-sm text-red-700">
              {leaderboardError}
            </div>
          )}

          {!leaderboardLoading &&
            !leaderboardError &&
            playerLeaderboard.length === 0 && (
              <div className="text-center py-8">
                <p className="text-gray-600">
                  No leaderboard data available yet.
                </p>
                <p className="text-sm text-gray-500 mt-1">
                  Leaderboard updates after matches are finalized.
                </p>
              </div>
            )}

          {playerLeaderboard.length > 0 && (
            <div className="space-y-2">
              {playerLeaderboard.map((player, index) => (
                <div
                  key={player.playerId}
                  className={`flex items-center justify-between rounded-lg p-3 ${
                    index < 3
                      ? index === 0
                        ? "bg-yellow-50 border border-yellow-200"
                        : index === 1
                          ? "bg-gray-50 border border-gray-200"
                          : "bg-orange-50 border border-orange-200"
                      : "bg-white border border-gray-100"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <TopRankBadge rank={player.rank} />
                    <div>
                      <p className="font-medium text-gray-900">{player.name}</p>
                      <p className="text-sm text-gray-600">{player.team}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-bold text-[#0b2b57]">
                      {Number(player.totalPoints || 0).toFixed(2)}
                    </p>
                    <p className="text-xs text-gray-500">points</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Manager Leaderboard */}
        <div className="rounded-2xl border border-gray-200 bg-gray-50/40 p-5">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            Manager Leaderboard
          </h2>
          <p className="text-sm text-gray-600 mb-4">
            Top fantasy managers based on total points earned
          </p>

          {managerLeaderboardLoading && (
            <div className="text-center py-8">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-[#0b2b57]"></div>
              <p className="mt-2 text-sm text-gray-600">
                Loading leaderboard...
              </p>
            </div>
          )}

          {managerLeaderboardError && (
            <div className="rounded-lg bg-red-50 p-4 text-sm text-red-700">
              {managerLeaderboardError}
            </div>
          )}

          {!managerLeaderboardLoading &&
            !managerLeaderboardError &&
            managerLeaderboard.length === 0 && (
              <div className="text-center py-8">
                <p className="text-gray-600">
                  No manager leaderboard data available yet.
                </p>
                <p className="text-sm text-gray-500 mt-1">
                  Leaderboard updates after matches are finalized.
                </p>
              </div>
            )}

          {managerLeaderboard.length > 0 && (
            <div className="space-y-2">
              {managerLeaderboard.map((manager, index) => (
                <div
                  key={manager.userId}
                  className={`flex items-center justify-between rounded-lg p-3 ${
                    index < 3
                      ? index === 0
                        ? "bg-yellow-50 border border-yellow-200"
                        : index === 1
                          ? "bg-gray-50 border border-gray-200"
                          : "bg-orange-50 border border-orange-200"
                      : "bg-white border border-gray-100"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <TopRankBadge rank={manager.rank} />
                    <div>
                      <p className="font-medium text-gray-900">
                        {manager.name}
                      </p>
                      <p className="text-sm text-gray-600">Manager</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-bold text-[#0b2b57]">
                      {Number(manager.totalPoints || 0).toFixed(2)}
                    </p>
                    <p className="text-xs text-gray-500">points</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
