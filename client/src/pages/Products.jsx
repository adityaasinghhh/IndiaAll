import { useLanguage } from '../context/LanguageContext'
import { Link } from 'react-router-dom'
import ProductGrid from '../components/ProductGrid'

export default function Products() {
  const { t } = useLanguage()

  return (
    <>
      {/* ============ Hero Section ============ */}
      <section className="relative min-h-[40vh] overflow-hidden bg-charcoal position-relative">
        <div
          className="absolute inset-0"
          style={{ backgroundImage: 'url("/images/products/crude-oil-hero.jpg")' }}
        />
        <div
          className="absolute inset-0 bg-gradient-to-r from-charcoal/85 via-charcoal/70 to-transparent"
        />
        <div className="container-site relative z-10 h-full flex items-center pt-6">
          <div className="max-w-64 lg:max-w-full flex items-start left-0">
            <p className="eyebrow mb-3 uppercase tracking-[0.18em] text-gold">
              {t.products.eyebrow}
            </p>
            <h1 className="font-serif text-3xl md:text-4xl lg:text-5xl font-bold leading-tight text-off-white mb-4">
              {t.products.hero.heading}
            </h1>
            <p className="text-titanium/90">
              {t.products.hero.subtitle}
            </p>
          </div>
        </div>
      </section>

      {/* ============ Products Grid ============ */}
      <section className="section-padding bg-surface">
        <div className="container-site">
          <ProductGrid />
        </div>
      </section>

      {/* ============ Bulk Order Callout ============ */}
      <section className="py-12 md:py-24 bg-charcoal">
        <div className="container-site">
          <div className="max-w-2xl mx-auto text-center">
            <p className="eyebrow mb-3 uppercase tracking-[0.18em] text-gold">
              {t.products.bulkOrder.eyebrow}
            </p>
            <h2 className="font-serif text-2xl md:text-3xl font-bold text-gold mb-4">
              {t.products.bulkOrder.title}
            </h2>
            <p className="text-lg leading-relaxed text-titanium/90">
              {t.products.bulkOrder.text}
            </p>
            <Link
              to="/products/custom-bulk-order"
              className="btn-gold mt-6 inline-flex"
            >
              {t.products.bulkOrder.cta}
              <svg
                className="h-4 w-4 ml-2"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </Link>
          </div>
        </div>
      </section>
    </>
  )
}