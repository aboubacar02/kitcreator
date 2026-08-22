import { useEffect, useRef } from 'react'

const COLORS = ['249,115,22', '14,165,233']
const GRID_GAP = 30
const REPEL_RADIUS = 110
const GLOW_RADIUS = 220

export default function AnimatedBackground() {
  const canvasRef = useRef(null)
  const containerRef = useRef(null)

  useEffect(() => {
    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')
    let raf
    let width = 0
    let height = 0
    let particles = []

    function buildGrid() {
      particles = []
      for (let x = GRID_GAP / 2; x < width; x += GRID_GAP) {
        for (let y = GRID_GAP / 2; y < height; y += GRID_GAP) {
          particles.push({
            ox: x,
            oy: y,
            x,
            y,
            vx: 0,
            vy: 0,
            color: COLORS[Math.random() > 0.35 ? 0 : 1],
          })
        }
      }
    }

    function resize() {
      const dpr = Math.min(window.devicePixelRatio || 1, 2)
      width = window.innerWidth
      height = window.innerHeight
      canvas.width = width * dpr
      canvas.height = height * dpr
      canvas.style.width = `${width}px`
      canvas.style.height = `${height}px`
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
      buildGrid()
    }

    const target = { x: window.innerWidth / 2, y: window.innerHeight / 3 }
    const main = { ...target }
    const trail = { ...target }

    const onMove = (e) => {
      // Les zones de travail restent calmes : le fond réagit seulement autour de l'interface.
      if (e.target.closest('[data-background-lock]')) return
      target.x = e.clientX
      target.y = e.clientY
    }

    function tick() {
      main.x += (target.x - main.x) * 0.14
      main.y += (target.y - main.y) * 0.14
      trail.x += (target.x - trail.x) * 0.045
      trail.y += (target.y - trail.y) * 0.045

      const el = containerRef.current
      if (el) {
        el.style.setProperty('--mx', `${main.x}px`)
        el.style.setProperty('--my', `${main.y}px`)
        el.style.setProperty('--tx', `${trail.x}px`)
        el.style.setProperty('--ty', `${trail.y}px`)
      }

      ctx.clearRect(0, 0, width, height)

      const rr = REPEL_RADIUS
      const gr = GLOW_RADIUS

      for (let i = 0; i < particles.length; i++) {
        const p = particles[i]

        const dx = p.ox - main.x
        const dy = p.oy - main.y
        const distSq = dx * dx + dy * dy
        if (distSq < rr * rr) {
          const dist = Math.sqrt(distSq) || 1
          const force = (rr - dist) / rr
          p.vx += (dx / dist) * force * 1.5
          p.vy += (dy / dist) * force * 1.5
        }

        p.vx += (p.ox - p.x) * 0.05
        p.vy += (p.oy - p.y) * 0.05
        p.vx *= 0.85
        p.vy *= 0.85
        p.x += p.vx
        p.y += p.vy

        const mdx = p.x - main.x
        const mdy = p.y - main.y
        const mdistSq = mdx * mdx + mdy * mdy
        let glow = 0
        if (mdistSq < gr * gr) {
          glow = 1 - Math.sqrt(mdistSq) / gr
        }

        ctx.fillStyle = `rgba(${p.color},${(0.18 + glow * 0.7).toFixed(3)})`
        ctx.beginPath()
        ctx.arc(p.x, p.y, glow > 0 ? 1 + glow : 1, 0, 6.283185)
        ctx.fill()
      }

      raf = requestAnimationFrame(tick)
    }

    resize()
    window.addEventListener('resize', resize)
    window.addEventListener('pointermove', onMove)
    raf = requestAnimationFrame(tick)

    return () => {
      window.removeEventListener('resize', resize)
      window.removeEventListener('pointermove', onMove)
      cancelAnimationFrame(raf)
    }
  }, [])

  return (
    <div
      ref={containerRef}
      className="pointer-events-none fixed inset-0 z-0 overflow-hidden bg-[#09090b]"
    >
      <div className="animate-nebula-breathe absolute inset-0 bg-[radial-gradient(ellipse_at_20%_20%,rgba(249,115,22,0.10),transparent_50%),radial-gradient(ellipse_at_80%_80%,rgba(14,165,233,0.08),transparent_50%),radial-gradient(ellipse_at_60%_30%,rgba(249,115,22,0.06),transparent_45%)]" />

      <div className="absolute inset-0 bg-[radial-gradient(600px_circle_at_var(--mx)_var(--my),rgba(249,115,22,0.20),transparent_75%)]" />

      <div className="absolute inset-0 bg-[radial-gradient(480px_circle_at_var(--tx)_var(--ty),rgba(59,130,246,0.14),transparent_75%)]" />

      <canvas ref={canvasRef} className="absolute inset-0" />

      <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] [background-size:56px_56px]" />
    </div>
  )
}
