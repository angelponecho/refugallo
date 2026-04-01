<template>
  <header
    class="fixed top-0 left-0 right-0 z-40 transition-all duration-300"
    :class="isScrolled ? 'bg-bg-secondary/95 backdrop-blur-md shadow-lg' : 'bg-transparent'"
  >
    <div class="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between gap-8">
      <!-- Logo -->
      <NuxtLink to="/" class="text-2xl font-headline text-white tracking-widest hover:text-brand transition-colors shrink-0">
        REFUGALLO
      </NuxtLink>

      <!-- Nav desktop -->
      <nav class="hidden md:flex items-center gap-1" aria-label="Navegación principal">
        <NuxtLink
          v-for="link in navLinks"
          :key="link.to"
          :to="link.to"
          class="px-4 py-2 rounded-lg text-sm font-medium text-text-muted hover:text-white hover:bg-bg-elevated transition-all duration-200"
          :class="{ 'text-white': $route.path === link.to }"
        >
          {{ link.label }}
        </NuxtLink>
      </nav>

      <!-- Sesión -->
      <div class="hidden md:flex items-center gap-3 shrink-0">
        <template v-if="isLoggedIn">
          <NuxtLink :to="userProfileLink" class="flex items-center gap-2 hover:opacity-80 transition-opacity">
            <div class="w-8 h-8 rounded-full bg-brand flex items-center justify-center text-sm font-bold" aria-hidden="true">
              {{ userInitial }}
            </div>
            <span class="text-sm text-text-muted hover:text-white transition-colors">{{ userName }}</span>
          </NuxtLink>
          <AppButton variant="ghost" size="sm" @click="logout">Salir</AppButton>
        </template>
        <template v-else>
          <NuxtLink to="/registro">
            <AppButton size="sm">Iniciar sesión</AppButton>
          </NuxtLink>
        </template>
      </div>

      <!-- Hamburger mobile -->
      <button
        class="md:hidden text-white p-2 rounded-lg hover:bg-bg-elevated transition-colors"
        :aria-label="menuOpen ? 'Cerrar menú' : 'Abrir menú'"
        :aria-expanded="menuOpen"
        @click="menuOpen = !menuOpen"
      >
        <MenuIcon v-if="!menuOpen" class="w-6 h-6" />
        <XIcon v-else class="w-6 h-6" />
      </button>
    </div>

    <!-- Mobile menu -->
    <Transition name="slide-down">
      <div v-if="menuOpen" class="md:hidden bg-bg-secondary border-t border-border-dark px-6 py-4 flex flex-col gap-2">
        <NuxtLink
          v-for="link in navLinks"
          :key="link.to"
          :to="link.to"
          class="px-4 py-3 rounded-lg text-sm font-medium text-text-muted hover:text-white hover:bg-bg-elevated transition-all"
          @click="menuOpen = false"
        >
          {{ link.label }}
        </NuxtLink>
        <div class="border-t border-border-dark pt-3 mt-1">
          <template v-if="isLoggedIn">
            <NuxtLink :to="userProfileLink" class="block text-sm text-text-muted hover:text-white px-4 py-2 transition-colors" @click="menuOpen = false">{{ userName }}</NuxtLink>
            <button
              class="w-full text-left px-4 py-3 rounded-lg text-sm text-text-muted hover:text-white hover:bg-bg-elevated transition-all"
              @click="logout"
            >
              Cerrar sesión
            </button>
          </template>
          <template v-else>
            <NuxtLink to="/registro" @click="menuOpen = false">
              <AppButton class="w-full" size="sm">Iniciar sesión</AppButton>
            </NuxtLink>
          </template>
        </div>
      </div>
    </Transition>
  </header>
</template>

<script setup lang="ts">
import { MenuIcon, XIcon } from 'lucide-vue-next'

const { y } = useWindowScroll()
const isScrolled = computed(() => y.value > 50)
const menuOpen = ref(false)

const { isLoggedIn, isAdmin, profile, logout, fetchProfile } = useAuth()
const userName = computed(() => profile.value?.name ?? 'Usuario')
const userInitial = computed(() => userName.value.charAt(0).toUpperCase())
const userProfileLink = computed(() => isAdmin.value ? '/admin' : '/admin/usuario')

onMounted(async () => {
  if (isLoggedIn.value && !profile.value) {
    await fetchProfile()
  }
})

watch(isLoggedIn, async (loggedIn) => {
  if (loggedIn && !profile.value) await fetchProfile()
})

const navLinks = [
  { to: '/ranking', label: 'Ranking' },
  { to: '/quienes-somos', label: 'Quiénes somos' },
  { to: '/galeria', label: 'Galería' },
  { to: '/contacto', label: 'Contacto' },
]

// Cerrar menú al cambiar ruta
const route = useRoute()
watch(() => route.path, () => { menuOpen.value = false })
</script>

<style scoped>
.slide-down-enter-active, .slide-down-leave-active { transition: all 0.25s ease; }
.slide-down-enter-from, .slide-down-leave-to { opacity: 0; transform: translateY(-8px); }
</style>
