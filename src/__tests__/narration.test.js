import { describe, expect, it } from 'vitest'
import {
  catchLine,
  gameOverLine,
  joinNames,
  partnersLine,
  passPhoneLine,
  pointsLine,
  pointsWord,
  roundHeadline,
} from '../utils/narration'

describe('pointsWord (Polish plural)', () => {
  it('handles 1, 2-4, 5+, teens and 22', () => {
    const w = (n) => `${n} ${pointsWord(n)}`
    expect([0, 1, 2, 4, 5, 11, 12, 14, 22, 25].map(w)).toEqual([
      '0 punktów', '1 punkt', '2 punkty', '4 punkty', '5 punktów',
      '11 punktów', '12 punktów', '14 punktów', '22 punkty', '25 punktów',
    ])
  })
})

describe('joinNames', () => {
  it('joins the Polish way', () => {
    expect(joinNames([])).toBe('')
    expect(joinNames(['Ala'])).toBe('Ala')
    expect(joinNames(['Ala', 'Bob'])).toBe('Ala i Bob')
    expect(joinNames(['Ala', 'Bob', 'Cy'])).toBe('Ala, Bob i Cy')
  })
})

describe('narration copy', () => {
  it('always mentions the player and never leaves a placeholder', () => {
    for (let i = 0; i < 60; i++) {
      const line = passPhoneLine('Dawid')
      expect(line).toContain('Dawid')
      expect(line).not.toMatch(/[{}]/)
    }
  })

  it('round headlines never leak a placeholder, in any variant', () => {
    for (const kind of ['caught', 'escaped', 'guessRight', 'guessWrong']) {
      for (const role of ['impostor', 'kameleon']) {
        for (const plural of [false, true]) {
          for (let i = 0; i < 30; i++) {
            const line = roundHeadline(kind, { impostorNames: ['Ala', 'Bob'], word: 'PIZZA', plural, role })
            expect(line).not.toMatch(/[{}]/)
            if (role === 'kameleon') expect(line).not.toMatch(/impostor/i)
          }
        }
      }
    }
  })

  it('game-over line names winners and the right plural', () => {
    expect(gameOverLine(['Ala'], 1)).toContain('1 punkt')
    expect(gameOverLine(['Ala', 'Bob'], 5, ['Cy'], 2)).toMatch(/Ala i Bob.*Drugie miejsce: Cy, 2 punkty/)
  })

  it('pointsLine reports the round top scorer(s)', () => {
    const players = [{ id: 'a', name: 'Ala' }, { id: 'b', name: 'Bob' }]
    expect(pointsLine({ a: 2, b: 0 }, players)).toContain('Ala')
    expect(pointsLine({ a: 1, b: 1 }, players)).toContain('Ala i Bob')
    expect(pointsLine({ a: 0, b: 0 }, players)).toMatch(/nikt/)
  })
})

describe('multi-impostor lines', () => {
  it('partnersLine names the other impostor(s)', () => {
    expect(partnersLine([])).toBe('')
    expect(partnersLine(['Ala'])).toBe('Drugi impostor: Ala')
    expect(partnersLine(['Ala', 'Bob'])).toBe('Pozostali impostorzy: Ala i Bob')
  })

  it('catchLine names the caught player and how many remain', () => {
    for (let i = 0; i < 30; i++) {
      expect(catchLine('Ewa', 1)).toMatch(/Ewa.*jeszcze jeden/)
      expect(catchLine('Ewa', 2)).toMatch(/jeszcze dwóch/)
      expect(catchLine('Ewa', 3)).toMatch(/jeszcze trzech/)
    }
  })

  it('partial headline agrees in number and never leaks placeholders', () => {
    for (let i = 0; i < 40; i++) {
      const one = roundHeadline('partial', { caughtNames: ['Ala'], escapedNames: ['Bob'] })
      const two = roundHeadline('partial', { caughtNames: ['Ala', 'Cy'], escapedNames: ['Bob'] })
      for (const line of [one, two]) expect(line).not.toMatch(/[{}]/)
      expect(one).not.toMatch(/wpadają|wychodzą/)
      if (/wpada/.test(two)) expect(two).toMatch(/wpadają/)
    }
  })

  it('new lines avoid gendered past forms (names are typed by players)', () => {
    for (let i = 0; i < 40; i++) {
      const lines = [catchLine('X', 1), roundHeadline('partial', { caughtNames: ['X'], escapedNames: ['Y'] })]
      for (const l of lines) expect(l).not.toMatch(/\b(złapany|zdemaskowany|trafiony|uciekł)\b/i)
    }
  })
})
