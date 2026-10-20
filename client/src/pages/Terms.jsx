import { Link } from 'react-router-dom'
import { useLanguage } from '../context/LanguageContext'

export default function Terms() {
  const { t } = useLanguage()

  return (
    <main className="min-h-[70vh] bg-off-white py-10 md:py-14">
      <div className="container-site max-w-3xl">
        <div className="mb-8">
          <p className="mb-2 text-xs font-bold uppercase tracking-[0.2em] text-industrial-blue">Legal</p>
          <h1 className="font-serif text-3xl font-bold text-charcoal md:text-4xl">Terms of Service</h1>
        </div>
        <div className="prose prose-charcoal max-w-none">
          <div className="rounded-xl border border-border-light bg-white p-8 shadow-card">
            <p className="text-base font-medium text-body-text mb-4">
              These terms of service govern your use of the INDIA ALL platform and services. By accessing or using our services, you agree to be bound by these terms.
            </p>
            <h2 className="font-serif text-xl font-bold text-charcoal mt-6 mb-3">Use of Services</h2>
            <p className="text-base font-medium text-body-text mb-4">
              You may use our services only for lawful purposes and in accordance with these terms. You agree not to use our services in any way that violates any applicable law or regulation.
            </p>
            <h2 className="font-serif text-xl font-bold text-charcoal mt-6 mb-3">Intellectual Property</h2>
            <p className="text-base font-medium text-body-text mb-4">
              All content, trademarks, and intellectual property on this platform are the property of INDIA ALL or its licensors and are protected by applicable intellectual property laws.
            </p>
            <h2 className="font-serif text-xl font-bold text-charcoal mt-6 mb-3">Limitation of Liability</h2>
            <p className="text-base font-medium text-body-text mb-4">
              INDIA ALL shall not be liable for any indirect, incidental, special, or consequential damages arising out of or in connection with your use of our services.
            </p>
            <h2 className="font-serif text-xl font-bold text-charcoal mt-6 mb-3">Contact</h2>
            <p className="text-base font-medium text-body-text">
              For questions about these terms, contact us at{' '}
              <a href="mailto:Info@indiaall.org" className="text-industrial-blue font-semibold hover:underline">
                Info@indiaall.org
              </a>.
            </p>
          </div>
        </div>
      </div>
    </main>
  )
}