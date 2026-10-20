import { api, API_BASE_URL } from './api.js'

/**
 * Admin API surface.
 *
 * Every method goes through the shared `api` client (cookies + error
 * handling). When a request fails with 401 the wrapper transparently attempts
 * a single token refresh and retries the original call; if the refresh also
 * fails, `onAuthExpired` is invoked so the Admin shell can return to the
 * login screen.
 */

let onAuthExpired = () => {}

export function setAdminAuthExpiredHandler(handler) {
  onAuthExpired = handler
}

async function withAdminRetry(fn) {
  try {
    return await fn()
  } catch (error) {
    if (error?.status !== 401) throw error

    try {
      await api.post('/admin/refresh')
    } catch {
      onAuthExpired()
      throw error
    }

    return fn()
  }
}

const qs = (params = {}) => {
  const search = new URLSearchParams()
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') search.set(key, value)
  })
  const str = search.toString()
  return str ? `?${str}` : ''
}

export const adminApi = {
  // Session
  login: (credentials) => api.post('/admin/login', credentials),
  verifyLoginOtp: (data) => api.post('/admin/otp-verify', data),
  verifyMfaLogin: (data) => api.post('/admin/mfa/verify-login', data),
  requestPasswordOtp: () => api.post('/admin/password/otp-request'),
  logout: () => api.post('/admin/logout'),
  getSession: () => api.get('/admin/session'),

  // Profile & password
  updateProfile: (data) => withAdminRetry(() => api.put('/admin/profile', data)),
  changePassword: (data) => withAdminRetry(() => api.put('/admin/password', data)),

  // Dashboard & reports
  getDashboard: (params) => withAdminRetry(() => api.get(`/admin/dashboard${qs(params)}`)),
  getReports: (params) => withAdminRetry(() => api.get(`/admin/reports${qs(params)}`)),

  // Orders
  getOrders: (params) => withAdminRetry(() => api.get(`/admin/orders${qs(params)}`)),
  getOrder: (id) => withAdminRetry(() => api.get(`/admin/orders/${encodeURIComponent(id)}`)),
  updateOrderStatus: (id, data) =>
    withAdminRetry(() => api.put(`/admin/orders/${encodeURIComponent(id)}/status`, data)),
  addOrderNote: (id, data) =>
    withAdminRetry(() => api.post(`/admin/orders/${encodeURIComponent(id)}/notes`, data)),

  // Enquiries (admin endpoints live under /enquiries)
  getEnquiries: (params) => withAdminRetry(() => api.get(`/enquiries${qs(params)}`)),
  getEnquiry: (id) => withAdminRetry(() => api.get(`/enquiries/${encodeURIComponent(id)}`)),
  updateEnquiryStatus: (id, data) =>
    withAdminRetry(() => api.put(`/enquiries/${encodeURIComponent(id)}/status`, data)),
  replyToEnquiry: (id, data) =>
    withAdminRetry(() => api.post(`/enquiries/${encodeURIComponent(id)}/reply`, data)),

  // Products
  getProducts: (params) => withAdminRetry(() => api.get(`/admin/products${qs(params)}`)),
  createProduct: (data) => withAdminRetry(() => api.post('/admin/products', data)),
  updateProduct: (id, data) =>
    withAdminRetry(() => api.put(`/admin/products/${encodeURIComponent(id)}`, data)),
  deleteProduct: (id) =>
    withAdminRetry(() => api.delete(`/admin/products/${encodeURIComponent(id)}`)),

  // Customers
  getCustomers: (params) => withAdminRetry(() => api.get(`/admin/customers${qs(params)}`)),
  getCustomer: (id) => withAdminRetry(() => api.get(`/admin/customers/${encodeURIComponent(id)}`)),
  updateCustomerStatus: (id, data) =>
    withAdminRetry(() => api.put(`/admin/customers/${encodeURIComponent(id)}/status`, data)),
  deleteCustomer: (id) =>
    withAdminRetry(() => api.delete(`/admin/customers/${encodeURIComponent(id)}`)),

  // Audit
  getAuditLogs: (params) => withAdminRetry(() => api.get(`/admin/audit-logs${qs(params)}`)),

  // Admin management (owner only)
  createAdmin: (data) => withAdminRetry(() => api.post('/admin/create-admin', data)),

  // Site settings (business contact etc.)
  getSettings: () => withAdminRetry(() => api.get('/settings')),
  updateSettings: (data) => withAdminRetry(() => api.put('/settings', data)),
}

/**
 * Download a CSV export through the authenticated session and trigger a
 * browser download. Returns the filename suggested by the server.
 */
export async function downloadCsv(path, fallbackFilename) {
  const response = await fetch(`${API_BASE_URL}${path}`, { credentials: 'include' })
  if (!response.ok) {
    let message = 'CSV export failed'
    try {
      const body = await response.json()
      if (body?.message) message = body.message
    } catch {
      // keep default message
    }
    throw new Error(message)
  }

  const blob = await response.blob()
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = fallbackFilename
  document.body.appendChild(link)
  link.click()
  link.remove()
  URL.revokeObjectURL(url)
}
