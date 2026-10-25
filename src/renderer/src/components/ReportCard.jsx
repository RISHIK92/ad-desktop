import { Link } from 'react-router-dom'
import StatusBadge, { TypeBadge } from './StatusBadge'
import { formatDate } from '../lib/format'

export default function ReportCard({ report, footer, extra }) {
  return (
    <div className={`report-card report-card--${report.type}`}>
      <Link to={`/reports/${report.id}`} className="report-card__main">
        <div className="row">
          <TypeBadge type={report.type} />
          <StatusBadge status={report.status} />
          {extra}
        </div>
        <h3 className="report-card__title">{report.title}</h3>
        <div className="report-card__meta">
          <span>{report.category}</span>
          <span>·</span>
          <span>{report.location}</span>
          <span>·</span>
          <span>{formatDate(report.date)}</span>
        </div>
        {report.ownerName && <div className="report-card__owner">by {report.ownerName}</div>}
      </Link>
      {footer && <div className="report-card__footer">{footer}</div>}
    </div>
  )
}
