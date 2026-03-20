<template>
  <div class="flex flex-col gap-8">
    <div>
      <h1 class="font-headline text-4xl text-white tracking-widest">DASHBOARD</h1>
      <p class="text-text-muted mt-1">Resumen del sistema de votaciones.</p>
    </div>

    <!-- Stats -->
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      <div
        v-for="stat in stats"
        :key="stat.label"
        class="bg-bg-elevated border border-border-dark rounded-xl p-6 flex flex-col gap-2"
      >
        <div class="flex items-center justify-between">
          <span class="text-text-muted text-sm">{{ stat.label }}</span>
          <component :is="stat.icon" class="w-5 h-5 text-brand" aria-hidden="true" />
        </div>
        <div class="font-headline text-4xl text-white">{{ stat.value }}</div>
      </div>
    </div>

    <!-- Accesos rápidos -->
    <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
      <NuxtLink
        to="/admin/themes"
        class="bg-bg-elevated border border-border-dark rounded-xl p-6 hover:border-brand transition-all duration-300 group"
      >
        <LayoutGridIcon class="w-8 h-8 text-brand mb-3" aria-hidden="true" />
        <h2 class="font-semibold text-white group-hover:text-brand transition-colors">Gestionar Themes</h2>
        <p class="text-text-muted text-sm mt-1">Añadir, editar, reordenar y publicar themes.</p>
      </NuxtLink>
      <NuxtLink
        to="/admin/usuarios"
        class="bg-bg-elevated border border-border-dark rounded-xl p-6 hover:border-brand transition-all duration-300 group"
      >
        <UsersIcon class="w-8 h-8 text-brand mb-3" aria-hidden="true" />
        <h2 class="font-semibold text-white group-hover:text-brand transition-colors">Gestionar Usuarios</h2>
        <p class="text-text-muted text-sm mt-1">Ver, editar roles y eliminar cuentas.</p>
      </NuxtLink>
    </div>
  </div>
</template>

<script setup lang="ts">
import { LayoutGridIcon, UsersIcon, HeartIcon, EyeIcon } from 'lucide-vue-next'

definePageMeta({ layout: 'admin', middleware: 'admin' })
useHead({ title: 'Admin Dashboard — Refugallo' })

const supabase = useSupabaseClient()

const { data: themesCount } = await useAsyncData('admin-themes-count', async () => {
  const { count } = await supabase.from('themes').select('*', { count: 'exact', head: true })
  return count ?? 0
})

const { data: usersCount } = await useAsyncData('admin-users-count', async () => {
  const { count } = await supabase.from('profiles').select('*', { count: 'exact', head: true })
  return count ?? 0
})

const { data: votesCount } = await useAsyncData('admin-votes-count', async () => {
  const { count } = await supabase.from('votes').select('*', { count: 'exact', head: true })
  return count ?? 0
})

const { data: visibleCount } = await useAsyncData('admin-visible-count', async () => {
  const { count } = await supabase.from('themes').select('*', { count: 'exact', head: true }).eq('visible', true)
  return count ?? 0
})

const stats = computed(() => [
  { label: 'Themes totales', value: themesCount.value, icon: LayoutGridIcon },
  { label: 'Themes visibles', value: visibleCount.value, icon: EyeIcon },
  { label: 'Usuarios registrados', value: usersCount.value, icon: UsersIcon },
  { label: 'Votos totales', value: votesCount.value, icon: HeartIcon },
])
</script>
