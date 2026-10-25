import { describe, it, expect } from 'vitest'
import {
  validateRegister,
  validateLogin,
  validateReport,
  validateMessage,
  validateStatus,
  MESSAGES
} from '../src/shared/validators'

const NOW = new Date(2026, 9, 25)

const goodRegister = {
  name: 'Test User',
  email: 'test@college.edu',
  password: 'abc12345',
  confirmPassword: 'abc12345'
}

const goodReport = {
  type: 'found',
  title: 'Black wallet',
  category: 'Wallet/Purse',
  description: 'Black leather wallet with cards',
  date: '2026-10-24',
  location: 'Cafeteria',
  locationDetail: 'Near the window',
  privateNote: 'Blue sticker inside'
}

describe('validateRegister', () => {
  it('accepts valid input and normalizes email', () => {
    const r = validateRegister({ ...goodRegister, email: '  Test@College.EDU ', name: ' Test User ' })
    expect(r.valid).toBe(true)
    expect(r.value.email).toBe('test@college.edu')
    expect(r.value.name).toBe('Test User')
  })

  it('rejects names outside 2–50 chars', () => {
    expect(validateRegister({ ...goodRegister, name: 'A' }).errors.name).toBe(MESSAGES.name)
    expect(validateRegister({ ...goodRegister, name: 'x'.repeat(51) }).errors.name).toBe(MESSAGES.name)
    expect(validateRegister({ ...goodRegister, name: '   ' }).errors.name).toBe(MESSAGES.name)
  })

  it('rejects invalid emails', () => {
    for (const email of ['', 'plain', 'a@b', 'a@b.c', 'a b@c.com', `${'x'.repeat(95)}@c.com`]) {
      expect(validateRegister({ ...goodRegister, email }).errors.email).toBe(MESSAGES.email)
    }
  })

  it('enforces password rules', () => {
    for (const password of ['abc1234', 'abcdefgh', '12345678', 'a1'.repeat(33)]) {
      const r = validateRegister({ ...goodRegister, password, confirmPassword: password })
      expect(r.errors.password).toBe(MESSAGES.password)
    }
  })

  it('requires matching confirmation', () => {
    expect(validateRegister({ ...goodRegister, confirmPassword: 'abc12346' }).errors.confirmPassword).toBe(
      MESSAGES.confirmPassword
    )
  })
})

describe('validateLogin', () => {
  it('requires email and password', () => {
    expect(validateLogin({}).errors).toEqual({
      email: MESSAGES.loginEmail,
      password: MESSAGES.loginPassword
    })
    expect(validateLogin({ email: 'a@b.com', password: 'x' }).valid).toBe(true)
  })
})

describe('validateReport', () => {
  const check = (patch) => validateReport({ ...goodReport, ...patch }, { now: NOW })

  it('accepts a valid report', () => {
    expect(check({}).valid).toBe(true)
  })

  it('drops unknown fields', () => {
    const r = check({ userId: 'evil', status: 'resolved' })
    expect(r.value).not.toHaveProperty('userId')
    expect(r.value).not.toHaveProperty('status')
  })

  it('trims strings', () => {
    expect(check({ title: '  Wallet  ' }).value.title).toBe('Wallet')
  })

  it('validates each field', () => {
    expect(check({ type: 'stolen' }).errors.type).toBe(MESSAGES.type)
    expect(check({ title: 'x' }).errors.title).toBe(MESSAGES.title)
    expect(check({ title: 'x'.repeat(81) }).errors.title).toBe(MESSAGES.title)
    expect(check({ category: 'Pets' }).errors.category).toBe(MESSAGES.category)
    expect(check({ description: 'too short' }).errors.description).toBe(MESSAGES.description)
    expect(check({ description: 'x'.repeat(501) }).errors.description).toBe(MESSAGES.description)
    expect(check({ location: 'Moon' }).errors.location).toBe(MESSAGES.location)
    expect(check({ locationDetail: 'x'.repeat(101) }).errors.locationDetail).toBe(MESSAGES.locationDetail)
    expect(check({ privateNote: 'x'.repeat(201) }).errors.privateNote).toBe(MESSAGES.privateNote)
  })

  it('validates dates', () => {
    expect(check({ date: '2026-02-30' }).errors.date).toBe(MESSAGES.date)
    expect(check({ date: '24-10-2026' }).errors.date).toBe(MESSAGES.date)
    expect(check({ date: '2026-10-26' }).errors.date).toBe(MESSAGES.dateFuture)
    expect(check({ date: '2025-10-24' }).errors.date).toBe(MESSAGES.dateOld)
    expect(check({ date: '2026-10-25' }).valid).toBe(true)
  })

  it('only allows privateNote on found reports', () => {
    expect(check({ type: 'lost' }).errors.privateNote).toBe(MESSAGES.privateNoteLost)
    expect(check({ type: 'lost', privateNote: '' }).valid).toBe(true)
  })
})

describe('validateMessage and validateStatus', () => {
  it('requires a non-empty body up to 1000 chars', () => {
    expect(validateMessage({ body: '   ' }).errors.body).toBe(MESSAGES.body)
    expect(validateMessage({ body: 'x'.repeat(1001) }).errors.body).toBe(MESSAGES.body)
    expect(validateMessage({ body: ' hi ' }).value.body).toBe('hi')
  })

  it('accepts only open or resolved', () => {
    expect(validateStatus('open')).toBeNull()
    expect(validateStatus('resolved')).toBeNull()
    expect(validateStatus('closed')).toBe(MESSAGES.status)
  })
})
