import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { supabase } from '../lib/supabase'

type State = 'idle' | 'loading' | 'success' | 'duplicate' | 'error'

export default function WaitlistSection() {
  const [email, setEmail] = useState('')
  const [state, setState] = useState<State>('idle')
  const [errorMsg, setErrorMsg] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const trimmed = email.trim().toLowerCase()
    if (!trimmed) return

    setState('loading')
    setErrorMsg('')

    const { error } = await supabase
      .from('waitlist')
      .insert({ email: trimmed, source_url: window.location.href })

    if (!error) {
      setState('success')
      setEmail('')
      return
    }

    // Supabase unique 冲突 → code 23505
    if (error.code === '23505') {
      setState('duplicate')
    } else {
      setState('error')
      setErrorMsg(error.message)
    }
  }

  const reset = () => {
    setState('idle')
    setErrorMsg('')
  }

  return (
    <section
      style={{
        borderTop: '1px solid var(--color-paper-border)',
        background: 'var(--color-paper-warm)',
      }}
    >
      <div
        className="max-w-7xl mx-auto px-6 md:px-12 py-16"
        style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '2rem' }}
      >
        {/* Label */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}
        >
          <span
            style={{
              fontFamily: 'var(--font-mono)',
              fontSize: '0.62rem',
              letterSpacing: '0.18em',
              color: 'var(--color-ink-muted)',
            }}
          >
            ── EARLY ACCESS
          </span>
          <h2
            style={{
              fontFamily: 'var(--font-display)',
              fontSize: 'clamp(1.5rem, 3vw, 2.25rem)',
              fontWeight: 400,
              color: 'var(--color-ink)',
              letterSpacing: '-0.02em',
              lineHeight: 1.1,
            }}
          >
            More Souls are coming.
          </h2>
          <p
            style={{
              fontFamily: 'var(--font-body)',
              fontSize: '0.9rem',
              color: 'var(--color-ink-tertiary)',
              lineHeight: 1.7,
              maxWidth: '480px',
            }}
          >
            We're distilling Feynman, Karpathy, Collison, and dozens more.
            Get notified when new Souls drop — and get early access to the full library.
          </p>
        </motion.div>

        {/* Form */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          <AnimatePresence mode="wait">
            {state === 'success' ? (
              <motion.div
                key="success"
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.75rem',
                  padding: '0.875rem 1.25rem',
                  border: '1px solid var(--color-accent)',
                  background: 'var(--color-paper)',
                }}
              >
                <span style={{ color: 'var(--color-accent)', fontFamily: 'var(--font-mono)', fontSize: '0.9rem' }}>✓</span>
                <div>
                  <p style={{ fontFamily: 'var(--font-body)', fontSize: '0.85rem', color: 'var(--color-ink)', marginBottom: '0.1rem' }}>
                    You're on the list.
                  </p>
                  <p style={{ fontFamily: 'var(--font-mono)', fontSize: '0.65rem', color: 'var(--color-ink-muted)', letterSpacing: '0.06em' }}>
                    We'll reach out when new Souls are ready.
                  </p>
                </div>
              </motion.div>
            ) : state === 'duplicate' ? (
              <motion.div
                key="duplicate"
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: '0.75rem',
                  padding: '0.875rem 1.25rem',
                  border: '1px solid var(--color-paper-border)',
                  background: 'var(--color-paper)',
                }}
              >
                <p style={{ fontFamily: 'var(--font-mono)', fontSize: '0.72rem', color: 'var(--color-ink-muted)', letterSpacing: '0.04em' }}>
                  This email is already on the list.
                </p>
                <button
                  onClick={reset}
                  style={{
                    fontFamily: 'var(--font-mono)',
                    fontSize: '0.62rem',
                    color: 'var(--color-accent)',
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    letterSpacing: '0.08em',
                    flexShrink: 0,
                  }}
                >
                  TRY ANOTHER →
                </button>
              </motion.div>
            ) : (
              <motion.form
                key="form"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onSubmit={handleSubmit}
                style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', maxWidth: '480px' }}
              >
                <div style={{ display: 'flex', gap: '0' }}>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => { setEmail(e.target.value); if (state === 'error') reset() }}
                    placeholder="your@email.com"
                    required
                    disabled={state === 'loading'}
                    style={{
                      flex: 1,
                      fontFamily: 'var(--font-mono)',
                      fontSize: '0.82rem',
                      color: 'var(--color-ink)',
                      background: 'var(--color-paper)',
                      border: '1px solid var(--color-paper-border)',
                      borderRight: 'none',
                      padding: '0.65rem 0.875rem',
                      outline: 'none',
                      letterSpacing: '0.02em',
                      minWidth: 0,
                    }}
                    onFocus={(e) => (e.currentTarget.style.borderColor = 'var(--color-ink)')}
                    onBlur={(e) => (e.currentTarget.style.borderColor = 'var(--color-paper-border)')}
                  />
                  <button
                    type="submit"
                    disabled={state === 'loading' || !email.trim()}
                    style={{
                      fontFamily: 'var(--font-mono)',
                      fontSize: '0.7rem',
                      letterSpacing: '0.1em',
                      padding: '0.65rem 1.1rem',
                      background: state === 'loading' ? 'var(--color-ink-muted)' : 'var(--color-ink)',
                      color: 'var(--color-paper)',
                      border: '1px solid transparent',
                      cursor: state === 'loading' ? 'wait' : 'pointer',
                      transition: 'all 150ms',
                      whiteSpace: 'nowrap',
                      flexShrink: 0,
                    }}
                    onMouseEnter={(e) => {
                      if (state !== 'loading' && email.trim())
                        e.currentTarget.style.background = 'var(--color-accent)'
                    }}
                    onMouseLeave={(e) => {
                      if (state !== 'loading')
                        e.currentTarget.style.background = 'var(--color-ink)'
                    }}
                  >
                    {state === 'loading' ? '···' : 'NOTIFY ME →'}
                  </button>
                </div>

                {state === 'error' && (
                  <p style={{ fontFamily: 'var(--font-mono)', fontSize: '0.65rem', color: '#e05252', letterSpacing: '0.04em' }}>
                    ⚠ {errorMsg || 'Something went wrong. Try again.'}
                  </p>
                )}

                <p style={{ fontFamily: 'var(--font-mono)', fontSize: '0.6rem', color: 'var(--color-ink-faint)', letterSpacing: '0.06em', lineHeight: 1.5 }}>
                  No spam. Unsubscribe any time.
                </p>
              </motion.form>
            )}
          </AnimatePresence>
        </motion.div>
      </div>
    </section>
  )
}
