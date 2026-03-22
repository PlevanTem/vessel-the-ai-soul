import { useState, useEffect, useRef, useCallback } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { souls } from '../data/souls'
import { downloadSoulZip } from '../utils/downloadSoul'
import { getBundledSoulPackage } from '../utils/bundledSouls'
import { useAuth } from '../contexts/AuthContext'
import type { VersionEntry } from '../types'

function TypewriterText({ text, trigger }: { text: string; trigger: number }) {
  const [displayed, setDisplayed] = useState('')
  const [done, setDone] = useState(false)
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)

  const start = useCallback(() => {
    if (timerRef.current) clearInterval(timerRef.current)
    setDisplayed('')
    setDone(false)
    let i = 0
    timerRef.current = setInterval(() => {
      if (i < text.length) {
        setDisplayed(text.slice(0, i + 1))
        i++
      } else {
        clearInterval(timerRef.current!)
        setDone(true)
      }
    }, 14)
  }, [text])

  useEffect(() => {
    const t = setTimeout(start, 200)
    return () => {
      clearTimeout(t)
      if (timerRef.current) clearInterval(timerRef.current)
    }
  }, [trigger, start])

  return (
    <span>
      {displayed}
      {!done && (
        <span
          className="inline-block align-middle"
          style={{
            width: '2px',
            height: '1em',
            background: 'var(--color-accent)',
            marginLeft: '2px',
            animation: 'blink 1.1s step-end infinite',
          }}
        />
      )}
    </span>
  )
}

