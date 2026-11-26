import { fileURLToPath, URL } from 'node:url'
import vue from '@vitejs/plugin-vue'
import { defineConfig } from 'vite'
import { viteSingleFile } from 'vite-plugin-singlefile'
import vuetify from 'vite-plugin-vuetify'

export default defineConfig({
  base: './',
  plugins: [
    vue(),
    vuetify({ autoImport: true }),
    // Inlines all JS/CSS so the build is a single index.html
    viteSingleFile(),
  ],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('src', import.meta.url)),
    },
  },
})
