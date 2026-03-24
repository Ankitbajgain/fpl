export function HeroSection() {
  return (
    <section className="relative overflow-hidden rounded-3xl border border-white/60 bg-gradient-to-br from-[#103a2e] via-[#0f5e4d] to-[#ec8456] p-6 text-white shadow-card sm:p-10">
      <div className="pointer-events-none absolute -right-10 -top-16 h-52 w-52 rounded-full bg-white/20 blur-2xl" />
      <div className="pointer-events-none absolute -bottom-16 left-10 h-40 w-40 rounded-full bg-[#ffe3d6]/40 blur-2xl" />

      <div className="relative z-10 grid gap-8 lg:grid-cols-[1.2fr_0.8fr]">
        <div>
          <p className="inline-block rounded-full border border-white/35 bg-white/10 px-3 py-1 text-xs uppercase tracking-[0.2em]">
            New FPL Frontend
          </p>
          <h1 className="mt-5 font-heading text-3xl leading-tight sm:text-5xl">
            Build Matchday Squads Faster
            <span className="block text-[#ffe6d8]">Across Mobile & Desktop</span>
          </h1>
          <p className="mt-4 max-w-xl text-sm text-white/85 sm:text-base">
            React + Tailwind + Redux experience for fantasy management with formation
            controls, budget tracking, favorites, and live style cards.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <button className="rounded-xl bg-white px-5 py-2.5 text-sm font-semibold text-[#13382f] transition hover:bg-[#fef4ee]">
              Create Team
            </button>
            <button className="rounded-xl border border-white/50 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-white/10">
              Explore Fixtures
            </button>
          </div>
        </div>

        <div className="grid gap-3 rounded-2xl border border-white/20 bg-black/15 p-4 backdrop-blur-md sm:grid-cols-3 lg:grid-cols-1">
          {/* Stats will be passed as children */}
        </div>
      </div>
    </section>
  )
}
