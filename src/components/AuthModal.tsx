import { useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { supabase } from '../lib/supabase'
import { useAuth } from '../contexts/AuthContext'

type AuthMode = 'login' | 'sent'

export default function AuthModal() {
  const { authModalOpen, closeAuthModal } = useAuth()
  const [mode, setMode] = useState<AuthMode>('login')
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const reset = () => {
    setMode('login')
    setEmail('')
    setError(null)
    setLoading(false)
  }

  const handleClose = () => {
    closeAuthModal()
    setTimeout(reset, 300)
  }

  const handleMagicLink = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email.trim()) return
    setLoading(true)
    setError(null)
    const { error: err } = await supabase.auth.signInWithOtp({
      email: email.trim(),
      options: { emailRedirectTo: window.location.href },
    })
    setLoading(false)
    if (err) {
      setError(err.message)
    } else {
      setMode('sent')
    }
  }

  const handleOAuth = async (provider: 'google' | 'github') => {
    setError(null)
    const { error: err } = await supabase.auth.signInWithOAuth({
      provider,
      options: { redirectTo: window.location.href },
    })
    if (err) setError(err.message)
  }

  return (
    <AnimatePresence>
      {authModalOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            key="backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={handleClose}
            style={{
              position: 'fixed',
              inset: 0,
              background: 'rgba(0,0,0,0.72)',
              backdropFilter: 'blur(4px)',
              zIndex: 9998,
            }}
          />

          {/* Modal — 定位层与动画层分离，避免 transform 冲突 */}
          <div
            style={{
              position: 'fixed',
              inset: 0,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              zIndex: 9999,
              padding: '0 1rem',
              pointerEvents: 'none',
            }}
          >
          <motion.div
            key="modal"
            initial={{ opacity: 0, y: 24, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 16, scale: 0.97 }}
            transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
            style={{
              width: '100%',
              maxWidth: '400px',
              pointerEvents: 'auto',
            }}
          >
            <div
              style={{
                background: 'var(--color-paper)',
                border: '1px solid var(--color-paper-border)',
                padding: '0',
                overflow: 'hidden',
              }}
            >
              {/* Header */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '0.75rem 1.25rem',
                  borderBottom: '1px solid var(--color-paper-border)',
                  background: 'var(--color-paper-dark)',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <div
                    style={{
                      fontFamily: 'var(--font-display)',
                      fontSize: '0.9rem',
                      fontWeight: 500,
                      color: 'var(--color-paper)',
                      background: 'var(--color-accent)',
                      padding: '0.05rem 0.3rem',
                      letterSpacing: '0.05em',
                      lineHeight: 1.2,
                    }}
                  >
                    V
                  </div>
                  <span
                    style={{
                      fontFamily: 'var(--font-mono)',
                      fontSize: '0.65rem',
                      letterSpacing: '0.12em',
                      color: 'var(--color-ink-muted)',
                    }}
                  >
                    VESSEL · ACCESS REQUIRED
                  </span>
                </div>
                <button
                  onClick={handleClose}
                  style={{
                    fontFamily: 'var(--font-mono)',
                    fontSize: '0.75rem',
                    color: 'var(--color-ink-faint)',
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    padding: '0.1rem 0.3rem',
                    lineHeight: 1,
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--color-ink)')}
                  onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--color-ink-faint)')}
                >
                  ✕
                </button>
              </div>

              <div style={{ padding: '1.5rem 1.25rem' }}>
                <AnimatePresence mode="wait">
                  {mode === 'sent' ? (
                    // ── Sent state ──────────────────────────────────────────
                    <motion.div
                      key="sent"
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0 }}
                      style={{ textAlign: 'center', padding: '0.5rem 0' }}
                    >
                      <div
                        style={{
                          fontFamily: 'var(--font-mono)',
                          fontSize: '1.5rem',
                          color: 'var(--color-accent)',
                          marginBottom: '0.75rem',
                        }}
                      >
                        ✓
                      </div>
                      <p
                        style={{
                          fontFamily: 'var(--font-display)',
                          fontSize: '1.05rem',
                          color: 'var(--color-ink)',
                          marginBottom: '0.5rem',
                          fontWeight: 400,
                        }}
                      >
                        Check your email
                      </p>
                      <p
                        style={{
                          fontFamily: 'var(--font-body)',
                          fontSize: '0.82rem',
                          color: 'var(--color-ink-tertiary)',
                          lineHeight: 1.6,
                          marginBottom: '1.25rem',
                        }}
                      >
                        We sent a magic link to <strong style={{ color: 'var(--color-ink-secondary)' }}>{email}</strong>.
                        Click it to sign in — no password needed.
                      </p>
                      <button
                        onClick={reset}
                        style={{
                          fontFamily: 'var(--font-mono)',
                          fontSize: '0.65rem',
                          letterSpacing: '0.1em',
                          color: 'var(--color-ink-muted)',
                          background: 'none',
                          border: 'none',
                          cursor: 'pointer',
                          textDecoration: 'underline',
                        }}
                      >
                        USE A DIFFERENT EMAIL
                      </button>
                    </motion.div>
                  ) : (
                    // ── Login form ───────────────────────────────────────────
                    <motion.div
                      key="login"
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0 }}
                    >
                      <p
                        style={{
                          fontFamily: 'var(--font-display)',
                          fontSize: '1.1rem',
                          color: 'var(--color-ink)',
                          marginBottom: '0.35rem',
                          fontWeight: 400,
                          letterSpacing: '-0.01em',
                        }}
                      >
                        Sign in to download Souls
                      </p>
                      <p
                        style={{
                          fontFamily: 'var(--font-body)',
                          fontSize: '0.8rem',
                          color: 'var(--color-ink-tertiary)',
                          marginBottom: '1.5rem',
                          lineHeight: 1.55,
                        }}
                      >
                        Free account. No credit card. Instant access to all Soul files.
                      </p>

                      {/* OAuth buttons */}
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem', marginBottom: '1.25rem' }}>
                        <OAuthButton
                          onClick={() => handleOAuth('google')}
                          icon={<GoogleIcon />}
                          label="Continue with Google"
                        />
                        <OAuthButton
                          onClick={() => handleOAuth('github')}
                          icon={<GitHubIcon />}
                          label="Continue with GitHub"
                        />
                      </div>

                      {/* Divider */}
                      <div
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.75rem',
                          marginBottom: '1.25rem',
                        }}
                      >
                        <div style={{ flex: 1, height: '1px', background: 'var(--color-paper-border)' }} />
                        <span
                          style={{
                            fontFamily: 'var(--font-mono)',
                            fontSize: '0.6rem',
                            letterSpacing: '0.12em',
                            color: 'var(--color-ink-faint)',
                          }}
                        >
                          OR
                        </span>
                        <div style={{ flex: 1, height: '1px', background: 'var(--color-paper-border)' }} />
                      </div>

                      {/* Magic link form */}
                      <form onSubmit={handleMagicLink} style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
                        <input
                          type="email"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          placeholder="your@email.com"
                          required
                          style={{
                            fontFamily: 'var(--font-mono)',
                            fontSize: '0.82rem',
                            color: 'var(--color-ink)',
                            background: 'var(--color-paper-dark)',
                            border: '1px solid var(--color-paper-border)',
                            padding: '0.65rem 0.875rem',
                            outline: 'none',
                            width: '100%',
                            letterSpacing: '0.02em',
                          }}
                          onFocus={(e) => (e.currentTarget.style.borderColor = 'var(--color-ink)')}
                          onBlur={(e) => (e.currentTarget.style.borderColor = 'var(--color-paper-border)')}
                        />
                        <button
                          type="submit"
                          disabled={loading || !email.trim()}
                          style={{
                            fontFamily: 'var(--font-mono)',
                            fontSize: '0.72rem',
                            letterSpacing: '0.1em',
                            padding: '0.65rem',
                            background: loading ? 'var(--color-ink-muted)' : 'var(--color-ink)',
                            color: 'var(--color-paper)',
                            border: '1px solid transparent',
                            cursor: loading ? 'wait' : 'pointer',
                            transition: 'all 150ms',
                            opacity: !email.trim() ? 0.5 : 1,
                          }}
                          onMouseEnter={(e) => {
                            if (!loading && email.trim()) {
                              e.currentTarget.style.background = 'var(--color-accent)'
                            }
                          }}
                          onMouseLeave={(e) => {
                            if (!loading) {
                              e.currentTarget.style.background = 'var(--color-ink)'
                            }
                          }}
                        >
                          {loading ? 'SENDING...' : '→ SEND MAGIC LINK'}
                        </button>
                      </form>

                      {error && (
                        <p
                          style={{
                            fontFamily: 'var(--font-mono)',
                            fontSize: '0.7rem',
                            color: '#e05252',
                            marginTop: '0.75rem',
                            letterSpacing: '0.04em',
                          }}
                        >
                          ⚠ {error}
                        </p>
                      )}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Footer */}
              <div
                style={{
                  padding: '0.6rem 1.25rem',
                  borderTop: '1px solid var(--color-paper-border)',
                  background: 'var(--color-paper-dark)',
                }}
              >
                <p
                  style={{
                    fontFamily: 'var(--font-mono)',
                    fontSize: '0.6rem',
                    color: 'var(--color-ink-faint)',
                    letterSpacing: '0.06em',
                    textAlign: 'center',
                    lineHeight: 1.5,
                  }}
                >
                  By signing in you agree to our Terms & Privacy Policy.
                </p>
              </div>
            </div>
          </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  )
}

