import { createNoise } from '@/lib/noise'

const BG = '#070606'
const BPM = 90

export default {
  title: 'Breakdown',
  description: 'Ridgelines pulsing at breakdown tempo.',
  tags: ['canvas', 'noise'],
  order: 1,

  setup (ctx, s) {
    s.noise = createNoise(13)
  },

  draw (ctx, s) {
    const { width: w, height: h, time: t } = s
    const rows = 26
    const margin = w * 0.12
    const beat = (1 - ((t * BPM) / 60) % 1) ** 4
    const scale = h / 300

    ctx.fillStyle = BG
    ctx.fillRect(0, 0, w, h)
    ctx.lineWidth = 1

    for (let r = 0; r < rows; r++) {
      const y0 = h * 0.22 + (r / rows) * h * 0.68
      ctx.beginPath()
      ctx.moveTo(margin, y0)
      for (let x = margin; x <= w - margin; x += 3) {
        const center = 1 - Math.abs((x - w / 2) / (w / 2 - margin))
        const amp = center ** 2.5 * (14 + beat * 30) * scale
        ctx.lineTo(x, y0 - s.noise(x * 0.03, r * 0.7 + t * 0.9) * amp)
      }
      // Fill hides the rows behind, the stroke is the visible ridge
      ctx.fillStyle = BG
      ctx.fill()
      ctx.strokeStyle = r === 17 ? '#b3121b' : 'rgba(216, 210, 204, 0.85)'
      ctx.stroke()
    }
  },
}
