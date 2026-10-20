import { useLanguage } from '../context/LanguageContext'
import Button from '../components/ui/Button'
import Reveal from '../components/ui/Reveal'
import SectionHeading from '../components/ui/SectionHeading'
import ProductCard from '../components/ProductCard'
import { products } from '../data/products'

export default function Home() {
  const { t } = useLanguage()

  return (
    <main>
      {/* ====== A. Hero ====== */}
      <section
        className="relative min-h-[450px] min-w-full overflow-hidden bg-charcoal position-relative"
      >
        {/* hero background image via img tag */}
        <img
          src="/images/commodity-port.jpg"
          alt="Global commodity port"
          className="absolute inset-0 w-full h-full object-cover"
          style={{ width: '100%', height: '100%' }}
        />
        {/* gradient overlay for text readability */}
        <div
          className="absolute inset-0 bg-gradient-to-r from-charcoal/85 via-charcoal/75 to-transparent"
        />

        <div className="container-site relative z-10 h-full flex flex-col items-center pt-6">
          <div className="max-w-2xl text-center">
            {/* uppercase eyebrow */}
            <p className="text-xs uppercase tracking-wider mb-2 text-gold">
              {t.home.hero.eyebrow}
            </p>

            {/* main heading */}
            <h1
              className="font-serif text-4xl md:text-5xl lg:text-6xl font-bold text-off-white mb-4"
            >
              {t.home.hero.title}
            </h1>

            {/* supporting text */}
            <p
              className="text-lg leading-relaxed mb-6 max-w-xl text-center text-titanium/90"
            >
              {t.home.hero.subtitle}
            </p>

            {/* CTA buttons */}
            <div className="flex gap-3 flex-col sm:flex-row justify-center pt-6">
              <a
                href="/products"
                className="inline-flex items-center gap-2 rounded-lg bg-charcoal px-6 py-3 text-off-white font-semibold text-base transition-all hover:bg-graphite hover:shadow-card focus-visible:ring-2 focus:ring-gold focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                style={{ textDecoration: 'none' }}
              >
                {t.home.hero.cta}
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
              <a
                href="#enquiry"
                className="inline-flex items-center gap-2 rounded-lg bg-charcoal px-6 py-3 text-off-white font-semibold text-base transition-all hover:bg-graphite hover:shadow-card focus-visible:ring-2 focus:ring-gold focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                style={{ textDecoration: 'none' }}
              >
                {t.home.hero.secondaryCta}
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
                    d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                  />
                </svg>
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* ====== B. Featured product catalogue ====== */}
      <section className="section-padding bg-surface">
        <div className="container-site max-w-6xl mx-auto">
          <div className="text-center mb-10">
            <p className="text-xs uppercase tracking-wider mb-4 text-industrial-blue">
              {t.home.featuredCatalogue.eyebrow}
            </p>
            <h2 className="font-serif text-3xl md:text-4xl font-bold text-charcoal mb-4">
              {t.home.featuredCatalogue.title}
            </h2>
            <p className="text-base leading-relaxed text-body-text max-w-2xl mx-auto">
              {t.home.featuredCatalogue.text}
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {products
              .filter((p) => p.visible)
              .slice(0, 8)
              .map((product) => (
                <div key={product.id} className="overflow-visible">
                  <ProductCard product={product} />
                </div>
              ))}
          </div>

          <div className="mt-10 flex flex-col sm:flex-row justify-center gap-4">
            <a
              href="/enquiry"
              className="inline-flex items-center gap-2 rounded-lg bg-charcoal px-6 py-3 text-off-white font-semibold text-base transition-all hover:bg-graphite hover:shadow-md focus-visible:ring-2 focus:ring-industrial-blue/50 focus:ring-offset-2 focus:ring-offset-charcoal"
              style={{ textDecoration: 'none' }}
            >
              {t.home.featuredCatalogue.bulkTrade}
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
                  d="M17 8l4 4m0 0l-4 4m4-4H3"
                />
              </svg>
            </a>
            <a
              href="/products"
              className="inline-flex items-center gap-2 rounded-lg bg-off-white px-6 py-3 text-charcoal font-semibold text-base transition-all hover:bg-titanium hover:shadow-md focus-visible:ring-2 focus:ring-industrial-blue/50 focus:ring-offset-2 focus:ring-offset-charcoal"
              style={{ textDecoration: 'none' }}
            >
              {t.home.featuredCatalogue.viewAll}
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
                  d="M17 8l4 4m0 0l-4 4m4-4H3"
                />
              </svg>
            </a>
          </div>
        </div>
      </section>

      {/* ====== C. Audience pathways ====== */}
      <section className="section-padding bg-surface">
        <div className="container-site max-w-3xl mx-auto">
          <p className="text-xs uppercase tracking-wider mb-4 text-industrial-blue">
            {t.home.audience.eyebrow}
          </p>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Business card */}
            <div className="rounded-xl border border-border-light bg-white p-8 shadow-card hover:border-gold/50 hover:shadow-card-hover transition-all">
              <h3 className="font-serif text-2xl font-bold text-charcoal mb-3">
                {t.home.audience.business.title}
              </h3>
              <p className="text-base leading-relaxed text-body-text mb-6">
                {t.home.audience.business.text}
              </p>
              <a
                href="/enquiry"
                className="inline-flex items-center gap-2 rounded-lg bg-charcoal px-6 py-3 text-off-white font-semibold text-base transition-all hover:bg-graphite hover:shadow-md focus-visible:ring-2 focus:ring-industrial-blue/50 focus:ring-offset-2 focus:ring-offset-charcoal"
                style={{ textDecoration: 'none' }}
              >
                {t.home.audience.business.cta}
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
                    d="M17 8l4 4m0 0l-4 4m4-4H3"
                  />
                </svg>
              </a>
            </div>
            {/* Consumer card */}
            <div className="rounded-xl border border-border-light bg-white p-8 shadow-card hover:border-gold/50 hover:shadow-card-hover transition-all">
              <h3 className="font-serif text-2xl font-bold text-charcoal mb-3">
                {t.home.audience.consumer.title}
              </h3>
              <p className="text-base leading-relaxed text-body-text mb-6">
                {t.home.audience.consumer.text}
              </p>
              <a
                href="/products"
                className="inline-flex items-center gap-2 rounded-lg bg-off-white px-6 py-3 text-charcoal font-semibold text-base transition-all hover:bg-titanium hover:shadow-md focus-visible:ring-2 focus:ring-industrial-blue/50 focus:ring-offset-2 focus:ring-offset-charcoal"
                style={{ textDecoration: 'none' }}
              >
                {t.home.audience.consumer.cta}
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
                    d="M17 8l4 4m0 0l-4 4m4-4H3"
                  />
                </svg>
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* ====== C. Product catalogue introduction ====== */}
      <section className="section-padding bg-off-white">
        <div className="container-site max-w-2xl mx-auto">
          <p className="text-xs uppercase tracking-wider mb-4 text-industrial-blue">
            {t.home.catalogue.eyebrow}
          </p>
          <h2 className="font-serif text-2xl font-bold text-charcoal mb-4">
            {t.home.catalogue.title}
          </h2>
          <p className="text-base leading-relaxed text-body-text mb-6">
            {t.home.catalogue.text}
          </p>
          <a
            href="/products"
            className="inline-flex items-center gap-2 rounded-lg bg-charcoal px-6 py-3 text-off-white font-semibold text-base transition-all hover:bg-graphite hover:shadow-md focus-visible:ring-2 focus:ring-industrial-blue/50 focus:ring-offset-2 focus:ring-offset-charcoal"
            style={{ textDecoration: 'none' }}
          >
            {t.home.catalogue.cta}
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
                d="M17 8l4 4m0 0l-4 4m4-4H3"
              />
            </svg>
          </a>
        </div>
      </section>

      {/* ====== D. Trading section ====== */}
      <section className="section-padding bg-charcoal">
        <div className="container-site max-w-2xl mx-auto">
          <p className="text-xs uppercase tracking-wider mb-4 text-gold">
            {t.home.trading.eyebrow}
          </p>
          <h2 className="font-serif text-2xl font-bold text-off-white mb-4">
            {t.home.trading.title}
          </h2>
          <p className="text-base leading-relaxed text-titanium/90 mb-6">
            {t.home.trading.text}
          </p>
        </div>
      </section>

      {/* ====== E. Closing CTA ====== */}
      <section
        className="relative isolate overflow-hidden bg-charcoal py-24 md:py-32 text-off-white"
      >
        <div
          aria-hidden="true"
          className="absolute inset-0 bg-gradient-to-r from-charcoal/80 via-charcoal/60 to-charcoal/40"
        />
        <div className="container-site text-center relative z-10">
          <Reveal>
            <h2
              className="mx-auto mb-5 max-w-3xl font-serif text-3xl font-bold leading-tight text-off-white md:text-4xl"
            >
              {t.home.cta.title}
            </h2>
            <p className="mx-auto mb-10 max-w-2xl text-lg leading-relaxed text-titanium/90">
              {t.home.cta.text}
            </p>
            <div className="flex gap-3 flex-col sm:flex-row justify-center">
              <a
                href="/products"
                className="inline-flex items-center gap-2 rounded-lg bg-off-white px-6 py-3 text-charcoal font-semibold text-base transition-all hover:bg-titanium hover:shadow-md focus-visible:ring-2 focus:ring-industrial-blue/50 focus:ring-offset-2 focus:ring-offset-charcoal"
                style={{ textDecoration: 'none' }}
              >
                {t.home.cta.primary}
              </a>
              <a
                href="#enquiry"
                className="inline-flex items-center gap-2 rounded-lg bg-white/10 px-6 py-3 text-off-white font-semibold text-base transition-all hover:bg-white/20 focus-visible:ring-2 focus:ring-industrial-blue/50 focus:ring-offset-2 focus:ring-offset-charcoal"
                style={{ textDecoration: 'none' }}
              >
                {t.home.cta.secondary}
              </a>
            </div>
          </Reveal>
        </div>
      </section>
    </main>
  )
}