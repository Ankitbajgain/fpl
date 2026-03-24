import { calculateFormation } from '../../utils/formation'

export function FormationDisplay({ roleCounts }) {
  const currentFormation = calculateFormation(roleCounts)

  return (
    <div>
      <h2 className="font-heading text-xl">Formation</h2>
      <div className="mt-3 rounded-xl border border-[#eadfce] bg-[#fffaf3] p-3 text-sm text-[#354252]">
        <p className="font-semibold text-[#0e6f59]">Formed: {currentFormation}</p>
        <p className="mt-2">WK: {roleCounts.WK} (1-4)</p>
        <p>BAT: {roleCounts.BAT} (3-6)</p>
        <p>AR: {roleCounts.AR} (1-4)</p>
        <p>BOWL: {roleCounts.BOWL} (3-6)</p>
      </div>
    </div>
  )
}
