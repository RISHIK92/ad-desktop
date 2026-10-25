import { contextBridge, ipcRenderer } from 'electron'

const call =
  (channel) =>
  (...args) =>
    ipcRenderer.invoke(channel, ...args)

contextBridge.exposeInMainWorld('api', {
  auth: {
    register: call('auth:register'),
    login: call('auth:login'),
    me: call('auth:me'),
    logout: call('auth:logout'),
    updateProfile: call('auth:updateProfile')
  },
  reports: {
    list: call('reports:list'),
    mine: call('reports:mine'),
    get: call('reports:get'),
    create: call('reports:create'),
    update: call('reports:update'),
    setStatus: call('reports:setStatus'),
    resolvePair: call('reports:resolvePair'),
    delete: call('reports:delete')
  },
  matches: {
    forReport: call('matches:forReport')
  },
  messages: {
    threads: call('messages:threads'),
    thread: call('messages:thread'),
    send: call('messages:send'),
    unreadCount: call('messages:unreadCount')
  },
  dashboard: {
    stats: call('dashboard:stats')
  }
})
