import { ipcMain } from 'electron'
import { getDb, mutate } from '../store'
import { wrap, validationError, notFound, forbidden } from '../errors'
import { requireAuth, newId } from '../auth'
import { findReport, serializeReport } from '../reports'
import { validateMessage } from '../../shared/validators'

const otherParty = (m, userId) => (m.fromUserId === userId ? m.toUserId : m.fromUserId)

function findUser(id) {
  const u = getDb().users.find((x) => x.id === id)
  if (!u) throw notFound('User')
  return { id: u.id, name: u.name, email: u.email }
}

// A thread is only valid when one participant owns the report.
function checkThread(user, report, otherUserId) {
  if (otherUserId === user.id) throw validationError({ toUserId: 'You can’t message yourself' })
  if (report.userId !== user.id && report.userId !== otherUserId) {
    throw forbidden('Messages must be with the person who posted this report')
  }
}

function threads(token) {
  const user = requireAuth(token)
  const db = getDb()
  const byKey = new Map()
  for (const m of db.messages) {
    if (m.fromUserId !== user.id && m.toUserId !== user.id) continue
    const otherId = otherParty(m, user.id)
    const key = `${m.reportId}:${otherId}`
    let t = byKey.get(key)
    if (!t) {
      const report = db.reports.find((r) => r.id === m.reportId)
      const other = db.users.find((u) => u.id === otherId)
      if (!report || !other) continue
      t = {
        reportId: report.id,
        reportTitle: report.title,
        reportType: report.type,
        reportStatus: report.status,
        otherUser: { id: other.id, name: other.name },
        lastMessage: null,
        unreadCount: 0
      }
      byKey.set(key, t)
    }
    if (!t.lastMessage || m.createdAt > t.lastMessage.createdAt) t.lastMessage = m
    if (m.toUserId === user.id && !m.read) t.unreadCount++
  }
  return [...byKey.values()].sort((a, b) =>
    b.lastMessage.createdAt.localeCompare(a.lastMessage.createdAt)
  )
}

async function thread(token, reportId, otherUserId) {
  const user = requireAuth(token)
  const report = findReport(reportId)
  const otherUser = findUser(otherUserId)
  checkThread(user, report, otherUserId)
  const inThread = (m) =>
    m.reportId === reportId &&
    ((m.fromUserId === user.id && m.toUserId === otherUserId) ||
      (m.fromUserId === otherUserId && m.toUserId === user.id))
  const db = getDb()
  const unread = db.messages.filter((m) => inThread(m) && m.toUserId === user.id && !m.read)
  if (unread.length) {
    await mutate(() => unread.forEach((m) => (m.read = true)))
  }
  const messages = db.messages
    .filter(inThread)
    .sort((a, b) => a.createdAt.localeCompare(b.createdAt))
  return { report: serializeReport(report, user), otherUser, messages }
}

function send(token, input) {
  const user = requireAuth(token)
  const { valid, errors, value } = validateMessage(input)
  if (!valid) throw validationError(errors)
  const report = findReport(value.reportId)
  findUser(value.toUserId)
  checkThread(user, report, value.toUserId)
  return mutate((db) => {
    const message = {
      id: newId(),
      reportId: report.id,
      fromUserId: user.id,
      toUserId: value.toUserId,
      body: value.body,
      read: false,
      createdAt: new Date().toISOString()
    }
    db.messages.push(message)
    return message
  })
}

export function unreadCount(userId) {
  return getDb().messages.filter((m) => m.toUserId === userId && !m.read).length
}

export function registerMessageHandlers() {
  ipcMain.handle('messages:threads', wrap(threads))
  ipcMain.handle('messages:thread', wrap(thread))
  ipcMain.handle('messages:send', wrap(send))
  ipcMain.handle(
    'messages:unreadCount',
    wrap((token) => unreadCount(requireAuth(token).id))
  )
}
