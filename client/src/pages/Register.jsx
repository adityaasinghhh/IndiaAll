import { Link } from 'react-router-dom'
import RegisterForm from '../components/auth/RegisterForm'

export default function Register() {
  return (
    <main className="min-h-[80vh] flex items-center justify-center bg-off-white px-4 py-16">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="flex justify-center bg-charcoal rounded-xl p-3 mb-4">
            <Link to="/">
              <img src="/images/india-all-logo.png" alt="INDIA ALL" className="h-20 w-auto object-contain" />
            </Link>
          </div>
          <h1 className="font-serif text-3xl font-bold text-charcoal">Create Account</h1>
          <p className="text-body-text mt-2 font-medium">Join INDIA ALL to track your enquiries</p>
        </div>
        <div className="bg-white rounded-2xl shadow-card p-8 border border-border-light">
          <RegisterForm />
        </div>
      </div>
    </main>
  )
}
