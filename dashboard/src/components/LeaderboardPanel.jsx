export default function LeaderboardPanel({ rows, loading, error }) {
  return (
    <div className="panel">
      <h2>Player Leaderboard</h2>
      <p className="muted">Updates after each completed match finalization</p>

      {loading ? <p className="muted">Loading leaderboard...</p> : null}
      {error ? <p className="error-text">{error}</p> : null}

      {!loading && !error && (!rows || rows.length === 0) ? (
        <p className="muted">No finalized leaderboard data yet.</p>
      ) : null}

      {rows && rows.length > 0 ? (
        <div className="fixture-list" style={{ marginTop: 8 }}>
          {rows.slice(0, 20).map((row) => (
            <div key={row.playerId} className="fixture-card" style={{ padding: 10 }}>
              <div className="fixture-head" style={{ marginBottom: 4 }}>
                <strong>#{row.rank} {row.name}</strong>
                <span>{Number(row.totalPoints || 0).toFixed(2)} pts</span>
              </div>
              <p className="muted" style={{ margin: 0 }}>
                {row.team} | {row.role} | Matches: {row.matches} | Avg: {Number(row.avgPoints || 0).toFixed(2)}
              </p>
            </div>
          ))}
        </div>
      ) : null}
    </div>
  )
}
