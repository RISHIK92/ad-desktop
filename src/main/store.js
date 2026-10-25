import fs from 'fs'
import path from 'path'
import { app } from 'electron'

const EMPTY = () => ({ version: 1, users: [], sessions: [], reports: [], messages: [] })

let db = null
let writeQueue = Promise.resolve()

export function dbPath() {
  return path.join(app.getPath('userData'), 'campusfind-db.json')
}

// Returns true when the file did not exist (caller should seed).
export function load() {
  const file = dbPath()
  if (!fs.existsSync(file)) {
    db = EMPTY()
    return true
  }
  try {
    db = { ...EMPTY(), ...JSON.parse(fs.readFileSync(file, 'utf8')) }
    return false
  } catch (err) {
    console.error('Data file unreadable, starting fresh:', err)
    fs.renameSync(file, `${file}.corrupt-${Date.now()}`)
    db = EMPTY()
    return true
  }
}

export function getDb() {
  if (!db) throw new Error('Store not loaded')
  return db
}

function writeNow() {
  const file = dbPath()
  const tmp = `${file}.tmp`
  fs.mkdirSync(path.dirname(file), { recursive: true })
  fs.writeFileSync(tmp, JSON.stringify(db, null, 2))
  fs.renameSync(tmp, file)
}

// Serializes writes so two quick mutations never interleave.
export function save() {
  writeQueue = writeQueue.then(writeNow).catch((err) => console.error('Save failed:', err))
  return writeQueue
}

// Applies fn to the in-memory db, then persists it.
export async function mutate(fn) {
  const result = fn(getDb())
  await save()
  return result
}

export function reset() {
  const file = dbPath()
  if (fs.existsSync(file)) fs.unlinkSync(file)
  db = EMPTY()
}
