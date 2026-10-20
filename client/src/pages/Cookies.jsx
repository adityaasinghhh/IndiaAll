import { Link } from 'react-router-dom'
import { useLanguage } from '../context/LanguageContext'

export default function Cookies() {
  const { t } = useLanguage()

  return (
    <main className="min-h-[70vh] bg-off-white py-10 md:py-14">
      <div className="container-site max-w-3xl">
        <div className="mb-8">
          <p className="mb-2 text-xs font-bold uppercase tracking-[0.2em] text-industrial-blue">Legal</p>
          <h1 className="font-serif text-3xl font-bold text-charcoal md:text-4xl">Cookie Policy</h1>
        </div>
        <div className="prose prose-charcoal max-w-none">
          <div className="rounded-xl border border-border-light bg-white p-8 shadow-card">
            <p className="text-base font-medium text-body-text mb-4">
              This cookie policy explains how INDIA ALL uses cookies and similar technologies to recognize you when you visit our website.
            </p>
            <h2 className="font-serif text-xl font-bold text-charcoal mt-6 mb-3">What Are Cookies</h2>
            <p className="text-base font-medium text-body-text mb-4">
              Cookies are small text files that are placed on your device to help the website provide a better user experience.
            </p>
            <h2 className="font-serif text-xl font-bold text-charcoal mt-6 mb-3">How We Use Cookies</h2>
            <p className="text-base font-medium text-body-text mb-4">
              We use cookies for authentication, preferences, analytics, and to improve the performance and functionality of our platform.
            </p>
            <h2 className="font-serif text-xl font-bold text-charcoal mt-6 mb-3">Managing Cookies</h2>
            <p className="text-base font-medium text-body-text">
              You can control and manage cookies through your browser settings. Please note that disabling cookies may affect the functionality of our services.
            </p>
          </div>
        </div>
      </div>
    </main>
  )
}