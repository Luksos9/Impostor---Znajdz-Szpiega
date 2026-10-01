import { Component } from 'react'
import { colors, fonts, fontSizes, fontWeights, spacing, radii } from '../styles/theme'

// Catches render errors so a bug shows a way out instead of a blank page.
//   onReset  – called by the buttons (e.g. back to menu / retry the round)
//   title    – optional heading override
// Uses plain <button>s on purpose: this must work even if the design system broke.
export default class ErrorBoundary extends Component {
  state = { error: null }

  static getDerivedStateFromError(error) {
    return { error }
  }

  componentDidCatch(error, info) {
    console.error('[ErrorBoundary]', error, info?.componentStack)
  }

  reset = (action) => {
    this.setState({ error: null })
    this.props.onReset?.(action)
  }

  render() {
    if (!this.state.error) return this.props.children
    const btn = {
      fontFamily: fonts.sans,
      fontSize: fontSizes.bodyLg,
      fontWeight: fontWeights.extraBold,
      minHeight: 52,
      padding: `0 ${spacing.lg}px`,
      borderRadius: radii.lg,
      cursor: 'pointer',
      width: '100%',
    }
    return (
      <div
        role="alert"
        style={{
          minHeight: '100dvh',
          background: colors.bg,
          color: colors.textPrimary,
          fontFamily: fonts.sans,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          textAlign: 'center',
          gap: spacing.md,
          padding: spacing.lg,
        }}
      >
        <h1 style={{ margin: 0, fontSize: fontSizes.h2, fontWeight: fontWeights.black }}>
          {this.props.title || 'Coś poszło nie tak'}
        </h1>
        <p style={{ margin: 0, color: colors.textSecondary, fontWeight: fontWeights.semibold }}>
          Przepraszamy! Twoje punkty są bezpieczne — możesz spróbować jeszcze raz.
        </p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: spacing.sm, width: '100%', maxWidth: 320 }}>
          <button
            type="button"
            onClick={() => this.reset('retry')}
            style={{ ...btn, background: colors.textPrimary, color: colors.bg, border: 'none' }}
          >
            Spróbuj ponownie
          </button>
          <button
            type="button"
            onClick={() => this.reset('menu')}
            style={{ ...btn, background: 'transparent', color: colors.textPrimary, border: `2px solid ${colors.border}` }}
          >
            Wróć do menu
          </button>
        </div>
      </div>
    )
  }
}
