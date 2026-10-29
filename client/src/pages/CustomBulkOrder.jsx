import { useLanguage } from '../context/LanguageContext'
import { getSiteContent } from '../data/siteContent'
import PageHero from '../components/ui/PageHero'
import TradeEnquiryForm from '../components/forms/TradeEnquiryForm'

export default function CustomBulkOrder() {
  const { lang } = useLanguage()
  const copy = getSiteContent(lang)
  const page = copy.pages.bulkOrder

  return (
    <main>
      <PageHero
        eyebrow={page.eyebrow}
        title={page.title}
        intro={page.intro}
        image="/images/editorial/wheat.jpg"
        imageAlt="Golden wheat ears ready for harvest"
        compact
        meta={[copy.pages.products.eyebrow, copy.utility.presence]}
      />

      <section className="bg-off-white py-20 lg:py-24">
        <div className="shell">
          <div className="grid gap-12 lg:grid-cols-12 lg:gap-16">
            <div className="lg:col-span-4">
              <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-industrial-blue">
                {copy.contact.stepsTitle}
              </p>
              <ol className="mt-5 space-y-5 border-t border-charcoal/15 pt-5">
                {copy.contact.steps.map((step, index) => (
                  <li key={step} className="grid grid-cols-[2rem_1fr] gap-3 border-b border-charcoal/10 pb-5">
                    <span className="font-serif text-sm italic text-industrial-blue">
                      {String(index + 1).padStart(2, '0')}
                    </span>
                    <span className="text-[13px] leading-6 text-body-text/70">{step}</span>
                  </li>
                ))}
              </ol>
              <p className="mt-6 text-[11px] leading-6 text-steel">{copy.contact.disclaimer}</p>
            </div>

            <div className="lg:col-span-8">
              <TradeEnquiryForm defaultEnquiryType="bulk-supply" />
            </div>
          </div>
        </div>
      </section>
    </main>
  )
}
