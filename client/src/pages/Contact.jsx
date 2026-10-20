import { useLanguage } from '../context/LanguageContext'
import { Link } from 'react-router-dom'
import Button from '../components/ui/Button'

export default function Contact() {
  const { t } = useLanguage()

  return (
    <div>
      {/* ====== Contact hero ====== */}
      <section
        className="relative min-h-[40vh] overflow-hidden bg-graphite position-relative"
      >
        <div className="absolute top-0 left-0 right-0 h-48 bg-off-white" />
        <div className="absolute inset-0 bg-[url('/images/products/coal-hero.jpg')] bg-no-repeat bg-cover bg-center" />
        <div className="absolute bottom-0 left-0 right-0 bg-graphite/90" />
        <div className="container-site relative z-10 h-full flex items-center pt-6">
          <div className="max-w-64 lg:max-w-full flex items-start left-0">
            <p className="text-xs uppercase tracking-wider mb-2 text-titanium font-semibold">
              {t.contact.eyebrow}
            </p>
            <h1 className="font-serif text-3xl md:text-4xl lg:text-5xl font-bold text-off-white mb-4">
              {t.contact.hero.heading}
            </h1>
            <p className="text-lg md:text-base leading-relaxed mb-6 max-w-xl text-titanium/90">
              {t.contact.hero.subtitle}
            </p>
            <div className="flex gap-2 flex-wrap justify-center">
              <a
                href="/enquiry"
                className="inline-flex items-center gap-2 rounded-lg bg-off-white px-6 py-3 text-charcoal font-semibold text-base transition-all hover:bg-titanium hover:shadow-md focus-visible:ring-2 focus:ring-industrial-blue/50 focus:ring-offset-2 focus:ring-offset-graphite"
                style={{ textDecoration: 'none' }}
              >
                {t.contact.ctaButton}
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m6-4a2 2 0 0 1-2-2h-6.06a2 2 0 1 1-1-1.732L12 3a2 2 0 0 0-2-2H5.93m5.66 2H12a2 2 0 0 1 2 2v7.93m5.66-2H12a2 2 0 0 1 2 2v4.93" />
                </svg>
              </a>
              <a
                href="mailto:Info@indiaall.org"
                className="inline-flex items-center gap-2 rounded-lg bg-white/10 px-6 py-3 text-off-white font-semibold text-base transition-all hover:bg-white/20 focus-visible:ring-2 focus:ring-industrial-blue/50 focus:ring-offset-2 focus:ring-offset-graphite"
                style={{ textDecoration: 'none' }}
              >
                Contact by email
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 0 0 2.22 0L21 8M5 19h14a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2z" />
                </svg>
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* ====== Get in touch ====== */}
      <section className="section-padding bg-off-white">
        <div className="container-site">
          <div className="rounded-2xl border border-border-light bg-white p-8 md:p-10 mb-12 shadow-card">
            <p className="text-sm uppercase tracking-wider mb-4 text-industrial-blue font-semibold">
              Get in touch
            </p>
            <h2 className="font-serif text-2xl font-bold text-charcoal mb-4">
              {t.contact.title}
            </h2>
            <p className="text-base leading-relaxed text-body-text mb-6">
              {t.contact.subtitle}
            </p>
            <div className="flex items-center gap-3">
              <svg className="h-5 w-5 text-industrial-blue mb-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 0 0 2.22 0L21 8M5 19h14a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2z" />
              </svg>
              <a href="mailto:Info@indiaall.org" className="text-charcoal font-semibold">
                Info@indiaall.org
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* ====== How can we help? ====== */}
      <section className="section-padding bg-graphite">
        <div className="container-site">
          <div className="rounded-2xl border border-border-light bg-white p-8 md:p-10 shadow-card">
            <p className="text-xs uppercase tracking-wider mb-4 text-industrial-blue font-semibold">
              How can we help?
            </p>
            <p className="text-base leading-relaxed text-body-text mb-6">
              Use the existing Enquiry page for commodity requirements and bulk-order requests. Tell us what your business needs — our team will help you explore commodity solutions tailored to your requirements.
            </p>
            <div className="flex gap-2">
              <a
                href="/enquiry"
                className="inline-flex items-center gap-2 rounded-lg bg-charcoal px-6 py-3 text-off-white font-semibold text-base transition-all hover:bg-graphite hover:shadow-md focus-visible:ring-2 focus:ring-industrial-blue/50 focus:ring-offset-2 focus:ring-offset-white"
                style={{ textDecoration: 'none' }}
              >
                Go to Enquiry Form
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m6-4a2 2 0 0 1-2-2h-6.06a2 2 0 1-1-1.732L12 3a2 2 0 0 0-2-2H5.93m5.66 2H12a2 2 0 0 1 2 2v7.93m5.66-2H12a2 2 0 0 1 2 2v4.93" />
                </svg>
              </a>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}