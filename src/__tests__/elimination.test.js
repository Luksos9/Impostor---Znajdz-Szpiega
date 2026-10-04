import { describe, expect, it } from 'vitest'
import { resolveVote, scoreRound } from '../utils/elimination'

// 6 players: a and b are impostors; c, d, e, f are civilians (majority = 3).
const players = ['a', 'b', 'c', 'd', 'e', 'f'].map((id) => ({ id, name: id.toUpperCase() }))
const impostorIds = ['a', 'b']

describe('resolveVote', () => {
  it('exposes ONE impostor when more than half of the civilians name them', () => {
    const r = resolveVote({ votes: { c: 'a', d: 'a', e: 'a', f: 'b', a: 'c', b: 'c' }, impostorIds, civilianCount: 4 })
    expect(r.caughtId).toBe('a')
    expect(r.hitVoterIds.sort()).toEqual(['c', 'd', 'e'])
  })

  it('does NOT catch both when civilians split between two impostors (old behaviour did)', () => {
    const r = resolveVote({ votes: { c: 'a', d: 'a', e: 'b', f: 'b' }, impostorIds, civilianCount: 4 })
    expect(r.caughtId).toBeNull()
    expect(r.tie).toBe(true)
    expect(r.wrongAccusation).toBe(false)
  })

  it('half is not enough', () => {
    const r = resolveVote({ votes: { c: 'a', d: 'a', e: 'c', f: 'd' }, impostorIds, civilianCount: 4 })
    expect(r.caughtId).toBeNull()
  })

  it('flags a majority that lands on a civilian', () => {
    const r = resolveVote({ votes: { c: 'd', d: 'c', e: 'd', f: 'd' }, impostorIds, civilianCount: 4 })
    expect(r.caughtId).toBeNull()
    expect(r.accusedId).toBe('d')
    expect(r.wrongAccusation).toBe(true)
  })

  it('ignores impostor votes', () => {
    const r = resolveVote({ votes: { a: 'c', b: 'c', c: 'b', d: 'b', e: 'b', f: 'a' }, impostorIds, civilianCount: 4 })
    expect(r.caughtId).toBe('b')
  })

  it('cannot expose an impostor who is already caught', () => {
    const r = resolveVote({ votes: { c: 'a', d: 'a', e: 'a', f: 'a' }, impostorIds, caughtIds: ['a'], civilianCount: 4 })
    expect(r.caughtId).toBeNull()
  })

  it('matches the old single-impostor rule', () => {
    const solo = ['a']
    expect(resolveVote({ votes: { b: 'a', c: 'a', d: 'x' }, impostorIds: solo, civilianCount: 3 }).caughtId).toBe('a')
    expect(resolveVote({ votes: { b: 'a', c: 'd', d: 'b' }, impostorIds: solo, civilianCount: 3 }).caughtId).toBeNull()
  })
})

describe('scoreRound', () => {
  const catchA = resolveVote({ votes: { c: 'a', d: 'a', e: 'a', f: 'b' }, impostorIds, civilianCount: 4 })
  const catchB = resolveVote({ votes: { c: 'b', d: 'b', e: 'b', f: 'b' }, impostorIds, caughtIds: ['a'], civilianCount: 4 })
  const miss = resolveVote({ votes: { c: 'd', d: 'e', e: 'f', f: 'c' }, impostorIds, caughtIds: ['a'], civilianCount: 4 })

  it('both caught one by one: civilians win, points per correct vote', () => {
    const r = scoreRound({ players, impostorIds, voteLog: [catchA, catchB], reason: 'all-caught' })
    expect(r.winner).toBe('civilians')
    expect(r.deltas).toEqual({ a: 0, b: 0, c: 2, d: 2, e: 2, f: 1 })
  })

  it('one caught, the other escapes: each impostor scored on their own', () => {
    const r = scoreRound({ players, impostorIds, voteLog: [catchA, miss], reason: 'vote-failed' })
    expect(r.winner).toBe('mixed')
    expect(r.deltas.a).toBe(0) // caught
    expect(r.deltas.b).toBe(2) // escaped
    expect(r.hiddenIds).toEqual(['b'])
  })

  it('nobody caught: impostors win', () => {
    const r = scoreRound({ players, impostorIds, voteLog: [miss], reason: 'vote-failed' })
    expect(r.winner).toBe('impostors')
    expect(r.deltas).toMatchObject({ a: 2, b: 2 })
  })

  it('correct guess: only impostors still in play get +3', () => {
    const r = scoreRound({ players, impostorIds, voteLog: [catchA], reason: 'guess-right' })
    expect(r.deltas).toMatchObject({ a: 0, b: 3, c: 1 })
    expect(r.winner).toBe('mixed')
  })

  it('wrong guess: every civilian gets +1', () => {
    const r = scoreRound({ players, impostorIds, voteLog: [], reason: 'guess-wrong' })
    expect(r.winner).toBe('civilians')
    expect(r.deltas).toEqual({ a: 0, b: 0, c: 1, d: 1, e: 1, f: 1 })
  })
})
