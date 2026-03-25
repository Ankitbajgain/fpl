import { useState } from 'react'

export default function LoginPanel({ onLogin, loading, error }) {
  const [email, setEmail] = useState('admin@newfpl.local')
  const [password, setPassword] = useState('AdminPass123')

  return (
    <div className="panel login-panel">
      <h1>Admin Dashboard</h1>
      <p>Manage leagues, fixtures, transfer windows, and sync workflows.</p>

      <label>Email</label>
      <input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="admin@newfpl.local" />

      <label>Password</label>
      <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Password" />

      <button onClick={() => onLogin(email, password)} disabled={loading}>
        {loading ? 'Signing in...' : 'Sign In as Admin'}
      </button>

      {error ? <p className="error-text">{error}</p> : null}
    </div>
  )
}
