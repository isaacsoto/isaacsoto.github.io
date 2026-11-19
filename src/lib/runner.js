/**
 * Runs a sketch `{ setup?(ctx, s), draw(ctx, s) }` on a canvas.
 * `s` is per-instance state: width, height, time, dt, frame, mouse.
 * Sketches can stash their own data on it. setup re-runs on resize.
 */
export function run (canvas, sketch) {
  const ctx = canvas.getContext('2d')
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
  const s = {
    width: 0,
    height: 0,
    time: 0,
    dt: 0,
    frame: 0,
    mouse: { x: 0, y: 0, inside: false },
    reducedMotion,
  }

  let raf = 0
  let visible = true
  let last = performance.now()

  function resize () {
    const dpr = Math.min(window.devicePixelRatio || 1, 2)
    s.width = canvas.clientWidth
    s.height = canvas.clientHeight
    canvas.width = Math.floor(s.width * dpr)
    canvas.height = Math.floor(s.height * dpr)
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
    sketch.setup?.(ctx, s)
    if (reducedMotion) {
      sketch.draw(ctx, s)
    }
  }

  function loop (now) {
    s.dt = Math.min((now - last) / 1000, 0.1)
    s.time += s.dt
    last = now
    sketch.draw(ctx, s)
    s.frame++
    raf = requestAnimationFrame(loop)
  }

  function play () {
    if (reducedMotion || raf || !visible) {
      return
    }
    last = performance.now()
    raf = requestAnimationFrame(loop)
  }

  function pause () {
    cancelAnimationFrame(raf)
    raf = 0
  }

  function onPointer (e) {
    const rect = canvas.getBoundingClientRect()
    s.mouse.x = e.clientX - rect.left
    s.mouse.y = e.clientY - rect.top
    s.mouse.inside = s.mouse.x >= 0 && s.mouse.y >= 0 && s.mouse.x <= rect.width && s.mouse.y <= rect.height
  }

  resize()
  const resizeObserver = new ResizeObserver(resize)
  resizeObserver.observe(canvas)

  // Pause sketches that are scrolled out of view
  const intersectionObserver = new IntersectionObserver(([entry]) => {
    visible = entry.isIntersecting
    visible ? play() : pause()
  })
  intersectionObserver.observe(canvas)

  window.addEventListener('pointermove', onPointer)
  play()

  return () => {
    pause()
    resizeObserver.disconnect()
    intersectionObserver.disconnect()
    window.removeEventListener('pointermove', onPointer)
  }
}
