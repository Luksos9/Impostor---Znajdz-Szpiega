import { describe, expect, it } from 'vitest'
import {
  awardCivilians,
  compareWordGuess,
  impostorCaughtByMajority,
  normalizePolishForCompare,
  tallyCivilianVotes,
  votesNeededToCatch,
} from '../utils/scoring'

describe('compareWordGuess', () => {
  it('ignores case, spacing and Polish diacritics', () => {
    expect(compareWordGuess('  pizza ', 'PIZZA')).toBe(true)
    expect(compareWordGuess('zolw', 'ŻÓŁW')).toBe(true)
  })

  it('treats ł as l (NFD alone does not decompose it)', () => {
    expect(normalizePolishForCompare('ŁADOWARKA')).toBe('ladowarka')
    expect(compareWordGuess('ladowarka', 'ŁADOWARKA')).toBe(true)
    expect(compareWordGuess('glosnik', 'GŁOŚNIK')).toBe(true)
  })

  it('accepts one whole word of a multi-word secret, but not tiny filler words', () => {
    expect(compareWordGuess('ogorek', 'OGÓREK KISZONY')).toBe(true)
    expect(compareWordGuess('kiszony', 'OGÓREK KISZONY')).toBe(true)
    expect(compareWordGuess('z', 'NALEŚNIKI Z NUTELLĄ')).toBe(false)
  })

  it('tolerates a single typo on words of 5+ letters only', () => {
    expect(compareWordGuess('pizzaa', 'PIZZA')).toBe(true)
    expect(compareWordGuess('pierogy', 'PIEROGI')).toBe(true)
    expect(compareWordGuess('piza', 'PIZZA')).toBe(false) // 4 letters: stay strict
    expect(compareWordGuess('kot', 'KOT')).toBe(true)
    expect(compareWordGuess('koty', 'KOT')).toBe(false)
  })

  it('rejects wrong, empty and non-string guesses', () => {
    expect(compareWordGuess('zupełnie coś innego', 'KOD BLIK')).toBe(false)
    expect(compareWordGuess('', 'PIZZA')).toBe(false)
    expect(compareWordGuess(null, 'PIZZA')).toBe(false)
  })
})

describe('impostorCaughtByMajority', () => {
  it('needs strictly more than half of the civilians', () => {
    // 4 civilians (b,c,d,e), impostor a: 2 hits is NOT enough, 3 is.
    expect(impostorCaughtByMajority({ b: 'a', c: 'a', d: 'x', e: 'x' }, ['a'])).toBe(false)
    expect(impostorCaughtByMajority({ b: 'a', c: 'a', d: 'a', e: 'x' }, ['a'])).toBe(true)
  })

  it('with 3 players both civilians must hit', () => {
    expect(impostorCaughtByMajority({ b: 'a', c: 'b' }, ['a'])).toBe(false)
    expect(impostorCaughtByMajority({ b: 'a', c: 'a' }, ['a'])).toBe(true)
  })

  it('ignores the impostor\'s own vote', () => {
    expect(impostorCaughtByMajority({ a: 'b', b: 'a', c: 'a' }, ['a'])).toBe(true)
  })

  it('counts a vote for any of several impostors as a hit', () => {
    expect(impostorCaughtByMajority({ c: 'a', d: 'b', e: 'a' }, ['a', 'b'])).toBe(true)
  })
})

describe('votesNeededToCatch', () => {
  it('is floor(n/2)+1', () => {
    expect([2, 3, 4, 5, 6].map(votesNeededToCatch)).toEqual([2, 2, 3, 3, 4])
  })
})

describe('tallyCivilianVotes', () => {
  it('ignores impostor votes (they used to decide "most votes")', () => {
    const r = tallyCivilianVotes({ b: 'a', c: 'b', a: 'c' }, ['a'])
    expect(r.counts).toEqual({ a: 1, b: 1 })
    expect(r.tie).toBe(true)
    expect(r.accused).toBeNull()
  })

  it('names the accused when there is a clear leader', () => {
    const r = tallyCivilianVotes({ b: 'a', c: 'a', d: 'b' }, ['x'])
    expect(r).toMatchObject({ accused: 'a', topCount: 2, tie: false })
  })

  it('handles no votes', () => {
    expect(tallyCivilianVotes({}, ['a'])).toMatchObject({ accused: null, topCount: 0, tie: false })
  })
})

describe('awardCivilians', () => {
  it('gives points to everyone except impostors, without mutating', () => {
    const start = Object.freeze({ a: 0 })
    const next = awardCivilians(start, ['a', 'b', 'c'], ['b'], 1)
    expect(next).toEqual({ a: 1, c: 1 })
    expect(start).toEqual({ a: 0 })
  })
})
