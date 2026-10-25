import { contextBridge, ipcRenderer } from 'electron'

const call = (channel) => (...args) => ipcRenderer.invoke(channel, ...args)

contextBridge.exposeInMainWorld('api', {})
