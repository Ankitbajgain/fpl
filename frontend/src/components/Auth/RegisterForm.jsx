import { useState } from 'react'
import { createNameFromEmail, createPhoneFromEmail } from '../../utils/formatting'
import { registerDefaults } from '../../constants/gameConfig'

export function RegisterForm({ onSubmit, isLoading, error, notice }) {
  const [form, setForm] = useState(registerDefaults)

  const handleSubmit = (e) => {
    e.preventDefault()

    const email = form.email.trim().toLowerCase()
    const { password, confirmPassword } = form

    if (!email || !password) {
      return
    }

    if (password !== confirmPassword) {
      return
    }

    const name = createNameFromEmail(email)
    const phone = createPhoneFromEmail(email)

    onSubmit(email, password, name, phone)
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
      <input
        type="password"
        value={form.confirmPassword}
        onChange={(e) => setForm((prev) => ({ ...prev, confirmPassword: e.target.value }))}
        className="w-full rounded-lg border border-[#ddd2c3] bg-white px-3 py-2.5 text-sm"
        placeholder="Confirm password"
        required
      />

      {notice ? <p className="text-xs text-emerald-700">{notice}</p> : null}
      {error ? <p className="text-xs text-red-600">{error}</p> : null}

      <button
        type="submit"
        disabled={isLoading}
        className="w-full rounded-lg bg-[#ec8456] px-3 py-2.5 text-sm font-semibold text-white disabled:opacity-70"
      >
        {isLoading ? 'Creating account...' : 'Create account'}
      </button>
    </form>
  )
}
