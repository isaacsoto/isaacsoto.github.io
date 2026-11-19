<script setup>
  defineProps({
    acts: { type: Array, required: true },
  })
</script>

<template>
  <section aria-labelledby="stage-title" class="stage">
    <h2 id="stage-title" class="stage__title">Shared the stage with</h2>

    <ul class="stage__logos">
      <li v-for="act in acts" :key="act.company" class="stage__logo" :title="act.company">
        <span class="d-sr-only">{{ act.company }}</span>
        <!-- eslint-disable-next-line vue/no-v-html -- our own SVG files -->
        <span class="stage__mark" :style="{ '--scale': act.stageScale ?? 1 }" v-html="act.logo" />
      </li>
    </ul>
  </section>
</template>

<style scoped>
  .stage {
    padding: 2.5rem 16px;
    text-align: center;
    border-block: 1px solid rgba(179, 18, 27, 0.25);
    background: linear-gradient(90deg, transparent, rgba(7, 6, 6, 0.6), transparent);
  }

  .stage__title {
    margin-bottom: 1.5rem;
    font-size: 0.75rem;
    font-weight: 400;
    letter-spacing: 0.3em;
    text-transform: uppercase;
    opacity: 0.6;
  }

  .stage__logos {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    justify-content: center;
    gap: 2rem 3.5rem;
    margin: 0;
    padding: 0;
    list-style: none;
  }

  .stage__mark {
    display: block;
    height: calc(48px * var(--scale));
    color: rgba(216, 210, 204, 0.4);
    transition: color 0.2s;
  }

  .stage__mark :deep(svg) {
    width: auto;
    height: 100%;
  }

  .stage__logo:hover .stage__mark {
    color: var(--bone);
  }

  @media (max-width: 599px) {
    .stage__mark {
      height: calc(34px * var(--scale));
    }
  }
</style>
