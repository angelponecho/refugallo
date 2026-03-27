<template>
  <div class="bg-bg-primary">
    <!-- SECCIÓN 1: HERO SLIDER -->
    <section class="relative w-full h-screen overflow-hidden" aria-label="Themes destacados">
      <!-- Swiper principal -->
      <div ref="heroEl" class="swiper w-full h-full">
        <div class="swiper-wrapper">
          <div
            v-for="theme in themes"
            :key="theme.id"
            class="swiper-slide relative"
          >
            <!-- Imagen hero fondo -->
            <img
              :src="theme.heroImg ?? `https://picsum.photos/seed/${theme.id}hero/1920/1080`"
              :alt="theme.title"
              class="absolute inset-0 w-full h-full object-cover"
              loading="lazy"
              width="1920"
              height="1080"
            />
            <!-- Gradiente overlay -->
            <div class="absolute inset-0 bg-hero-gradient" aria-hidden="true" />
            <div class="absolute inset-0 bg-gradient-to-t from-bg-primary via-transparent to-transparent md:hidden" aria-hidden="true" />

            <!-- Contenido texto -->
            <div class="relative z-10 h-full flex items-center">
              <div class="w-full md:w-1/3 px-8 md:px-16 flex flex-col gap-6">
                <div
                  v-motion
                  :initial="{ opacity: 0, x: -30 }"
                  :enter="{ opacity: 1, x: 0, transition: { duration: 500 } }"
                >
                  <h1 class="font-headline text-5xl md:text-6xl lg:text-7xl text-white leading-none tracking-wide">
                    {{ theme.title }}
                  </h1>
                  <p class="text-text-muted text-lg mt-3">{{ theme.subtitle }}</p>
                </div>
                <div class="flex gap-3 flex-wrap items-center">
                  <NuxtLink :to="`/theme/${theme.id}`">
                    <AppButton size="lg">Ver</AppButton>
                  </NuxtLink>
                  <span v-if="userVoteId === theme.id" class="text-brand font-semibold text-lg">
                    Tu elección
                  </span>
                  <AppButton
                    v-else
                    size="lg"
                    variant="secondary"
                    :loading="votingId === theme.id"
                    @click="handleVote(theme.id)"
                  >
                    Votar
                  </AppButton>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div class="swiper-button-prev" aria-label="Theme anterior" />
        <div class="swiper-button-next" aria-label="Theme siguiente" />
        <div class="swiper-pagination" />
      </div>
    </section>

    <!-- SECCIÓN 2: SLIDER DE THUMBS -->
    <section class="bg-bg-secondary py-12" aria-label="Todos los themes">
      <div class="max-w-7xl mx-auto px-6">
        <h2
          v-motion
          :initial="{ opacity: 0, y: 20 }"
          :visible-once="{ opacity: 1, y: 0, transition: { duration: 500 } }"
          class="font-headline text-3xl text-white mb-8 tracking-widest"
        >
          THEMES
        </h2>
        <div class="flex flex-col gap-4">
          <div class="flex items-center gap-3">
            <button
              class="thumbs-button-prev shrink-0 w-9 h-9 rounded-full bg-bg-elevated border border-border-dark hover:border-brand hover:text-brand text-text-muted transition-all duration-200 flex items-center justify-center disabled:opacity-30 disabled:cursor-not-allowed"
              aria-label="Theme anterior"
            >
              <ChevronLeftIcon class="w-5 h-5" />
            </button>

            <div ref="thumbsEl" class="swiper flex-1 min-w-0">
              <div class="swiper-wrapper">
                <div
                  v-for="(theme, index) in themes"
                  :key="theme.id"
                  class="swiper-slide !w-40 md:!w-48 cursor-pointer"
                  @click="slideTo(index)"
                >
                  <div class="group relative aspect-[2/3] rounded-lg overflow-hidden border border-border-dark hover:border-brand transition-all duration-300">
                    <img
                      :src="theme.thumbImg ?? `https://picsum.photos/seed/${theme.id}thumb/400/600`"
                      :alt="theme.title"
                      class="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                      loading="lazy"
                      width="400"
                      height="600"
                    />
                    <div class="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-3">
                      <p class="text-white text-xs font-semibold line-clamp-2">{{ theme.title }}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <button
              class="thumbs-button-next shrink-0 w-9 h-9 rounded-full bg-bg-elevated border border-border-dark hover:border-brand hover:text-brand text-text-muted transition-all duration-200 flex items-center justify-center disabled:opacity-30 disabled:cursor-not-allowed"
              aria-label="Theme siguiente"
            >
              <ChevronRightIcon class="w-5 h-5" />
            </button>
          </div>

          <div class="thumbs-pagination swiper-pagination !static" />
        </div>
      </div>
    </section>

    <!-- SECCIÓN 3: CTA REGISTRO -->
    <section
      v-motion
      :initial="{ opacity: 0, y: 30 }"
      :visible-once="{ opacity: 1, y: 0, transition: { duration: 600 } }"
      class="bg-bg-primary py-24 text-center px-6"
      aria-label="Llamada a la acción"
    >
      <h2 class="font-headline text-4xl md:text-5xl text-white tracking-widest mb-4">
        ¿CUÁL ES TU THEME FAVORITO?
      </h2>
      <p class="text-text-muted text-lg max-w-xl mx-auto mb-8">
        Regístrate gratis y vota por el theme que más te apasione. ¡Tu voto puede cambiarlo todo!
      </p>
      <NuxtLink to="/registro">
        <AppButton size="lg">Registrarse y votar</AppButton>
      </NuxtLink>
    </section>
  </div>
