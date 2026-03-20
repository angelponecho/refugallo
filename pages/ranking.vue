<template>
  <div class="bg-bg-primary min-h-screen pt-16">
    <!-- Hero -->
    <section class="relative py-24 px-6 text-center overflow-hidden">
      <div class="absolute inset-0 bg-gradient-to-b from-brand/10 to-transparent" aria-hidden="true" />
      <div
        v-motion
        :initial="{ opacity: 0, y: 30 }"
        :enter="{ opacity: 1, y: 0, transition: { duration: 600 } }"
        class="relative max-w-3xl mx-auto"
      >
        <p class="text-brand text-sm font-semibold uppercase tracking-widest mb-3">Ranking oficial</p>
        <h1 class="font-headline text-5xl md:text-7xl text-white tracking-widest leading-none mb-4">
          <template v-if="topTheme">
            "{{ topTheme.title }}" ES EL #1
          </template>
          <template v-else>EL RANKING</template>
        </h1>
        <p class="text-text-muted text-lg mb-8">
          Regístrate y vota por tu theme favorito para cambiar el ranking.
        </p>
        <NuxtLink to="/"><AppButton size="lg">Ver themes y votar</AppButton></NuxtLink>
      </div>
    </section>

    <!-- Lista ranking -->
    <section class="max-w-4xl mx-auto px-6 pb-24" aria-label="Lista de themes por votos">
      <ol class="flex flex-col gap-4">
        <li
          v-for="(theme, index) in ranking"
          :key="theme.id"
          v-motion
          :initial="{ opacity: 0, x: -20 }"
          :visible-once="{ opacity: 1, x: 0, transition: { duration: 400, delay: index * 60 } }"
        >
          <NuxtLink
            :to="`/theme/${theme.id}`"
            class="group flex items-center gap-5 bg-bg-elevated border border-border-dark rounded-xl p-4 hover:border-brand transition-all duration-300"
          >
            <!-- Posición -->
            <div
              class="w-10 h-10 rounded-full flex items-center justify-center font-headline text-xl shrink-0"
              :class="index === 0 ? 'bg-yellow-500 text-black' : index === 1 ? 'bg-slate-400 text-black' : index === 2 ? 'bg-amber-700 text-white' : 'bg-bg-primary text-text-muted'"
            >
              {{ index + 1 }}
            </div>

            <!-- Imagen -->
            <img
              :src="theme.thumbImg ?? `https://picsum.photos/seed/${theme.id}thumb/80/120`"
              :alt="theme.title"
              class="w-14 h-20 object-cover rounded-lg shrink-0"
              loading="lazy"
              width="56"
              height="80"
            />

            <!-- Info -->
            <div class="flex-1 min-w-0">
              <h2 class="font-headline text-xl text-white tracking-wide truncate group-hover:text-brand transition-colors">
                {{ theme.title }}
              </h2>
              <p class="text-text-muted text-sm truncate">{{ theme.subtitle }}</p>
            </div>

            <!-- Votos -->
            <div class="flex items-center gap-2 shrink-0">
              <HeartIcon class="w-4 h-4 text-brand" aria-hidden="true" />
              <span class="font-semibold text-white">{{ theme.likes }}</span>
              <span class="text-text-muted text-sm">votos</span>
            </div>
          </NuxtLink>
        </li>
      </ol>

      <div v-if="ranking.length === 0 && !pending" class="text-center py-20 text-text-muted">
        Aún no hay votos. ¡Sé el primero!
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
import { HeartIcon } from 'lucide-vue-next'

useHead({ title: 'Ranking — Refugallo' })

const { getRanking } = useThemes()
const { data: ranking, pending } = await useAsyncData('ranking', getRanking, { default: () => [] })
const topTheme = computed(() => ranking.value?.[0] ?? null)
</script>
