<script setup lang="ts">
  import { mdiChevronDown } from '@mdi/js'
  import { useDisplay } from 'vuetify'
  import AshField from '@/components/AshField.vue'
  import DeathLogo from '@/components/DeathLogo.vue'
  import StageStrip from '@/components/StageStrip.vue'
  import TourDates from '@/components/TourDates.vue'
  import WorkCard from '@/components/WorkCard.vue'
  import { profile } from '@/data/profile'
  import { works } from '@/data/works'
  import { stacked, wide } from '@/sketches/wordmark'

  const { xs } = useDisplay()
  const nav = ['works', 'tour', 'about', 'contact']
  const year = new Date().getFullYear()
</script>

<template>
  <v-app>
    <AshField />
    <div aria-hidden="true" class="grain" />

    <v-app-bar class="app-bar" color="transparent" density="comfortable" flat>
      <v-app-bar-title class="font-display d-none d-sm-flex">
        <a class="app-bar__logo" href="#top">{{ profile.handle }}</a>
      </v-app-bar-title>

      <v-spacer class="d-sm-none" />

      <v-btn
        v-for="item in nav"
        :key="item"
        :href="`#${item}`"
        size="small"
        variant="text"
      >
        {{ item }}
      </v-btn>
    </v-app-bar>

    <v-main class="main">
      <section id="top" class="hero">
        <DeathLogo
          v-if="xs"
          key="stacked"
          :aspect="1"
          :options="stacked"
        />

        <DeathLogo v-else key="wide" :options="wide" />
        <p class="hero__tagline">{{ profile.tagline }}</p>

        <v-btn
          aria-label="Scroll to works"
          class="hero__scroll"
          href="#works"
          :icon="mdiChevronDown"
          variant="text"
        />
      </section>

      <StageStrip :acts="profile.experience" />

      <v-container id="works" class="section">
        <h2 class="section__title">Works</h2>

        <v-row>
          <v-col
            v-for="work in works"
            :key="work.id"
            cols="12"
            lg="4"
            md="6"
          >
            <WorkCard :work="work" />
          </v-col>
        </v-row>
      </v-container>

      <v-container id="tour" class="section">
        <h2 class="section__title">Tour History</h2>
        <TourDates :dates="profile.experience" />
      </v-container>

      <v-container id="about" class="section">
        <h2 class="section__title">About</h2>

        <v-row>
          <v-col cols="12" md="7">
            <p v-for="(paragraph, i) in profile.about" :key="i" class="mb-4">{{ paragraph }}</p>
          </v-col>

          <v-col cols="12" md="5">
            <div class="d-flex flex-wrap ga-2">
              <v-chip
                v-for="tool in profile.tools"
                :key="tool"
                color="secondary"
                label
                variant="outlined"
              >
                {{ tool }}
              </v-chip>
            </div>
          </v-col>
        </v-row>
      </v-container>

      <v-container id="contact" class="section">
        <h2 class="section__title">Contact</h2>

        <div class="d-flex flex-wrap ga-3">
          <v-btn
            v-for="link in profile.links"
            :key="link.label"
            color="primary"
            :href="link.href"
            :prepend-icon="link.icon"
            rel="noopener"
            target="_blank"
            variant="outlined"
          >
            {{ link.label }}
          </v-btn>
        </div>
      </v-container>
    </v-main>

    <v-footer class="footer justify-center" color="transparent">
      © {{ year }} {{ profile.name }}
    </v-footer>
  </v-app>
</template>
