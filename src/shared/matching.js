import { daysBetween } from './validators'
import { MATCH_STRONG, MATCH_POSSIBLE, MATCH_LIMIT } from './constants'

export const STOPWORDS = new Set([
  // Common English
  'the', 'and', 'for', 'with', 'from', 'that', 'this', 'was', 'were', 'are', 'has', 'have', 'had',
  'its', 'into', 'onto', 'near', 'some', 'any', 'all', 'but', 'not', 'very', 'just', 'also', 'our',
  'your', 'their', 'there', 'here', 'they', 'them', 'his', 'her', 'she', 'him', 'who', 'what',
  'when', 'where', 'which', 'while', 'been', 'being', 'can', 'could', 'would', 'should', 'will',
  'about', 'over', 'under', 'inside', 'outside', 'left', 'one', 'two', 'out', 'off', 'then',
  'than', 'too', 'more', 'most', 'like', 'mine',
  // Generic lost-and-found words
  'item', 'items', 'lost', 'found', 'lose', 'losing', 'find', 'finding', 'someone', 'somewhere',
  'thing', 'things', 'please', 'help', 'campus', 'today', 'yesterday', 'small', 'big'
])

export function tokenize(text) {
  return new Set(
    String(text || '')
      .toLowerCase()
      .replace(/[^a-z0-9\s]/g, ' ')
      .split(/\s+/)
      .filter((t) => t.length >= 3 && !STOPWORDS.has(t))
  )
}

export function jaccard(a, b) {
  if (a.size === 0 && b.size === 0) return 0
  let inter = 0
  for (const t of a) if (b.has(t)) inter++
  return inter / (a.size + b.size - inter)
}

// Signed days from the lost date to the found date.
export const dateGap = (lost, found) => daysBetween(lost.date, found.date)

// Candidate filter: opposite type, both open, different owners, same category, date window.
export function isCandidate(report, other) {
  if (report.type === other.type) return false
  if (report.status !== 'open' || other.status !== 'open') return false
  if (report.userId === other.userId) return false
  if (report.category !== other.category) return false
  const [lost, found] = report.type === 'lost' ? [report, other] : [other, report]
  const gap = dateGap(lost, found)
  return gap >= -1 && gap <= 30
}

function datePoints(gap) {
  if (gap <= 1) return 25
  if (gap <= 3) return 20
  if (gap <= 7) return 12
  if (gap <= 14) return 5
  return 0
}

function gapLabel(gap) {
  if (gap === 0) return 'Same day'
  return `${gap} day${gap === 1 ? '' : 's'} apart`
}

export function scoreMatch(lost, found) {
  const reasons = []
  let score = 0

  if (lost.category === found.category) {
    score += 30
    reasons.push('Same category')
  }

  const gap = Math.abs(dateGap(lost, found))
  if (Number.isFinite(gap)) {
    const pts = datePoints(gap)
    score += pts
    if (pts > 0) reasons.push(gapLabel(gap))
  }

  if (lost.location === found.location) {
    score += 20
    reasons.push('Same location')
  } else if (lost.location === 'Other' || found.location === 'Other') {
    score += 8
    reasons.push('Nearby location possible')
  }

  const sim = jaccard(
    tokenize(`${lost.title} ${lost.description}`),
    tokenize(`${found.title} ${found.description}`)
  )
  const textPts = Math.round(Math.min(1, sim * 2) * 25)
  score += textPts
  if (textPts >= 8) reasons.push('Similar description')

  return { score, reasons }
}

export function matchLabel(score) {
  if (score >= MATCH_STRONG) return 'Strong'
  if (score >= MATCH_POSSIBLE) return 'Possible'
  return null
}

// Top matches for a report among all reports, best first.
export function findMatches(report, reports, limit = MATCH_LIMIT) {
  return reports
    .filter((other) => other.id !== report.id && isCandidate(report, other))
    .map((other) => {
      const [lost, found] = report.type === 'lost' ? [report, other] : [other, report]
      const { score, reasons } = scoreMatch(lost, found)
      return { report: other, score, label: matchLabel(score), reasons, gap: Math.abs(dateGap(lost, found)) }
    })
    .filter((m) => m.label)
    .sort((a, b) => b.score - a.score || a.gap - b.gap)
    .slice(0, limit)
    .map(({ gap: _gap, ...m }) => m)
}
