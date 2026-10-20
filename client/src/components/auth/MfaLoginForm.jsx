import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { useLanguage } from '../../context/LanguageContext'

export default function MfaLoginForm({ email }) {
  const { verifyMfa, mfaPending, mfaUserId, mfaChallengeId } = useAuth()
  const { t } = useLanguage()
  const navigate = useNavigate()

  const [method, setMethod] = useState('totp') // 'totp' | 'recovery'
  const [token, setToken] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (event) => {
    event.preventDefault()
    setError('')
    setLoading(true)

    try {
      await verifyMfa(token)
      navigate('/dashboard')
    } catch (err) {
      setError(err.message || 'Verification failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm" role="alert">
          {error}
        </div>
      )}

      <div>
        <h2 className="text-lg font-semibold text-navy">Verify your identity</h2>
        <p className="mt-1 text-sm text-muted">
          Enter your {method === 'totp' ? 'authenticator app code' : 'recovery code'} to finish signing in.
        </p>
      </div>

      <div className="flex gap-2">
        <button
          type="button"
          onClick={() => setMethod('totp')}
          className={`flex-1 py-2 rounded-lg border text-sm font-medium transition-colors ${
            method === 'totp'
              ? 'bg-gold/10 border-gold text-gold-dark'
              : 'border-gray-300 text-gray-600 hover:bg-gray-50'
          }`}
        >
          Authenticator app
        </button>
        <button
          type="button"
          onClick={() => setMethod('recovery')}
          className={`flex-1 py-2 rounded-lg border text-sm font-medium transition-colors ${
            method === 'recovery'
              ? 'bg-gold/10 border-gold text-gold-dark'
              : 'border-gray-300 text-gray-600 hover:bg-gray-50'
          }`}
        >
          Recovery code
        </button>
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium text-ink" htmlFor="mfa-token">
          {method === 'totp' ? '6-digit code' : 'Recovery code'}
        </label>
        <input
          id="mfa-token"
          type="text"
          inputMode="numeric"
          autoComplete="one-time-code"
          maxLength={method === 'totp' ? 6 : 12}
          required
          value={token}
          onChange={(e) => {
            const value = e.target.value.replace(/[^A-Z0-9]/gi, '').toUpperCase()
            setToken(value.slice(0, method === 'totp' ? 6 : 12))
          }}
          className="w-full px-4 py-3 rounded-lg border border-gray-300 font-mono tracking-widest focus:outline-none focus:ring-2 focus:ring-gold/50 focus:border-gold"
          disabled={loading}
        />
        <p className="mt-1 text-xs text-gray-500">
          {method === 'totp'
            ? 'Code from your authenticator app (Google Authenticator, Authy, etc.)'
            : 'A one-time recovery code (shown only when generated)'}
        </p>
      </div>

      <button type="submit" disabled={loading || mfaPending} className="btn-primary w-full disabled:opacity-50">
        {loading ? t.common.loading : 'Verify'}
      </button>

      <p className="text-center text-sm text-gray-600">
        <Link to="/login" className="text-gold-dark hover:underline font-medium">
          Back to password entry
        </Link>
      </p>
    </form>
  )
}
