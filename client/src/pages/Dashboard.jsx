import { useEffect, useState } from 'react'
import Sidebar from '../components/dashboard/Sidebar'
import ProfileTab from '../components/dashboard/ProfileTab'
import EnquiriesTab from '../components/dashboard/EnquiriesTab'
import FavoritesTab from '../components/dashboard/FavoritesTab'
import DownloadsTab from '../components/dashboard/DownloadsTab'
import OverviewTab from '../components/dashboard/OverviewTab'

const tabs = {
  overview: { title: 'Dashboard overview', component: OverviewTab },
  profile: { title: 'Profile information', component: ProfileTab },
  enquiries: { title: 'My enquiries', component: EnquiriesTab },
  favorites: { title: 'Saved commodities', component: FavoritesTab },
  downloads: { title: 'Downloads', component: DownloadsTab },
}

export default function Dashboard() {
  const [activeTab, setActiveTab] = useState('overview')
  const ActivePanel = tabs[activeTab].component

  useEffect(() => {
    const handleTabRequest = (event) => {
      if (tabs[event.detail]) setActiveTab(event.detail)
    }
    window.addEventListener('india-all-dashboard-tab', handleTabRequest)
    return () => window.removeEventListener('india-all-dashboard-tab', handleTabRequest)
  }, [])

  return (
    <main className="min-h-[70vh] bg-off-white py-10 md:py-14">
      <div className="container-site">
        <div className="mb-8">
          <p className="mb-2 text-xs font-bold uppercase tracking-[0.2em] text-industrial-blue">Customer portal</p>
          <h1 className="font-serif text-3xl font-bold text-charcoal md:text-4xl">Your INDIA ALL dashboard</h1>
          <p className="mt-2 text-sm font-medium text-text-secondary">Monitor your sourcing activity, follow quotation requests and manage your business profile.</p>
        </div>
        <div className="grid grid-cols-1 items-start gap-6 lg:grid-cols-[260px_minmax(0,1fr)]">
          <Sidebar activeTab={activeTab} onTabChange={setActiveTab} />
          <section className="min-w-0 rounded-xl border border-border-light bg-white p-5 shadow-card md:p-8" aria-live="polite">
            <h2 className="mb-6 font-serif text-2xl font-bold text-charcoal">{tabs[activeTab].title}</h2>
            <ActivePanel />
          </section>
        </div>
      </div>
    </main>
  )
}
