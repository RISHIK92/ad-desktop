import { randomBytes, randomUUID } from 'crypto'
import bcrypt from 'bcryptjs'
import { getDb } from './store'
import { unauthorized } from './errors'
import { BCRYPT_COST, SESSION_DAYS } from '../shared/constants'

export const hashPassword = (password) => bcrypt.hash(password, BCRYPT_COST)
export const verifyPassword = (password, hash) => bcrypt.compare(password, hash)

export function publicUser(user) {
  return { id: user.id, name: user.name, email: user.email, createdAt: user.createdAt }
}

export function createSession(userId) {
  const now = new Date()
  const session = {
    token: randomBytes(32).toString('hex'),
    userId,
    createdAt: now.toISOString(),
    expiresAt: new Date(now.getTime() + SESSION_DAYS * 86400000).toISOString()
  }
  getDb().sessions.push(session)
  return session
}

export function revokeSession(token) {
  const db = getDb()
  db.sessions = db.sessions.filter((s) => s.token !== token)
}

export function purgeExpiredSessions() {
  const db = getDb()
  const now = Date.now()
  db.sessions = db.sessions.filter((s) => new Date(s.expiresAt).getTime() > now)
}

// Returns the user for a valid token or throws UNAUTHORIZED.
export function requireAuth(token) {
  if (typeof token !== 'string' || !token) throw unauthorized()
  const db = getDb()
  const session = db.sessions.find((s) => s.token === token)
  if (!session || new Date(session.expiresAt).getTime() <= Date.now()) throw unauthorized()
  const user = db.users.find((u) => u.id === session.userId)
  if (!user) throw unauthorized()
  return user
}

export const newId = () => randomUUID()
