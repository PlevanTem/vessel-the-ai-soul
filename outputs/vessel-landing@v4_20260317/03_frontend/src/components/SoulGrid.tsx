import { useState, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { souls, categories } from '../data/souls'
import type { Soul } from '../types'

function SoulCard({ soul, index }: { soul: Soul; index: number }) {
  const navigate = useNavigate()
  const [hovered, setHovered] = useState(false)

  const initials = soul.name.split(' ').map((n) => n[0]).join('').slice(0, 2)
  const categorySlug = soul.category.replace(/\s*&\s*/g, '_').replace(/\s+/g, '_').toUpperCase()

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay: index * 0.04, ease: [0.16, 1, 0.3, 1] }}
      onClick={() => navigate(`/soul/${soul.slug}`)}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className="scan-hover relative cursor-pointer"
      style={{
        background: hovered ? 'var(--color-paper-warm)' : 'var(--color-paper)',
        border: `1px solid ${hovered ? 'var(--color-ink)' : 'var(--color-paper-border)'}`,
        boxShadow: hovered ? 'var(--shadow-accent)' : 'none',
        transition: 'background 150ms, border-color 150ms, box-shadow 150ms',
        padding: '1.25rem',
      }}
    >
      {/* Top row: initials + category */}
      <div className="flex items-start justify-between mb-4">
        {/* Initials block */}
        <div
          style={{
            fontFamily: 'var(--font-display)',
            fontWeight: 500,
            fontSize: '1.1rem',
            color: hovered ? 'var(--color-paper)' : 'var(--color-ink)',
            background: hovered ? 'var(--color-ink)' : 'transparent',
            border: '1px solid var(--color-ink)',
            padding: '0.15rem 0.35rem',
            letterSpacing: '0.04em',
            lineHeight: 1,
            transition: 'background 150ms, color 150ms',
          }}
        >
          {initials}
        </div>

        <div className="flex flex-col items-end gap-1">
          {soul.isFeatured && (
            <span
              style={{
                fontFamily: 'var(--font-mono)',
                fontSize: '0.6rem',
                letterSpacing: '0.12em',
                color: 'var(--color-accent)',
                border: '1px solid var(--color-accent)',
                padding: '0.1rem 0.3rem',
              }}
            >
              FEATURED
            </span>
          )}
          <span
            style={{
              fontFamily: 'var(--font-mono)',
              fontSize: '0.6rem',
              color: 'var(--color-ink-faint)',
              letterSpacing: '0.08em',
            }}
          >
            {categorySlug}
          </span>
        </div>
      </div>

      {/* Name */}
      <h3
        className="mb-1"
        style={{
          fontFamily: 'var(--font-display)',
          fontWeight: 400,
          fontSize: 'clamp(0.95rem, 1.1vw, 1.1rem)',
          color: 'var(--color-ink)',
          letterSpacing: '-0.01em',
          lineHeight: 1.15,
        }}
      >
        {soul.name}
      </h3>

      <p
        className="mb-4"
        style={{
          fontFamily: 'var(--font-body)',
          fontSize: '0.75rem',
          color: 'var(--color-ink-tertiary)',
          lineHeight: 1.5,
          letterSpacing: '0.01em',
        }}
      >
        {soul.title}
      </p>

      {/* ASCII separator */}
      <div
        className="mb-4"
        style={{
          fontFamily: 'var(--font-mono)',
          fontSize: '0.55rem',
          color: 'var(--color-ink-faint)',
          letterSpacing: '0',
          overflow: 'hidden',
          whiteSpace: 'nowrap',
        }}
      >
        {'─'.repeat(40)}
      </div>

      {/* Description */}
      <p
        className="mb-4"
        style={{
          fontFamily: 'var(--font-body)',
          fontSize: '0.78rem',
          color: 'var(--color-ink-secondary)',
          lineHeight: 1.7,
          display: '-webkit-box',
          WebkitLineClamp: 3,
          WebkitBoxOrient: 'vertical',
          overflow: 'hidden',
        }}
      >
        {soul.description}
      </p>

      {/* Tags */}
      <div className="flex flex-wrap gap-1.5 mb-4">
        {soul.tags.slice(0, 3).map((tag) => (
          <span
            key={tag}
            style={{
              fontFamily: 'var(--font-mono)',
              fontSize: '0.62rem',
              color: 'var(--color-ink-tertiary)',
              border: '1px solid var(--color-paper-border)',
              padding: '0.1rem 0.35rem',
              letterSpacing: '0.05em',
              background: 'var(--color-paper-dark)',
            }}
          >
            #{tag}
          </span>
        ))}
      </div>

      {/* Stats footer */}
      <div
        className="flex items-center justify-end"
        style={{ borderTop: '1px solid var(--color-paper-border)', paddingTop: '0.75rem' }}
      >
        <span
          style={{
            fontFamily: 'var(--font-mono)',
            fontSize: '0.65rem',
            color: 'var(--color-ink-muted)',
            letterSpacing: '0.04em',
          }}
        >
          {soul.downloads.toLocaleString()} DL
        </span>
      </div>

      {/* Arrow indicator */}
      {hovered && (
        <div
          style={{
            position: 'absolute',
            bottom: '1.25rem',
            right: '1.25rem',
            fontFamily: 'var(--font-mono)',
            fontSize: '0.8rem',
            color: 'var(--color-accent)',
          }}
        >
          →
        </div>
      )}
    </motion.div>
  )
}

