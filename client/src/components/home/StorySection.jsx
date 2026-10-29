import { Link } from 'react-router-dom'
import { ArrowRight } from '../ui/Icons'

export default function StorySection({ copy, showCta = true }) {
  return (
    <section id="story" className="scroll-mt-32 border-y border-charcoal/10 bg-[#EDEBE5] py-20 lg:py-28">
      <div className="shell">
        <div className="grid gap-12 lg:grid-cols-12 lg:gap-16">
          {/* Imagery */}
          <div className="lg:col-span-7">
            <div className="grid grid-cols-12 gap-4">
              <figure className="col-span-12 sm:col-span-8">
                <div className="media-zoom aspect-[4/5] overflow-hidden bg-graphite">
                  <img
                    src={copy.primaryImage}
                    alt={copy.primaryAlt}
                    loading="lazy"
                    className="h-full w-full object-cover"
                  />
                </div>
                <figcaption className="mt-3 text-[10px] uppercase tracking-[0.14em] text-steel">
                  {copy.primaryCaption}
                </figcaption>
              </figure>

              <figure className="col-span-12 self-end sm:col-span-4 sm:pb-8">
                <div className="media-zoom aspect-[3/4] overflow-hidden bg-graphite">
                  <img
                    src={copy.secondaryImage}
                    alt={copy.secondaryAlt}
                    loading="lazy"
                    className="h-full w-full object-cover"
                  />
                </div>
                <figcaption className="mt-3 text-[10px] uppercase tracking-[0.14em] text-steel">
                  {copy.secondaryCaption}
                </figcaption>
              </figure>
            </div>
          </div>

          {/* Narrative */}
          <div className="lg:col-span-5 lg:pt-6">
            <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-industrial-blue">
              {copy.eyebrow}
            </p>
            <h2 className="display-tight mt-5 text-[clamp(2.1rem,3.8vw,3.4rem)] text-charcoal">
              {copy.title}
            </h2>
            <p className="mt-7 font-serif text-xl leading-[1.45] text-charcoal/90">{copy.lead}</p>
            <p className="mt-5 text-sm leading-[1.85] text-body-text/75">{copy.p1}</p>
            <p className="mt-4 text-sm leading-[1.85] text-body-text/75">{copy.p2}</p>

            <ol className="mt-10 border-t border-charcoal/15">
              {copy.milestones.map((milestone) => (
                <li key={milestone.year} className="grid grid-cols-12 gap-4 border-b border-charcoal/15 py-5">
                  <p className="col-span-3 font-serif text-2xl text-industrial-blue sm:text-3xl">
                    {milestone.year}
                  </p>
                  <div className="col-span-9">
                    <h3 className="text-sm font-semibold text-charcoal">{milestone.title}</h3>
                    <p className="mt-1.5 text-[13px] leading-6 text-body-text/70">{milestone.text}</p>
                  </div>
                </li>
              ))}
            </ol>

            {showCta && (
              <Link to="/our-story" className="link-arrow mt-8">
                {copy.cta}
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            )}
          </div>
        </div>
      </div>
    </section>
  )
}
