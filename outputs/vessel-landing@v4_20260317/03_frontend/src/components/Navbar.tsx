import { useState, useEffect } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { motion } from 'framer-motion'

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false)
  const location = useLocation()
  const isDetail = location.pathname.startsWith('/soul/')

  useEffect(() => {
    const handle = () => setScrolled(window.scrollY > 40)
    window.addEventListener('scroll', handle)
    return () => window.removeEventListener('scroll', handle)
  }, [])

  return (
    <motion.nav
      initial={{ y: -50, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.4, delay: 0.05 }}
      className="fixed top-0 left-0 right-0 z-50"
      style={{
        background: scrolled ? 'rgba(250,250,247,0.96)' : 'transparent',
        backdropFilter: scrolled ? 'blur(8px)' : 'none',
        borderBottom: scrolled ? '1px solid var(--color-paper-border)' : 'none',
        transition: 'background 250ms, border-bottom 250ms',
      }}
    >
      <div
        className="max-w-7xl mx-auto px-6 md:px-12 h-14 flex items-center justify-between"
      >
        {/* Logo */}
        <Link
          to="/"
          style={{
            fontFamily: 'var(--font-display)',
            fontWeight: 500,
            fontSize: '0.95rem',
            color: 'var(--color-ink)',
            textDecoration: 'none',
            letterSpacing: '0.06em',
          }}
        >
          VESSEL
        </Link>

        {/* Center — ASCII decoration (desktop only) */}
        <div
          className="hidden md:flex items-center gap-1 text-xs"
          style={{
            fontFamily: 'var(--font-mono)',
            color: 'var(--color-ink-faint)',
            letterSpacing: '0.12em',
          }}
        >
          <span>░░░</span>
          <span style={{ color: 'var(--color-ink-muted)', fontSize: '0.65rem', letterSpacing: '0.15em' }}>
            Your mind, made permanent.
          </span>
          <span>░░░</span>
        </div>

        {/* Right */}
        <div className="flex items-center gap-3">
          {isDetail ? (
            <Link
              to="/"
              className="flex items-center gap-1.5 text-xs transition-colors duration-150"
              style={{
                fontFamily: 'var(--font-mono)',
                color: 'var(--color-ink-tertiary)',
                textDecoration: 'none',
                letterSpacing: '0.06em',
              }}
              onMouseEnter={(e) => { e.currentTarget.style.color = 'var(--color-accent)' }}
              onMouseLeave={(e) => { e.currentTarget.style.color = 'var(--color-ink-tertiary)' }}
            >
              ← ALL SOULS
            </Link>
          ) : (
            <span
              className="text-xs"
              style={{
                fontFamily: 'var(--font-mono)',
                color: 'var(--color-ink-faint)',
                letterSpacing: '0.1em',
              }}
            >
              [PHASE_0]
            </span>
          )}
        </div>
      </div>
    </motion.nav>
  )
}
