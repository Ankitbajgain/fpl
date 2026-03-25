export default function LeaguePicker({ leagues, selectedLeague, onSelect }) {
  return (
    <div className="panel">
      <h2>League</h2>
      <select value={selectedLeague || ''} onChange={(e) => onSelect(e.target.value)}>
        {leagues.map((league) => (
          <option key={league.id} value={league.id}>
            {league.name} ({league.competition}) - {league.status}
          </option>
        ))}
      </select>
    </div>
  )
}
