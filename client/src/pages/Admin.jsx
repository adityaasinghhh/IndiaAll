import { useCallback, useEffect, useRef, useState } from 'react'
import { useLocation } from 'react-router-dom'
import { adminApi, setAdminAuthExpiredHandler } from '../services/adminApi.js'
import { ToastProvider, useToast } from '../components/admin/Toast.jsx'
import AdminSidebar from '../components/admin/AdminSidebar.jsx'
import OverviewPage from '../components/admin/OverviewPage.jsx'
import OrdersPage from '../components/admin/OrdersPage.jsx'
import EnquiriesPage from '../components/admin/EnquiriesPage.jsx'
import ProductsPage from '../components/admin/ProductsPage.jsx'
import CustomersPage from '../components/admin/CustomersPage.jsx'
import ReportsPage from '../components/admin/ReportsPage.jsx'
import SettingsPage from '../components/admin/SettingsPage.jsx'

const PAGES = {
  overview: { title: 'Overview', component: OverviewPage },
  orders: { title: 'Orders', component: OrdersPage },
  enquiries: { title: 'Enquiries', component: EnquiriesPage },
  products: { title: 'Products', component: ProductsPage },
  customers: { title: 'Customers', component: CustomersPage },
  reports: { title: 'Reports', component: ReportsPage },
  settings: { title: 'Settings', component: SettingsPage },
}

