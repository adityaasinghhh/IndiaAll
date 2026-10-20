import { Link } from 'react-router-dom'
import { useLanguage } from '../context/LanguageContext'

export default function ResetPassword() {
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
          <h1 className="font-serif text-3xl font-bold text-charcoal">Set New Password</h1>
          <p className="text-body-text mt-2 font-medium">Choose a strong password for your account</p>
        </div>
        <div className="bg-white rounded-2xl shadow-card p-8 border border-border-light">
          <form className="space-y-4">
            <div>
              <label htmlFor="new-password" className="label-base">New password</label>
              <input
                id="new-password"
                type="password"
                autoComplete="new-password"
                required
                className="input-base"
                placeholder="Enter new password"
              />
            </div>
            <div>
              <label htmlFor="confirm-password" className="label-base">Confirm password</label>
              <input
                id="confirm-password"
                type="password"
                autoComplete="new-password"
                required
                className="input-base"
                placeholder="Confirm new password"
              />
            </div>
            <button type="submit" className="btn-primary w-full">
              Reset password
            </button>
          </form>
        </div>
      </div>
    </main>
  )
}