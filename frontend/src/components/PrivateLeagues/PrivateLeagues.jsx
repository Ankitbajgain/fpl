import { PrivateLeaguePanel } from "../LeagueSelector/PrivateLeaguePanel";

export function PrivateLeagues({
  authToken,
  currentUser,
  selectedLeagueSeason,
}) {
  return (
    <section className="rounded-2xl border border-gray-200 bg-white p-6 shadow-card">
      <div className="mb-6">
        <h2 className="font-heading text-2xl text-gray-900">Private Leagues</h2>
        <p className="mt-2 text-sm text-gray-600">
          Create and manage your private fantasy leagues. Compete with friends
          and family!
        </p>
      </div>

      {/* Private League Panel */}
      <div className="rounded-2xl border border-gray-200 bg-gray-50/40 p-5">
        <PrivateLeaguePanel
          authToken={authToken}
          selectedLeagueSeason={selectedLeagueSeason}
          currentUser={currentUser}
        />
      </div>
    </section>
  );
}
