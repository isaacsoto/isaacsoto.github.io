/**
 * Shaped thorns, ported from the hand-tuned SVG thorn generator.
 *
 * Each thorn is a curved spine with two slim, concave flanks ending in a
 * needle point. Rules, from the review rounds:
 * - every thorn has its own seeded character (hook, bend, wobble, tilt, flanks)
 * - a thorn is never wider than the stroke it grows from, and never a sliver:
 *   when there is not enough stroke for its length it gets shorter instead
 * - thorns far from the mirror line steer away from the logo centre, thorns
 *   close to it steer toward it
 * - only thorns long enough to branch get a child, and only one: a tine near
 *   the tip, so thorns never cluster into a flower of three
 * - flanks never cross, nothing runs over a letter or past the mirror line
 *
 * Works on a raster mask, so bases tuck slightly into the stroke instead of
 * following an exact outline, and mirrored copies are snapped, not exact.
 */

const add = (a, b) => [a[0] + b[0], a[1] + b[1]]
const sub = (a, b) => [a[0] - b[0], a[1] - b[1]]
const mul = (a, k) => [a[0] * k, a[1] * k]
const dot = (a, b) => a[0] * b[0] + a[1] * b[1]
const unit = v => mul(v, 1 / (Math.hypot(...v) || 1))

/** Thinnest a thorn may be: base width at least this fraction of its length */
const MIN_RATIO = 0.28
/** Chance that a thorn long enough to branch actually gets its tine */
const CHILD_CHANCE = 0.85

function cubic (c, t) {
  const u = 1 - t
  const a = u * u * u
  const b = 3 * u * u * t
  const d = 3 * u * t * t
  const e = t * t * t
  return [
    a * c.p0[0] + b * c.c1[0] + d * c.c2[0] + e * c.p1[0],
    a * c.p0[1] + b * c.c1[1] + d * c.c2[1] + e * c.p1[1],
  ]
}

function cubicTangent (c, t) {
  const eps = 0.01
  return unit(sub(cubic(c, Math.min(1, t + eps)), cubic(c, Math.max(0, t - eps))))
}

function segmentsCross ([a, b], [c, d]) {
  const o = (p, q, r) => Math.sign((q[0] - p[0]) * (r[1] - p[1]) - (q[1] - p[1]) * (r[0] - p[0]))
  return o(a, b, c) * o(a, b, d) < 0 && o(c, d, a) * o(c, d, b) < 0
}

/** The two flanks crossing each other (a figure-8), the tip excluded */
function flanksCross (fin, fout) {
  const sample = c => Array.from({ length: 25 }, (_, k) => cubic(c, k / 24))
  const a = sample(fin)
  const b = sample(fout)
  for (let i = 0; i < 23; i++) {
    for (let j = 1; j < 24; j++) {
      if (segmentsCross([a[i], a[i + 1]], [b[j], b[j + 1]])) {
        return true
      }
    }
  }
  return false
}

/** A thorn's own character; ranges come from the review rounds */
export function makeThornStyle (rand) {
  const range = (a, b) => a + (b - a) * rand()
  const flank = () => ({ u1: range(0.1, 0.26), v1: range(0.18, 0.42), u2: range(0.46, 0.7), v2: range(0.008, 0.06) })
  return {
    hook: range(0.45, 1), //       how far the tip curls sideways (fraction of length)
    curve: range(1.3, 2.4), //     where it curls: low = early bend, high = late hook
    wobble: range(-0.06, 0.06), // slight S-curve along the spine
    tilt: range(0.3, 0.9), //      how much it leans at its base
    innerIn: range(0.75, 1.2), //  uneven base, one side wider than the other
    innerOut: range(0.75, 1.2),
    in: flank(),
    out: flank(),
  }
}

/**
 * @param {object} o
 * @param {() => number} o.rand seeded random
 * @param {(x: number, y: number) => boolean} o.solid is this pixel part of a letter
 * @param {number} o.size the logo's font size, all lengths scale with it
 * @param {[number, number]} o.centre logo centre; its x is the mirror line
 * @param {number} o.halfWidth distance from the mirror line to the outermost letter
 * @param {'x' | 'xy'} o.symmetry
 * @param {(site: object) => object[] | null} o.mirror mirrored copies for a root thorn, or null to skip it
 * @param {object[]} o.sites analysed edge points: {x, y, nx, ny, fill, thick}
 * @param {number} o.density how many thorns
 */
