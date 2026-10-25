import { registerAuthHandlers } from './authHandlers'
import { registerReportHandlers } from './reportHandlers'

export function registerIpc() {
  registerAuthHandlers()
  registerReportHandlers()
}
