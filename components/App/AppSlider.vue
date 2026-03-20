<template>
  <div :class="wrapperClass">
    <div ref="swiperEl" class="swiper w-full h-full">
      <div class="swiper-wrapper">
        <slot />
      </div>
      <div v-if="navigation" class="swiper-button-prev" aria-label="Slide anterior" />
      <div v-if="navigation" class="swiper-button-next" aria-label="Slide siguiente" />
      <div v-if="pagination" class="swiper-pagination" />
    </div>
  </div>
</template>

<script setup lang="ts">
import Swiper from 'swiper'
import { Navigation, Pagination, Autoplay, EffectFade, Thumbs } from 'swiper/modules'
import 'swiper/css'
import 'swiper/css/navigation'
import 'swiper/css/pagination'
import 'swiper/css/effect-fade'

const props = withDefaults(defineProps<{
  effect?: 'slide' | 'fade'
  autoplay?: boolean
  autoplayDelay?: number
  navigation?: boolean
  pagination?: boolean
  loop?: boolean
  slidesPerView?: number | 'auto'
  spaceBetween?: number
  speed?: number
  wrapperClass?: string
  thumbsSwiper?: Swiper | null
  breakpoints?: Record<number, object>
}>(), {
  effect: 'slide',
  autoplay: false,
  autoplayDelay: 5000,
  navigation: false,
  pagination: false,
  loop: false,
  slidesPerView: 1,
  spaceBetween: 0,
  speed: 500,
  wrapperClass: '',
  thumbsSwiper: null,
})

const emit = defineEmits<{
  swiper: [swiper: Swiper]
  slideChange: [swiper: Swiper]
}>()

const swiperEl = ref<HTMLElement | null>(null)
let swiperInstance: Swiper | null = null

onMounted(() => {
  if (!swiperEl.value) return

  const modules = [Navigation, Pagination, Autoplay, EffectFade, Thumbs]

  swiperInstance = new Swiper(swiperEl.value, {
    modules,
    effect: props.effect,
    loop: props.loop,
    speed: props.speed,
    slidesPerView: props.slidesPerView,
    spaceBetween: props.spaceBetween,
    breakpoints: props.breakpoints,
    navigation: props.navigation ? { prevEl: '.swiper-button-prev', nextEl: '.swiper-button-next' } : false,
    pagination: props.pagination ? { el: '.swiper-pagination', clickable: true } : false,
    autoplay: props.autoplay ? { delay: props.autoplayDelay, disableOnInteraction: false } : false,
    thumbs: props.thumbsSwiper ? { swiper: props.thumbsSwiper } : undefined,
    on: {
      init: (swiper) => emit('swiper', swiper),
      slideChange: (swiper) => emit('slideChange', swiper),
    },
  })
})

onBeforeUnmount(() => swiperInstance?.destroy())

defineExpose({ swiperInstance })
</script>
