import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { authService } from '../../services/authService'
import { useLanguage } from '../../context/LanguageContext'

export default function TotpEnrollForm() {
  const { t } = useLanguage()
  const navigate = useNavigate()
  const [stage, setStage] = useState('start') // 'start' | 'confirm' | 'done'
  const [secret, setSecret] = useState('')
  const [otpauthUrl, setOtpauthUrl] = useState('')
  const [token, setToken] = useState('')
  const [recoveryCodes, setRecoveryCodes] = useState([])
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (stage === 'done' && recoveryCodes.length > 0) {
      // One-time display: navigate away after a short delay so codes
      // aren't left on screen indefinitely.
    }
  }, [stage, recoveryCodes])

  const handleEnrollStart = async (event) => {
    event.preventDefault()
    setError('')
    setLoading(true)

    try {
      const res = await authService.mfaEnrollStart()
      setSecret(res.secret || '')
      setOtpauthUrl(res.otpauthUrl || '')
      setStage('confirm')
    } catch (err) {
      setError(err.message || 'Enrollment failed')
    } finally {
      setLoading(false)
    }
  }

  const handleEnrollConfirm = async (event) => {
    event.preventDefault()
    setError('')
    setLoading(true)

    try {
      const res = await authService.mfaEnrollConfirm({ token })
      setRecoveryCodes(res.recoveryCodes || [])
      setStage('done')
    } catch (err) {
      setError(err.message || 'Confirmation failed')
    } finally {
      setLoading(false)
    }
  }

  const handleCopyCode = (code) => {
    navigator.clipboard.writeText(code)
  }

  const otpauthUrlSvg = otpauthUrl
    ? `data:image/svg+xml;base64,${btoa(otpauthUrl)}`
    : ''

  return (
    <div className="space-y-6">
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm" role="alert">
          {error}
        </div>
      )}

      {stage === 'start' && (
        <div className="space-y-4">
          <h2 className="text-lg font-semibold text-navy">Set up authenticator app</h2>
          <p className="text-sm text-muted">
            Scan the QR code with Google Authenticator, Microsoft Authenticator, or Authy.
            Then enter the 6-digit code to confirm.
          </p>
          <button
            type="button"
            onClick={handleEnrollStart}
            disabled={loading}
            className="btn-primary w-full disabled:opacity-50"
          >
            {loading ? t.common.loading : 'Set up authenticator app'}
          </button>
        </div>
      )}

      {stage === 'confirm' && (
        <div className="space-y-6">
          <div>
            <h2 className="text-lg font-semibold text-navy">Verify setup</h2>
            <p className="text-sm text-muted">
              Enter the 6-digit code from your authenticator app to finish enrollment.
            </p>
          </div>

          <div className="bg-gray-50 rounded-lg p-4">
            {secret && (
              <div>
                <label className="mb-1 block text-xs font-medium text-gray-500 uppercase">
                  Setup key
                </label>
                <p className="font-mono text-sm break-all text-ink">{secret}</p>
              </div>
            )}
            {otpauthUrl && (
              <div className="mt-4">
                <img
                  alt="TOTP QR code"
                  src={otpauthUrlSvg}
                  className="mx-auto"
                  // Use a QR code API if available; fallback to text
                  style={{ display: 'none' }}
                />
                <p className="text-xs text-gray-500 text-center mt-2">
                  If your app supports QR scanning, use the setup key above.
                </p>
              </div>
            )}
          </div>

          <form onSubmit={handleEnrollConfirm} className="space-y-4">
            <div>
              <label className="mb-1 block text-sm font-medium text-ink" htmlFor="enroll-token">
                6-digit code
              </label>
              <input
                id="enroll-token"
                type="text"
                inputMode="numeric"
                autoComplete="one-time-code"
                maxLength={6}
                required
                value={token}
                onChange={(e) =>
                  setToken(e.target.value.replace(/\D/g, '').slice(0, 6))
                }
                className="w-full px-4 py-3 rounded-lg border border-gray-300 font-mono tracking-widest focus:outline-none focus:ring-2 focus:ring-gold/50 focus:border-gold"
                disabled={loading}
              />
            </div>

            <button type="submit" disabled={loading} className="btn-primary w-full disabled:opacity-50">
              {loading ? t.common.loading : 'Confirm & enable'}
            </button>
          </form>

          <button
            type="button"
            onClick={() => setStage('start')}
            className="btn-outline w-full"
          >
            Start over
          </button>
        </div>
      )}

      {stage === 'done' && (
        <div className="space-y-6">
          <div>
            <h2 className="text-lg font-semibold text-navy">Save your recovery codes</h2>
            <p className="text-sm text-muted">
              These codes let you sign in if you lose access to your authenticator app.
              Each code works only once. Download or copy them now — they won&apos;t be shown again.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3">
            {recoveryCodes.map((code, i) => (
              <div key={i} className="border border-gray-200 rounded-lg p-3">
                <p className="text-xs font-mono text-gold-dark break-all">{code}</p>
              </div>
            ))}
          </div>

          <div className="flex gap-3">
            <button
              type="button"
              onClick={() => {
                if (navigator.clipboard) {
                  navigator.clipboard.writeText(recoveryCodes.join('\n'))
                }
              }}
              className="btn-outline flex-1"
            >
              Copy all codes
            </button>
            <Link
              to="/dashboard"
              className="btn-primary flex-1 text-center"
            >
              Done
            </Link>
          </div>
        </div>
      )}
    </div>
  )
}
