import { useEffect, useRef, useState } from 'react'

/* -------------------------------------------------------------------------- */
/* Status badges                                                               */
/* -------------------------------------------------------------------------- */

const BADGE_TONES = {
  blue: 'bg-blue-100 text-blue-800',
  amber: 'bg-amber-100 text-amber-800',
  purple: 'bg-purple-100 text-purple-800',
  teal: 'bg-teal-100 text-teal-800',
  cyan: 'bg-cyan-100 text-cyan-800',
  indigo: 'bg-indigo-100 text-indigo-800',
  orange: 'bg-orange-100 text-orange-800',
  sky: 'bg-sky-100 text-sky-800',
  green: 'bg-green-100 text-green-800',
  emerald: 'bg-emerald-100 text-emerald-800',
  red: 'bg-red-100 text-red-800',
  gray: 'bg-gray-100 text-gray-800',
}

export const ORDER_STATUS_TONES = {
  pending: 'blue',
  in_review: 'amber',
  quoted: 'purple',
  confirmed: 'teal',
  processing: 'cyan',
  sourcing: 'indigo',
  ready_for_dispatch: 'orange',
  shipped: 'sky',
  delivered: 'green',
  completed: 'emerald',
  cancelled: 'red',
  closed: 'gray',
}

export const ENQUIRY_STATUS_TONES = {
  new: 'blue',
  in_review: 'amber',
  quoted: 'purple',
  closed: 'gray',
}

