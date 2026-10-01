import { useEffect } from 'react'
import {
  colors,
  fonts,
  fontSizes,
  fontWeights,
  spacing,
  radii,
  tactileShadow,
  colorForRole,
} from '../styles/theme'
import { L } from '../utils/labels'
import Button from './ui/Button'
import Card from './ui/Card'
import AnimatedNumber from './ui/AnimatedNumber'
import { hapticSuccess, hapticHeavy } from '../utils/haptics'
import { playSound } from '../utils/sounds'
import { speak } from '../utils/voice'
import { pointsLine } from '../utils/narration'

// Round result, told as a short story so nobody asks "wait, who won?":
//   1. Banner      – which side won (cywile / impostor), with sound + haptic
//   2. Secret      – the word / question everyone was circling
//   3. Impostors   – who they were
//   4. What happened – plain-language facts
//   5. Votes       – who voted for whom (when there was a vote)
//   6. Points      – this round's deltas, counting up
//
// Props:
//   impostorIds, players, deltas, isLastRound, onNext   (always)
//   winner:   'civilians' | 'impostors'  (derived from the deltas if omitted)
//   headline: one-line verdict (falls back to `narrative`)
//   speech:   what the narrator says (falls back to the headline)
//   secret:   { label, value }
//   facts:    string[]
//   voteRows: [{ voter, target, hit, votesReceived }]
//   narrative: legacy one-liner, still supported by older modes
export default function RoundResult({
  impostorIds,
  players,
  deltas,
  narrative,
  winner,
  headline,
  speech,
  secret,
  facts = [],
  voteRows,
  isLastRound,
  onNext,
}) {
  const impostors = players.filter((p) => impostorIds.includes(p.id))
  const impostorColor = colorForRole('impostor')
  const plural = impostors.length > 1

  // Older modes don't say who won — infer it: impostors win if they scored.
  const impostorPoints = impostors.reduce((sum, p) => sum + (deltas[p.id] || 0), 0)
  const side = winner || (impostorPoints > 0 ? 'impostors' : 'civilians')
  const impostorsWon = side === 'impostors'
  const verdict = headline || narrative
  const bannerColor = impostorsWon ? colors.danger : colors.success
  const bannerShadow = impostorsWon ? colors.dangerShadow : colors.successShadow
  const bannerTitle = impostorsWon
    ? plural ? 'Wygrywają impostorzy' : 'Wygrywa impostor'
    : 'Wygrywają cywile'

  useEffect(() => {
    playSound(impostorsWon ? 'sneaky' : 'correct')
    if (impostorsWon) hapticHeavy()
    else hapticSuccess()
    const closing = isLastRound ? 'To była ostatnia runda.' : ''
    return speak(`${speech || verdict} ${pointsLine(deltas, players)} ${closing}`.trim(), { delay: 900 })
    // Only on mount: the result never changes while it is on screen.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Stagger helper: later sections wait for earlier ones.
  let step = 0
  // Capped so a long story (8 players) never makes the points wait.
  const nextDelay = (extra = 0) => `${Math.min((step++) * 80 + extra, 900)}ms`

  const eyebrow = (text, color = colors.textMuted) => (
    <div
      style={{
        fontSize: fontSizes.eyebrow,
        fontWeight: fontWeights.extraBold,
        textTransform: 'uppercase',
        letterSpacing: '0.14em',
        color,
        marginBottom: spacing.sm,
      }}
    >
      {text}
    </div>
  )

  return (
    <div
      style={{
        flex: 1,
        minHeight: 0,
        background: colors.bg,
        color: colors.textPrimary,
        fontFamily: fonts.sans,
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      <div
        style={{
          flex: 1,
          minHeight: 0,
          overflowY: 'auto',
          paddingTop: spacing.lg,
          paddingLeft: spacing.lg,
          paddingRight: spacing.lg,
          paddingBottom: spacing.md,
        }}
      >
        {/* 1. Who won */}
        <div
          className="anim-bounce"
          style={{
            background: bannerColor,
            color: '#FFFFFF',
            borderRadius: radii.xxl,
            boxShadow: tactileShadow(bannerShadow),
            padding: `${spacing.lg}px ${spacing.lg}px`,
            textAlign: 'center',
            marginBottom: spacing.lg,
            animationDelay: nextDelay(),
          }}
        >
          <div
            style={{
              fontSize: fontSizes.h2,
              fontWeight: fontWeights.black,
              letterSpacing: '-0.02em',
              lineHeight: 1.1,
              marginBottom: verdict ? spacing.sm : 0,
            }}
          >
            {bannerTitle}
          </div>
          {verdict && (
            <div
              style={{
                fontSize: fontSizes.body,
                fontWeight: fontWeights.bold,
                lineHeight: 1.35,
                opacity: 0.95,
              }}
            >
              {verdict}
            </div>
          )}
        </div>

        {/* 2. The secret everyone was circling */}
        {secret && (
          <div
            className="anim-bounce"
            style={{ textAlign: 'center', marginBottom: spacing.lg, animationDelay: nextDelay() }}
          >
            {eyebrow(secret.label)}
            <div
              style={{
                fontSize: fontSizes.h1,
                fontWeight: fontWeights.black,
                letterSpacing: '-0.02em',
                lineHeight: 1.05,
                wordBreak: 'break-word',
              }}
            >
              {secret.value}
            </div>
          </div>
        )}

        {/* 3. Who the impostors were */}
        {eyebrow(plural ? 'Impostorami byli' : L.result.impostorWas, impostorColor)}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: spacing.sm, marginBottom: spacing.lg }}>
          {impostors.map((p) => (
            <div
              key={p.id}
              className="anim-stagger"
              style={{
                animationDelay: nextDelay(),
                border: `3px solid ${impostorColor}`,
                borderRadius: radii.lg,
                background: colors.surface,
                padding: `${spacing.sm}px ${spacing.md}px`,
                fontSize: fontSizes.h3,
                fontWeight: fontWeights.black,
                letterSpacing: '-0.01em',
              }}
            >
              {p.name}
            </div>
          ))}
        </div>

        {/* 4. What happened */}
        {facts.length > 0 && (
          <>
            {eyebrow('Co się stało')}
            <div style={{ display: 'flex', flexDirection: 'column', gap: spacing.xs, marginBottom: spacing.lg }}>
              {facts.map((fact) => (
                <div
                  key={fact}
                  className="anim-stagger"
                  style={{
                    animationDelay: nextDelay(),
                    display: 'flex',
                    gap: spacing.sm,
                    alignItems: 'baseline',
                    fontSize: fontSizes.body,
                    fontWeight: fontWeights.semibold,
                    color: colors.textSecondary,
                    lineHeight: 1.35,
                  }}
                >
                  <span aria-hidden="true" style={{ color: bannerColor, fontWeight: fontWeights.black }}>
                    •
                  </span>
                  <span>{fact}</span>
                </div>
              ))}
            </div>
          </>
        )}

        {/* 5. Who voted for whom */}
        {voteRows && voteRows.length > 0 && (
          <>
            {eyebrow('Kto na kogo głosował')}
            <Card padded="sm" elevation="soft" style={{ marginBottom: spacing.lg }}>
              {voteRows.map((row, idx) => (
                <div
                  key={row.voter}
                  className="anim-stagger"
                  style={{
                    animationDelay: nextDelay(),
                    display: 'flex',
                    alignItems: 'center',
                    gap: spacing.sm,
                    padding: `${spacing.xs}px ${spacing.xs}px`,
                    fontSize: fontSizes.bodySm,
                    fontWeight: fontWeights.bold,
                    borderBottom:
                      idx === voteRows.length - 1 ? 'none' : `1px solid ${colors.border}`,
                  }}
                >
                  <span style={{ minWidth: 0, flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {row.voter}
                  </span>
                  <span aria-hidden="true" style={{ color: colors.textMuted }}>→</span>
                  <span
                    style={{
                      minWidth: 0,
                      flex: 1,
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                      color: row.hit ? colors.success : colors.textPrimary,
                      fontWeight: row.hit ? fontWeights.black : fontWeights.bold,
                    }}
                  >
                    {row.target}
                  </span>
                  <span
                    style={{
                      width: 22,
                      textAlign: 'center',
                      fontWeight: fontWeights.black,
                      color: row.hit ? colors.success : colors.textDim,
                    }}
                    aria-label={row.hit ? 'trafiony głos' : 'pudło'}
                  >
                    {row.hit ? '✓' : '·'}
                  </span>
                </div>
              ))}
            </Card>
          </>
        )}

        {/* 6. Points this round */}
        {eyebrow(L.result.pointsThisRound)}
        <div style={{ display: 'flex', flexDirection: 'column', gap: spacing.sm }}>
          {players.map((p) => {
            const delta = deltas[p.id] || 0
            const isImp = impostorIds.includes(p.id)
            const deltaColor =
              delta > 0 ? colors.success : delta < 0 ? colors.danger : colors.textMuted
            const myDelay = nextDelay()
            return (
              <Card
                key={p.id}
                elevation="soft"
                padded="md"
                accent={isImp ? impostorColor : null}
                className="anim-bounce"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  animationDelay: myDelay,
                }}
              >
                <div
                  style={{
                    fontSize: fontSizes.bodyLg,
                    fontWeight: fontWeights.extraBold,
                    minWidth: 0,
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                  }}
                >
                  {p.name}
                  {isImp && (
                    <span
                      style={{
                        marginLeft: spacing.sm,
                        fontSize: fontSizes.eyebrow,
                        fontWeight: fontWeights.extraBold,
                        letterSpacing: '0.1em',
                        textTransform: 'uppercase',
                        color: impostorColor,
                      }}
                    >
                      impostor
                    </span>
                  )}
                </div>
                <div
                  style={{
                    fontSize: fontSizes.h3,
                    fontWeight: fontWeights.black,
                    color: deltaColor,
                    letterSpacing: '-0.01em',
                    flexShrink: 0,
                  }}
                >
                  <AnimatedNumber
                    value={delta}
                    delay={parseInt(myDelay, 10) + 200}
                    format={(n) => (n > 0 ? `+${n}` : n)}
                  />
                </div>
              </Card>
            )
          })}
        </div>
      </div>

      {/* Pinned CTA — always reachable, however long the story. */}
      <div
        style={{
          position: 'relative',
          flexShrink: 0,
          paddingTop: spacing.md,
          paddingLeft: spacing.lg,
          paddingRight: spacing.lg,
          paddingBottom: spacing.lg + 8,
          background: colors.bg,
          borderTop: `1px solid ${colors.border}`,
        }}
      >
        {/* Soft fade so it's clear there is more to scroll above the button. */}
        <div
          aria-hidden="true"
          style={{
            position: 'absolute',
            left: 0,
            right: 0,
            top: -28,
            height: 28,
            pointerEvents: 'none',
            background: `linear-gradient(to bottom, transparent, ${colors.bg})`,
          }}
        />
        <Button
          variant="primary"
          size="lg"
          accentColor={colors.textPrimary}
          textColor={colors.bg}
          fullWidth
          onClick={onNext}
        >
          {isLastRound ? L.result.finalResults : L.result.next}
        </Button>
      </div>
    </div>
  )
}
