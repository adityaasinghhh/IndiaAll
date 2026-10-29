export default function FounderSection({ copy }) {
  return (
    <section id="commitment" className="on-dark relative isolate scroll-mt-32 overflow-hidden bg-charcoal py-20 text-titanium lg:py-28">
      <div
        aria-hidden="true"
        className="absolute inset-y-0 right-0 hidden w-1/3 border-l border-white/10 lg:block"
      />
      <div className="shell relative">
        <div className="grid gap-12 lg:grid-cols-12 lg:gap-16">
          {/* Founder's note */}
          <div className="lg:col-span-5">
            <figure className="flex h-full max-w-md flex-col justify-between border-t border-white/20 pt-6">
              <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-titanium/55">
                {copy.noteLabel}
              </p>
              <blockquote className="mt-10 font-serif text-[clamp(1.6rem,2.4vw,2.2rem)] leading-[1.4] text-off-white">
                “{copy.lead}”
              </blockquote>
              <figcaption className="mt-10 flex flex-col items-start gap-5 border-t border-white/15 pt-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-center gap-5 sm:gap-6">
                  <img
                    src="/images/founder.jpeg"
                    alt="Pramod Kumar, Founder of INDIA ALL"
                    loading="lazy"
                    className="h-[120px] w-[120px] shrink-0 rounded-full object-cover object-top border border-titanium/40 bg-graphite sm:h-[170px] sm:w-[170px]"
                  />
                  <div>
                    <p className="font-serif text-xl text-off-white">{copy.name}</p>
                    <p className="mt-1 text-[10px] uppercase tracking-[0.16em] text-titanium/50">
                      {copy.role}
                    </p>
                  </div>
                </div>
                <span className="font-serif text-3xl italic leading-none text-titanium/25" aria-hidden="true">
                  IA
                </span>
              </figcaption>
            </figure>
          </div>

          {/* Commitment */}
          <div className="lg:col-span-7">
            <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-titanium/55">
              {copy.eyebrow}
            </p>
            <h2 className="display-tight mt-5 text-[clamp(2.1rem,4vw,3.6rem)] text-off-white">
              {copy.title}
            </h2>
            <p className="mt-5 max-w-xl text-sm leading-[1.9] text-titanium/65">{copy.p1}</p>
            <p className="mt-4 max-w-xl text-sm leading-[1.9] text-titanium/65">{copy.p2}</p>

            <div className="mt-11 grid gap-x-8 gap-y-7 sm:grid-cols-2">
              {copy.principles.map((principle, index) => (
                <div key={principle.title} className="border-t border-white/15 pt-5">
                  <p className="font-serif text-sm italic text-titanium/45">
                    {String(index + 1).padStart(2, '0')}
                  </p>
                  <h3 className="mt-2 text-sm font-semibold text-off-white">{principle.title}</h3>
                  <p className="mt-2 text-[13px] leading-6 text-titanium/60">{principle.text}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
