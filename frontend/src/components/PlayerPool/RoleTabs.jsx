import { roleTabs } from '../../constants/gameConfig'

export function RoleTabs({ activeTab, onTabChange, isLocked }) {
  return (
    <div className="flex flex-wrap gap-2">
      {roleTabs.map((tab) => (
        <button
          key={tab.value}
          onClick={() => onTabChange(tab.value)}
          disabled={isLocked}
          className={`rounded-xl px-3 py-2 text-sm font-semibold transition ${
            activeTab === tab.value
              ? 'bg-[#0e6f59] text-white disabled:opacity-60'
              : 'bg-[#f4ede3] text-[#4e5a66] hover:bg-[#ece2d4] disabled:opacity-60'
          }`}
        >
          {tab.label}
        </button>
      ))}
    </div>
  )
}
