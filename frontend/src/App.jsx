import { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
    Navigate,
    Route,
    BrowserRouter as Router,
    Routes,
    useNavigate,
} from "react-router-dom";
import { AuthPanel } from "./components/Auth/AuthPanel";
import { Navbar } from "./components/Common/Navbar";
import { Header } from "./components/Header/Header";
import { LeaderboardPage } from "./components/Leaderboard/LeaderboardPage";
import { FavoriteBonusPanel } from "./components/LeagueSelector/FavoriteBonusPanel";
import { FixtureSelector } from "./components/LeagueSelector/FixtureSelector";
import { LeagueSelector } from "./components/LeagueSelector/LeagueSelector";
import { PlayerPool } from "./components/PlayerPool/PlayerPool";
import { PrivateLeagues } from "./components/PrivateLeagues/PrivateLeagues";
import { budgetCap, roleKeys, roleRules } from "./constants/gameConfig";
import {
    clearAuthSession,
    clearValidationState,
    selectLeague,
    setMode,
    setPlayers,
    setSelectedIds,
    setValidationError,
    setValidationResult,
    togglePlayer,
} from "./features/squad/squadSlice";
import { useAuth } from "./hooks/useAuth";
import { generateValidRoleCombinations } from "./utils/formation";
import {
    applyHomeAwayFilter,
    applyTeamFilter,
    filterPlayersByRole,
    getHomeCountry,
    getUniqueTeams,
    searchPlayers,
    sortByCredits,
} from "./utils/playerFiltering";

