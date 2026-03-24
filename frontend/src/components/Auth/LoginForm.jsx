import { useState } from 'react'

export function LoginForm({ onSubmit, isLoading, error, notice }) {
  const [form, setForm] = useState({
    email: 'manager1@newfpl.local',
    password: 'ManagerPass123',
  })

  const handleSubmit = (e) => {
    e.preventDefault()
    onSubmit(form.email, form.password)
  }

  return (
    <form className="mt-5 space-y-3" onSubmit={handleSubmit}>
      <input
        type="email"
        value={form.email}
        onChange={(e) => setForm((prev) => ({ ...prev, email: e.target.value }))}
        className="w-full rounded-lg border border-[#ddd2c3] bg-white px-3 py-2.5 text-sm"
        placeholder="Email"
        required
      />
      <input
        type="password"
        value={form.password}
        onChange={(e) => setForm((prev) => ({ ...prev, password: e.target.value }))}
        className="w-full rounded-lg border border-[#ddd2c3] bg-white px-3 py-2.5 text-sm"
        placeholder="Password"
        required
      />

      {notice ? <p className="text-xs text-emerald-700">{notice}</p> : null}
      {error ? <p className="text-xs text-red-600">{error}</p> : null}

      <button
        type="submit"
        disabled={isLoading}
        className="w-full rounded-lg bg-[#0e6f59] px-3 py-2.5 text-sm font-semibold text-white disabled:opacity-70"
      >
        {isLoading ? 'Logging in...' : 'Login'}
      </button>
    </form>
  )
}
