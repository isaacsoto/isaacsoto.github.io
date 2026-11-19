import { createNoise } from '@/lib/noise'

const LIFESPAN = 12

function setup (ctx, s) {
  s.noise = createNoise(Math.floor(Math.random() * 10_000))
  s.born = s.time
  s.walkers = Array.from({ length: 600 }, () => ({
    x: Math.random() * s.width,
    y: Math.random() * s.height,
    red: Math.random() < 0.2,
  }))
  ctx.fillStyle = '#070606'
  ctx.fillRect(0, 0, s.width, s.height)
}

export default {
  title: 'Rot',
  description: 'Flow field trails spreading like decay, then wiped and regrown.',
  tags: ['canvas', 'flow field'],
  order: 3,
  setup,

  draw (ctx, s) {
    if (s.time - s.born > LIFESPAN) {
      setup(ctx, s)
    }

    for (const p of s.walkers) {
      const angle = s.noise(p.x * 0.006, p.y * 0.006) * Math.PI * 6
      const nx = p.x + Math.cos(angle)
      const ny = p.y + Math.sin(angle)

      ctx.strokeStyle = p.red ? 'rgba(179, 18, 27, 0.25)' : 'rgba(216, 210, 204, 0.06)'
      ctx.beginPath()
      ctx.moveTo(p.x, p.y)
      ctx.lineTo(nx, ny)
      ctx.stroke()

      p.x = nx
      p.y = ny
      if (p.x < 0 || p.x > s.width || p.y < 0 || p.y > s.height) {
        p.x = Math.random() * s.width
        p.y = Math.random() * s.height
      }
    }
  },
}
