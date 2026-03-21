import { useState, useEffect, useRef } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { useAuth } from '../contexts/AuthContext'

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const location = useLocation()
  const isDetail = location.pathname.startsWith('/soul/')
  const { user, signOut, openAuthModal } = useAuth()
  const menuRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handle = () => setScrolled(window.scrollY > 40)
    window.addEventListener('scroll', handle)
    return () => window.removeEventListener('scroll', handle)
  }, [])

  // 点击外部关闭菜单
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  // 登录成功后关闭菜单
  useEffect(() => { setMenuOpen(false) }, [user])

  const initials = user?.email
    ? user.email.slice(0, 2).toUpperCase()
    : null

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
      <div className="max-w-7xl mx-auto px-6 md:px-12 h-14 flex items-center justify-between">
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

        {/* Center — slogan */}
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
          {isDetail && (
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
          )}

          {/* Auth area */}
          {user ? (
            // 已登录：头像首字母 + 下拉菜单
            <div ref={menuRef} style={{ position: 'relative' }}>
              <button
                onClick={() => setMenuOpen((o) => !o)}
                title={user.email ?? ''}
                style={{
                  width: '28px',
                  height: '28px',
                  borderRadius: '0',
                  background: 'var(--color-accent)',
                  border: 'none',
                  cursor: 'pointer',
                  fontFamily: 'var(--font-display)',
                  fontSize: '0.7rem',
                  fontWeight: 500,
                  color: 'var(--color-paper)',
                  letterSpacing: '0.04em',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  transition: 'opacity 150ms',
                }}
                onMouseEnter={(e) => (e.currentTarget.style.opacity = '0.8')}
                onMouseLeave={(e) => (e.currentTarget.style.opacity = '1')}
              >
                {initials}
              </button>

              <AnimatePresence>
                {menuOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: -4, scale: 0.97 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -4, scale: 0.97 }}
                    transition={{ duration: 0.12 }}
                    style={{
                      position: 'absolute',
                      top: 'calc(100% + 8px)',
                      right: 0,
                      minWidth: '200px',
                      background: 'var(--color-paper)',
                      border: '1px solid var(--color-paper-border)',
                      zIndex: 100,
                      boxShadow: '0 4px 16px rgba(0,0,0,0.08)',
                    }}
                  >
                    {/* Email */}
                    <div
                      style={{
                        padding: '0.6rem 0.875rem',
                        borderBottom: '1px solid var(--color-paper-border)',
                        background: 'var(--color-paper-dark)',
                      }}
                    >
                      <p style={{ fontFamily: 'var(--font-mono)', fontSize: '0.62rem', color: 'var(--color-ink-faint)', letterSpacing: '0.08em', marginBottom: '0.1rem' }}>
                        SIGNED IN AS
                      </p>
                      <p style={{ fontFamily: 'var(--font-mono)', fontSize: '0.72rem', color: 'var(--color-ink-secondary)', letterSpacing: '0.02em', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {user.email}
                      </p>
                    </div>
                    {/* Sign out */}
                    <button
                      onClick={() => { signOut(); setMenuOpen(false) }}
                      style={{
                        width: '100%',
                        padding: '0.6rem 0.875rem',
                        background: 'none',
                        border: 'none',
                        cursor: 'pointer',
                        fontFamily: 'var(--font-mono)',
                        fontSize: '0.7rem',
                        letterSpacing: '0.08em',
                        color: 'var(--color-ink-muted)',
                        textAlign: 'left',
                        transition: 'all 150ms',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem',
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.background = 'var(--color-paper-warm)'
                        e.currentTarget.style.color = 'var(--color-ink)'
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.background = 'none'
                        e.currentTarget.style.color = 'var(--color-ink-muted)'
                      }}
                    >
                      <span style={{ fontSize: '0.75rem' }}>⎋</span> SIGN OUT
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ) : (
            // 未登录：Sign In 按钮
            <button
              onClick={openAuthModal}
              style={{
                fontFamily: 'var(--font-mono)',
                fontSize: '0.65rem',
                letterSpacing: '0.1em',
                padding: '0.3rem 0.7rem',
                background: 'transparent',
                color: 'var(--color-ink-muted)',
                border: '1px solid var(--color-paper-border)',
                cursor: 'pointer',
                transition: 'all 150ms',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.color = 'var(--color-ink)'
                e.currentTarget.style.borderColor = 'var(--color-ink)'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.color = 'var(--color-ink-muted)'
                e.currentTarget.style.borderColor = 'var(--color-paper-border)'
              }}
            >
              SIGN IN
            </button>
          )}
        </div>
      </div>
    </motion.nav>
  )
}
