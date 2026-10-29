import { Link } from 'react-router-dom'
import { ArrowRight, ArrowUpRight } from '../ui/Icons'

export default function OpportunitySection({ copy }) {
  return (
    <section id="opportunities" className="scroll-mt-32 bg-off-white py-20 lg:py-28">
      <div className="shell">
        <div className="grid gap-12 lg:grid-cols-12 lg:gap-16">
          {/* Image */}
          <div className="lg:col-span-6">
            <figure className="lg:sticky lg:top-28">
              <div className="media-zoom aspect-[4/3] overflow-hidden bg-graphite">
                <img
                  src={copy.image}
                  alt={copy.imageAlt}
                  loading="lazy"
                  className="h-full w-full object-cover"
                />
              </div>
              <figcaption className="mt-4 border-l-2 border-industrial-blue pl-4 font-serif text-base italic leading-6 text-graphite">
                {copy.imageCaption}
              </figcaption>
            </figure>
          </div>

          {/* Opportunities */}
          <div className="lg:col-span-6">
            <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-industrial-blue">
              {copy.eyebrow}
            </p>
            <h2 className="display-tight mt-5 max-w-lg text-[clamp(2.1rem,3.8vw,3.4rem)] text-charcoal">
              {copy.title}
            </h2>
            <p className="body-copy mt-6 max-w-lg">{copy.intro}</p>

            <div className="mt-10 border-t border-charcoal/15">
              {copy.items.map((item) => (
                <Link
                  key={item.number}
                  to={item.href}
                  className="group grid gap-3 border-b border-charcoal/15 py-6 transition-colors hover:border-industrial-blue sm:grid-cols-12 sm:gap-5"
                >
                  <p className="font-serif text-sm italic text-industrial-blue sm:col-span-2">
                    {item.number}
                  </p>
                  <div className="sm:col-span-9">
                    <h3 className="font-serif text-xl leading-snug text-charcoal transition-colors group-hover:text-industrial-blue">
                      {item.title}
                    </h3>
                    <p className="mt-2 text-[13px] leading-6 text-body-text/70">{item.text}</p>
                    <span className="mt-3 inline-flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.14em] text-steel transition-colors group-hover:text-industrial-blue">
                      {item.linkLabel}
                      <ArrowRight className="h-3 w-3 transition-transform group-hover:translate-x-0.5" />
                    </span>
                  </div>
                  <span className="hidden items-start justify-end pt-1 sm:col-span-1 sm:flex">
                    <ArrowUpRight className="h-4 w-4 text-steel transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-industrial-blue" />
                  </span>
                </Link>
              ))}
            </div>

            <Link to="/business-opportunities" className="btn-corporate mt-9">
              {copy.cta}
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        </div>
      </div>
    </section>
  )
}
