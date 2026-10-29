import { Link } from 'react-router-dom'
import { ArrowUpRight } from '../ui/Icons'

function CommodityTile({ category, index, className = '', tall = false }) {
  return (
    <article className={`group relative isolate overflow-hidden bg-charcoal ${className}`}>
      <img
        src={category.image}
        alt={category.alt}
        loading="lazy"
        className="absolute inset-0 h-full w-full object-cover transition-transform duration-[900ms] ease-out group-hover:scale-[1.04]"
      />
      <div
        aria-hidden="true"
        className="absolute inset-0 bg-gradient-to-t from-charcoal/95 via-charcoal/45 to-charcoal/5 transition-opacity duration-500 group-hover:from-charcoal"
      />
      <div
        aria-hidden="true"
        className="absolute inset-x-0 top-0 h-32 bg-gradient-to-b from-charcoal/65 to-transparent"
      />

      <div className={`pointer-events-none relative z-20 flex h-full flex-col justify-between p-6 sm:p-8 ${tall ? 'min-h-[480px]' : 'min-h-[360px] sm:min-h-[400px]'}`}>
        <div className="flex items-start justify-between gap-4">
          <p className="font-serif text-sm italic text-titanium/80">
            {String(index + 1).padStart(2, '0')}
          </p>
          <span className="flex h-9 w-9 items-center justify-center border border-white/25 text-off-white transition-colors duration-300 group-hover:border-off-white group-hover:bg-off-white group-hover:text-charcoal">
            <ArrowUpRight className="h-4 w-4" />
          </span>
        </div>

        <div>
          <h3 className="font-serif text-[clamp(1.6rem,2.5vw,2.35rem)] leading-[1.08] text-off-white">
            {category.name}
          </h3>
          <p className="mt-3 max-w-md text-[13px] leading-6 text-titanium/75">
            {category.description}
          </p>
          <span className="mt-5 inline-flex items-center gap-2 border-b border-white/35 pb-1 text-[10px] font-semibold uppercase tracking-[0.16em] text-off-white">
            {category.linkLabel}
            <ArrowUpRight className="h-3 w-3" />
          </span>
        </div>
      </div>

      <Link to={category.href} className="absolute inset-0 z-10" aria-label={category.name} />
    </article>
  )
}

export default function CommodityGrid({ copy }) {
  const [first, second, third, fourth, fifth] = copy.categories

  return (
    <section id="commodities" className="scroll-mt-32 bg-off-white pb-20 pt-4 lg:pb-28 lg:pt-8">
      <div className="shell">
        <div className="rule flex flex-col gap-8 pt-8 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-2xl">
            <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-industrial-blue">
              {copy.eyebrow}
            </p>
            <h2 className="display-tight mt-5 text-[clamp(2rem,3.8vw,3.4rem)] text-charcoal">
              {copy.title}
            </h2>
          </div>
          <div className="max-w-sm lg:pb-1">
            <p className="text-sm leading-7 text-body-text/70">{copy.intro}</p>
            <Link to="/products" className="link-arrow mt-5">
              {copy.viewAll}
              <ArrowUpRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        </div>

        <div className="mt-10 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-12">
          <CommodityTile category={first} index={0} className="sm:col-span-2 lg:col-span-7" tall />
          <CommodityTile category={second} index={1} className="lg:col-span-5" tall />
          <CommodityTile category={third} index={2} className="lg:col-span-5" />
          <CommodityTile category={fourth} index={3} className="lg:col-span-7" />
          <CommodityTile category={fifth} index={4} className="sm:col-span-2 lg:col-span-12" />
        </div>
      </div>
    </section>
  )
}
