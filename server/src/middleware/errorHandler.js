export function errorHandler(err, req, res, next) {
  const isDevelopment = process.env.NODE_ENV !== 'production'
  // Log the full error (message + stack) server-side; the stack never leaves
  // the process and secrets are never logged.
  console.error('Error:', err.message, isDevelopment ? err.stack : '')
  if (err && err.name === 'ValidationError') {
    const messages = Object.values(err.errors).map((e) => e.message)
    return res.status(400).json({ message: 'Validation failed', errors: messages })
  }

  if (err && err.code === 11000) {
    return res.status(409).json({ message: 'A record with that value already exists' })
  }

  if (err && err.name === 'CastError') {
    return res.status(400).json({ message: 'Invalid ID format' })
  }

  const status = err.status || 500
  const message = status === 500 && !isDevelopment ? 'Internal server error' : err.message || 'Internal server error'
  res.status(status).json({ message })
}

export function notFound(req, res, next) {
  res.status(404).json({ message: 'Route not found' })
}
