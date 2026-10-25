import { useState } from 'react'
import { Link } from 'react-router-dom'
import api from '../lib/api'
import useAsync from '../lib/useAsync'
import { useToast } from '../components/Toast'
import ReportCard from '../components/ReportCard'
import EmptyState, { Loading, ErrorState } from '../components/EmptyState'

const TABS = [
  { key: 'lost', label: 'Lost', test: (r) => r.type === 'lost' && r.status === 'open' },
  { key: 'found', label: 'Found', test: (r) => r.type === 'found' && r.status === 'open' },
  { key: 'resolved', label: 'Resolved', test: (r) => r.status === 'resolved' }
]

export default function MyReports() {
  const [tab, setTab] = useState('lost')
  const toast = useToast()
  const { data, error, loading, reload } = useAsync(() => api.reports.mine(), [])

  const setStatus = async (report, status) => {
    try {
      await api.reports.setStatus(report.id, status)
      toast(status === 'resolved' ? 'Marked as resolved' : 'Report reopened')
      reload({ silent: true })
    } catch (err) {
      toast(err.message, 'error')
    }
  }

  const current = TABS.find((t) => t.key === tab)
  const list = (data || []).filter(current.test)

  return (
    <div className="page__inner">
      <div className="page__header">
        <h1>My Reports</h1>
        <Link to="/reports/new" className="btn btn--primary">
          + Report item
        </Link>
      </div>

      <div className="tabs">
        {TABS.map((t) => (
          <button
            key={t.key}
            className={`tabs__tab${tab === t.key ? ' tabs__tab--active' : ''}`}
            onClick={() => setTab(t.key)}
          >
            {t.label}
            {data && <span className="tabs__count">{data.filter(t.test).length}</span>}
          </button>
        ))}
      </div>

      {loading && !data ? (
        <Loading />
      ) : error ? (
        <ErrorState error={error} onRetry={reload} />
      ) : list.length === 0 ? (
        <EmptyState title={`No ${current.label.toLowerCase()} reports`}>
          <Link to="/reports/new">Report an item</Link>
        </EmptyState>
      ) : (
        <div className="cards">
          {list.map((r) => (
            <ReportCard
              key={r.id}
              report={r}
              extra={
                r.status === 'open' &&
                r.matchCount > 0 && (
                  <span className="pill pill--strong">
                    {r.matchCount} match{r.matchCount > 1 ? 'es' : ''}
                  </span>
                )
              }
              footer={
                <>
                  <Link to={`/reports/${r.id}/edit`} className="btn btn--sm">
                    Edit
                  </Link>
                  {r.status === 'open' ? (
                    <button className="btn btn--sm" onClick={() => setStatus(r, 'resolved')}>
                      {r.type === 'lost' ? 'Mark recovered' : 'Mark returned'}
                    </button>
                  ) : (
                    <button className="btn btn--sm" onClick={() => setStatus(r, 'open')}>
                      Reopen
                    </button>
                  )}
                </>
              }
            />
          ))}
        </div>
      )}
    </div>
  )
}
