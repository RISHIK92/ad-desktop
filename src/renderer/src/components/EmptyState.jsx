export default function EmptyState({ title = 'Nothing here yet', children }) {
  return (
    <div className="empty">
      <div className="empty__icon">◎</div>
      <h3>{title}</h3>
      {children && <div className="muted">{children}</div>}
    </div>
  )
}

export function Loading({ label = 'Loading…' }) {
  return <div className="loading">{label}</div>
}

export function ErrorState({ error, onRetry }) {
  return (
    <div className="empty empty--error">
      <h3>Couldn’t load this</h3>
      <p className="muted">{error?.message || 'Something went wrong'}</p>
      {onRetry && (
        <button className="btn btn--sm" onClick={() => onRetry()}>
          Try again
        </button>
      )}
    </div>
  )
}
