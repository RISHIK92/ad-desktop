// Pages call this after reading or sending messages so the navbar badge refreshes.
export const notifyUnreadChanged = () => window.dispatchEvent(new Event('campusfind:unread'))
