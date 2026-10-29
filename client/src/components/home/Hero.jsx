import { Link } from 'react-router-dom'
import { ArrowRight } from '../ui/Icons'

export default function Hero({ copy }) {
  return (
    <section className="on-dark relative isolate min-h-[calc(100svh-124px)] overflow-hidden bg-charcoal text-off-white">
      <img
        src="/images/editorial/hero.jpg"
        alt={copy.imageAlt}
        className="absolute inset-0 h-full w-full object-cover"
      />
      <div
        aria-hidden="true"
        className="absolute inset-0 bg-gradient-to-r from-charcoal via-charcoal/80 to-charcoal/20"
      />
      <div
        aria-hidden="true"
        className="absolute inset-x-0 bottom-0 h-56 bg-gradient-to-t from-charcoal/85 to-transparent"
      />

      <div className="shell relative z-10 flex min-h-[calc(100svh-124px)] flex-col justify-between pb-8 pt-10 lg:pb-12 lg:pt-14">
        {/* Eyebrow */}
        <div className="flex items-center gap-4 text-[10px] font-semibold uppercase tracking-[0.2em] text-titanium/75">
          <span className="h-px w-10 bg-titanium/50" aria-hidden="true" />
          <p>{copy.eyebrow}</p>
        </div>

        {/* Headline and actions */}
        <div className="max-w-[62rem] py-12 sm:py-16 lg:py-20">
          <h1 className="display text-[clamp(2.7rem,6.5vw,6rem)]">
            <span className="block text-off-white">{copy.titleTop}</span>
            <span className="mt-1 block text-titanium/95">{copy.titleBottom}</span>
          </h1>

          <div className="mt-9 grid gap-8 sm:mt-11 lg:grid-cols-12 lg:items-end">
            <p className="max-w-xl text-[15px] leading-[1.85] text-titanium/80 sm:text-base lg:col-span-6">
              {copy.description}
            </p>

            <div className="flex flex-col gap-3 sm:flex-row lg:col-span-6 lg:justify-end">
              <Link to="/products" className="btn-corporate-light">
                {copy.primary}
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
              <Link to="/contact#trade-enquiry" className="btn-corporate-outline-light">
                {copy.secondary}
              </Link>
            </div>
          </div>
        </div>

        {/* Baseline meta */}
        <div className="flex flex-col gap-3 border-t border-white/20 pt-5 text-[10px] uppercase tracking-[0.18em] text-titanium/60 sm:flex-row sm:items-center sm:justify-between">
          <p>{copy.metaLeft}</p>
          <p>{copy.metaRight}</p>
        </div>
      </div>
    </section>
  )
}
