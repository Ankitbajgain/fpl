import { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { setAuthSession, clearAuthSession } from '../features/squad/squadSlice'

export const useAuth = () => {
  const dispatch = useDispatch()
  const { authToken, currentUser } = useSelector((state) => state.squad)
  const [authLoading, setAuthLoading] = useState(false)
  const [authError, setAuthError] = useState('')

  const handleLogin = async (email, password) => {
    setAuthLoading(true)
    setAuthError('')

    try {
      const response = await fetch('/api/v1/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim(), password }),
      })

      const payload = await response.json()
      if (!response.ok || !payload.success) {
        setAuthError(payload.message || 'Login failed')
        setAuthLoading(false)
        return false
      }

      startSession(payload.data.accessToken, payload.data.user)
      setAuthLoading(false)
      return true
    } catch {
      setAuthError('Network error while logging in')
      setAuthLoading(false)
      return false
    }
  }

  const handleRegister = async (email, password, name, phone) => {
    setAuthLoading(true)
    setAuthError('')

    try {
      const registerResponse = await fetch('/api/v1/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password, phone }),
      })

      const registerPayload = await registerResponse.json()
      if (!registerResponse.ok || !registerPayload.success) {
        setAuthError(registerPayload.message || 'Registration failed')
        setAuthLoading(false)
        return { success: false, needsLogin: false }
      }

      if (registerPayload.data?.accessToken && registerPayload.data?.user) {
        startSession(registerPayload.data.accessToken, registerPayload.data.user)
        setAuthLoading(false)
        return { success: true }
      }

      // Auto-login after successful registration
      const loginSuccess = await handleLogin(email, password)
      if (loginSuccess) {
        return { success: true }
      }

      setAuthLoading(false)
      return { success: false, needsLogin: true }
    } catch {
      setAuthError('Network error while creating account')
      setAuthLoading(false)
      return { success: false, needsLogin: false }
    }
  }

  const startSession = (token, user) => {
    localStorage.setItem('newfpl_access_token', token)
    dispatch(setAuthSession({ token, user }))
  }

  const restoreSession = async () => {
    const token = localStorage.getItem('newfpl_access_token')
    if (!token) return

    try {
      const response = await fetch('/api/v1/auth/me', {
        headers: { Authorization: `Bearer ${token}` },
      })
      const payload = await response.json()
      if (!response.ok || !payload.success) {
        localStorage.removeItem('newfpl_access_token')
        return
      }
      dispatch(setAuthSession({ token, user: payload.data }))
    } catch {
      localStorage.removeItem('newfpl_access_token')
    }
  }

  const handleLogout = () => {
    localStorage.removeItem('newfpl_access_token')
    dispatch(clearAuthSession())
  }

  return {
    authToken,
    currentUser,
    authLoading,
    authError,
    setAuthError,
    handleLogin,
    handleRegister,
    restoreSession,
    handleLogout,
  }
}
