import { useLanguage } from '../context/LanguageContext'
import { getSiteContent } from '../data/siteContent'
import PageHero from '../components/ui/PageHero'
import OpportunitySection from '../components/home/OpportunitySection'
import ClosingCta from '../components/home/ClosingCta'

export default function BusinessOpportunities() {
  const { lang } = useLanguage()
  const copy = getSiteContent(lang)
  const page = copy.pages.opportunities

  return (
    <main>
      <PageHero
        eyebrow={page.eyebrow}
        title={page.title}
        intro={page.intro}
        image="/images/editorial/industry.jpg"
        imageAlt="Stainless steel processing equipment in an industrial facility"
        meta={[copy.utility.tagline, copy.utility.presence]}
      />

      <section className="bg-off-white py-20 lg:py-24">
        <div className="shell">
          <div className="grid gap-10 lg:grid-cols-12">
            <div className="lg:col-span-4">
              <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-industrial-blue">
                {page.partnersTitle}
              </p>
              <p className="mt-5 text-sm leading-7 text-body-text/70">{page.partnersIntro}</p>
            </div>

            <div className="lg:col-span-8">
              <div className="grid gap-px border-y border-charcoal/15 bg-charcoal/15 sm:grid-cols-2">
                {page.partners.map((partner, index) => (
                  <div key={partner} className="bg-off-white px-1 py-7 sm:px-6">
                    <p className="font-serif text-sm italic text-industrial-blue">
                      {String(index + 1).padStart(2, '0')}
                    </p>
                    <h2 className="mt-3 font-serif text-[1.55rem] leading-tight text-charcoal">
                      {partner}
                    </h2>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      <OpportunitySection copy={copy.opportunities} />

      <ClosingCta
        eyebrow={page.eyebrow}
        title={page.ctaTitle}
        text={page.ctaText}
        primary={{ to: '/contact#trade-enquiry', label: copy.nav.cta }}
        secondary={{ to: '/global-sourcing', label: copy.nav.sourcing }}
      />
    </main>
  )
}
