<template>
  <div class="min-h-screen bg-bg-primary font-body text-white flex">
    <!-- Sidebar -->
    <aside class="w-64 bg-bg-secondary border-r border-border-dark flex flex-col fixed h-full z-20">
      <div class="p-6 border-b border-border-dark">
        <NuxtLink to="/" class="text-2xl font-headline text-brand tracking-widest">
          REFUGALLO
        </NuxtLink>
        <p class="text-text-muted text-xs mt-1">Panel de administración</p>
      </div>

      <nav class="flex-1 p-4 space-y-1">
        <ClientOnly>
          <!-- Navegación para admins -->
          <template v-if="isAdmin">
            <NuxtLink
              to="/admin"
              class="flex items-center gap-3 px-4 py-3 rounded-lg text-sm transition-colors hover:bg-bg-elevated"
              :class="$route.path === '/admin' ? 'bg-bg-elevated text-brand' : 'text-text-muted'"
            >
              <LayoutGridIcon class="w-5 h-5" />
              Dashboard
            </NuxtLink>
            <NuxtLink
              to="/admin/usuarios"
              class="flex items-center gap-3 px-4 py-3 rounded-lg text-sm transition-colors hover:bg-bg-elevated"
              :class="$route.path.startsWith('/admin/usuarios') ? 'bg-bg-elevated text-brand' : 'text-text-muted'"
            >
              <UsersIcon class="w-5 h-5" />
              Usuarios
            </NuxtLink>
            <NuxtLink
              to="/admin/themes"
              class="flex items-center gap-3 px-4 py-3 rounded-lg text-sm transition-colors hover:bg-bg-elevated"
              :class="$route.path.startsWith('/admin/themes') ? 'bg-bg-elevated text-brand' : 'text-text-muted'"
            >
              <ImageIcon class="w-5 h-5" />
              Themes
            </NuxtLink>
          </template>

          <!-- Navegación para usuarios normales -->
          <template v-else>
            <NuxtLink
              to="/admin/usuario"
              class="flex items-center gap-3 px-4 py-3 rounded-lg text-sm transition-colors hover:bg-bg-elevated"
              :class="$route.path === '/admin/usuario' ? 'bg-bg-elevated text-brand' : 'text-text-muted'"
            >
              <UserIcon class="w-5 h-5" />
              Mi perfil
            </NuxtLink>
          </template>
        </ClientOnly>
      </nav>

      <div class="p-4 border-t border-border-dark">
        <button
          class="flex items-center gap-3 w-full px-4 py-3 rounded-lg text-sm text-text-muted hover:text-white hover:bg-bg-elevated transition-colors"
          @click="handleLogout"
        >
          <LogOutIcon class="w-5 h-5" />
          Cerrar sesión
        </button>
      </div>
    </aside>

    <!-- Main content -->
    <div class="flex-1 ml-64 flex flex-col min-h-screen">
      <header class="bg-bg-secondary border-b border-border-dark px-8 py-4 flex items-center justify-between">
        <h1 class="text-lg font-semibold">{{ pageTitle }}</h1>
        <div class="flex items-center gap-3">
          <div class="w-8 h-8 rounded-full bg-brand flex items-center justify-center text-sm font-bold">
            {{ adminInitial }}
          </div>
          <span class="text-sm text-text-muted">{{ adminName }}</span>
        </div>
      </header>

      <main class="flex-1 p-8">
        <slot />
      </main>
    </div>

    <AppToast />
  </div>
</template>

<script setup lang="ts">
import { UsersIcon, LayoutGridIcon, LogOutIcon, ImageIcon, UserIcon } from 'lucide-vue-next'

const route = useRoute()
const { profile, logout, isAdmin, fetchProfile } = useAuth()

onMounted(fetchProfile)

const adminName = computed(() => profile.value?.name ?? 'Admin')
const adminInitial = computed(() => adminName.value.charAt(0).toUpperCase())

const pageTitles: Record<string, string> = {
  '/admin': 'Dashboard',
  '/admin/usuarios': 'Gestión de Usuarios',
  '/admin/themes': 'Gestión de Themes',
  '/admin/usuario': 'Mi Perfil',
}
const pageTitle = computed(() => pageTitles[route.path] ?? 'Admin')

async function handleLogout() {
  await logout()
  await navigateTo('/registro')
}
</script>
