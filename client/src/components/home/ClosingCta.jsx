import { Link } from 'react-router-dom'
import { ArrowRight } from '../ui/Icons'

export default function ClosingCta({
  eyebrow,
  title,
  text,
  primary = { to: '/contact#trade-enquiry', label: 'Discuss Your Requirements' },
  secondary,
  image = '/images/editorial/terminal.jpg',
  imageAlt = 'Container terminal at dusk',
}) {
  return (
    <section className="on-dark relative isolate overflow-hidden bg-charcoal py-20 text-off-white lg:py-24">
      <img
        src={image}
        alt={imageAlt}
        loading="lazy"
        className="absolute inset-0 h-full w-full object-cover opacity-30"
      />
      <div aria-hidden="true" className="absolute inset-0 bg-gradient-to-r from-charcoal via-charcoal/90 to-charcoal/50" />

      <div className="shell relative z-10">
        <div className="grid gap-8 lg:grid-cols-12 lg:items-end">
          <div className="lg:col-span-8">
            {eyebrow && (
              <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-titanium/55">
                {eyebrow}
              </p>
            )}
            <h2 className="display-tight mt-4 max-w-3xl text-[clamp(2.1rem,4vw,3.6rem)] text-off-white">
              {title}
            </h2>
            {text && (
              <p className="mt-5 max-w-xl text-sm leading-[1.9] text-titanium/70">{text}</p>
            )}
          </div>

          <div className="flex flex-col gap-3 sm:flex-row lg:col-span-4 lg:justify-end">
            <Link to={primary.to} className="btn-corporate-light">
              {primary.label}
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
            {secondary && (
              <Link to={secondary.to} className="btn-corporate-outline-light">
                {secondary.label}
              </Link>
            )}
          </div>
        </div>
      </div>
    </section>
  )
}
