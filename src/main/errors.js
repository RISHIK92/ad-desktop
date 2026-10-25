export class AppError extends Error {
  constructor(code, message, fields) {
    super(message)
    this.code = code
    this.fields = fields
  }
}

export const validationError = (fields) =>
  new AppError('VALIDATION', 'Please fix the highlighted fields', fields)
export const unauthorized = () => new AppError('UNAUTHORIZED', 'Please log in again')
export const notFound = (what = 'Record') => new AppError('NOT_FOUND', `${what} not found`)
export const forbidden = (message = 'You do not have permission to do that') =>
  new AppError('FORBIDDEN', message)
export const conflict = (message, fields) => new AppError('CONFLICT', message, fields)

// Wraps an ipcMain handler so it always returns the { ok, data | error } envelope.
export function wrap(fn) {
  return async (_event, ...args) => {
    try {
      const data = await fn(...args)
      return { ok: true, data: data === undefined ? null : data }
    } catch (err) {
      if (err instanceof AppError) {
        const error = { code: err.code, message: err.message }
        if (err.fields) error.fields = err.fields
        return { ok: false, error }
      }
      console.error(err)
      return { ok: false, error: { code: 'INTERNAL', message: 'Something went wrong' } }
    }
  }
}
