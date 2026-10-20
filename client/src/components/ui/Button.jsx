import { Link } from 'react-router-dom'

const variants = {
  primary: 'btn-primary',
  secondary: 'btn-secondary',
  outline: 'btn-outline',
  outlineLight: 'btn-outline-light',
  gold: 'btn-gold',
  dark: 'btn-dark',
}

/**
 * Shared button used across the site.
 * Renders a router Link when `to` is provided, otherwise a <button>.
 * Supports a `loading` state that shows a spinner and disables the button.
 */
export default function Button({ to, variant = 'primary', className = '', children, loading = false, ...props }) {
  const classes = `${variants[variant]} ${className}`.trim()

  if (to) {
    return (
      <Link to={to} className={classes} {...props} disabled={loading}>
        {renderButtonChildren(children, loading)}
      </Link>
    )
  }

  return (
    <button type="button" className={classes} {...props} disabled={loading}>
      {renderButtonChildren(children, loading)}
    </button>
  )
}

function renderButtonChildren(children, loading) {
  if (loading) {
    return (
      <>
        <svg
          className="h-4 w-4 animate-spin"
          fill="none"
          viewBox="0 0 24 24"
          aria-hidden="true"
        >
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.25v-1.5c-0.463 0-0.85-0.347-0.85-0.85a0.85 0.85 0 011.7-1.7l-1.5 1.5V4.5a0.85 0.85 0 011.7-1.7L7.5 2.5a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.573c0.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 01-1.065-2.572c-0.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 01-2.573-1.066c-1.543 0.94-3.31 -0.826-2.37-2.37a1.724 1.724 0 01-1.065-2.572c-0.94-1.543 0.826-3.31 2.37-2.37 0.996 0.608 2.296 0.07 2.572-1.065z"
          />
        </svg>
        {children}
      </>
    )
  }
  return children
}
