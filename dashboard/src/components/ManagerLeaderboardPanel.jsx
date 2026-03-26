export default function ManagerLeaderboardPanel({ rows, loading, error }) {
  return (
    <div className="panel">
      <h2>Manager Leaderboard</h2>
      <p className="muted">Cumulative points across finalized matches</p>

      {loading ? <p className="muted">Loading manager leaderboard...</p> : null}
      {error ? <p className="error-text">{error}</p> : null}

      {!loading && !error && (!rows || rows.length === 0) ? (
        <p className="muted">No finalized manager leaderboard data yet.</p>
      ) : null}

      {rows && rows.length > 0 ? (
        <div className="fixture-list" style={{ marginTop: 8 }}>
          {rows.slice(0, 20).map((row) => (
            <div key={row.userId} className="fixture-card" style={{ padding: 10 }}>
              <div className="fixture-head" style={{ marginBottom: 4 }}>
                <strong>#{row.rank} {row.name}</strong>
                <span>{Number(row.totalPoints || 0).toFixed(2)} pts</span>
              </div>
              <p className="muted" style={{ margin: 0 }}>
                Matches: {row.matches} | Avg: {Number(row.avgPoints || 0).toFixed(2)} | Best: {Number(row.bestMatchPoints || 0).toFixed(2)}
              </p>
            </div>
          ))}
        </div>
      ) : null}
    </div>
  )
}
