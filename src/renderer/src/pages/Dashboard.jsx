import { Link } from 'react-router-dom'
import api from '../lib/api'
import useAsync from '../lib/useAsync'
import { useAuth } from '../context/AuthContext'
import ReportCard from '../components/ReportCard'
import { TypeBadge } from '../components/StatusBadge'
import EmptyState, { Loading, ErrorState } from '../components/EmptyState'

function Stat({ label, value, tone, to }) {
  return (
    <Link to={to} className={`stat stat--${tone}`}>
      <div className="stat__value">{value}</div>
      <div className="stat__label">{label}</div>
    </Link>
  )
}

export default function Dashboard() {
  const { user } = useAuth()
  const { data, error, loading, reload } = useAsync(() => api.dashboard.stats(), [])

  if (loading && !data) return <Loading />
  if (error) return <ErrorState error={error} onRetry={reload} />

  return (
    <div className="page__inner">
      <div className="page__header">
        <div>
          <h1>Hi, {user.name.split(' ')[0]} 👋</h1>
          <p className="muted">Here’s what’s happening in the campus lost &amp; found.</p>
        </div>
        <Link to="/reports/new" className="btn btn--primary">
          + Report item
        </Link>
      </div>

      <div className="stats">
        <Stat label="Open lost reports" value={data.openLost} tone="lost" to="/browse" />
        <Stat label="Open found reports" value={data.openFound} tone="found" to="/browse" />
        <Stat label="Resolved in last 30 days" value={data.resolvedLast30} tone="resolved" to="/browse" />
        <Stat label="Possible matches for you" value={data.myMatchCount} tone="primary" to="/my-reports" />
      </div>

      <section className="card section">
        <div className="section__header">
          <h2>Your matches</h2>
          <span className="muted small">Suggestions for your open reports</span>
        </div>
        {data.myMatches.length === 0 ? (
          <EmptyState title="No matches right now">
            When someone posts a similar item, it’ll show up here.
          </EmptyState>
        ) : (
          <ul className="matches">
            {data.myMatches.map((m) => (
              <li key={`${m.forReport.id}:${m.report.id}`} className="match">
                <div className="match__score">
                  <span className={`pill pill--${m.label.toLowerCase()}`}>{m.label} match</span>
                  <span className="match__num">{m.score}</span>
                </div>
                <div className="match__body">
                  <div className="row">
                    <TypeBadge type={m.report.type} />
                    <strong>{m.report.title}</strong>
                    <span className="muted small">by {m.report.ownerName}</span>
                  </div>
                  <div className="muted small">
                    For your {m.forReport.type} report: <Link to={`/reports/${m.forReport.id}`}>{m.forReport.title}</Link>
                  </div>
                  <div className="match__reasons">{m.reasons.join(' · ')}</div>
                </div>
                <div className="match__actions">
                  <Link className="btn btn--sm" to={`/reports/${m.report.id}`}>
                    View
                  </Link>
                  <Link className="btn btn--sm btn--primary" to={`/reports/${m.forReport.id}`}>
                    Review
                  </Link>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="section">
        <div className="section__header">
          <h2>Recent reports</h2>
          <Link to="/browse" className="small">
            Browse all →
          </Link>
        </div>
        {data.recent.length === 0 ? (
          <EmptyState title="No open reports" />
        ) : (
          <div className="cards">
            {data.recent.map((r) => (
              <ReportCard key={r.id} report={r} />
            ))}
          </div>
        )}
      </section>
    </div>
  )
}
