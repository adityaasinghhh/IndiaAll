import { createContext, useCallback, useContext, useRef, useState } from 'react'

const ToastContext = createContext(null)

const TOAST_STYLES = {
  success: { ring: 'border-green-200', bar: 'bg-green-500', icon: 'M5 13l4 4L19 7', label: 'Success' },
  error: { ring: 'border-red-200', bar: 'bg-red-500', icon: 'M6 18L18 6M6 6l12 12', label: 'Error' },
  info: { ring: 'border-gray-200', bar: 'bg-gold', icon: 'M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z', label: 'Info' },
}

let nextId = 1

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([])
  const timers = useRef(new Map())

  const dismiss = useCallback((id) => {
    setToasts((list) => list.filter((toast) => toast.id !== id))
    const timer = timers.current.get(id)
    if (timer) {
      clearTimeout(timer)
      timers.current.delete(id)
    }
  }, [])

  const push = useCallback((message, type = 'info', timeout = 4500) => {
    const id = nextId++
    setToasts((list) => [...list.slice(-3), { id, message, type }])
    timers.current.set(id, setTimeout(() => dismiss(id), timeout))
    return id
  }, [dismiss])

  const value = {
    success: (msg, timeout) => push(msg, 'success', timeout),
    error: (msg, timeout) => push(msg, 'error', timeout || 6000),
    info: (msg, timeout) => push(msg, 'info', timeout),
    dismiss,
  }

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div className="pointer-events-none fixed bottom-4 right-4 z-[100] flex w-full max-w-sm flex-col gap-2" aria-live="polite" aria-atomic="false">
        {toasts.map((toast) => {
          const style = TOAST_STYLES[toast.type] || TOAST_STYLES.info
          return (
            <div
              key={toast.id}
              role="status"
              className={`pointer-events-auto flex items-start gap-3 rounded-lg border ${style.ring} bg-white p-4 shadow-card-hover animate-fade-in`}
            >
              <span className={`mt-1 h-2 w-2 shrink-0 rounded-full ${style.bar}`} aria-hidden="true" />
              <p className="flex-1 text-sm font-medium text-ink">{toast.message}</p>
              <button
                type="button"
                onClick={() => dismiss(toast.id)}
                className="rounded p-1 text-muted hover:bg-surface hover:text-ink"
                aria-label="Dismiss notification"
              >
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          )
        })}
      </div>
    </ToastContext.Provider>
  )
}

export function useToast() {
  const context = useContext(ToastContext)
  if (!context) throw new Error('useToast must be used within ToastProvider')
  return context
}
