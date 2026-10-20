import { Link } from 'react-router-dom'
import { useLanguage } from '../context/LanguageContext'

export default function Privacy() {
  const { t } = useLanguage()

  return (
    <main className="min-h-[70vh] bg-off-white py-10 md:py-14">
      <div className="container-site max-w-3xl">
        <div className="mb-8">
          <p className="mb-2 text-xs font-bold uppercase tracking-[0.2em] text-industrial-blue">Legal</p>
          <h1 className="font-serif text-3xl font-bold text-charcoal md:text-4xl">Privacy Policy</h1>
        </div>
        <div className="prose prose-charcoal max-w-none">
          <div className="rounded-xl border border-border-light bg-white p-8 shadow-card">
            <p className="text-base font-medium text-body-text mb-4">
              INDIA ALL respects your privacy and is committed to protecting your personal data. This privacy policy explains how we collect, use, and safeguard your information when you use our services.
            </p>
            <h2 className="font-serif text-xl font-bold text-charcoal mt-6 mb-3">Information We Collect</h2>
            <p className="text-base font-medium text-body-text mb-4">
              We collect information you provide directly to us, such as your name, email address, company details, and commodity requirements when you submit an enquiry.
            </p>
            <h2 className="font-serif text-xl font-bold text-charcoal mt-6 mb-3">How We Use Your Information</h2>
            <p className="text-base font-medium text-body-text mb-4">
              We use the information we collect to provide, maintain, and improve our services, process your enquiries, and communicate with you about our products and services.
            </p>
            <h2 className="font-serif text-xl font-bold text-charcoal mt-6 mb-3">Data Security</h2>
            <p className="text-base font-medium text-body-text mb-4">
              We implement appropriate technical and organizational measures to protect your personal data against unauthorized access, alteration, disclosure, or destruction.
            </p>
            <h2 className="font-serif text-xl font-bold text-charcoal mt-6 mb-3">Contact Us</h2>
            <p className="text-base font-medium text-body-text">
              If you have any questions about this privacy policy, please contact us at{' '}
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