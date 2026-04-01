const roleTabs = [
  { value: "BAT", label: "BAT" },
  { value: "BOWL", label: "BOWL" },
  { value: "WK", label: "WK" },
  { value: "AR", label: "ALLROUND" },
];

export function RoleTabs({ activeTab, onTabChange, isLocked, roleCounts }) {
  return (
    <div className="flex flex-wrap gap-2">
      {roleTabs.map((tab) => (
        <button
          key={tab.value}
          onClick={() => onTabChange(tab.value)}
          disabled={isLocked}
          className={`rounded-xl border px-3 py-2 text-sm font-semibold transition ${
            activeTab === tab.value
              ? "border-[#0b2b57] bg-[#0b2b57] text-white disabled:opacity-60"
              : "border-[#d8e2ef] bg-[#f3f7fc] text-[#33485f] hover:bg-[#e8f0f9] disabled:opacity-60"
          }`}
        >
          {tab.label}({roleCounts?.[tab.value] ?? 0})
        </button>
      ))}
    </div>
  );
}
