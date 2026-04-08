// ImposterGame design tokens — Duolingo-style cream redesign (M8).
// Light cream surfaces, Nunito typography, locked mode accents, tactile shadows.
// Every component imports from here so future tweaks live in one place.
//
// LIGHT/DARK THEME: tokens that change between themes resolve to CSS variables
// declared in index.html. Toggling document.documentElement.dataset.theme
// instantly swaps the palette across the whole app — no React re-render needed.
// Mode accent colors are LOCKED (illustrations were generated against them) so
// they stay as raw hex regardless of theme.

const modeAccent = {
  classic: '#ef4444',        // red, hero — LOCKED, illustrations were generated against this
  pairsQuestion: '#3b82f6',  // blue — LOCKED
  kameleon: '#10b981',       // emerald — LOCKED
}

// Two-tone "under-layer" for the Duolingo tactile button press.
// Each entry is ~18% darker + slightly desaturated than its accent sibling.
const modeAccentShadow = {
  classic: '#B8352C',
  pairsQuestion: '#2660C7',
  kameleon: '#0B8A61',
}

export const colors = {
  // Cream/dark surfaces — themed via CSS vars
  bg:             'var(--color-bg)',
  bgSubtle:       'var(--color-bg-subtle)',
  surface:        'var(--color-surface)',
  surfaceRaised:  'var(--color-surface-raised)',
  surfaceSubtle:  'var(--color-surface-subtle)',

  // Borders — themed
  border:         'var(--color-border)',
  borderStrong:   'var(--color-border-strong)',

  // Text — themed
  textPrimary:    'var(--color-text-primary)',
  textSecondary:  'var(--color-text-secondary)',
  textMuted:      'var(--color-text-muted)',
  textDim:        'var(--color-text-dim)',

  // Mode accents — LOCKED hex values, do not theme
  modeAccent,
  modeAccentShadow,

  // Roles — semantic, do not theme
  roleColors: {
    civilian: '#2BB673',
    impostor: '#ef4444',
  },

  // Semantic — same in both themes
  success:        '#2BB673',
  successShadow:  '#1E8C57',
  danger:         '#ef4444',
  dangerShadow:   '#B8352C',
  warning:        '#F5A623',

  // Scoring (re-exported semantic aliases for the existing components)
  scoreRed:    '#ef4444',
  scoreYellow: '#F5A623',
  scoreGreen:  '#2BB673',

  // Overlay — themed
  overlay:        'var(--color-overlay)',

  // Cream pad behind illustrations on light theme; same cream on dark so the
  // PNGs (which were rendered against cream) sit on a familiar bed.
  illustrationBg: 'var(--illustration-bg)',
}

export const fonts = {
  sans: "'Nunito', system-ui, -apple-system, sans-serif",
}

export const fontSizes = {
  eyebrow: 13,
  bodySm: 15,
  body: 18,
  bodyLg: 20,
  h3: 24,
  h2: 32,
  h1: 44,
  display: 56, // "Teraz mówi" from arm's length
}

export const fontWeights = {
  regular: 400,    // kept for backward compat — not loaded as a Nunito weight
  semibold: 600,
  bold: 700,
  extraBold: 800,
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
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 28,
  pill: 999,
}

// Tiered shadow system. Themed via CSS variables so dark mode gets deeper
// shadows automatically. `tactile*` are the signature Duolingo two-tone press.
export const shadows = {
  soft:    '0 2px 8px var(--shadow-soft)',
  medium:  '0 6px 18px var(--shadow-medium)',
  strong:  '0 18px 40px var(--shadow-strong)',
  tactile:        '0 4px 0 var(--shadow-tactile-neutral)',
  tactilePressed: '0 0 0 transparent',
  tactileOffsetY: 4,
}

// Helper: look up the accent color for a mode id. Falls back to textPrimary.
export const colorForMode = (id) => modeAccent[id] || colors.textPrimary

// Helper: look up the matching tactile under-shadow color for a mode id.
// Falls back to the themed neutral so non-mode buttons still feel chunky in
// both light and dark.
export const colorForModeShadow = (id) =>
  modeAccentShadow[id] || 'var(--shadow-tactile-neutral)'

// Helper: look up a role color. Falls back to textPrimary.
export const colorForRole = (role) => colors.roleColors[role] || colors.textPrimary

// Helper: build a tactile under-layer shadow string for any color.
// Pass null/undefined to get the themed neutral.
export const tactileShadow = (shadowColor) =>
  `0 4px 0 ${shadowColor || 'var(--shadow-tactile-neutral)'}`
