// Every *.js file in this folder is a sketch and shows up in Works automatically
const modules = import.meta.glob(['./*.js', '!./index.js'], { eager: true, import: 'default' })

export const sketches = Object.entries(modules)
  .map(([path, sketch]) => ({ id: path.slice(2, -3), ...sketch }))
  .toSorted((a, b) => (a.order ?? 0) - (b.order ?? 0))
