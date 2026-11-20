<script setup lang="ts">
  import { onBeforeUnmount, onMounted, ref } from 'vue'

  withDefaults(defineProps<{
    src: string
    poster?: string
    label?: string
  }>(), {
    poster: '',
    label: '',
  })

  const video = ref<HTMLVideoElement>()
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
  let observer: IntersectionObserver | undefined

  // Muted autoplay loop, but only while the card is on screen
  onMounted(() => {
    if (reducedMotion || !video.value) {
      return
    }
    observer = new IntersectionObserver(([entry]) => {
      if (entry?.isIntersecting) {
        video.value?.play().catch(() => {})
      } else {
        video.value?.pause()
      }
    })
    observer.observe(video.value)
  })

  onBeforeUnmount(() => observer?.disconnect())
</script>

<template>
  <video
    ref="video"
    :aria-label="label"
    class="media"
    :controls="reducedMotion"
    loop
    muted
    playsinline
    :poster="poster || undefined"
    preload="metadata"
    :src="src"
  />
</template>

<style scoped>
  .media {
    display: block;
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
</style>
