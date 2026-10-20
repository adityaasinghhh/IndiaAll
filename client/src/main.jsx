import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'

// Global error handler that renders errors into the DOM instead of leaving
// a blank page when JavaScript fails during mount or execution.
function renderError(message) {
  const root = document.getElementById('root')
  if (root) {
    root.innerHTML = `
      <div style="font-family:sans-serif;padding:2rem;color:#c00;background:#fee2e2;border:1px solid #ef4444;border-radius:.5rem;max-width:32rem;margin:2rem auto;">
        <h2 style="margin-top:0">Application Error</h2>
        <p style="white-space:pre-wrap;font-family:monospace;font-size:0.9rem">${message.replace(/</g, '&lt;').replace(/>/g, '&gt;')}</p>
        <p style="margin-top:1rem;font-size:0.9rem;color:#666">Open the browser console (F12) for the full stack trace.</p>
      </div>
    `
  }
}

window.onerror = (message, source, lineno, colno, error) => {
  console.error('Uncaught error:', message, error)
  renderError(String(message))
  return true
}

window.onunhandledrejection = (event) => {
  console.error('Unhandled promise rejection:', event.reason)
  renderError(String(event.reason))
}

try {
  const rootElement = document.getElementById('root')
  if (!rootElement) {
    throw new Error('DOM element #root not found — check index.html')
  }
  ReactDOM.createRoot(rootElement).render(
    <React.StrictMode>
      <App />
    </React.StrictMode>,
  )
} catch (error) {
  console.error('React mount error:', error)
  renderError(error.message)
}
