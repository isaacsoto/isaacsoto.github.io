// Seeded 2D value noise, returns 0..1
export function createNoise (seed = 1) {
  let state = (Math.abs(seed) % 2_147_483_646) + 1
  const rand = () => (state = (state * 16_807) % 2_147_483_647) / 2_147_483_647

  const p = Array.from({ length: 256 }, (_, i) => i)
  for (let i = 255; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1))
    ;[p[i], p[j]] = [p[j], p[i]]
  }
  const perm = new Uint8Array(512)
  for (let i = 0; i < 512; i++) {
    perm[i] = p[i & 255]
  }

  const hash = (x, y) => perm[perm[x & 255] + (y & 255)] / 255
  const fade = t => t * t * (3 - 2 * t)

  return (x, y) => {
    const xi = Math.floor(x)
    const yi = Math.floor(y)
    const u = fade(x - xi)
    const v = fade(y - yi)
    const a = hash(xi, yi)
    const b = hash(xi + 1, yi)
    const c = hash(xi, yi + 1)
    const d = hash(xi + 1, yi + 1)
    return a + (b - a) * u + (c - a) * v + (a - b - c + d) * u * v
  }
}
