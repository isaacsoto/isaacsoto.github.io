import { createNoise } from '@/lib/noise'

const BG = 'rgba(7, 6, 6, 0.22)'

function spawn (s, anywhere = false) {
  return {
    x: Math.random() * s.width,
    y: anywhere ? Math.random() * s.height : s.height + 10,
    rise: 0.15 + Math.random() * 0.6,
    size: 0.6 + Math.random() * 1.8,
    alpha: 0.15 + Math.random() * 0.55,
    ember: Math.random() < 0.12,
  }
}

export default {
  setup (ctx, s) {
    s.noise = createNoise(666)
    const count = Math.floor((s.width * s.height) / 7000)
    s.flakes = Array.from({ length: count }, () => spawn(s, true))
    ctx.fillStyle = '#070606'
    ctx.fillRect(0, 0, s.width, s.height)
  },

  draw (ctx, s) {
    ctx.fillStyle = BG
    ctx.fillRect(0, 0, s.width, s.height)

    for (const f of s.flakes) {
      const angle = s.noise(f.x * 0.003, f.y * 0.003 + s.time * 0.05) * Math.PI * 4
      f.x += Math.cos(angle) * 0.35
      f.y += Math.sin(angle) * 0.2 - f.rise

      if (s.mouse.inside) {
        const dx = f.x - s.mouse.x
        const dy = f.y - s.mouse.y
        const d2 = dx * dx + dy * dy
        if (d2 < 12_000) {
          f.x += dx * 0.02
          f.y += dy * 0.02
        }
      }

      if (f.y < -10 || f.x < -10 || f.x > s.width + 10) {
        Object.assign(f, spawn(s))
      }

      ctx.fillStyle = f.ember
        ? `rgba(220, 30, 30, ${f.alpha})`
        : `rgba(190, 180, 172, ${f.alpha * 0.6})`
      ctx.fillRect(f.x, f.y, f.size, f.size)
    }
  },
}
