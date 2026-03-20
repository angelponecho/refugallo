<template>
  <div class="bg-bg-primary min-h-screen pt-16">
    <div v-if="theme" class="h-[calc(100vh-4rem)]">
      <!-- Swiper de lectura -->
      <div ref="readerEl" class="swiper w-full h-full">
        <div class="swiper-wrapper">
          <!-- Slides de texto -->
          <div
            v-for="(chunk, index) in textSlides"
            :key="index"
            class="swiper-slide"
          >
            <div class="w-full h-full flex flex-col md:flex-row">
              <!-- Imagen izquierda -->
              <div class="hidden md:block md:w-2/5 relative">
                <img
                  :src="theme.mainImg ?? `https://picsum.photos/seed/${theme.id}main/800/600`"
                  :alt="theme.title"
                  class="w-full h-full object-cover"
                  width="800"
                  height="600"
                />
                <div class="absolute inset-0 bg-gradient-to-r from-transparent to-bg-primary/60" aria-hidden="true" />
              </div>
              <!-- Texto derecha -->
              <div class="flex-1 flex flex-col justify-center px-8 md:px-16 py-12 bg-bg-primary">
                <div class="max-w-2xl">
                  <div class="flex items-center gap-2 mb-6">
                    <span class="text-brand text-sm font-medium">{{ index + 1 }} / {{ textSlides.length }}</span>
                    <div class="h-px flex-1 bg-border-dark" aria-hidden="true" />
                  </div>
                  <h1 class="font-headline text-4xl md:text-5xl text-white tracking-widest mb-3">{{ theme.title }}</h1>
                  <p class="text-brand text-base mb-8">{{ theme.subtitle }}</p>
                  <p class="text-text-muted text-base md:text-lg leading-relaxed whitespace-pre-line">{{ chunk }}</p>

                  <!-- Último slide: botones de acción -->
                  <div v-if="index === textSlides.length - 1" class="flex gap-4 mt-12 flex-wrap">
                    <AppButton
                      size="lg"
                      :loading="voting"
                      @click="handleVote"
                    >
                      Votar por este theme
                    </AppButton>
                    <NuxtLink to="/">
                      <AppButton size="lg" variant="secondary">Volver al inicio</AppButton>
                    </NuxtLink>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Navegación -->
        <div class="swiper-button-prev" aria-label="Página anterior" />
        <div class="swiper-button-next" aria-label="Página siguiente" />
        <div class="swiper-pagination" />
      </div>
    </div>

    <!-- Loading -->
    <div v-else-if="pending" class="flex items-center justify-center h-screen">
      <div class="animate-spin w-10 h-10 border-2 border-brand border-t-transparent rounded-full" aria-label="Cargando..." />
    </div>

    <!-- 404 -->
    <div v-else class="flex flex-col items-center justify-center h-screen gap-4">
      <p class="text-text-muted text-xl">Theme no encontrado.</p>
      <NuxtLink to="/"><AppButton>Volver al inicio</AppButton></NuxtLink>
    </div>
  </div>
</template>

<script setup lang="ts">
import Swiper from 'swiper'
import { Navigation, Pagination } from 'swiper/modules'
import 'swiper/css'
import 'swiper/css/navigation'
import 'swiper/css/pagination'

const route = useRoute()
const { getTheme } = useThemes()
const { vote } = useVotes()

const id = Number(route.params.id)
const readerEl = ref<HTMLElement | null>(null)
const voting = ref(false)
let swiper: Swiper | null = null

const { data: theme, pending } = await useAsyncData(`theme-${id}`, () => getTheme(id))

useHead(() => ({
  title: theme.value ? `${theme.value.title} — Refugallo` : 'Refugallo',
}))

const textSlides = computed(() => splitTextIntoChunks(theme.value?.text ?? ''))

onMounted(async () => {
  await nextTick()
  if (!readerEl.value) return

  swiper = new Swiper(readerEl.value, {
    modules: [Navigation, Pagination],
    speed: 500,
    navigation: { prevEl: '.swiper-button-prev', nextEl: '.swiper-button-next' },
    pagination: { el: '.swiper-pagination', clickable: true },
  })
})

onBeforeUnmount(() => swiper?.destroy())

async function handleVote() {
  voting.value = true
  await vote(id)
  voting.value = false
}
</script>
