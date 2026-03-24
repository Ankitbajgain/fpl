import { useState } from 'react'
import { LoginForm } from './LoginForm'
import { RegisterForm } from './RegisterForm'

export function AuthPanel({ onLogin, onRegister, isLoading, error, notice, setNotice, setError }) {
  const [authMode, setAuthMode] = useState('login')

  const handleModeChange = (mode) => {
    setAuthMode(mode)
    setError('')
    setNotice('')
  }

  const handleLoginSubmit = async (email, password) => {
    const success = await onLogin(email, password)
    if (success) {
      handleModeChange('login')
    }
  }

  const handleRegisterSubmit = async (email, password, name, phone) => {
    const result = await onRegister(email, password, name, phone)
    if (result.success) {
      handleModeChange('login')
      setNotice('Registration successful! You are now logged in.')
    } else if (result.needsLogin) {
      setAuthMode('login')
      setNotice('Account created. Please log in now.')
    }
  }

  return (
    <div className="w-full max-w-md overflow-hidden rounded-3xl border border-[#e4ddd2] bg-white shadow-card">
      <div className="bg-gradient-to-r from-[#103a2e] via-[#0f5e4d] to-[#ec8456] px-6 py-7 text-white">
        <p className="text-xs uppercase tracking-[0.18em] text-white/80">New FPL</p>
        <h1 className="mt-2 font-heading text-3xl">Welcome Back</h1>
        <p className="mt-1 text-sm text-white/90">Login if already registered, or create a new account.</p>
      </div>

      <div className="px-6 pb-6 pt-5">
        <div className="grid grid-cols-2 rounded-xl bg-[#f4ede3] p-1">
          <button
            onClick={() => handleModeChange('login')}
            className={`rounded-lg px-3 py-2 text-sm font-semibold transition ${
              authMode === 'login' ? 'bg-[#0e6f59] text-white' : 'text-[#4f5c68]'
            }`}
          >
            Login
          </button>
          <button
            onClick={() => handleModeChange('register')}
            className={`rounded-lg px-3 py-2 text-sm font-semibold transition ${
              authMode === 'register' ? 'bg-[#0e6f59] text-white' : 'text-[#4f5c68]'
            }`}
          >
            Register
          </button>
        </div>

        {authMode === 'login' ? (
          <LoginForm onSubmit={handleLoginSubmit} isLoading={isLoading} error={error} notice={notice} />
        ) : (
          <RegisterForm onSubmit={handleRegisterSubmit} isLoading={isLoading} error={error} notice={notice} />
        )}
      </div>
    </div>
  )
}
