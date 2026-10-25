import { getDb } from './store'
import { notFound, forbidden } from './errors'

export function findReport(id) {
  const report = getDb().reports.find((r) => r.id === id)
  if (!report) throw notFound('Report')
  return report
}

export function requireOwner(report, user) {
  if (report.userId !== user.id) throw forbidden('Only the poster can change this report')
}

export function userName(id) {
  return getDb().users.find((u) => u.id === id)?.name || 'Unknown user'
}

// Copy of a report safe to send to the viewer: privateNote only for the owner.
export function serializeReport(report, viewer) {
  const { privateNote, ...rest } = report
  const out = { ...rest, ownerName: userName(report.userId) }
  if (viewer && viewer.id === report.userId) out.privateNote = privateNote || ''
  return out
}
