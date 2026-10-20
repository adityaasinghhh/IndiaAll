import { Link } from 'react-router-dom'
import { useLanguage } from '../context/LanguageContext'

export default function ForgotPassword() {
  const { t } = useLanguage()

  return (
    <main className="min-h-[80vh] flex items-center justify-center bg-off-white px-4 py-16">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="flex justify-center bg-charcoal rounded-xl p-3 mb-4">
            <Link to="/">
              <img src="/images/india-all-logo.jpeg" alt="INDIA ALL" className="h-16 w-auto object-contain" />
            </Link>
          </div>
          <h1 className="font-serif text-3xl font-bold text-charcoal">Reset Password</h1>
          <p className="text-body-text mt-2 font-medium">Enter your email to receive a reset link</p>
        </div>
        <div className="bg-white rounded-2xl shadow-card p-8 border border-border-light">
          <form className="space-y-4">
            <div>
              <label htmlFor="reset-email" className="label-base">Email address</label>
              <input
                id="reset-email"
                type="email"
                autoComplete="email"
                required
                className="input-base"
                placeholder="you@company.com"
              />
            </div>
            <button type="submit" className="btn-primary w-full">
              Send reset link
            </button>
          </form>
          <p className="mt-4 text-center text-sm font-medium text-text-secondary">
            Remember your password?{' '}
            <Link to="/login" className="text-industrial-blue font-semibold hover:underline">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </main>
  )
}