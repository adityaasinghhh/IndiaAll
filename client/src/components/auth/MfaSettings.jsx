import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { authService } from '../../services/authService'
import { useLanguage } from '../../context/LanguageContext'

export default function MfaSettings() {
  const { t } = useLanguage()
  const navigate = useNavigate()
  const [status, setStatus] = useState(null)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const fetchStatus = async () => {
    setLoading(true)
    try {
      const res = await authService.mfaStatus()
      setStatus(res)
    } catch (err) {
      setError(err.message || 'Failed to load MFA status')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchStatus()
  }, [])

  const handleDisable = async (event) => {
    event.preventDefault()
    setError('')
    setLoading(true)

    const currentPassword = prompt('Enter your current password to disable MFA:')
    if (!currentPassword) {
      setLoading(false)
      return
    }

    const token = prompt('Enter your authenticator app code or recovery code:')
    if (!token) {
      setLoading(false)
      return
    }

    try {
      await authService.mfaDisable({ currentPassword, token })
      setStatus({ twoFactorEnabled: false, recoveryCodesRemaining: 0 })
    } catch (err) {
      setError(err.message || 'Failed to disable MFA')
    } finally {
      setLoading(false)
    }
  }

  const handleRegenerate = async (event) => {
    event.preventDefault()
    setError('')
    setLoading(true)

    const currentPassword = prompt('Enter your current password:')
    if (!currentPassword) {
      setLoading(false)
      return
    }

    const token = status.twoFactorEnabled
      ? prompt('Enter your authenticator app code or recovery code:')
      : ''
    if (status.twoFactorEnabled && !token) {
      setLoading(false)
      return
    }

    try {
      const res = await authService.mfaRegenerateRecoveryCodes({
        currentPassword,
        token,
      })
      setStatus((prev) => ({
        ...prev,
        recoveryCodesRemaining: res.recoveryCodes?.length || 0,
      }))
      if (res.recoveryCodes) {
        alert(
          'New recovery codes generated:\n' +
          res.recoveryCodes.join('\n') +
          '\n\nSave them now — they won&apos;t be shown again.'
        )
      }
    } catch (err) {
      setError(err.message || 'Failed to regenerate codes')
    } finally {
      setLoading(false)
    }
  }

  if (!status) {
    return null
  }

  return (
    <div className="space-y-6">
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm" role="alert">
          {error}
        </div>
      )}

      <div>
        <h2 className="text-lg font-semibold text-navy">Multi-factor authentication</h2>
        <p className="text-sm text-muted">
          Add a second factor to protect your account beyond your password.
        </p>
      </div>

      <div className="bg-gray-50 rounded-lg p-4 border border-gray-100">
        <div className="flex items-center justify-between mb-3">
          <span className="text-sm font-medium text-ink">Authenticator app (TOTP)</span>
          <span className={`text-xs font-semibold px-2 py-1 rounded-full ${
            status.twoFactorEnabled ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'
          }`}>
            {status.twoFactorEnabled ? 'Enabled' : 'Not enabled'}
          </span>
        </div>
        <p className="text-sm text-gray-600">
          {status.twoFactorEnabled
            ? 'You will be asked for a 6-digit code from your authenticator app when you sign in.'
            : 'Set up an authenticator app to require a second factor at sign in.'}
        </p>
        <p className="text-sm text-gray-600 mt-2">
          Recovery codes remaining:{' '}
          <span className="font-medium">{status.recoveryCodesRemaining}</span>
        </p>
      </div>

      {!status.twoFactorEnabled ? (
        <button
          onClick={(e) => {
            e.preventDefault()
            navigate('/auth/mfa/enroll')
          }}
          className="btn-primary w-full"
        >
          Set up authenticator app
        </button>
      ) : (
        <div className="space-y-3">
          <button
            onClick={handleRegenerate}
            className="btn-outline w-full"
          >
            Regenerate recovery codes
          </button>
          <button
            onClick={handleDisable}
            className="btn-outline w-full text-red-600 border-red-200 hover:bg-red-50"
          >
            Disable MFA
          </button>
        </div>
      )}

      <div className="pt-4 border-t border-gray-100">
        <p className="text-xs text-gray-500">
          MFA uses time-based one-time passwords (TOTP, RFC 6238) compatible
          with Google Authenticator, Microsoft Authenticator, and Authy.
          Recovery codes are single-use and hashed at rest.
        </p>
      </div>
    </div>
  )
}
