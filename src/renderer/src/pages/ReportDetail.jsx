import { useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import api from '../lib/api'
import useAsync from '../lib/useAsync'
import { useAuth } from '../context/AuthContext'
import { useToast } from '../components/Toast'
import StatusBadge, { TypeBadge } from '../components/StatusBadge'
import ConfirmDialog from '../components/ConfirmDialog'
import { Loading, ErrorState } from '../components/EmptyState'
import { formatDate, formatDateTime } from '../lib/format'

function Detail({ label, children }) {
  return (
    <div className="detail">
      <div className="detail__label">{label}</div>
      <div className="detail__value">{children}</div>
    </div>
  )
}

export default function ReportDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { user } = useAuth()
  const toast = useToast()
  const [confirmDelete, setConfirmDelete] = useState(false)
  const [busy, setBusy] = useState(false)
  const { data: report, error, loading, reload } = useAsync(() => api.reports.get(id), [id])

  if (loading && !report) return <Loading />
  if (error) return <ErrorState error={error} onRetry={reload} />

  const isOwner = report.userId === user.id
  const isOpen = report.status === 'open'

  const setStatus = async (status) => {
    setBusy(true)
    try {
      await api.reports.setStatus(id, status)
      toast(status === 'resolved' ? 'Marked as resolved' : 'Report reopened')
      reload({ silent: true })
    } catch (err) {
      toast(err.message, 'error')
    } finally {
      setBusy(false)
    }
  }

  const remove = async () => {
    setBusy(true)
    try {
      await api.reports.delete(id)
      toast('Report deleted')
      navigate('/my-reports', { replace: true })
    } catch (err) {
      toast(err.message, 'error')
      setBusy(false)
      setConfirmDelete(false)
    }
  }

  const copyEmail = async () => {
    try {
      await navigator.clipboard.writeText(report.owner.email)
      toast('Email copied')
    } catch {
      toast('Could not copy email', 'error')
    }
  }

  return (
    <div className="page__inner">
      <div className="detail-layout">
        <div className="card">
          <div className="row">
            <TypeBadge type={report.type} />
            <StatusBadge status={report.status} />
          </div>
          <h1 className="detail-title">{report.title}</h1>
          <p className="detail-desc">{report.description}</p>

          <div className="details">
            <Detail label="Category">{report.category}</Detail>
            <Detail label={report.type === 'lost' ? 'Date lost' : 'Date found'}>
              {formatDate(report.date)}
            </Detail>
            <Detail label="Location">
              {report.location}
              {report.locationDetail && (
                <span className="muted"> — {report.locationDetail}</span>
              )}
            </Detail>
            <Detail label="Posted">{formatDateTime(report.createdAt)}</Detail>
          </div>

          {isOwner && report.type === 'found' && (
            <div className="private-note">
              <div className="private-note__label">🔒 Private verification detail (only you can see this)</div>
              <div>{report.privateNote || <span className="muted">Not set</span>}</div>
            </div>
          )}

          <div className="detail-actions">
            {isOwner ? (
              <>
                <Link to={`/reports/${id}/edit`} className="btn">
                  Edit
                </Link>
                {isOpen ? (
                  <button className="btn btn--success" onClick={() => setStatus('resolved')} disabled={busy}>
                    {report.type === 'lost' ? 'Mark as Recovered' : 'Mark as Returned'}
                  </button>
                ) : (
                  <button className="btn" onClick={() => setStatus('open')} disabled={busy}>
                    Reopen
                  </button>
                )}
                <button className="btn btn--danger" onClick={() => setConfirmDelete(true)} disabled={busy}>
                  Delete
                </button>
              </>
            ) : (
              <Link to={`/messages/${id}/${report.userId}`} className="btn btn--primary">
                Contact poster
              </Link>
            )}
          </div>
        </div>

        <aside className="stack">
          <div className="card">
            <h3>Posted by</h3>
            <div className="poster">
              <div className="avatar">{report.owner?.name?.[0] || '?'}</div>
              <div>
                <div>
                  {report.owner?.name}
                  {isOwner && <span className="muted"> (you)</span>}
                </div>
                <div className="row">
                  <span className="muted small">{report.owner?.email}</span>
                  <button className="btn btn--ghost btn--sm" onClick={copyEmail}>
                    Copy
                  </button>
                </div>
              </div>
            </div>
          </div>
          {!isOwner && report.type === 'found' && isOpen && (
            <div className="card tip">
              <strong>Is this yours?</strong> Message the finder and describe the item — they’ll
              check your description against a private detail before handing it over.
            </div>
          )}
        </aside>
      </div>

      <ConfirmDialog
        open={confirmDelete}
        title="Delete this report?"
        confirmLabel="Delete"
        danger
        busy={busy}
        onConfirm={remove}
        onCancel={() => setConfirmDelete(false)}
      >
        This permanently removes the report and its messages.
      </ConfirmDialog>
    </div>
  )
}
