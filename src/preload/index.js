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
  }
})
