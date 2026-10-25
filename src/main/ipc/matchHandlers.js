import { ipcMain } from 'electron'
import { getDb } from '../store'
import { wrap } from '../errors'
import { requireAuth } from '../auth'
import { findReport, serializeReport } from '../reports'
import { findMatches } from '../../shared/matching'

// Number of suggested matches for each of a user's open reports.
export function matchCounts(userId) {
  const reports = getDb().reports
  const counts = new Map()
  for (const r of reports) {
    if (r.userId === userId && r.status === 'open') counts.set(r.id, findMatches(r, reports).length)
  }
  return counts
}

export function registerMatchHandlers() {
  ipcMain.handle(
    'matches:forReport',
    wrap((token, reportId) => {
      const user = requireAuth(token)
      const report = findReport(reportId)
      return findMatches(report, getDb().reports).map((m) => ({
        ...m,
        report: serializeReport(m.report, user)
      }))
    })
  )
}
