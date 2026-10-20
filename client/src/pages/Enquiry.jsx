import { useLanguage } from '../context/LanguageContext'
import EnquiryForm from '../components/EnquiryForm'

export default function Enquiry() {
  const { t } = useLanguage()

  return (
    <div>
      <section
        className="relative min-h-[440px] min-w-full overflow-hidden bg-graphite position-relative"
      >
        <img
          src="/images/enquiry-hero.png"
          alt="Global cargo port"
          className="absolute top-0 right-0 bottom-0 left-0 w-full h-full object-cover"
        />
        <div className="absolute top-0 right-0 bg-industrial-blue/20 inset-x-0 h-48" />
        <div className="container-site relative z-10 h-full flex flex-col items-center justify-center pt-6 pb-8">
          <div className="lg:w-80 pr-8">
            <p className="text-xs uppercase tracking-wider text-titanium mb-4 text-center font-semibold">
              {t.enquiry.eyebrow}
            </p>
            <h1 className="font-serif text-4xl md:text-5xl lg:text-6xl font-bold text-off-white mb-4">
              {t.enquiry.hero.heading}
            </h1>
            <p className="text-lg md:text-base leading-relaxed text-titanium/90 mb-6 max-w-xl">
              {t.enquiry.hero.subtitle}
            </p>
            <a
              href="#enquiry-form"
              className="inline-flex items-center gap-2 rounded-lg bg-off-white px-6 py-3 text-charcoal font-semibold text-base transition-all hover:bg-titanium hover:shadow-md focus-visible:ring-2 focus:ring-industrial-blue/50 focus:ring-offset-2 focus:ring-offset-graphite"
              style={{ textDecoration: 'none' }}
            >
              {t.enquiry.title}
              <svg
                className="h-4 w-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M8 7h12m0 0l-4-4m4 4l-4 4m6-4a2 2 0 01-2-2h-6.06a2 2 0 1-1-1.732L12 3a2 2 0 00-2-2H5.93m5.66 2H12a2 2 0 012 2v7.93m5.66-2H12a2 2 0 012 2v4.93"
                />
              </svg>
            </a>
          </div>
        </div>
      </section>

      <section className="section-padding bg-off-white">
        <div className="container-site max-w-8xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-start">
            <EnquiryForm />
            <div className="lg:col-span-1">
              <h3 className="font-serif text-xl font-bold text-charcoal mb-4">
                {t.enquiry.info.title}
              </h3>
              <ol className="list-decimal list-inside space-y-2 text-sm font-medium text-body-text">
                <li>{t.enquiry.info.step1}</li>
                <li>{t.enquiry.info.step2}</li>
                <li>{t.enquiry.info.step3}</li>
              </ol>
              <p className="text-sm font-medium text-body-text">{t.enquiry.info.companyEmail}</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}