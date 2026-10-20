import { useEffect, useState } from 'react'
import { useLanguage } from '../../context/LanguageContext'

const RESEND_COOLDOWN_MS = 60 * 1000

/**
 * One-time code entry used by registration, password recovery, and both
 * sign-in flows. The parent owns the request state; this component only
 * collects the code and drives the resend countdown.
 */
export default function OtpForm({
  title,
  description,
  error,
  loading,
  onSubmit,
  onResend,
  submitLabel = 'Verify',
  resendLabel = 'Resend code',
}) {
  const { t } = useLanguage()
  const [code, setCode] = useState('')
  const [resendBlockedUntil, setResendBlockedUntil] = useState(0)
  const [now, setNow] = useState(Date.now())

  useEffect(() => {
    if (resendBlockedUntil <= now) return undefined
    const timer = setInterval(() => setNow(Date.now()), 1000)
    return () => clearInterval(timer)
  }, [resendBlockedUntil, now])

  const resendBlocked = resendBlockedUntil > now
  const secondsLeft = Math.max(0, Math.ceil((resendBlockedUntil - now) / 1000))

  const handleSubmit = (event) => {
    event.preventDefault()
    if (loading) return
    setCode('')
    onSubmit(code.trim())
  }

  const handleResend = () => {
    if (loading || resendBlocked) return
    setResendBlockedUntil(Date.now() + RESEND_COOLDOWN_MS)
    onResend?.()
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm" role="alert">
          {error}
        </div>
      )}

      <div>
        <h2 className="text-lg font-semibold text-navy">{title}</h2>
        <p className="mt-1 text-sm text-muted">{description}</p>
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium text-ink" htmlFor="otp">
          Verification code
        </label>
        <input
          id="otp"
          type="text"
          inputMode="numeric"
          autoComplete="one-time-code"
          maxLength={8}
          required
          value={code}
          onChange={(event) => {
            setCode(event.target.value.replace(/\D/g, '').slice(0, 8))
          }}
          className="w-full px-4 py-3 rounded-lg border border-gray-300 font-mono tracking-widest focus:outline-none focus:ring-2 focus:ring-gold/50 focus:border-gold"
          disabled={loading}
        />
        <p className="mt-1 text-xs text-gray-500">The code expires after 5 minutes and is valid once.</p>
      </div>

      <button type="submit" disabled={loading} className="btn-primary w-full disabled:opacity-50">
        {loading ? t.common.loading : submitLabel}
      </button>

      {onResend && (
        <button
          type="button"
          onClick={handleResend}
          disabled={loading || resendBlocked}
          className="btn-outline w-full disabled:opacity-50"
        >
          {resendBlocked ? `Resend available in ${secondsLeft}s` : resendLabel}
        </button>
      )}
    </form>
  )
}
