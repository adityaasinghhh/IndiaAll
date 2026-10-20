import { Link } from 'react-router-dom'
import { useLanguage } from '../context/LanguageContext'

export default function ProductCard({ product }) {
  const { t } = useLanguage()
  const enquiryTo = `/enquiry?product=${product.slug}`
  const categoryLabel = t.products.categories[product.category] || product.category

  return (
    <article className="product-card group relative flex h-full flex-col overflow-visible rounded-xl border border-border-light bg-white shadow-card transition-all duration-300 ease-out hover:-translate-y-2 hover:scale-[1.02] hover:border-gold hover:shadow-card-hover focus-within:-translate-y-2 focus-within:scale-[1.02] focus-within:border-gold focus-within:shadow-card-hover">
      {/* Image */}
      <Link
        to={enquiryTo}
        className="product-card__image relative block aspect-[4/3] overflow-hidden rounded-t-xl bg-surface"
        aria-label={`${product.name} — ${t.products.enquireNow}`}
      >
        <img
          src={product.image}
          alt={`${product.name} product`}
          loading="lazy"
          className="h-full w-full object-cover transition-transform duration-500 ease-out [@media(hover:none)]:group-hover:scale-100"
          onError={(event) => {
            event.currentTarget.onerror = null
            event.currentTarget.src = '/images/products/pexels-3000028.jpg'
          }}
        />
        <span className="absolute left-3 top-3 rounded-full border border-gold/50 bg-charcoal/85 px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-off-white backdrop-blur-sm transition-all duration-300 group-hover:border-gold group-hover:bg-charcoal group-focus-within:border-gold group-focus-within:bg-charcoal">
          {categoryLabel}
        </span>
      </Link>

      {/* Body */}
      <div className="flex flex-1 flex-col p-5">
        <h3 className="mb-2 font-serif text-xl font-bold leading-snug text-charcoal transition-colors duration-300 group-hover:text-industrial-blue group-focus-within:text-industrial-blue">
          <Link
            to={enquiryTo}
            className="transition-colors hover:text-industrial-blue focus-visible:text-industrial-blue"
          >
            {product.name}
          </Link>
        </h3>

        {/* Short description — always visible */}
        <p className="mb-3 text-sm font-medium leading-6 text-text-secondary line-clamp-2">
          {product.description}
        </p>

        {/* Extra details — revealed on hover/focus */}
        <div className="product-card__extra-details mb-3 opacity-0 translate-y-2 transition-all duration-300 ease-out group-hover:opacity-100 group-hover:translate-y-0 group-focus-within:opacity-100 group-focus-within:translate-y-0 [@media(hover:none)]:opacity-100 [@media(hover:none)]:translate-y-0">
          <p className="text-sm font-medium leading-6 text-steel line-clamp-3 border-t border-border-light pt-3">
            {product.description}
          </p>
        </div>

        {product.origin && (
          <p className="mb-4 flex items-start gap-1.5 text-xs font-medium leading-5 text-text-muted">
            <svg
              className="mt-0.5 h-3.5 w-3.5 shrink-0 text-industrial-blue"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
              />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 1 1-6 0 3 3 0 0 1 6 0z" />
            </svg>
            {product.origin}
          </p>
        )}
        <Link
          to={enquiryTo}
          className="btn-primary mt-auto w-full disabled:cursor-not-allowed"
          tabIndex={0}
        >
          {t.products.enquireNow}
          <svg
            className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-0.5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
          </svg>
        </Link>
      </div>
    </article>
  )
}
