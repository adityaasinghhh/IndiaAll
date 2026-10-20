import { useCallback, useEffect, useMemo, useState } from 'react'
import { adminApi } from '../../services/adminApi.js'
import { useToast } from './Toast.jsx'
import {
  DateRangeFilter,
  DonutChart,
  EmptyState,
  ErrorState,
  KpiCard,
  LineChart,
  Skeleton,
  StatusBadge,
  ORDER_STATUS_TONES,
  ENQUIRY_STATUS_TONES,
} from './ui.jsx'

const ICONS = {
  orders: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2H2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2',
  enquiries: 'M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z',
  products: 'M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4',
  customers: 'M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z',
  activity: 'M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z',
}

function ChartSkeleton() {
  return (
    <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-card">
      <Skeleton className="mb-4 h-5 w-40" />
      <Skeleton className="h-48 w-full" />
    </div>
  )
}

/** Format a KPI count for display, with a sensible fallback. */
function formatCount(value) {
  if (value === undefined || value === null) return '—'
  const number = Number(value)
  if (!Number.isFinite(number)) return '—'
  return number.toLocaleString('en-US')
}

/** Format a date or timestamp for display, with a sensible fallback. */
function formatDate(value) {
  const date = value ? new Date(value) : null
  if (!date || Number.isNaN(date.getTime())) return '—'
  return date.toLocaleDateString('en-US')
}

/** Format a datetime for display, with a sensible fallback. */
function formatDateTime(value) {
  const date = value ? new Date(value) : null
  if (!date || Number.isNaN(date.getTime())) return '—'
  return date.toLocaleString('en-US')
}

