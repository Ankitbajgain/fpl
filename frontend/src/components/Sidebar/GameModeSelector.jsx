import { modeOptions } from "../../constants/gameConfig";

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
                ? "bg-[#0b2b57] text-white"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
          >
            {item}
          </button>
        ))}
      </div>
    </div>
  );
}
