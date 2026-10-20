import { useMemo, useState } from 'react'
import { useLanguage } from '../context/LanguageContext'
import { products, categories } from '../data/products'
import ProductCard from './ProductCard'

export default function ProductGrid() {
  const { t } = useLanguage()

  // Filters state managed internally
  const [activeCategory, setActiveCategory] = useState('all')
  const [query, setQuery] = useState('')
  const [sort, setSort] = useState('name-asc')
  const [page, setPage] = useState(1)

  // Filter products based on internal state
  const filtered = useMemo(() => {
    let list = products.filter((p) => p.visible)

    if (activeCategory && activeCategory !== 'all') {
      list = list.filter((p) => p.category === activeCategory)
    }

    const q = (query || '').trim().toLowerCase()
    if (q) {
      list = list.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.description.toLowerCase().includes(q) ||
          (p.origin || '').toLowerCase().includes(q)
      )
    }

    // Sort
    const sorted = [...list]
    if (sort === 'name-asc') sorted.sort((a, b) => a.name.localeCompare(b.name))
    if (sort === 'name-desc') sorted.sort((a, b) => b.name.localeCompare(a.name))
    return sorted
  }, [activeCategory, query, sort])

  // Pagination
  const PAGE_SIZE = 12
  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE))
  const currentPage = Math.min(page, totalPages)
  const pageItems = filtered.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE)

  const clearFilters = () => {
    setActiveCategory('all')
    setQuery('')
    setSort('name-asc')
    setPage(1)
  }

  const hasActiveFilters = activeCategory !== 'all' || query.trim() !== '' || sort !== 'name-asc'

  return (
    <div className="py-4">
      {/* ====== Filter Bar ====== */}
      <div className="mb-8 space-y-4">
        {/* Search + Sort Row */}
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          {/* Search */}
          <div className="relative flex-1">
            <label htmlFor="product-search" className="sr-only">
              {t.products.searchLabel}
            </label>
            <svg
              className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-text-muted"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 1 1-14 0 7 7 0 0 1 14 0z" />
            </svg>
            <input
              id="product-search"
              type="search"
              value={query}
              onChange={(e) => { setQuery(e.target.value); setPage(1) }}
              placeholder={t.products.searchPlaceholder}
              className="input-base pl-10"
            />
          </div>

          {/* Sort */}
          <div className="sm:w-48">
            <label htmlFor="product-sort" className="sr-only">
              {t.products.sortLabel}
            </label>
            <select
              id="product-sort"
              value={sort}
              onChange={(e) => { setSort(e.target.value); setPage(1) }}
              className="input-base"
            >
              <option value="name-asc">{t.products.sortNameAsc}</option>
              <option value="name-desc">{t.products.sortNameDesc}</option>
            </select>
          </div>
        </div>

        {/* Category Filters */}
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs font-semibold uppercase tracking-wider text-text-muted">
            {t.products.filterByCategory}
          </span>
          {categories.map((cat) => (
            <button
              key={cat.id}
              type="button"
              onClick={() => { setActiveCategory(cat.id); setPage(1) }}
              className={`rounded-full px-4 py-2 text-xs font-semibold transition-all ${
                activeCategory === cat.id
                  ? 'bg-charcoal text-off-white shadow-sm'
                  : 'bg-white text-body-text border border-border-light hover:border-charcoal hover:text-charcoal'
              }`}
              aria-pressed={activeCategory === cat.id}
            >
              {t.products.categories[cat.id] || cat.id}
            </button>
          ))}
        </div>

        {/* Results Count + Clear */}
        <div className="flex items-center justify-between">
          <p className="text-sm font-medium text-text-secondary">
            {t.products.showingResults.replace('{count}', filtered.length)}
          </p>
          {hasActiveFilters && (
            <button
              type="button"
              onClick={clearFilters}
              className="text-sm font-semibold text-industrial-blue hover:text-charcoal transition-colors"
            >
              {t.products.clearFilters}
            </button>
          )}
        </div>
      </div>

      {/* ====== Product Grid ====== */}
      {pageItems.length > 0 ? (
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {pageItems.map((product) => (
            <div key={product.id} className="overflow-visible">
              <ProductCard product={product} />
            </div>
          ))}
        </div>
      ) : (
        /* ====== Empty State ====== */
        <div className="flex flex-col items-center justify-center rounded-xl border border-border-light bg-white py-16 px-6 text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-charcoal/5">
            <svg className="h-7 w-7 text-text-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 1 1-14 0 7 7 0 0 1 14 0z" />
            </svg>
          </div>
          <h3 className="font-serif text-lg font-bold text-charcoal mb-2">{t.products.noResults}</h3>
          <p className="text-sm font-medium text-text-secondary mb-6 max-w-sm">{t.products.noResultsHint}</p>
          <button
            type="button"
            onClick={clearFilters}
            className="btn-primary"
          >
            {t.products.clearFilters}
          </button>
        </div>
      )}

      {/* ====== Pagination ====== */}
      {totalPages > 1 && (
        <div className="mt-8 flex items-center justify-center gap-2">
          <button
            type="button"
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={currentPage === 1}
            className="inline-flex items-center gap-1 rounded-lg border border-border-light bg-white px-4 py-2 text-sm font-semibold text-body-text transition-all hover:border-charcoal hover:text-charcoal disabled:cursor-not-allowed disabled:opacity-40"
            aria-label={t.products.prev}
          >
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            {t.products.prev}
          </button>
          <span className="text-sm font-medium text-text-secondary">
            {currentPage} / {totalPages}
          </span>
          <button
            type="button"
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={currentPage === totalPages}
            className="inline-flex items-center gap-1 rounded-lg border border-border-light bg-white px-4 py-2 text-sm font-semibold text-body-text transition-all hover:border-charcoal hover:text-charcoal disabled:cursor-not-allowed disabled:opacity-40"
            aria-label={t.products.next}
          >
            {t.products.next}
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>
      )}
    </div>
  )
}
