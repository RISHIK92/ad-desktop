export function TypeBadge({ type }) {
  return <span className={`pill pill--${type}`}>{type === 'lost' ? 'Lost' : 'Found'}</span>
}

export default function StatusBadge({ status }) {
  return <span className={`pill pill--${status}`}>{status === 'open' ? 'Open' : 'Resolved'}</span>
}
