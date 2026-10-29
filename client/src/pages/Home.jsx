import { useLanguage } from '../context/LanguageContext'
import { getSiteContent } from '../data/siteContent'
import Hero from '../components/home/Hero'
import Capabilities from '../components/home/Capabilities'
import CommodityGrid from '../components/home/CommodityGrid'
import StorySection from '../components/home/StorySection'
import FounderSection from '../components/home/FounderSection'
import OpportunitySection from '../components/home/OpportunitySection'
import PresenceSection from '../components/home/PresenceSection'
import ContactSection from '../components/home/ContactSection'

export default function Home() {
  const { lang } = useLanguage()
  const copy = getSiteContent(lang)

  return (
    <main>
      <Hero copy={copy.hero} />
      <Capabilities copy={copy.capabilities} />
      <CommodityGrid copy={copy.commodities} />
      <StorySection copy={copy.story} />
      <FounderSection copy={copy.founder} />
      <OpportunitySection copy={copy.opportunities} />
      <PresenceSection copy={copy.presence} />
      <ContactSection copy={copy.contact} />
    </main>
  )
}
