export function StatCard({ label, value }) {
  return (
    <div className="rounded-xl bg-gray-50 border border-gray-200 p-3">
      <p className="text-xs uppercase tracking-[0.14em] text-gray-600">
        {label}
      </p>
      <p className="mt-1 font-heading text-2xl text-gray-900">{value}</p>
    </div>
  );
}
