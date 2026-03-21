import { motion } from 'framer-motion'
import SoulGrid from '../components/SoulGrid'
import WaitlistSection from '../components/WaitlistSection'

// ASCII art block for hero decoration
const ASCII_VESSEL = `
 ██╗   ██╗███████╗███████╗███████╗███████╗██╗     
 ██║   ██║██╔════╝██╔════╝██╔════╝██╔════╝██║     
 ██║   ██║█████╗  ███████╗███████╗█████╗  ██║     
 ╚██╗ ██╔╝██╔══╝  ╚════██║╚════██║██╔══╝  ██║     
  ╚████╔╝ ███████╗███████║███████║███████╗███████╗
   ╚═══╝  ╚══════╝╚══════╝╚══════╝╚══════╝╚══════╝
`.trim()

export default function HomePage() {
  return (
    <>
      {/* Hero */}
      <section
        className="relative pt-28 pb-14 px-6 md:px-12"
        style={{ borderBottom: '1px solid var(--color-paper-border)' }}
      >
        <div className="max-w-7xl mx-auto">
          {/* Top label row */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="flex items-center justify-between mb-10"
          >
            <span
              className="text-xs uppercase"
              style={{
                fontFamily: 'var(--font-mono)',
                color: 'var(--color-ink-muted)',
                letterSpacing: '0.15em',
              }}
            >
              ░ PUBLIC EXPERIMENT — PHASE 0 ░
            </span>
            <span
              className="hidden md:block text-xs"
              style={{
                fontFamily: 'var(--font-mono)',
                color: 'var(--color-ink-faint)',
                letterSpacing: '0.12em',
              }}
            >
              EST. 2026
            </span>
          </motion.div>

          {/* ASCII logo block — desktop */}
          <motion.pre
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.15 }}
            className="hidden md:block mb-4 overflow-x-auto"
            style={{
              fontFamily: 'var(--font-mono)',
              fontSize: 'clamp(0.45rem, 0.8vw, 0.75rem)',
              lineHeight: 1.15,
              color: 'var(--color-ink)',
              letterSpacing: '0.01em',
              fontWeight: 400,
            }}
          >
            {ASCII_VESSEL}
          </motion.pre>

          {/* Mobile headline */}
          <motion.h1
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.15 }}
            className="md:hidden mb-4"
            style={{
              fontFamily: 'var(--font-display)',
              fontSize: 'clamp(2.5rem, 10vw, 4rem)',
              fontWeight: 400,
              color: 'var(--color-ink)',
              letterSpacing: '-0.02em',
            }}
          >
            VESSEL
          </motion.h1>

          {/* Divider */}
          <motion.div
            initial={{ scaleX: 0 }}
            animate={{ scaleX: 1 }}
            transition={{ duration: 0.6, delay: 0.25, ease: [0.16, 1, 0.3, 1] }}
            className="origin-left mb-6"
            style={{ height: '1px', background: 'var(--color-paper-border-strong)' }}
          />

          {/* Description row */}
          <motion.div
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="flex flex-col md:flex-row md:items-end justify-between gap-4"
          >
            <p
              className="max-w-2xl"
              style={{
                fontFamily: 'var(--font-body)',
                fontSize: 'clamp(0.85rem, 1.2vw, 1.05rem)',
                lineHeight: 1.75,
                color: 'var(--color-ink-secondary)',
              }}
            >
              The greatest minds of our time,{' '}
              distilled into living AI personas.{' '}
              <span style={{ color: 'var(--color-accent)' }}>
                Ask them anything.
              </span>
            </p>

            <div
              className="flex-shrink-0 text-right"
              style={{ fontFamily: 'var(--font-mono)', fontSize: '0.7rem', color: 'var(--color-ink-faint)', lineHeight: 2 }}
            >
              <div>BUILT FROM PUBLIC CONTENT</div>
              <div>NO AFFILIATION WITH SUBJECTS</div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Grid */}
      <SoulGrid />

      {/* Waitlist */}
      <WaitlistSection />
    </>
  )
}
