import { createRandom } from '@/lib/random'
import { growThorns } from '@/lib/thorns'

const INK = '#d8d2cc'
const STEPS_PER_FRAME = 4
const HALF_PI = Math.PI / 2

/**
 * Procedural deathcore logo: lays out the letters, carves inward thorns
 * into them, then grows thorns, spikes, horns and tails out of the letter
 * outlines. Every branch is a tapered ribbon rooted inside a stroke.
 *
 * - symmetry: 'x' mirrors left/right, 'xy' also top/bottom. Growth is only
 *   spawned in the source half/quadrant and mirrored from there.
 * - arc: 0 sets letters in straight lines. Above 0, every line is fanned
 *   around a point below the logo (the value is the top line's span in
 *   radians) and letters get equal slots, squeezed to fit.
 * - caps: 'edges' (first/last letter upper), 'upper', 'lower' or 'none'.
 * - emblem: false, 'ring' (sigil behind the text) or 'star' (below it).
 * - blades: fewer, thicker, sharper spikes instead of hairy thorns.
 * - distort: 0..1, mirrored per-letter shear, tilt, offsets and widths.
 * - density: multiplier for how many thorns, spikes, side thorns and arches grow.
 * - curliness: multiplier for how much thorns bend and hook (horns keep theirs).
 * - carve: inward thorns cut into each letter.
 * - thornStyle: 'shaped' grows curved, slim, branching thorns (see lib/thorns.js);
 *   'hair' keeps the older thin ribbon thorns.
 *
 * @param {import('@/types').LogoOptions} options
 * @returns {import('@/types').Sketch}
 */
