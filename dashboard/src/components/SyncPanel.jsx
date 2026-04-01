import { useState } from "react";

export default function SyncPanel({ onSync, busy }) {
  const [source, setSource] = useState("demo");
  const [apiUrl, setApiUrl] = useState("");
  const [payloadText, setPayloadText] = useState("[]");

  const handleSync = () => {
    let fixtures = [];
    if (source === "payload") {
      try {
        fixtures = JSON.parse(payloadText);
      } catch {
        alert("Invalid JSON payload");
        return;
      }
    }

    onSync({
      source,
      apiUrl,
      fixtures,
    });
  };

  return (
    <div className="panel">
      <h2>Fixture Sync</h2>
      <p className="panel-intro">
        Import or refresh fixtures from demo data, JSON payload, or an external
        API URL.
      </p>

      <div className="grid two">
        <div className="field">
          <label>Sync Source</label>
          <select value={source} onChange={(e) => setSource(e.target.value)}>
            <option value="demo">Demo</option>
            <option value="payload">Payload</option>
            <option value="external">External API</option>
          </select>
        </div>

        {source === "external" ? (
          <div className="field">
            <label>API URL</label>
            <input
              value={apiUrl}
              onChange={(e) => setApiUrl(e.target.value)}
              placeholder="https://example.com/fixtures"
            />
          </div>
        ) : null}
      </div>

      {source === "payload" ? (
        <div className="field">
          <label>Fixtures JSON Payload</label>
          <textarea
            rows={8}
            value={payloadText}
            onChange={(e) => setPayloadText(e.target.value)}
            placeholder='[{"homeFranchiseId":1,"awayFranchiseId":2,"startsAt":"2026-04-01T14:00:00.000Z"}]'
          />
        </div>
      ) : null}

      <button onClick={handleSync} disabled={busy}>
        {busy ? "Syncing..." : "Run Sync"}
      </button>
    </div>
  );
}
