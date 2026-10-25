export default function ConfirmDialog({
  open,
  title,
  children,
  confirmLabel = 'Confirm',
  danger,
  busy,
  onConfirm,
  onCancel
}) {
  if (!open) return null
  return (
    <div className="modal" onMouseDown={onCancel}>
      <div className="modal__box card" onMouseDown={(e) => e.stopPropagation()}>
        <h2>{title}</h2>
        <div className="muted">{children}</div>
        <div className="modal__actions">
          <button className="btn" onClick={onCancel} disabled={busy}>
            Cancel
          </button>
          <button
            className={`btn ${danger ? 'btn--danger' : 'btn--primary'}`}
            onClick={onConfirm}
            disabled={busy}
            autoFocus
          >
            {busy ? 'Working…' : confirmLabel}
          </button>
        </div>
      </div>
    </div>
  )
}