export default function SoulGrid() {
  const [activeCategory, setActiveCategory] = useState('All')
  const handleCategory = useCallback((cat: string) => {
    setActiveCategory(cat)
  }, [])

  const filtered = activeCategory === 'All'
    ? souls
    : souls.filter((s) => s.category === activeCategory)

  return (
    <section className="px-6 md:px-12 py-10">
      <div className="max-w-7xl mx-auto">

        {/* Filter bar */}
        <div
          className="flex flex-wrap items-center gap-2 mb-8 pb-6"
          style={{ borderBottom: '1px solid var(--color-paper-border)' }}
        >
          <span
            className="text-xs mr-2 hidden md:block"
            style={{
              fontFamily: 'var(--font-mono)',
              color: 'var(--color-ink-muted)',
              letterSpacing: '0.1em',
            }}
          >
            FILTER:
          </span>

          {categories.map((cat) => {
            const isActive = cat === activeCategory
            return (
              <button
                key={cat}
                type="button"
                onClick={() => handleCategory(cat)}
                style={{
                  fontFamily: 'var(--font-mono)',
                  fontSize: '0.68rem',
                  letterSpacing: '0.08em',
                  padding: '0.25rem 0.75rem',
                  background: isActive ? 'var(--color-ink)' : 'transparent',
                  color: isActive ? 'var(--color-paper)' : 'var(--color-ink-tertiary)',
                  border: `1px solid ${isActive ? 'var(--color-ink)' : 'var(--color-paper-border)'}`,
                  cursor: 'pointer',
                  transition: 'all 150ms',
                }}
                onMouseEnter={(e) => {
                  if (!isActive) {
                    e.currentTarget.style.borderColor = 'var(--color-ink-secondary)'
                    e.currentTarget.style.color = 'var(--color-ink)'
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isActive) {
                    e.currentTarget.style.borderColor = 'var(--color-paper-border)'
                    e.currentTarget.style.color = 'var(--color-ink-tertiary)'
                  }
                }}
              >
                {cat === 'All' ? 'ALL' : cat.toUpperCase()}
              </button>
            )
          })}

          <span
            className="ml-auto"
            style={{
              fontFamily: 'var(--font-mono)',
              fontSize: '0.68rem',
              color: 'var(--color-ink-faint)',
              letterSpacing: '0.08em',
            }}
          >
            {filtered.length} SOUL{filtered.length !== 1 ? 'S' : ''}
          </span>
        </div>

        {/* Grid */}
        <div
          key={activeCategory}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-px"
          style={{ border: '1px solid var(--color-paper-border)' }}
        >
          {filtered.map((soul, i) => (
            <SoulCard key={soul.id} soul={soul} index={i} />
          ))}
        </div>

        {filtered.length === 0 && (
          <div
            className="py-20 text-center"
            style={{
              fontFamily: 'var(--font-mono)',
              fontSize: '0.8rem',
              color: 'var(--color-ink-faint)',
              letterSpacing: '0.1em',
            }}
          >
            [ NO SOULS IN THIS CATEGORY ]
          </div>
        )}
      </div>
    </section>
  )
}
