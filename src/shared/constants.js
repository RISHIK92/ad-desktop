export const CATEGORIES = [
  'ID Card',
  'Wallet/Purse',
  'Keys',
  'Books & Notes',
  'Electronics',
  'Earphones/Headphones',
  'Bags',
  'Clothing & Accessories',
  'Water Bottle',
  'Other'
]

// Edit this list to match the actual campus.
export const LOCATIONS = [
  'Library',
  'Cafeteria',
  'Main Academic Block',
  'Computer Labs',
  'Science Labs',
  'Auditorium',
  'Sports Ground',
  'Gym',
  'Hostel',
  'Parking Area',
  'Bus Stop',
  'Other'
]

export const REPORT_TYPES = ['lost', 'found']
export const STATUSES = ['open', 'resolved']

// Set to e.g. 'college.edu' to restrict registration to one domain.
export const ALLOWED_EMAIL_DOMAIN = null

export const LIMITS = {
  nameMin: 2,
  nameMax: 50,
  emailMax: 100,
  passwordMin: 8,
  passwordMax: 64,
  titleMin: 2,
  titleMax: 80,
  descriptionMin: 10,
  descriptionMax: 500,
  locationDetailMax: 100,
  privateNoteMax: 200,
  messageMax: 1000,
  maxReportAgeDays: 365
}

export const SESSION_DAYS = 7
export const BCRYPT_COST = 10

export const MATCH_STRONG = 75
export const MATCH_POSSIBLE = 50
export const MATCH_LIMIT = 5
