import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { api } from '../../services/api'
import { useAuth } from '../../context/AuthContext'

const statusLabels = { new: 'New', in_review: 'In review', quoted: 'Quoted', closed: 'Closed' }
const statusStyles = {
  new: 'bg-blue-50 text-blue-700 border-blue-100',
  in_review: 'bg-amber-50 text-amber-700 border-amber-100',
  quoted: 'bg-emerald-50 text-emerald-700 border-emerald-100',
  closed: 'bg-slate-100 text-slate-700 border-slate-200',
}

function Metric({ label, value, detail, icon }) {
  return (
    <div className="rounded-xl border border-[#D5D7D6] bg-white p-5 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div><p className="text-sm text-[#5B6470]">{label}</p><p className="mt-2 font-serif text-3xl font-semibold text-[#0B1F3A]">{value}</p><p className="mt-1 text-xs text-[#646E7A]">{detail}</p></div>
        <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#A8873A]/10 text-[#A8873A]" aria-hidden="true">{icon}</span>
      </div>
    </div>
  )
}

export default function OverviewTab() {
  const { customer } = useAuth()
  const [enquiries, setEnquiries] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    let active = true
    api.get('/enquiries/my')
      .then((result) => { if (active) setEnquiries(Array.isArray(result.enquiries) ? result.enquiries : []) })
      .catch((err) => { if (active) setError(err.message || 'We could not load your latest enquiries.') })
      .finally(() => { if (active) setLoading(false) })
    return () => { active = false }
  }, [])

  const openCount = enquiries.filter((item) => ['new', 'in_review'].includes(item.status)).length
  const quotedCount = enquiries.filter((item) => item.status === 'quoted').length
  const recent = [...enquiries].sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0)).slice(0, 4)
  const firstName = customer?.name?.trim()?.split(/\s+/)[0] || 'there'

  return (
    <div className="space-y-7">
      <div className="rounded-xl bg-[#0B1F3A] p-6 text-white md:p-8">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#B8D0DC]">Buyer workspace</p>
        <h3 className="mt-3 font-serif text-2xl font-semibold md:text-3xl">Welcome back, {firstName}</h3>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-[#D5D7D6]">Your trade enquiries, saved commodities and account details are gathered here, so you can keep your sourcing work moving.</p>
        <div className="mt-5 flex flex-wrap gap-3">
          <Link to="/products" className="inline-flex items-center rounded-md bg-[#F3F2EE] px-4 py-2.5 text-sm font-semibold text-[#0B1F3A] transition hover:bg-white">Explore commodities <span className="ml-2" aria-hidden="true">→</span></Link>
          <Link to="/enquiry" className="inline-flex items-center rounded-md border border-white/40 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-white/10">Send an enquiry</Link>
        </div>
      </div>

      {error && <div role="status" className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">Your dashboard is available, but enquiry statistics could not be loaded: {error}</div>}

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3">
        <Metric label="Total enquiries" value={loading ? '—' : enquiries.length} detail="All your submitted requests" icon={<svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" d="M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01"/></svg>} />
        <Metric label="In progress" value={loading ? '—' : openCount} detail="New or under review" icon={<svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor"><circle cx="12" cy="12" r="9" strokeWidth="1.8"/><path d="M12 7v5l3 2" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/></svg>} />
        <Metric label="Quotes received" value={loading ? '—' : quotedCount} detail="Requests with a quotation" icon={<svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M4 5.5A2.5 2.5 0 0 1 6.5 3H18a2 2 0 0 1 2 2v16H6.5A2.5 2.5 0 0 1 4 18.5z" strokeWidth="1.8"/><path d="M4 18.5A2.5 2.5 0 0 1 6.5 16H20M8 7h8m-8 4h6" strokeWidth="1.8" strokeLinecap="round"/></svg>} />
      </div>

      <section className="overflow-hidden rounded-xl border border-[#D5D7D6] bg-white">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#E7E8E6] px-5 py-4">
          <div><h3 className="font-serif text-xl font-semibold text-[#0B1F3A]">Recent enquiries</h3><p className="mt-1 text-sm text-[#5B6470]">The latest activity on your sourcing requests.</p></div>
          <Link to="/dashboard" onClick={() => window.dispatchEvent(new CustomEvent('india-all-dashboard-tab', { detail: 'enquiries' }))} className="text-sm font-semibold text-[#A8873A] hover:underline">View all</Link>
        </div>
        {loading ? <p className="px-5 py-8 text-sm text-[#5B6470]">Loading your enquiries…</p> : recent.length === 0 ? (
          <div className="px-5 py-9 text-center"><p className="font-medium text-[#23272E]">No enquiries yet</p><p className="mt-1 text-sm text-[#5B6470]">When you request a quotation, its status will appear here.</p><Link to="/products" className="mt-4 inline-flex text-sm font-semibold text-[#A8873A] hover:underline">Browse commodities →</Link></div>
        ) : (
          <div className="divide-y divide-[#E7E8E6]">{recent.map((item) => <div key={item._id} className="flex flex-wrap items-center justify-between gap-3 px-5 py-4"><div><p className="font-semibold text-[#23272E]">{item.commodity || 'Commodity enquiry'}</p><p className="mt-1 text-xs text-[#646E7A]">{item.createdAt ? new Date(item.createdAt).toLocaleDateString() : 'Date unavailable'}{item.quantity ? ` · ${item.quantity}` : ''}</p></div><span className={`rounded-full border px-3 py-1 text-xs font-semibold ${statusStyles[item.status] || statusStyles.new}`}>{statusLabels[item.status] || 'Pending'}</span></div>)}</div>
        )}
      </section>

      <section className="grid grid-cols-1 gap-3 md:grid-cols-2">
        <Link to="/products" className="group rounded-xl border border-[#D5D7D6] bg-white p-5 transition hover:border-[#A8873A] hover:shadow-sm"><p className="text-xs font-bold uppercase tracking-[0.15em] text-[#A8873A]">Discover</p><h3 className="mt-2 font-serif text-lg font-semibold text-[#0B1F3A]">Find your next commodity</h3><p className="mt-1 text-sm leading-5 text-[#5B6470]">Explore available categories and send a tailored request for quotation.</p><span className="mt-4 inline-block text-sm font-semibold text-[#A8873A] group-hover:translate-x-1 transition-transform">Browse catalogue →</span></Link>
        <div className="rounded-xl border border-[#D5D7D6] bg-white p-5"><p className="text-xs font-bold uppercase tracking-[0.15em] text-[#A8873A]">Account</p><h3 className="mt-2 font-serif text-lg font-semibold text-[#0B1F3A]">Keep your business details current</h3><p className="mt-1 text-sm leading-5 text-[#5B6470]">Accurate company, country and contact details help us respond to your requests.</p><p className="mt-4 text-sm text-[#646E7A]">Signed in as {customer?.email || 'registered customer'}</p></div>
      </section>
    </div>
  )
}
