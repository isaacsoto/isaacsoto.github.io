// Seeded PRNG (mulberry32), returns 0..1
export function createRandom (seed = 1) {
  let a = seed >>> 0
  return () => {
    a = (a + 0x6D_2B_79_F5) >>> 0
    let t = a
    t = Math.imul(t ^ (t >>> 15), t | 1)
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
    return ((t ^ (t >>> 14)) >>> 0) / 4_294_967_296
  }
}