export function growThorns ({ rand, solid, size, centre, halfWidth, symmetry, mirror, sites, density }) {
  const range = (a, b) => a + (b - a) * rand()
  const k = size / 100
  const parentMin = k * 45 // as long as a thorn must be to branch
  const gap = Math.max(3, k * 1.5) // tips stay this far from a mirror line
  const flowerDistance = k * 22
  const items = []
  const placed = [] // {base, parent} of every thorn, for the flower rule

  // Thorns are neighbours when their bases are close or they share a parent;
  // adding one that makes a group of three or more would be a flower
  function wouldFlower (candidate) {
    const near = (a, b) => Math.hypot(a.base[0] - b.base[0], a.base[1] - b.base[1]) < flowerDistance || (a.parent && a.parent === b.parent)
    const group = [candidate]
    const seen = new Set()
    for (let i = 0; i < group.length; i++) {
      for (const p of placed) {
        if (!seen.has(p) && near(group[i], p)) {
          seen.add(p)
          group.push(p)
        }
      }
    }
    return group.length > 2
  }

  /**
   * One thorn at `site` ({p, n, tan, thick}). Retries shorter, calmer or with
   * less lean whenever a rule fails, and gives up when it gets too small.
   */
  function build (site, spec, attempt = 0) {
    let { height, base, lean, style } = spec
    if (attempt > 14 || height < k * 6) {
      return null
    }
    const retry = changes => build(site, { ...spec, ...changes }, attempt + 1)
    const { p: mid, n, tan } = site

    // Distal thorns steer away from the centre, close ones toward the mirror line
    const dist = Math.abs(centre[0] - mid[0])
    const steer = dist > halfWidth * 0.58 ? -0.6 : (dist < halfWidth * 0.44 ? 0.35 : 0)
    const steerVec = steer < 0 ? mul(unit(sub(mid, centre)), -steer) : [Math.sign(centre[0] - mid[0]) * steer, 0]
    const axisDir = unit(add(add(n, mul(tan, lean * style.tilt)), steerVec))
    const across = [-axisDir[1], axisDir[0]]
    const hook = Math.sign(dot(tan, across)) * Math.sign(lean || 1) * Math.min(Math.abs(lean), 1) * style.hook
    const spine = u => hook * height * (u / height) ** style.curve + style.wobble * height * Math.sin(Math.PI * u / height)
    const world = (u, v) => add(add(mid, mul(axisDir, u)), mul(across, v))
    const local = q => [dot(sub(q, mid), axisDir), dot(sub(q, mid), across)]
    const C = world(height, spine(height))

    // Keep clear of the mirror line(s) so a thorn never hits its mirrored twin
    if ((centre[0] - C[0]) * Math.sign(centre[0] - mid[0]) < gap) {
      return retry({ height: height * 0.85 })
    }
    if (symmetry === 'xy' && (centre[1] - C[1]) * Math.sign(centre[1] - mid[1]) < gap) {
      return retry({ height: height * 0.85 })
    }

    // Never wider than what it grows from, never a sliver: shorter instead
    base = Math.min(base, height * 1.2, site.thick)
    if (base < height * MIN_RATIO) {
      return base / MIN_RATIO >= k * 6 ? retry({ height: base / MIN_RATIO, base }) : null
    }

    // The tip and the middle must stick out into empty space
    if (solid(...C) || solid(...world(height * 0.5, spine(height * 0.5)))) {
      return retry({ height: height * 0.85 })
    }

    // Base tucked into the stroke, so the letter's fill hides the join
    const inset = Math.min(site.thick * 0.45, base * 0.35)
    const B = sub(sub(mid, mul(tan, base / 2 * style.innerIn * 0.9)), mul(n, inset))
    const D = sub(add(mid, mul(tan, base / 2 * style.innerOut * 0.9)), mul(n, inset))
    const [uB, vB] = local(B)
    const [uD, vD] = local(D)
    // B and D must sit on opposite sides of the spine, or the thorn folds
    if (Math.sign(vB) === Math.sign(vD) || vB === 0 || vD === 0) {
      return Math.abs(lean) > 0.05 ? retry({ lean: lean * 0.5 }) : null
    }

    // Long thorns keep their width further up, like an antler
    const antler = height >= parentMin
    const widen = f => (antler ? { ...f, v1: Math.max(f.v1, 0.45), u2: Math.max(f.u2, 0.72), v2: Math.max(f.v2, 0.09) } : f)
    const pin = widen(style.in)
    const pout = widen(style.out)
    const along = (u0, t) => u0 + (height - u0) * t
    // Each flank keeps its control points on its own side of the spine
    const fin = {
      p0: B,
      c1: world(along(uB, pin.u1), spine(along(uB, pin.u1)) + vB * pin.v1),
      c2: world(along(uB, pin.u2), spine(along(uB, pin.u2)) + vB * pin.v2),
      p1: C,
    }
    const fout = {
      p0: C,
      c1: world(along(uD, pout.u2), spine(along(uD, pout.u2)) + vD * pout.v2),
      c2: world(along(uD, pout.u1), spine(along(uD, pout.u1)) + vD * pout.v1),
      p1: D,
    }

    // A flank running over a letter: shorter. Flanks crossing: calmer.
    const sample = c => Array.from({ length: 21 }, (_, i) => cubic(c, i / 20))
    if ([...sample(fin).slice(6, 19), ...sample(fout).slice(2, 15)].some(q => solid(...q))) {
      return retry({ height: height * 0.85 })
    }
    if (flanksCross(fin, fout)) {
      return style.hook > 0.1 ? retry({ style: { ...style, hook: style.hook * 0.6, wobble: 0 } }) : null
    }
    return { B, C, D, fin, fout, mid, axisDir, height, base, lean }
  }

  /** Builds a thorn, queues it for drawing, and maybe grows its tine */
  function grow (site, spec, copies, delay, parent = null) {
    const t = build(site, { ...spec, style: makeThornStyle(rand) })
    if (!t || wouldFlower({ base: t.mid, parent })) {
      return null
    }
    const id = placed.length
    placed.push({ base: t.mid, parent })
    const dur = 14 + t.height / k * 0.5
    items.push({ kind: 'shape', ...t, origin: t.mid, reach: t.height * 1.25 + t.base, copies, delay, dur, progress: 0 })

    // One tine near the tip, forking off like an antler
    if (t.height >= parentMin && rand() < CHILD_CHANCE) {
      const onOut = t.lean >= 0
      const flank = onOut ? t.fout : t.fin
      // fout runs tip -> D, so "toward the tip" is its start
      const pos = onOut ? range(0.18, 0.38) : range(0.62, 0.82)
      const p = cubic(flank, pos)
      const tan = cubicTangent(flank, pos)
      const onAxis = add(t.mid, mul(t.axisDir, dot(sub(p, t.mid), t.axisDir)))
      let n = [tan[1], -tan[0]]
      if (dot(n, sub(p, onAxis)) < 0) {
        n = mul(n, -1)
      }
      const width = t.base * Math.min(1, (onOut ? pos : 1 - pos) * 1.4)
      grow(
        { p, n, tan, thick: width },
        { height: t.height * range(0.35, 0.6), base: width, lean: (onOut ? -1 : 1) * range(0.6, 1.1) },
        copies,
        delay + dur * 0.8,
        id,
      )
    }
    return t
  }

  // Root sites: edge points with stroke behind them, in random order
  const roots = sites
    .filter(f => f.fill > 0.25 && f.fill < 0.8 && f.thick >= k * 2.5)
    .map(f => ({ f, r: rand() }))
    .toSorted((a, b) => a.r - b.r)
    .map(({ f }) => f)
  const siteOf = f => ({ p: [f.x, f.y], n: [f.nx, f.ny], tan: [-f.ny, f.nx], thick: f.thick, f })

  // Big antler thorns first, from the thickest spots, then small ones
  const thickest = roots.toSorted((a, b) => b.thick - a.thick).slice(0, Math.max(6, Math.round(roots.length * 0.25)))
  const bigWanted = Math.round(4 * density + 1)
  const smallWanted = Math.round(16 * density)
  const bigs = []
  for (const f of thickest) {
    if (bigs.length >= bigWanted) {
      break
    }
    const site = siteOf(f)
    const copies = mirror(f)
    if (!copies) {
      continue
    }
    const t = grow(site, { height: k * range(70, 110), base: k * 34, lean: range(-0.9, 0.9) }, copies, Math.round(range(0, 30)))
    if (t) {
      bigs.push(t)
    }
  }
  let smalls = 0
  for (const f of roots) {
    if (smalls >= smallWanted) {
      break
    }
    const site = siteOf(f)
    const copies = mirror(f)
    if (!copies) {
      continue
    }
    if (grow(site, { height: k * range(18, 50), base: k * 18, lean: range(-0.9, 0.9) }, copies, Math.round(range(0, 60)))) {
      smalls++
    }
  }

  // Floating specks near the antler tips
  for (const t of bigs) {
    const dir = unit(sub(t.C, t.mid))
    const side = [-dir[1], dir[0]]
    for (let i = 0; i < 2; i++) {
      const r = k * range(0.8, 1.8)
      const at = add(add(t.C, mul(dir, k * range(4, 10) * (i + 1))), mul(side, k * range(-5, 5)))
      const clear = !solid(...at) && Math.abs(centre[0] - at[0]) > r + gap
      if (clear && rand() < 0.75) {
        const owner = items.find(it => it.kind === 'shape' && it.C === t.C)
        items.push({ kind: 'speck', centre: at, r, copies: owner.copies, delay: owner.delay + owner.dur })
      }
    }
  }
  return items
}
