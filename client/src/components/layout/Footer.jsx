import { Link } from 'react-router-dom'
import { useLanguage } from '../../context/LanguageContext'
import LanguageSwitcher from './LanguageSwitcher'

export default function Footer() {
  const { t } = useLanguage()

  const companyLinks = [
    { to: '/', label: t.nav.home },
    { to: '/about', label: t.nav.about },
    { to: '/products', label: t.nav.products },
    { to: '/enquiry', label: t.nav.enquiry },
    { to: '/contact', label: t.nav.contact },
  ]

  const productLinks = [
    { to: '/products', label: t.nav.products },
    { to: '/products/custom-bulk-order', label: t.footer.bulkOrders },
  ]

  const legalLinks = [
    { to: '/privacy', label: t.privacy.title },
    { to: '/terms', label: t.terms.title },
    { to: '/cookies', label: t.cookies.title },
  ]

  return (
    <footer className="bg-charcoal text-titanium">
      <div className="container-site py-14 md:py-16">
        <div className="grid grid-cols-1 gap-10 sm:grid-cols-2 lg:grid-cols-4 lg:gap-12">
          {/* Brand */}
          <div>
            <img
              src="/images/india-all-logo.png"
              alt="INDIA ALL"
              className="h-auto w-auto object-contain max-w-[240px] max-h-[120px] md:max-w-[240px] md:max-h-[120px]"
            />
            <p className="text-sm leading-6 text-titanium/80">{t.footer.tagline}</p>
            <a
              href={`mailto:${t.contact.email}`}
              className="mt-4 inline-block text-sm font-semibold text-gold-light transition-colors hover:text-gold"
            >
              {t.contact.email}
            </a>
          </div>

          {/* Products */}
          <nav aria-label={t.footer.products}>
            <h3 className="mb-4 font-serif text-lg font-bold text-off-white">{t.footer.products}</h3>
            <ul className="space-y-2.5 text-sm">
              {productLinks.map((link) => (
                <li key={link.to}>
                  <Link to={link.to} className="text-titanium/80 transition-colors hover:text-gold-light">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          {/* Company */}
          <nav aria-label={t.footer.quickLinks}>
            <h3 className="mb-4 font-serif text-lg font-bold text-off-white">{t.footer.quickLinks}</h3>
            <ul className="space-y-2.5 text-sm">
              {companyLinks.map((link) => (
                <li key={link.to}>
                  <Link to={link.to} className="text-titanium/80 transition-colors hover:text-gold-light">
                    {link.label}
                  </Link>
                </li>
              ))}
              <li>
                <Link to="/dashboard" className="text-titanium/80 transition-colors hover:text-gold-light">
                  {t.header.dashboard}
                </Link>
              </li>
            </ul>
          </nav>

          {/* Legal + language */}
          <div>
            <h3 className="mb-4 font-serif text-lg font-bold text-off-white">{t.footer.legal}</h3>
            <ul className="space-y-2.5 text-sm">
              {legalLinks.map((link) => (
                <li key={link.to}>
                  <Link to={link.to} className="text-titanium/80 transition-colors hover:text-gold-light">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
            <div className="mt-6">
              <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-titanium/60">{t.footer.language}</p>
              <LanguageSwitcher />
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-12 flex flex-col items-center justify-between gap-4 border-t border-white/10 pt-8 text-sm text-titanium/60 md:flex-row">
          <p>{t.footer.rights}</p>
          <p className="text-xs">{t.footer.registered}</p>
        </div>
      </div>
    </footer>
  )
}