// ── Sub-components ────────────────────────────────────────────────────────────

function OAuthButton({
  onClick,
  icon,
  label,
}: {
  onClick: () => void
  icon: React.ReactNode
  label: string
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '0.6rem',
        padding: '0.6rem 1rem',
        background: 'var(--color-paper-warm)',
        border: '1px solid var(--color-paper-border)',
        cursor: 'pointer',
        fontFamily: 'var(--font-body)',
        fontSize: '0.82rem',
        color: 'var(--color-ink-secondary)',
        transition: 'all 150ms',
        width: '100%',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.background = 'var(--color-paper-dark)'
        e.currentTarget.style.borderColor = 'var(--color-ink-muted)'
        e.currentTarget.style.color = 'var(--color-ink)'
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.background = 'var(--color-paper-warm)'
        e.currentTarget.style.borderColor = 'var(--color-paper-border)'
        e.currentTarget.style.color = 'var(--color-ink-secondary)'
      }}
    >
      {icon}
      <span>{label}</span>
    </button>
  )
}

function GoogleIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
    </svg>
  )
}

function GitHubIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 0C5.374 0 0 5.373 0 12c0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23A11.509 11.509 0 0 1 12 5.803c1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576C20.566 21.797 24 17.3 24 12c0-6.627-5.373-12-12-12z"/>
    </svg>
  )
}
