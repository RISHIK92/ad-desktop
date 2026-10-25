import { ipcMain } from 'electron'
import { getDb, mutate } from '../store'
import { wrap, validationError, conflict, AppError } from '../errors'
import {
  hashPassword,
  verifyPassword,
  createSession,
  revokeSession,
  requireAuth,
  publicUser,
  newId
} from '../auth'
import { validateRegister, validateLogin, validateName } from '../../shared/validators'

async function register(input) {
  const { valid, errors, value } = validateRegister(input)
  if (!valid) throw validationError(errors)
  if (getDb().users.some((u) => u.email === value.email)) {
    throw conflict('Email is already registered', { email: 'Email is already registered' })
  }
  const passwordHash = await hashPassword(value.password)
  return mutate((db) => {
    // Re-check after the async hash in case of a double submit.
    if (db.users.some((u) => u.email === value.email)) {
      throw conflict('Email is already registered', { email: 'Email is already registered' })
    }
    const user = {
      id: newId(),
      name: value.name,
      email: value.email,
      passwordHash,
      createdAt: new Date().toISOString()
    }
    db.users.push(user)
    const session = createSession(user.id)
    return { token: session.token, user: publicUser(user) }
  })
}

async function login(input) {
  const { valid, errors, value } = validateLogin(input)
  if (!valid) throw validationError(errors)
  const user = getDb().users.find((u) => u.email === value.email)
  const ok = user ? await verifyPassword(value.password, user.passwordHash) : false
  if (!ok) throw new AppError('UNAUTHORIZED', 'Invalid email or password')
  return mutate(() => {
    const session = createSession(user.id)
    return { token: session.token, user: publicUser(user) }
  })
}

export function registerAuthHandlers() {
  ipcMain.handle('auth:register', wrap(register))
  ipcMain.handle('auth:login', wrap(login))
  ipcMain.handle(
    'auth:me',
    wrap((token) => ({ user: publicUser(requireAuth(token)) }))
  )
  ipcMain.handle(
    'auth:logout',
    wrap(async (token) => {
      await mutate(() => revokeSession(token))
      return null
    })
  )
  ipcMain.handle(
    'auth:updateProfile',
    wrap(async (token, input = {}) => {
      const user = requireAuth(token)
      const nameErr = validateName(input.name)
      if (nameErr) throw validationError({ name: nameErr })
      return mutate(() => {
        user.name = input.name.trim()
        return { user: publicUser(user) }
      })
    })
  )
}
