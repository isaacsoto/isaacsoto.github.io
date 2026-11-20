import type { Project, Work } from '@/types'
import { sketches } from '@/sketches'

/**
 * Projects shown next to the sketches in Works, sorted together by `order`.
 *
 * media: 'image' or 'video'. Put the files in public/works/ and reference them
 * as 'works/<file>'. Files in public/ are copied next to index.html as-is,
 * so they don't bloat the single-file page.
 *
 * {
 *   title: 'Softube Central',
 *   description: 'Lead dev on the full rewrite of the Softube Central app.',
 *   tags: ['vue', 'ux'],
 *   media: 'video',
 *   src: 'works/softube-central.mp4',
 *   poster: 'works/softube-central.jpg', // optional, video only
 *   alt: 'Plugin library view',          // optional, image only, defaults to title
 *   link: { href: 'https://example.com', label: 'Case study' }, // optional
 *   order: 1,
 * }
 */
const projects: Project[] = []

export const works: Work[] = [
  ...projects.map((project, i) => ({ ...project, id: `project-${i}` })),
  ...sketches.map(sketch => ({ ...sketch, media: 'sketch' as const, sketch })),
].toSorted((a, b) => (a.order ?? 0) - (b.order ?? 0))
