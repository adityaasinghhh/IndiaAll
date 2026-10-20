import { createContext, useContext, useState, useEffect, useCallback } from 'react'
import { authService } from '../services/authService.js'

const AuthContext = createContext()

export function AuthProvider({ children }) {
  const [customer, setCustomer] = useState(null)
  const [loading, setLoading] = useState(true)
  // MFA challenge state: set when login requires a second factor.
  const [mfaPending, setMfaPending] = useState(false)
  const [mfaUserId, setMfaUserId] = useState(null)
  const [mfaChallengeId, setMfaChallengeId] = useState(null)

  const fetchMe = useCallback(async () => {
    try {
      const res = await authService.getMe()
      setCustomer(res.customer)
    } catch {
      setCustomer(null)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchMe()
  }, [fetchMe])

  const login = async (email, password) => {
    const res = await authService.login({ email, password })
    if (res.requiresMfa) {
      // Password was correct but MFA is required — surface challenge state.
      setMfaPending(true)
      setMfaUserId(res.userId)
      setMfaChallengeId(res.challengeId)
      return res
    }
    setCustomer(res.customer)
    setMfaPending(false)
    setMfaUserId(null)
    setMfaChallengeId(null)
    return res
  }

  const verifyMfa = async (token) => {
    const res = await authService.verifyMfaLogin({
      userId: mfaUserId,
      challengeId: mfaChallengeId,
      token,
    })
    setCustomer(res.customer)
    setMfaPending(false)
    setMfaUserId(null)
    setMfaChallengeId(null)
    return res
  }

  const register = async (data) => {
    // Registration only creates the account: the customer receives a
    // verification code and is not authenticated until it is verified.
    const res = await authService.register(data)
    return res
  }

  const logout = async () => {
    try {
      await authService.logout()
    } finally {
      setCustomer(null)
      setMfaPending(false)
      setMfaUserId(null)
      setMfaChallengeId(null)
    }
  }

  const updateProfile = async (data) => {
    const res = await authService.updateProfile(data)
    setCustomer(res.customer)
    return res
  }

  const changePassword = async (data) => {
    await authService.changePassword(data)
    setCustomer(null)
  }

  const deleteAccount = async (password) => {
    await authService.deleteAccount({ password })
    setCustomer(null)
  }

  return (
    <AuthContext.Provider
      value={{
        customer,
        loading,
        login,
        verifyMfa,
        mfaPending,
        mfaUserId,
        mfaChallengeId,
        register,
        logout,
        updateProfile,
        changePassword,
        deleteAccount,
        fetchMe,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) throw new Error('useAuth must be used within AuthProvider')
  return context
}
