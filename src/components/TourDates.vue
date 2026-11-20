<script setup lang="ts">
  import type { Experience } from '@/types'

  defineProps<{
    dates: Experience[]
  }>()
</script>

<template>
  <ol class="tour">
    <li v-for="date in dates" :key="date.company" class="tour__row">
      <span class="tour__years">{{ date.years }}</span>
      <span class="tour__venue">{{ date.company }}</span>
      <span class="tour__city">{{ date.city }}</span>
      <span class="tour__billing">{{ date.billing }}</span>

      <span class="tour__stamp" :class="{ 'tour__stamp--live': date.current }">
        {{ date.current ? 'Now touring' : 'Sold out' }}
      </span>

      <p class="tour__role">{{ date.role }}</p>
    </li>
  </ol>
</template>

<style scoped>
  .tour {
    margin: 0;
    padding: 0;
    list-style: none;
  }

  .tour__row {
    display: grid;
    grid-template-columns: 9rem minmax(0, 1fr) 10rem 8rem 7.5rem;
    align-items: baseline;
    gap: 0.25rem 1.5rem;
    padding: 1.25rem 0;
    border-bottom: 1px dashed rgba(179, 18, 27, 0.35);
    text-transform: uppercase;
    letter-spacing: 0.12em;
    font-size: 0.8rem;
  }

  .tour__row:first-child {
    border-top: 1px dashed rgba(179, 18, 27, 0.35);
  }

  .tour__years {
    color: var(--blood);
    font-weight: 700;
  }

  .tour__venue {
    font-family: var(--font-display);
    font-size: 1.5rem;
    font-weight: 900;
    letter-spacing: 0.04em;
    line-height: 1.1;
    text-transform: none;
  }

  .tour__city,
  .tour__billing {
    opacity: 0.7;
  }

  .tour__stamp {
    justify-self: end;
    padding: 0.15rem 0.5rem;
    border: 2px solid currentColor;
    color: rgba(216, 210, 204, 0.45);
    font-size: 0.65rem;
    font-weight: 700;
    letter-spacing: 0.2em;
    transform: rotate(-6deg);
  }

  .tour__stamp--live {
    color: var(--bone);
    background: var(--blood);
    border-color: var(--blood);
  }

  .tour__role {
    grid-column: 2 / -1;
    margin: 0.25rem 0 0;
    font-size: 0.85rem;
    letter-spacing: 0;
    text-transform: none;
    opacity: 0.7;
  }

  @media (max-width: 959px) {
    .tour__row {
      grid-template-columns: minmax(0, 1fr) auto;
    }

    .tour__venue,
    .tour__role {
      grid-column: 1 / -1;
    }

    .tour__years {
      grid-row: 1;
    }

    .tour__stamp {
      grid-row: 1;
      grid-column: 2;
    }

    .tour__city,
    .tour__billing {
      grid-column: 1 / -1;
    }
  }
</style>
