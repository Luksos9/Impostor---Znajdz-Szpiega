import { describe, expect, it } from 'vitest'
import { pickContent } from '../utils/content'
import { getContentForMode } from '../data/packs'
import { buildVoteSummary } from '../utils/roundSummary'

describe('content packs', () => {
  it('have unique ids per mode', () => {
    for (const mode of ['classic', 'pairsQuestion', 'kameleon']) {
      const ids = getContentForMode(mode).map((c) => c.id)
      expect(new Set(ids).size, mode).toBe(ids.length)
    }
  })

  it('have no duplicate classic words', () => {
    const words = getContentForMode('classic').map((c) => c.word.toLowerCase())
    expect(words.filter((w, i) => words.indexOf(w) !== i)).toEqual([])
  })

  it('give every Kameleon grid a unique topic and 16 distinct words', () => {
    const grids = getContentForMode('kameleon')
    expect(new Set(grids.map((g) => g.topic)).size).toBe(grids.length)
    for (const g of grids) {
      expect(g.words, g.topic).toHaveLength(16)
      expect(new Set(g.words.map((w) => w.toLowerCase())).size, g.topic).toBe(16)
    }
  })

  it('give every question pair two different, non-empty questions', () => {
    for (const q of getContentForMode('pairsQuestion')) {
      expect(q.common.length).toBeGreaterThan(5)
      expect(q.impostor).not.toBe(q.common)
    }
  })

  it('never repeats a word within a game while fresh ones remain', () => {
    const all = getContentForMode('classic').length
    const used = []
    for (let i = 0; i < 40; i++) {
      const { item } = pickContent('classic', used)
      expect(used).not.toContain(item.id)
      used.push(item.id)
    }
    expect(used.length).toBeLessThan(all)
  })

  it('falls back to the full pool instead of crashing when exhausted', () => {
    const everything = getContentForMode('kameleon').map((c) => c.id)
    const { item, poolExhausted } = pickContent('kameleon', everything)
    expect(item).toBeTruthy()
    expect(poolExhausted).toBe(true)
  })
})

describe('buildVoteSummary', () => {
  const players = ['a', 'b', 'c', 'd'].map((id) => ({ id, name: id.toUpperCase() }))

  it('scores a catch: +1 for each civilian who hit', () => {
    const r = buildVoteSummary({ players, votes: { b: 'a', c: 'a', d: 'b', a: 'b' }, impostorIds: ['a'] })
    expect(r.caught).toBe(true)
    expect(r.deltas).toEqual({ a: 0, b: 1, c: 1, d: 0 })
    expect(r.facts.join(' ')).toMatch(/2 z 3 cywili/)
  })

  it('scores an escape: +2 for the impostor, and reports ties', () => {
    const r = buildVoteSummary({ players, votes: { b: 'a', c: 'd', d: 'b' }, impostorIds: ['a'] })
    expect(r.caught).toBe(false)
    expect(r.deltas.a).toBe(2)
    expect(r.facts.join(' ')).toMatch(/po równo/)
  })

  it('uses Kameleon wording when asked', () => {
    const r = buildVoteSummary({ players, votes: { b: 'a', c: 'a', d: 'a' }, impostorIds: ['a'], role: 'kameleon' })
    expect(r.facts[0]).toMatch(/^Kameleona/)
  })
})
