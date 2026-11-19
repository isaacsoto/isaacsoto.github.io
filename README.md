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

## Where things live

- `src/data/profile.js` – name, bio, tools, links, tour history
- `src/lib/deathLogo.js` – generative logo, presets in `src/sketches/wordmark.js`
- `src/plugins/vuetify.js` – theme colors
- `src/styles/main.scss` – fonts, grain, layout
- `src/background/ash.js` – full-page background sketch

## Deploy

`.github/workflows/deploy.yml` lints and builds every branch and pull request, and attaches the
built page as the `portfolio-preview` artifact. Pushes to `main` (or a manual run on `main`) also
deploy it to GitHub Pages.

One-time setup in the repo: **Settings → Pages → Source: GitHub Actions**.