function VersionTimeline({ changelog }: { changelog: VersionEntry[] | undefined }) {
  if (!changelog || changelog.length === 0) return null
  return (
    <div style={{ border: '1px solid var(--color-paper-border)', background: 'var(--color-paper)' }}>
      <div className="px-4 py-2" style={{ borderBottom: '1px solid var(--color-paper-border)', background: 'var(--color-paper-dark)' }}>
        <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.62rem', letterSpacing: '0.1em', color: 'var(--color-ink-muted)' }}>
          CHANGELOG
        </span>
      </div>
      <div className="px-4 py-3 space-y-3">
        {changelog.map((entry, i) => {
          const isLatest = i === 0
          return (
            <div key={entry.version} className="flex gap-3">
              {/* Timeline spine */}
              <div className="flex flex-col items-center" style={{ flexShrink: 0, width: '0.75rem' }}>
                <span
                  style={{
                    fontFamily: 'var(--font-mono)',
                    fontSize: '0.65rem',
                    lineHeight: 1,
                    color: isLatest ? 'var(--color-accent)' : 'var(--color-ink-faint)',
                    marginTop: '0.1rem',
                  }}
                >
                  {isLatest ? '●' : '○'}
                </span>
                {i < changelog.length - 1 && (
                  <div
                    style={{
                      width: '1px',
                      flexGrow: 1,
                      marginTop: '0.2rem',
                      background: 'var(--color-paper-border)',
                      minHeight: '1rem',
                    }}
                  />
                )}
              </div>
              {/* Content */}
              <div style={{ paddingBottom: i < changelog.length - 1 ? '0.25rem' : 0 }}>
                <div className="flex items-baseline gap-2 mb-0.5">
                  <span
                    style={{
                      fontFamily: 'var(--font-mono)',
                      fontSize: '0.7rem',
                      fontWeight: 600,
                      color: isLatest ? 'var(--color-accent)' : 'var(--color-ink-secondary)',
                      letterSpacing: '0.04em',
                    }}
                  >
                    v{entry.version}
                  </span>
                  <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.6rem', color: 'var(--color-ink-faint)', letterSpacing: '0.04em' }}>
                    {entry.date.replace(/-/g, '.')}
                  </span>
                </div>
                <p
                  style={{
                    fontFamily: 'var(--font-body)',
                    fontSize: '0.72rem',
                    color: isLatest ? 'var(--color-ink-secondary)' : 'var(--color-ink-muted)',
                    lineHeight: 1.55,
                  }}
                >
                  {entry.summary}
                </p>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

export default function SoulDetailPage() {
  const { slug } = useParams<{ slug: string }>()
  const navigate = useNavigate()
  const soul = souls.find((s) => s.slug === slug)

  const { user, openAuthModal } = useAuth()
  const [activeConvIndex, setActiveConvIndex] = useState(0)
  const [typeTrigger, setTypeTrigger] = useState(0)
  const [copiedFile, setCopiedFile] = useState<string | null>(null)
  const [downloading, setDownloading] = useState(false)
  const [downloadDone, setDownloadDone] = useState(false)
  const [activeFile, setActiveFile] = useState<'soul' | 'skill' | 'memory'>('soul')

  const bundled = soul ? getBundledSoulPackage(soul.slug) : {}
  const soulContent = bundled.soulMd ?? soul?.filePreview ?? ''
  const skillContent = bundled.skillMd ?? (soul?.skillPreview ?? null)
  const memoryContent = bundled.memoryMd ?? (soul?.memoryPreview ?? null)

  const handleConvSwitch = (i: number) => {
    setActiveConvIndex(i)
    setTypeTrigger((t) => t + 1)
  }

  const handleCopy = (text: string, label: string) => {
    navigator.clipboard.writeText(text)
    setCopiedFile(label)
    setTimeout(() => setCopiedFile(null), 2000)
  }

  const related = soul
    ? souls.filter((s) => s.category === soul.category && s.id !== soul.id).slice(0, 3)
    : []

  if (!soul) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4">
        <p style={{ fontFamily: 'var(--font-mono)', color: 'var(--color-ink-muted)', fontSize: '0.85rem' }}>
          [ SOUL NOT FOUND ]
        </p>
        <button
          onClick={() => navigate('/')}
          style={{ fontFamily: 'var(--font-mono)', color: 'var(--color-accent)', fontSize: '0.8rem', letterSpacing: '0.08em' }}
        >
          ← BACK TO ALL SOULS
        </button>
      </div>
    )
  }

  const initials = soul.name.split(' ').map((n) => n[0]).join('').slice(0, 2)
  const monoLabel = (s: string) => s.replace(/\s*&\s*/g, '+').replace(/\s+/g, '_').toUpperCase()

  const sectionLabel = (text: string) => (
    <div
      className="flex items-center gap-3 mb-4"
    >
      <span
        style={{
          fontFamily: 'var(--font-mono)',
          fontSize: '0.65rem',
          letterSpacing: '0.15em',
          color: 'var(--color-ink-muted)',
        }}
      >
        ── {text}
      </span>
    </div>
  )

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
      style={{ minHeight: '100vh', background: 'var(--color-paper)' }}
    >
      <div className="max-w-7xl mx-auto px-6 md:px-12 pt-24 pb-20">

        {/* Breadcrumb */}
        <nav
          className="flex items-center gap-2 mb-8 text-xs"
          style={{ fontFamily: 'var(--font-mono)', letterSpacing: '0.08em' }}
        >
          <Link
            to="/"
            style={{ color: 'var(--color-ink-muted)', textDecoration: 'none' }}
            onMouseEnter={(e) => { e.currentTarget.style.color = 'var(--color-accent)' }}
            onMouseLeave={(e) => { e.currentTarget.style.color = 'var(--color-ink-muted)' }}
          >
            SOULS
          </Link>
          <span style={{ color: 'var(--color-ink-faint)' }}>/</span>
          <span style={{ color: 'var(--color-ink-muted)' }}>{monoLabel(soul.category)}</span>
          <span style={{ color: 'var(--color-ink-faint)' }}>/</span>
          <span style={{ color: 'var(--color-ink)' }}>{soul.name.toUpperCase()}</span>
        </nav>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-0" style={{ border: '1px solid var(--color-paper-border)' }}>

          {/* LEFT / MAIN */}
          <div
            className="lg:col-span-2 p-8 space-y-10"
            style={{ borderRight: '1px solid var(--color-paper-border)' }}
          >
            {/* Header */}
            <div>
              <div className="flex items-start gap-4 mb-5">
                {/* Initials stamp */}
                <div
                  style={{
                    fontFamily: 'var(--font-display)',
                    fontWeight: 500,
                    fontSize: '1.4rem',
                    color: 'var(--color-paper)',
                    background: 'var(--color-ink)',
                    padding: '0.3rem 0.6rem',
                    letterSpacing: '0.04em',
                    lineHeight: 1,
                    flexShrink: 0,
                  }}
                >
                  {initials}
                </div>
                <div>
                  <div className="flex flex-wrap items-center gap-2 mb-2">
                    <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.62rem', letterSpacing: '0.12em', color: 'var(--color-ink-muted)', border: '1px solid var(--color-paper-border)', padding: '0.1rem 0.4rem' }}>
                      SOUL
                    </span>
                    <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.62rem', letterSpacing: '0.12em', color: 'var(--color-ink-muted)', border: '1px solid var(--color-paper-border)', padding: '0.1rem 0.4rem' }}>
                      {monoLabel(soul.category)}
                    </span>
                    {soul.isFeatured && (
                      <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.62rem', letterSpacing: '0.12em', color: 'var(--color-accent)', border: '1px solid var(--color-accent)', padding: '0.1rem 0.4rem' }}>
                        FEATURED
                      </span>
                    )}
                  </div>
                  <h1
                    style={{
                      fontFamily: 'var(--font-display)',
                      fontWeight: 400,
                      fontSize: 'clamp(1.5rem, 3vw, 2.5rem)',
                      color: 'var(--color-ink)',
                      letterSpacing: '-0.02em',
                      lineHeight: 1.05,
                    }}
                  >
                    {soul.name}
                  </h1>
                  <p style={{ fontFamily: 'var(--font-body)', fontSize: '0.8rem', color: 'var(--color-ink-tertiary)', marginTop: '0.25rem', letterSpacing: '0.01em' }}>
                    {soul.title}
                  </p>
                </div>
              </div>

              <p
                style={{
                  fontFamily: 'var(--font-body)',
                  fontSize: '0.9rem',
                  lineHeight: 1.8,
                  color: 'var(--color-ink-secondary)',
                }}
              >
                {soul.description}
              </p>
            </div>

            {/* Core Traits */}
            <div>
              {sectionLabel('CORE TRAITS')}
              <div
                style={{
                  background: 'var(--color-paper-warm)',
                  border: '1px solid var(--color-paper-border)',
                  padding: '1.25rem',
                }}
              >
                {soul.soulTraits.map((trait, i) => (
                  <div
                    key={trait}
                    className="flex items-start gap-3"
                    style={{
                      paddingTop: i > 0 ? '0.75rem' : 0,
                      marginTop: i > 0 ? '0.75rem' : 0,
                      borderTop: i > 0 ? '1px solid var(--color-paper-border)' : 'none',
                    }}
                  >
                    <span style={{ fontFamily: 'var(--font-mono)', color: 'var(--color-accent)', fontSize: '0.75rem', marginTop: '0.05rem', flexShrink: 0 }}>
                      ▸
                    </span>
                    <span style={{ fontFamily: 'var(--font-body)', fontSize: '0.85rem', color: 'var(--color-ink-secondary)', lineHeight: 1.65, letterSpacing: '0.01em' }}>
                      {trait}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Trigger Phrases */}
            <div>
              {sectionLabel('TRIGGER PHRASES')}
              <div className="space-y-2">
                {soul.triggerPhrases.map((phrase) => (
                  <div
                    key={phrase}
                    className="flex items-center gap-3 px-4 py-2.5"
                    style={{
                      background: 'var(--color-paper)',
                      border: '1px solid var(--color-paper-border)',
                    }}
                  >
                    <span style={{ fontFamily: 'var(--font-mono)', color: 'var(--color-ink-faint)', fontSize: '0.7rem' }}>$</span>
                    <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.8rem', color: 'var(--color-ink-secondary)', letterSpacing: '0.01em' }}>
                      {phrase}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Capabilities */}
            <div>
              {sectionLabel('CAPABILITIES')}
              {soul.capabilities.map((cap, i) => (
                <motion.div
                  key={cap}
                  initial={{ opacity: 0, x: -6 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className="flex items-start gap-3"
                  style={{
                    padding: '0.6rem 0',
                    borderBottom: '1px solid var(--color-paper-border)',
                  }}
                >
                  <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.7rem', color: 'var(--color-accent)', marginTop: '0.15rem', flexShrink: 0 }}>✓</span>
                  <span style={{ fontFamily: 'var(--font-body)', fontSize: '0.85rem', color: 'var(--color-ink-secondary)', lineHeight: 1.65 }}>
                    {cap}
                  </span>
                </motion.div>
              ))}
            </div>

            {/* FILE EXPLORER + PREVIEW */}
            <div>
              {sectionLabel('FILE EXPLORER')}
              <div style={{ border: '1px solid var(--color-paper-border)' }}>

                {/* Two-column: tree + content */}
                <div className="flex" style={{ borderBottom: '1px solid var(--color-paper-border)' }}>

                  {/* Left: file tree */}
                  <div
                    style={{
                      width: '11rem',
                      flexShrink: 0,
                      borderRight: '1px solid var(--color-paper-border)',
                      background: 'var(--color-paper-dark)',
                      padding: '0.75rem 0',
                    }}
                  >
                    {/* Root folder label */}
                    <div
                      style={{
                        fontFamily: 'var(--font-mono)',
                        fontSize: '0.62rem',
                        color: 'var(--color-ink-muted)',
                        letterSpacing: '0.06em',
                        padding: '0 0.75rem 0.4rem',
                        borderBottom: '1px solid var(--color-paper-border)',
                        marginBottom: '0.4rem',
                      }}
                    >
                      📁 {soul.slug}/
                    </div>
                    {/* Files */}
                    {(
                      [
                        { key: 'soul', label: 'SOUL.md', indent: 1 },
                        { key: 'memory', label: 'MEMORY.md', indent: 1 },
                        { key: null, label: 'README.md', indent: 1 },
                        { key: null, label: 'skills/', indent: 1 },
                        { key: 'skill', label: `${soul.slug}/SKILL.md`, indent: 2 },
                      ] as { key: 'soul' | 'skill' | 'memory' | null; label: string; indent: number }[]
                    ).map(({ key, label, indent }) => {
                      const isActive = key !== null && activeFile === key
                      const isClickable = key !== null
                      return (
                        <div
                          key={label}
                          onClick={() => { if (isClickable) setActiveFile(key!) }}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.25rem',
                            padding: `0.2rem ${0.5 + indent * 0.75}rem`,
                            cursor: isClickable ? 'pointer' : 'default',
                            background: isActive ? 'rgba(var(--color-accent-rgb, 180,120,60), 0.08)' : 'transparent',
                            borderLeft: isActive ? '2px solid var(--color-accent)' : '2px solid transparent',
                            transition: 'all 100ms',
                          }}
                          onMouseEnter={(e) => { if (isClickable && !isActive) (e.currentTarget as HTMLDivElement).style.background = 'var(--color-paper)' }}
                          onMouseLeave={(e) => { if (isClickable && !isActive) (e.currentTarget as HTMLDivElement).style.background = 'transparent' }}
                        >
                          <span
                            style={{
                              fontFamily: 'var(--font-mono)',
                              fontSize: '0.62rem',
                              color: isActive ? 'var(--color-accent)' : isClickable ? 'var(--color-ink-secondary)' : 'var(--color-ink-faint)',
                              letterSpacing: '0.02em',
                              whiteSpace: 'nowrap',
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                            }}
                          >
                            {indent === 2 ? '└ ' : '├ '}{label}
                          </span>
                        </div>
                      )
                    })}
                  </div>

                  {/* Right: preview pane */}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    {/* Tab bar */}
                    <div
                      className="flex items-center"
                      style={{
                        borderBottom: '1px solid var(--color-paper-border)',
                        background: 'var(--color-paper-dark)',
                        padding: '0 0.75rem',
                      }}
                    >
                      {(
                        [
                          { key: 'soul', label: 'SOUL.md' },
                          { key: 'skill', label: 'SKILL.md' },
                          { key: 'memory', label: 'MEMORY.md' },
                        ] as { key: 'soul' | 'skill' | 'memory'; label: string }[]
                      ).map(({ key, label }) => {
                        const isActive = activeFile === key
                        return (
                          <button
                            key={key}
                            type="button"
                            onClick={() => setActiveFile(key)}
                            style={{
                              fontFamily: 'var(--font-mono)',
                              fontSize: '0.62rem',
                              letterSpacing: '0.08em',
                              padding: '0.4rem 0.6rem',
                              background: 'transparent',
                              border: 'none',
                              borderBottom: isActive ? '2px solid var(--color-accent)' : '2px solid transparent',
                              color: isActive ? 'var(--color-accent)' : 'var(--color-ink-faint)',
                              cursor: 'pointer',
                              transition: 'color 120ms',
                              marginBottom: '-1px',
                            }}
                            onMouseEnter={(e) => { if (!isActive) e.currentTarget.style.color = 'var(--color-ink-muted)' }}
                            onMouseLeave={(e) => { if (!isActive) e.currentTarget.style.color = 'var(--color-ink-faint)' }}
                          >
                            {label}
                          </button>
                        )
                      })}
                      <span
                        style={{
                          fontFamily: 'var(--font-mono)',
                          fontSize: '0.58rem',
                          color: 'var(--color-ink-faint)',
                          letterSpacing: '0.08em',
                          marginLeft: 'auto',
                          paddingRight: '0.25rem',
                        }}
                      >
                        PREVIEW ONLY
                      </span>
                    </div>

                    {/* File content + redaction overlay */}
                    <AnimatePresence mode="wait">
                      <motion.div
                        key={activeFile}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.12 }}
                        style={{ position: 'relative', overflow: 'hidden' }}
                      >
                        {(() => {
                          const content =
                            activeFile === 'soul' ? soulContent
                            : activeFile === 'skill' ? skillContent
                            : memoryContent
                          if (!content) {
                            return (
                              <div
                                style={{
                                  fontFamily: 'var(--font-mono)',
                                  fontSize: '0.72rem',
                                  color: 'var(--color-ink-faint)',
                                  background: 'var(--color-ascii-bg)',
                                  padding: '2rem 1.25rem',
                                  letterSpacing: '0.1em',
                                  textAlign: 'center',
                                }}
                              >
                                {'█'.repeat(3)}&nbsp;
                                <span style={{ color: 'var(--color-accent)', letterSpacing: '0.2em' }}>
                                  [REDACTED — HIRE THIS SOUL TO UNLOCK]
                                </span>
                                &nbsp;{'█'.repeat(3)}
                              </div>
                            )
                          }
                          return (
                            <>
                              <pre
                                style={{
                                  fontFamily: 'var(--font-mono)',
                                  fontSize: '0.75rem',
                                  lineHeight: 1.75,
                                  color: 'var(--color-ink-secondary)',
                                  background: 'var(--color-ascii-bg)',
                                  padding: '1.25rem',
                                  overflowX: 'hidden',
                                  whiteSpace: 'pre-wrap',
                                  wordBreak: 'break-word',
                                  maxHeight: '11.5rem',
                                  overflowY: 'hidden',
                                  margin: 0,
                                }}
                              >
                                {content}
                              </pre>

                              {/* Fade overlay */}
                              <div
                                style={{
                                  position: 'absolute',
                                  bottom: 0,
                                  left: 0,
                                  right: 0,
                                  height: '7rem',
                                  background: `linear-gradient(to bottom, transparent 0%, var(--color-ascii-bg) 55%)`,
                                  pointerEvents: 'none',
                                }}
                              />
                              {/* Redaction bar */}
                              <div
                                style={{
                                  position: 'absolute',
                                  bottom: 0,
                                  left: 0,
                                  right: 0,
                                  padding: '0.5rem 1.25rem 0.75rem',
                                  background: 'var(--color-ascii-bg)',
                                  borderTop: '1px solid var(--color-paper-border)',
                                }}
                              >
                                <div
                                  style={{
                                    fontFamily: 'var(--font-mono)',
                                    fontSize: '0.6rem',
                                    color: 'var(--color-ink-faint)',
                                    letterSpacing: '0.12em',
                                    overflow: 'hidden',
                                    whiteSpace: 'nowrap',
                                    marginBottom: '0.5rem',
                                    userSelect: 'none',
                                  }}
                                >
                                  {'█'.repeat(3)}&nbsp;
                                  <span style={{ color: 'var(--color-accent)', letterSpacing: '0.2em' }}>
                                    [REDACTED — DOWNLOAD TO ACCESS FULL FILE]
                                  </span>
                                  &nbsp;{'█'.repeat(3)}
                                </div>
                                <button
                                  onClick={() => {
                                    const el = document.querySelector('[data-hire-btn]') as HTMLElement
                                    el?.scrollIntoView({ behavior: 'smooth', block: 'center' })
                                  }}
                                  style={{
                                    fontFamily: 'var(--font-mono)',
                                    fontSize: '0.65rem',
                                    letterSpacing: '0.1em',
                                    padding: '0.3rem 0.75rem',
                                    background: 'transparent',
                                    color: 'var(--color-accent)',
                                    border: '1px solid var(--color-accent)',
                                    cursor: 'pointer',
                                    transition: 'all 150ms',
                                  }}
                                  onMouseEnter={(e) => {
                                    e.currentTarget.style.background = 'var(--color-accent)'
                                    e.currentTarget.style.color = 'var(--color-paper)'
                                  }}
                                  onMouseLeave={(e) => {
                                    e.currentTarget.style.background = 'transparent'
                                    e.currentTarget.style.color = 'var(--color-accent)'
                                  }}
                                >
                                  ↓ HIRE THIS SOUL TO UNLOCK
                                </button>
                              </div>
                            </>
                          )
                        })()}
                      </motion.div>
                    </AnimatePresence>
                  </div>
                </div>

                {/* Footer: file list with active highlight */}
                <div
                  className="flex items-center gap-4 px-4 py-2"
                  style={{ background: 'var(--color-paper-dark)' }}
                >
                  {(['soul', 'skill', 'memory'] as const).map((key) => {
                    const label = key === 'soul' ? 'SOUL.md' : key === 'skill' ? 'SKILL.md' : 'MEMORY.md'
                    const isActive = activeFile === key
                    return (
                      <button
                        key={key}
                        type="button"
                        onClick={() => setActiveFile(key)}
                        style={{
                          fontFamily: 'var(--font-mono)',
                          fontSize: '0.62rem',
                          color: isActive ? 'var(--color-accent)' : 'var(--color-ink-faint)',
                          letterSpacing: '0.04em',
                          background: 'transparent',
                          border: 'none',
                          cursor: 'pointer',
                          padding: 0,
                        }}
                      >
                        ▸ {label}
                      </button>
                    )
                  })}
                </div>
              </div>
            </div>

            {/* Ask the Soul */}
            <div>
              {sectionLabel('ASK THE SOUL')}

              {/* Question selector */}
              <div className="space-y-1 mb-4">
                {soul.conversations.map((conv, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => handleConvSwitch(i)}
                    className="w-full text-left px-4 py-3"
                    style={{
                      fontFamily: 'var(--font-body)',
                      fontSize: '0.82rem',
                      background: activeConvIndex === i ? 'var(--color-paper-dark)' : 'var(--color-paper)',
                      border: `1px solid ${activeConvIndex === i ? 'var(--color-ink)' : 'var(--color-paper-border)'}`,
                      color: activeConvIndex === i ? 'var(--color-ink)' : 'var(--color-ink-tertiary)',
                      cursor: 'pointer',
                      transition: 'all 150ms',
                      lineHeight: 1.5,
                    }}
                  >
                    <span style={{ fontFamily: 'var(--font-mono)', color: 'var(--color-ink-faint)', fontSize: '0.7rem', marginRight: '0.5rem' }}>
                      {activeConvIndex === i ? '▸' : '·'}
                    </span>
                    {conv.question}
                  </button>
                ))}
              </div>

              {/* Answer terminal */}
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeConvIndex}
                  initial={{ opacity: 0, y: 4 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  style={{ border: '1px solid var(--color-paper-border)' }}
                >
                  {/* Terminal header */}
                  <div
                    className="flex items-center gap-2 px-4 py-2"
                    style={{ background: 'var(--color-paper-dark)', borderBottom: '1px solid var(--color-paper-border)' }}
                  >
                    <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.65rem', color: 'var(--color-ink-muted)', letterSpacing: '0.06em' }}>
                      {soul.slug} ~ %
                    </span>
                  </div>
                  <div
                    className="p-5 flex gap-4"
                    style={{ background: 'var(--color-ascii-bg)' }}
                  >
                    <div
                      style={{
                        fontFamily: 'var(--font-display)',
                        fontSize: '0.9rem',
                        fontWeight: 500,
                        color: 'var(--color-paper)',
                        background: 'var(--color-accent)',
                        padding: '0.1rem 0.35rem',
                        flexShrink: 0,
                        alignSelf: 'flex-start',
                        marginTop: '0.1rem',
                        lineHeight: 1.2,
                      }}
                    >
                      {initials[0]}
                    </div>
                    <p
                      style={{
                        fontFamily: 'var(--font-body)',
                        fontSize: '0.85rem',
                        lineHeight: 1.85,
                        color: 'var(--color-ink)',
                        whiteSpace: 'pre-line',
                        minHeight: '4rem',
                      }}
                    >
                      <TypewriterText
                        text={soul.conversations[activeConvIndex].answer}
                        trigger={typeTrigger}
                      />
                    </p>
                  </div>
                </motion.div>
              </AnimatePresence>
            </div>
          </div>

          {/* RIGHT SIDEBAR */}
          <div className="p-6 space-y-6" style={{ background: 'var(--color-paper-warm)' }}>

            {/* Action card — sticky */}
            <div
              className="sticky top-20 space-y-5"
            >
              {/* Stats */}
              <div
                style={{
                  border: '1px solid var(--color-paper-border)',
                  background: 'var(--color-paper)',
                }}
              >
                <div
                  className="px-4 py-2"
                  style={{ borderBottom: '1px solid var(--color-paper-border)', background: 'var(--color-paper-dark)' }}
                >
                  <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.62rem', letterSpacing: '0.1em', color: 'var(--color-ink-muted)' }}>
                    METADATA
                  </span>
                </div>
                <div className="px-4 py-3 space-y-2.5">
                  {[
                    ['VERSION', `v${soul.version}`],
                    ['DOWNLOADS', soul.downloads.toLocaleString()],
                    ['UPDATED', soul.lastUpdated.replace(/-/g, '.')],
                  ].map(([k, v]) => (
                    <div key={k} className="flex justify-between items-baseline">
                      <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.62rem', color: 'var(--color-ink-muted)', letterSpacing: '0.08em' }}>{k}</span>
                      <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.72rem', color: 'var(--color-ink-secondary)' }}>{v}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* CTA button */}
              <button
                onClick={async () => {
                  if (downloading) return
                  // 未登录 → 弹出登录框
                  if (!user) {
                    openAuthModal()
                    return
                  }
                  setDownloading(true)
                  setDownloadDone(false)
                  try {
                    await downloadSoulZip(soul)
                    setDownloadDone(true)
                    setTimeout(() => setDownloadDone(false), 3000)
                  } finally {
                    setDownloading(false)
                  }
                }}
                disabled={downloading}
                data-hire-btn
                className="w-full py-3 text-sm font-medium transition-all duration-150 flex items-center justify-center gap-2"
                style={{
                  fontFamily: 'var(--font-mono)',
                  letterSpacing: '0.1em',
                  fontSize: '0.75rem',
                  background: downloadDone ? 'var(--color-accent)' : 'var(--color-ink)',
                  color: 'var(--color-paper)',
                  border: `1px solid ${downloadDone ? 'var(--color-accent)' : 'var(--color-ink)'}`,
                  cursor: downloading ? 'wait' : 'pointer',
                  opacity: downloading ? 0.75 : 1,
                }}
                onMouseEnter={(e) => {
                  if (!downloading && !downloadDone) {
                    e.currentTarget.style.background = 'var(--color-accent)'
                    e.currentTarget.style.borderColor = 'var(--color-accent)'
                    e.currentTarget.style.boxShadow = 'var(--shadow-accent-lg)'
                  }
                }}
                onMouseLeave={(e) => {
                  if (!downloading && !downloadDone) {
                    e.currentTarget.style.background = 'var(--color-ink)'
                    e.currentTarget.style.borderColor = 'var(--color-ink)'
                    e.currentTarget.style.boxShadow = 'none'
                  }
                }}
              >
                {downloading ? (
                  <>
                    <svg className="animate-spin w-3 h-3" viewBox="0 0 24 24" fill="none">
                      <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" strokeOpacity="0.3" />
                      <path d="M12 2a10 10 0 0 1 10 10" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
                    </svg>
                    BUILDING ZIP...
                  </>
                ) : downloadDone ? (
                  '✓ DOWNLOAD STARTED'
                ) : user ? (
                  '↓ HIRE THIS SOUL'
                ) : (
                  '⚿ SIGN IN TO DOWNLOAD'
                )}
              </button>
              <p
                style={{ fontFamily: 'var(--font-mono)', fontSize: '0.62rem', color: 'var(--color-ink-faint)', letterSpacing: '0.06em', textAlign: 'center', lineHeight: 1.6 }}
              >
                Downloads SOUL.md + SKILL.md + MEMORY.md<br />
                as a .zip — drop into Cursor, Claude, or GPT
              </p>

              {/* Tags */}
              <div>
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.62rem', letterSpacing: '0.1em', color: 'var(--color-ink-muted)', display: 'block', marginBottom: '0.5rem' }}>
                  TAGS
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {soul.tags.map((tag) => (
                    <span
                      key={tag}
                      style={{
                        fontFamily: 'var(--font-mono)',
                        fontSize: '0.65rem',
                        color: 'var(--color-ink-tertiary)',
                        border: '1px solid var(--color-paper-border)',
                        padding: '0.1rem 0.4rem',
                        background: 'var(--color-paper)',
                        letterSpacing: '0.04em',
                      }}
                    >
                      #{tag}
                    </span>
                  ))}
                </div>
              </div>

              {/* Version changelog */}
              <VersionTimeline changelog={soul.changelog} />

              {/* Sources */}
              <div style={{ border: '1px solid var(--color-paper-border)', background: 'var(--color-paper)' }}>
                <div className="px-4 py-2" style={{ borderBottom: '1px solid var(--color-paper-border)', background: 'var(--color-paper-dark)' }}>
                  <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.62rem', letterSpacing: '0.1em', color: 'var(--color-ink-muted)' }}>
                    SOURCES
                  </span>
                </div>
                <div className="px-4 py-3 space-y-2">
                  {soul.contentSources.map((src) => (
                    <div key={src} className="flex items-start gap-2">
                      <span style={{ fontFamily: 'var(--font-mono)', color: 'var(--color-accent)', fontSize: '0.65rem', marginTop: '0.15rem', flexShrink: 0 }}>▸</span>
                      <span style={{ fontFamily: 'var(--font-body)', fontSize: '0.75rem', color: 'var(--color-ink-secondary)', lineHeight: 1.55 }}>{src}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Distilled by */}
              <div
                style={{
                  border: '1px solid var(--color-paper-border)',
                  padding: '0.75rem 1rem',
                  background: 'var(--color-paper)',
                }}
              >
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.62rem', color: 'var(--color-ink-muted)', letterSpacing: '0.1em', display: 'block', marginBottom: '0.5rem' }}>
                  DISTILLED BY
                </span>
                <div className="flex items-center gap-2">
                  <div style={{ fontFamily: 'var(--font-display)', fontSize: '0.85rem', fontWeight: 500, color: 'var(--color-paper)', background: 'var(--color-accent)', padding: '0.1rem 0.3rem', letterSpacing: '0.05em' }}>
                    V
                  </div>
                  <div>
                    <p style={{ fontFamily: 'var(--font-display)', fontSize: '0.85rem', color: 'var(--color-ink)', fontWeight: 400 }}>Vessel</p>
                    <p style={{ fontFamily: 'var(--font-mono)', fontSize: '0.65rem', color: 'var(--color-ink-muted)', letterSpacing: '0.06em' }}>SOUL DISTILLATION LAB</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Related Souls */}
        {related.length > 0 && (
          <div className="mt-12">
            <div
              className="flex items-center gap-3 mb-6"
              style={{ borderBottom: '1px solid var(--color-paper-border)', paddingBottom: '0.75rem' }}
            >
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.65rem', letterSpacing: '0.15em', color: 'var(--color-ink-muted)' }}>
                MORE IN {monoLabel(soul.category)}
              </span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-0" style={{ border: '1px solid var(--color-paper-border)' }}>
              {related.map((rel) => {
                const relInitials = rel.name.split(' ').map((n) => n[0]).join('').slice(0, 2)
                return (
                  <Link
                    key={rel.id}
                    to={`/soul/${rel.slug}`}
                    className="block p-5 transition-all duration-150"
                    style={{
                      textDecoration: 'none',
                      borderRight: '1px solid var(--color-paper-border)',
                    }}
                    onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--color-paper-warm)' }}
                    onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent' }}
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <div style={{ fontFamily: 'var(--font-display)', fontSize: '0.8rem', fontWeight: 500, color: 'var(--color-paper)', background: 'var(--color-ink)', padding: '0.1rem 0.25rem', letterSpacing: '0.04em' }}>
                        {relInitials}
                      </div>
                      <div>
                        <p style={{ fontFamily: 'var(--font-display)', fontSize: '0.9rem', color: 'var(--color-ink)', fontWeight: 400 }}>{rel.name}</p>
                        <p style={{ fontFamily: 'var(--font-mono)', fontSize: '0.62rem', color: 'var(--color-ink-muted)', letterSpacing: '0.04em' }}>v{rel.version} · {rel.downloads.toLocaleString()} DL</p>
                      </div>
                    </div>
                    <p style={{ fontFamily: 'var(--font-body)', fontSize: '0.75rem', color: 'var(--color-ink-muted)', lineHeight: 1.6, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                      {rel.description}
                    </p>
                  </Link>
                )
              })}
            </div>
          </div>
        )}
      </div>
    </motion.div>
  )
}
