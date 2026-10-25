import { useState } from 'react'
import { Link } from 'react-router-dom'
import { TypeBadge } from './StatusBadge'
import ConfirmDialog from './ConfirmDialog'
import EmptyState, { Loading, ErrorState } from './EmptyState'
import { formatDate } from '../lib/format'

export default function MatchList({ matches, loading, error, onRetry, canResolve, onResolve }) {
  const [pending, setPending] = useState(null)
  const [busy, setBusy] = useState(false)

  const confirm = async () => {
    setBusy(true)
    try {
      await onResolve(pending)
    } finally {
      setBusy(false)
      setPending(null)
    }
  }

  if (loading && !matches) return <Loading label="Looking for matches…" />
  if (error) return <ErrorState error={error} onRetry={onRetry} />
  if (!matches?.length) {
    return (
      <EmptyState title="No matches yet">
        We’ll suggest reports here as soon as something similar is posted.
      </EmptyState>
    )
  }

  return (
    <>
      <ul className="matches">
        {matches.map((m) => (
          <li key={m.report.id} className="match">
            <div className="match__score">
              <span className={`pill pill--${m.label.toLowerCase()}`}>{m.label} match</span>
              <span className="match__num">{m.score}</span>
            </div>
            <div className="match__body">
              <div className="row">
                <TypeBadge type={m.report.type} />
                <strong>{m.report.title}</strong>
              </div>
              <div className="muted small">
                {m.report.location} · {formatDate(m.report.date)} · by {m.report.ownerName}
              </div>
              <div className="match__reasons">{m.reasons.join(' · ')}</div>
            </div>
            <div className="match__actions">
              <Link className="btn btn--sm" to={`/reports/${m.report.id}`}>
                View
              </Link>
              {canResolve && (
                <button className="btn btn--sm btn--success" onClick={() => setPending(m)}>
                  This is it — mark both resolved
                </button>
              )}
            </div>
          </li>
        ))}
      </ul>
      <ConfirmDialog
        open={!!pending}
        title="Mark both reports resolved?"
        confirmLabel="Mark both resolved"
        busy={busy}
        onConfirm={confirm}
        onCancel={() => setPending(null)}
      >
        Only do this once the item has actually been handed over. Both reports will be closed and
        {pending ? ` ${pending.report.ownerName}` : ' the other poster'} will get a message.
      </ConfirmDialog>
    </>
  )
}
