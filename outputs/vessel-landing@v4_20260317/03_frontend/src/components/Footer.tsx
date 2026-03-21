import { Link } from 'react-router-dom'

export default function Footer() {
  return (
    <footer
      style={{
        borderTop: '1px solid var(--color-paper-border)',
        background: 'var(--color-paper-warm)',
      }}
    >
      {/* ASCII decoration bar */}
      <div
        style={{
          borderBottom: '1px solid var(--color-paper-border)',
          padding: '0.35rem 0',
          overflow: 'hidden',
          whiteSpace: 'nowrap',
        }}
      >
        <span
          style={{
            fontFamily: 'var(--font-mono)',
            fontSize: '0.55rem',
            color: 'var(--color-ink-faint)',
            letterSpacing: '0.02em',
          }}
        >
          {'░▒▓█ VESSEL SOUL DISTILLATION LAB █▓▒░ '.repeat(12)}
        </span>
      </div>

      <div className="max-w-7xl mx-auto px-6 md:px-12 py-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
        <Link
          to="/"
          style={{
            fontFamily: 'var(--font-display)',
            fontWeight: 500,
            fontSize: '1rem',
            color: 'var(--color-ink)',
            textDecoration: 'none',
            letterSpacing: '0.06em',
          }}
        >
          VESSEL
        </Link>

        <p
          style={{
            fontFamily: 'var(--font-mono)',
            fontSize: '0.65rem',
            color: 'var(--color-ink-muted)',
            letterSpacing: '0.05em',
            lineHeight: 1.7,
            maxWidth: '32rem',
            textAlign: 'center',
          }}
        >
          Built from public content. No affiliation with subjects.
          <br />
          Souls are AI reconstructions, not official endorsements.
        </p>

        <p
          style={{
            fontFamily: 'var(--font-mono)',
            fontSize: '0.65rem',
            color: 'var(--color-ink-faint)',
            letterSpacing: '0.06em',
          }}
        >
          © 2026
        </p>
      </div>
    </footer>
  )
}
