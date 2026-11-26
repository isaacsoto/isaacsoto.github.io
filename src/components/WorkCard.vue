<script setup lang="ts">
  import type { Work } from '@/types'
  import { mdiArrowTopRight, mdiFullscreen } from '@mdi/js'
  import { ref } from 'vue'
  import SketchMedia from '@/components/media/SketchMedia.vue'
  import VideoMedia from '@/components/media/VideoMedia.vue'

  defineProps<{
    work: Work
  }>()

  const frame = ref<HTMLElement>()

  function fullscreen () {
    frame.value?.requestFullscreen?.()
  }
</script>

<template>
  <v-card class="work-card h-100" variant="outlined">
    <div ref="frame" class="work-card__frame">
      <SketchMedia v-if="work.media === 'sketch'" :label="work.title" :sketch="work.sketch" />

      <VideoMedia
        v-else-if="work.media === 'video'"
        :label="work.title"
        :poster="work.poster"
        :src="work.src"
      />

      <img
        v-else
        :alt="work.alt || work.title"
        class="work-card__image"
        decoding="async"
        loading="lazy"
        :src="work.src"
      >
    </div>

    <v-card-item>
      <v-card-title class="work-card__title font-display">{{ work.title }}</v-card-title>
      <v-card-subtitle class="text-wrap">{{ work.description }}</v-card-subtitle>
    </v-card-item>

    <v-card-actions>
      <div class="d-flex flex-wrap ga-1">
        <v-chip
          v-for="tag in work.tags"
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
        v-if="work.link"
        :append-icon="mdiArrowTopRight"
        :href="work.link.href"
        rel="noopener"
        size="small"
        target="_blank"
        variant="text"
      >
        {{ work.link.label }}
      </v-btn>

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
  .work-card {
    background: rgb(var(--v-theme-surface));
    border-color: rgba(216, 210, 204, 0.12);
    transition: border-color 0.2s, transform 0.2s;
  }

  .work-card:hover {
    border-color: var(--blood);
    transform: translateY(-2px);
  }

  .work-card__title {
    font-size: 1.6rem;
    line-height: 1.2;
  }

  .work-card__frame {
    aspect-ratio: 4 / 3;
    overflow: hidden;
    background: #070606;
    border-bottom: 1px solid rgba(216, 210, 204, 0.08);
  }

  .work-card__image {
    display: block;
    width: 100%;
    height: 100%;
    object-fit: cover;
  }

  /* Fullscreen shows the whole image or video instead of the cropped card view */
  .work-card__frame:fullscreen :is(img, video) {
    object-fit: contain;
  }
</style>
