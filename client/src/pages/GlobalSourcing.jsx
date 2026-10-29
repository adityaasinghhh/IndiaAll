import { Link } from 'react-router-dom'
import { useLanguage } from '../context/LanguageContext'
import { getSiteContent } from '../data/siteContent'
import PageHero from '../components/ui/PageHero'
import Capabilities from '../components/home/Capabilities'
import ClosingCta from '../components/home/ClosingCta'

export default function GlobalSourcing() {
  const { lang } = useLanguage()
  const copy = getSiteContent(lang)
  const page = copy.pages.sourcing

  return (
    <main>
      <PageHero
        eyebrow={page.eyebrow}
        title={page.title}
        intro={page.intro}
        image="/images/editorial/terminal.jpg"
        imageAlt="Aerial view of a container terminal with stacked freight"
        meta={[copy.hero.metaLeft, copy.utility.presence]}
      />

      <section className="bg-off-white py-20 lg:py-28">
        <div className="shell">
          <div className="grid gap-12 lg:grid-cols-12 lg:gap-16">
            <div className="lg:col-span-5">
              <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-industrial-blue">
                {copy.capabilities.eyebrow}
              </p>
              <h2 className="display-tight mt-4 text-[clamp(2rem,3.6vw,3.1rem)] text-charcoal">
                {page.considerationsTitle}
              </h2>
              <p className="body-copy mt-5">{copy.capabilities.intro}</p>

              <figure className="mt-10">
                <div className="media-zoom aspect-[4/3] overflow-hidden bg-graphite">
                  <img
                    src="/images/editorial/field.jpg"
                    alt="Agricultural fields at sunset"
                    loading="lazy"
                    className="h-full w-full object-cover"
                  />
                </div>
                <figcaption className="mt-3 text-[10px] uppercase tracking-[0.14em] text-steel">
                  {copy.story.secondaryCaption}
                </figcaption>
              </figure>
            </div>

            <div className="lg:col-span-7">
              <ol className="border-t border-charcoal/15">
                {page.considerations.map((item, index) => (
                  <li
                    key={item}
                    className="grid grid-cols-[2.5rem_1fr] gap-4 border-b border-charcoal/15 py-6 sm:grid-cols-[3.5rem_1fr] sm:gap-6"
                  >
                    <span className="font-serif text-lg italic text-industrial-blue">
                      {String(index + 1).padStart(2, '0')}
                    </span>
                    <p className="font-serif text-[1.35rem] leading-[1.4] text-charcoal">{item}</p>
                  </li>
                ))}
              </ol>

              <div className="mt-10 border border-charcoal/15 bg-white p-6 sm:p-8">
                <h3 className="font-serif text-2xl text-charcoal">{copy.pages.sourcing.ctaTitle}</h3>
                <p className="mt-3 max-w-md text-sm leading-7 text-body-text/70">
                  {copy.pages.sourcing.ctaText}
                </p>
                <Link to="/contact#trade-enquiry" className="btn-corporate mt-6">
                  {copy.nav.cta}
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      <Capabilities copy={copy.capabilities} />

      <ClosingCta
        eyebrow={copy.contact.eyebrow}
        title={copy.contact.title}
        text={copy.contact.intro}
        primary={{ to: '/contact#trade-enquiry', label: copy.contact.form.submit }}
        secondary={{ to: '/products', label: copy.common.catalogue }}
      />
    </main>
  )
}
