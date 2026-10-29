export default function Capabilities({ copy }) {
  return (
    <section id="capabilities" className="scroll-mt-32 bg-off-white py-20 lg:py-28">
      <div className="shell">
        <div className="grid gap-12 lg:grid-cols-12 lg:gap-16">
          {/* Image */}
          <div className="lg:col-span-5">
            <figure>
              <div className="media-zoom aspect-[4/5] overflow-hidden bg-graphite">
                <img
                  src={copy.image}
                  alt={copy.imageAlt}
                  loading="lazy"
                  className="h-full w-full object-cover"
                />
              </div>
              <figcaption className="mt-4 flex items-center gap-3 text-[10px] uppercase tracking-[0.16em] text-steel">
                <span className="h-px w-6 bg-steel/50" aria-hidden="true" />
                {copy.imageCaption}
              </figcaption>
            </figure>
          </div>

          {/* Content */}
          <div className="lg:col-span-7 lg:pl-4">
            <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-industrial-blue">
              {copy.eyebrow}
            </p>
            <h2 className="display-tight mt-5 max-w-2xl text-[clamp(2rem,3.6vw,3.25rem)] text-charcoal">
              {copy.title}
            </h2>
            <p className="body-copy mt-6 max-w-xl">{copy.intro}</p>

            <ol className="mt-12 border-t border-charcoal/15">
              {copy.steps.map((step) => (
                <li
                  key={step.number}
                  className="grid gap-3 border-b border-charcoal/15 py-7 sm:grid-cols-12 sm:gap-6"
                >
                  <p className="font-serif text-sm italic text-industrial-blue sm:col-span-2">
                    {step.number}
                  </p>
                  <h3 className="font-serif text-2xl leading-tight text-charcoal sm:col-span-4">
                    {step.title}
                  </h3>
                  <p className="text-sm leading-7 text-body-text/75 sm:col-span-6">{step.text}</p>
                </li>
              ))}
            </ol>

            <p className="mt-8 max-w-xl border-l-2 border-industrial-blue pl-5 text-xs leading-6 text-steel">
              {copy.note}
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}