export function StatusBadge({ status, tone, children }) {
  const color = BADGE_TONES[tone] || BADGE_TONES.gray
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ${color}`}>
      <span className="h-1.5 w-1.5 rounded-full bg-current" aria-hidden="true" />
      {children || String(status || '').replace(/_/g, ' ')}
    </span>
  )
}

/* -------------------------------------------------------------------------- */
/* Skeletons                                                                   */
/* -------------------------------------------------------------------------- */

export function Skeleton({ className = '' }) {
  return <div className={`animate-pulse rounded-lg bg-gray-200/70 ${className}`} aria-hidden="true" />
}

export function TableSkeleton({ rows = 5, columns = 5 }) {
  return (
    <div className="space-y-3 p-4" role="status" aria-label="Loading">
      <Skeleton className="h-8 w-full" />
      {Array.from({ length: rows }).map((_, i) => (
        <Skeleton key={i} className="h-10 w-full" />
      ))}
    </div>
  )
}

/* -------------------------------------------------------------------------- */
/* Icons (raw SVG path data rendered as an inline SVG)                       */
/* -------------------------------------------------------------------------- */

export function Icon({ path, className = '' }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d={path} />
    </svg>
  )
}

/* -------------------------------------------------------------------------- */
/* KPI card                                                                    */
/* -------------------------------------------------------------------------- */

export function KpiCard({ label, value, subtext, icon, loading }) {
  return (
    <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-card">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-sm text-muted">{label}</p>
          {loading ? (
            <Skeleton className="mt-2 h-8 w-20" />
          ) : (
            <p className="mt-2 font-serif text-3xl font-semibold text-navy">{value ?? '—'}</p>
          )}
          {subtext && !loading && <p className="mt-1 text-xs text-muted">{subtext}</p>}
        </div>
        {icon && (
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-gold/10 text-gold-dark" aria-hidden="true">
            <Icon path={icon} className="h-5 w-5" />
          </div>
        )}
      </div>
    </div>
  )
}

/* -------------------------------------------------------------------------- */
/* Empty / error states                                                        */
/* -------------------------------------------------------------------------- */

export function EmptyState({ title, message, action }) {
  return (
    <div className="rounded-xl border border-dashed border-gray-300 bg-white p-10 text-center">
      <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-surface text-muted">
        <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.6} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
        </svg>
      </div>
      <h3 className="font-serif text-lg font-semibold text-navy">{title}</h3>
      {message && <p className="mx-auto mt-1 max-w-sm text-sm text-muted">{message}</p>}
      {action && <div className="mt-5">{action}</div>}
    </div>
  )
}

export function ErrorState({ title = 'Something went wrong', message, onRetry }) {
  return (
    <div className="rounded-xl border border-red-200 bg-red-50 p-6" role="alert">
      <div className="flex items-start gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-red-100 text-red-600" aria-hidden="true">
          <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
          </svg>
        </div>
        <div className="min-w-0 flex-1">
          <h3 className="font-semibold text-red-900">{title}</h3>
          {message && <p className="mt-1 text-sm text-red-800">{message}</p>}
          {onRetry && (
            <button type="button" onClick={onRetry} className="btn-outline mt-4 border-red-300 px-4 py-2 text-sm text-red-800 hover:border-red-400">
              Try again
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

/* -------------------------------------------------------------------------- */
/* Pagination                                                                  */
/* -------------------------------------------------------------------------- */

export function Pagination({ page, pages, total, onPageChange }) {
  if (!pages || pages <= 1) return null

  const windowSize = 5
  let start = Math.max(1, page - Math.floor(windowSize / 2))
  const end = Math.min(pages, start + windowSize - 1)
  start = Math.max(1, end - windowSize + 1)
  const items = Array.from({ length: end - start + 1 }, (_, i) => start + i)

  return (
    <nav className="flex flex-wrap items-center justify-center gap-2" aria-label="Pagination">
      <button
        type="button"
        onClick={() => onPageChange(page - 1)}
        disabled={page <= 1}
        className="btn-outline px-4 py-2 text-sm disabled:cursor-not-allowed disabled:opacity-40"
      >
        Previous
      </button>
      {items.map((item) => (
        <button
          key={item}
          type="button"
          onClick={() => onPageChange(item)}
          aria-current={item === page ? 'page' : undefined}
          className={`min-w-10 rounded-lg px-3 py-2 text-sm font-semibold transition-colors ${
            item === page ? 'bg-gold text-navy' : 'border border-gray-200 bg-white text-ink hover:border-gold'
          }`}
        >
          {item}
        </button>
      ))}
      <button
        type="button"
        onClick={() => onPageChange(page + 1)}
        disabled={page >= pages}
        className="btn-outline px-4 py-2 text-sm disabled:cursor-not-allowed disabled:opacity-40"
      >
        Next
      </button>
      <span className="ml-2 text-sm text-muted">
        Page {page} of {pages}
        {total !== undefined && ` · ${total} total`}
      </span>
    </nav>
  )
}

/* -------------------------------------------------------------------------- */
/* Modal & confirm dialog                                                      */
/* -------------------------------------------------------------------------- */

export function Modal({ open, onClose, title, children, wide = false }) {
  const panelRef = useRef(null)

  useEffect(() => {
    if (!open) return
    const onKey = (event) => {
      if (event.key === 'Escape') onClose?.()
    }
    document.addEventListener('keydown', onKey)
    document.body.style.overflow = 'hidden'
    panelRef.current?.querySelector('input, select, textarea, button')?.focus()
    return () => {
      document.removeEventListener('keydown', onKey)
      document.body.style.overflow = ''
    }
  }, [open, onClose])

  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-navy/50 p-0 sm:items-center sm:p-4" role="dialog" aria-modal="true" aria-label={title}>
      <div className="absolute inset-0" onClick={onClose} aria-hidden="true" />
      <div
        ref={panelRef}
        className={`relative flex max-h-[92vh] w-full flex-col overflow-hidden rounded-t-2xl bg-white shadow-card-hover sm:rounded-2xl ${
          wide ? 'sm:max-w-4xl' : 'sm:max-w-lg'
        }`}
      >
        <div className="flex items-center justify-between border-b border-gray-200 px-5 py-4">
          <h3 className="font-serif text-lg font-semibold text-navy">{title}</h3>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-2 text-muted hover:bg-surface hover:text-ink"
            aria-label="Close dialog"
          >
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <div className="overflow-y-auto p-5">{children}</div>
      </div>
    </div>
  )
}

export function ConfirmDialog({ open, onClose, onConfirm, title, message, confirmLabel = 'Confirm', danger = false, busy = false }) {
  return (
    <Modal open={open} onClose={onClose} title={title}>
      <p className="text-sm text-muted">{message}</p>
      <div className="mt-6 flex justify-end gap-3">
        <button type="button" onClick={onClose} className="btn-outline px-4 py-2 text-sm" disabled={busy}>
          Cancel
        </button>
        <button
          type="button"
          onClick={onConfirm}
          disabled={busy}
          className={`inline-flex items-center justify-center gap-2 rounded-lg px-4 py-2 text-sm font-semibold text-white transition-colors disabled:cursor-not-allowed disabled:opacity-50 ${
            danger ? 'bg-red-600 hover:bg-red-700' : 'bg-navy hover:bg-navy-light'
          }`}
        >
          {busy ? 'Working…' : confirmLabel}
        </button>
      </div>
    </Modal>
  )
}

/* -------------------------------------------------------------------------- */
/* Charts (pure SVG, responsive, no dependencies)                              */
/* -------------------------------------------------------------------------- */

const CHART_COLORS = ['#C9A24B', '#0B1F3A', '#3E454E', '#7A8494', '#A8873A', '#5B6470', '#C9A24B', '#16294A']

function useContainerWidth() {
  const ref = useRef(null)
  const [width, setWidth] = useState(0)

  useEffect(() => {
    if (!ref.current) return
    const observer = new ResizeObserver((entries) => {
      for (const entry of entries) setWidth(entry.contentRect.width)
    })
    observer.observe(ref.current)
    return () => observer.disconnect()
  }, [])

  return [ref, width]
}

/**
 * Line/area chart for time series. Renders an empty state when there is no
 * data. Points include native <title> tooltips.
 */
export function LineChart({ data, height = 220, formatLabel = (v) => v, formatValue = (v) => v, yLabel }) {
  const [ref, width] = useContainerWidth()

  if (!data || data.length === 0) {
    return (
      <div className="flex items-center justify-center rounded-lg bg-surface/60 text-sm text-muted" style={{ height }}>
        No data available for this period yet.
      </div>
    )
  }

  const padding = { top: 16, right: 16, bottom: 28, left: 40 }
  const w = Math.max(width, 280)
  const h = height
  const innerW = w - padding.left - padding.right
  const innerH = h - padding.top - padding.bottom

  const maxValue = Math.max(...data.map((d) => d.value), 1)
  const stepX = data.length > 1 ? innerW / (data.length - 1) : 0

  const points = data.map((d, i) => ({
    x: padding.left + (data.length > 1 ? i * stepX : innerW / 2),
    y: padding.top + innerH - (d.value / maxValue) * innerH,
    ...d,
  }))

  const path = points.map((p, i) => `${i === 0 ? 'M' : 'L'}${p.x},${p.y}`).join(' ')
  const areaPath = `${path} L${points[points.length - 1].x},${padding.top + innerH} L${points[0].x},${padding.top + innerH} Z`

  const gridLines = 4
  const yTicks = Array.from({ length: gridLines + 1 }, (_, i) => Math.round((maxValue / gridLines) * i))

  return (
    <div ref={ref} className="w-full">
      <svg viewBox={`0 0 ${w} ${h}`} className="w-full" role="img" aria-label={yLabel || 'Line chart'}>
        {yTicks.map((tick) => {
          const y = padding.top + innerH - (tick / maxValue) * innerH
          return (
            <g key={tick}>
              <line x1={padding.left} x2={w - padding.right} y1={y} y2={y} stroke="#E5E7EB" strokeWidth={1} />
              <text x={padding.left - 8} y={y + 4} textAnchor="end" fontSize={11} fill="#5B6470">
                {tick}
              </text>
            </g>
          )
        })}
        <path d={areaPath} fill="#C9A24B" opacity={0.12} />
        <path d={path} fill="none" stroke="#C9A24B" strokeWidth={2.5} strokeLinejoin="round" strokeLinecap="round" />
        {points.map((p, i) => (
          <g key={i}>
            <circle cx={p.x} cy={p.y} r={4} fill="#fff" stroke="#C9A24B" strokeWidth={2.5}>
              <title>{`${formatLabel(p.label)}: ${formatValue(p.value)}`}</title>
            </circle>
            {(data.length <= 12 || i % Math.ceil(data.length / 12) === 0) && (
              <text x={p.x} y={h - 8} textAnchor="middle" fontSize={11} fill="#5B6470">
                {formatLabel(p.label)}
              </text>
            )}
          </g>
        ))}
      </svg>
    </div>
  )
}

/**
 * Horizontal bar list — used for status distributions and product
 * performance. Handles empty data gracefully.
 */
export function BarList({ data, formatValue = (v) => v, emptyMessage = 'No data available yet.' }) {
  if (!data || data.length === 0) {
    return <div className="flex items-center justify-center rounded-lg bg-surface/60 p-6 text-sm text-muted">{emptyMessage}</div>
  }

  const max = Math.max(...data.map((d) => d.value), 1)

  return (
    <div className="space-y-3">
      {data.map((item) => (
        <div key={item.label} className="flex items-center gap-3">
          <span className="w-32 shrink-0 truncate text-sm text-muted" title={item.label}>
            {item.label}
          </span>
          <div className="h-6 flex-1 overflow-hidden rounded bg-surface">
            <div
              className="h-6 rounded bg-gold transition-all duration-500"
              style={{ width: `${Math.max((item.value / max) * 100, item.value > 0 ? 4 : 0)}%` }}
            />
          </div>
          <span className="w-10 shrink-0 text-right text-sm font-semibold text-ink">{formatValue(item.value)}</span>
        </div>
      ))}
    </div>
  )
}

/**
 * Donut chart for status distribution.
 */
export function DonutChart({ data, size = 180 }) {
  const [ref, width] = useContainerWidth()

  if (!data || data.length === 0) {
    return (
      <div className="flex items-center justify-center rounded-lg bg-surface/60 text-sm text-muted" style={{ height: size }}>
        No data available for this period yet.
      </div>
    )
  }

  const total = data.reduce((sum, d) => sum + d.value, 0)
  const radius = 70
  const cx = 90
  const cy = 90

  let angle = -Math.PI / 2
  const slices = data.map((d, i) => {
    const sliceAngle = (d.value / total) * Math.PI * 2
    const start = angle
    angle += sliceAngle
    const end = angle
    const largeArc = sliceAngle > Math.PI ? 1 : 0
    const x1 = cx + radius * Math.cos(start)
    const y1 = cy + radius * Math.sin(start)
    const x2 = cx + radius * Math.cos(end)
    const y2 = cy + radius * Math.sin(end)
    const path = `M${cx},${cy} L${x1},${y1} A${radius},${radius} 0 ${largeArc} 1 ${x2},${y2} Z`
    return { ...d, path, color: CHART_COLORS[i % CHART_COLORS.length] }
  })

  return (
    <div ref={ref} className="flex flex-wrap items-center gap-6">
      <svg viewBox="0 0 180 180" style={{ width: size, height: size }} role="img" aria-label="Distribution chart">
        {slices.map((slice) => (
          <path key={slice.label} d={slice.path} fill={slice.color} stroke="#fff" strokeWidth={2}>
            <title>{`${slice.label}: ${slice.value}`}</title>
          </path>
        ))}
        <circle cx={cx} cy={cy} r={44} fill="#fff" />
        <text x={cx} y={cy - 4} textAnchor="middle" fontSize={22} fontWeight={700} fill="#0B1F3A">
          {total}
        </text>
        <text x={cx} y={cy + 16} textAnchor="middle" fontSize={11} fill="#5B6470">
          total
        </text>
      </svg>
      <ul className="min-w-40 flex-1 space-y-2">
        {slices.map((slice) => (
          <li key={slice.label} className="flex items-center gap-2 text-sm">
            <span className="h-3 w-3 shrink-0 rounded-sm" style={{ backgroundColor: slice.color }} aria-hidden="true" />
            <span className="flex-1 truncate text-muted">{slice.label}</span>
            <span className="font-semibold text-ink">{slice.value}</span>
          </li>
        ))}
      </ul>
    </div>
  )
}

/* -------------------------------------------------------------------------- */
/* Data table                                                                  */
/* -------------------------------------------------------------------------- */

export function DataTable({ columns, rows, rowKey, loading, emptyMessage = 'No records found.', sort, onSort }) {
  if (loading) return <TableSkeleton rows={5} columns={columns.length} />

  return (
    <div className="overflow-x-auto rounded-xl border border-gray-200 bg-white shadow-card">
      <table className="w-full min-w-[640px] text-left text-sm">
        <thead>
          <tr className="border-b border-gray-200 bg-surface">
            {columns.map((column) => (
              <th key={column.key} className="px-4 py-3 font-semibold text-ink">
                {column.sortable ? (
                  <button
                    type="button"
                    onClick={() => onSort?.(column.key)}
                    className="inline-flex items-center gap-1 uppercase tracking-wide text-xs hover:text-gold-dark"
                    aria-label={`Sort by ${column.label}`}
                  >
                    {column.label}
                    <span aria-hidden="true" className={sort?.key === column.key ? 'text-gold-dark' : 'text-gray-300'}>
                      {sort?.key === column.key ? (sort.dir === 'asc' ? '▲' : '▼') : '↕'}
                    </span>
                  </button>
                ) : (
                  <span className="text-xs uppercase tracking-wide">{column.label}</span>
                )}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.length === 0 ? (
            <tr>
              <td colSpan={columns.length} className="px-4 py-10 text-center text-muted">
                {emptyMessage}
              </td>
            </tr>
          ) : (
            rows.map((row) => (
              <tr key={rowKey(row)} className="border-b border-gray-100 transition-colors last:border-0 hover:bg-surface/50">
                {columns.map((column) => (
                  <td key={column.key} className="px-4 py-3 align-middle">
                    {column.render ? column.render(row) : row[column.key]}
                  </td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  )
}

/* -------------------------------------------------------------------------- */
/* Date range filter                                                           */
/* -------------------------------------------------------------------------- */

export function toDateInputValue(date) {
  const d = new Date(date)
  const pad = (n) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`
}

export function DateRangeFilter({ from, to, onChange }) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      <div>
        <label htmlFor="filter-from" className="sr-only">From date</label>
        <input
          id="filter-from"
          type="date"
          value={from}
          max={to || undefined}
          onChange={(e) => onChange({ ...{ from, to }, from: e.target.value })}
          className="input-base w-auto"
        />
      </div>
      <span className="text-sm text-muted" aria-hidden="true">–</span>
      <div>
        <label htmlFor="filter-to" className="sr-only">To date</label>
        <input
          id="filter-to"
          type="date"
          value={to}
          min={from || undefined}
          onChange={(e) => onChange({ from, to: e.target.value })}
          className="input-base w-auto"
        />
      </div>
      {(from || to) && (
        <button
          type="button"
          onClick={() => onChange({ from: '', to: '' })}
          className="rounded-lg border border-gray-200 px-3 py-2 text-xs font-semibold text-muted hover:border-gold hover:text-gold-dark"
        >
          Clear
        </button>
      )}
    </div>
  )
}
