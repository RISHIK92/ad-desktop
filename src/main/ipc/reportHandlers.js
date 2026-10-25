import { ipcMain } from 'electron'
import { getDb, mutate } from '../store'
import { wrap, validationError } from '../errors'
import { requireAuth, newId } from '../auth'
import { findReport, requireOwner, serializeReport } from '../reports'
import { validateReport, validateStatus } from '../../shared/validators'

function cleanInput(input) {
  const { valid, errors, value } = validateReport(input)
  if (!valid) throw validationError(errors)
  if (value.type === 'lost') value.privateNote = ''
  return value
}

function owner(report) {
  const u = getDb().users.find((x) => x.id === report.userId)
  return u ? { id: u.id, name: u.name, email: u.email } : null
}

// Clears the back-link on the partner of a resolved pair.
function unlinkPartner(db, report) {
  if (!report.resolvedWithReportId) return
  const partner = db.reports.find((r) => r.id === report.resolvedWithReportId)
  if (partner && partner.resolvedWithReportId === report.id) delete partner.resolvedWithReportId
  delete report.resolvedWithReportId
}

function filterReports(reports, f = {}) {
  const q = typeof f.q === 'string' ? f.q.trim().toLowerCase() : ''
  const status = f.status === undefined ? 'open' : f.status
  const out = reports.filter((r) => {
    if (f.type && f.type !== 'all' && r.type !== f.type) return false
    if (f.category && r.category !== f.category) return false
    if (f.location && r.location !== f.location) return false
    if (status && status !== 'all' && r.status !== status) return false
    if (f.dateFrom && r.date < f.dateFrom) return false
    if (f.dateTo && r.date > f.dateTo) return false
    if (q) {
      const hay = `${r.title} ${r.description} ${r.locationDetail || ''}`.toLowerCase()
      if (!q.split(/\s+/).every((word) => hay.includes(word))) return false
    }
    return true
  })
  const dir = f.sort === 'oldest' ? 1 : -1
  return out.sort((a, b) => dir * (a.date.localeCompare(b.date) || a.createdAt.localeCompare(b.createdAt)))
}

export function registerReportHandlers() {
  ipcMain.handle(
    'reports:list',
    wrap((token, filters) => {
      const user = requireAuth(token)
      return filterReports(getDb().reports, filters).map((r) => serializeReport(r, user))
    })
  )

  ipcMain.handle(
    'reports:mine',
    wrap((token) => {
      const user = requireAuth(token)
      return getDb()
        .reports.filter((r) => r.userId === user.id)
        .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
        .map((r) => ({ ...serializeReport(r, user), matchCount: 0 }))
    })
  )

  ipcMain.handle(
    'reports:get',
    wrap((token, id) => {
      const user = requireAuth(token)
      const report = findReport(id)
      return { ...serializeReport(report, user), owner: owner(report) }
    })
  )

  ipcMain.handle(
    'reports:create',
    wrap((token, input) => {
      const user = requireAuth(token)
      const value = cleanInput(input)
      return mutate((db) => {
        const now = new Date().toISOString()
        const report = {
          id: newId(),
          ...value,
          status: 'open',
          userId: user.id,
          createdAt: now,
          updatedAt: now
        }
        db.reports.push(report)
        return serializeReport(report, user)
      })
    })
  )

  ipcMain.handle(
    'reports:update',
    wrap((token, id, input) => {
      const user = requireAuth(token)
      const report = findReport(id)
      requireOwner(report, user)
      const value = cleanInput(input)
      return mutate(() => {
        Object.assign(report, value, { updatedAt: new Date().toISOString() })
        return serializeReport(report, user)
      })
    })
  )

  ipcMain.handle(
    'reports:setStatus',
    wrap((token, id, status) => {
      const user = requireAuth(token)
      const report = findReport(id)
      requireOwner(report, user)
      const err = validateStatus(status)
      if (err) throw validationError({ status: err })
      return mutate((db) => {
        if (status === 'open') unlinkPartner(db, report)
        report.status = status
        report.updatedAt = new Date().toISOString()
        return serializeReport(report, user)
      })
    })
  )

  ipcMain.handle(
    'reports:delete',
    wrap(async (token, id) => {
      const user = requireAuth(token)
      const report = findReport(id)
      requireOwner(report, user)
      await mutate((db) => {
        unlinkPartner(db, report)
        db.reports = db.reports.filter((r) => r.id !== id)
        db.messages = db.messages.filter((m) => m.reportId !== id)
      })
      return null
    })
  )
}
