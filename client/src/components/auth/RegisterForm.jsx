import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { useLanguage } from '../../context/LanguageContext'
import { authService } from '../../services/authService'
import OtpForm from '../auth/OtpForm'
import CountryPhoneInput from './CountryPhoneInput'

export default function RegisterForm() {
  const { register } = useAuth()
  const { t } = useLanguage()

  const [form, setForm] = useState({
    name: '',
    company: '',
    country: '',
    phone: '',
    email: '',
    password: '',
    confirmPassword: '',
  })
  const [stage, setStage] = useState('form') // 'form' | 'otp'
  const [issuedUserId, setIssuedUserId] = useState('')
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')
  const [loading, setLoading] = useState(false)

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }))
  }

  const handleRegister = async (event) => {
    event.preventDefault()
    setError('')
    setNotice('')

    if (form.password !== form.confirmPassword) {
      setError('Passwords do not match')
      return
    }

    if (form.password.length < 8) {
      setError('Password must be at least 8 characters')
      return
    }

    setLoading(true)
    try {
      const res = await register({
        name: form.name,
        company: form.company,
        country: form.country,
        phone: form.phone,
        email: form.email,
        password: form.password,
      })
      // The account is created but NOT authenticated: the customer must
      // verify the emailed code before logging in.
      setIssuedUserId(res.customer?.id || '')
      setStage('otp')
    } catch (err) {
      setError(err.message || 'Registration failed')
    } finally {
      setLoading(false)
    }
  }

  const handleVerify = async (otp) => {
    setError('')
    setLoading(true)
    try {
      const res = await authService.verifyEmail({ userId: issuedUserId, otp })
      setNotice(res.message || 'Email verified successfully.')
    } catch (err) {
      setError(err.message || 'Verification failed')
    } finally {
      setLoading(false)
    }
  }

  if (stage === 'otp') {
    return (
      <div className="space-y-6">
        <div>
          <h2 className="text-lg font-semibold text-navy">Verify your email</h2>
          <p className="mt-1 text-sm text-muted">
            We sent a verification code to {form.email}. Enter it below to activate your account.
          </p>
        </div>
        <OtpForm
          title="Email verification"
          description="Enter the 8-digit code we emailed you."
          error={error}
          loading={loading}
          submitLabel="Verify email"
          onSubmit={handleVerify}
        />
        <button
          type="button"
          className="btn-outline w-full"
          disabled={loading}
          onClick={() => {
            setError('')
            setStage('form')
          }}
        >
          Back to the registration form
        </button>
      </div>
    )
  }

  const inputClass =
    'w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-gold/50 focus:border-gold'

  return (
    <form onSubmit={handleRegister} className="space-y-5">
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
          {error}
        </div>
      )}

      <div>
        <label className="block text-sm font-medium text-ink mb-1">Full Name *</label>
        <input
          type="text"
          name="name"
          value={form.name}
          onChange={handleChange}
          required
          className={inputClass}
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-ink mb-1">Company Name *</label>
        <input
          type="text"
          name="company"
          value={form.company}
          onChange={handleChange}
          required
          className={inputClass}
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-ink mb-1">Country *</label>
        <input
          type="text"
          name="country"
          value={form.country}
          onChange={handleChange}
          required
          className={inputClass}
        />
      </div>

      <div>
        <CountryPhoneInput
          value={form.phone}
          onChange={(val) => setForm((prev) => ({ ...prev, phone: val }))}
          required
          label="Phone *"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-ink mb-1">Email *</label>
        <input
          type="email"
          name="email"
          value={form.email}
          onChange={handleChange}
          required
          className={inputClass}
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-ink mb-1">Password *</label>
        <input
          type="password"
          name="password"
          value={form.password}
          onChange={handleChange}
          required
          minLength={8}
          className={inputClass}
        />
        <p className="text-xs text-gray-500 mt-1">Minimum 8 characters</p>
      </div>

      <div>
        <label className="block text-sm font-medium text-ink mb-1">Confirm Password *</label>
        <input
          type="password"
          name="confirmPassword"
          value={form.confirmPassword}
          onChange={handleChange}
          required
          className={inputClass}
        />
      </div>

      <button type="submit" disabled={loading} className="btn-primary w-full disabled:opacity-50">
        {loading ? t.common.loading : 'Register'}
      </button>

      <p className="text-center text-sm text-gray-600">
        Already have an account?{' '}
        <Link to="/login" className="text-gold-dark hover:underline font-medium">
          Login
        </Link>
      </p>
    </form>
  )
}
