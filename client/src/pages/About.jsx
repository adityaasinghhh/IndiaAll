import { Link } from 'react-router-dom'
import { useLanguage } from '../context/LanguageContext'
import { getSiteContent } from '../data/siteContent'
import PageHero from '../components/ui/PageHero'
import Capabilities from '../components/home/Capabilities'
import CommodityGrid from '../components/home/CommodityGrid'
import FounderSection from '../components/home/FounderSection'
import ClosingCta from '../components/home/ClosingCta'
import { ArrowRight } from '../components/ui/Icons'

export default function About() {
  const { lang } = useLanguage()
  const copy = getSiteContent(lang)
  const page = copy.pages.about

  return (
    <main>
      <PageHero
        eyebrow={page.eyebrow}
        title={page.title}
        intro={page.intro}
        image="/images/editorial/terminal.jpg"
        imageAlt="Container terminal with stacked freight and cranes"
        meta={[copy.hero.metaLeft, copy.hero.metaRight]}
      />

      <section className="bg-off-white py-20 lg:py-28">
        <div className="shell">
          <div className="grid gap-12 lg:grid-cols-12 lg:gap-16">
            <div className="lg:col-span-5">
              <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-industrial-blue">
                {copy.story.eyebrow}
              </p>
              <h2 className="display-tight mt-4 text-[clamp(2rem,3.6vw,3.1rem)] text-charcoal">
                {copy.story.title}
              </h2>
            </div>

            <div className="lg:col-span-7">
              <p className="font-serif text-[clamp(1.3rem,2.1vw,1.7rem)] leading-[1.45] text-charcoal/90">
                {copy.story.lead}
              </p>
              <div className="mt-6 grid gap-5 sm:grid-cols-2">
                <p className="text-sm leading-[1.9] text-body-text/70">{copy.story.p1}</p>
                <p className="text-sm leading-[1.9] text-body-text/70">{copy.story.p2}</p>
              </div>
              <Link to="/our-story" className="link-arrow mt-8">
                {copy.story.cta}
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>
          </div>

          <div className="mt-14 grid gap-4 sm:grid-cols-2">
            <figure className="media-zoom aspect-[16/10] overflow-hidden bg-graphite">
              <img
                src="/images/editorial/industry.jpg"
                alt="Industrial production facility"
                loading="lazy"
                className="h-full w-full object-cover"
              />
            </figure>
            <figure className="media-zoom aspect-[16/10] overflow-hidden bg-graphite">
              <img
                src="/images/editorial/port.jpg"
                alt="Container ship berthed at a commercial port"
                loading="lazy"
                className="h-full w-full object-cover"
              />
            </figure>
          </div>
        </div>
      </section>

      <Capabilities copy={copy.capabilities} />
      <CommodityGrid copy={copy.commodities} />
      <FounderSection copy={copy.founder} />

      <ClosingCta
        eyebrow={copy.contact.eyebrow}
        title={copy.contact.title}
        text={copy.contact.intro}
        primary={{ to: '/contact#trade-enquiry', label: copy.contact.form.submit }}
        secondary={{ to: '/business-opportunities', label: copy.nav.opportunities }}
      />
    </main>
  )
}
