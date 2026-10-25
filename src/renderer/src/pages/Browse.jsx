import { useState } from 'react'
import api from '../lib/api'
import useAsync from '../lib/useAsync'
import useDebounce from '../lib/useDebounce'
import FilterBar, { DEFAULT_FILTERS } from '../components/FilterBar'
import ReportCard from '../components/ReportCard'
import EmptyState, { Loading, ErrorState } from '../components/EmptyState'

const STORAGE_KEY = 'campusfind.browseFilters'

function loadFilters() {
  try {
    return { ...DEFAULT_FILTERS, ...JSON.parse(sessionStorage.getItem(STORAGE_KEY) || '{}') }
  } catch {
    return DEFAULT_FILTERS
  }
}

export default function Browse() {
  const [filters, setFilters] = useState(loadFilters)
  const q = useDebounce(filters.q, 300)
  const query = { ...filters, q }
  const key = JSON.stringify(query)

  const { data, error, loading, reload } = useAsync(() => {
    sessionStorage.setItem(STORAGE_KEY, key)
    return api.reports.list(query)
  }, [key])

  return (
    <div className="page__inner">
      <div className="page__header">
        <h1>Browse reports</h1>
        {data && (
          <span className="muted">
            {data.length} result{data.length === 1 ? '' : 's'}
          </span>
        )}
      </div>
      <FilterBar filters={filters} onChange={setFilters} />
      <div className={loading && data ? 'is-refreshing' : ''}>
        {loading && !data ? (
          <Loading />
        ) : error ? (
          <ErrorState error={error} onRetry={reload} />
        ) : data.length === 0 ? (
          <EmptyState title="No reports match your filters">
            Try a different keyword or clear the filters.
          </EmptyState>
        ) : (
          <div className="cards">
            {data.map((r) => (
              <ReportCard key={r.id} report={r} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
