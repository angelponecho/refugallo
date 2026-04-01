<template>
  <article
    class="group relative bg-bg-elevated rounded-lg overflow-hidden border border-border-dark hover:border-brand transition-all duration-300 cursor-pointer"
    @click="$emit('click', theme)"
  >
    <!-- Imagen -->
    <div class="relative aspect-[3/4] overflow-hidden">
      <img
        :src="theme.thumbImg ?? `https://picsum.photos/seed/${theme.id}/400/600`"
        :alt="theme.title"
        loading="lazy"
        class="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
        width="400"
        height="600"
      />
      <!-- Overlay hover -->
      <div class="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-4">
        <p class="text-text-muted text-sm line-clamp-2">{{ theme.subtitle }}</p>
      </div>
      <!-- Rank badge -->
      <div v-if="rank" class="absolute top-3 left-3 bg-brand text-white text-sm font-bold w-8 h-8 rounded-full flex items-center justify-center">
        {{ rank }}
      </div>
    </div>

    <!-- Info -->
    <div class="p-4 flex flex-col gap-3">
      <h3 class="font-headline text-xl text-white tracking-wide leading-tight line-clamp-2">{{ theme.title }}</h3>

      <div class="flex items-center justify-between">
        <div class="flex items-center gap-1.5 text-text-muted text-sm">
          <HeartIcon class="w-4 h-4 text-brand" aria-hidden="true" />
          <span>{{ theme.likes }} votos</span>
        </div>

        <span
          v-if="showVoteButton && isUserVote"
          class="text-brand text-sm font-semibold"
        >Tu elección</span>

        <AppButton
          v-else-if="showVoteButton"
          size="sm"
          :loading="voting"
          :aria-label="`Votar por ${theme.title}`"
          @click.stop="handleVote"
        >
          Votar
        </AppButton>

        <NuxtLink v-else :to="`/theme/${theme.id}`" @click.stop>
          <AppButton size="sm" variant="secondary" :aria-label="`Ver ${theme.title}`">Ver</AppButton>
        </NuxtLink>
      </div>
    </div>
  </article>
</template>

<script setup lang="ts">
import { HeartIcon } from 'lucide-vue-next'
import type { Theme } from '~/types'

const props = withDefaults(defineProps<{
  theme: Theme
  showVoteButton?: boolean
  isUserVote?: boolean
  rank?: number
}>(), { showVoteButton: false, isUserVote: false })

const emit = defineEmits<{
  click: [theme: Theme]
  voted: [themeId: number]
}>()

const voting = ref(false)
const { vote } = useVotes()

async function handleVote() {
  voting.value = true
  const success = await vote(props.theme.id)
  if (success) emit('voted', props.theme.id)
  voting.value = false
}
</script>
