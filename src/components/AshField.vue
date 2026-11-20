<script setup lang="ts">
  import { ref } from 'vue'
  import ash from '@/background/ash'
  import { useSketch } from '@/composables/useSketch'

  const canvas = ref<HTMLCanvasElement>()
  useSketch(canvas, ash)
</script>

<template>
  <canvas ref="canvas" aria-hidden="true" class="ash-field" />
</template>

<style scoped>
  .ash-field {
    position: fixed;
    inset: 0;
    width: 100%;
    height: 100%;
    z-index: 0;
    pointer-events: none;
  }
</style>
