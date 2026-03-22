import { useEffect, useRef } from 'react'

interface Particle {
  x: number
  y: number
  vx: number
  vy: number
  life: number
  maxLife: number
  size: number
}

interface SuccessParticlesProps {
  active: boolean
  originX: number
  originY: number
}

export default function SuccessParticles({ active, originX, originY }: SuccessParticlesProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const animRef = useRef<number>(0)

  useEffect(() => {
    if (!active) return
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    canvas.width = window.innerWidth
    canvas.height = window.innerHeight

    const particles: Particle[] = Array.from({ length: 50 }, () => {
      const angle = Math.random() * Math.PI * 2
      const speed = 2 + Math.random() * 5
      return {
        x: originX,
        y: originY,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - 3,
        life: 0,
        maxLife: 50 + Math.random() * 30,
        size: 2 + Math.random() * 3,
      }
    })

    function draw() {
      if (!ctx || !canvas) return
      ctx.clearRect(0, 0, canvas.width, canvas.height)

      let alive = false
      for (const p of particles) {
        p.x += p.vx
        p.y += p.vy
        p.vy += 0.15 // gravity
        p.life++

        const alpha = Math.max(0, 1 - p.life / p.maxLife)
        if (alpha > 0) {
          alive = true
          ctx.save()
          ctx.globalAlpha = alpha
          ctx.fillStyle = p.life % 3 === 0 ? '#D4A017' : '#B8860B'
          ctx.beginPath()
          ctx.arc(p.x, p.y, p.size * (1 - p.life / p.maxLife / 2), 0, Math.PI * 2)
          ctx.fill()
          ctx.restore()
        }
      }

      if (alive) {
        animRef.current = requestAnimationFrame(draw)
      } else {
        ctx.clearRect(0, 0, canvas.width, canvas.height)
      }
    }

    draw()

    return () => cancelAnimationFrame(animRef.current)
  }, [active, originX, originY])

  if (!active) return null

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      className="fixed inset-0 pointer-events-none"
      style={{ zIndex: 200 }}
    />
  )
}
