import vuetify from 'eslint-config-vuetify'

export default vuetify(
  {},
  {
    // Plain JS project, the preset expects lang="ts"
    rules: { 'vue/block-lang': 'off' },
  },
)