function App() {
  const dispatch = useDispatch();
  const {
    players,
    selectedIds,
    mode,
    validationResult,
    validationError,
    selectedLeagueSeason,
    leagues,
  } = useSelector((state) => state.squad);

  // Auth hook
  const {
    authToken,
    currentUser,
    authLoading,
    authError,
    setAuthError,
    handleLogin,
    handleRegister,
    restoreSession,
    handleLogout: authLogout,
  } = useAuth();

  // UI state
  const [activeRoleTab, setActiveRoleTab] = useState("BAT");
  const [playersLoading, setPlayersLoading] = useState(false);
  const [playersError, setPlayersError] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [creditSort, setCreditSort] = useState("desc");
  const [homeAwayFilter, setHomeAwayFilter] = useState("all");
  const [teamFilter, setTeamFilter] = useState("");
  const [selectionMessage, setSelectionMessage] = useState("");
  const [validateLoading, setValidateLoading] = useState(false);
  const [applyLoading, setApplyLoading] = useState(false);
  const [applyMessage, setApplyMessage] = useState("");
  const [transferMeta, setTransferMeta] = useState(null);
  const [transferMetaLoading, setTransferMetaLoading] = useState(false);
  const [transferMetaError, setTransferMetaError] = useState("");
  const [transferPolicy, setTransferPolicy] = useState(null);
  const [transferPolicyLoading, setTransferPolicyLoading] = useState(false);
  const [transferPolicyError, setTransferPolicyError] = useState("");
  const [transferWindowStatus, setTransferWindowStatus] = useState(null);
  const [captainId, setCaptainId] = useState(selectedIds[0] ?? "");
  const [viceCaptainId, setViceCaptainId] = useState(selectedIds[1] ?? "");
  const [authNotice, setAuthNotice] = useState("");
  const [selectedFixture, setSelectedFixture] = useState(null);

  // Computed values
  const selectedPlayers = useMemo(
    () => players.filter((player) => selectedIds.includes(player.id)),
    [players, selectedIds],
  );

  const roleCounts = useMemo(
    () =>
      selectedPlayers.reduce(
        (counts, player) => {
          counts[player.role] += 1;
          return counts;
        },
        { WK: 0, BAT: 0, AR: 0, BOWL: 0 },
      ),
    [selectedPlayers],
  );

  const selectedLeague = useMemo(
    () => leagues.find((league) => league.id === selectedLeagueSeason) || null,
    [leagues, selectedLeagueSeason],
  );

  const homeCountry = useMemo(
    () => getHomeCountry(mode, selectedLeague?.nation),
    [mode, selectedLeague],
  );
  const allTeams = useMemo(() => getUniqueTeams(players), [players]);

  const filteredPlayers = useMemo(() => {
    let list = filterPlayersByRole(players, activeRoleTab);
    list = applyHomeAwayFilter(list, mode, homeAwayFilter, homeCountry);
    list = applyTeamFilter(list, teamFilter);
    list = sortByCredits(list, creditSort);

    return list;
  }, [
    activeRoleTab,
    players,
    selectedPlayers,
    mode,
    homeAwayFilter,
    teamFilter,
    creditSort,
    homeCountry,
  ]);

  const displayedPlayers = useMemo(
    () => searchPlayers(filteredPlayers, searchQuery),
    [filteredPlayers, searchQuery],
  );

  const creditsUsed = selectedPlayers.reduce(
    (sum, player) => sum + player.credits,
    0,
  );
  const creditsLeft = Math.max(0, budgetCap - creditsUsed);

  // Effects
  useEffect(() => {
    restoreSession();
  }, []);

  useEffect(() => {
    setSelectedFixture(null);
    setTransferMeta(null);
    setTransferMetaError("");
    setTransferPolicy(null);
    setTransferPolicyError("");
    setApplyMessage("");
    setTransferWindowStatus(null);
    setSelectionMessage("");
    setActiveRoleTab("BAT");
    setSearchQuery("");
    setHomeAwayFilter("all");
    setTeamFilter("");
  }, [selectedLeagueSeason]);

  useEffect(() => {
    const fetchTransferPolicy = async () => {
      if (!authToken || !selectedLeagueSeason) return;

      setTransferPolicyLoading(true);
      setTransferPolicyError("");

      try {
        const response = await fetch(
          `/api/v1/gameplay/leagues/${selectedLeagueSeason}/transfers/policy`,
          {
            headers: { Authorization: `Bearer ${authToken}` },
          },
        );
        const payload = await response.json();

        if (!response.ok || !payload.success) {
          setTransferPolicyError(
            payload.message || "Unable to load transfer policy",
          );
          setTransferPolicyLoading(false);
          return;
        }

        setTransferPolicy(payload.data);
        setTransferPolicyLoading(false);
      } catch {
        setTransferPolicyError("Network error while loading transfer policy");
        setTransferPolicyLoading(false);
      }
    };

    fetchTransferPolicy();
  }, [authToken, selectedLeagueSeason]);

  // Poll real-time transfer window status every 10 s
  useEffect(() => {
    let intervalId;
    const fetchWindowStatus = async () => {
      if (!authToken || !selectedLeagueSeason) return;
      try {
        const response = await fetch(
          `/api/v1/gameplay/leagues/${selectedLeagueSeason}/transfer-window`,
          { headers: { Authorization: `Bearer ${authToken}` } },
        );
        const payload = await response.json();
        if (response.ok && payload.success)
          setTransferWindowStatus(payload.data);
      } catch {
        /* silent */
      }
    };
    if (authToken && selectedLeagueSeason) {
      fetchWindowStatus();
      intervalId = setInterval(fetchWindowStatus, 10000);
    }
    return () => clearInterval(intervalId);
  }, [authToken, selectedLeagueSeason]);

  useEffect(() => {
    const fetchTransferMeta = async () => {
      if (!authToken || !selectedLeagueSeason || !selectedFixture) return;

      setTransferMetaLoading(true);
      setTransferMetaError("");

      try {
        const response = await fetch("/api/v1/gameplay/transfers/meta", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${authToken}`,
          },
          body: JSON.stringify({
            usedTransfers: 0,
            freeTransfers: 0,
            fixtureStartAt: selectedFixture.startsAt,
            tossAt: selectedFixture.tossAt,
            leagueSeasonId: selectedLeagueSeason,
          }),
        });

        const payload = await response.json();
        if (!response.ok || !payload.success) {
          setTransferMetaError(
            payload.message || "Unable to fetch transfer window details",
          );
          setTransferMetaLoading(false);
          return;
        }

        setTransferMeta(payload.data);
        setTransferMetaLoading(false);
      } catch {
        setTransferMetaError("Network error while loading transfer details");
        setTransferMetaLoading(false);
      }
    };

    fetchTransferMeta();
  }, [authToken, selectedLeagueSeason, selectedFixture]);

  useEffect(() => {
    const fetchPlayers = async () => {
      if (!authToken || !selectedLeagueSeason) return;

      setPlayersLoading(true);
      setPlayersError("");

      try {
        const response = await fetch(
          `/api/v1/gameplay/leagues/${selectedLeagueSeason}/players`,
          {
            headers: { Authorization: `Bearer ${authToken}` },
          },
        );

        const payload = await response.json();
        if (!response.ok || !payload.success || !Array.isArray(payload.data)) {
          setPlayersError(payload.message || "Unable to load players list");
          setPlayersLoading(false);
          return;
        }

        dispatch(setPlayers(payload.data));
        setPlayersLoading(false);
      } catch {
        setPlayersError("Network error while loading players");
        setPlayersLoading(false);
      }
    };

    fetchPlayers();
  }, [authToken, selectedLeagueSeason, dispatch]);

  useEffect(() => {
    if (!selectedIds.length) {
      setCaptainId("");
      setViceCaptainId("");
      return;
    }

    if (!selectedIds.includes(Number(captainId))) {
      setCaptainId(selectedIds[0]);
    }

    if (
      !selectedIds.includes(Number(viceCaptainId)) ||
      Number(viceCaptainId) === Number(captainId)
    ) {
      const fallbackVice =
        selectedIds.find((id) => id !== Number(captainId)) ?? selectedIds[0];
      setViceCaptainId(fallbackVice);
    }
  }, [captainId, selectedIds, viceCaptainId]);

  // Handlers
  const handleTogglePlayer = (player) => {
    const selected = selectedIds.includes(player.id);

    if (selected) {
      dispatch(togglePlayer(player.id));
      setSelectionMessage("");
      return;
    }

    if (selectedIds.length >= 11) {
      setSelectionMessage("You can select maximum 11 players.");
      return;
    }

    const rule = roleRules[player.role];
    if (rule && roleCounts[player.role] >= rule.max) {
      setSelectionMessage(`${player.role} can be maximum ${rule.max}.`);
      return;
    }

    const normalizedName = String(player.name || "")
      .trim()
      .toLowerCase();
    const hasSameName = selectedPlayers.some(
      (selectedPlayer) =>
        selectedPlayer.id !== player.id &&
        String(selectedPlayer.name || "")
          .trim()
          .toLowerCase() === normalizedName,
    );
    if (hasSameName) {
      setSelectionMessage("Duplicate player is not allowed in squad.");
      return;
    }

    const normalizeCountry = (value) =>
      String(value || "")
        .trim()
        .toLowerCase();
    const awayCount = selectedPlayers.filter(
      (selectedPlayer) =>
        normalizeCountry(selectedPlayer.country) !==
        normalizeCountry(homeCountry),
    ).length;
    const nextIsAway =
      normalizeCountry(player.country) !== normalizeCountry(homeCountry);
    if (mode === "Classic" && nextIsAway && awayCount >= 4) {
      setSelectionMessage("Maximum 4 away players are allowed.");
      return;
    }

    const sameTeamCount = selectedPlayers.filter(
      (selectedPlayer) =>
        String(selectedPlayer.team || "")
          .trim()
          .toLowerCase() ===
        String(player.team || "")
          .trim()
          .toLowerCase(),
    ).length;
    if (sameTeamCount >= 7) {
      setSelectionMessage(`Maximum 7 players are allowed from ${player.team}.`);
      return;
    }

    if (creditsUsed + player.credits > budgetCap) {
      setSelectionMessage(
        `Budget exceeded. Total cannot be above ${budgetCap} credits.`,
      );
      return;
    }

    dispatch(togglePlayer(player.id));
    setSelectionMessage("");
  };

  const handleAutoSelectPlayers = () => {
    if (players.length < 11) {
      setSelectionMessage("Not enough players to auto select 11.");
      return;
    }

    const rolePlayers = roleKeys.reduce((acc, role) => {
      acc[role] = players.filter((player) => player.role === role);
      return acc;
    }, {});

    for (const role of roleKeys) {
      if (rolePlayers[role].length < roleRules[role].min) {
        setSelectionMessage(
          `Not enough ${role} players to satisfy minimum ${roleRules[role].min}.`,
        );
        return;
      }
    }

    const validRoleCombinations = generateValidRoleCombinations(roleRules);

    let bestSelection = null;
    let bestTotal = 0;

    for (let attempt = 0; attempt < 3000; attempt += 1) {
      const combo =
        validRoleCombinations[
          Math.floor(Math.random() * validRoleCombinations.length)
        ];
      const picked = [];

      for (const role of roleKeys) {
        const shuffled = [...rolePlayers[role]].sort(() => Math.random() - 0.5);
        const required = combo[role];
        if (shuffled.length < required) {
          picked.length = 0;
          break;
        }
        picked.push(...shuffled.slice(0, required));
      }

      if (picked.length !== 11) {
        continue;
      }

      const total = picked.reduce((sum, player) => sum + player.credits, 0);
      const awayCount = picked.filter(
        (player) =>
          String(player.country || "")
            .trim()
            .toLowerCase() !==
          String(homeCountry || "")
            .trim()
            .toLowerCase(),
      ).length;
      const teamCounts = picked.reduce((acc, player) => {
        const teamKey = String(player.team || "")
          .trim()
          .toLowerCase();
        acc[teamKey] = (acc[teamKey] || 0) + 1;
        return acc;
      }, {});
      const exceedsTeamLimit = Object.values(teamCounts).some(
        (count) => count > 7,
      );

      if (
        total <= budgetCap &&
        awayCount <= 4 &&
        !exceedsTeamLimit &&
        total > bestTotal
      ) {
        bestSelection = picked;
        bestTotal = total;
      }

      if (
        Math.abs(total - budgetCap) < 0.001 &&
        awayCount <= 4 &&
        !exceedsTeamLimit
      ) {
        bestSelection = picked;
        bestTotal = total;
        break;
      }
    }

    if (!bestSelection) {
      setSelectionMessage(
        "Could not find a random 11-player squad within 100 credits, max 4 away players, and max 7 players per team. Try again.",
      );
      return;
    }

    dispatch(setSelectedIds(bestSelection.map((player) => player.id)));
    setSelectionMessage(
      bestTotal === budgetCap
        ? "Random squad selected with 100 credits."
        : `Random squad selected with ${bestTotal.toFixed(1)} credits (<= 100).`,
    );
    dispatch(clearValidationState());
  };

  const handleValidateSquad = async () => {
    if (!authToken) {
      dispatch(setValidationError("Please login first to validate the squad."));
      return;
    }

    if (selectedIds.length !== 11) {
      dispatch(
        setValidationError("Select exactly 11 players before validation."),
      );
      return;
    }

    if (
      !captainId ||
      !viceCaptainId ||
      Number(captainId) === Number(viceCaptainId)
    ) {
      dispatch(
        setValidationError(
          "Captain and vice-captain must be different selected players.",
        ),
      );
      return;
    }

    setValidateLoading(true);

    try {
      const response = await fetch("/api/v1/gameplay/squad/validate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${authToken}`,
        },
        body: JSON.stringify({
          playerIds: selectedIds,
          captainId: Number(captainId),
          viceCaptainId: Number(viceCaptainId),
          budgetCap,
          leagueSeasonId: selectedLeagueSeason,
        }),
      });

      const payload = await response.json();
      if (!response.ok || !payload.success) {
        dispatch(setValidationError(payload.message || "Validation failed"));
        setValidateLoading(false);
        return;
      }

      dispatch(setValidationResult(payload.data));
      setValidateLoading(false);
    } catch {
      dispatch(setValidationError("Network error while validating squad."));
      setValidateLoading(false);
    }
  };

  const handleLogout = () => {
    dispatch(clearAuthSession());
    dispatch(clearValidationState());
    authLogout();
    setAuthError("");
    setAuthNotice("");
  };

  const handleApplyTransfers = async () => {
    if (!authToken || !selectedLeagueSeason || !selectedFixture) {
      setApplyMessage("Select league and fixture first.");
      return;
    }

    if (selectedIds.length !== 11) {
      setApplyMessage("Select exactly 11 players before applying transfers.");
      return;
    }

    if (
      !captainId ||
      !viceCaptainId ||
      Number(captainId) === Number(viceCaptainId)
    ) {
      setApplyMessage(
        "Captain and vice-captain must be different selected players.",
      );
      return;
    }

    setApplyLoading(true);
    setApplyMessage("");

    try {
      const response = await fetch(
        `/api/v1/gameplay/leagues/${selectedLeagueSeason}/fixtures/${selectedFixture.id}/squad/apply`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${authToken}`,
          },
          body: JSON.stringify({
            playerIds: selectedIds,
            captainId: Number(captainId),
            viceCaptainId: Number(viceCaptainId),
            budgetCap,
          }),
        },
      );

      const payload = await response.json();
      if (!response.ok || !payload.success) {
        setApplyMessage(payload.message || "Failed to apply transfers");
        setApplyLoading(false);
        return;
      }

      const result = payload.data;
      const scopeText = result.deferredToNextFixture
        ? `Applied to upcoming fixture #${result.appliedToFixtureId} (current fixture already started).`
        : `Applied to fixture #${result.appliedToFixtureId}.`;

      setApplyMessage(
        `${scopeText} Transfers used now: ${result.transfersUsed}.`,
      );

      // Refresh transfer meta after successful apply
      const metaResponse = await fetch("/api/v1/gameplay/transfers/meta", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${authToken}`,
        },
        body: JSON.stringify({
          usedTransfers: 0,
          freeTransfers: 0,
          fixtureStartAt: selectedFixture.startsAt,
          tossAt: selectedFixture.tossAt,
          leagueSeasonId: selectedLeagueSeason,
        }),
      });

      const metaPayload = await metaResponse.json();
      if (metaResponse.ok && metaPayload.success) {
        setTransferMeta(metaPayload.data);
      }

      setApplyLoading(false);
    } catch {
      setApplyMessage("Network error while applying transfers.");
      setApplyLoading(false);
    }
  };

  // Render: Not authenticated
  if (!authToken || !currentUser) {
    return (
      <div className=" bg-gradient-to-r from-[#ffffff] to-[#e0f8c8]   font-body text-ink">
        <AuthPanel
          onLogin={handleLogin}
          onRegister={handleRegister}
          isLoading={authLoading}
          error={authError}
          notice={authNotice}
          setError={setAuthError}
          setNotice={setAuthNotice}
        />
      </div>
    );
  }

  const MainApp = () => {
    const navigate = useNavigate();

    const scrollToSquadBuilder = () => {
      const target = document.getElementById("squad-builder-section");
      if (target) {
        target.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    };

    const handleBuildSquadClick = () => {
      if (window.location.pathname !== "/") {
        navigate("/");
        setTimeout(scrollToSquadBuilder, 120);
        return;
      }
      scrollToSquadBuilder();
    };

    const handleViewLeaderboardClick = () => {
      navigate("/league");
    };

    if (!selectedLeagueSeason) {
      return (
        <div className="min-h-screen bg-[#0b2b57] font-body text-ink">
          <Navbar currentUser={currentUser} onLogout={handleLogout} />
          <div className="bg-white">
            <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
              <LeagueSelector />
            </div>
          </div>
        </div>
      );
    }

    // Main app with navbar, league selector, and routes
    return (
      <div className="min-h-screen bg-[#0b2b57] font-body text-ink">
        <Navbar currentUser={currentUser} onLogout={handleLogout} />

        {/* League Season Selector */}
        <div className="bg-white border-b border-gray-200">
          <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-semibold text-gray-900">
                  Current League
                </h2>
                <p className="text-sm text-gray-600">
                  {selectedLeague
                    ? `${selectedLeague.name} - ${selectedLeague.competitionFull}`
                    : "Loading..."}
                </p>
              </div>
              <div className="flex items-center gap-4">
                <span className="text-sm text-gray-600">
                  {selectedLeague
                    ? `${selectedLeague.totalFixtures} fixtures`
                    : ""}
                </span>
                <button
                  onClick={() => {
                    setSelectedFixture(null);
                    dispatch(selectLeague(null));
                  }}
                  className="rounded-lg bg-[#0b2b57] px-4 py-2 text-sm font-medium text-white hover:bg-[#1e4a8a] transition"
                >
                  Change League
                </button>
              </div>
            </div>
          </div>
        </div>

        <Routes>
          <Route
            path="/private-leagues"
            element={<Navigate replace to="/league" />}
          />
          <Route
            path="/league"
            element={
              <div className="bg-white">
                <div className="mx-auto max-w-7xl space-y-8 px-4 py-6 sm:px-6 lg:px-8">
                  <LeaderboardPage />
                  <PrivateLeagues
                    authToken={authToken}
                    currentUser={currentUser}
                    selectedLeagueSeason={selectedLeagueSeason}
                  />
                </div>
              </div>
            }
          />
          <Route
            path="/"
            element={
              <div className="bg-white">
                <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
                  <Header
                    onBuildSquad={handleBuildSquadClick}
                    onViewLeaderboard={handleViewLeaderboardClick}
                  />

                  <section className="mt-8">
                    <FavoriteBonusPanel
                      authToken={authToken}
                      selectedLeagueSeason={selectedLeagueSeason}
                    />
                  </section>

                  {!selectedFixture ? (
                    <section
                      id="squad-builder-section"
                      className="mt-8 mx-auto max-w-5xl"
                    >
                      <FixtureSelector
                        selectedFixture={selectedFixture}
                        onSelectFixture={setSelectedFixture}
                      />
                    </section>
                  ) : (
                    <section id="squad-builder-section" className="mt-8">
                      <PlayerPool
                        mode={mode}
                        homeCountry={homeCountry}
                        roleCounts={roleCounts}
                        activeTab={activeRoleTab}
                        displayedPlayers={displayedPlayers}
                        selectedIds={selectedIds}
                        creditSort={creditSort}
                        homeAwayFilter={homeAwayFilter}
                        teamFilter={teamFilter}
                        allTeams={allTeams}
                        searchQuery={searchQuery}
                        playersLoading={playersLoading}
                        playersError={playersError}
                        selectionMessage={selectionMessage}
                        transferWindowLocked={
                          transferWindowStatus
                            ? !transferWindowStatus.windowOpen
                            : transferMeta?.locked || false
                        }
                        selectedCount={selectedIds.length}
                        creditsUsed={creditsUsed}
                        creditsLeft={creditsLeft}
                        onTabChange={(tab) => {
                          setActiveRoleTab(tab);
                          setSelectionMessage("");
                        }}
                        onTogglePlayer={handleTogglePlayer}
                        onAutoSelect={handleAutoSelectPlayers}
                        onSearchChange={setSearchQuery}
                        onCreditSortChange={setCreditSort}
                        onHomeAwayChange={setHomeAwayFilter}
                        onTeamFilterChange={setTeamFilter}
                        selectedPlayers={selectedPlayers}
                        captainId={captainId}
                        viceCaptainId={viceCaptainId}
                        validateLoading={validateLoading}
                        validationResult={validationResult}
                        validationError={validationError}
                        applyLoading={applyLoading}
                        applyMessage={applyMessage}
                        transferMeta={transferMeta}
                        transferMetaLoading={transferMetaLoading}
                        transferMetaError={transferMetaError}
                        transferPolicy={transferPolicy}
                        transferPolicyLoading={transferPolicyLoading}
                        transferPolicyError={transferPolicyError}
                        onModeChange={(newMode) => dispatch(setMode(newMode))}
                        onCaptainChange={setCaptainId}
                        onViceCaptainChange={setViceCaptainId}
                        onValidate={handleValidateSquad}
                        onApplyTransfers={handleApplyTransfers}
                      />
                    </section>
                  )}
                </div>
              </div>
            }
          />
        </Routes>
      </div>
    );
  };

  // Render: Authenticated
  if (authToken && currentUser) {
    return (
      <Router>
        <MainApp />
      </Router>
    );
  }
}

export default App;
