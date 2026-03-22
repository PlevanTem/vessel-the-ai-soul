import { useEffect, useRef } from 'react'

export function useTypewriter(text: string, speed = 22) {
  const displayRef = useRef('')
  const indexRef = useRef(0)
  const timerRef = useRef<number>(0)

  return {
    start: (onUpdate: (t: string) => void, onDone?: () => void) => {
      clearInterval(timerRef.current)
      displayRef.current = ''
      indexRef.current = 0

      timerRef.current = window.setInterval(() => {
        if (indexRef.current < text.length) {
          displayRef.current += text[indexRef.current]
          indexRef.current++
          onUpdate(displayRef.current)
        } else {
          clearInterval(timerRef.current)
          onDone?.()
        }
      }, speed)
    },
    stop: () => clearInterval(timerRef.current),
  }
}

export function useIntersectionObserver(
  ref: React.RefObject<Element | null>,
  options: IntersectionObserverInit = {}
) {
  const inViewRef = useRef(false)

  useEffect(() => {
    const el = ref.current
    if (!el) return

    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting && !inViewRef.current) {
        inViewRef.current = true
      }
    }, { threshold: 0.15, ...options })

    observer.observe(el)
    return () => observer.disconnect()
  }, [ref, options])

  return inViewRef
}
