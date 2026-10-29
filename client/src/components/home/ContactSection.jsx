import TradeEnquiryForm from '../forms/TradeEnquiryForm'
import { ArrowUpRight } from '../ui/Icons'

export default function ContactSection({ copy, heading = copy.title, id = 'trade-enquiry' }) {
  return (
    <section id={id} className="on-dark scroll-mt-32 bg-charcoal py-20 text-titanium lg:py-28">
      <div className="shell">
        <div className="grid gap-12 lg:grid-cols-12 lg:gap-16">
          <div className="lg:col-span-5">
            <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-titanium/55">
              {copy.eyebrow}
            </p>
            <h2 className="display-tight mt-5 text-[clamp(2.1rem,4.2vw,3.6rem)] text-off-white">
              {heading}
            </h2>
            <p className="mt-6 max-w-md text-sm leading-[1.9] text-titanium/70">{copy.intro}</p>

            <div className="mt-10 border-t border-white/15 pt-6">
              <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-titanium/45">
                {copy.emailLabel}
              </p>
              <a
                href={`mailto:${copy.email}`}
                className="mt-2 inline-flex items-center gap-2 font-serif text-2xl text-off-white transition-colors hover:text-titanium"
              >
                {copy.email}
                <ArrowUpRight className="h-4 w-4" />
              </a>
            </div>

            <div className="mt-10">
              <h3 className="text-[10px] font-semibold uppercase tracking-[0.16em] text-titanium/45">
                {copy.stepsTitle}
              </h3>
              <ol className="mt-4 space-y-4">
                {copy.steps.map((step, index) => (
                  <li key={step} className="grid grid-cols-[1.5rem_1fr] gap-3">
                    <span className="font-serif text-sm italic text-titanium/40">
                      {String(index + 1).padStart(2, '0')}
                    </span>
                    <span className="text-[13px] leading-6 text-titanium/70">{step}</span>
                  </li>
                ))}
              </ol>
            </div>
          </div>

          <div className="lg:col-span-7">
            <TradeEnquiryForm />
          </div>
        </div>
      </div>
    </section>
  )
}
