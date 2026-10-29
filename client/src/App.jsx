import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { LanguageProvider } from './context/LanguageContext'
import { AuthProvider, useAuth } from './context/AuthContext'
import { MaintenanceProvider, useMaintenance } from './context/MaintenanceContext'
import { lazy, Suspense } from 'react'
import Header from './components/layout/Header'
import Footer from './components/layout/Footer'
import Maintenance from './components/Maintenance'
import ErrorBoundary from './components/ErrorBoundary'
import ScrollToTop from './components/ScrollToTop'
import CustomerSupportChat from './components/support/CustomerSupportChat'

const Home = lazy(() => import('./pages/Home'))
const About = lazy(() => import('./pages/About'))
const GlobalSourcing = lazy(() => import('./pages/GlobalSourcing'))
const BusinessOpportunities = lazy(() => import('./pages/BusinessOpportunities'))
const OurStory = lazy(() => import('./pages/OurStory'))
const Products = lazy(() => import('./pages/Products'))
const CustomBulkOrder = lazy(() => import('./pages/CustomBulkOrder'))
const Enquiry = lazy(() => import('./pages/Enquiry'))
const Contact = lazy(() => import('./pages/Contact'))
const Privacy = lazy(() => import('./pages/Privacy'))
const Terms = lazy(() => import('./pages/Terms'))
const Cookies = lazy(() => import('./pages/Cookies'))
const Login = lazy(() => import('./pages/Login'))
const Register = lazy(() => import('./pages/Register'))
const ForgotPassword = lazy(() => import('./pages/ForgotPassword'))
const ResetPassword = lazy(() => import('./pages/ResetPassword'))
const TotpEnrollForm = lazy(() => import('./components/auth/TotpEnrollForm'))
const MfaSettings = lazy(() => import('./components/auth/MfaSettings'))
const Dashboard = lazy(() => import('./pages/Dashboard'))
const Admin = lazy(() => import('./pages/Admin'))

function NotFound() {
  return (
    <main className="flex min-h-[60vh] items-center bg-off-white py-24">
      <div className="shell">
        <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-industrial-blue">404</p>
        <h1 className="display mt-5 max-w-2xl text-[clamp(2.4rem,5vw,4rem)] text-charcoal">
          This page is not part of the route.
        </h1>
        <p className="mt-5 max-w-md text-sm leading-7 text-body-text/70">
          The page may have moved, or the address may be incorrect.
        </p>
        <a href="/" className="btn-corporate mt-8">
          Return home
        </a>
      </div>
    </main>
  )
}

function CustomerDashboard() {
  const { customer, loading } = useAuth()
  if (loading) return <main className="container-site py-20 text-center">Loading your account…</main>
  if (!customer) return <Navigate to="/login" replace />
  return <Dashboard />
}

function PublicLayout() {
  const { showMaintenance } = useMaintenance()

  if (showMaintenance) {
    return <Maintenance />
  }

  return (
    <div className="flex min-h-screen flex-col bg-surface">
      <Header />
      <div className="flex-1">
        <ErrorBoundary>
          <Suspense fallback={<div className="container-site py-24 text-center">Loading…</div>}>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/about" element={<About />} />
              <Route path="/global-sourcing" element={<GlobalSourcing />} />
              <Route path="/business-opportunities" element={<BusinessOpportunities />} />
              <Route path="/our-story" element={<OurStory />} />
              <Route path="/products" element={<Products />} />
              <Route path="/products/custom-bulk-order" element={<CustomBulkOrder />} />
              <Route path="/enquiry" element={<Enquiry />} />
              <Route path="/contact" element={<Contact />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/forgot-password" element={<ForgotPassword />} />
              <Route path="/reset-password" element={<ResetPassword />} />
              <Route path="/dashboard" element={<CustomerDashboard />} />
              <Route path="/auth/mfa/enroll" element={<TotpEnrollForm />} />
              <Route path="/auth/mfa/settings" element={<MfaSettings />} />
              <Route path="/privacy" element={<Privacy />} />
              <Route path="/terms" element={<Terms />} />
              <Route path="/cookies" element={<Cookies />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </Suspense>
        </ErrorBoundary>
      </div>
      <Footer />
      <CustomerSupportChat />
    </div>
  )
}

export default function App() {
  return (
    <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
      <LanguageProvider>
        <AuthProvider>
          <MaintenanceProvider>
            <ScrollToTop />
            <Routes>
              {/* Admin portal: standalone layout without the public header/footer */}
              <Route path="/admin" element={<Admin />} />
              <Route path="/admin/dashboard" element={<Admin />} />
              <Route path="/*" element={<PublicLayout />} />
            </Routes>
          </MaintenanceProvider>
        </AuthProvider>
      </LanguageProvider>
    </BrowserRouter>
  )
}
