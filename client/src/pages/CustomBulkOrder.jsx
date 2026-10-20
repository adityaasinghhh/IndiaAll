import { Link, useNavigate } from 'react-router-dom'
import { useLanguage } from '../context/LanguageContext'

export default function CustomBulkOrder() {
  const { t } = useLanguage()
  const navigate = useNavigate()

  return (
    <main className="min-h-[70vh] bg-off-white py-10 md:py-14">
      <div className="container-site">
        <div className="mb-8">
          <p className="mb-2 text-xs font-bold uppercase tracking-[0.2em] text-industrial-blue">Bulk orders</p>
          <h1 className="font-serif text-3xl font-bold text-charcoal md:text-4xl">Custom Bulk Order</h1>
          <p className="mt-2 text-sm font-medium text-text-secondary">Submit your commodity requirements for bulk pricing and delivery.</p>
        </div>
        <div className="max-w-2xl">
          <div className="rounded-xl border border-border-light bg-white p-8 shadow-card">
            <p className="text-base font-medium text-body-text mb-6">
              For bulk commodity orders, please use our enquiry form with your specific requirements including quantity, delivery location, and timeline.
            </p>
            <Link to="/enquiry" className="btn-primary inline-flex">
              Go to Enquiry Form
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </Link>
          </div>
        </div>
      </div>
    </main>
  )
}