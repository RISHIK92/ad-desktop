import { ipcMain } from 'electron'
import { getDb } from '../store'
import { wrap } from '../errors'
import { requireAuth } from '../auth'
import { serializeReport } from '../reports'
import { findMatches } from '../../shared/matching'

function stats(token) {
  const user = requireAuth(token)
  const reports = getDb().reports
  const open = reports.filter((r) => r.status === 'open')
  const since = Date.now() - 30 * 86400000

  const myMatches = []
  for (const r of open) {
    if (r.userId !== user.id) continue
    for (const m of findMatches(r, reports)) {
      myMatches.push({
        forReport: { id: r.id, title: r.title, type: r.type },
        report: serializeReport(m.report, user),
        score: m.score,
        label: m.label,
        reasons: m.reasons
      })
    }
  }
  myMatches.sort((a, b) => b.score - a.score)

  return {
    openLost: open.filter((r) => r.type === 'lost').length,
    openFound: open.filter((r) => r.type === 'found').length,
    resolvedLast30: reports.filter(
      (r) => r.status === 'resolved' && new Date(r.updatedAt).getTime() >= since
    ).length,
    myMatchCount: myMatches.length,
    myMatches,
    recent: [...open]
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
      .slice(0, 8)
      .map((r) => serializeReport(r, user))
  }
}

export function registerDashboardHandlers() {
  ipcMain.handle('dashboard:stats', wrap(stats))
}
