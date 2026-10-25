const TOKEN_KEY = 'campusfind.token'

export const getToken = () => localStorage.getItem(TOKEN_KEY)
export const setToken = (token) => localStorage.setItem(TOKEN_KEY, token)
export const clearToken = () => localStorage.removeItem(TOKEN_KEY)

export class ApiError extends Error {
  constructor({ code, message, fields }) {
    super(message)
    this.code = code
    this.fields = fields || {}
  }
}

async function unwrap(promise, { authed }) {
  let res
  try {
    res = await promise
  } catch {
    throw new ApiError({ code: 'INTERNAL', message: 'Something went wrong' })
  }
  if (res.ok) return res.data
  if (authed && res.error.code === 'UNAUTHORIZED') {
    clearToken()
    window.dispatchEvent(new Event('campusfind:logout'))
    window.location.hash = '#/login'
  }
  throw new ApiError(res.error)
}

// Calls a protected channel with the stored token as the first argument.
const authed =
  (fn) =>
  (...args) =>
    unwrap(fn(getToken(), ...args), { authed: true })
const open =
  (fn) =>
  (...args) =>
    unwrap(fn(...args), { authed: false })

const w = window.api

const api = {
  auth: {
    register: open(w.auth.register),
    login: open(w.auth.login),
    me: (token) => unwrap(w.auth.me(token), { authed: false }),
    logout: authed(w.auth.logout),
    updateProfile: authed(w.auth.updateProfile)
  },
  reports: {
    list: authed(w.reports.list),
    mine: authed(w.reports.mine),
    get: authed(w.reports.get),
    create: authed(w.reports.create),
    update: authed(w.reports.update),
    setStatus: authed(w.reports.setStatus),
    resolvePair: authed(w.reports.resolvePair),
    delete: authed(w.reports.delete)
  },
  matches: {
    forReport: authed(w.matches.forReport)
  },
  messages: {
    threads: authed(w.messages.threads),
    thread: authed(w.messages.thread),
    send: authed(w.messages.send),
    unreadCount: authed(w.messages.unreadCount)
  },
  dashboard: {
    stats: authed(w.dashboard.stats)
  }
}

export default api
