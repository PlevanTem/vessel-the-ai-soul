import { useEffect, useRef } from 'react'

interface FlowFieldOptions {
  particleCount?: number
  noiseScale?: number
  timeSpeed?: number
  mouseInfluence?: number
}

export function useFlowField(
  canvasRef: React.RefObject<HTMLCanvasElement | null>,
  options: FlowFieldOptions = {}
) {
  const animFrameRef = useRef<number>(0)
  const timeRef = useRef(0)
  const particlesRef = useRef<Float32Array | null>(null)
  const mousePosRef = useRef({ x: 0.5, y: 0.5 })

  useEffect(() => {
    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (prefersReduced) return

    const isMobile = window.innerWidth < 768
    if (isMobile) return

    const canvas = canvasRef.current
    if (!canvas) return

    const glRaw = canvas.getContext('webgl2')
    if (!glRaw) return
    const gl = glRaw

    const {
      particleCount = 3000,
      noiseScale = 0.004,
      timeSpeed = 0.0005,
    } = options

    // Vertex shader — updates particle positions using Perlin-like hash noise
    const vertSrc = `#version 300 es
precision highp float;

in vec2 a_pos;
out vec2 v_pos;

uniform float u_time;
uniform float u_noiseScale;
uniform vec2 u_mouse;
uniform vec2 u_resolution;

// Hash-based pseudo-noise
float hash(vec2 p) {
  p = fract(p * vec2(127.1, 311.7));
  p += dot(p, p + 45.32);
  return fract(p.x * p.y);
}

float noise(vec2 p) {
  vec2 i = floor(p);
  vec2 f = fract(p);
  f = f * f * (3.0 - 2.0 * f);
  float a = hash(i);
  float b = hash(i + vec2(1.0, 0.0));
  float c = hash(i + vec2(0.0, 1.0));
  float d = hash(i + vec2(1.0, 1.0));
  return mix(mix(a, b, f.x), mix(c, d, f.x), f.y);
}

void main() {
  // Angle from noise field
  float angle = noise(a_pos * u_noiseScale + u_time) * 6.28318 * 2.5;
  
  // Mouse influence
  vec2 toMouse = u_mouse - a_pos;
  float mouseDist = length(toMouse);
  float mouseEffect = smoothstep(0.3, 0.0, mouseDist) * 0.3;
  angle += mouseEffect * atan(toMouse.y, toMouse.x);
  
  vec2 velocity = vec2(cos(angle), sin(angle)) * 0.002;
  vec2 newPos = a_pos + velocity;
  
  // Wrap around edges
  newPos = fract(newPos + 1.0);
  
  v_pos = newPos;
  
  // Map to clip space
  vec2 clip = newPos * 2.0 - 1.0;
  clip.y = -clip.y;
  gl_Position = vec4(clip, 0.0, 1.0);
  gl_PointSize = 1.5;
}
`

    const fragSrc = `#version 300 es
precision highp float;
out vec4 fragColor;
in vec2 v_pos;

void main() {
  // Gold color with distance-based alpha
  vec2 center = gl_PointCoord - 0.5;
  float dist = length(center);
  if (dist > 0.5) discard;
  
  float alpha = (1.0 - dist * 2.0) * 0.7;
  // Gold: #B8860B  rgb(184,134,11)
  fragColor = vec4(0.72, 0.525, 0.043, alpha);
}
`

    function createShader(type: number, src: string) {
      const s = gl.createShader(type)!
      gl.shaderSource(s, src)
      gl.compileShader(s)
      return s
    }

    const vert = createShader(gl.VERTEX_SHADER, vertSrc)
    const frag = createShader(gl.FRAGMENT_SHADER, fragSrc)
    const prog = gl.createProgram()!
    gl.attachShader(prog, vert)
    gl.attachShader(prog, frag)
    gl.linkProgram(prog)
    gl.useProgram(prog)

    // Initialize random particle positions
    const positions = new Float32Array(particleCount * 2)
    for (let i = 0; i < particleCount * 2; i++) {
      positions[i] = Math.random()
    }
    particlesRef.current = positions

    const buf = gl.createBuffer()
    gl.bindBuffer(gl.ARRAY_BUFFER, buf)
    gl.bufferData(gl.ARRAY_BUFFER, positions, gl.DYNAMIC_DRAW)

    const aPos = gl.getAttribLocation(prog, 'a_pos')
    gl.enableVertexAttribArray(aPos)
    gl.vertexAttribPointer(aPos, 2, gl.FLOAT, false, 0, 0)

    const uTime = gl.getUniformLocation(prog, 'u_time')
    const uNoiseScale = gl.getUniformLocation(prog, 'u_noiseScale')
    const uMouse = gl.getUniformLocation(prog, 'u_mouse')
    const uResolution = gl.getUniformLocation(prog, 'u_resolution')

    gl.uniform1f(uNoiseScale, noiseScale)
    gl.enable(gl.BLEND)
    gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA)

    function resize() {
      if (!canvas) return
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
      gl.viewport(0, 0, canvas.width, canvas.height)
      gl.uniform2f(uResolution, canvas.width, canvas.height)
    }

    resize()
    window.addEventListener('resize', resize)

    const handleMouse = (e: MouseEvent) => {
      mousePosRef.current = {
        x: e.clientX / window.innerWidth,
        y: e.clientY / window.innerHeight,
      }
    }
    window.addEventListener('mousemove', handleMouse)

    function tick() {
      timeRef.current += timeSpeed
      gl.clearColor(0, 0, 0, 0)
      gl.clear(gl.COLOR_BUFFER_BIT)

      gl.uniform1f(uTime, timeRef.current)
      gl.uniform2f(uMouse, mousePosRef.current.x, mousePosRef.current.y)

      gl.drawArrays(gl.POINTS, 0, particleCount)

      animFrameRef.current = requestAnimationFrame(tick)
    }

    // Pause when tab hidden
    const handleVisibility = () => {
      if (document.hidden) {
        cancelAnimationFrame(animFrameRef.current)
      } else {
        tick()
      }
    }
    document.addEventListener('visibilitychange', handleVisibility)

    tick()

    return () => {
      cancelAnimationFrame(animFrameRef.current)
      window.removeEventListener('resize', resize)
      window.removeEventListener('mousemove', handleMouse)
      document.removeEventListener('visibilitychange', handleVisibility)
      gl.deleteBuffer(buf)
      gl.deleteProgram(prog)
    }
  }, [])
}
