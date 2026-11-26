<script setup lang="ts">
  import type { Sketch } from '@/types'
  import { ref } from 'vue'
  import ash from '@/background/ash'
  import { useSketch } from '@/composables/useSketch'

  const props = withDefaults(defineProps<{ sketch?: Sketch }>(), { sketch: () => ash })

  const canvas = ref<HTMLCanvasElement>()
  useSketch(canvas, props.sketch)
</script>

<template>
  <canvas ref="canvas" aria-hidden="true" class="background-field" />
</template>

<style scoped>
  .background-field {
    position: fixed;
    inset: 0;
    width: 100%;
    height: 100%;
    z-index: 0;
    pointer-events: none;
  }
</style>
