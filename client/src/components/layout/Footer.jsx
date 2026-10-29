import { Link } from 'react-router-dom'
import { useLanguage } from '../../context/LanguageContext'
import { getSiteContent } from '../../data/siteContent'
import LanguageSwitcher from './LanguageSwitcher'

export default function Footer() {
  const { t, lang } = useLanguage()
  const copy = getSiteContent(lang)

  const companyLinks = [
    { to: '/about', label: copy.footer.links.about },
    { to: '/our-story', label: copy.footer.links.story },
    { to: '/global-sourcing', label: copy.footer.links.sourcing },
    { to: '/business-opportunities', label: copy.footer.links.opportunities },
    { to: '/contact', label: copy.footer.links.contact },
  ]

  const workLinks = [
    { to: '/enquiry', label: copy.footer.links.enquiry },
    { to: '/products/custom-bulk-order', label: copy.footer.links.bulk },
    { to: '/enquiry?enquiry=sourcing-partnership', label: copy.footer.links.sourcingPartnership },
    { to: '/enquiry?enquiry=distribution', label: copy.footer.links.distribution },
    { to: '/login', label: copy.footer.links.signIn },
  ]

  const legalLinks = [
    { to: '/privacy', label: t.privacy.title },
    { to: '/terms', label: t.terms.title },
    { to: '/cookies', label: t.cookies.title },
  ]

  return (
    <footer className="on-dark bg-charcoal text-titanium">
      <div className="shell">
        <div className="grid grid-cols-1 gap-12 border-b border-white/10 py-16 sm:grid-cols-2 lg:grid-cols-12 lg:gap-8 lg:py-20">
          {/* Brand */}
          <div className="lg:col-span-4 lg:pr-10">
            <img
              src="/images/india-all-logo.png"
              alt="INDIA ALL"
              className="h-auto w-auto object-contain max-w-[240px] max-h-[120px] md:max-w-[240px] md:max-h-[120px]"
            />
            <p className="mt-7 max-w-sm text-sm leading-7 text-titanium/70">
              {copy.footer.description}
            </p>
            <div className="mt-8">
              <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-titanium/45">
                {copy.contact.emailLabel}
              </p>
              <a
                href={`mailto:${copy.contact.email}`}
                className="mt-2 inline-block border-b border-white/25 pb-1 text-sm font-medium text-off-white transition-colors hover:border-titanium hover:text-titanium"
              >
                {copy.contact.email}
              </a>
            </div>
          </div>

          {/* Company */}
          <nav className="lg:col-span-2" aria-label={copy.footer.companyTitle}>
            <h2 className="mb-5 text-[10px] font-semibold uppercase tracking-[0.18em] text-titanium/45">
              {copy.footer.companyTitle}
            </h2>
            <ul className="space-y-3">
              {companyLinks.map((link) => (
                <li key={link.to}>
                  <Link
                    to={link.to}
                    className="text-[13px] leading-5 text-titanium/75 transition-colors hover:text-off-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-titanium focus-visible:ring-offset-2 focus-visible:ring-offset-charcoal"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          {/* Products */}
          <nav className="lg:col-span-2" aria-label={copy.footer.productsTitle}>
            <h2 className="mb-5 text-[10px] font-semibold uppercase tracking-[0.18em] text-titanium/45">
              {copy.footer.productsTitle}
            </h2>
            <ul className="space-y-3">
              {copy.commodities.categories.map((category) => (
                <li key={category.id}>
                  <Link
                    to={category.href}
                    className="text-[13px] leading-5 text-titanium/75 transition-colors hover:text-off-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-titanium focus-visible:ring-offset-2 focus-visible:ring-offset-charcoal"
                  >
                    {category.name}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          {/* Work with us */}
          <nav className="lg:col-span-2" aria-label={copy.footer.workTitle}>
            <h2 className="mb-5 text-[10px] font-semibold uppercase tracking-[0.18em] text-titanium/45">
              {copy.footer.workTitle}
            </h2>
            <ul className="space-y-3">
              {workLinks.map((link) => (
                <li key={link.to}>
                  <Link
                    to={link.to}
                    className="text-[13px] leading-5 text-titanium/75 transition-colors hover:text-off-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-titanium focus-visible:ring-offset-2 focus-visible:ring-offset-charcoal"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          {/* Presence */}
          <div className="lg:col-span-2">
            <h2 className="mb-5 text-[10px] font-semibold uppercase tracking-[0.18em] text-titanium/45">
              {copy.footer.presenceTitle}
            </h2>
            <ul className="space-y-4">
              {copy.presence.locations.map((location) => (
                <li key={location.country}>
                  <p className="text-[13px] font-medium text-off-white">{location.country}</p>
                  <p className="mt-0.5 text-[11px] leading-4 text-titanium/55">{location.address}</p>
                </li>
              ))}
            </ul>
            <p className="mt-6 text-[10px] uppercase tracking-[0.14em] text-titanium/40">
              {copy.presence.established}
            </p>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="flex flex-col gap-5 py-7 text-[11px] leading-5 text-titanium/50 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex flex-col gap-0 sm:flex-row sm:items-center sm:gap-6">
            <p>{copy.footer.rights}</p>
          </div>

          <div className="flex flex-wrap items-center gap-x-6 gap-y-3">
            {legalLinks.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                className="transition-colors hover:text-titanium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-titanium focus-visible:ring-offset-2 focus-visible:ring-offset-charcoal"
              >
                {link.label}
              </Link>
            ))}
            <span className="hidden h-3 w-px bg-white/15 sm:block" aria-hidden="true" />
            <div className="flex items-center gap-2">
              <span className="text-[9px] uppercase tracking-[0.16em] text-titanium/35">
                {copy.footer.language}
              </span>
              <LanguageSwitcher onDark />
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}
