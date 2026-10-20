import { useLanguage } from '../context/LanguageContext'

export default function About() {
  const { t } = useLanguage()

  return (
    <>
  <section className="relative min-h-[40vh] overflow-hidden bg-charcoal position-relative">
    <div
      className="absolute inset-0"
      style={{ backgroundImage: 'url("/images/commodity-port.jpg")', backgroundRepeat: 'no-repeat', backgroundSize: 'cover', backgroundPosition: 'center' }}
    />
    <div
      className="absolute inset-0 bg-gradient-to-r from-charcoal/85 via-charcoal/70 to-transparent"
    />
    <div className="container-site relative z-10 h-full flex items-center pt-6">
      <div className="max-w-64 lg:max-w-full flex items-start left-0">
        <p className="eyebrow mb-3 uppercase tracking-[0.18em] text-gold">
          {t.about.eyebrow}
        </p>

        <h1 className="font-serif text-3xl md:text-4xl lg:text-5xl font-bold leading-tight text-off-white mb-4">
          {t.about.hero.heading}
        </h1>

        <p className="text-titanium/90 mb-6">
          {t.about.hero.subtitle}
        </p>
      </div>
    </div>
  </section>

  <section className="section-padding bg-charcoal">
    <div className="container-site">
      <div className="max-w-3xl mb-12">
        <p className="eyebrow mb-3 uppercase tracking-[0.18em] text-gold">{t.about.story.eyebrow}</p>
        <h2 className="font-serif text-2xl font-bold text-gold md:text-3xl mb-4">
          {t.about.story.title}
        </h2>
        <p className="text-titanium/90 leading-relaxed">
          {t.about.story.text}
        </p>
      </div>
    </div>
  </section>

  <section className="section-padding bg-off-white">
    <div className="container-site">
      <div className="max-w-3xl mb-12">
        <p className="eyebrow mb-3 uppercase tracking-[0.18em] text-gold">{t.about.offering.eyebrow}</p>
        <h2 className="font-serif text-2xl font-bold text-gold md:text-3xl mb-4">
          {t.about.offering.title}
        </h2>
        <p className="text-titanium/90 leading-relaxed">
          {t.about.offering.text}
        </p>
      </div>
    </div>
  </section>

  <section className="section-padding bg-charcoal">
    <div className="container-site">
      <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
        <div className="rounded-xl border border-white/10 bg-white/5 p-8 hover:border-gold/50 transition-all">
          <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-gold/10 text-gold">
            <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
            </svg>
          </div>
          <h2 className="mb-3 font-serif text-xl font-bold text-off-white">{t.about.business.title}</h2>
          <p className="leading-relaxed text-titanium/80">{t.about.business.text}</p>
        </div>
        <div className="rounded-xl border border-white/10 bg-white/5 p-8 hover:border-gold/50 transition-all">
          <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-gold/10 text-gold">
            <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
            </svg>
          </div>
          <h2 className="mb-3 font-serif text-xl font-bold text-off-white">{t.about.consumer.title}</h2>
          <p className="leading-relaxed text-titanium/80">{t.about.consumer.text}</p>
        </div>
      </div>
    </div>
  </section>

  <section className="section-padding bg-off-white">
    <div className="container-site">
      <div className="max-w-3xl mb-12">
        <p className="eyebrow mb-3 uppercase tracking-[0.18em] text-gold">{t.about.approach.eyebrow}</p>
        <h2 className="font-serif text-2xl font-bold text-charcoal md:text-3xl mb-4">
          {t.about.approach.title}
        </h2>
        <p className="text-base leading-relaxed text-body-text">
          {t.about.approach.text}
        </p>
      </div>
    </div>
  </section>

  {/* ====== Founder's Vision ====== */}
  <section className="section-padding bg-off-white">
    <div className="container-site">
      <div className="max-w-6xl md:flex md:items-center md:gap-16">
        <div className="md:w-1/2">
          <div className="flex-shrink-0 w-48 h-48 md:w-64 md:h-64 rounded-full overflow-hidden border-2 border-gold/50 shadow-card">
            <img
              src="/images/founder"
              alt="Founder of INDIA ALL"
              className="w-full h-full object-cover"
            />
          </div>
          <div className="mt-6 text-center md:text-left">
            <h3 className="font-serif text-2xl font-bold text-charcoal mb-2">
              {t.about.founder.name}
            </h3>
          </div>
        </div>
        <div className="md:w-1/2 flex flex-col justify-center md:justify-start py-8 md:py-0">
          <p className="eyebrow mb-3 uppercase tracking-[0.18em] text-gold">
            {t.about.founder.vision.eyebrow}
          </p>
          <h2 className="font-serif text-3xl md:text-4xl font-bold text-charcoal mb-6">
            {t.about.founder.vision.heading}
          </h2>
          <p className="text-base leading-relaxed text-body-text mb-6">
            {t.about.founder.vision.text}
          </p>
          <p className="text-sm font-semibold text-industrial-blue italic">
            {t.about.founder.vision.closing}
          </p>
        </div>
      </div>
    </div>
  </section>

  <section className="section-padding bg-charcoal">
    <div className="container-site">
      <div className="section-gold-divider my-6" />
      <p className="eyebrow mb-4 uppercase tracking-[0.18em] text-gold text-center">{t.about.values.eyebrow}</p>
      <h2 className="font-serif text-2xl font-bold text-gold md:text-3xl text-center mb-8">{t.about.values.title}</h2>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {t.about.values.items.map((value, i) => (
          <div key={i} className="border border-white/10 rounded-xl p-4 text-center hover:border-gold/50 hover:bg-white/5 transition-all">
            <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-white/10 text-gold">
              <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h3 className="mb-2 font-serif text-base font-bold text-off-white">{value.title}</h3>
            <p className="text-sm leading-relaxed text-titanium/80">{value.text}</p>
          </div>
        ))}
      </div>
    </div>
  </section>
  </>
  )
}