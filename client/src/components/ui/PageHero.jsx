import { ArrowRight } from './Icons'

/**
 * Editorial page masthead used across the interior pages.
 * A single photograph, a restrained charcoal wash and typographic hierarchy.
 */
export default function PageHero({
  eyebrow,
  title,
  intro,
  image = '/images/editorial/port.jpg',
  imageAlt = '',
  meta,
  compact = false,
  children,
}) {
  return (
    <section
      className={`on-dark relative isolate overflow-hidden bg-charcoal text-off-white ${
        compact ? 'min-h-[420px]' : 'min-h-[520px] lg:min-h-[600px]'
      }`}
    >
      <img
        src={image}
        alt={imageAlt}
        className="absolute inset-0 h-full w-full object-cover"
      />
      <div
        aria-hidden="true"
        className="absolute inset-0 bg-gradient-to-r from-charcoal via-charcoal/80 to-charcoal/25"
      />
      <div
        aria-hidden="true"
        className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-charcoal/70 to-transparent"
      />

      <div
        className={`shell relative z-10 flex flex-col justify-end ${
          compact ? 'min-h-[420px] pb-12 pt-24' : 'min-h-[520px] pb-14 pt-28 lg:min-h-[600px] lg:pb-20'
        }`}
      >
        <p className="flex items-center gap-3 text-[10px] font-semibold uppercase tracking-[0.2em] text-titanium/80">
          <span className="h-px w-8 bg-titanium/50" aria-hidden="true" />
          {eyebrow}
        </p>

        <h1 className="display mt-6 max-w-4xl text-[clamp(2.5rem,6vw,4.75rem)] text-off-white">
          {title}
        </h1>

        {intro && (
          <p className="mt-6 max-w-2xl text-[15px] leading-[1.8] text-titanium/80 sm:text-base">
            {intro}
          </p>
        )}

        {children && <div className="mt-9 flex flex-wrap items-center gap-3">{children}</div>}

        {meta && (
          <div className="mt-12 flex flex-wrap items-center gap-x-6 gap-y-2 border-t border-white/15 pt-5 text-[10px] uppercase tracking-[0.16em] text-titanium/60">
            {meta.map((item) => (
              <span key={item} className="flex items-center gap-2">
                <ArrowRight className="h-3 w-3 text-titanium/40" />
                {item}
              </span>
            ))}
          </div>
        )}
      </div>
    </section>
  )
}
