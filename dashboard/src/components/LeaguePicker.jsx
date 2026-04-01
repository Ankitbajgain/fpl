export default function LeaguePicker({ leagues, selectedLeague, onSelect }) {
  return (
    <div className="panel">
      <h2>League</h2>
      <p className="panel-intro">
        Choose the league you want to manage right now.
      </p>
      <div className="field">
        <label>Select League / Tournament</label>
        <select
          value={selectedLeague || ""}
          onChange={(e) => onSelect(e.target.value)}
        >
          {!leagues.length ? (
            <option value="">No leagues available</option>
          ) : null}
          {leagues.map((league) => (
            <option key={league.id} value={league.id}>
              {league.name} ({league.competition}) - {league.status}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}