</template>

<script setup lang="ts">
import Swiper from 'swiper'
import { Navigation, Pagination, Thumbs, Autoplay } from 'swiper/modules'
import 'swiper/css'
import 'swiper/css/navigation'
import 'swiper/css/pagination'
import { ChevronLeftIcon, ChevronRightIcon } from 'lucide-vue-next'
import type { Theme } from '~/types'

useHead({ title: 'Refugallo — Vota por tu theme favorito' })

const { getThemes } = useThemes()
const { vote, getCurrentVote } = useVotes()

const themes = ref<Theme[]>([])
const heroEl = ref<HTMLElement | null>(null)
const thumbsEl = ref<HTMLElement | null>(null)
const votingId = ref<number | null>(null)
const userVoteId = ref<number | null>(null)

let heroSwiper: Swiper | null = null
let thumbsSwiper: Swiper | null = null

onMounted(async () => {
  ;[themes.value, userVoteId.value] = await Promise.all([getThemes(), getCurrentVote()])

  await nextTick()

  thumbsSwiper = new Swiper(thumbsEl.value!, {
    modules: [Navigation, Pagination],
    slidesPerView: 'auto',
    spaceBetween: 12,
    freeMode: true,
    watchSlidesProgress: true,
    navigation: { prevEl: '.thumbs-button-prev', nextEl: '.thumbs-button-next' },
    pagination: { el: '.thumbs-pagination', clickable: true },
  })

  heroSwiper = new Swiper(heroEl.value!, {
    modules: [Navigation, Pagination, Thumbs, Autoplay],
    effect: 'fade',
    loop: themes.value.length > 1,
    speed: 800,
    autoplay: { delay: 6000, disableOnInteraction: false },
    navigation: { prevEl: '.swiper-button-prev', nextEl: '.swiper-button-next' },
    pagination: { el: '.swiper-pagination', clickable: true },
    thumbs: { swiper: thumbsSwiper },
  })
})

onBeforeUnmount(() => {
  heroSwiper?.destroy()
  thumbsSwiper?.destroy()
})

function slideTo(index: number) {
  heroSwiper?.slideTo(index)
}

async function handleVote(themeId: number) {
  votingId.value = themeId
  const success = await vote(themeId)
  if (success) {
    const t = themes.value.find(t => t.id === themeId)
    if (t) t.likes++
    userVoteId.value = themeId
  }
  votingId.value = null
}
</script>
