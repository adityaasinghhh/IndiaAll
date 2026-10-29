import { Link } from 'react-router-dom'
import { useLanguage } from '../context/LanguageContext'
import { ArrowUpRight } from './ui/Icons'

export default function ProductCard({ product }) {
  const { t } = useLanguage()
  const enquiryTo = `/enquiry?product=${product.slug}`
  const categoryLabel = t.products.categories[product.category] || product.category

  return (
    <article className="group flex h-full flex-col border-t border-charcoal/20 pt-4">
      <Link
        to={enquiryTo}
        className="relative block aspect-[4/3] overflow-hidden bg-titanium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-industrial-blue focus-visible:ring-offset-4"
        aria-label={`${product.name} — ${t.products.enquireNow}`}
      >
        <img
          src={product.image}
          alt={product.name}
          loading="lazy"
          className="h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-[1.035]"
          onError={(event) => {
            event.currentTarget.onerror = null
            event.currentTarget.src = '/images/products/pexels-3000028.jpg'
          }}
        />
        <span className="absolute bottom-0 right-0 flex h-10 w-10 items-center justify-center bg-off-white text-charcoal transition-colors duration-300 group-hover:bg-industrial-blue group-hover:text-off-white">
          <ArrowUpRight className="h-4 w-4" />
        </span>
      </Link>

      <div className="flex flex-1 flex-col pt-4">
        <p className="text-[9px] font-semibold uppercase tracking-[0.16em] text-steel">
          {categoryLabel}
        </p>
        <h3 className="mt-2 font-serif text-[1.3rem] leading-[1.2] text-charcoal transition-colors group-hover:text-industrial-blue">
          <Link
            to={enquiryTo}
            className="focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-industrial-blue focus-visible:ring-offset-2"
          >
            {product.name}
          </Link>
        </h3>
        <p className="mt-2 text-[13px] leading-6 text-body-text/65 line-clamp-2">
          {product.description}
        </p>

        <div className="mt-auto pt-5">
          {product.origin && (
            <p className="border-t border-charcoal/10 pt-3 text-[10px] leading-5 text-steel">
              {product.origin}
            </p>
          )}
          <Link
            to={enquiryTo}
            className="mt-3 inline-flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.14em] text-charcoal transition-colors hover:text-industrial-blue"
          >
            {t.products.enquireNow}
            <ArrowUpRight className="h-3 w-3" />
          </Link>
        </div>
      </div>
    </article>
  )
}
