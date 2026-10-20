import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { adminApi, downloadCsv } from '../../services/adminApi.js'
import { useToast } from './Toast.jsx'
import {
  ConfirmDialog,
  DataTable,
  DateRangeFilter,
  ErrorState,
  Modal,
  Pagination,
  StatusBadge,
  ENQUIRY_STATUS_TONES,
} from './ui.jsx'

const ENQUIRY_STATUSES = ['new', 'in_review', 'quoted', 'closed']
const PAGE_SIZE = 15

export default function EnquiriesPage() {
  const [enquiries, setEnquiries] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [searchInput, setSearchInput] = useState('')
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [range, setRange] = useState({ from: '', to: '' })
  const [page, setPage] = useState(1)
  const [pagination, setPagination] = useState(null)
  const [selected, setSelected] = useState(null)
  const [detailLoading, setDetailLoading] = useState(false)
  const [statusUpdate, setStatusUpdate] = useState('')
  const [internalNotes, setInternalNotes] = useState('')
  const [followUpDate, setFollowUpDate] = useState('')
  const [replyDraft, setReplyDraft] = useState('')
  const [busy, setBusy] = useState(false)
  const [confirm, setConfirm] = useState(null)
  const toast = useToast()
  const requestId = useRef(0)

  useEffect(() => {
    const handle = setTimeout(() => { setSearch(searchInput); setPage(1) }, 350)
    return () => clearTimeout(handle)
  }, [searchInput])

  const load = useCallback(async () => {
    const id = ++requestId.current
    setLoading(true)
    setError('')
    try {
      const params = { page: String(page), limit: String(PAGE_SIZE) }
      if (search) params.search = search
      if (statusFilter) params.status = statusFilter
      if (range.from) params.from = range.from
      if (range.to) params.to = range.to
      const result = await adminApi.getEnquiries(params)
      if (id !== requestId.current) return
      setEnquiries(result.enquiries)
      setPagination(result.pagination)
    } catch (err) {
      if (err.status === 401) return
      if (id !== requestId.current) return
      setError(err.message || 'Unable to load enquiries.')
    } finally {
      if (id === requestId.current) setLoading(false)
    }
  }, [page, search, statusFilter, range])

  useEffect(() => { load() }, [load])

  const openDetail = async (enquiry) => {
    setSelected(enquiry)
    setDetailLoading(true)
    setStatusUpdate(enquiry.status)
    setInternalNotes(enquiry.internalNotes || '')
    setFollowUpDate(enquiry.followUpDate ? enquiry.followUpDate.slice(0, 10) : '')
    setReplyDraft('')
    try {
      const result = await adminApi.getEnquiry(enquiry._id)
      setSelected(result.enquiry)
      setStatusUpdate(result.enquiry.status)
      setInternalNotes(result.enquiry.internalNotes || '')
      setFollowUpDate(result.enquiry.followUpDate ? result.enquiry.followUpDate.slice(0, 10) : '')
    } catch (err) {
      if (err.status !== 401) toast.error(err.message || 'Unable to load enquiry details.')
    } finally {
      setDetailLoading(false)
    }
  }

  const closeDetail = () => {
    setSelected(null)
    setConfirm(null)
  }

  const requestStatusUpdate = () => {
    if (!statusUpdate || statusUpdate === selected?.status) {
      toast.info('Select a different status first.')
      return
    }
    setConfirm({ type: 'status' })
  }

  const requestDelete = () => setConfirm({ type: 'delete' })

  const runConfirmed = async () => {
    if (!confirm || !selected) return
    setBusy(true)
    try {
      if (confirm.type === 'status') {
        await adminApi.updateEnquiryStatus(selected._id, {
          status: statusUpdate,
          internalNotes: internalNotes || undefined,
          followUpDate: followUpDate || undefined,
        })
        toast.success(`Enquiry marked as “${statusUpdate.replace(/_/g, ' ')}”.`)
      } else if (confirm.type === 'delete') {
        await adminApi.deleteEnquiry(selected._id)
        toast.success('Enquiry deleted.')
      }
      setConfirm(null)
      closeDetail()
      load()
    } catch (err) {
      if (err.status !== 401) toast.error(err.message || 'The action could not be completed.')
    } finally {
      setBusy(false)
    }
  }

  const sendReply = async () => {
    if (!replyDraft.trim() || !selected) return
    setBusy(true)
    try {
      await adminApi.replyToEnquiry(selected._id, { message: replyDraft.trim() })
      toast.success(`Reply sent to ${selected.email}.`)
      setReplyDraft('')
      const result = await adminApi.getEnquiry(selected._id)
      setSelected(result.enquiry)
    } catch (err) {
      if (err.status !== 401) toast.error(err.message || 'Unable to send reply.')
    } finally {
      setBusy(false)
    }
  }

  const exportCsv = async () => {
    try {
      const params = new URLSearchParams()
      if (statusFilter) params.set('status', statusFilter)
      if (range.from) params.set('from', range.from)
      if (range.to) params.set('to', range.to)
      await downloadCsv(`/enquiries/export/csv?${params}`, 'enquiries.csv')
      toast.success('Enquiries CSV downloaded.')
    } catch (err) {
      toast.error(err.message || 'Unable to export CSV.')
    }
  }

  const columns = useMemo(() => [
    {
      key: 'name', label: 'Contact',
      render: (e) => (
        <div>
          <p className="font-medium text-ink">{e.name}</p>
          <p className="text-xs text-muted">{e.company}</p>
        </div>
      ),
    },
    {
      key: 'commodity', label: 'Commodity',
      render: (e) => (
        <div>
          <p className="text-ink">{e.commodity}</p>
          <p className="text-xs text-muted">{e.quantity}</p>
        </div>
      ),
    },
    { key: 'deliveryLocation', label: 'Destination', render: (e) => <span className="text-muted">{e.deliveryLocation}</span> },
    { key: 'createdAt', label: 'Date', render: (e) => <span className="text-muted">{new Date(e.createdAt).toLocaleDateString()}</span> },
    {
      key: 'status', label: 'Status',
      render: (e) => (
        <div className="flex items-center gap-2">
          <StatusBadge status={e.status} tone={ENQUIRY_STATUS_TONES[e.status]} />
          {e.status === 'new' && <span className="h-2 w-2 rounded-full bg-blue-500" aria-label="New" title="New" />}
        </div>
      ),
    },
    {
      key: 'actions', label: '',
      render: (e) => (
        <button
          type="button"
          onClick={() => openDetail(e)}
          className="rounded-lg border border-gray-200 px-3 py-1.5 text-xs font-semibold text-ink transition-colors hover:border-gold hover:text-gold-dark"
        >
          Manage
        </button>
      ),
    },
  ], [])

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="eyebrow">Operations</p>
          <h2 className="mt-1 font-serif text-2xl font-semibold text-navy">Enquiries</h2>
          <p className="mt-1 text-sm text-muted">Enquiries submitted through the website enquiry form.</p>
        </div>
        <button type="button" onClick={exportCsv} className="btn-outline px-4 py-2 text-sm">
          Export CSV
        </button>
      </div>

      <div className="flex flex-col gap-3 rounded-xl border border-gray-200 bg-white p-4 shadow-card lg:flex-row lg:items-end">
        <div className="flex-1">
          <label htmlFor="enquiry-search" className="label-base">Search</label>
          <input
            id="enquiry-search"
            type="search"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder="Name, company, email, commodity…"
            className="input-base"
          />
        </div>
        <div>
          <label htmlFor="enquiry-status-filter" className="label-base">Status</label>
          <select
            id="enquiry-status-filter"
            value={statusFilter}
            onChange={(e) => { setStatusFilter(e.target.value); setPage(1) }}
            className="input-base w-full lg:w-44"
          >
            <option value="">All statuses</option>
            {ENQUIRY_STATUSES.map((s) => <option key={s} value={s}>{s.replace(/_/g, ' ')}</option>)}
          </select>
        </div>
        <div>
          <span className="label-base">Date range</span>
          <DateRangeFilter from={range.from} to={range.to} onChange={(r) => { setRange(r); setPage(1) }} />
        </div>
      </div>

      {error && <ErrorState title="Unable to load enquiries" message={error} onRetry={load} />}

      <DataTable
        columns={columns}
        rows={enquiries}
        rowKey={(e) => e._id}
        loading={loading}
        emptyMessage={search || statusFilter || range.from || range.to ? 'No enquiries match the current filters.' : 'No enquiries have been submitted yet.'}
      />

      {pagination && (
        <Pagination page={pagination.page} pages={pagination.pages} total={pagination.total} onPageChange={setPage} />
      )}

      {/* Detail modal */}
      <Modal open={!!selected} onClose={closeDetail} title={selected ? `Enquiry — ${selected.commodity}` : 'Enquiry'} wide>
        {detailLoading && !selected ? (
          <p className="py-10 text-center text-muted">Loading enquiry…</p>
        ) : selected ? (
          <div className="space-y-6">
            <div className="flex flex-wrap items-center gap-3">
              <StatusBadge status={selected.status} tone={ENQUIRY_STATUS_TONES[selected.status]} />
              {selected.status === 'new' && (
                <span className="rounded-full bg-blue-100 px-2.5 py-1 text-xs font-semibold text-blue-800">New</span>
              )}
              <span className="text-sm text-muted">Submitted {new Date(selected.createdAt).toLocaleString()}</span>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {[
                ['Name', selected.name],
                ['Company', selected.company],
                ['Email', selected.email],
                ['Phone', selected.phone],
                ['Commodity', selected.commodity],
                ['Quantity', selected.quantity],
                ['Delivery location', selected.deliveryLocation],
                ['Last updated', new Date(selected.updatedAt).toLocaleString()],
              ].map(([label, value]) => (
                <div key={label} className="rounded-lg bg-surface/60 p-3">
                  <p className="text-xs font-semibold uppercase tracking-wide text-muted">{label}</p>
                  <p className="mt-1 break-words text-sm text-ink">{value}</p>
                </div>
              ))}
            </div>

            {selected.message && (
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-muted">Message</p>
                <p className="mt-1 whitespace-pre-wrap rounded-lg bg-surface/60 p-3 text-sm text-ink">{selected.message}</p>
              </div>
            )}

            <div className="flex flex-wrap gap-3">
              <a href={`mailto:${selected.email}?subject=${encodeURIComponent(`Re: Your enquiry — ${selected.commodity}`)}`} className="btn-outline px-4 py-2 text-sm">
                Email {selected.email}
              </a>
              {selected.customer && (
                <span className="inline-flex items-center rounded-full bg-surface px-3 py-2 text-xs font-medium text-muted">
                  Linked to a registered customer account
                </span>
              )}
            </div>

            {/* Status + internal notes */}
            <div className="rounded-xl border border-gray-200 p-4">
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div>
                  <label htmlFor="enquiry-status-update" className="label-base">Status</label>
                  <select
                    id="enquiry-status-update"
                    value={statusUpdate}
                    onChange={(e) => setStatusUpdate(e.target.value)}
                    className="input-base"
                  >
                    {ENQUIRY_STATUSES.map((s) => <option key={s} value={s}>{s.replace(/_/g, ' ')}</option>)}
                  </select>
                </div>
                <div>
                  <label htmlFor="enquiry-followup" className="label-base">Follow-up date</label>
                  <input
                    id="enquiry-followup"
                    type="date"
                    value={followUpDate}
                    onChange={(e) => setFollowUpDate(e.target.value)}
                    className="input-base"
                  />
                </div>
              </div>
              <div className="mt-4">
                <label htmlFor="enquiry-notes" className="label-base">Internal notes</label>
                <textarea
                  id="enquiry-notes"
                  rows={2}
                  value={internalNotes}
                  onChange={(e) => setInternalNotes(e.target.value)}
                  placeholder="Internal notes (not shared with the customer)…"
                  className="input-base"
                />
              </div>
              <div className="mt-3 flex justify-end">
                <button
                  type="button"
                  onClick={requestStatusUpdate}
                  disabled={busy || !statusUpdate || statusUpdate === selected.status}
                  className="btn-primary disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Save status & notes
                </button>
              </div>
            </div>

            {/* Reply */}
            <div>
              <label htmlFor="enquiry-reply" className="label-base">Reply to buyer</label>
              <textarea
                id="enquiry-reply"
                rows={3}
                value={replyDraft}
                onChange={(e) => setReplyDraft(e.target.value)}
                placeholder="Write a response — it will be emailed to the customer and stored here…"
                className="input-base"
              />
              <div className="mt-2 flex justify-end">
                <button
                  type="button"
                  onClick={sendReply}
                  disabled={busy || !replyDraft.trim()}
                  className="btn-primary disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Send reply
                </button>
              </div>

              {selected.replies?.length > 0 && (
                <ul className="mt-4 space-y-2">
                  {selected.replies.map((reply, i) => (
                    <li key={i} className="rounded-lg border border-gray-200 bg-surface/60 p-3">
                      <p className="text-sm text-ink">{reply.message}</p>
                      <p className="mt-1 text-xs text-muted">
                        {reply.sentBy?.name || 'Admin'} · {new Date(reply.createdAt).toLocaleString()}
                      </p>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            <div className="border-t border-gray-100 pt-4">
              <button
                type="button"
                onClick={requestDelete}
                className="rounded-lg border border-red-200 px-4 py-2 text-sm font-semibold text-red-600 transition-colors hover:bg-red-50"
              >
                Delete enquiry
              </button>
            </div>
          </div>
        ) : null}
      </Modal>

      <ConfirmDialog
        open={!!confirm}
        onClose={() => setConfirm(null)}
        onConfirm={runConfirmed}
        busy={busy}
        title={confirm?.type === 'delete' ? 'Delete enquiry' : 'Update enquiry'}
        message={
          confirm?.type === 'delete'
            ? 'Permanently delete this enquiry? This cannot be undone.'
            : `Mark this enquiry as “${statusUpdate.replace(/_/g, ' ')}” and save the internal notes / follow-up date? The customer is notified of status changes by email.`
        }
        confirmLabel={confirm?.type === 'delete' ? 'Delete enquiry' : 'Save changes'}
        danger={confirm?.type === 'delete'}
      />
    </div>
  )
}
