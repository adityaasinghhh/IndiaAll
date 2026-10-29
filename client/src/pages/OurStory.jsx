import { useLanguage } from '../context/LanguageContext'
import { getSiteContent } from '../data/siteContent'
import PageHero from '../components/ui/PageHero'
import StorySection from '../components/home/StorySection'
import FounderSection from '../components/home/FounderSection'
import PresenceSection from '../components/home/PresenceSection'
import ClosingCta from '../components/home/ClosingCta'

export default function OurStory() {
  const { lang } = useLanguage()
  const copy = getSiteContent(lang)
  const page = copy.pages.story

  return (
    <main>
      <PageHero
        eyebrow={page.eyebrow}
        title={page.title}
        intro={page.intro}
        image="/images/editorial/partnership.jpg"
        imageAlt="Two business people shaking hands after a meeting"
        meta={[copy.hero.metaRight, copy.utility.presence]}
      />

      <StorySection copy={copy.story} showCta={false} />
      <FounderSection copy={copy.founder} />
      <PresenceSection copy={copy.presence} />

      <ClosingCta
        eyebrow={copy.contact.eyebrow}
        title={copy.contact.title}
        text={copy.contact.intro}
        primary={{ to: '/contact#trade-enquiry', label: copy.contact.form.submit }}
        secondary={{ to: '/business-opportunities', label: copy.nav.opportunities }}
      />
    </main>
  )
}
