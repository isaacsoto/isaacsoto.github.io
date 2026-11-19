function star (ctx, radius, points, step, rotation) {
  ctx.beginPath()
  for (let i = 0; i <= points; i++) {
    const a = rotation + ((i * step) / points) * Math.PI * 2
    const x = Math.cos(a) * radius
    const y = Math.sin(a) * radius
    i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y)
  }
  ctx.stroke()
}

export default {
  title: 'Sigil',
  description: 'Rotating star polygons with a failing signal. Move the mouse to pull it apart.',
  tags: ['canvas', 'geometry'],
  order: 2,

  draw (ctx, s) {
    const { width: w, height: h, time: t } = s
    const size = Math.min(w, h) * 0.38
    const flicker = Math.random() < 0.06
    const spread = s.mouse.inside ? Math.hypot(s.mouse.x - w / 2, s.mouse.y - h / 2) * 0.05 : 0

    ctx.fillStyle = 'rgba(7, 6, 6, 0.3)'
    ctx.fillRect(0, 0, w, h)

    ctx.save()
    ctx.translate(w / 2, h / 2)
    ctx.lineWidth = 1.2

    const layers = [
      { r: 1, n: 7, k: 3, speed: 0.15 },
      { r: 0.72, n: 5, k: 2, speed: -0.25 },
      { r: 0.45, n: 9, k: 4, speed: 0.4 },
    ]

    for (const [i, l] of layers.entries()) {
      const offset = flicker ? (Math.random() - 0.5) * 14 : spread * (i + 1)
      ctx.strokeStyle = '#b3121b'
      star(ctx, size * l.r, l.n, l.k, t * l.speed + offset * 0.01)
      ctx.strokeStyle = `rgba(216, 210, 204, ${flicker ? 0.9 : 0.5})`
      star(ctx, size * l.r + offset, l.n, l.k, t * l.speed)
    }

    ctx.beginPath()
    ctx.arc(0, 0, size * 1.08, 0, Math.PI * 2)
    ctx.strokeStyle = 'rgba(216, 210, 204, 0.25)'
    ctx.stroke()
    ctx.restore()
  },
}