export function createDeathLogo ({
  lines = ['Logo'],
  font = '"Manufacturing Consent"',
  weight = 400,
  stretch = 1.6,
  tracking = 0,
  symmetry = 'xy',
  arc = 0,
  caps = 'edges',
  edgeScale = 1.45,
  emblem = false,
  blades = false,
  tails = false,
  distort = 0.6,
  carve = 2,
  density = 1,
  curliness = 1,
  thornStyle = 'shaped',
  seed = 666,
  regrow = 0,
}) {
  const fontAt = size => `${weight} ${size}px ${font}`

  function glyphsFor (line) {
    const chars = [...line]
    const n = chars.length
    return chars.map((ch, i) => {
      const edge = n > 1 ? Math.abs(i / (n - 1) - 0.5) * 2 : 1
      const upper = caps === 'upper' || (caps === 'edges' && (i === 0 || i === n - 1))
      const lower = caps === 'lower' || (caps === 'edges' && !upper)
      return {
        ch: upper ? ch.toUpperCase() : (lower ? ch.toLowerCase() : ch),
        scale: 1 + (edgeScale - 1) * edge ** 3,
      }
    })
  }

  function measure (ctx, glyphLines) {
    ctx.textAlign = 'center'
    ctx.textBaseline = 'alphabetic'
    for (const g of glyphLines.flat()) {
      const em = 100 * g.scale
      ctx.font = fontAt(em)
      const m = ctx.measureText(g.ch)
      g.width = m.width + tracking * 100
      // Offset that centres the visible ink (not the em box) on the glyph origin
      g.inkX = (m.actualBoundingBoxRight - m.actualBoundingBoxLeft) / 2 / em
      g.inkY = (m.actualBoundingBoxDescent - m.actualBoundingBoxAscent) / 2 / em
    }
  }

  function linearLayout (ctx, s) {
    const glyphLines = lines.map(line => glyphsFor(line))
    measure(ctx, glyphLines)
    const lineGap = 0.95
    const widest = Math.max(...glyphLines.map(gl => gl.reduce((sum, g) => sum + g.width, 0)))
    const tallest = (1 + Math.max(...glyphLines.flat().map(g => g.scale))) / 2
    const fill = lines.length > 1 ? 0.5 : 0.42
    const size = Math.min(
      (s.width * 0.8) / widest * 100,
      (s.height * fill) / (lines.length * stretch * lineGap * tallest),
    )
    const cx = s.width / 2
    const cy = s.height / 2
    const lineHeight = size * stretch * lineGap * tallest
    const glyphs = []
    for (const [i, gl] of glyphLines.entries()) {
      const y = cy + (i - (lines.length - 1) / 2) * lineHeight
      let x = cx - gl.reduce((sum, g) => sum + g.width, 0) * size / 200
      for (const g of gl) {
        const w = g.width * size / 100
        glyphs.push({ ch: g.ch, inkX: g.inkX, inkY: g.inkY, line: i, x: x + w / 2, y, rot: 0, sx: 1, size: size * g.scale })
        x += w
      }
    }
    return { glyphs, size, cx, cy, blockHeight: lines.length * lineHeight, starY: cy + lines.length * lineHeight / 2 + size * 0.35 }
  }

  function arcLayout (ctx, s) {
    const glyphLines = lines.map(line => glyphsFor(line))
    measure(ctx, glyphLines)
    const n = lines.length
    const longest = Math.max(...glyphLines.map(gl => gl.length))
    const lineHeight = Math.min(s.height * 0.36 / n, s.width * 0.8 / longest * 1.3)
    const size = lineHeight / (stretch * 0.75)
    const cx = s.width / 2
    const r0 = (s.width * 0.4) / Math.sin(arc / 2)
    // Line width follows letter count, every letter gets an equal slot
    const rows = glyphLines.map((gl, i) => {
      const radius = r0 - i * lineHeight * 1.05
      const chord = s.width * 0.78 * (gl.length / longest) ** 0.8
      return { gl, radius, span: 2 * Math.asin(Math.min(1, chord / 2 / radius)) }
    })

    // Place the pivot so the fanned block sits around the centre
    const last = rows.at(-1)
    const top = r0 + lineHeight / 2
    const bottom = last.radius * Math.cos(last.span / 2) - lineHeight / 2
    const py = s.height * 0.5 + (top + bottom) / 2

    const glyphs = []
    for (const [i, { gl, radius, span }] of rows.entries()) {
      const slot = span / gl.length
      for (const [j, g] of gl.entries()) {
        const a = -span / 2 + slot * (j + 0.5)
        // Letters are stretched or squeezed to fill their slot and touch
        const fit = (radius * slot * 1.08) / ((g.width - tracking * 100) * size * g.scale / 100)
        glyphs.push({
          ch: g.ch,
          inkX: g.inkX,
          inkY: g.inkY,
          line: i,
          x: cx + Math.sin(a) * radius,
          y: py - Math.cos(a) * radius,
          rot: a,
          sx: Math.min(1.5, Math.max(0.55, fit)),
          size: size * g.scale,
        })
      }
    }
    return {
      glyphs,
      size,
      cx,
      cy: s.height / 2,
      blockHeight: n * lineHeight,
      starY: py - last.radius + lineHeight * 0.55 + size * 0.3,
    }
  }

  // Letters are paired with their mirror (first/last, second/second-last...)
  // and get mirrored distortions, so the word stays symmetric
  function distortGlyphs (glyphs, rand) {
    const spread = amount => (rand() - 0.5) * amount
    const lineCount = Math.max(...glyphs.map(g => g.line)) + 1
    for (let line = 0; line < lineCount; line++) {
      const row = glyphs.filter(g => g.line === line)
      for (let j = 0; j < Math.ceil(row.length / 2); j++) {
        const a = row[j]
        const b = row.at(-1 - j)
        const solo = a === b
        const d = {
          shear: solo ? 0 : spread(0.7) * distort,
          tilt: solo ? 0 : spread(0.25) * distort,
          ox: solo ? 0 : spread(0.2) * distort * a.size,
          oy: spread(0.25) * distort * a.size,
          widen: 1 + spread(0.4) * distort,
        }
        Object.assign(a, { ...d, sx: a.sx * d.widen })
        if (!solo) {
          Object.assign(b, { ...d, shear: -d.shear, tilt: -d.tilt, ox: -d.ox, sx: b.sx * d.widen })
        }
      }
    }
  }

  function drawText (ctx, l, knockout = 0) {
    const pass = (mode, paint) => {
      ctx.save()
      ctx.globalCompositeOperation = mode
      for (const g of l.glyphs) {
        ctx.save()
        ctx.font = fontAt(g.size)
        ctx.translate(g.x, g.y)
        ctx.rotate(g.rot + g.tilt)
        ctx.translate(g.ox, g.oy)
        ctx.transform(1, 0, g.shear, 1, 0, 0)
        ctx.scale(g.sx, stretch)
        paint(g)
        ctx.restore()
      }
      ctx.restore()
    }

    const ink = g => [-g.inkX * g.size, -g.inkY * g.size]

    ctx.save()
    ctx.textAlign = 'center'
    ctx.textBaseline = 'alphabetic'
    ctx.lineJoin = 'round'
    ctx.fillStyle = INK
    // Cut a gap around the letters so the emblem lines don't touch them
    if (knockout) {
      ctx.lineWidth = knockout
      pass('destination-out', g => ctx.strokeText(g.ch, ...ink(g)))
    }
    pass('source-over', g => ctx.fillText(g.ch, ...ink(g)))
    ctx.restore()
  }

  function drawRing (ctx, l) {
    const unit = l.size / 100
    const r = l.blockHeight * 0.72
    const inner = r * 0.84
    ctx.save()
    ctx.translate(l.cx, l.cy)
    ctx.lineWidth = unit * 2
    for (const radius of [r, inner]) {
      ctx.beginPath()
      ctx.arc(0, 0, radius, 0, Math.PI * 2)
      ctx.stroke()
    }
    for (const flip of [1, -1]) {
      ctx.beginPath()
      for (let i = 0; i < 3; i++) {
        const a = flip * HALF_PI + (i * Math.PI * 2) / 3
        ctx.lineTo(Math.cos(a) * inner, Math.sin(a) * inner)
      }
      ctx.closePath()
      ctx.stroke()
    }
    ctx.beginPath()
    ctx.moveTo(0, -r * 1.25)
    ctx.lineTo(0, r * 1.25)
    ctx.moveTo(-r * 1.1, 0)
    ctx.lineTo(r * 1.1, 0)
    ctx.stroke()
    ctx.restore()
  }

  function starAnchor (l) {
    return { x: l.cx, y: l.starY, r: l.size * 0.3 }
  }

  function drawStar (ctx, l) {
    const { x, y, r } = starAnchor(l)
    ctx.save()
    ctx.translate(x, y)
    ctx.lineWidth = l.size * 0.035
    ctx.lineJoin = 'miter'
    ctx.beginPath()
    for (let i = 0; i <= 5; i++) {
      const a = HALF_PI + (i * 2 * Math.PI * 2) / 5
      ctx.lineTo(Math.cos(a) * r, Math.sin(a) * r)
    }
    ctx.stroke()
    ctx.restore()
  }

  // Offscreen copy of the letters, used to find their outlines
  function createMask (s, l) {
    const off = document.createElement('canvas')
    off.width = Math.ceil(s.width)
    off.height = Math.ceil(s.height)
    const ctx = off.getContext('2d', { willReadFrequently: true })
    drawText(ctx, l)
    return ctx
  }

  function sampleEdges (mask) {
    const { width: w, height: h } = mask.canvas
    const { data } = mask.getImageData(0, 0, w, h)
    const solid = (x, y) => {
      x = Math.round(x)
      y = Math.round(y)
      return x >= 0 && y >= 0 && x < w && y < h && data[(y * w + x) * 4 + 3] > 128
    }
    const step = 2
    const all = []
    for (let y = 0; y < h; y += step) {
      for (let x = 0; x < w; x += step) {
        if (solid(x, y) && (!solid(x + step, y) || !solid(x - step, y) || !solid(x, y + step) || !solid(x, y - step))) {
          all.push({ x, y })
        }
      }
    }
    return { all, solid }
  }

  // Outward normal, stroke thickness and how much of a tip this edge point is
  function analyse (edges, p, radius) {
    const r = Math.max(3, Math.round(radius))
    let sx = 0
    let sy = 0
    let count = 0
    let total = 0
    for (let dy = -r; dy <= r; dy++) {
      for (let dx = -r; dx <= r; dx++) {
        if (dx * dx + dy * dy > r * r) {
          continue
        }
        total++
        if (edges.solid(p.x + dx, p.y + dy)) {
          count++
          sx += dx
          sy += dy
        }
      }
    }
    const len = Math.hypot(sx, sy) || 1
    const nx = -sx / len
    const ny = -sy / len
    let thick = 0
    while (thick < r * 6 && edges.solid(p.x - nx * thick, p.y - ny * thick)) {
      thick++
    }
    return { x: p.x, y: p.y, nx, ny, fill: count / total, thick }
  }

  function nearestEdge (edges, x, y) {
    let best = null
    let bestD = Infinity
    for (const p of edges.all) {
      const d = (p.x - x) ** 2 + (p.y - y) ** 2
      if (d < bestD) {
        bestD = d
        best = p
      }
    }
    return best && { x: best.x, y: best.y, d: Math.sqrt(bestD) }
  }

  function features (s, l, edges, count) {
    const quad = symmetry === 'xy'
    const source = edges.all.filter(p => p.x <= l.cx && (!quad || p.y <= l.cy))
    const pick = () => source[Math.floor(s.rand() * source.length)]
    return source.length === 0 ? [] : Array.from({ length: Math.min(count, source.length) }, () => analyse(edges, pick(), l.size * 0.06))
  }

  /**
   * Builds a branch rooted at edge feature `f`. `depth` is how far the root
   * sits from the edge along its normal (negative = inside the stroke).
   * Mirrored copies snap onto the nearest real edge and take the same depth
   * along that edge's own normal, or the branch is dropped.
   */
  function rootBranch (s, l, edges, f, b, depth) {
    const flips = symmetry === 'xy' ? [[true, false], [false, true], [true, true]] : [[true, false]]
    const x = f.x + f.nx * depth
    const y = f.y + f.ny * depth
    const copies = [{ fx: false, fy: false, ox: 0, oy: 0 }]
    for (const [fx, fy] of flips) {
      const ex = fx ? s.width - f.x : f.x
      const ey = fy ? 2 * l.cy - f.y : f.y
      const snap = nearestEdge(edges, ex, ey)
      if (!snap || snap.d > l.size * 0.5) {
        return null
      }
      const n = analyse(edges, snap, l.size * 0.06)
      const mx = fx ? s.width - x : x
      const my = fy ? 2 * l.cy - y : y
      copies.push({ fx, fy, ox: snap.x + n.nx * depth - mx, oy: snap.y + n.ny * depth - my })
    }
    return { jitter: blades ? 0.03 : 0.06, curl: 0, bend: 0, thorns: true, flare: 0.5, age: 0, ...b, x, y, copies }
  }

  function spawnCarves (s, l, edges) {
    const rand = s.rand
    const unit = l.size / 100
    const sides = features(s, l, edges, 600).filter(f => f.fill > 0.35 && f.fill < 0.7 && f.thick > unit * 4)
    const share = symmetry === 'xy' ? 4 : 2
    const count = Math.round(carve * l.glyphs.length / share)
    const carves = []
    for (let i = 0; i < count && sides.length > 0; i++) {
      const f = sides[Math.floor(rand() * sides.length)]
      const side = rand() < 0.5 ? -1 : 1
      const width = Math.min(f.thick * 0.85, unit * 14)
      // Enter diagonally and hook slightly, like a thorn turned inwards
      const b = rootBranch(s, l, edges, f, {
        angle: Math.atan2(-f.ny, -f.nx) + side * (0.8 + rand() * 0.35),
        width,
        taper: 0.9,
        life: Math.max(6, Math.round(f.thick * 2 / (unit * 1.6))),
        curl: side * 0.015,
        bend: side * 0.0015,
        jitter: 0,
        thorns: false,
        flare: 0,
      }, width * 0.2)
      if (b) {
        carves.push(b)
      }
    }
    return carves
  }

  function spawn (s, l, edges) {
    const rand = s.rand
    const unit = l.size / 100
    const quad = symmetry === 'xy'
    const spread = amount => (rand() - 0.5) * amount
    const outward = x => (x - l.cx) / (s.width / 2)
    const thick = blades ? 1.5 : 1
    const scale = (quad ? 0.45 : 0.6) * density
    const branches = []
    const all = features(s, l, edges, 700)
    if (all.length === 0) {
      return branches
    }

    const tips = all.filter(f => f.fill < 0.38)
    const up = f => f.ny < -0.35
    const down = f => f.ny > 0.35
    const pick = list => list[Math.floor(rand() * list.length)]
    const fromTip = () => (tips.length > 0 && rand() < 0.8 ? pick(tips) : pick(all))

    // Blend the stroke's own direction with a growth direction
    const aim = (f, bias, mix) => Math.atan2(f.ny * (1 - mix) + Math.sin(bias) * mix, f.nx * (1 - mix) + Math.cos(bias) * mix)

    // Roots start inside the stroke and are never wider than it
    function add (f, b) {
      const width = Math.min(b.width, Math.max(unit * 2, f.thick * 0.9))
      const branch = rootBranch(s, l, edges, f, { ...b, width }, -width * 0.8)
      if (branch) {
        branches.push(branch)
      }
    }

    function distinct (list, count) {
      const chosen = []
      for (const f of list) {
        if (chosen.every(c => Math.abs(c.x - f.x) > l.size * 0.15)) {
          chosen.push(f)
        }
        if (chosen.length === count) {
          break
        }
      }
      return chosen
    }

    // `bend` changes the curl every step, so branches hook and S-curve
    for (let i = 0; i < 70 * scale && thornStyle === 'hair'; i++) {
      const f = fromTip()
      const lean = outward(f.x)
      let bias = Math.atan2(f.ny, f.nx)
      if (up(f)) {
        bias = -HALF_PI + lean * 0.7
      } else if (down(f)) {
        bias = HALF_PI + lean * 0.6
      }
      add(f, {
        angle: aim(f, bias + spread(0.6), 0.45),
        width: unit * (5 + rand() * 8) * thick,
        taper: (blades ? 0.94 : 0.955) + rand() * 0.02,
        life: (down(f) ? 15 : 25) + rand() * (down(f) && quad ? 30 : 55),
        curl: (spread(0.06) + Math.sign(lean) * 0.012) * curliness,
        bend: spread(0.004) * curliness,
      })
    }

    // Stroke ends extended into straight spikes along their own angle
    const vertical = tips.filter(f => Math.abs(f.ny) > 0.6)
    for (let i = 0; i < 16 * scale && vertical.length > 0 && thornStyle === 'hair'; i++) {
      const f = pick(vertical)
      add(f, {
        angle: aim(f, Math.sign(f.ny) * HALF_PI, 0.5),
        width: unit * (7 + rand() * 5) * thick,
        taper: 0.93,
        life: 30,
        jitter: 0.02,
        thorns: false,
      })
    }

    // Horns from the outermost upward tips, curling back in
    const hornTips = distinct(tips.filter(f => up(f)).toSorted((a, b) => a.x - b.x), 3)
    for (const [i, f] of hornTips.entries()) {
      add(f, {
        angle: aim(f, -HALF_PI - 0.7 - rand() * 0.3, 0.6),
        width: unit * (18 - i * 5),
        taper: 0.982 + i * 0.003,
        life: 120 - i * 25,
        curl: 0.018 + rand() * 0.008,
        bend: 0.0002,
        jitter: 0.03,
      })
    }

    // Tails from the lowest outer tips, sweeping out and flicking back up
    if (tails) {
      const tailTips = distinct(tips.filter(f => down(f)).toSorted((a, b) => (a.x - a.y) - (b.x - b.y)), 2)
      for (const [i, f] of tailTips.entries()) {
        add(f, {
          angle: aim(f, Math.PI - 0.9 - i * 0.3, 0.6),
          width: unit * (16 - i * 6),
          taper: 0.988,
          life: 150 - i * 40,
          curl: 0.004 + i * 0.004,
          bend: 0.0003,
          jitter: 0.02,
        })
      }
    }

    // Arches from upward edges, crossing towards the centre
    if (!arc) {
      const ups = all.filter(f => up(f))
      const left = Math.min(...all.map(f => f.x))
      for (let i = 0; i < Math.round(2 * density) && ups.length > 0; i++) {
        const targetX = left + (l.cx - left) * (0.15 + i * 0.35)
        const f = ups.reduce((a, b) => (Math.abs(b.x - targetX) < Math.abs(a.x - targetX) ? b : a))
        add(f, {
          angle: -(HALF_PI - 0.55),
          width: unit * (7 - i * 2),
          taper: 0.991,
          life: 150,
          curl: 0.014 + i * 0.004,
          jitter: 0.02,
        })
      }
    }

    // Centre spikes: up from the top of the middle letters, down from the star
    if (emblem === 'star') {
      const centreUps = tips.filter(f => up(f))
      if (centreUps.length > 0) {
        const f = centreUps.reduce((a, b) => (Math.abs(b.x - l.cx) + b.y * 0.2 < Math.abs(a.x - l.cx) + a.y * 0.2 ? b : a))
        add(f, { angle: aim(f, -HALF_PI, 0.8), width: unit * 14, taper: 0.95, life: 45, jitter: 0, thorns: false })
      }
      const star = starAnchor(l)
      branches.push({
        x: l.cx,
        y: star.y + star.r * 0.6,
        angle: HALF_PI,
        width: unit * 10,
        taper: 0.93,
        life: 35,
        jitter: 0,
        curl: 0,
        bend: 0,
        thorns: false,
        flare: 0,
        age: 0,
        copies: [{ fx: false, fy: false, ox: 0, oy: 0 }],
      })
    }

    // Shaped thorns: curved, slim, branching, grown from thick spots
    if (thornStyle === 'shaped') {
      const flips = quad ? [[true, false], [false, true], [true, true]] : [[true, false]]
      // Mirrored copies snap onto the nearest real edge, or the thorn is skipped
      const mirror = f => {
        const copies = [{ fx: false, fy: false, ox: 0, oy: 0 }]
        for (const [fx, fy] of flips) {
          const ex = fx ? s.width - f.x : f.x
          const ey = fy ? 2 * l.cy - f.y : f.y
          const snap = nearestEdge(edges, ex, ey)
          if (!snap || snap.d > l.size * 0.5) {
            return null
          }
          copies.push({ fx, fy, ox: snap.x - ex, oy: snap.y - ey })
        }
        return copies
      }
      branches.push(...growThorns({
        rand,
        solid: edges.solid,
        size: l.size,
        centre: [l.cx, l.cy],
        halfWidth: l.cx - Math.min(...edges.all.map(p => p.x)),
        symmetry: quad ? 'xy' : 'x',
        mirror,
        sites: features(s, l, edges, 500),
        density,
      }))
    }

    return branches
  }

  // Paints one ribbon step (a quad) or the pointed tip, for every mirrored copy
  function paintStep (ctx, s, b, points) {
    const cy = s.logo.cy
    ctx.beginPath()
    for (const c of b.copies) {
      for (const [i, [x, y]] of points.entries()) {
        const px = (c.fx ? s.width - x : x) + c.ox
        const py = (c.fy ? 2 * cy - y : y) + c.oy
        i === 0 ? ctx.moveTo(px, py) : ctx.lineTo(px, py)
      }
      ctx.closePath()
    }
    ctx.fill()
    // A hairline stroke hides the seams between neighbouring quads
    ctx.stroke()
  }

  function edgesOf (x, y, angle, width) {
    const px = -Math.sin(angle) * width / 2
    const py = Math.cos(angle) * width / 2
    return [[x + px, y + py], [x - px, y - py]]
  }

  function step (ctx, s, b) {
    const unit = s.logo.size / 100
    const x0 = b.x
    const y0 = b.y
    const a0 = b.angle
    const w0 = b.drawn ?? b.width * (1 + b.flare)
    b.curl += b.bend
    b.angle += b.curl + (s.rand() - 0.5) * b.jitter
    b.x += Math.cos(b.angle) * unit * 1.6
    b.y += Math.sin(b.angle) * unit * 1.6
    b.width *= b.taper
    b.life--
    // Roots flare out so branches melt into the stroke they grow from,
    // and the last steps narrow to a needle point
    const root = 1 + b.flare * Math.max(0, 1 - ++b.age / 8)
    const point = Math.min(1, Math.max(0, b.life) / 12) ** 0.7
    b.drawn = b.width * root * point

    const [l0, r0] = edgesOf(x0, y0, a0, w0)
    const [l1, r1] = edgesOf(b.x, b.y, b.angle, b.drawn)
    paintStep(ctx, s, b, [l0, l1, r1, r0])

    const alive = b.life > 0 && b.width > 0.35 && b.y > -20 && b.y < s.height + 20
    if (!alive && b.drawn > 0.1) {
      const reach = b.drawn * 4 + unit * 2
      paintStep(ctx, s, b, [l1, [b.x + Math.cos(b.angle) * reach, b.y + Math.sin(b.angle) * reach], r1])
    }
    return alive
  }

  // Shaped thorns grow outward from their base: the full shape is drawn
  // through a widening circle. Specks pop in once their thorn is done.
  function paintItem (ctx, s, it) {
    if (it.delay > 0) {
      it.delay--
      return true
    }
    const cy = s.logo.cy
    const tx = (c, [x, y]) => [(c.fx ? s.width - x : x) + c.ox, (c.fy ? 2 * cy - y : y) + c.oy]
    if (it.kind === 'speck') {
      ctx.beginPath()
      for (const c of it.copies) {
        const [x, y] = tx(c, it.centre)
        ctx.moveTo(x + it.r, y)
        ctx.arc(x, y, it.r, 0, Math.PI * 2)
      }
      ctx.fill()
      return false
    }
    it.progress = Math.min(1, it.progress + 1 / it.dur)
    const r = it.reach * it.progress
    ctx.save()
    ctx.beginPath()
    for (const c of it.copies) {
      const [x, y] = tx(c, it.origin)
      ctx.moveTo(x + r, y)
      ctx.arc(x, y, r, 0, Math.PI * 2)
    }
    ctx.clip()
    ctx.beginPath()
    for (const c of it.copies) {
      ctx.moveTo(...tx(c, it.B))
      ctx.bezierCurveTo(...tx(c, it.fin.c1), ...tx(c, it.fin.c2), ...tx(c, it.C))
      ctx.bezierCurveTo(...tx(c, it.fout.c1), ...tx(c, it.fout.c2), ...tx(c, it.D))
      ctx.closePath()
    }
    ctx.fill()
    ctx.restore()
    return it.progress < 1
  }

  function grow (ctx, s) {
    const rand = s.rand
    const unit = s.logo.size / 100
    const next = []

    for (const b of s.branches) {
      if (b.kind === 'shape' || b.kind === 'speck') {
        if (paintItem(ctx, s, b)) {
          next.push(b)
        }
        continue
      }
      const alive = step(ctx, s, b)

      // Side thorns that hook back like claws, rooted on the parent ribbon
      if (thornStyle === 'hair' && b.thorns && b.width > unit * 1.5 && rand() < (blades ? 0.05 : 0.09) * density) {
        const side = rand() < 0.5 ? -1 : 1
        next.push({
          ...b,
          angle: b.angle + side * (0.5 + rand() * 0.6),
          width: b.width * (blades ? 0.75 : 0.6),
          drawn: undefined,
          taper: blades ? 0.86 : 0.9,
          life: 6 + rand() * 18,
          curl: -side * 0.03 * curliness,
          bend: -side * 0.004 * curliness,
          flare: 0.2,
          age: 0,
        })
      }

      if (alive) {
        next.push(b)
      }
    }
    s.branches = next
  }

  // Carves run instantly, as negative ribbons, on the canvas and the mask
  function applyCarves (ctx, mask, s, carves) {
    for (const target of [ctx, mask]) {
      target.save()
      target.globalCompositeOperation = 'destination-out'
      target.lineWidth = 0.75
      for (const original of carves) {
        const b = { ...original }
        while (step(target, s, b)) {
          // keep cutting until the carve tapers out
        }
      }
      target.restore()
    }
  }

  function setup (ctx, s) {
    s.branches = []
    ctx.clearRect(0, 0, s.width, s.height)

    // Canvas text needs the font loaded, set up again once it is
    if (!document.fonts.check(fontAt(100))) {
      document.fonts.load(fontAt(100)).then(() => {
        s.pendingSetup = true
      })
      return
    }

    s.seed ??= seed
    s.rand = createRandom(s.seed)
    s.logo = arc ? arcLayout(ctx, s) : linearLayout(ctx, s)
    distortGlyphs(s.logo.glyphs, s.rand)
    s.done = 0
    ctx.fillStyle = INK
    ctx.strokeStyle = INK
    ctx.lineJoin = 'miter'
    ctx.lineWidth = 0.75
    if (emblem === 'ring') {
      drawRing(ctx, s.logo)
    }
    if (emblem === 'star') {
      drawStar(ctx, s.logo)
    }
    drawText(ctx, s.logo, emblem === 'ring' ? s.logo.size * 0.12 : 0)

    const mask = createMask(s, s.logo)
    if (carve > 0) {
      applyCarves(ctx, mask, s, spawnCarves(s, s.logo, sampleEdges(mask)))
    }
    ctx.lineWidth = 0.75
    s.branches = spawn(s, s.logo, sampleEdges(mask))
    while (s.reducedMotion && s.branches.length > 0) {
      grow(ctx, s)
    }
  }

  return {
    setup,

    draw (ctx, s) {
      if (s.pendingSetup) {
        s.pendingSetup = false
        setup(ctx, s)
      }
      for (let i = 0; i < STEPS_PER_FRAME && s.branches.length > 0; i++) {
        grow(ctx, s)
      }
      if (regrow && s.logo && s.branches.length === 0) {
        s.done += s.dt
        if (s.done > regrow) {
          s.seed++
          setup(ctx, s)
        }
      }
    },
  }
}