function LoginScreen({ onLogin }) {
  const [credentials, setCredentials] = useState({ email: '', password: '' })
  const [stage, setStage] = useState('password') // 'password' | 'otp' | 'mfa'
  const [otpAdminId, setOtpAdminId] = useState('')
  const [mfaChallengeId, setMfaChallengeId] = useState('')
  const [mfaUserId, setMfaUserId] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const toast = useToast()

  const submitPassword = async (event) => {
    event.preventDefault()
    if (loading) return

    const email = credentials.email.trim()
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError('Enter a valid email address.')
      return
    }
    if (!credentials.password) {
      setError('Enter your password.')
      return
    }

    setLoading(true)
    setError('')
    try {
      const result = await adminApi.login({ email, password: credentials.password })
      if (result.requiresOtp) {
        setOtpAdminId(result.adminId)
        setStage('otp')
        return
      }
      if (result.requiresMfa) {
        setMfaUserId(result.userId)
        setMfaChallengeId(result.challengeId)
        setStage('mfa')
        return
      }
      toast.success(`Welcome back, ${result.admin.name}.`)
      onLogin(result.admin)
    } catch (err) {
      if (err.status === 423) {
        setError('Account is temporarily locked. Please try again later.')
      } else if (err.status === 429) {
        setError('Too many attempts. Please wait a moment and try again.')
      } else {
        setError(err.message || 'Unable to sign in.')
      }
    } finally {
      setLoading(false)
    }
  }

  const verifyOtp = async (otp) => {
    setError('')
    setLoading(true)
    try {
      const result = await adminApi.verifyLoginOtp({ adminId: otpAdminId, otp })
      toast.success(`Welcome back, ${result.admin.name}.`)
      onLogin(result.admin)
    } catch (err) {
      setError(err.message || 'Verification failed.')
    } finally {
      setLoading(false)
    }
  }

  const verifyMfa = async (token) => {
    setError('')
    setLoading(true)
    try {
      const result = await adminApi.verifyMfaLogin({
        userId: mfaUserId,
        challengeId: mfaChallengeId,
        token,
      })
      toast.success(`Welcome back, ${result.admin.name}.`)
      onLogin(result.admin)
    } catch (err) {
      setError(err.message || 'Verification failed.')
    } finally {
      setLoading(false)
    }
  }

  // Render form fields based on stage
  const renderOtpForm = () => (
    <form
      className="space-y-4"
      onSubmit={async (event) => {
        event.preventDefault()
        if (loading) return
        await verifyOtp(document.getElementById('admin-otp')?.value.trim() || '')
      }}
      noValidate
    >
      <div>
        <h2 className="text-lg font-bold text-gold">Two-factor check</h2>
        <p className="mt-1 text-sm font-medium text-titanium/80">
          A verification code was sent to the administrator email. Enter it to finish signing in.
        </p>
      </div>
      <div>
        <label className="mb-1 block text-sm font-semibold text-titanium" htmlFor="admin-otp">
          Verification code
        </label>
        <input
          id="admin-otp"
          type="text"
          inputMode="numeric"
          autoComplete="one-time-code"
          maxLength={8}
          required
          className="input-base w-full rounded-lg border border-white/10 bg-white/5 text-titanium transition-colors focus:border-gold focus:outline-none focus:ring-2 focus:ring-gold/30 py-2.5 text-sm"
          disabled={loading}
        />
      </div>
      <button disabled={loading} className="btn-primary w-full">
        {loading ? (
          <span className="admin-login-loading">
            <span className="admin-loading-spinner" aria-hidden="true" />
            Verifying…
          </span>
        ) : (
          'Verify code'
        )}
      </button>
      <button
        type="button"
        className="btn-outline w-full"
        disabled={loading}
        onClick={() => {
          setStage('password')
          setError('')
        }}
      >
        Back
      </button>
    </form>
  )

  const renderMfaForm = () => (
    <form
      className="space-y-4"
      onSubmit={async (event) => {
        event.preventDefault()
        if (loading) return
        await verifyMfa(document.getElementById('admin-mfa-token')?.value.trim() || '')
      }}
      noValidate
    >
      <div>
        <h2 className="text-lg font-bold text-gold">MFA verification</h2>
        <p className="mt-1 text-sm font-medium text-titanium/80">
          Enter your authenticator app code or recovery code to finish signing in.
        </p>
      </div>
      <div>
        <label className="mb-1 block text-sm font-semibold text-titanium" htmlFor="admin-mfa-token">
          6-digit code
        </label>
        <input
          id="admin-mfa-token"
          type="text"
          inputMode="numeric"
          autoComplete="one-time-code"
          maxLength={6}
          required
          className="input-base w-full rounded-lg border border-white/10 bg-white/5 text-titanium transition-colors focus:border-gold focus:outline-none focus:ring-2 focus:ring-gold/30 py-2.5 text-sm"
          disabled={loading}
        />
      </div>
      <button disabled={loading} className="btn-primary w-full">
        {loading ? (
          <span className="admin-login-loading">
            <span className="admin-loading-spinner" aria-hidden="true" />
            Verifying…
          </span>
        ) : (
          'Verify code'
        )}
      </button>
      <button
        type="button"
        className="btn-outline w-full"
        disabled={loading}
        onClick={() => {
          setStage('password')
          setError('')
        }}
      >
        Back
      </button>
    </form>
  )

  const renderPasswordForm = () => (
    <form onSubmit={submitPassword} className="space-y-4" noValidate>
      <div>
        <label className="mb-1 block text-sm font-semibold text-titanium" htmlFor="admin-email">Email</label>
        <input
          id="admin-email"
          type="email"
          autoComplete="username"
          required
          value={credentials.email}
          onChange={(e) => setCredentials({ ...credentials, email: e.target.value })}
          className="input-base w-full rounded-lg border border-white/10 bg-white/5 text-titanium transition-colors focus:border-gold focus:outline-none focus:ring-2 focus:ring-gold/30 py-2.5 text-sm"
          disabled={loading}
        />
      </div>
      <div>
        <label className="mb-1 block text-sm font-semibold text-titanium" htmlFor="admin-password">Password</label>
        <input
          id="admin-password"
          type="password"
          autoComplete="current-password"
          required
          value={credentials.password}
          onChange={(e) => setCredentials({ ...credentials, password: e.target.value })}
          className="input-base w-full rounded-lg border border-white/10 bg-white/5 text-titanium transition-colors focus:border-gold focus:outline-none focus:ring-2 focus:ring-gold/30 py-2.5 text-sm"
          disabled={loading}
        />
      </div>
      <button disabled={loading} className="btn-primary w-full">
        {loading ? (
          <span className="admin-login-loading">
            <span className="admin-loading-spinner" aria-hidden="true" />
            Signing in…
          </span>
        ) : (
          'Sign in securely'
        )}
      </button>
    </form>
  )

  return (
    <main className="admin-login-scene">
      <div className="admin-login-card">
        <div className="mb-6 text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-charcoal">
            <img src="/images/india-all-logo.png" alt="INDIA ALL" className="h-12 w-auto object-contain" />
          </div>
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-gold-dark">Restricted access</p>
          <h1 className="mt-2 font-serif text-3xl font-bold text-gold">Admin sign in</h1>
          <p className="mt-2 text-sm font-medium text-titanium/80">Manage orders, enquiries, products and customers.</p>
        </div>

        {error && (
          <div role="alert" className="mb-4 rounded-lg border border-red-400/30 bg-red-500/10 p-3 text-sm font-semibold text-red-400">
            {error}
          </div>
        )}

        {stage === 'otp' ? renderOtpForm() : stage === 'mfa' ? renderMfaForm() : renderPasswordForm()}

        <p className="mt-6 text-center text-xs font-medium text-titanium/60">
          Authorized personnel only. All activity is logged.
        </p>
      </div>
    </main>
  )
}

