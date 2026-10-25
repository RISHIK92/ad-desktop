import { randomUUID } from 'crypto'
import bcrypt from 'bcryptjs'
import { BCRYPT_COST } from '../shared/constants'

const DEMO_PASSWORD = 'Demo1234'

function daysAgo(n) {
  const d = new Date()
  d.setDate(d.getDate() - n)
  return d
}

const ymd = (d) => {
  const pad = (x) => String(x).padStart(2, '0')
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`
}

export function seed(db) {
  const hash = bcrypt.hashSync(DEMO_PASSWORD, BCRYPT_COST)
  const user = (name, email, ago) => ({
    id: randomUUID(),
    name,
    email,
    passwordHash: hash,
    createdAt: daysAgo(ago).toISOString()
  })
  const aarav = user('Aarav Demo', 'aarav@campusfind.demo', 40)
  const priya = user('Priya Demo', 'priya@campusfind.demo', 38)
  const rahul = user('Rahul Demo', 'rahul@campusfind.demo', 35)
  db.users.push(aarav, priya, rahul)

  const report = (owner, ago, fields) => {
    const ts = daysAgo(ago).toISOString()
    return {
      id: randomUUID(),
      status: 'open',
      locationDetail: '',
      ...fields,
      date: ymd(daysAgo(ago)),
      userId: owner.id,
      createdAt: ts,
      updatedAt: ts
    }
  }

  // Match pair 1: wallet in the Cafeteria
  const lostWallet = report(aarav, 3, {
    type: 'lost',
    title: 'Black wallet',
    category: 'Wallet/Purse',
    description: 'Black leather wallet with my college ID, a metro card and some cash inside.',
    location: 'Cafeteria',
    locationDetail: 'Near the juice counter'
  })
  const foundWallet = report(priya, 2, {
    type: 'found',
    title: 'Black leather wallet',
    category: 'Wallet/Purse',
    description: 'Found a black leather wallet with cards inside, left on a table.',
    location: 'Cafeteria',
    locationDetail: 'Table by the window',
    privateNote: 'Has a small blue sticker on the inside flap'
  })

  // Match pair 2: ID card in the Library
  const lostId = report(priya, 5, {
    type: 'lost',
    title: 'Student ID card',
    category: 'ID Card',
    description: 'College student ID card on a red lanyard. Name: Priya.',
    location: 'Library',
    locationDetail: 'Reading hall, 1st floor'
  })
  const foundId = report(rahul, 5, {
    type: 'found',
    title: 'ID card on red lanyard',
    category: 'ID Card',
    description: 'Student ID card attached to a red lanyard, found under a desk.',
    location: 'Library',
    locationDetail: '1st floor reading hall',
    privateNote: 'Lanyard has a keychain shaped like a star'
  })

  // Match pair 3: earphones in Computer Labs
  const lostEarphones = report(rahul, 4, {
    type: 'lost',
    title: 'White earphones',
    category: 'Earphones/Headphones',
    description: 'White wireless earbuds in a white charging case, slightly scratched.',
    location: 'Computer Labs',
    locationDetail: 'Lab 3, back row'
  })
  const foundEarbuds = report(aarav, 3, {
    type: 'found',
    title: 'Wireless earbuds',
    category: 'Earphones/Headphones',
    description: 'White wireless earbuds with charging case left near a computer.',
    location: 'Computer Labs',
    locationDetail: 'Lab 3',
    privateNote: 'Case has initials scratched on the back'
  })

  // Unmatched reports
  const unmatched = [
    report(aarav, 10, {
      type: 'lost',
      title: 'Hostel room keys',
      category: 'Keys',
      description: 'Two keys on a silver ring with a small football keychain.',
      location: 'Hostel'
    }),
    report(priya, 6, {
      type: 'found',
      title: 'Steel water bottle',
      category: 'Water Bottle',
      description: 'Green steel water bottle with stickers, left on a bench.',
      location: 'Gym',
      privateNote: 'Sticker of a mountain near the bottom'
    }),
    report(priya, 8, {
      type: 'lost',
      title: 'Scientific calculator',
      category: 'Electronics',
      description: 'Casio fx-991 scientific calculator with name written on the back.',
      location: 'Science Labs',
      locationDetail: 'Chemistry lab'
    }),
    report(rahul, 2, {
      type: 'found',
      title: 'Navy blue hoodie',
      category: 'Clothing & Accessories',
      description: 'Navy blue zip-up hoodie, size M, left on a seat after an event.',
      location: 'Auditorium'
    }),
    report(rahul, 12, {
      type: 'lost',
      title: 'Data structures notebook',
      category: 'Books & Notes',
      description: 'Spiral notebook with handwritten data structures notes, blue cover.',
      location: 'Main Academic Block',
      locationDetail: 'Room 204'
    })
  ]

  // Already-resolved pair
  const lostBag = report(aarav, 20, {
    type: 'lost',
    title: 'Grey backpack',
    category: 'Bags',
    description: 'Grey backpack with laptop sleeve and a water bottle pocket.',
    location: 'Bus Stop',
    status: 'resolved'
  })
  const foundBag = report(rahul, 19, {
    type: 'found',
    title: 'Grey backpack at bus stop',
    category: 'Bags',
    description: 'Grey backpack left on the bench at the campus bus stop.',
    location: 'Bus Stop',
    status: 'resolved'
  })
  lostBag.resolvedWithReportId = foundBag.id
  foundBag.resolvedWithReportId = lostBag.id
  lostBag.updatedAt = foundBag.updatedAt = daysAgo(17).toISOString()

  db.reports.push(
    lostWallet,
    foundWallet,
    lostId,
    foundId,
    lostEarphones,
    foundEarbuds,
    ...unmatched,
    lostBag,
    foundBag
  )

  const message = (from, to, body, minutesAgo, read) => ({
    id: randomUUID(),
    reportId: foundWallet.id,
    fromUserId: from.id,
    toUserId: to.id,
    body,
    read,
    createdAt: new Date(Date.now() - minutesAgo * 60000).toISOString()
  })
  db.messages.push(
    message(aarav, priya, 'Hi Priya, I think this might be my wallet. I lost it near the juice counter.', 300, true),
    message(priya, aarav, 'Hi! Can you describe anything distinctive on the inside?', 240, true),
    message(aarav, priya, 'There is a small blue sticker on the inside flap.', 200, true),
    message(priya, aarav, "That matches! I'm at the library till 5pm, can we meet at the entrance?", 120, false)
  )
}
