export function StatCard({ label, value }) {
  return (
    <div className="rounded-xl bg-white/15 p-3">
      <p className="text-xs uppercase tracking-[0.14em] text-white/80">{label}</p>
      <p className="mt-1 font-heading text-2xl">{value}</p>
    </div>
  )
}
