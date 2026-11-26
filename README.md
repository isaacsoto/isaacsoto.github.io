# Portfolio

Creative programming portfolio. Vue 3 + Vuetify + Vite, built into a single `dist/index.html`.

```bash
npm install
npm run dev       # local dev server
npm run lint      # eslint-config-vuetify (lint:fix to auto-fix)
npm run build     # -> dist/index.html
```

## Adding a sketch

Drop a file in `src/sketches/`. It is picked up automatically:

```js
export default {
  title: 'Name',
  description: 'One line.',
  tags: ['canvas'],
  order: 4,
  setup (ctx, s) {},     // optional, re-runs on resize
  draw (ctx, s) {},      // every frame
}
```

`s` holds `width`, `height`, `time`, `dt`, `frame`, `mouse { x, y, inside }`, plus anything you store on it.
Sketches pause when off screen and respect `prefers-reduced-motion`.

## Adding a project (image or video)

Put the file in `public/works/` and add an entry to `projects` in `src/data/works.js`:

```js
{
  title: 'Softube Central',
  description: 'Lead dev on the full rewrite of the app.',
  tags: ['vue', 'ux'],
  media: 'video',                       // or 'image'
  src: 'works/softube-central.mp4',
  poster: 'works/softube-central.jpg',  // optional, video only
  link: { href: 'https://…', label: 'Case study' }, // optional
  order: 1,
}
```

Projects and sketches share one grid, sorted by `order`. Files in `public/` are copied next to
`index.html` instead of being inlined, so videos don't bloat the page. Videos play muted and looped
while on screen, and show controls instead of autoplaying for reduced-motion users.

## Where things live

- `src/data/profile.js` – name, bio, tools, links, tour history
- `src/lib/deathLogo.js` – generative logo, presets in `src/sketches/wordmark.js`
- `src/plugins/vuetify.js` – theme colors
- `src/styles/main.scss` – fonts, grain, layout
- `src/background/ash.js` – full-page background sketch

## Deploy

`.github/workflows/deploy.yml` lints and builds every branch and pull request, and attaches the
built page as the `portfolio-preview` artifact. Pushes to `master` (or a manual run on `master`) also
deploy it to GitHub Pages.

One-time setup in the repo: **Settings → Pages → Source: GitHub Actions**.
