import { motion } from 'motion/react'
import { useEffect, useState } from 'react'
import { Link, NavLink, useLocation } from 'react-router-dom'
import { useLanguage } from '../../context/LanguageContext'
import LanguageSwitcher from './LanguageSwitcher'
import { useAuth } from '../../context/AuthContext'

function IndiaAllLogo() {
  return (
    <Link to="/" className="flex shrink-0 items-center" aria-label="INDIA ALL — home">
      <div className="flex flex-col items-center">
        <img
          src="/images/india-all-logo.png"
          alt="INDIA ALL"
          className="h-[56px] w-auto object-contain md:h-[56px]"
        />
        <span className="text-xs font-semibold text-gold uppercase tracking-wider">INDIA ALL</span>
      </div>
    </Link>
  )
}

export default function Header() {
  const { t } = useLanguage()
  const { customer, loading } = useAuth()
  const location = useLocation()
  const [mobileOpen, setMobileOpen] = useState(false)
  const [menuVisible, setMenuVisible] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const isHomePage = location.pathname === '/'

  // Header background: transparent over hero, solid charcoal on scroll
  const headerBg = isHomePage
    ? scrolled
      ? 'bg-charcoal/95 backdrop-blur-md supports-[backdrop-filter]:bg-charcoal/95'
      : 'bg-transparent'
    : 'bg-charcoal/95 backdrop-blur-md'

  // Header border - only bottom on scroll, invisible otherwise
  const headerBorder = scrolled ? 'border-b border-white/10' : 'border-b-0'

  const navLinks = [
    { to: '/', label: t.nav.home, exact: true },
    { to: '/about', label: t.nav.about },
    { to: '/products', label: t.nav.products },
    { to: '/enquiry', label: t.nav.enquiry },
    { to: '/contact', label: t.nav.contact },
  ]

  // Close the mobile menu whenever the route changes
  useEffect(() => {
    setMobileOpen(false)
  }, [location.pathname])

  // Animate the mobile panel in and out
  useEffect(() => {
    if (mobileOpen) {
      const frame = requestAnimationFrame(() => setMenuVisible(true))
      return () => cancelAnimationFrame(frame)
    }
    setMenuVisible(false)
    return undefined
  }, [mobileOpen])

  // Track scroll for header styling
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10)
    }
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const closeMobileMenu = () => setMobileOpen(false)

  return (
    <header
      className={`sticky top-0 z-50 ${headerBg} ${headerBorder} transition-all duration-300`}
    >
      <div className="container-site flex items-center justify-between gap-4 py-3 md:py-4">
        <IndiaAllLogo />

        {/* Center navigation */}
        <nav className="hidden items-center gap-8 lg:flex" aria-label="Primary">
          {navLinks.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              className={({ isActive }) => {
                const active = isActive
                if (active) {
                  return 'relative text-gold font-bold after:content-[""] after:absolute after:bottom-[0.1rem] after:left-0 after:w-full after:h-0.5 after:bg-gold'
                }
                return 'relative text-titanium/90 transition-colors hover:text-off-white focus-visible:ring-2 focus:ring-industrial-blue/50'
              }}
            >
              {link.label}
            </NavLink>
          ))}
        </nav>

        {/* Right actions: language, sign-in, CTA */}
        <div className="hidden items-center gap-4 lg:flex">
          <LanguageSwitcher />

          <NavLink
            to="/login"
            className="text-titanium text-sm font-semibold transition-colors hover:text-gold"
          >
            {t.header.signIn}
          </NavLink>

          <Link to="/enquiry" className="btn-gold">
            {t.nav.requestQuote}
          </Link>
        </div>

        {/* Mobile menu toggle */}
        <button
          type="button"
          onClick={() => setMobileOpen((open) => !open)}
          className="inline-flex h-11 w-11 items-center justify-center rounded-lg text-titanium transition-colors hover:bg-white/10 lg:hidden"
          aria-label={mobileOpen ? t.header.closeMenu : t.header.openMenu}
          aria-expanded={mobileOpen}
          aria-controls="mobile-navigation"
        >
          <svg
            className="h-5 w-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            {mobileOpen ? (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            ) : (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            )}
          </svg>
        </button>
      </div>

      {/* Mobile navigation panel */}
      <div
        id="mobile-navigation"
        className={`overflow-hidden border-t border-white/10 bg-charcoal/95 backdrop-blur-md transition-[max-height,opacity] duration-300 ease-in-out lg:hidden ${
          menuVisible ? 'max-h-[560px] opacity-100' : 'max-h-0 opacity-0'}${mobileOpen ? '' : 'pointer-events-none border-t-0'}`}
      >
        <nav className="container-site flex flex-col gap-1 py-4 px-4" aria-label="Mobile">
          {navLinks.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              end={link.to === '/'}
              onClick={closeMobileMenu}
              className={({ isActive }) => {
                const active = isActive
                if (active) {
                  return 'block rounded-lg px-4 py-3 text-sm font-bold text-gold bg-white/5'
                }
                return 'block rounded-lg px-4 py-3 text-sm font-semibold text-titanium hover:text-gold transition-colors'
              }}
            >
              {link.label}
            </NavLink>
          ))}
          {!loading &&
            (customer ? (
              <NavLink
                to="/dashboard"
                onClick={closeMobileMenu}
                className="block rounded-lg px-4 py-3 text-sm font-semibold text-gold hover:bg-white/5"
              >
                {t.header.dashboard}
              </NavLink>
            ) : (
              <NavLink
                to="/login"
                onClick={closeMobileMenu}
                className="block rounded-lg px-4 py-3 text-sm font-semibold text-titanium hover:text-gold"
              >
                {t.header.signIn}
              </NavLink>
            ))}

          <Link to="/enquiry" onClick={closeMobileMenu} className="btn-gold mt-3 w-full">
            {t.nav.requestQuote}
          </Link>

          <div className="mt-3 border-t border-white/10 pt-3">
            <LanguageSwitcher />
          </div>
        </nav>
      </div>
    </header>
  )
}
