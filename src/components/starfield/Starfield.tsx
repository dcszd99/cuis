import { useEffect, useRef } from 'react'

interface Star {
  x: number
  y: number
  radius: number
  baseAlpha: number
  phase: number
  twinkleSpeed: number
  vx: number
  vy: number
}

interface StarfieldProps {
  /** 每 10000px² 的星星密度基准 */
  density?: number
  /** 星星数量上限 */
  maxStars?: number
  /** 漂移速度倍率 */
  speed?: number
  /** 是否闪烁 */
  twinkle?: boolean
  /** 是否缓慢漂移 */
  drift?: boolean
  className?: string
}

const REDUCED_MOTION_QUERY = '(prefers-reduced-motion: reduce)'

/**
 * 全屏星空背景。单个 <canvas> 铺满视口，rAF 驱动，按设备/视口自适应粒子数量，
 * 尊重 prefers-reduced-motion，页面隐藏时暂停（见 TECH_DESIGN 4.1 / AGENTS 7.1）。
 */
export default function Starfield({
  density = 0.4,
  maxStars = 320,
  speed = 1,
  twinkle = true,
  drift = true,
  className = '',
}: StarfieldProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const reducedMotion = window.matchMedia(REDUCED_MOTION_QUERY).matches
    const dpr = Math.min(window.devicePixelRatio || 1, 2)

    let width = 0
    let height = 0
    let stars: Star[] = []
    let rafId = 0
    let running = true
    let last = performance.now()

    const makeStar = (): Star => ({
      x: Math.random() * width,
      y: Math.random() * height,
      radius: 0.4 + Math.random() * 1.4,
      baseAlpha: 0.3 + Math.random() * 0.7,
      phase: Math.random() * Math.PI * 2,
      twinkleSpeed: 0.5 + Math.random() * 1.5,
      vx: (Math.random() - 0.5) * 0.04,
      vy: (Math.random() - 0.5) * 0.04,
    })

    const resize = () => {
      width = window.innerWidth
      height = window.innerHeight
      canvas.width = Math.floor(width * dpr)
      canvas.height = Math.floor(height * dpr)
      canvas.style.width = `${width}px`
      canvas.style.height = `${height}px`
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)

      const area = width * height
      const count = Math.min(maxStars, Math.round((area / 10000) * density))
      // 移动端减半，降低绘制负载
      const n = width < 640 ? Math.round(count / 2) : count
      stars = Array.from({ length: n }, makeStar)
    }

    const render = (now: number) => {
      const dt = Math.min((now - last) / 16.67, 2)
      last = now

      ctx.clearRect(0, 0, width, height)

      for (const s of stars) {
        if (!reducedMotion && drift) {
          s.x += s.vx * speed * dt
          s.y += s.vy * speed * dt
          if (s.x < 0) s.x += width
          if (s.x > width) s.x -= width
          if (s.y < 0) s.y += height
          if (s.y > height) s.y -= height
        }

        const alpha =
          !reducedMotion && twinkle
            ? s.baseAlpha *
              (0.6 + 0.4 * Math.sin(s.phase + (now / 1000) * s.twinkleSpeed))
            : s.baseAlpha

        ctx.globalAlpha = alpha
        ctx.fillStyle = '#e5e7eb'
        ctx.beginPath()
        ctx.arc(s.x, s.y, s.radius, 0, Math.PI * 2)
        ctx.fill()
      }

      ctx.globalAlpha = 1
    }

    const loop = (now: number) => {
      if (!running) return
      render(now)
      rafId = requestAnimationFrame(loop)
    }

    const onVisibility = () => {
      if (document.hidden) {
        running = false
        cancelAnimationFrame(rafId)
      } else if (!reducedMotion) {
        running = true
        last = performance.now()
        rafId = requestAnimationFrame(loop)
      }
    }

    resize()
    window.addEventListener('resize', resize)
    document.addEventListener('visibilitychange', onVisibility)

    if (reducedMotion) {
      // 只渲染一帧静态星点，不启动动画循环
      render(performance.now())
    } else {
      rafId = requestAnimationFrame(loop)
    }

    return () => {
      running = false
      cancelAnimationFrame(rafId)
      window.removeEventListener('resize', resize)
      document.removeEventListener('visibilitychange', onVisibility)
    }
  }, [density, maxStars, speed, twinkle, drift])

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      className={`pointer-events-none fixed inset-0 ${className}`}
    />
  )
}
