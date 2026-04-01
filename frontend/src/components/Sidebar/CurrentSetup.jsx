import { calculateFormation } from "../../utils/formation";

export function CurrentSetup({ mode, roleCounts }) {
  const currentFormation = calculateFormation(roleCounts);

  return (
    <div className="rounded-2xl bg-gray-50 p-4">
      <p className="text-xs uppercase tracking-[0.15em] text-gray-600">
        Current setup
      </p>
      <div className="mt-2 space-y-1 text-sm text-gray-700">
        <p>
          Mode: <span className="font-semibold">{mode}</span>
        </p>
        <p>
          Formation: <span className="font-semibold">{currentFormation}</span>
        </p>
      </div>
    </div>
  );
}
