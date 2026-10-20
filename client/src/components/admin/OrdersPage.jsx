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
  ORDER_STATUS_TONES,
} from './ui.jsx'

const ORDER_STATUSES = [
  'pending', 'in_review', 'quoted', 'confirmed', 'processing', 'sourcing',
  'ready_for_dispatch', 'shipped', 'delivered', 'completed', 'cancelled', 'closed',
]

const PAGE_SIZE = 15

function debounce(value, delay, onChange) {
  const handle = setTimeout(() => onChange(value), delay)
  return () => clearTimeout(handle)
}

export default function OrdersPage() {
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [searchInput, setSearchInput] = useState('')
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [range, setRange] = useState({ from: '', to: '' })
  const [page, setPage] = useState(1)
  const [pagination, setPagination] = useState(null)
  const [sort, setSort] = useState({ key: 'createdAt', dir: 'desc' })
  const [selectedId, setSelectedId] = useState(null)
  const [selectedOrder, setSelectedOrder] = useState(null)
  const [detailLoading, setDetailLoading] = useState(false)
  const [statusUpdate, setStatusUpdate] = useState('')
  const [statusNote, setStatusNote] = useState('')
  const [noteText, setNoteText] = useState('')
  const [busy, setBusy] = useState(false)
  const [confirmStatus, setConfirmStatus] = useState(null)
  const toast = useToast()
  const requestId = useRef(0)

  // Debounce the search box so we don't fire a request per keystroke.
  useEffect(() => debounce(searchInput, 350, (value) => { setSearch(value); setPage(1) }), [searchInput])

  const load = useCallback(async () => {
    const id = ++requestId.current
    setLoading(true)
    setError('')
    try {
      const params = { page: String(page), limit: String(PAGE_SIZE), sort: sort.key, order: sort.dir }
      if (search) params.search = search
      if (statusFilter) params.status = statusFilter
      if (range.from) params.from = range.from
      if (range.to) params.to = range.to
      const result = await adminApi.getOrders(params)
      if (id !== requestId.current) return // a newer request superseded this one
      setOrders(result.orders)
      setPagination(result.pagination)
    } catch (err) {
      if (err.status === 401) return
      if (id !== requestId.current) return
      setError(err.message || 'Unable to load orders.')
    } finally {
      if (id === requestId.current) setLoading(false)
    }
  }, [page, search, statusFilter, range, sort])

  useEffect(() => { load() }, [load])

  const openDetail = async (order) => {
    setSelectedId(order._id)
    setSelectedOrder(order)
    setStatusUpdate(order.status)
    setStatusNote('')
    setNoteText('')
    setDetailLoading(true)
    try {
      const result = await adminApi.getOrder(order._id)
      setSelectedOrder(result.order)
      setStatusUpdate(result.order.status)
    } catch (err) {
      if (err.status !== 401) toast.error(err.message || 'Unable to load order details.')
    } finally {
      setDetailLoading(false)
    }
  }

  const closeDetail = () => {
    setSelectedId(null)
    setSelectedOrder(null)
    setConfirmStatus(null)
  }

  const requestStatusChange = () => {
    if (!statusUpdate || statusUpdate === selectedOrder?.status) {
      toast.info('Select a different status first.')
      return
    }
    setConfirmStatus({ status: statusUpdate, note: statusNote })
  }

  const applyStatusChange = async () => {
    if (!confirmStatus || !selectedOrder) return
    setBusy(true)
    try {
      await adminApi.updateOrderStatus(selectedOrder._id, {
        status: confirmStatus.status,
        note: confirmStatus.note || undefined,
      })
      toast.success(`Order status updated to “${confirmStatus.status.replace(/_/g, ' ')}”.`)
      setConfirmStatus(null)
      closeDetail()
      load()
    } catch (err) {
      if (err.status !== 401) toast.error(err.message || 'Unable to update status.')
    } finally {
      setBusy(false)
    }
  }

  const addNote = async () => {
    if (!noteText.trim() || !selectedOrder) return
    setBusy(true)
    try {
      await adminApi.addOrderNote(selectedOrder._id, { message: noteText.trim() })
      toast.success('Note added.')
      setNoteText('')
      const result = await adminApi.getOrder(selectedOrder._id)
      setSelectedOrder(result.order)
    } catch (err) {
      if (err.status !== 401) toast.error(err.message || 'Unable to add note.')
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
      await downloadCsv(`/admin/orders/export/csv?${params}`, 'bulk-orders.csv')
      toast.success('Orders CSV downloaded.')
    } catch (err) {
      toast.error(err.message || 'Unable to export CSV.')
    }
  }

  const onSort = (key) => {
    setSort((prev) => (prev.key === key ? { key, dir: prev.dir === 'asc' ? 'desc' : 'asc' } : { key, dir: 'desc' }))
    setPage(1)
  }

  const columns = useMemo(() => [
    {
      key: 'company', label: 'Company', sortable: true,
      render: (o) => (
        <div>
          <p className="font-medium text-ink">{o.company}</p>
          <p className="text-xs text-muted">{o.fullName}</p>
        </div>
      ),
    },
    {
      key: 'commodity', label: 'Commodity', sortable: true,
      render: (o) => (
        <div>
          <p className="text-ink">{o.commodity === 'other' ? o.otherCommodity : o.commodity}</p>
          <p className="text-xs text-muted">{o.quantity} {o.unit}</p>
        </div>
      ),
    },
    { key: 'destination', label: 'Destination', render: (o) => <span className="text-muted">{o.destination}</span> },
    { key: 'createdAt', label: 'Date', sortable: true, render: (o) => <span className="text-muted">{new Date(o.createdAt).toLocaleDateString()}</span> },
    {
      key: 'status', label: 'Status', sortable: true,
      render: (o) => <StatusBadge status={o.status} tone={ORDER_STATUS_TONES[o.status]} />,
    },
    {
      key: 'actions', label: '',
      render: (o) => (
        <button
          type="button"
          onClick={() => openDetail(o)}
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
          <h2 className="mt-1 font-serif text-2xl font-semibold text-navy">Orders</h2>
          <p className="mt-1 text-sm text-muted">Custom bulk order requests from the website.</p>
        </div>
        <button type="button" onClick={exportCsv} className="btn-outline px-4 py-2 text-sm">
          Export CSV
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-col gap-3 rounded-xl border border-gray-200 bg-white p-4 shadow-card lg:flex-row lg:items-end">
        <div className="flex-1">
          <label htmlFor="order-search" className="label-base">Search</label>
          <input
            id="order-search"
            type="search"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder="Company, contact, commodity, reference…"
            className="input-base"
          />
        </div>
        <div>
          <label htmlFor="order-status-filter" className="label-base">Status</label>
          <select
            id="order-status-filter"
            value={statusFilter}
            onChange={(e) => { setStatusFilter(e.target.value); setPage(1) }}
            className="input-base w-full lg:w-48"
          >
            <option value="">All statuses</option>
            {ORDER_STATUSES.map((s) => <option key={s} value={s}>{s.replace(/_/g, ' ')}</option>)}
          </select>
        </div>
        <div>
          <span className="label-base">Date range</span>
          <DateRangeFilter from={range.from} to={range.to} onChange={(r) => { setRange(r); setPage(1) }} />
        </div>
      </div>

      {error && <ErrorState title="Unable to load orders" message={error} onRetry={load} />}

      <DataTable
        columns={columns}
        rows={orders}
        rowKey={(o) => o._id}
        loading={loading}
        emptyMessage={search || statusFilter || range.from || range.to ? 'No orders match the current filters.' : 'No orders have been submitted yet.'}
        sort={sort}
        onSort={onSort}
      />

      {pagination && (
        <Pagination
          page={pagination.page}
          pages={pagination.pages}
          total={pagination.total}
          onPageChange={setPage}
        />
      )}

      {/* Detail modal */}
      <Modal open={!!selectedId} onClose={closeDetail} title={selectedOrder ? `Order — ${selectedOrder.company}` : 'Order'} wide>
        {detailLoading && !selectedOrder ? (
          <p className="py-10 text-center text-muted">Loading order…</p>
        ) : selectedOrder ? (
          <div className="space-y-6">
            <div className="flex flex-wrap items-center gap-3">
              <StatusBadge status={selectedOrder.status} tone={ORDER_STATUS_TONES[selectedOrder.status]} />
              <span className="text-sm text-muted">
                Submitted {new Date(selectedOrder.createdAt).toLocaleString()}
              </span>
              {selectedOrder.reference && <span className="text-sm text-muted">Ref: {selectedOrder.reference}</span>}
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {[
                ['Contact', selectedOrder.fullName],
                ['Email', selectedOrder.email],
                ['Phone', selectedOrder.phone || '—'],
                ['Country', selectedOrder.country],
                ['Commodity', selectedOrder.commodity === 'other' ? selectedOrder.otherCommodity : selectedOrder.commodity],
                ['Quantity', `${selectedOrder.quantity} ${selectedOrder.unit}`],
                ['Destination', selectedOrder.destination],
                ['Packaging', selectedOrder.packaging || '—'],
                ['Grade / specs', selectedOrder.grade || '—'],
                ['Delivery timeframe', selectedOrder.deliveryTimeframe || '—'],
                ['Incoterms', selectedOrder.incoterms || '—'],
                ['Target price', selectedOrder.targetPrice || '—'],
              ].map(([label, value]) => (
                <div key={label} className="rounded-lg bg-surface/60 p-3">
                  <p className="text-xs font-semibold uppercase tracking-wide text-muted">{label}</p>
                  <p className="mt-1 break-words text-sm text-ink">{value}</p>
                </div>
              ))}
            </div>

            {selectedOrder.message && (
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-muted">Requirements</p>
                <p className="mt-1 whitespace-pre-wrap rounded-lg bg-surface/60 p-3 text-sm text-ink">{selectedOrder.message}</p>
              </div>
            )}

            {/* Status history */}
            {selectedOrder.statusHistory?.length > 0 && (
              <div>
                <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted">Status history</p>
                <ol className="space-y-1.5">
                  {selectedOrder.statusHistory.map((entry, i) => (
                    <li key={i} className="flex items-center gap-3 text-sm">
                      <StatusBadge status={entry.status} tone={ORDER_STATUS_TONES[entry.status]} />
                      <span className="text-xs text-muted">{new Date(entry.createdAt).toLocaleString()}</span>
                    </li>
                  ))}
                </ol>
              </div>
            )}

            {/* Status update */}
            <div className="rounded-xl border border-gray-200 p-4">
              <label htmlFor="order-status-update" className="label-base">Update status</label>
              <div className="flex flex-col gap-3 sm:flex-row">
                <select
                  id="order-status-update"
                  value={statusUpdate}
                  onChange={(e) => setStatusUpdate(e.target.value)}
                  className="input-base flex-1"
                >
                  {ORDER_STATUSES.map((s) => <option key={s} value={s}>{s.replace(/_/g, ' ')}</option>)}
                </select>
                <button
                  type="button"
                  onClick={requestStatusChange}
                  disabled={busy || !statusUpdate || statusUpdate === selectedOrder.status}
                  className="btn-primary disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Update status
                </button>
              </div>
              <textarea
                id="order-status-note"
                rows={2}
                value={statusNote}
                onChange={(e) => setStatusNote(e.target.value)}
                placeholder="Optional note about this change (stored with the status history)…"
                className="input-base mt-3"
              />
            </div>

            {/* Notes */}
            <div>
              <label htmlFor="order-note" className="label-base">Add internal note</label>
              <textarea
                id="order-note"
                rows={2}
                value={noteText}
                onChange={(e) => setNoteText(e.target.value)}
                placeholder="Internal note (not shared with the customer)…"
                className="input-base"
              />
              <div className="mt-2 flex justify-end">
                <button
                  type="button"
                  onClick={addNote}
                  disabled={busy || !noteText.trim()}
                  className="btn-outline px-4 py-2 text-sm disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Add note
                </button>
              </div>

              {selectedOrder.notes?.length > 0 && (
                <ul className="mt-4 space-y-2">
                  {selectedOrder.notes.map((note, i) => (
                    <li key={i} className="rounded-lg border border-gray-200 bg-surface/60 p-3">
                      <p className="text-sm text-ink">{note.message}</p>
                      <p className="mt-1 text-xs text-muted">
                        {note.sentBy?.name || 'Admin'} · {new Date(note.createdAt).toLocaleString()}
                      </p>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        ) : null}
      </Modal>

      {/* Status change confirmation */}
      <ConfirmDialog
        open={!!confirmStatus}
        onClose={() => setConfirmStatus(null)}
        onConfirm={applyStatusChange}
        busy={busy}
        title="Change order status"
        message={`Change status from “${selectedOrder?.status.replace(/_/g, ' ')}” to “${confirmStatus?.status.replace(/_/g, ' ')}”? The customer will see the updated status.`}
        confirmLabel="Change status"
      />
    </div>
  )
}
