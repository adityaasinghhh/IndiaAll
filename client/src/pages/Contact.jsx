import { useLanguage } from '../context/LanguageContext'
import { getSiteContent } from '../data/siteContent'
import PageHero from '../components/ui/PageHero'
import ContactSection from '../components/home/ContactSection'

export default function Contact() {
  const { lang } = useLanguage()
  const copy = getSiteContent(lang)
  const page = copy.pages.contact

  return (
    <main>
      <PageHero
        eyebrow={page.eyebrow}
        title={page.title}
        intro={page.intro}
        image="/images/editorial/port.jpg"
        imageAlt="Container ship berthed at a commercial port"
        compact
        meta={[copy.utility.tagline, copy.contact.email]}
      />
      <ContactSection copy={copy.contact} heading={page.formHeading} />
    </main>
  )
}
