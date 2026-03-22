import { useRef } from 'react'
import { useFlowField } from '../hooks/useFlowField'

export default function FlowField() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  useFlowField(canvasRef)

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      className="fixed inset-0 w-full h-full pointer-events-none"
      style={{
        zIndex: 0,
        opacity: 0.55,
        mixBlendMode: 'screen',
      }}
    />
  )
}
