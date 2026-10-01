import { useId } from 'react'
import { colors, shadows, radii, fonts } from '../../styles/theme'

// SettingToggle — round tactile on/off button for sound or narrator voice.
// Same look as ThemeToggle so the settings row reads as one family. When
// off, the icon is dimmed and struck through so the state is obvious at a glance.
export default function SettingToggle({ kind = 'sound', on = true, onToggle, label }) {
  const reactId = useId()
  const className = `setting-toggle-${reactId.replace(/:/g, '')}`
  const text = label || (kind === 'voice' ? 'Lektor' : 'Dźwięki')

  return (
    <>
      <style>{`
        .${className} {
          width: 48px;
          height: 48px;
          border-radius: ${radii.pill}px;
          background: ${colors.surface};
          border: 2px solid ${on ? colors.borderStrong : colors.border};
          color: ${on ? colors.textPrimary : colors.textDim};
          display: inline-flex;
          align-items: center;
          justify-content: center;
          padding: 0;
          cursor: pointer;
          font-family: ${fonts.sans};
          box-shadow: ${shadows.tactile};
          transform: translateY(0);
          transition: transform 90ms ease, box-shadow 90ms ease, color 220ms ease, border-color 220ms ease;
        }
        .${className}:active:not(:disabled) {
          transform: translateY(4px);
          box-shadow: 0 0 0 transparent;
        }
        .${className}:focus-visible {
          outline: none;
          box-shadow: ${shadows.tactile}, 0 0 0 3px var(--focus-ring);
        }
      `}</style>
      <button
        type="button"
        className={className}
        onClick={onToggle}
        aria-label={`${text}: ${on ? 'włączone' : 'wyłączone'}`}
        aria-pressed={on}
        title={`${text}: ${on ? 'włączone' : 'wyłączone'}`}
      >
        {kind === 'voice' ? <VoiceIcon on={on} /> : <SoundIcon on={on} />}
      </button>
    </>
  )
}

const svgProps = {
  width: 22,
  height: 22,
  viewBox: '0 0 24 24',
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 2.4,
  strokeLinecap: 'round',
  strokeLinejoin: 'round',
  'aria-hidden': true,
}

function Slash() {
  return <line x1="3" y1="3" x2="21" y2="21" />
}

function SoundIcon({ on }) {
  return (
    <svg {...svgProps}>
      <path d="M4 9.5v5h3.5L12 18.5v-13L7.5 9.5H4z" fill="currentColor" />
      {on ? (
        <>
          <path d="M15.5 9a4 4 0 0 1 0 6" />
          <path d="M18 6.5a8 8 0 0 1 0 11" />
        </>
      ) : (
        <Slash />
      )}
    </svg>
  )
}

// Speech bubble with sound lines — "the narrator".
function VoiceIcon({ on }) {
  return (
    <svg {...svgProps}>
      <path d="M4 5h16v11H11l-4 3.5V16H4z" fill={on ? 'currentColor' : 'none'} />
      {on ? (
        <>
          <line x1="8" y1="9" x2="16" y2="9" stroke="var(--color-surface)" />
          <line x1="8" y1="12" x2="13" y2="12" stroke="var(--color-surface)" />
        </>
      ) : (
        <Slash />
      )}
    </svg>
  )
}
