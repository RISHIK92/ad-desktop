import {
  CATEGORIES,
  LOCATIONS,
  REPORT_TYPES,
  STATUSES,
  LIMITS,
  ALLOWED_EMAIL_DOMAIN
} from './constants'

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/
const DATE_RE = /^\d{4}-\d{2}-\d{2}$/

const str = (v) => (typeof v === 'string' ? v.trim() : '')
const result = (errors, value) => ({ valid: Object.keys(errors).length === 0, errors, value })

export const MESSAGES = {
  name: `Name must be ${LIMITS.nameMin}–${LIMITS.nameMax} characters`,
  email: 'Enter a valid email address',
  emailDomain: `Use your @${ALLOWED_EMAIL_DOMAIN} email address`,
  password: 'Password must be at least 8 characters and include a letter and a number',
  confirmPassword: 'Passwords do not match',
  loginEmail: 'Enter your email',
  loginPassword: 'Enter your password',
  type: 'Choose lost or found',
  title: `Item name must be ${LIMITS.titleMin}–${LIMITS.titleMax} characters`,
  category: 'Choose a category',
  description: `Description must be ${LIMITS.descriptionMin}–${LIMITS.descriptionMax} characters`,
  date: 'Enter a valid date',
  dateFuture: 'Date cannot be in the future',
  dateOld: `Date cannot be more than ${LIMITS.maxReportAgeDays} days ago`,
  location: 'Choose a location',
  locationDetail: `Location detail must be at most ${LIMITS.locationDetailMax} characters`,
  privateNote: `Verification detail must be at most ${LIMITS.privateNoteMax} characters`,
  privateNoteLost: 'Verification detail is only for found reports',
  status: 'Invalid status',
  body: `Message must be 1–${LIMITS.messageMax} characters`
}

export function validateName(name) {
  const v = str(name)
  return v.length >= LIMITS.nameMin && v.length <= LIMITS.nameMax ? null : MESSAGES.name
}

export function validateEmail(email) {
  const v = str(email).toLowerCase()
  if (!v || v.length > LIMITS.emailMax || !EMAIL_RE.test(v)) return MESSAGES.email
  if (ALLOWED_EMAIL_DOMAIN && !v.endsWith(`@${ALLOWED_EMAIL_DOMAIN}`)) return MESSAGES.emailDomain
  return null
}

export function validatePassword(password) {
  const v = typeof password === 'string' ? password : ''
  const ok =
    v.length >= LIMITS.passwordMin &&
    v.length <= LIMITS.passwordMax &&
    /[A-Za-z]/.test(v) &&
    /\d/.test(v)
  return ok ? null : MESSAGES.password
}

export function validateRegister(input = {}) {
  const value = {
    name: str(input.name),
    email: str(input.email).toLowerCase(),
    password: typeof input.password === 'string' ? input.password : '',
    confirmPassword: typeof input.confirmPassword === 'string' ? input.confirmPassword : ''
  }
  const errors = {}
  const nameErr = validateName(value.name)
  if (nameErr) errors.name = nameErr
  const emailErr = validateEmail(value.email)
  if (emailErr) errors.email = emailErr
  const pwErr = validatePassword(value.password)
  if (pwErr) errors.password = pwErr
  if (value.confirmPassword !== value.password) errors.confirmPassword = MESSAGES.confirmPassword
  return result(errors, value)
}

export function validateLogin(input = {}) {
  const value = {
    email: str(input.email).toLowerCase(),
    password: typeof input.password === 'string' ? input.password : ''
  }
  const errors = {}
  if (!value.email) errors.email = MESSAGES.loginEmail
  if (!value.password) errors.password = MESSAGES.loginPassword
  return result(errors, value)
}

export function todayYmd(now = new Date()) {
  const pad = (x) => String(x).padStart(2, '0')
  return `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`
}

function parseYmd(s) {
  if (!DATE_RE.test(s)) return null
  const [y, m, d] = s.split('-').map(Number)
  const date = new Date(Date.UTC(y, m - 1, d))
  if (date.getUTCFullYear() !== y || date.getUTCMonth() !== m - 1 || date.getUTCDate() !== d) {
    return null
  }
  return date
}

export function daysBetween(a, b) {
  const da = parseYmd(a)
  const db = parseYmd(b)
  if (!da || !db) return NaN
  return Math.round((db - da) / 86400000)
}

export function validateDate(date, now = new Date()) {
  const v = str(date)
  if (!parseYmd(v)) return MESSAGES.date
  const gap = daysBetween(v, todayYmd(now))
  if (gap < 0) return MESSAGES.dateFuture
  if (gap > LIMITS.maxReportAgeDays) return MESSAGES.dateOld
  return null
}

// Returns only the known fields, so callers can't inject userId/status through this.
export function validateReport(input = {}, { now = new Date() } = {}) {
  const value = {
    type: str(input.type),
    title: str(input.title),
    category: str(input.category),
    description: str(input.description),
    date: str(input.date),
    location: str(input.location),
    locationDetail: str(input.locationDetail),
    privateNote: str(input.privateNote)
  }
  const errors = {}
  if (!REPORT_TYPES.includes(value.type)) errors.type = MESSAGES.type
  if (value.title.length < LIMITS.titleMin || value.title.length > LIMITS.titleMax) {
    errors.title = MESSAGES.title
  }
  if (!CATEGORIES.includes(value.category)) errors.category = MESSAGES.category
  if (
    value.description.length < LIMITS.descriptionMin ||
    value.description.length > LIMITS.descriptionMax
  ) {
    errors.description = MESSAGES.description
  }
  const dateErr = validateDate(value.date, now)
  if (dateErr) errors.date = dateErr
  if (!LOCATIONS.includes(value.location)) errors.location = MESSAGES.location
  if (value.locationDetail.length > LIMITS.locationDetailMax) {
    errors.locationDetail = MESSAGES.locationDetail
  }
  if (value.privateNote.length > LIMITS.privateNoteMax) {
    errors.privateNote = MESSAGES.privateNote
  } else if (value.privateNote && value.type === 'lost') {
    errors.privateNote = MESSAGES.privateNoteLost
  }
  return result(errors, value)
}

export function validateStatus(status) {
  return STATUSES.includes(status) ? null : MESSAGES.status
}

export function validateMessage(input = {}) {
  const value = {
    reportId: str(input.reportId),
    toUserId: str(input.toUserId),
    body: str(input.body)
  }
  const errors = {}
  if (!value.body || value.body.length > LIMITS.messageMax) errors.body = MESSAGES.body
  return result(errors, value)
}
