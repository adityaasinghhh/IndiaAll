import { useLanguage } from '../context/LanguageContext'
import { getSiteContent } from '../data/siteContent'
import PageHero from '../components/ui/PageHero'
import ContactSection from '../components/home/ContactSection'

export default function Enquiry() {
  const { lang } = useLanguage()
  const copy = getSiteContent(lang)
  const page = copy.pages.enquiry

  return (
    <main>
      <PageHero
        eyebrow={page.eyebrow}
        title={page.title}
        intro={page.intro}
        image="/images/editorial/terminal.jpg"
        imageAlt="Container terminal with stacked freight and cranes"
        compact
        meta={[copy.hero.metaLeft, copy.contact.email]}
      />
      <ContactSection copy={copy.contact} />
    </main>
  )
}
