import { useId } from 'react'
import { colors, shadows, radii, fonts } from '../../styles/theme'

// ThemeToggle — small circular pressable button that flips light/dark mode.
// Uses inline SVG (no emojis, no icon library). The icon shown is the
// destination mode, not the current mode — i.e. dark mode shows a sun,
// because tapping it goes back to light. Standard pattern, less ambiguous.
export default function ThemeToggle({ mode = 'light', onToggle }) {
  const reactId = useId()
  const safeId = reactId.replace(/:/g, '')
  const className = `theme-toggle-${safeId}`
  const isDark = mode === 'dark'
  const label = isDark ? 'Włącz tryb jasny' : 'Włącz tryb ciemny'

  return (
    <>
      <style>{`
        .${className} {
          width: 48px;
          height: 48px;
          border-radius: ${radii.pill}px;
          background: ${colors.surface};
          border: 2px solid ${colors.border};
          color: ${colors.textPrimary};
          display: inline-flex;
          align-items: center;
          justify-content: center;
          padding: 0;
          cursor: pointer;
          font-family: ${fonts.sans};
          box-shadow: ${shadows.tactile};
          transform: translateY(0);
          transition: transform 90ms ease, box-shadow 90ms ease, background 220ms ease, border-color 220ms ease;
        }
        .${className}:active:not(:disabled) {
          transform: translateY(4px);
          box-shadow: 0 0 0 transparent;
        }
        .${className}:focus-visible {
          outline: none;
          box-shadow: ${shadows.tactile}, 0 0 0 3px rgba(43, 43, 43, 0.18);
        }
      `}</style>
      <button
        type="button"
        className={className}
        onClick={onToggle}
        aria-label={label}
        title={label}
      >
        {isDark ? <SunIcon /> : <MoonIcon />}
      </button>
    </>
  )
}

function SunIcon() {
  return (
    <svg
      width="22"
      height="22"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.4"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <circle cx="12" cy="12" r="4" />
      <line x1="12" y1="2"  x2="12" y2="5" />
      <line x1="12" y1="19" x2="12" y2="22" />
      <line x1="2"  y1="12" x2="5"  y2="12" />
      <line x1="19" y1="12" x2="22" y2="12" />
      <line x1="4.5"  y1="4.5"  x2="6.6"  y2="6.6" />
      <line x1="17.4" y1="17.4" x2="19.5" y2="19.5" />
      <line x1="4.5"  y1="19.5" x2="6.6"  y2="17.4" />
      <line x1="17.4" y1="6.6"  x2="19.5" y2="4.5" />
    </svg>
  )
}

function MoonIcon() {
  return (
    <svg
      width="22"
      height="22"
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden="true"
    >
      <path d="M21 12.8A8.5 8.5 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z" />
    </svg>
  )
}
