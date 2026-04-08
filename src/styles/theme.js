// ImposterGame design tokens.
// Dark palette, Inter typography, mode accents per plan.
// Every component imports from here so future tweaks live in one place.

export const colors = {
  // Dark surfaces
  bg: '#0a0a0a',
  surface: '#171717',
  surfaceRaised: '#1f1f1f',
  surfaceSubtle: '#141414',
  border: 'rgba(255,255,255,0.08)',
  borderStrong: 'rgba(255,255,255,0.16)',

  // Text
  textPrimary: '#f5f5f5',
  textSecondary: '#a3a3a3',
  textMuted: '#737373',
  textDim: '#525252',

  // Mode accents (per plan)
  modeAccent: {
    classic: '#ef4444',        // red, hero
    pairsQuestion: '#3b82f6',  // blue
    kameleon: '#10b981',       // emerald
  },

  // Roles
  roleColors: {
    civilian: '#22c55e',
    impostor: '#ef4444',
  },

  // Scoring
  scoreRed: '#ef4444',
  scoreYellow: '#eab308',
  scoreGreen: '#22c55e',

  // Overlay for modals and privacy gates
  overlay: 'rgba(0,0,0,0.92)',
}

export const fonts = {
  sans: "'Inter', system-ui, -apple-system, sans-serif",
}

export const fontSizes = {
  eyebrow: 12,
  bodySm: 15,
  body: 17,
  bodyLg: 19,
  h3: 24,
  h2: 32,
  h1: 44,
  display: 56, // "Teraz mówi" from arm's length
}

export const fontWeights = {
  regular: 400,
  semibold: 600,
  bold: 700,
  black: 900,
}

export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
}

export const radii = {
  sm: 6,
  md: 8,
  lg: 12,
  xl: 16,
  pill: 999,
}

// Helper: look up the accent color for a mode id. Falls back to textPrimary.
export const colorForMode = (id) => colors.modeAccent[id] || colors.textPrimary

// Helper: look up a role color. Falls back to textPrimary.
export const colorForRole = (role) => colors.roleColors[role] || colors.textPrimary
