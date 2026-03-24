import { modeOptions } from '../../constants/gameConfig'

export function GameModeSelector({ mode, onModeChange }) {
  return (
    <div>
      <h2 className="font-heading text-xl">Game Mode</h2>
      <div className="mt-3 flex flex-wrap gap-2">
        {modeOptions.map((item) => (
          <button
            key={item}
            onClick={() => onModeChange(item)}
            className={`rounded-xl px-3 py-2 text-sm font-semibold transition ${
              mode === item
                ? 'bg-[#0e6f59] text-white'
                : 'bg-[#f4ede3] text-[#354252] hover:bg-[#ece2d4]'
            }`}
          >
            {item}
          </button>
        ))}
      </div>
    </div>
  )
}
