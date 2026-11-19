<script setup>
  import { mdiFullscreen } from '@mdi/js'
  import { ref } from 'vue'
  import { useSketch } from '@/composables/useSketch'

  const props = defineProps({
    sketch: { type: Object, required: true },
  })

  const frame = ref()
  const canvas = ref()
  useSketch(canvas, props.sketch)

  function fullscreen () {
    frame.value.requestFullscreen?.()
  }
</script>

<template>
  <v-card class="sketch-card h-100" variant="outlined">
    <div ref="frame" class="sketch-card__frame">
      <canvas ref="canvas" :aria-label="sketch.title" role="img" />
    </div>

    <v-card-item>
      <v-card-title class="sketch-card__title font-display">{{ sketch.title }}</v-card-title>
      <v-card-subtitle class="text-wrap">{{ sketch.description }}</v-card-subtitle>
    </v-card-item>

    <v-card-actions>
      <div class="d-flex flex-wrap ga-1">
        <v-chip
          v-for="tag in sketch.tags"
          :key="tag"
          color="primary"
          label
          size="x-small"
          variant="outlined"
        >
          {{ tag }}
        </v-chip>
      </div>

      <v-spacer />

      <v-btn
        aria-label="Fullscreen"
        :icon="mdiFullscreen"
        size="small"
        variant="text"
        @click="fullscreen"
      />
    </v-card-actions>
  </v-card>
</template>

<style scoped>
  .sketch-card {
    background: rgb(var(--v-theme-surface));
    border-color: rgba(216, 210, 204, 0.12);
    transition: border-color 0.2s, transform 0.2s;
  }

  .sketch-card:hover {
    border-color: var(--blood);
    transform: translateY(-2px);
  }

  .sketch-card__title {
    font-size: 1.6rem;
    line-height: 1.2;
  }

  .sketch-card__frame {
    aspect-ratio: 4 / 3;
    background: #070606;
    border-bottom: 1px solid rgba(216, 210, 204, 0.08);
  }

  .sketch-card__frame canvas {
    display: block;
    width: 100%;
    height: 100%;
  }
</style>
