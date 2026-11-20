import type { LogoOptions, SketchModule } from '@/types'
import { profile } from '@/data/profile'
import { createDeathLogo } from '@/lib/deathLogo'

export const wide: LogoOptions = {
  lines: [profile.name],
  font: '"Manufacturing Consent"',
  distort: 0.6,
  density: 0.4,
  curliness: 0.4,
}

export const stacked: LogoOptions = {
  lines: profile.name.split(' '),
  font: '"Manufacturing Consent"',
  stretch: 1.5,
  arc: 1,
  caps: 'upper',
  edgeScale: 1.25,
  symmetry: 'x',
  emblem: 'star',
  blades: true,
  tails: true,
}

const wordmark: SketchModule = {
  title: 'Wordmark',
  description: 'Stacked logo variant: fanned blade letters, horns and tails grown from the letterforms. Regrows with a new seed.',
  tags: ['canvas', 'generative', 'type'],
  order: 0,
  ...createDeathLogo({ ...stacked, regrow: 3 }),
}

export default wordmark
