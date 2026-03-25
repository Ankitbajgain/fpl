import { useState } from 'react'

export default function SyncPanel({ onSync, busy }) {
  const [source, setSource] = useState('demo')
  const [apiUrl, setApiUrl] = useState('')
  const [payloadText, setPayloadText] = useState('[]')

  const handleSync = () => {
    let fixtures = []
    if (source === 'payload') {
      try {
        fixtures = JSON.parse(payloadText)
      } catch {
        alert('Invalid JSON payload')
        return
      }
    }

    onSync({
      source,
      apiUrl,
      fixtures,
    })
  }

  return (
    <div className="panel">
      <h2>Fixture Sync</h2>
      <p className="muted">Use demo generator, payload import, or external API URL.</p>

      <div className="grid two">
        <label>Source</label>
        <select value={source} onChange={(e) => setSource(e.target.value)}>
          <option value="demo">demo</option>
          <option value="payload">payload</option>
          <option value="external">external</option>
        </select>

        {source === 'external' ? (
          <>
            <label>API URL</label>
            <input value={apiUrl} onChange={(e) => setApiUrl(e.target.value)} placeholder="https://example.com/fixtures" />
          </>
        ) : null}
      </div>

      {source === 'payload' ? (
        <textarea
          rows={8}
          value={payloadText}
          onChange={(e) => setPayloadText(e.target.value)}
          placeholder='[{"homeFranchiseId":1,"awayFranchiseId":2,"startsAt":"2026-04-01T14:00:00.000Z"}]'
        />
      ) : null}

      <button onClick={handleSync} disabled={busy}>{busy ? 'Syncing...' : 'Run Sync'}</button>
    </div>
  )
}
