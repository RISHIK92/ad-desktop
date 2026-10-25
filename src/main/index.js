import { join } from 'path'
import { app, BrowserWindow, Menu, dialog, shell } from 'electron'
import * as store from './store'
import { seed } from './seed'
import { purgeExpiredSessions } from './auth'
import { registerIpc } from './ipc'

let mainWindow = null

function initData() {
  const fresh = store.load()
  if (fresh) seed(store.getDb())
  purgeExpiredSessions()
  return store.save()
}

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    minWidth: 960,
    minHeight: 640,
    title: 'CampusFind',
    show: false,
    webPreferences: {
      preload: join(__dirname, '../preload/index.js'),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: true
    }
  })

  mainWindow.on('ready-to-show', () => mainWindow.show())

  mainWindow.webContents.setWindowOpenHandler(() => ({ action: 'deny' }))
  mainWindow.webContents.on('will-navigate', (event, url) => {
    const devUrl = process.env.ELECTRON_RENDERER_URL
    const allowed = devUrl ? url.startsWith(devUrl) : url.startsWith('file://')
    if (!allowed) event.preventDefault()
  })

  if (!app.isPackaged && process.env.ELECTRON_RENDERER_URL) {
    mainWindow.loadURL(process.env.ELECTRON_RENDERER_URL)
  } else {
    mainWindow.loadFile(join(__dirname, '../renderer/index.html'))
  }
}

async function resetDemoData() {
  const { response } = await dialog.showMessageBox(mainWindow, {
    type: 'warning',
    buttons: ['Cancel', 'Reset'],
    defaultId: 0,
    cancelId: 0,
    message: 'Reset demo data?',
    detail: 'This deletes all users, reports and messages and restores the demo accounts.'
  })
  if (response !== 1) return
  store.reset()
  seed(store.getDb())
  await store.save()
  mainWindow?.webContents.reload()
}

function buildMenu() {
  const template = [
    { role: 'appMenu' },
    { role: 'fileMenu' },
    { role: 'editMenu' },
    { role: 'viewMenu' },
    { role: 'windowMenu' },
    {
      role: 'help',
      submenu: [
        { label: 'Reset Demo Data…', click: resetDemoData },
        { type: 'separator' },
        {
          label: 'Show Data File in Finder',
          click: () => shell.showItemInFolder(store.dbPath())
        }
      ]
    }
  ]
  Menu.setApplicationMenu(Menu.buildFromTemplate(template))
}

app.whenReady().then(async () => {
  await initData()
  registerIpc()
  buildMenu()
  createWindow()

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit()
})
