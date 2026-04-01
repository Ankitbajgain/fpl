import { useState } from "react";

export default function LoginPanel({ onLogin, loading, error }) {
  const [email, setEmail] = useState("admin@newfpl.local");
  const [password, setPassword] = useState("AdminPass123");

  return (
    <div className="panel login-panel">
      <div className="login-card-head">
        <h1>Welcome</h1>
        <p>Sign in with your admin account to continue.</p>
      </div>

      <div className="login-card-body">
        <div className="panel-section">
          <div className="field">
            <label htmlFor="admin-email">Admin Email Address</label>
            <input
              id="admin-email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your admin email"
              autoComplete="email"
            />
          </div>

          <div className="field">
            <label htmlFor="admin-password">Password</label>
            <input
              id="admin-password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
              autoComplete="current-password"
            />
          </div>
        </div>

        <button onClick={() => onLogin(email, password)} disabled={loading}>
          {loading ? "Signing in..." : "Sign In"}
        </button>

        <p className="muted" style={{ marginTop: 10 }}>
          Need help? Use your approved admin account credentials.
        </p>
        {error ? <p className="error-text">{error}</p> : null}
      </div>
    </div>
  );
}
