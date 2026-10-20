import { Link, useNavigate } from 'react-router-dom'
import LoginForm from '../components/auth/LoginForm'
import MfaLoginForm from '../components/auth/MfaLoginForm'
import { useAuth } from '../context/AuthContext'

export default function Login() {
  const { login, verifyMfa, mfaPending, mfaUserId, mfaChallengeId, logout } = useAuth()
  const navigate = useNavigate()

  // If MFA challenge state exists in context, show MFA form instead of password form.
  if (mfaPending && mfaUserId && mfaChallengeId) {
    return (
      <main className="min-h-[80vh] flex items-center justify-center bg-off-white px-4 py-16">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <div className="flex justify-center bg-charcoal rounded-xl p-3 mb-4">
              <Link to="/">
                <img src="/images/india-all-logo.png" alt="INDIA ALL" className="h-20 w-auto object-contain" />
              </Link>
            </div>
            <h1 className="font-serif text-3xl font-bold text-charcoal">Verify your identity</h1>
            <p className="text-body-text mt-2 font-medium">Enter your second factor to complete sign in</p>
          </div>
          <div className="bg-white rounded-2xl shadow-card p-8 border border-border-light">
            <MfaLoginForm />
          </div>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-[80vh] flex items-center justify-center bg-off-white px-4 py-16">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="flex justify-center bg-charcoal rounded-xl p-3 mb-4">
            <Link to="/">
              <img src="/images/india-all-logo.png" alt="INDIA ALL" className="h-20 w-auto object-contain" />
            </Link>
          </div>
          <h1 className="font-serif text-3xl font-bold text-charcoal">Welcome Back</h1>
          <p className="text-body-text mt-2 font-medium">Log in to your INDIA ALL account</p>
        </div>
        <div className="bg-white rounded-2xl shadow-card p-8 border border-border-light">
          <LoginForm />
        </div>
      </div>
    </main>
  )
}
