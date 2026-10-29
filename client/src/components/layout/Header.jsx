import { useEffect, useRef, useState } from 'react'
import { Link, NavLink, useLocation } from 'react-router-dom'
import { useLanguage } from '../../context/LanguageContext'
import { useAuth } from '../../context/AuthContext'
import { getSiteContent } from '../../data/siteContent'
import LanguageSwitcher from './LanguageSwitcher'

function IndiaAllLogo() {
  return (
    <Link to="/" className="flex shrink-0 items-center" aria-label="INDIA ALL — home">
      <div className="flex flex-col items-center">
        <img
          src="/images/india-all-logo.png"
          alt="INDIA ALL"
          className="h-[108px] w-auto object-contain md:h-[108px]"
        />
      </div>
    </Link>
  )
}

function ArrowRight({ className = 'h-4 w-4' }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.6} d="M5 12h14m-5-5 5 5-5 5" />
    </svg>
  )
}

function Chevron({ open = false }) {
  return (
    <svg
      className={`h-3.5 w-3.5 transition-transform duration-200 ${open ? 'rotate-180' : ''}`}
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
      aria-hidden="true"
    >
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="m6 9 6 6 6-6" />
    </svg>
  )
}

export default function Header() {
  const { lang } = useLanguage()
  const { customer, loading } = useAuth()
  const location = useLocation()
  const copy = getSiteContent(lang)

  const [mobileOpen, setMobileOpen] = useState(false)
  const [productsOpen, setProductsOpen] = useState(false)
  const [mobileProductsOpen, setMobileProductsOpen] = useState(false)
  const dropdownRef = useRef(null)
  const mobilePanelRef = useRef(null)
  const mobileToggleRef = useRef(null)

  const navLinks = [
    { to: '/about', label: copy.nav.about },
    { to: '/products', label: copy.nav.products, hasMenu: true },
    { to: '/global-sourcing', label: copy.nav.sourcing },
    { to: '/business-opportunities', label: copy.nav.opportunities },
    { to: '/our-story', label: copy.nav.story },
    { to: '/contact', label: copy.nav.contact },
  ]

  useEffect(() => {
    setMobileOpen(false)
    setProductsOpen(false)
    setMobileProductsOpen(false)
  }, [location.pathname, location.search])

  useEffect(() => {
    if (!productsOpen) return undefined

    const handlePointerDown = (event) => {
      if (!dropdownRef.current?.contains(event.target)) setProductsOpen(false)
    }
    const handleKeyDown = (event) => {
      if (event.key === 'Escape') {
        setProductsOpen(false)
        dropdownRef.current?.querySelector('[data-products-trigger]')?.focus()
      }
    }

    document.addEventListener('pointerdown', handlePointerDown)
    document.addEventListener('keydown', handleKeyDown)
    return () => {
      document.removeEventListener('pointerdown', handlePointerDown)
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [productsOpen])

  useEffect(() => {
    if (!mobileOpen) return undefined

    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    const handleKeyDown = (event) => {
      if (event.key === 'Escape') {
        setMobileOpen(false)
        mobileToggleRef.current?.focus()
      }
    }
    document.addEventListener('keydown', handleKeyDown)
    return () => {
      document.body.style.overflow = previousOverflow
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [mobileOpen])

  const closeMobile = () => {
    setMobileOpen(false)
    mobileToggleRef.current?.focus()
  }

  const closeProducts = () => setProductsOpen(false)

  const desktopNavLink = ({ isActive }) =>
    `relative py-2 text-[12.5px] font-medium tracking-[0.005em] transition-colors ${
      isActive ? 'text-charcoal' : 'text-graphite hover:text-industrial-blue'
    } after:absolute after:-bottom-0.5 after:left-0 after:h-px after:w-full after:origin-left after:bg-industrial-blue after:transition-transform after:duration-300 ${
      isActive ? 'after:scale-x-100' : 'after:scale-x-0 hover:after:scale-x-100'
    } focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-industrial-blue focus-visible:ring-offset-4`

  return (
    <header className="sticky top-0 z-50 border-b border-charcoal/10 bg-off-white/95 backdrop-blur-md">
      {/* Utility strip */}
      <div className="hidden bg-charcoal text-titanium xl:block">
        <div className="shell flex h-9 items-center justify-between text-[10px] font-medium uppercase tracking-[0.16em]">
          <p>{copy.utility.tagline}</p>
          <div className="flex items-center gap-6">
            <p className="text-titanium/65">{copy.utility.presence}</p>
            <span className="h-3 w-px bg-white/20" aria-hidden="true" />
            <a
              href={`mailto:${copy.contact.email}`}
              className="transition-colors hover:text-off-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-titanium focus-visible:ring-offset-2 focus-visible:ring-offset-charcoal"
            >
              {copy.contact.email}
            </a>
            {!loading && (
              <NavLink
                to={customer ? '/dashboard' : '/login'}
                className="transition-colors hover:text-off-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-titanium focus-visible:ring-offset-2 focus-visible:ring-offset-charcoal"
              >
                {customer ? copy.utility.dashboard : copy.utility.signIn}
              </NavLink>
            )}
            <LanguageSwitcher onDark compact />
          </div>
        </div>
      </div>

      {/* Main navigation */}
      <div className="shell flex h-[124px] items-center justify-between gap-8 lg:h-[128px]">
        <IndiaAllLogo />

        <nav className="hidden items-center gap-6 xl:flex" aria-label="Primary">
          {navLinks.map((link) =>
            link.hasMenu ? (
              <div
                key={link.to}
                ref={dropdownRef}
                className="relative"
                onMouseEnter={() => setProductsOpen(true)}
                onMouseLeave={() => setProductsOpen(false)}
              >
                <div className="flex items-center gap-1.5">
                  <NavLink
                    to={link.to}
                    className={desktopNavLink}
                    aria-current={location.pathname === link.to ? 'page' : undefined}
                  >
                    {link.label}
                  </NavLink>
                  <button
                    type="button"
                    data-products-trigger
                    onClick={() => setProductsOpen((open) => !open)}
                    className="-mr-1 inline-flex h-7 w-5 items-center justify-center text-graphite transition-colors hover:text-industrial-blue focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-industrial-blue focus-visible:ring-offset-2"
                    aria-expanded={productsOpen}
                    aria-controls="products-mega-menu"
                    aria-label={copy.nav.productsLabel}
                  >
                    <Chevron open={productsOpen} />
                  </button>
                </div>

                <div
                  id="products-mega-menu"
                  className={`absolute left-1/2 top-full w-[660px] -translate-x-1/2 pt-4 transition-all duration-200 ${
                    productsOpen
                      ? 'visible translate-y-0 opacity-100'
                      : 'invisible -translate-y-1 opacity-0'
                  }`}
                >
                  <div className="border border-charcoal/10 bg-off-white p-7 shadow-[0_24px_60px_-24px_rgba(32,35,40,0.35)]">
                    <div className="mb-6 flex items-end justify-between gap-6 border-b border-charcoal/10 pb-4">
                      <p className="font-serif text-2xl tracking-[-0.02em] text-charcoal">
                        {copy.nav.products}
                      </p>
                      <Link
                        to="/products"
                        onClick={closeProducts}
                        className="link-arrow"
                      >
                        {copy.nav.viewAll}
                        <ArrowRight className="h-3.5 w-3.5" />
                      </Link>
                    </div>
                    <ul className="grid grid-cols-2 gap-x-8 gap-y-1">
                      {copy.commodities.categories.map((category) => (
                        <li key={category.id}>
                          <Link
                            to={category.href}
                            onClick={closeProducts}
                            className="group flex items-start gap-3 border-b border-charcoal/10 py-3.5 transition-colors hover:border-industrial-blue/40"
                          >
                            <span className="mt-0.5 font-serif text-sm italic text-industrial-blue">
                              {category.id === 'agriculture'
                                ? '01'
                                : category.id === 'metals'
                                  ? '02'
                                  : category.id === 'energy'
                                    ? '03'
                                    : category.id === 'food'
                                      ? '04'
                                      : '05'}
                            </span>
                            <span className="flex-1">
                              <span className="block text-[13px] font-medium leading-5 text-charcoal transition-colors group-hover:text-industrial-blue">
                                {category.name}
                              </span>
                              <span className="mt-0.5 block text-[11px] leading-4 text-steel">
                                {category.linkLabel}
                              </span>
                            </span>
                            <ArrowRight className="mt-1 h-3.5 w-3.5 shrink-0 text-steel transition-transform group-hover:translate-x-0.5 group-hover:text-industrial-blue" />
                          </Link>
                        </li>
                      ))}
                      <li>
                        <Link
                          to="/global-sourcing"
                          onClick={closeProducts}
                          className="group flex items-start gap-3 border-b border-charcoal/10 py-3.5 transition-colors hover:border-industrial-blue/40"
                        >
                          <span className="mt-0.5 font-serif text-sm italic text-industrial-blue">→</span>
                          <span className="flex-1">
                            <span className="block text-[13px] font-medium leading-5 text-charcoal transition-colors group-hover:text-industrial-blue">
                              {copy.nav.sourcing}
                            </span>
                            <span className="mt-0.5 block text-[11px] leading-4 text-steel">
                              {copy.capabilities.eyebrow}
                            </span>
                          </span>
                          <ArrowRight className="mt-1 h-3.5 w-3.5 shrink-0 text-steel transition-transform group-hover:translate-x-0.5 group-hover:text-industrial-blue" />
                        </Link>
                      </li>
                    </ul>
                    <div className="mt-5 flex items-center justify-between gap-4 bg-charcoal px-5 py-4 text-off-white">
                      <p className="max-w-[24rem] text-xs leading-5 text-titanium/80">
                        {copy.commodities.intro}
                      </p>
                      <Link
                        to="/contact#trade-enquiry"
                        onClick={closeProducts}
                        className="shrink-0 border-b border-white/40 pb-0.5 text-[10px] font-semibold uppercase tracking-[0.14em] transition-colors hover:border-titanium hover:text-titanium"
                      >
                        {copy.nav.cta}
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <NavLink key={link.to} to={link.to} className={desktopNavLink}>
                {link.label}
              </NavLink>
            )
          )}
        </nav>

        <div className="hidden shrink-0 items-center gap-4 xl:flex">
          <Link to="/contact#trade-enquiry" className="btn-corporate !px-5 !py-3">
            {copy.nav.cta}
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>

        <button
          ref={mobileToggleRef}
          type="button"
          onClick={() => setMobileOpen((open) => !open)}
          className="inline-flex h-11 w-11 items-center justify-center border border-charcoal/20 text-charcoal transition-colors hover:border-charcoal hover:bg-charcoal hover:text-off-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-industrial-blue focus-visible:ring-offset-2 xl:hidden"
          aria-label={mobileOpen ? copy.nav.close : copy.nav.menu}
          aria-expanded={mobileOpen}
          aria-controls="mobile-navigation"
        >
          <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
            {mobileOpen ? (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6 18 18 6M6 6l12 12" />
            ) : (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 7h16M4 12h16M4 17h16" />
            )}
          </svg>
        </button>
      </div>

      {/* Mobile drawer */}
      <div
        id="mobile-navigation"
        ref={mobilePanelRef}
        className={`fixed inset-x-0 top-[124px] z-40 h-[calc(100dvh-124px)] overflow-y-auto border-t border-charcoal/10 bg-off-white transition-[opacity,transform] duration-300 lg:top-[128px] lg:h-[calc(100dvh-128px)] xl:hidden ${
          mobileOpen
            ? 'visible translate-y-0 opacity-100'
            : 'invisible -translate-y-2 opacity-0'
        }`}
        aria-hidden={!mobileOpen}
      >
        <div className="shell flex min-h-full flex-col py-8">
          <nav className="flex flex-col" aria-label="Mobile">
            {navLinks.map((link) =>
              link.hasMenu ? (
                <div key={link.to} className="border-b border-charcoal/10">
                  <div className="flex items-stretch justify-between">
                    <NavLink
                      to={link.to}
                      onClick={closeMobile}
                      className="flex-1 py-4 font-serif text-[1.65rem] leading-tight text-charcoal"
                    >
                      {link.label}
                    </NavLink>
                    <button
                      type="button"
                      onClick={() => setMobileProductsOpen((open) => !open)}
                      aria-expanded={mobileProductsOpen}
                      aria-controls="mobile-products"
                      className="flex w-12 items-center justify-center text-graphite"
                      aria-label={copy.nav.productsLabel}
                    >
                      <Chevron open={mobileProductsOpen} />
                    </button>
                  </div>
                  <div
                    id="mobile-products"
                    className={`grid transition-[grid-template-rows] duration-300 ${
                      mobileProductsOpen ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]'
                    }`}
                  >
                    <div className="overflow-hidden">
                      <ul className="pb-4 pl-4">
                        {copy.commodities.categories.map((category) => (
                          <li key={category.id}>
                            <Link
                              to={category.href}
                              onClick={closeMobile}
                              className="flex items-center justify-between border-b border-charcoal/5 py-3 text-sm text-graphite"
                            >
                              {category.name}
                              <ArrowRight className="h-3.5 w-3.5" />
                            </Link>
                          </li>
                        ))}
                        <li>
                          <Link
                            to="/products"
                            onClick={closeMobile}
                            className="mt-3 inline-flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.16em] text-industrial-blue"
                          >
                            {copy.nav.viewAll}
                            <ArrowRight className="h-3.5 w-3.5" />
                          </Link>
                        </li>
                      </ul>
                    </div>
                  </div>
                </div>
              ) : (
                <NavLink
                  key={link.to}
                  to={link.to}
                  onClick={closeMobile}
                  className={({ isActive }) =>
                    `border-b border-charcoal/10 py-4 font-serif text-[1.65rem] leading-tight transition-colors ${
                      isActive ? 'text-industrial-blue' : 'text-charcoal'
                    }`
                  }
                >
                  {link.label}
                </NavLink>
              )
            )}
          </nav>

          <div className="mt-6 flex flex-col gap-3">
            <Link to="/contact#trade-enquiry" onClick={closeMobile} className="btn-corporate w-full">
              {copy.nav.cta}
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
            {!loading && (
              <NavLink
                to={customer ? '/dashboard' : '/login'}
                onClick={closeMobile}
                className="btn-corporate-outline w-full"
              >
                {customer ? copy.utility.dashboard : copy.utility.signIn}
              </NavLink>
            )}
          </div>

          <div className="mt-10 flex flex-col gap-5 border-t border-charcoal/10 pt-6">
            <div className="flex items-center justify-between gap-4">
              <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-steel">
                {copy.footer.language}
              </p>
              <LanguageSwitcher />
            </div>
            <div className="flex flex-col gap-1 text-xs leading-5 text-steel">
              <a href={`mailto:${copy.contact.email}`} className="font-medium text-charcoal">
                {copy.contact.email}
              </a>
              <p>{copy.utility.presence}</p>
            </div>
          </div>
        </div>
      </div>
    </header>
  )
}
