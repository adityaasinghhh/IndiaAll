/**
 * Accessible form field wrapper: label, control, optional hint and inline error.
 * The label is always associated via htmlFor/id. Errors use role="alert" and
 * aria-describedby is wired from the parent input's aria-invalid.
 */
export default function FormField({ label, htmlFor, required = false, optional = false, hint, error, children }) {
  return (
    <div>
      <label htmlFor={htmlFor} className="label-base">
        {label}
        {required && (
          <span className="ml-1 text-industrial-blue" aria-hidden="true">
            *
          </span>
        )}
        {optional && <span className="ml-2 text-xs font-medium text-text-muted">(optional)</span>}
      </label>
      {children}
      {hint && !error && <p className="field-hint">{hint}</p>}
      {error && (
        <p role="alert" className="field-error">
          {error}
        </p>
      )}
    </div>
  )
}