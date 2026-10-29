import { Link } from 'react-router-dom'
import { useLanguage } from '../context/LanguageContext'
import { getSiteContent } from '../data/siteContent'
import PageHero from '../components/ui/PageHero'
import ProductGrid from '../components/ProductGrid'
import ClosingCta from '../components/home/ClosingCta'
import { ArrowUpRight } from '../components/ui/Icons'

export default function Products() {
  const { lang } = useLanguage()
  const copy = getSiteContent(lang)
  const page = copy.pages.products

  return (
    <main>
      <PageHero
        eyebrow={page.eyebrow}
        title={page.title}
        intro={page.intro}
        image="/images/editorial/steel.jpg"
        imageAlt="Coiled steel in an industrial storage facility"
        meta={[copy.hero.metaLeft, copy.hero.metaRight]}
      />

      <section className="bg-off-white py-16 lg:py-20">
        <div className="shell">
          <div className="flex flex-col gap-6 border-b border-charcoal/15 pb-8 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-industrial-blue">
                {copy.footer.links.catalogue}
              </p>
              <h2 className="display-tight mt-3 text-[clamp(1.9rem,3vw,2.8rem)] text-charcoal">
                {copy.nav.products}
              </h2>
            </div>
            <p className="max-w-sm text-[11px] leading-6 text-steel">{page.note}</p>
          </div>

          <div className="mt-8">
            <ProductGrid />
          </div>
        </div>
      </section>

      <section className="border-y border-charcoal/10 bg-[#EDEBE5] py-16 lg:py-20">
        <div className="shell grid gap-8 lg:grid-cols-12 lg:items-center">
          <div className="lg:col-span-8">
            <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-industrial-blue">
              {copy.pages.bulkOrder.eyebrow}
            </p>
            <h2 className="display-tight mt-4 max-w-2xl text-[clamp(1.9rem,3.4vw,2.9rem)] text-charcoal">
              {copy.pages.bulkOrder.title}
            </h2>
            <p className="mt-4 max-w-xl text-sm leading-7 text-body-text/70">
              {copy.pages.bulkOrder.intro}
            </p>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row lg:col-span-4 lg:justify-end">
            <Link to="/products/custom-bulk-order" className="btn-corporate">
              {copy.common.discuss}
              <ArrowUpRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        </div>
      </section>

      <ClosingCta
        eyebrow={copy.contact.eyebrow}
        title={copy.contact.title}
        text={copy.contact.intro}
        primary={{ to: '/contact#trade-enquiry', label: copy.contact.form.submit }}
        secondary={{ to: '/enquiry', label: copy.pages.enquiry.eyebrow }}
      />
    </main>
  )
}
