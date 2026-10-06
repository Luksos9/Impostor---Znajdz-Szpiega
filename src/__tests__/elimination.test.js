import { describe, expect, it } from 'vitest'
import { caughtBy, resolveQuickVote, resolveVote, scoreRound, wrongGuessEntry } from '../utils/elimination'

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

  it('wrong guess by the last impostor: every civilian gets +1', () => {
    const r = scoreRound({ players, impostorIds: ['a'], voteLog: [wrongGuessEntry('a', 'KOT')], reason: 'guess-wrong' })
    expect(r.winner).toBe('civilians')
    expect(r.deltas).toEqual({ a: 0, b: 1, c: 1, d: 1, e: 1, f: 1 })
  })

  it('wrong guess knocks out only the guesser; the partner can still win', () => {
    const out = wrongGuessEntry('a', 'KOT')
    expect(caughtBy(out)).toEqual(['a'])
    // b survives the next vote: b scores, a does not.
    const r = scoreRound({ players, impostorIds, voteLog: [out, miss], reason: 'vote-failed' })
    expect(r.hiddenIds).toEqual(['b'])
    expect(r.deltas).toEqual({ a: 0, b: 2, c: 1, d: 1, e: 1, f: 1 })
    expect(r.winner).toBe('mixed')
    // ...or b guesses the word: b gets +3.
    const g = scoreRound({ players, impostorIds, voteLog: [out], reason: 'guess-right' })
    expect(g.deltas).toMatchObject({ a: 0, b: 3 })
  })
})

describe('10 players, 4 impostors', () => {
  const ten = 'abcdefghij'.split('').map((id) => ({ id, name: id }))
  const imps = ['a', 'b', 'c', 'd'] // civilians e..j (6) -> 4 votes needed
  it('needs 4 of 6 civilians and catches one at a time', () => {
    const civVotes = (target, n) => Object.fromEntries('efghij'.split('').map((v, i) => [v, i < n ? target : 'e']))
    expect(resolveVote({ votes: civVotes('a', 3), impostorIds: imps, civilianCount: 6 }).caughtId).toBeNull()
    const r = resolveVote({ votes: civVotes('a', 4), impostorIds: imps, civilianCount: 6 })
    expect(r.caughtId).toBe('a')
    const score = scoreRound({ players: ten, impostorIds: imps, voteLog: [r], reason: 'vote-failed' })
    expect(score.deltas).toMatchObject({ a: 0, b: 2, c: 2, d: 2 })
    expect(score.winner).toBe('mixed')
  })
})

describe('resolveQuickVote', () => {
  // 6 players, a and b impostors, 4 civilians -> 3 needed.
  it('catches both impostors in one pass when the table agrees', () => {
    const votes = { c: ['a', 'b'], d: ['a', 'b'], e: ['b', 'a'], f: ['a', 'd'], a: ['c', 'd'], b: ['c'] }
    const r = resolveQuickVote({ votes, impostorIds, civilianCount: 4 })
    expect(r.caughtIds.sort()).toEqual(['a', 'b'])
    const score = scoreRound({ players, impostorIds, voteLog: [r], reason: 'all-caught' })
    expect(score.winner).toBe('civilians')
    // Same points as two separate votes: +1 per correct pick.
    expect(score.deltas).toEqual({ a: 0, b: 0, c: 2, d: 2, e: 2, f: 1 })
  })

  it('catches only the impostors with a majority; the rest stay hidden', () => {
    const votes = { c: ['a', 'd'], d: ['a', 'e'], e: ['a', 'b'], f: ['b', 'c'] }
    const r = resolveQuickVote({ votes, impostorIds, civilianCount: 4 })
    expect(r.caughtIds).toEqual(['a'])
    expect(caughtBy(r)).toEqual(['a'])
  })

  it('nobody caught ends like a failed vote; a civilian majority is reported', () => {
    const votes = { c: ['d', 'e'], d: ['e', 'c'], e: ['d', 'c'], f: ['d', 'e'] }
    const r = resolveQuickVote({ votes, impostorIds, civilianCount: 4 })
    expect(r.caughtIds).toEqual([])
    expect(r.wrongIds.sort()).toEqual(['d', 'e'])
    expect(r.wrongAccusation).toBe(true)
    const score = scoreRound({ players, impostorIds, voteLog: [r], reason: 'vote-failed' })
    expect(score.winner).toBe('impostors')
  })

  it('ignores impostor votes and duplicate picks', () => {
    const votes = { a: ['b', 'b'], c: ['b', 'b'], d: ['c'], e: ['c'], f: ['d'] }
    const r = resolveQuickVote({ votes, impostorIds, civilianCount: 4 })
    expect(r.counts.b).toBe(1)
    expect(r.caughtIds).toEqual([])
  })
})
