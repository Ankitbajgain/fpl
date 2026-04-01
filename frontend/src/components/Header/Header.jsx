export function Header({ onBuildSquad, onViewLeaderboard }) {
  return (
    <section className="relative overflow-hidden rounded-3xl border border-gray-200 bg-white p-6 text-gray-900 shadow-lg sm:p-10">
      <div className="pointer-events-none absolute -right-10 -top-16 h-52 w-52 rounded-full bg-[#0b2b57]/10 blur-2xl" />
      <div className="pointer-events-none absolute -bottom-16 left-10 h-40 w-40 rounded-full bg-[#0b2b57]/5 blur-2xl" />

      <div className="relative z-10">
        <p className="inline-block rounded-full border border-[#0b2b57]/20 bg-[#0b2b57]/5 px-3 py-1 text-xs uppercase tracking-[0.2em] text-[#0b2b57]">
          Fantasy League
        </p>
        <h1 className="mt-5 font-heading text-3xl leading-tight text-gray-900 sm:text-5xl">
          Build Your Winning Squad
          <span className="block text-[#0b2b57]">For Every Matchday</span>
        </h1>
        <p className="mt-4 max-w-xl text-sm text-gray-600 sm:text-base">
          Select your captain, vice-captain, and optimal formation. Track your
          budget, monitor transfers, and compete with friends in private
          leagues.
        </p>
        <div className="mt-6 flex flex-wrap gap-3">
          <button
            onClick={onBuildSquad}
            className="rounded-xl bg-[#0b2b57] px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-[#1e4a8a]"
          >
            Build Squad
          </button>
          <button
            onClick={onViewLeaderboard}
            className="rounded-xl border border-[#0b2b57]/30 px-5 py-2.5 text-sm font-semibold text-[#0b2b57] transition hover:bg-[#0b2b57]/5"
          >
            View Leaderboard
          </button>
        </div>
      </div>
    </section>
  );
}
