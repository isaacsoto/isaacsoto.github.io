/** Per-instance state handed to a sketch. Sketches can stash their own data on it. */
export interface SketchState {
  [key: string]: unknown
  width: number
  height: number
  time: number
  dt: number
  frame: number
  mouse: { x: number, y: number, inside: boolean }
  reducedMotion: boolean
}

export interface Sketch {
  setup?: (ctx: CanvasRenderingContext2D, s: SketchState) => void
  draw: (ctx: CanvasRenderingContext2D, s: SketchState) => void
}

/** A file in src/sketches/: a sketch plus how it is listed in Works. */
export interface SketchModule extends Sketch {
  title: string
  description: string
  tags: string[]
  order?: number
}

interface WorkBase {
  id: string
  title: string
  description: string
  tags: string[]
  order?: number
  link?: { href: string, label: string }
}

export type SketchWork = WorkBase & { media: 'sketch', sketch: Sketch }
export type ImageWork = WorkBase & { media: 'image', src: string, alt?: string }
export type VideoWork = WorkBase & { media: 'video', src: string, poster?: string }
export type Work = SketchWork | ImageWork | VideoWork

/** An image or video entry in data/works.ts, the id is added automatically. */
export type Project = Omit<ImageWork, 'id'> | Omit<VideoWork, 'id'>

export interface Experience {
  company: string
  years: string
  city: string
  /** Stage billing shown in Tour History, e.g. 'Headliner' */
  billing: string
  role: string
  /** Inline SVG markup using fill="currentColor" */
  logo: string
  /** Balances the logo's visual size in the "Shared the stage with" strip */
  stageScale?: number
  current?: boolean
}

export interface Profile {
  name: string
  handle: string
  tagline: string
  about: string[]
  tools: string[]
  experience: Experience[]
  links: { label: string, href: string, icon: string }[]
}

/** Options for createDeathLogo, see lib/deathLogo.js for what each one does. */
export interface LogoOptions {
  lines: string[]
  font?: string
  weight?: number
  stretch?: number
  tracking?: number
  symmetry?: 'x' | 'xy'
  arc?: number
  caps?: 'edges' | 'upper' | 'lower' | 'none'
  edgeScale?: number
  emblem?: false | 'ring' | 'star'
  blades?: boolean
  tails?: boolean
  distort?: number
  carve?: number
  density?: number
  curliness?: number
  seed?: number
  regrow?: number
}
