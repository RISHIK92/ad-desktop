import { CATEGORIES, LOCATIONS } from '@shared/constants'

export const DEFAULT_FILTERS = {
  q: '',
  type: 'all',
  category: '',
  location: '',
  dateFrom: '',
  dateTo: '',
  status: 'open',
  sort: 'newest'
}

export default function FilterBar({ filters, onChange }) {
  const set = (key) => (e) => onChange({ ...filters, [key]: e.target.value })
  const isDefault = JSON.stringify(filters) === JSON.stringify(DEFAULT_FILTERS)

  return (
    <div className="card filterbar">
      <div className="filterbar__top">
        <input
          className="filterbar__search"
          type="search"
          placeholder="Search by item name, description or location detail…"
          value={filters.q}
          onChange={set('q')}
          autoFocus
        />
        <div className="segmented segmented--inline">
          {['all', 'lost', 'found'].map((t) => (
            <button
              key={t}
              type="button"
              className={`segmented__opt${filters.type === t ? ' segmented__opt--active' : ''}`}
              onClick={() => onChange({ ...filters, type: t })}
            >
              {t === 'all' ? 'All' : t === 'lost' ? 'Lost' : 'Found'}
            </button>
          ))}
        </div>
      </div>
      <div className="filterbar__row">
        <label>
          <span>Category</span>
          <select value={filters.category} onChange={set('category')}>
            <option value="">All categories</option>
            {CATEGORIES.map((c) => (
              <option key={c}>{c}</option>
            ))}
          </select>
        </label>
        <label>
          <span>Location</span>
          <select value={filters.location} onChange={set('location')}>
            <option value="">All locations</option>
            {LOCATIONS.map((l) => (
              <option key={l}>{l}</option>
            ))}
          </select>
        </label>
        <label>
          <span>From</span>
          <input type="date" value={filters.dateFrom} max={filters.dateTo || undefined} onChange={set('dateFrom')} />
        </label>
        <label>
          <span>To</span>
          <input type="date" value={filters.dateTo} min={filters.dateFrom || undefined} onChange={set('dateTo')} />
        </label>
        <label>
          <span>Status</span>
          <select value={filters.status} onChange={set('status')}>
            <option value="open">Open</option>
            <option value="resolved">Resolved</option>
            <option value="all">All</option>
          </select>
        </label>
        <label>
          <span>Sort</span>
          <select value={filters.sort} onChange={set('sort')}>
            <option value="newest">Newest first</option>
            <option value="oldest">Oldest first</option>
          </select>
        </label>
        <button
          className="btn btn--ghost btn--sm filterbar__clear"
          onClick={() => onChange(DEFAULT_FILTERS)}
          disabled={isDefault}
        >
          Clear
        </button>
      </div>
    </div>
  )
}
