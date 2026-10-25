export default function FormField({ label, error, hint, htmlFor, children }) {
  return (
    <div className={`field${error ? ' field--error' : ''}`}>
      {label && <label htmlFor={htmlFor}>{label}</label>}
      {children}
      {error ? <p className="field__error">{error}</p> : hint && <p className="field__hint">{hint}</p>}
    </div>
  )
}
