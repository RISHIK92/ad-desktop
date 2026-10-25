import { getDb } from './store'

export function purgeExpiredSessions() {
  const db = getDb()
  const now = Date.now()
  db.sessions = db.sessions.filter((s) => new Date(s.expiresAt).getTime() > now)
}
