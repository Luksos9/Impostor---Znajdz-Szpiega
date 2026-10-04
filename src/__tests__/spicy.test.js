import { afterEach, describe, expect, it } from 'vitest'
import * as N from '../utils/narration'
import { SPICY, isSpicy } from '../utils/spicy'

// Minimal localStorage so isSpicy() can read the setting in Node.
function setSpicy(on) {
  const store = { 'imposter.settings': JSON.stringify({ spicyMode: on }) }
  globalThis.localStorage = { getItem: (k) => store[k] ?? null, setItem: (k, v) => { store[k] = v } }
}
afterEach(() => { delete globalThis.localStorage })

// JS \b does not understand Polish letters, so match whole words explicitly.
const GENDERED_PAST =
  /(^|[\s,.!?])(był|była|złapany|złapana|zdemaskowany|zdemaskowana|uciekł|uciekła|spierdolił|spierdoliła|trafiony|trafiona|zrobił|zrobiła)(?=[\s,.!?]|$)/i
const PROFANITY = /kurw|szmat|pierd|chuj|jeb|dup|gówn|sra|gnid|spierd|frajer/i

// Every narrator line, many times over.
function sampleAll(times = 60) {
  const players = [{ id: 'a', name: 'Ala' }, { id: 'b', name: 'Bob' }]
  const out = []
  for (let i = 0; i < times; i++) {
    out.push(
      N.passPhoneLine('Ala'), N.speakerLine('Ala'), N.speakerQuip(), N.voteStartLine(),
      N.nudgeLine(0), N.nudgeLine(1), N.nudgeLine(2), N.hideLine(),
      N.roundIntroLine(0, false), N.roundIntroLine(2, false), N.roundIntroLine(4, true), N.turnLine(2),
      N.decisionLine(), N.cardReminderLine(), N.voteEntryLine(), N.guessConfirmLine(), N.guessEntryLine(),
      N.catchLine('Ala', 1), N.gameOverLine(['Ala'], 5), N.gameOverLine(['Ala', 'Bob'], 5),
      N.pointsLine({ a: 2 }, players),
    )
    for (const kind of ['caught', 'escaped', 'partial', 'guessRight', 'guessWrong'])
      for (const plural of [false, true])
        out.push(N.roundHeadline(kind, { impostorNames: ['Ala', 'Bob'], word: 'PIZZA', plural, caughtNames: ['Ala'], escapedNames: ['Bob'] }))
  }
  return out
}

describe('Tryb +18', () => {
  it('is off by default (no setting, or storage missing)', () => {
    expect(isSpicy()).toBe(false)
    setSpicy(false)
    expect(isSpicy()).toBe(false)
  })

  it('OFF: the narrator never swears', () => {
    setSpicy(false)
    const bad = sampleAll().filter((l) => PROFANITY.test(l))
    expect(bad).toEqual([])
  })

  it('ON: swearing shows up, and every line is still well-formed', () => {
    setSpicy(true)
    const lines = sampleAll()
    expect(lines.filter((l) => PROFANITY.test(l)).length).toBeGreaterThan(lines.length / 3)
    for (const l of lines) {
      expect(l).not.toMatch(/[{}]/)
      expect(l).not.toMatch(/undefined/)
    }
  })

  it('ON: named lines still contain the player name', () => {
    setSpicy(true)
    for (let i = 0; i < 60; i++) {
      expect(N.passPhoneLine('Dawid')).toContain('Dawid')
      expect(N.speakerLine('Dawid')).toContain('Dawid')
      expect(N.catchLine('Dawid', 2)).toMatch(/Dawid.*jeszcze dwóch/)
    }
  })

  it('every spicy template only uses placeholders its function fills', () => {
    const allowed = {
      passPhone: ['name'], speaker: ['name'], catch: ['name', 'left'],
      gameOverOne: ['names', 'score'], gameOverTie: ['names', 'score'],
    }
    for (const [key, used] of Object.entries(allowed))
      for (const t of SPICY[key]) for (const m of t.matchAll(/\{(\w+)\}/g)) expect(used, `${key}: ${t}`).toContain(m[1])
    const headlineVars = ['names', 'word', 'win', 'caught', 'escaped', 'escapes', 'falls']
    for (const list of Object.values(SPICY.headline))
      for (const t of list) for (const m of t.matchAll(/\{(\w+)\}/g)) expect(headlineVars).toContain(m[1])
  })

  it('spicy lines avoid gendered past forms too (names are typed)', () => {
    const all = Object.values(SPICY).flat(2).concat(Object.values(SPICY.headline).flat())
    for (const t of all.filter((x) => typeof x === 'string'))
      expect(t, t).not.toMatch(GENDERED_PAST)
  })
})
