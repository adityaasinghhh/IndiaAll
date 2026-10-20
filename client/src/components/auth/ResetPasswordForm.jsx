import { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { authService } from '../../services/authService'
import { useLanguage } from '../../context/LanguageContext'
import OtpForm from '../auth/OtpForm'

export default function ResetPasswordForm() {
  const { t } = useLanguage()
  const location = useLocation()
  const [stage, setStage] = useState(() => (location.state?.email ? 'reset' : 'request')) // 'request' | 'reset'
  const [email, setEmail] = useState(location.state?.email || '')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')

  const handleRequestCode = async (event) => {
    event.preventDefault()
    setError('')
    setMessage('')
    setLoading(true)

    try {
      const res = await authService.forgotPassword({ email })
      // Generic by design: the response never reveals whether the email
      // belongs to an existing account.
      setMessage(res.message)
      setStage('reset')
    } catch (err) {
      setError(err.message || 'Request failed')
    } finally {
      setLoading(false)
    }
  }

  const handleResend = async () => {
    if (loading) return
    setError('')
    setMessage('')
    setLoading(true)
    try {
      const res = await authService.forgotPassword({ email })
      setMessage(res.message)
    } catch (err) {
      setError(err.message || 'Resend failed')
    } finally {
      setLoading(false)
    }
  }

  const handleReset = async (code) => {
    setError('')
    setSuccess('')
    if (password !== confirmPassword) {
      setError('Passwords do not match')
      return
    }
    if (password.length < 8) {
      setError('Password must be at least 8 characters')
      return
    }

    setLoading(true)
    try {
      const res = await authService.resetPassword({ email, otp: code, newPassword: password })
      setSuccess(res.message || 'Password reset successful. Please log in.')
    } catch (err) {
      setError(err.message || 'Reset failed')
    } finally {
      setLoading(false)
    }
  }

  const resetStage = (
    <div className="space-y-6">
      <div>
        <p className="text-sm text-muted">
          We sent a verification code to {email}. Enter it below together with your new password.
        </p>
      </div>

      {message && (
        <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg text-sm">
          {message}
        </div>
      )}

      <OtpForm
        title="Reset your password"
        description="Enter the code we emailed you, then choose a new password."
        error={error}
        loading={loading}
        submitLabel="Reset password"
        onSubmit={handleReset}
        onResend={handleResend}
      />

      <div>
        <label className="mb-1 block text-sm font-medium text-ink" htmlFor="reset-new-password">
          New password
        </label>
        <input
          id="reset-new-password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          minLength={8}
          className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-gold/50 focus:border-gold"
        />
        <p className="mt-1 text-xs text-gray-500">Minimum 8 characters</p>
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium text-ink" htmlFor="reset-confirm-password">
          Confirm new password
        </label>
        <input
          id="reset-confirm-password"
          type="password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          required
          className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-gold/50 focus:border-gold"
        />
      </div>

      <button
        type="button"
        className="btn-outline w-full"
        onClick={() => {
          setError('')
          setMessage('')
          setStage('request')
        }}
      >
        Use a different email
      </button>
    </div>
  )

  if (success) {
    return (
      <div className="space-y-6">
        <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg text-sm" role="status">
          {success}
        </div>
        <Link to="/login" className="btn-primary w-full text-center">
          Back to login
        </Link>
      </div>
    )
  }

  if (stage === 'request') {
    return (
      <form onSubmit={handleRequestCode} className="space-y-6">
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

  return resetStage
}