function ProfileMenu({ admin, onLogout, onOpenSettings }) {
  const [open, setOpen] = useState(false)
  const ref = useRef(null)

  useEffect(() => {
    if (!open) return
    const onClick = (event) => {
      if (ref.current && !ref.current.contains(event.target)) setOpen(false)
    }
    const onKey = (event) => {
      if (event.key === 'Escape') setOpen(false)
    }
    document.addEventListener('mousedown', onClick)
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('mousedown', onClick)
      document.removeEventListener('keydown', onKey)
    }
  }, [open])

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-2 rounded-lg px-2 py-1.5 transition-colors hover:bg-white/10"
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label="Admin profile menu"
      >
        <span className="flex h-8 w-8 items-center justify-center rounded-full bg-gold/15 text-sm font-bold text-gold-dark">
          {admin.name?.charAt(0)?.toUpperCase() || 'A'}
        </span>
        <span className="hidden text-left sm:block">
          <span className="block max-w-32 truncate text-sm font-semibold text-titanium">{admin.name}</span>
          <span className="block text-xs font-medium capitalize text-titanium/60">{admin.role}</span>
        </span>
        <svg className={`h-4 w-4 text-titanium transition-transform ${open ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {open && (
        <div className="absolute right-0 z-30 mt-2 w-56 overflow-hidden rounded-xl border border-white/10 bg-graphite py-1 shadow-card-hover" role="menu">
          <div className="border-b border-white/10 px-4 py-3">
            <p className="truncate text-sm font-semibold text-titanium">{admin.name}</p>
            <p className="truncate text-xs font-medium text-titanium/60">{admin.email}</p>
            <span className="mt-2 inline-block rounded-full bg-gold/10 px-2.5 py-0.5 text-xs font-bold capitalize text-gold-dark">
              {admin.role}
            </span>
          </div>
          <button
            type="button"
            role="menuitem"
            onClick={() => { setOpen(false); onOpenSettings() }}
            className="flex w-full items-center gap-2 px-4 py-2.5 text-sm font-semibold text-titanium transition-colors hover:bg-white/10"
          >
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-1.065-2.572c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
            </svg>
            Settings
          </button>
          <button
            type="button"
            role="menuitem"
            onClick={() => { setOpen(false); onLogout() }}
            className="flex w-full items-center gap-2 px-4 py-2.5 text-sm font-semibold text-red-400 transition-colors hover:bg-red-500/10"
          >
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
            Sign out
          </button>
        </div>
      )}
    </div>
  )
}

function AdminShell({ admin, onLogout, onProfileUpdate }) {
  const [activePage, setActivePage] = useState('overview')
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const location = useLocation()

  // /admin/dashboard behaves like the overview page.
  useEffect(() => {
    if (location.pathname === '/admin/dashboard') setActivePage('overview')
  }, [location.pathname])

  const navigate = (page) => {
    setActivePage(page)
    setSidebarOpen(false)
  }

  const ActivePageComponent = PAGES[activePage]?.component || OverviewPage
  const pageTitle = PAGES[activePage]?.title || 'Overview'

  return (
    <div className="admin-shell flex min-h-screen bg-charcoal">
      {sidebarOpen && (
        <div className="fixed inset-0 z-30 bg-charcoal/60 lg:hidden" onClick={() => setSidebarOpen(false)} aria-hidden="true" />
      )}

      <AdminSidebar
        activePage={activePage}
        onNavigate={navigate}
        admin={admin}
        onLogout={onLogout}
        isOpen={sidebarOpen}
      />

      <div className="admin-main-column flex min-w-0 flex-1 flex-col lg:ml-64">
        <header className="admin-topbar sticky top-0 z-20 flex h-16 items-center justify-between border-b border-white/10 bg-charcoal px-4 md:px-6 lg:px-8">
          <div className="flex min-w-0 items-center gap-3">
            <button
              type="button"
              onClick={() => setSidebarOpen(true)}
              className="inline-flex h-10 w-10 items-center justify-center rounded-lg text-titanium hover:bg-white/10 lg:hidden"
              aria-label="Open menu"
            >
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
            <nav aria-label="Breadcrumb" className="min-w-0">
              <ol className="flex items-center gap-1.5 text-sm">
                <li className="hidden text-titanium/60 sm:inline">Admin</li>
                <li className="hidden text-titanium/60 sm:inline" aria-hidden="true">/</li>
                <li className="truncate font-bold text-gold" aria-current="page">{pageTitle}</li>
              </ol>
            </nav>
          </div>

          <div className="flex items-center gap-2">
            <span className="hidden items-center gap-2 rounded-full bg-gold/10 px-3 py-1.5 text-xs font-bold text-gold-dark md:inline-flex">
              <span className="h-1.5 w-1.5 rounded-full bg-gold" aria-hidden="true" />
              Live data
            </span>
            <ProfileMenu admin={admin} onLogout={onLogout} onOpenSettings={() => navigate('settings')} />
          </div>
        </header>

        <div className="admin-workspace flex-1 p-4 md:p-6 lg:p-8">
          <ActivePageComponent admin={admin} onProfileUpdate={onProfileUpdate} />
        </div>
      </div>
    </div>
  )
}

function AdminInner() {
  const [admin, setAdmin] = useState(null)
  const [status, setStatus] = useState('loading') // loading | login | ready

  useEffect(() => {
    setAdminAuthExpiredHandler(() => {
      setAdmin(null)
      setStatus('login')
    })
  }, [])

  const restoreSession = useCallback(async () => {
    setStatus('loading')
    try {
      const result = await adminApi.getSession()
      setAdmin(result.admin)
      setStatus('ready')
    } catch {
      setAdmin(null)
      setStatus('login')
    }
  }, [])

  useEffect(() => {
    restoreSession()
  }, [restoreSession])

  const logout = useCallback(async () => {
    try {
      await adminApi.logout()
    } catch {
      // The session may already have expired server-side.
    } finally {
      setAdmin(null)
      setStatus('login')
    }
  }, [])

  if (status === 'loading') {
    return (
      <main className="admin-login-scene" role="status" aria-label="Restoring session">
        <div className="admin-login-card">
          <div className="admin-login-loading">
            <span className="admin-loading-spinner" aria-hidden="true" />
            Restoring your session…
          </div>
        </div>
      </main>
    )
  }

  if (status === 'login') {
    return <LoginScreen onLogin={(admin) => { setAdmin(admin); setStatus('ready') }} />
  }

  return (
    <AdminShell
      admin={admin}
      onLogout={logout}
      onProfileUpdate={(updated) => setAdmin(updated)}
    />
  )
}

export default function Admin() {
  return (
    <ToastProvider>
      <AdminInner />
    </ToastProvider>
  )
}
