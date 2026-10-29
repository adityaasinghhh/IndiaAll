export default function PresenceSection({ copy }) {
  return (
    <section id="presence" className="scroll-mt-32 border-y border-charcoal/10 bg-[#EDEBE5] py-20 lg:py-24">
      <div className="shell">
        <div className="grid gap-10 lg:grid-cols-12 lg:items-end">
          <div className="lg:col-span-7">
            <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-industrial-blue">
              {copy.eyebrow}
            </p>
            <h2 className="display-tight mt-5 max-w-2xl text-[clamp(2rem,3.6vw,3.2rem)] text-charcoal">
              {copy.title}
            </h2>
          </div>
          <div className="lg:col-span-5">
            <p className="text-sm leading-7 text-body-text/70">{copy.intro}</p>
            <p className="mt-4 text-[10px] font-semibold uppercase tracking-[0.16em] text-steel">
              {copy.established}
            </p>
          </div>
        </div>

        <div className="mt-12 grid gap-px border-y border-charcoal/15 bg-charcoal/15 md:grid-cols-3">
          {copy.locations.map((location, index) => (
            <div key={location.country} className="bg-[#EDEBE5] px-1 py-8 md:px-6 md:py-9">
              <p className="font-serif text-xs italic text-industrial-blue">
                {String(index + 1).padStart(2, '0')}
              </p>
              <h3 className="mt-4 font-serif text-[clamp(1.8rem,3vw,2.6rem)] leading-none text-charcoal">
                {location.country}
              </h3>
              <p className="mt-3 text-[10px] font-semibold uppercase tracking-[0.16em] text-steel">
                {location.region}
              </p>
              <p className="mt-5 max-w-[15rem] border-t border-charcoal/15 pt-4 text-[13px] leading-6 text-body-text/70">
                {location.address}
              </p>
            </div>
          ))}
        </div>

        <p className="mt-6 max-w-3xl text-[11px] leading-6 text-steel">{copy.note}</p>
      </div>
    </section>
  )
}
