import { registerAuthHandlers } from './authHandlers'
import { registerReportHandlers } from './reportHandlers'
import { registerMatchHandlers } from './matchHandlers'
import { registerMessageHandlers } from './messageHandlers'
import { registerDashboardHandlers } from './dashboardHandlers'

export function registerIpc() {
  registerAuthHandlers()
  registerReportHandlers()
  registerMatchHandlers()
  registerMessageHandlers()
  registerDashboardHandlers()
}