export default function OverviewPage() {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [error, setError] = useState('')
  const [range, setRange] = useState({ from: '', to: '' })
  const toast = useToast()

  const load = useCallback(async (silent = false) => {
    if (silent) setRefreshing(true)
    else setLoading(true)
    setError('')
    try {
      const params = {}
      if (range.from) params.from = range.from
      if (range.to) params.to = range.to
      const result = await adminApi.getDashboard(params)
      setData(result)
    } catch (err) {
      if (err.status === 401) return // the shell handles re-auth
      setError(err.message || 'Unable to load dashboard metrics.')
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }, [range])

  useEffect(() => { load() }, [load])

  const statusDistribution = useMemo(() => {
    if (!data) return []
    const entries = Object.entries({
      pending: data.orders?.new ?? 0,
      in_review: data.orders?.inReview ?? 0,
      quoted: data.orders?.quoted ?? 0,
      confirmed: data.orders?.confirmed ?? 0,
      processing: data.orders?.processing ?? 0,
      completed: data.orders?.completed ?? 0,
      cancelled: data.orders?.cancelled ?? 0,
    })
    return entries
      .filter(([, value]) => value > 0)
      .map(([label, value]) => ({ label: label.replace(/_/g, ' '), value }))
  }, [data])

  const trendData = useMemo(() => {
    if (!data?.ordersByMonth) return []
    return data.ordersByMonth
      .map((entry) => {
        const year = entry?._id?.year
        const month = entry?._id?.month
        if (!Number.isInteger(year) || !Number.isInteger(month)) return null
        const date = new Date(year, month - 1)
        if (Number.isNaN(date.getTime())) return null
        return {
          label: date.toLocaleDateString('en-US', { month: 'short' }),
          value: entry.count ?? 0,
        }
      })
      .filter(Boolean)
  }, [data])

  const pageTitle = 'Dashboard overview'

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="eyebrow">Operations</p>
          <h2 className="mt-1 font-serif text-2xl font-semibold text-navy">{pageTitle}</h2>
          <p className="mt-1 text-sm text-muted">
            {data?.range?.from && data?.range?.to
              ? `Filtered from ${formatDate(data.range.from)} to ${formatDate(data.range.to)}.`
              : 'All-time figures, updated in real time.'}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <DateRangeFilter from={range.from} to={range.to} onChange={setRange} />
          <button
            type="button"
            onClick={() => load(true)}
            disabled={refreshing}
            className="btn-outline px-4 py-2 text-sm disabled:opacity-50"
          >
            {refreshing ? 'Refreshing…' : 'Refresh'}
          </button>
        </div>
      </div>

      {error && !data && (
        <ErrorState title="Unable to load the dashboard" message={error} onRetry={() => load()} />
      )}
      {error && data && (
        <div role="alert" className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-800">{error}</div>
      )}

      {/* KPI grid */}
      {loading && !data ? (
        <div className="grid grid-cols-2 gap-4 md:grid-cols-3 xl:grid-cols-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="rounded-xl border border-gray-200 bg-white p-5 shadow-card">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="mt-3 h-8 w-16" />
            </div>
          ))}
        </div>
      ) : data ? (
        <div className="grid grid-cols-2 gap-4 md:grid-cols-3 xl:grid-cols-4">
          <KpiCard label="Total orders" value={formatCount(data.orders?.total)} icon={ICONS.orders} />
          <KpiCard label="New orders" value={formatCount(data.orders?.new)} subtext="Awaiting review" />
          <KpiCard label="In review" value={formatCount(data.orders?.inReview)} />
          <KpiCard label="Processing" value={formatCount(data.orders?.processing)} subtext="Sourcing through delivery" />
          <KpiCard label="Completed" value={formatCount(data.orders?.completed)} />
          <KpiCard label="Total enquiries" value={formatCount(data.enquiries?.total)} icon={ICONS.enquiries} />
          <KpiCard label="New enquiries" value={formatCount(data.enquiries?.new)} />
          <KpiCard
            label="Active products"
            value={formatCount(data.products?.visible)}
            subtext={`${data.products?.total ?? 0} total`}
            icon={ICONS.products}
          />
          <KpiCard
            label="Customers"
            value={formatCount(data.customers?.total)}
            subtext={`${data.customers?.newThisMonth ?? 0} this month`}
            icon={ICONS.customers}
          />
        </div>
      ) : null}

      {/* Charts */}
      <div className="grid grid-cols-1 gap-6 xl:grid-cols-5">
        <section className="rounded-xl border border-gray-200 bg-white p-5 shadow-card xl:col-span-3">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="font-serif text-lg font-semibold text-navy">Orders over time</h3>
            {data?.range && <span className="text-xs text-muted">selected range</span>}
          </div>
          {loading && !data ? <Skeleton className="h-48 w-full" /> : (
            <LineChart
              data={trendData}
              formatLabel={(v) => v}
              formatValue={(v) => `${v} order${v === 1 ? '' : 's'}`}
              yLabel="Orders per month"
            />
          )}
        </section>

        <section className="rounded-xl border border-gray-200 bg-white p-5 shadow-card xl:col-span-2">
          <h3 className="mb-4 font-serif text-lg font-semibold text-navy">Order status distribution</h3>
          {loading && !data ? <Skeleton className="h-48 w-full" /> : <DonutChart data={statusDistribution} />}
        </section>
      </div>

      {/* Recent activity columns */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Recent orders */}
        <section className="rounded-xl border border-gray-200 bg-white p-5 shadow-card">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="font-serif text-lg font-semibold text-navy">Recent orders</h3>
            <span className="text-xs text-muted">Latest 5</span>
          </div>
          {loading && !data ? (
            <Skeleton className="h-40 w-full" />
          ) : !data?.recentOrders?.length ? (
            <EmptyState
              title="No orders yet"
              message="Orders submitted through the public bulk order form will appear here."
            />
          ) : (
            <ul className="divide-y divide-gray-100">
              {data.recentOrders.map((order) => (
                <li key={order._id} className="flex items-center justify-between gap-3 py-3">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-ink">{order.company}</p>
                    <p className="truncate text-xs text-muted">
                      {order.commodity === 'other' ? order.otherCommodity : order.commodity} · {order.quantity} {order.unit}
                    </p>
                  </div>
                  <div className="flex shrink-0 items-center gap-3">
                    <span className="text-xs text-muted">{formatDate(order.createdAt)}</span>
                    <StatusBadge status={order.status} tone={ORDER_STATUS_TONES[order.status]} />
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>

        {/* Recent enquiries */}
        <section className="rounded-xl border border-gray-200 bg-white p-5 shadow-card">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="font-serif text-lg font-semibold text-navy">Recent enquiries</h3>
            <span className="text-xs text-muted">Latest 5</span>
          </div>
          {loading && !data ? (
            <Skeleton className="h-40 w-full" />
          ) : !data?.recentEnquiries?.length ? (
            <EmptyState
              title="No enquiries yet"
              message="Enquiries submitted through the website contact form will appear here."
            />
          ) : (
            <ul className="divide-y divide-gray-100">
              {data.recentEnquiries.map((enquiry) => (
                <li key={enquiry._id} className="flex items-center justify-between gap-3 py-3">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-ink">{enquiry.name} · {enquiry.company}</p>
                    <p className="truncate text-xs text-muted">{enquiry.commodity} → {enquiry.deliveryLocation}</p>
                  </div>
                  <div className="flex shrink-0 items-center gap-3">
                    <span className="text-xs text-muted">{formatDate(enquiry.createdAt)}</span>
                    <StatusBadge status={enquiry.status} tone={ENQUIRY_STATUS_TONES[enquiry.status]} />
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>

        {/* Latest customers */}
        <section className="rounded-xl border border-gray-200 bg-white p-5 shadow-card">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="font-serif text-lg font-semibold text-navy">Latest customers</h3>
            <span className="text-xs text-muted">Latest 5</span>
          </div>
          {loading && !data ? (
            <Skeleton className="h-40 w-full" />
          ) : !data?.recentCustomers?.length ? (
            <EmptyState
              title="No registered customers yet"
              message="New customer registrations will appear here."
            />
          ) : (
            <ul className="divide-y divide-gray-100">
              {data.recentCustomers.map((customer) => (
                <li key={customer._id} className="flex items-center justify-between gap-3 py-3">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-ink">{customer.name}</p>
                    <p className="truncate text-xs text-muted">{customer.company} · {customer.country}</p>
                  </div>
                  <span className="shrink-0 text-xs text-muted">{formatDate(customer.createdAt)}</span>
                </li>
              ))}
            </ul>
          )}
        </section>

        {/* Recent administrative activity */}
        <section className="rounded-xl border border-gray-200 bg-white p-5 shadow-card">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="font-serif text-lg font-semibold text-navy">Administrative activity</h3>
            <span className="text-xs text-muted">Latest 8</span>
          </div>
          {loading && !data ? (
            <Skeleton className="h-40 w-full" />
          ) : !data?.recentActivity?.length ? (
            <EmptyState
              title="No administrative activity yet"
              message="Actions such as status changes and product edits are recorded here."
            />
          ) : (
            <ul className="divide-y divide-gray-100">
              {data.recentActivity.map((log) => (
                <li key={log._id} className="flex items-center justify-between gap-3 py-3">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-ink">{log.action.replace(/_/g, ' ')}</p>
                    <p className="truncate text-xs text-muted">{log.admin?.name || 'Admin'} · {log.targetType}</p>
                  </div>
                  <span className="shrink-0 text-xs text-muted">{formatDateTime(log.createdAt)}</span>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>

      {/* Metric definitions */}
      <section className="rounded-xl border border-gray-200 bg-white p-5 shadow-card">
        <h3 className="mb-3 font-serif text-lg font-semibold text-navy">How these metrics are counted</h3>
        <dl className="grid grid-cols-1 gap-3 text-sm sm:grid-cols-2 lg:grid-cols-3">
          {[
            ['Total orders', 'Every custom bulk order request received, across all statuses.'],
            ['New orders', 'Orders in the pending status, awaiting first review.'],
            ['Processing', 'Orders being actively worked: sourcing, ready for dispatch, shipped or delivered.'],
            ['Completed', 'Orders marked as completed. Cancelled and closed orders are counted separately.'],
            ['Total enquiries', 'Every enquiry received through the website enquiry form.'],
            ['Active products', 'Products visible in the public catalogue.'],
          ].map(([term, definition]) => (
            <div key={term} className="rounded-lg bg-surface/60 p-3">
              <dt className="font-semibold text-ink">{term}</dt>
              <dd className="mt-1 text-muted">{definition}</dd>
            </div>
          ))}
        </dl>
        <p className="mt-4 text-xs text-muted">
          Revenue and order value metrics are not shown: the business does not record confirmed prices on orders, so any revenue figure would be fabricated.
        </p>
      </section>
    </div>
  )
}
