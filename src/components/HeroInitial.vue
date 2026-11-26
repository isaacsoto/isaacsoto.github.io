<script setup lang="ts">
  import initial from '@/assets/logos/initial.svg?raw'

  defineProps<{
    name: string
  }>()
</script>

<template>
  <h1 class="hero-initial">
    <span class="d-sr-only">{{ name }}</span>
    <!-- eslint-disable-next-line vue/no-v-html -- our own SVG file -->
    <span class="hero-initial__mark" v-html="initial" />
  </h1>
</template>

<style scoped>
  .hero-initial {
    margin: 0;
    color: var(--bone);
  }

  .hero-initial__mark {
    display: block;
    height: min(62svh, 640px);
    max-width: 100%;
    filter: drop-shadow(0 0 16px rgba(179, 18, 27, 0.55));
    animation:
      rise 1.2s ease-out both,
      flicker 5s 1.2s infinite steps(1);
  }

  .hero-initial__mark :deep(svg) {
    display: block;
    width: auto;
    height: 100%;
    max-width: 100%;
    margin: 0 auto;
  }

  @keyframes rise {
    from { opacity: 0; transform: scale(0.96); filter: drop-shadow(0 0 0 rgba(179, 18, 27, 0)); }
  }

  @keyframes flicker {
    0%, 93%, 100% { transform: none; filter: drop-shadow(0 0 16px rgba(179, 18, 27, 0.55)); }
    94% { transform: translateX(-4px); filter: drop-shadow(6px 0 0 rgba(179, 18, 27, 0.9)); }
    96% { transform: translateX(3px) skewX(-2deg); filter: drop-shadow(-5px 0 0 rgba(179, 18, 27, 0.9)); }
  }

  @media (prefers-reduced-motion: reduce) {
    .hero-initial__mark { animation: none; }
  }
</style>
