import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { authService } from '../../services/authService'
import { useLanguage } from '../../context/LanguageContext'

export default function ForgotPasswordForm() {
  const { t } = useLanguage()
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      // The endpoint responds with a generic confirmation (never revealing
      // whether the account exists) and emails a one-time reset code.
      await authService.forgotPassword({ email })
      // Move straight to the OTP + new-password step, preserving the email
      // for the reset request that follows.
      navigate('/reset-password', { state: { email } })
    } catch (err) {
      setError(err.message || 'Request failed')
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
        <p className="text-sm text-muted">
          Enter your email and we will send you a one-time code to set a new password.
        </p>
      </div>

      <div>
        <label className="block text-sm font-medium text-ink mb-1">Email</label>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-gold/50 focus:border-gold"
        />
      </div>

      <button type="submit" disabled={loading} className="btn-primary w-full disabled:opacity-50">
        {loading ? t.common.loading : 'Send verification code'}
      </button>

      <p className="text-center text-sm text-gray-600">
        Remember your password?{' '}
        <Link to="/login" className="text-gold-dark hover:underline font-medium">
          Login
        </Link>
      </p>
    </form>
  )
}
