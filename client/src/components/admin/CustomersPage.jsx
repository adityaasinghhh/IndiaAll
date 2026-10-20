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
} from './ui.jsx'

const PAGE_SIZE = 15

export default function CustomersPage() {
  const [customers, setCustomers] = useState([])
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
  const [confirm, setConfirm] = useState(null)
  const [busy, setBusy] = useState(false)
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
      const result = await adminApi.getCustomers(params)
      if (id !== requestId.current) return
      setCustomers(result.customers)
      setPagination(result.pagination)
    } catch (err) {
      if (err.status === 401) return
      if (id !== requestId.current) return
      setError(err.message || 'Unable to load customers.')
    } finally {
      if (id === requestId.current) setLoading(false)
    }
  }, [page, search, statusFilter, range])

  useEffect(() => { load() }, [load])

  const openDetail = async (customer) => {
    setSelected(customer)
    setDetailLoading(true)
    try {
      const result = await adminApi.getCustomer(customer._id)
      setSelected(result)
    } catch (err) {
      if (err.status !== 401) toast.error(err.message || 'Unable to load customer details.')
    } finally {
      setDetailLoading(false)
    }
  }

  const requestToggleSuspend = () => {
    if (!selected?.customer) return
    setConfirm({ type: 'suspend', suspended: !selected.customer.suspended })
  }

  const requestDelete = () => setConfirm({ type: 'delete' })

  const runConfirmed = async () => {
    if (!confirm || !selected) return
    setBusy(true)
    try {
      if (confirm.type === 'suspend') {
        await adminApi.updateCustomerStatus(selected.customer._id, { suspended: confirm.suspended })
        toast.success(confirm.suspended ? `${selected.customer.name} suspended.` : `${selected.customer.name} reactivated.`)
      } else if (confirm.type === 'delete') {
        await adminApi.deleteCustomer(selected.customer._id)
        toast.success(`${selected.customer.name} deleted.`)
      }
      setConfirm(null)
      setSelected(null)
      load()
    } catch (err) {
      if (err.status !== 401) toast.error(err.message || 'The action could not be completed.')
    } finally {
      setBusy(false)
    }
  }

  const exportCsv = async () => {
    try {
      await downloadCsv('/admin/customers/export/csv', 'customers.csv')
      toast.success('Customers CSV downloaded.')
    } catch (err) {
      toast.error(err.message || 'Unable to export CSV.')
    }
  }

  const columns = useMemo(() => [
    {
      key: 'name', label: 'Customer',
      render: (c) => (
        <div>
          <p className="font-medium text-ink">{c.name}</p>
          <p className="text-xs text-muted">{c.company}</p>
        </div>
      ),
    },
    { key: 'email', label: 'Email', render: (c) => <span className="text-muted">{c.email}</span> },
    { key: 'country', label: 'Country', render: (c) => <span className="text-muted">{c.country}</span> },
    { key: 'createdAt', label: 'Joined', render: (c) => <span className="text-muted">{new Date(c.createdAt).toLocaleDateString()}</span> },
    {
      key: 'status', label: 'Status',
      render: (c) => (
        <div className="flex items-center gap-2">
          <StatusBadge status={c.suspended ? 'suspended' : 'active'} tone={c.suspended ? 'red' : 'green'} />
          {!c.isEmailVerified && <StatusBadge status="unverified" tone="amber" />}
        </div>
      ),
    },
    {
      key: 'actions', label: '',
      render: (c) => (
        <button
          type="button"
          onClick={() => openDetail(c)}
          className="rounded-lg border border-gray-200 px-3 py-1.5 text-xs font-semibold text-ink transition-colors hover:border-gold hover:text-gold-dark"
        >
          View
        </button>
      ),
    },
  ], [])

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="eyebrow">Accounts</p>
          <h2 className="mt-1 font-serif text-2xl font-semibold text-navy">Customers</h2>
          <p className="mt-1 text-sm text-muted">Registered customer accounts on the website.</p>
        </div>
        <button type="button" onClick={exportCsv} className="btn-outline px-4 py-2 text-sm">Export CSV</button>
      </div>

      <div className="flex flex-col gap-3 rounded-xl border border-gray-200 bg-white p-4 shadow-card lg:flex-row lg:items-end">
        <div className="flex-1">
          <label htmlFor="customer-search" className="label-base">Search</label>
          <input
            id="customer-search"
            type="search"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder="Name, company, email, country…"
            className="input-base"
          />
        </div>
        <div>
          <label htmlFor="customer-status" className="label-base">Status</label>
          <select
            id="customer-status"
            value={statusFilter}
            onChange={(e) => { setStatusFilter(e.target.value); setPage(1) }}
            className="input-base w-full lg:w-44"
          >
            <option value="">All</option>
            <option value="active">Active</option>
            <option value="suspended">Suspended</option>
            <option value="unverified">Email unverified</option>
          </select>
        </div>
        <div>
          <span className="label-base">Registered</span>
          <DateRangeFilter from={range.from} to={range.to} onChange={(r) => { setRange(r); setPage(1) }} />
        </div>
      </div>

      {error && <ErrorState title="Unable to load customers" message={error} onRetry={load} />}

      <DataTable
        columns={columns}
        rows={customers}
        rowKey={(c) => c._id}
        loading={loading}
        emptyMessage={search || statusFilter || range.from || range.to ? 'No customers match the current filters.' : 'No customers have registered yet.'}
      />

      {pagination && (
        <Pagination page={pagination.page} pages={pagination.pages} total={pagination.total} onPageChange={setPage} />
      )}

      {/* Detail modal */}
      <Modal open={!!selected} onClose={() => { setSelected(null); setConfirm(null) }} title={selected?.customer ? selected.customer.name : 'Customer'} wide>
        {detailLoading && !selected?.customer ? (
          <p className="py-10 text-center text-muted">Loading customer…</p>
        ) : selected?.customer ? (
          <div className="space-y-6">
            <div className="flex flex-wrap items-center gap-3">
              <StatusBadge status={selected.customer.suspended ? 'suspended' : 'active'} tone={selected.customer.suspended ? 'red' : 'green'} />
              {!selected.customer.isEmailVerified && <StatusBadge status="unverified" tone="amber" />}
              <span className="text-sm text-muted">Joined {new Date(selected.customer.createdAt).toLocaleDateString()}</span>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {[
                ['Name', selected.customer.name],
                ['Company', selected.customer.company],
                ['Email', selected.customer.email],
                ['Phone', selected.customer.phone],
                ['Country', selected.customer.country],
                ['Email verified', selected.customer.isEmailVerified ? 'Yes' : 'No'],
              ].map(([label, value]) => (
                <div key={label} className="rounded-lg bg-surface/60 p-3">
                  <p className="text-xs font-semibold uppercase tracking-wide text-muted">{label}</p>
                  <p className="mt-1 break-words text-sm text-ink">{value}</p>
                </div>
              ))}
            </div>

            <div className="flex flex-wrap gap-3">
              <a href={`mailto:${selected.customer.email}`} className="btn-outline px-4 py-2 text-sm">Email customer</a>
              <button
                type="button"
                onClick={requestToggleSuspend}
                className="btn-outline px-4 py-2 text-sm"
              >
                {selected.customer.suspended ? 'Reactivate account' : 'Suspend account'}
              </button>
              <button
                type="button"
                onClick={requestDelete}
                className="rounded-lg border border-red-200 px-4 py-2 text-sm font-semibold text-red-600 transition-colors hover:bg-red-50"
              >
                Delete account
              </button>
            </div>

            {/* Order history */}
            <div>
              <h4 className="mb-3 font-serif text-base font-semibold text-navy">
                Order history <span className="ml-1 text-sm font-normal text-muted">({selected.stats?.orders ?? 0})</span>
              </h4>
              {selected.orders?.length > 0 ? (
                <ul className="divide-y divide-gray-100 rounded-xl border border-gray-200">
                  {selected.orders.map((order) => (
                    <li key={order._id} className="flex items-center justify-between gap-3 px-4 py-3">
                      <div className="min-w-0">
                        <p className="truncate text-sm font-medium text-ink">{order.company}</p>
                        <p className="truncate text-xs text-muted">
                          {order.commodity === 'other' ? order.otherCommodity : order.commodity} · {order.quantity} {order.unit}
                        </p>
                      </div>
                      <div className="flex shrink-0 items-center gap-3">
                        <span className="text-xs text-muted">{new Date(order.createdAt).toLocaleDateString()}</span>
                        <StatusBadge status={order.status} />
                      </div>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="rounded-lg bg-surface/60 p-4 text-sm text-muted">No orders from this customer yet.</p>
              )}
            </div>

            {/* Enquiry history */}
            <div>
              <h4 className="mb-3 font-serif text-base font-semibold text-navy">
                Enquiry history <span className="ml-1 text-sm font-normal text-muted">({selected.stats?.enquiries ?? 0})</span>
              </h4>
              {selected.enquiries?.length > 0 ? (
                <ul className="divide-y divide-gray-100 rounded-xl border border-gray-200">
                  {selected.enquiries.map((enquiry) => (
                    <li key={enquiry._id} className="flex items-center justify-between gap-3 px-4 py-3">
                      <div className="min-w-0">
                        <p className="truncate text-sm font-medium text-ink">{enquiry.commodity}</p>
                        <p className="truncate text-xs text-muted">{enquiry.quantity} → {enquiry.deliveryLocation}</p>
                      </div>
                      <div className="flex shrink-0 items-center gap-3">
                        <span className="text-xs text-muted">{new Date(enquiry.createdAt).toLocaleDateString()}</span>
                        <StatusBadge status={enquiry.status} />
                      </div>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="rounded-lg bg-surface/60 p-4 text-sm text-muted">No enquiries from this customer yet.</p>
              )}
            </div>
          </div>
        ) : null}
      </Modal>

      <ConfirmDialog
        open={!!confirm}
        onClose={() => setConfirm(null)}
        onConfirm={runConfirmed}
        busy={busy}
        title={confirm?.type === 'delete' ? 'Delete customer' : confirm?.suspended ? 'Suspend customer' : 'Reactivate customer'}
        message={
          confirm?.type === 'delete'
            ? `Permanently delete ${selected?.customer?.name} and their account? Their orders and enquiries are kept for records. This cannot be undone.`
            : confirm?.suspended
              ? `Suspend ${selected?.customer?.name}? They will no longer be able to sign in.`
              : `Reactivate ${selected?.customer?.name}? They will be able to sign in again.`
        }
        confirmLabel={confirm?.type === 'delete' ? 'Delete account' : confirm?.suspended ? 'Suspend' : 'Reactivate'}
        danger={confirm?.type === 'delete' || confirm?.type === 'suspend'}
      />
    </div>
  )
}
