<script setup lang="ts">
  import type { Sketch } from '@/types'
  import { ref } from 'vue'
  import { useSketch } from '@/composables/useSketch'

  const props = withDefaults(defineProps<{
    sketch: Sketch
    label?: string
  }>(), {
    label: '',
  })

  const canvas = ref<HTMLCanvasElement>()
  useSketch(canvas, props.sketch)
</script>

<template>
  <canvas ref="canvas" :aria-label="label" class="media" role="img" />
</template>

<style scoped>
  .media {
    display: block;
    width: 100%;
    height: 100%;
  }
</style>
