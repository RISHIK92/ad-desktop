import { registerAuthHandlers } from './authHandlers'
import { registerReportHandlers } from './reportHandlers'
import { registerMatchHandlers } from './matchHandlers'

export function registerIpc() {
  registerAuthHandlers()
  registerReportHandlers()
  registerMatchHandlers()
}
