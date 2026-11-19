import { createVuetify } from 'vuetify'
import { aliases, mdi } from 'vuetify/iconsets/mdi-svg'
import 'vuetify/styles'

export default createVuetify({
  icons: {
    defaultSet: 'mdi',
    aliases,
    sets: { mdi },
  },
  theme: {
    defaultTheme: 'deathcore',
    themes: {
      deathcore: {
        dark: true,
        colors: {
          'background': '#070606',
          'surface': '#100d0d',
          'primary': '#b3121b',
          'secondary': '#d8d2cc',
          'accent': '#ff2a36',
          'error': '#ff1f2d',
          'on-background': '#d8d2cc',
          'on-surface': '#d8d2cc',
        },
      },
    },
  },
  defaults: {
    VBtn: { rounded: 0 },
    VCard: { rounded: 0 },
    VChip: { rounded: 0 },
  },
})
