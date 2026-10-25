import { Link } from 'react-router-dom'
import api from '../lib/api'
import useAsync from '../lib/useAsync'
import usePolling from '../lib/usePolling'
import { useAuth } from '../context/AuthContext'
import { TypeBadge } from '../components/StatusBadge'
import EmptyState, { Loading, ErrorState } from '../components/EmptyState'
import { timeAgo } from '../lib/format'

export default function Messages() {
  const { user } = useAuth()
  const { data, error, loading, reload } = useAsync(() => api.messages.threads(), [])
  usePolling(() => reload({ silent: true }), 10000)

  return (
    <div className="page__inner page__inner--narrow">
      <div className="page__header">
        <h1>Messages</h1>
      </div>
      {loading && !data ? (
        <Loading />
      ) : error ? (
        <ErrorState error={error} onRetry={reload} />
      ) : data.length === 0 ? (
        <EmptyState title="No conversations yet">
          Open a report and use <strong>Contact poster</strong> to start one.
        </EmptyState>
      ) : (
        <ul className="card inbox">
          {data.map((t) => {
            const unread = t.unreadCount > 0
            const fromMe = t.lastMessage.fromUserId === user.id
            return (
              <li key={`${t.reportId}:${t.otherUser.id}`}>
                <Link
                  to={`/messages/${t.reportId}/${t.otherUser.id}`}
                  className={`inbox__row${unread ? ' inbox__row--unread' : ''}`}
                >
                  <div className="avatar">{t.otherUser.name[0]}</div>
                  <div className="inbox__body">
                    <div className="inbox__top">
                      <strong>{t.otherUser.name}</strong>
                      <span className="muted small">{timeAgo(t.lastMessage.createdAt)}</span>
                    </div>
                    <div className="row small">
                      <TypeBadge type={t.reportType} />
                      <span className="muted">{t.reportTitle}</span>
                      {t.reportStatus === 'resolved' && <span className="muted">· Resolved</span>}
                    </div>
                    <div className="inbox__preview">
                      {fromMe && <span className="muted">You: </span>}
                      {t.lastMessage.body}
                    </div>
                  </div>
                  {unread && <span className="inbox__dot" title={`${t.unreadCount} unread`} />}
                </Link>
              </li>
            )
          })}
        </ul>
      )}
    </div>
  )
}
