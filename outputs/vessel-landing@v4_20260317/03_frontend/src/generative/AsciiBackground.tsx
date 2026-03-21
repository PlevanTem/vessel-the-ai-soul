import { useEffect, useRef } from 'react'

// ASCII art character set — ordered by visual density (light to heavy)
const ASCII_CHARS = ' .\'`^",:;Il!i><~+_-?][}{1)(|/tfjrxnuvczXYUJCLQ0OZmwqpdbkhao*#MW&8%B@$'
// Sparse decorative set for ambient mode
const SPARSE_CHARS = ' ·∙•◦○◎□▫▪░▒'

interface AsciiBackgroundProps {
  density?: 'sparse' | 'normal'
}

export default function AsciiBackground({ density = 'sparse' }: AsciiBackgroundProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const animRef = useRef<number>(0)

  useEffect(() => {
    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (prefersReduced) return

    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const chars = density === 'sparse' ? SPARSE_CHARS : ASCII_CHARS
    const fontSize = density === 'sparse' ? 14 : 11
    const cols = Math.floor(window.innerWidth / (fontSize * 0.6))
    const rows = Math.floor(window.innerHeight / fontSize)

    // Each cell has a char and a fade value
    type Cell = { char: string; opacity: number; targetOpacity: number; changeTimer: number }
    const grid: Cell[][] = Array.from({ length: rows }, () =>
      Array.from({ length: cols }, () => ({
        char: chars[Math.floor(Math.random() * chars.length)],
        opacity: Math.random() * 0.08,
        targetOpacity: Math.random() * 0.07 + 0.01,
        changeTimer: Math.floor(Math.random() * 200),
      }))
    )

    function resize() {
      if (!canvas) return
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
    }
    resize()
    window.addEventListener('resize', resize)

    let frame = 0
    function tick() {
      if (!ctx || !canvas) return
      ctx.clearRect(0, 0, canvas.width, canvas.height)

      ctx.font = `${fontSize}px "IBM Plex Mono", monospace`

      for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
          const cell = grid[r][c]

          // Slowly drift opacity
          if (cell.opacity < cell.targetOpacity) {
            cell.opacity = Math.min(cell.opacity + 0.003, cell.targetOpacity)
          } else {
            cell.opacity = Math.max(cell.opacity - 0.002, 0)
            if (cell.opacity <= 0) {
              cell.targetOpacity = Math.random() * 0.07 + 0.01
              cell.changeTimer = Math.floor(Math.random() * 300) + 60
            }
          }

          // Occasionally change character
          cell.changeTimer--
          if (cell.changeTimer <= 0) {
            cell.char = chars[Math.floor(Math.random() * chars.length)]
            cell.changeTimer = Math.floor(Math.random() * 400) + 100
          }

          if (cell.opacity > 0.003) {
            ctx.globalAlpha = cell.opacity
            ctx.fillStyle = '#2C2C2A'
            ctx.fillText(cell.char, c * fontSize * 0.6, r * fontSize)
          }
        }
      }

      ctx.globalAlpha = 1
      frame++
      animRef.current = requestAnimationFrame(tick)
    }

    // Stagger start by 2 frames to avoid blocking initial render
    setTimeout(tick, 100)

    const handleVisibility = () => {
      if (document.hidden) cancelAnimationFrame(animRef.current)
      else tick()
    }
    document.addEventListener('visibilitychange', handleVisibility)

    return () => {
      cancelAnimationFrame(animRef.current)
      window.removeEventListener('resize', resize)
      document.removeEventListener('visibilitychange', handleVisibility)
    }
  }, [density])

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      className="fixed inset-0 w-full h-full pointer-events-none"
      style={{ zIndex: 0, mixBlendMode: 'multiply' }}
    />
  )
}
