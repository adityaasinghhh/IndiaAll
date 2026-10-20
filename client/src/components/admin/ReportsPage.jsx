import { useCallback, useEffect, useMemo, useState } from 'react'
import { adminApi, downloadCsv } from '../../services/adminApi.js'
import { useToast } from './Toast.jsx'
import {
  BarList,
  DateRangeFilter,
  DonutChart,
  EmptyState,
  ErrorState,
  LineChart,
  Skeleton,
  StatusBadge,
  ORDER_STATUS_TONES,
  ENQUIRY_STATUS_TONES,
} from './ui.jsx'

function SectionSkeleton() {
  return (
    <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-card">
      <Skeleton className="mb-4 h-5 w-48" />
      <Skeleton className="h-40 w-full" />
    </div>
  )
}

export default function ReportsPage() {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [range, setRange] = useState({ from: '', to: '' })
  const toast = useToast()

  const load = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const params = {}
      if (range.from) params.from = range.from
      if (range.to) params.to = range.to
      const result = await adminApi.getReports(params)
      setData(result)
    } catch (err) {
      if (err.status === 401) return
      setError(err.message || 'Unable to load reports.')
    } finally {
      setLoading(false)
    }
  }, [range])

  useEffect(() => { load() }, [load])

  const hasData = data && (data.totals?.orders > 0 || data.totals?.enquiries > 0 || data.totals?.customers > 0)

  const ordersByStatusData = useMemo(
    () => (data?.ordersByStatus || []).map((entry) => ({ label: entry.status.replace(/_/g, ' '), value: entry.count })),
    [data]
  )
  const enquiriesByStatusData = useMemo(
    () => (data?.enquiriesByStatus || []).map((entry) => ({ label: entry.status.replace(/_/g, ' '), value: entry.count })),
    [data]
  )
  const registrationTrend = useMemo(
    () => (data?.customersByMonth || []).map((entry) => ({ label: entry.month, value: entry.count })),
    [data]
  )
  const orderTrend = useMemo(
    () => (data?.ordersByMonth || []).map((entry) => ({ label: entry.month, value: entry.count })),
    [data]
  )

  const conversionRate = useMemo(() => {
    if (!data?.totals?.enquiriesWithAccount) return null
    return Math.round((data.totals.convertedEnquiries / data.totals.enquiriesWithAccount) * 100)
  }, [data])

  const exportOrders = async () => {
    try {
      const params = new URLSearchParams()
      if (range.from) params.set('from', range.from)
      if (range.to) params.set('to', range.to)
      await downloadCsv(`/admin/orders/export/csv?${params}`, 'orders-report.csv')
      toast.success('Orders CSV downloaded.')
    } catch (err) {
      toast.error(err.message || 'Unable to export CSV.')
    }
  }

  const exportEnquiries = async () => {
    try {
      const params = new URLSearchParams()
      if (range.from) params.set('from', range.from)
      if (range.to) params.set('to', range.to)
      await downloadCsv(`/enquiries/export/csv?${params}`, 'enquiries-report.csv')
      toast.success('Enquiries CSV downloaded.')
    } catch (err) {
      toast.error(err.message || 'Unable to export CSV.')
    }
  }

  const exportCustomers = async () => {
    try {
      const params = new URLSearchParams()
      if (range.from) params.set('from', range.from)
      if (range.to) params.set('to', range.to)
      await downloadCsv(`/admin/customers/export/csv?${params}`, 'customers-report.csv')
      toast.success('Customers CSV downloaded.')
    } catch (err) {
      toast.error(err.message || 'Unable to export CSV.')
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="eyebrow">Analytics</p>
          <h2 className="mt-1 font-serif text-2xl font-semibold text-navy">Reports</h2>
          <p className="mt-1 text-sm text-muted">
            {data?.range
              ? `Data from ${new Date(data.range.from).toLocaleDateString()} to ${new Date(data.range.to).toLocaleDateString()}.`
              : 'All-time figures computed from the live database.'}
          </p>
        </div>
        <DateRangeFilter from={range.from} to={range.to} onChange={setRange} />
      </div>

      {error && <ErrorState title="Unable to load reports" message={error} onRetry={load} />}

      {loading && !data ? (
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <SectionSkeleton /><SectionSkeleton /><SectionSkeleton /><SectionSkeleton />
        </div>
      ) : data ? (
        <>
          {/* Totals */}
          <div className="grid grid-cols-2 gap-4 md:grid-cols-3 xl:grid-cols-6">
            {[
              ['Orders', data.totals?.orders],
              ['Completed', data.totals?.completedOrders],
              ['Cancelled / closed', data.totals?.cancelledOrders],
              ['Enquiries', data.totals?.enquiries],
              ['New customers', data.totals?.customers],
              ['Enquiries with account', data.totals?.enquiriesWithAccount],
            ].map(([label, value]) => (
              <div key={label} className="rounded-xl border border-gray-200 bg-white p-4 shadow-card">
                <p className="text-xs text-muted">{label}</p>
                <p className="mt-1 font-serif text-2xl font-semibold text-navy">{value ?? 0}</p>
              </div>
            ))}
          </div>

          {!hasData && (
            <EmptyState
              title="No data in this period yet"
              message="Reports are computed from real database records. Once orders, enquiries or registrations exist, charts and exports will appear here."
            />
          )}

          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            {/* Orders by status */}
            <section className="rounded-xl border border-gray-200 bg-white p-5 shadow-card">
              <h3 className="mb-4 font-serif text-lg font-semibold text-navy">Orders by status</h3>
              {ordersByStatusData.length > 0 ? <DonutChart data={ordersByStatusData} /> : <p className="py-6 text-center text-sm text-muted">No orders in this period.</p>}
            </section>

            {/* Enquiries by status */}
            <section className="rounded-xl border border-gray-200 bg-white p-5 shadow-card">
              <h3 className="mb-4 font-serif text-lg font-semibold text-navy">Enquiries by status</h3>
              {enquiriesByStatusData.length > 0 ? <DonutChart data={enquiriesByStatusData} /> : <p className="py-6 text-center text-sm text-muted">No enquiries in this period.</p>}
            </section>

            {/* Order trend */}
            <section className="rounded-xl border border-gray-200 bg-white p-5 shadow-card">
              <h3 className="mb-4 font-serif text-lg font-semibold text-navy">Orders by month</h3>
              <LineChart data={orderTrend} formatLabel={(v) => v} formatValue={(v) => `${v} order${v === 1 ? '' : 's'}`} yLabel="Orders per month" />
            </section>

            {/* Registration trend */}
            <section className="rounded-xl border border-gray-200 bg-white p-5 shadow-card">
              <h3 className="mb-4 font-serif text-lg font-semibold text-navy">Customer registrations by month</h3>
              <LineChart data={registrationTrend} formatLabel={(v) => v} formatValue={(v) => `${v} registration${v === 1 ? '' : 's'}`} yLabel="Registrations per month" />
            </section>

            {/* Conversion */}
            <section className="rounded-xl border border-gray-200 bg-white p-5 shadow-card">
              <h3 className="mb-4 font-serif text-lg font-semibold text-navy">Enquiry → order conversion</h3>
              {conversionRate !== null ? (
                <div className="space-y-4">
                  <div className="flex items-end gap-2">
                    <span className="font-serif text-5xl font-semibold text-navy">{conversionRate}%</span>
                    <span className="pb-2 text-sm text-muted">of enquiries from registered accounts led to an order</span>
                  </div>
                  <BarList
                    data={[
                      { label: 'Converted', value: data.totals.convertedEnquiries },
                      { label: 'Not yet converted', value: data.totals.enquiriesWithAccount - data.totals.convertedEnquiries },
                    ]}
                  />
                  <p className="text-xs text-muted">
                    Conversion links enquiries to orders through the shared customer account. Guest enquiries without an account cannot be linked and are excluded from this rate.
                  </p>
                </div>
              ) : (
                <p className="py-6 text-center text-sm text-muted">No enquiries from registered accounts in this period — conversion cannot be computed yet.</p>
              )}
            </section>

            {/* Product performance */}
            <section className="rounded-xl border border-gray-200 bg-white p-5 shadow-card">
              <h3 className="mb-4 font-serif text-lg font-semibold text-navy">Product demand</h3>
              {data.productPerformance?.length > 0 ? (
                <BarList
                  data={data.productPerformance.map((p) => ({ label: p.name, value: p.orders }))}
                  formatValue={(v) => `${v} order${v === 1 ? '' : 's'}`}
                  emptyMessage="No order data yet."
                />
              ) : (
                <p className="py-6 text-center text-sm text-muted">No order data in this period yet.</p>
              )}
              <p className="mt-3 text-xs text-muted">Counted from bulk order requests per commodity, matched to the catalogue.</p>
            </section>
          </div>

          {/* Detail tables */}
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            <section className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-card">
              <div className="border-b border-gray-200 px-5 py-4">
                <h3 className="font-serif text-lg font-semibold text-navy">Orders by status (detail)</h3>
              </div>
              <table className="w-full text-left text-sm">
                <tbody>
                  {(data.ordersByStatus || []).map((entry) => (
                    <tr key={entry.status} className="border-b border-gray-100 last:border-0">
                      <td className="px-5 py-3"><StatusBadge status={entry.status} tone={ORDER_STATUS_TONES[entry.status]} /></td>
                      <td className="px-5 py-3 text-right font-semibold text-ink">{entry.count}</td>
                    </tr>
                  ))}
                  {data.ordersByStatus?.length === 0 && (
                    <tr><td className="px-5 py-6 text-center text-muted" colSpan={2}>No orders in this period.</td></tr>
                  )}
                </tbody>
              </table>
            </section>

            <section className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-card">
              <div className="border-b border-gray-200 px-5 py-4">
                <h3 className="font-serif text-lg font-semibold text-navy">Enquiries by status (detail)</h3>
              </div>
              <table className="w-full text-left text-sm">
                <tbody>
                  {(data.enquiriesByStatus || []).map((entry) => (
                    <tr key={entry.status} className="border-b border-gray-100 last:border-0">
                      <td className="px-5 py-3"><StatusBadge status={entry.status} tone={ENQUIRY_STATUS_TONES[entry.status]} /></td>
                      <td className="px-5 py-3 text-right font-semibold text-ink">{entry.count}</td>
                    </tr>
                  ))}
                  {data.enquiriesByStatus?.length === 0 && (
                    <tr><td className="px-5 py-6 text-center text-muted" colSpan={2}>No enquiries in this period.</td></tr>
                  )}
                </tbody>
              </table>
            </section>
          </div>

          {/* Exports */}
          <section className="rounded-xl border border-gray-200 bg-white p-5 shadow-card">
            <h3 className="mb-1 font-serif text-lg font-semibold text-navy">Export data</h3>
            <p className="mb-4 text-sm text-muted">Exports respect the selected date range and contain only permitted fields.</p>
            <div className="flex flex-wrap gap-3">
              <button type="button" onClick={exportOrders} className="btn-outline">Orders CSV</button>
              <button type="button" onClick={exportEnquiries} className="btn-outline">Enquiries CSV</button>
              <button type="button" onClick={exportCustomers} className="btn-outline">Customers CSV</button>
            </div>
          </section>
        </>
      ) : null}
    </div>
  )
}
