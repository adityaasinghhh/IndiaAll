import { useMemo, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { useLanguage } from '../context/LanguageContext'
import { products, categories } from '../data/products'
import ProductCard from './ProductCard'
import { ArrowRight } from './ui/Icons'

const PAGE_SIZE = 12

function SelectChevron() {
  return (
    <svg
      className="pointer-events-none absolute right-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-steel"
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
      aria-hidden="true"
    >
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.6} d="m6 9 6 6 6-6" />
    </svg>
  )
}

export default function ProductGrid() {
  const { t } = useLanguage()
  const [searchParams, setSearchParams] = useSearchParams()

  const categoryParam = searchParams.get('category')
  const activeCategory = categories.some((category) => category.id === categoryParam)
    ? categoryParam
    : 'all'

  const [query, setQuery] = useState('')
  const [sort, setSort] = useState('name-asc')
  const [page, setPage] = useState(1)

  const setCategory = (category) => {
    const next = new URLSearchParams(searchParams)
    if (category === 'all') next.delete('category')
    else next.set('category', category)
    setSearchParams(next, { replace: true })
    setPage(1)
  }

  const filtered = useMemo(() => {
    let list = products.filter((product) => product.visible)

    if (activeCategory !== 'all') {
      list = list.filter((product) => product.category === activeCategory)
    }

    const term = query.trim().toLowerCase()
    if (term) {
      list = list.filter(
        (product) =>
          product.name.toLowerCase().includes(term) ||
          product.description.toLowerCase().includes(term) ||
          (product.origin || '').toLowerCase().includes(term)
      )
    }

    const sorted = [...list]
    if (sort === 'name-asc') sorted.sort((a, b) => a.name.localeCompare(b.name))
    if (sort === 'name-desc') sorted.sort((a, b) => b.name.localeCompare(a.name))
    return sorted
  }, [activeCategory, query, sort])

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE))
  const currentPage = Math.min(page, totalPages)
  const pageItems = filtered.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE)

  const clearFilters = () => {
    setSearchParams({}, { replace: true })
    setQuery('')
    setSort('name-asc')
    setPage(1)
  }

  const hasActiveFilters = activeCategory !== 'all' || query.trim() !== '' || sort !== 'name-asc'

  return (
    <div>
      {/* Search and sort */}
      <div className="flex flex-col gap-4 border-b border-charcoal/15 pb-5 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative w-full sm:max-w-xs">
          <label htmlFor="product-search" className="sr-only">
            {t.products.searchLabel}
          </label>
          <svg
            className="pointer-events-none absolute left-0 top-1/2 h-4 w-4 -translate-y-1/2 text-steel"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="m21 21-4.35-4.35M17 10.5a6.5 6.5 0 1 1-13 0 6.5 6.5 0 0 1 13 0Z" />
          </svg>
          <input
            id="product-search"
            type="search"
            value={query}
            onChange={(event) => {
              setQuery(event.target.value)
              setPage(1)
            }}
            placeholder={t.products.searchPlaceholder}
            className="w-full border-0 border-b border-transparent bg-transparent py-2 pl-6 text-sm text-body-text placeholder:text-steel/70 focus:border-industrial-blue focus:outline-none focus:ring-0"
          />
        </div>

        <div className="flex items-center gap-5">
          <p className="text-[10px] uppercase tracking-[0.14em] text-steel">
            {t.products.showingResults.replace('{count}', filtered.length)}
          </p>
          <div className="relative">
            <label htmlFor="product-sort" className="sr-only">
              {t.products.sortLabel}
            </label>
            <select
              id="product-sort"
              value={sort}
              onChange={(event) => {
                setSort(event.target.value)
                setPage(1)
              }}
              className="cursor-pointer appearance-none border-0 border-b border-charcoal/25 bg-transparent py-2 pl-0 pr-6 text-[10px] font-semibold uppercase tracking-[0.12em] text-charcoal focus:border-industrial-blue focus:outline-none focus:ring-0"
            >
              <option value="name-asc">{t.products.sortNameAsc}</option>
              <option value="name-desc">{t.products.sortNameDesc}</option>
            </select>
            <SelectChevron />
          </div>
        </div>
      </div>

      {/* Categories */}
      <div className="mt-6 flex flex-wrap items-center gap-x-6 gap-y-3">
        {categories.map((category) => {
          const isActive = activeCategory === category.id
          return (
            <button
              key={category.id}
              type="button"
              onClick={() => setCategory(category.id)}
              aria-pressed={isActive}
              className={`border-b pb-1 text-[10px] font-semibold uppercase tracking-[0.14em] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-industrial-blue focus-visible:ring-offset-4 ${
                isActive
                  ? 'border-industrial-blue text-industrial-blue'
                  : 'border-transparent text-steel hover:border-charcoal/30 hover:text-charcoal'
              }`}
            >
              {t.products.categories[category.id] || category.id}
            </button>
          )
        })}
        {hasActiveFilters && (
          <button
            type="button"
            onClick={clearFilters}
            className="ml-auto text-[10px] font-semibold uppercase tracking-[0.14em] text-charcoal underline decoration-charcoal/30 underline-offset-4 transition-colors hover:text-industrial-blue"
          >
            {t.products.clearFilters}
          </button>
        )}
      </div>

      {/* Grid */}
      {pageItems.length > 0 ? (
        <div className="mt-10 grid grid-cols-1 gap-x-6 gap-y-12 sm:grid-cols-2 lg:grid-cols-3">
          {pageItems.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      ) : (
        <div className="mt-10 border border-charcoal/15 bg-white px-6 py-20 text-center">
          <h3 className="font-serif text-2xl text-charcoal">{t.products.noResults}</h3>
          <p className="mx-auto mt-3 max-w-sm text-sm leading-7 text-body-text/65">
            {t.products.noResultsHint}
          </p>
          <button type="button" onClick={clearFilters} className="btn-corporate mt-7">
            {t.products.clearFilters}
            <ArrowRight className="h-3.5 w-3.5" />
          </button>
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="mt-14 flex items-center justify-between border-t border-charcoal/15 pt-6">
          <button
            type="button"
            onClick={() => setPage(Math.max(1, currentPage - 1))}
            disabled={currentPage === 1}
            className="inline-flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.14em] text-charcoal transition-colors hover:text-industrial-blue disabled:cursor-not-allowed disabled:opacity-35"
          >
            <ArrowRight className="h-3.5 w-3.5 rotate-180" />
            {t.products.prev}
          </button>
          <p className="text-[10px] uppercase tracking-[0.14em] text-steel">
            {currentPage} / {totalPages}
          </p>
          <button
            type="button"
            onClick={() => setPage(Math.min(totalPages, currentPage + 1))}
            disabled={currentPage === totalPages}
            className="inline-flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.14em] text-charcoal transition-colors hover:text-industrial-blue disabled:cursor-not-allowed disabled:opacity-35"
          >
            {t.products.next}
            <ArrowRight className="h-3.5 w-3.5" />
          </button>
        </div>
      )}
    </div>
  )
}
