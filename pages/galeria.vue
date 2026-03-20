<template>
  <div class="bg-bg-primary min-h-screen pt-16">
    <!-- Hero -->
    <section class="py-20 text-center px-6">
      <h1
        v-motion
        :initial="{ opacity: 0, y: 20 }"
        :enter="{ opacity: 1, y: 0, transition: { duration: 500 } }"
        class="font-headline text-5xl md:text-7xl text-white tracking-widest mb-4"
      >
        GALERÍA
      </h1>
      <p class="text-text-muted text-lg max-w-xl mx-auto">
        Imágenes y vídeos de los temas más votados de la comunidad.
      </p>
    </section>

    <!-- Galería masonry -->
    <section class="max-w-7xl mx-auto px-6 pb-16" aria-label="Galería de imágenes">
      <MasonryWall :items="galleryItems" :column-width="300" :gap="16">
        <template #default="{ item }">
          <button
            class="w-full rounded-lg overflow-hidden border border-border-dark hover:border-brand transition-all duration-300 group focus-visible:ring-2 focus-visible:ring-brand"
            :aria-label="`Ver imagen: ${item.title}`"
            @click="openLightbox(item)"
          >
            <div class="relative overflow-hidden">
              <img
                :src="item.src"
                :alt="item.title"
                class="w-full object-cover transition-transform duration-500 group-hover:scale-105"
                loading="lazy"
                width="300"
              />
              <div class="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                <ZoomInIcon class="w-8 h-8 text-white" aria-hidden="true" />
              </div>
            </div>
            <div class="bg-bg-elevated p-3 text-left">
              <p class="text-white text-sm font-medium truncate">{{ item.title }}</p>
            </div>
          </button>
        </template>
      </MasonryWall>
    </section>

    <!-- CTA inferior -->
    <section
      v-motion
      :initial="{ opacity: 0, y: 30 }"
      :visible-once="{ opacity: 1, y: 0, transition: { duration: 600 } }"
      class="bg-bg-secondary border-t border-border-dark py-20 px-6 text-center"
    >
      <h2 class="font-headline text-4xl md:text-5xl text-white tracking-widest mb-4">
        VOTA POR TU THEME FAVORITO
      </h2>
      <p class="text-text-muted text-lg max-w-xl mx-auto mb-8">
        Elige el tema que más te apasione y pulsa <strong class="text-white">Votar</strong>. Tu opinión decide el ranking.
      </p>
      <div class="flex gap-4 justify-center flex-wrap">
        <NuxtLink to="/"><AppButton size="lg">Ver themes</AppButton></NuxtLink>
        <NuxtLink to="/registro"><AppButton size="lg" variant="secondary">Registrarse</AppButton></NuxtLink>
      </div>
    </section>

    <!-- Lightbox -->
    <AppModal v-model="lightboxOpen" :title="selectedItem?.title" size="lg">
      <div v-if="selectedItem" class="flex flex-col gap-4">
        <img
          :src="selectedItem.src"
          :alt="selectedItem.title"
          class="w-full rounded-lg object-contain max-h-[60vh]"
        />
        <p class="text-text-muted text-sm text-center">{{ selectedItem.title }}</p>
      </div>
    </AppModal>
  </div>
</template>

<script setup lang="ts">
import { ZoomInIcon } from 'lucide-vue-next'
import { MasonryWall } from '@yeger/vue-masonry-wall'

useHead({ title: 'Galería — Refugallo' })

interface GalleryItem { src: string; title: string }

const lightboxOpen = ref(false)
const selectedItem = ref<GalleryItem | null>(null)

const galleryItems: GalleryItem[] = Array.from({ length: 18 }, (_, i) => ({
  src: `https://picsum.photos/seed/gallery${i + 1}/${300 + (i % 3) * 50}/${200 + (i % 4) * 60}`,
  title: `Imagen ${i + 1}`,
}))

function openLightbox(item: GalleryItem) {
  selectedItem.value = item
  lightboxOpen.value = true
}
</script>
