<template>
  <div class="min-h-screen bg-bg-primary font-body text-white flex">
    <!-- Sidebar -->
    <aside
      :class="[
        'bg-bg-secondary border-r border-border-dark flex flex-col fixed h-full z-20 transition-all duration-300 overflow-hidden',
        collapsed ? 'w-16' : 'w-64',
      ]"
    >
      <!-- Logo + toggle -->
      <div class="border-b border-border-dark p-4">
        <!-- Expandido: logo + botón en la misma fila -->
        <template v-if="!collapsed">
          <div class="flex items-center justify-between">
            <NuxtLink to="/" class="text-2xl font-headline text-brand tracking-widest leading-none">
              REFUGALLO
            </NuxtLink>
            <button
              class="text-text-muted hover:text-white transition-colors shrink-0"
              aria-label="Colapsar menú"
              @click="collapsed = !collapsed"
            >
              <MenuIcon class="w-5 h-5" />
            </button>
          </div>
          <p class="text-text-muted text-xs mt-1">Panel de administración</p>
        </template>

        <!-- Colapsado: logo arriba, botón debajo -->
        <template v-else>
          <div class="flex flex-col items-center gap-3">
            <NuxtLink to="/" class="text-xl font-headline text-brand tracking-widest leading-none">
              R
            </NuxtLink>
            <button
              class="text-text-muted hover:text-white transition-colors"
              aria-label="Expandir menú"
              @click="collapsed = !collapsed"
            >
              <MenuIcon class="w-5 h-5" />
            </button>
          </div>
        </template>
      </div>

      <!-- Nav -->
      <nav class="flex-1 p-2 space-y-1">
        <ClientOnly>
          <!-- Navegación para admins -->
          <template v-if="isAdmin">
            <NuxtLink
              to="/admin"
              :class="[
                'flex items-center py-3 rounded-lg text-sm transition-colors hover:bg-bg-elevated',
                collapsed ? 'justify-center px-3' : 'gap-3 px-4',
                $route.path === '/admin' ? 'bg-bg-elevated text-brand' : 'text-text-muted',
              ]"
              :title="collapsed ? 'Dashboard' : undefined"
            >
              <LayoutGridIcon class="w-5 h-5 shrink-0" />
              <span v-if="!collapsed">Dashboard</span>
            </NuxtLink>
            <NuxtLink
              to="/admin/usuarios"
              :class="[
                'flex items-center py-3 rounded-lg text-sm transition-colors hover:bg-bg-elevated',
                collapsed ? 'justify-center px-3' : 'gap-3 px-4',
                $route.path.startsWith('/admin/usuarios') ? 'bg-bg-elevated text-brand' : 'text-text-muted',
              ]"
              :title="collapsed ? 'Usuarios' : undefined"
            >
              <UsersIcon class="w-5 h-5 shrink-0" />
              <span v-if="!collapsed">Usuarios</span>
            </NuxtLink>
            <NuxtLink
              to="/admin/themes"
              :class="[
                'flex items-center py-3 rounded-lg text-sm transition-colors hover:bg-bg-elevated',
                collapsed ? 'justify-center px-3' : 'gap-3 px-4',
                $route.path.startsWith('/admin/themes') ? 'bg-bg-elevated text-brand' : 'text-text-muted',
              ]"
              :title="collapsed ? 'Themes' : undefined"
            >
              <ImageIcon class="w-5 h-5 shrink-0" />
              <span v-if="!collapsed">Themes</span>
            </NuxtLink>
            <NuxtLink
              to="/admin/votaciones"
              :class="[
                'flex items-center py-3 rounded-lg text-sm transition-colors hover:bg-bg-elevated',
                collapsed ? 'justify-center px-3' : 'gap-3 px-4',
                $route.path.startsWith('/admin/votaciones') ? 'bg-bg-elevated text-brand' : 'text-text-muted',
              ]"
              :title="collapsed ? 'Votaciones' : undefined"
            >
              <BarChart2Icon class="w-5 h-5 shrink-0" />
              <span v-if="!collapsed">Votaciones</span>
            </NuxtLink>
          </template>

          <!-- Navegación para usuarios normales -->
          <template v-else>
            <NuxtLink
              to="/admin/usuario"
              :class="[
                'flex items-center py-3 rounded-lg text-sm transition-colors hover:bg-bg-elevated',
                collapsed ? 'justify-center px-3' : 'gap-3 px-4',
                $route.path === '/admin/usuario' ? 'bg-bg-elevated text-brand' : 'text-text-muted',
              ]"
              :title="collapsed ? 'Mi perfil' : undefined"
            >
              <UserIcon class="w-5 h-5 shrink-0" />
              <span v-if="!collapsed">Mi perfil</span>
            </NuxtLink>
            <NuxtLink
              to="/admin/usuario/voto"
              :class="[
                'flex items-center py-3 rounded-lg text-sm transition-colors hover:bg-bg-elevated',
                collapsed ? 'justify-center px-3' : 'gap-3 px-4',
                $route.path === '/admin/usuario/voto' ? 'bg-bg-elevated text-brand' : 'text-text-muted',
              ]"
              :title="collapsed ? 'Mi voto' : undefined"
            >
              <BarChart2Icon class="w-5 h-5 shrink-0" />
              <span v-if="!collapsed">Mi voto</span>
            </NuxtLink>
          </template>
        </ClientOnly>
      </nav>

      <!-- Logout -->
      <div class="p-2 border-t border-border-dark">
        <button
          :class="[
            'flex items-center w-full py-3 rounded-lg text-sm text-text-muted hover:text-white hover:bg-bg-elevated transition-colors',
            collapsed ? 'justify-center px-3' : 'gap-3 px-4',
          ]"
          :title="collapsed ? 'Cerrar sesión' : undefined"
          @click="handleLogout"
        >
          <LogOutIcon class="w-5 h-5 shrink-0" />
          <span v-if="!collapsed">Cerrar sesión</span>
        </button>
      </div>
    </aside>

    <!-- Main content -->
    <div
      :class="[
        'flex-1 flex flex-col min-h-screen transition-all duration-300',
        collapsed ? 'ml-16' : 'ml-64',
      ]"
    >
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
import { UsersIcon, LayoutGridIcon, LogOutIcon, ImageIcon, UserIcon, BarChart2Icon, MenuIcon } from 'lucide-vue-next'

const route = useRoute()
const { profile, logout, isAdmin, fetchProfile } = useAuth()

const collapsed = ref(false)

onMounted(fetchProfile)

const adminName = computed(() => profile.value?.name ?? 'Admin')
const adminInitial = computed(() => adminName.value.charAt(0).toUpperCase())

const pageTitles: Record<string, string> = {
  '/admin': 'Dashboard',
  '/admin/usuarios': 'Gestión de Usuarios',
  '/admin/themes': 'Gestión de Themes',
  '/admin/votaciones': 'Gestión de Votaciones',
  '/admin/usuario': 'Mi Perfil',
  '/admin/usuario/voto': 'Mi Voto',
}
const pageTitle = computed(() => pageTitles[route.path] ?? 'Admin')

async function handleLogout() {
  await logout()
  await navigateTo('/registro')
}
</script>
