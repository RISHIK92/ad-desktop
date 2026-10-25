import { describe, it, expect } from 'vitest'
import { scoreMatch, tokenize, isCandidate, findMatches, matchLabel } from '../src/shared/matching'

const base = {
  status: 'open',
  category: 'Wallet/Purse',
  location: 'Cafeteria'
}
const lost = {
  ...base,
  id: 'l1',
  type: 'lost',
  userId: 'u1',
  title: 'Black wallet',
  description: 'Black leather wallet with student ID and metro card',
  date: '2026-10-20'
}
const found = {
  ...base,
  id: 'f1',
  type: 'found',
  userId: 'u2',
  title: 'Black leather wallet',
  description: 'Found black leather wallet with student ID inside',
  date: '2026-10-21'
}

describe('tokenize', () => {
  it('lowercases, strips punctuation and drops stopwords and short tokens', () => {
    expect([...tokenize('Lost: the BLACK wallet, found it near a bench!')]).toEqual([
      'black',
      'wallet',
      'bench'
    ])
  })
})

describe('scoreMatch', () => {
  it('scores a near-identical pair as a strong match', () => {
    const { score, reasons } = scoreMatch(lost, found)
    expect(score).toBeGreaterThanOrEqual(75)
    expect(matchLabel(score)).toBe('Strong')
    expect(reasons).toEqual(['Same category', '1 day apart', 'Same location', 'Similar description'])
  })

  it('scores an identical pair at 100', () => {
    expect(scoreMatch(lost, { ...lost, type: 'found' }).score).toBe(100)
  })

  it('gives partial location credit for Other', () => {
    const a = scoreMatch(lost, { ...found, location: 'Library' }).score
    const b = scoreMatch(lost, { ...found, location: 'Other' }).score
    expect(b - a).toBe(8)
  })

  it('reduces date points as the gap grows', () => {
    const at = (date) => scoreMatch(lost, { ...found, date }).score
    expect(at('2026-10-21')).toBeGreaterThan(at('2026-10-23'))
    expect(at('2026-10-23')).toBeGreaterThan(at('2026-10-27'))
    expect(at('2026-10-27')).toBeGreaterThan(at('2026-11-03'))
    expect(at('2026-11-03')).toBeGreaterThan(at('2026-11-15'))
  })

  it('ignores stopwords in text similarity', () => {
    const plain = { ...found, title: 'Wallet', description: 'black leather wallet' }
    const padded = {
      ...found,
      title: 'Wallet',
      description: 'the found item black leather wallet that was lost here'
    }
    const l = { ...lost, title: 'Wallet', description: 'black leather wallet' }
    expect(scoreMatch(l, padded).score).toBe(scoreMatch(l, plain).score)
  })
})

describe('isCandidate / findMatches', () => {
  it('excludes a different category', () => {
    expect(isCandidate(lost, { ...found, category: 'Keys' })).toBe(false)
  })

  it('excludes dates outside the window', () => {
    expect(isCandidate(lost, { ...found, date: '2026-10-18' })).toBe(false) // 2 days before
    expect(isCandidate(lost, { ...found, date: '2026-10-19' })).toBe(true) // 1 day before
    expect(isCandidate(lost, { ...found, date: '2026-11-19' })).toBe(true) // 30 days after
    expect(isCandidate(lost, { ...found, date: '2026-11-20' })).toBe(false) // 31 days after
  })

  it('excludes same type, same owner and resolved reports', () => {
    expect(isCandidate(lost, { ...found, type: 'lost' })).toBe(false)
    expect(isCandidate(lost, { ...found, userId: 'u1' })).toBe(false)
    expect(isCandidate(lost, { ...found, status: 'resolved' })).toBe(false)
  })

  it('returns at most five matches above the threshold, best first', () => {
    const others = Array.from({ length: 8 }, (_, i) => ({
      ...found,
      id: `f${i}`,
      date: `2026-10-${String(21 + i).padStart(2, '0')}`
    }))
    const weak = { ...found, id: 'weak', location: 'Gym', title: 'Purse', description: 'Pink purse with zip', date: '2026-11-10' }
    const res = findMatches(lost, [lost, ...others, weak])
    expect(res).toHaveLength(5)
    expect(res.map((m) => m.report.id)).toEqual(['f0', 'f1', 'f2', 'f3', 'f4'])
    expect(res.some((m) => m.report.id === 'weak')).toBe(false)
  })
})
