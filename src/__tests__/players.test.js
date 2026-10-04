import { describe, expect, it } from 'vitest'
import {
  emptyRoster,
  finalizeRoster,
  makeSpeakerOrder,
  maxImpostors,
  pickImpostors,
  renamePlayer,
  resizeRoster,
  validateRoster,
} from '../utils/players'

const make = (n) => Array.from({ length: n }, (_, i) => ({ id: `p-${i + 1}`, name: `N${i + 1}` }))

describe('maxImpostors', () => {
  it('keeps a civilian majority: 3-4 -> 1, 5-6 -> 2, 7-8 -> 3, 9-10 -> 4', () => {
    expect([3, 4, 5, 6, 7, 8, 9, 10].map(maxImpostors)).toEqual([1, 1, 2, 2, 3, 3, 4, 4])
  })
})

describe('pickImpostors', () => {
  it('returns distinct players and clamps to what the lobby allows', () => {
    const picks = pickImpostors(make(6), 9)
    expect(picks).toHaveLength(2)
    expect(new Set(picks).size).toBe(2)
  })
  it('always picks at least one', () => {
    expect(pickImpostors(make(3), 0)).toHaveLength(1)
  })
})

describe('makeSpeakerOrder', () => {
  it('contains every player exactly once', () => {
    const players = make(7)
    const order = makeSpeakerOrder(players, pickImpostors(players, 2))
    expect([...order].sort()).toEqual(players.map((p) => p.id).sort())
  })

  it('puts an impostor first only rarely (~5%)', () => {
    const players = make(6)
    const N = 20000
    let first = 0
    for (let i = 0; i < N; i++) {
      const imp = pickImpostors(players, 2)
      if (imp.includes(makeSpeakerOrder(players, imp)[0])) first++
    }
    const rate = first / N
    expect(rate).toBeGreaterThan(0.03)
    expect(rate).toBeLessThan(0.07)
  })

  it('honours the chance parameter at the extremes', () => {
    const players = make(5)
    const imp = ['p-2']
    expect(makeSpeakerOrder(players, imp, 1)[0]).toBe('p-2')
    for (let i = 0; i < 50; i++) expect(makeSpeakerOrder(players, imp, 0)[0]).not.toBe('p-2')
  })
})

describe('roster helpers', () => {
  it('starts empty unless names were saved', () => {
    expect(emptyRoster(4).map((p) => p.name)).toEqual(['', '', '', ''])
    expect(emptyRoster(3, ['Ala', 'Bob']).map((p) => p.name)).toEqual(['Ala', 'Bob', ''])
  })

  it('resizes while keeping typed names', () => {
    const r = renamePlayer(emptyRoster(3), 'p-1', 'Ala')
    expect(resizeRoster(r, 5).map((p) => p.name)).toEqual(['Ala', '', '', '', ''])
    expect(resizeRoster(resizeRoster(r, 5), 3)).toHaveLength(3)
  })

  it('renamePlayer strips emoji and leading spaces, caps length, allows clearing', () => {
    let r = emptyRoster(3)
    r = renamePlayer(r, 'p-1', '  Ola 😀')
    expect(r[0].name).toBe('Ola ')
    r = renamePlayer(r, 'p-1', 'x'.repeat(40))
    expect(r[0].name).toHaveLength(14)
    r = renamePlayer(r, 'p-1', '')
    expect(r[0].name).toBe('')
    expect(finalizeRoster([{ id: 'a', name: ' Ala ' }])[0].name).toBe('Ala')
  })
})

describe('validateRoster', () => {
  const named = (names) => names.map((name, i) => ({ id: `p-${i}`, name }))
  it('requires every name', () => {
    expect(validateRoster(named(['A', 'B', ''])).error).toMatch(/imiona/i)
  })
  it('rejects duplicates case-insensitively', () => {
    expect(validateRoster(named(['Ala', 'ala', 'Bob'])).error).toMatch(/różne/)
  })
  it('enforces 3-10 players', () => {
    expect(validateRoster(named(['A', 'B'])).ok).toBe(false)
    expect(validateRoster(named(Array.from({ length: 10 }, (_, i) => `P${i}`))).ok).toBe(true)
    expect(validateRoster(named(Array.from({ length: 11 }, (_, i) => `P${i}`))).ok).toBe(false)
    expect(validateRoster(named(['A', 'B', 'C'])).ok).toBe(true)
  })
})
