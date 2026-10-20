/**
 * Shared API client.
 *
 * Default base URL is relative (`/api/v1`) so the Vite dev proxy serves the
 * API same-origin in development and a reverse proxy can do the same in
 * production. Set VITE_API_BASE_URL to an absolute origin when the API is
 * hosted elsewhere.
 */
export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api/v1'

export class ApiError extends Error {
  constructor(message, status, errors) {
    super(message)
    this.name = 'ApiError'
    this.status = status
    this.errors = errors
  }
}

const REQUEST_TIMEOUT_MS = 8000

async function request(path, options = {}) {
  const url = `${API_BASE_URL}${path}`

  const config = {
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    ...options,
  }

  if (config.body && typeof config.body === 'object') {
    config.body = JSON.stringify(config.body)
  }

  const controller = new AbortController()
  const timeoutId = setTimeout(() => {
    if (!controller.signal.aborted) controller.abort()
  }, REQUEST_TIMEOUT_MS)

  try {
    const response = await fetch(url, { ...config, signal: controller.signal })
    clearTimeout(timeoutId)

    let data
    try {
      data = await response.json()
    } catch {
      data = null
    }

    if (!response.ok) {
      const message = data?.message || `Request failed with status ${response.status}`
      throw new ApiError(message, response.status, data?.errors)
    }

    return data
  } catch (error) {
    clearTimeout(timeoutId)

    if (error.name === 'AbortError' || controller.signal.aborted) {
      throw new ApiError('Request timed out. Please try again.', 408)
    }

    throw error
  }
}

export const api = {
  get: (path) => request(path, { method: 'GET' }),
  post: (path, body) => request(path, { method: 'POST', body }),
  put: (path, body) => request(path, { method: 'PUT', body }),
  delete: (path, body) => request(path, { method: 'DELETE', body }),
}
