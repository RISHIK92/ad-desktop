# CampusFind

A desktop Lost & Found Management System for college students, built with Electron, Vite and React.
Students can report lost items, post found items, search and filter reports, get automatic match
suggestions, message the poster, and mark items as returned.

Everything runs locally — no server, database or internet connection needed. Demo data is created
on first launch.

## Install (macOS)

1. Open `CampusFind-1.0.0.dmg` and drag **CampusFind** into the **Applications** folder.
2. Open CampusFind from Applications. Because the app isn't notarized by Apple, macOS blocks the
   first launch. Click **Done**, then open **System Settings → Privacy & Security**, scroll down and
   click **Open Anyway** next to the CampusFind message, then confirm.
3. If macOS instead says the app *"is damaged and can't be opened"*, open Terminal and run:
   ```sh
   xattr -cr /Applications/CampusFind.app
   ```
   then open the app again. This removes the download quarantine flag.
4. Log in with a demo account below, or register a new one.

## Demo accounts

| Name       | Email                   | Password   |
| ---------- | ----------------------- | ---------- |
| Aarav Demo | `aarav@campusfind.demo` | `Demo1234` |
| Priya Demo | `priya@campusfind.demo` | `Demo1234` |
| Rahul Demo | `rahul@campusfind.demo` | `Demo1234` |

The seed data includes three strong match pairs (wallet, ID card, earphones), several unmatched
reports, one already-resolved pair and a message thread between Aarav and Priya. Log out and back in
as different accounts to try the multi-user flow.

**Help → Reset Demo Data** restores the original demo data at any time.

## Features

- Email/password registration and login with session tokens (7-day expiry)
- Report lost and found items with category, date, location and description
- Private verification detail on found reports, visible only to the finder
- Browse with keyword search, type, category, location, date range and status filters
- Automatic match suggestions scored on category, date gap, location and description similarity
- One-click "mark both resolved" for a confirmed match, with a notification to the other person
- In-app messaging per report with unread counts
- Dashboard with stats, your matches and recent reports

## Development

Requires Node 20+.

```sh
npm install
npm run dev        # start the app with hot reload
npm test           # run unit tests (validators + matching)
npm run dist:mac   # build release/CampusFind-1.0.0.dmg (must run on a Mac)
```

### Project layout

```
src/
  shared/     constants, validators and matching — used by both main and renderer
  main/       Electron main process: JSON store, auth, seed data, IPC handlers
  preload/    exposes window.api to the renderer via contextBridge
  renderer/   React UI (HashRouter)
test/         Vitest unit tests
```

The main process acts as the backend. Every IPC handler returns `{ ok: true, data }` or
`{ ok: false, error: { code, message, fields? } }`.

## Data and security notes

- All data lives in one JSON file:
  `~/Library/Application Support/CampusFind/campusfind-db.json`
  (**Help → Show Data File in Finder**). Writes are atomic (temp file + rename) and serialized.
- Passwords are hashed with bcrypt (bcryptjs, cost 10) and never sent to the UI.
- The renderer runs with `contextIsolation`, `sandbox` and no Node integration, under a strict
  Content-Security-Policy. New windows and external navigation are blocked.
- **Known limitation:** because this is a local-only app, the data file is not encrypted and all
  accounts live on the same Mac. Anyone with access to the user's Mac account can read the file.
  There is no syncing between computers, email verification or password reset.
