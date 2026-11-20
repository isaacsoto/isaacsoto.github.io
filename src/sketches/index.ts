import type { SketchModule } from '@/types'

// Every sketch file in this folder (.js or .ts) shows up in Works automatically
const modules = import.meta.glob<SketchModule>(['./*.{js,ts}', '!./index.ts'], { eager: true, import: 'default' })

export const sketches = Object.entries(modules)
  .map(([path, sketch]) => ({ ...sketch, id: path.replace(/^\.\/|\.[jt]s$/g, '') }))
  .toSorted((a, b) => (a.order ?? 0) - (b.order ?? 0))
