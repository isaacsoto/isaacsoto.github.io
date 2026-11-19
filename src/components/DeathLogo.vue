<script setup>
  import { ref } from 'vue'
  import { useSketch } from '@/composables/useSketch'
  import { createDeathLogo } from '@/lib/deathLogo'

  // `options` are passed straight to createDeathLogo, see lib/deathLogo.js
  const props = defineProps({
    options: { type: Object, required: true },
    aspect: { type: Number, default: 1.9 },
  })

  const canvas = ref()
  useSketch(canvas, createDeathLogo(props.options))
</script>

<template>
  <h1 class="death-logo">
    <span class="d-sr-only">{{ options.lines.join(' ') }}</span>
    <canvas ref="canvas" aria-hidden="true" :style="{ aspectRatio: aspect }" />
  </h1>
</template>

<style scoped>
  .death-logo {
    width: min(100%, 1100px);
    margin: 0;
  }

  .death-logo canvas {
    display: block;
    width: 100%;
    filter: drop-shadow(0 0 14px rgba(179, 18, 27, 0.55));
    animation: flicker 4s infinite steps(1);
  }

  @keyframes flicker {
    0%, 92%, 100% { transform: none; filter: drop-shadow(0 0 14px rgba(179, 18, 27, 0.55)); }
    93% { transform: translateX(-4px); filter: drop-shadow(6px 0 0 rgba(179, 18, 27, 0.9)); }
    95% { transform: translateX(3px) skewX(-2deg); filter: drop-shadow(-5px 0 0 rgba(179, 18, 27, 0.9)); }
  }

  @media (prefers-reduced-motion: reduce) {
    .death-logo canvas { animation: none; }
  }
</style>
