<template>
  <div class="flex flex-col gap-8 max-w-xl">
    <div>
      <h1 class="font-headline text-4xl text-white tracking-widest">MI PERFIL</h1>
      <p class="text-text-muted mt-1">Gestiona tu cuenta personal.</p>
    </div>

    <!-- Datos personales -->
    <div class="bg-bg-elevated border border-border-dark rounded-xl p-6 flex flex-col gap-5">
      <h2 class="text-lg font-semibold text-white">Datos personales</h2>

      <form class="flex flex-col gap-4" @submit.prevent="handleSave">
        <AppInput
          v-model="form.name"
          label="Nombre"
          placeholder="Tu nombre"
          required
        />
        <AppInput
          v-if="isAdmin"
          v-model="form.photo"
          label="URL de foto (opcional)"
          placeholder="https://..."
          type="url"
        />

        <!-- Rol: solo lectura, no editable -->
        <div v-if="isAdmin" class="flex flex-col gap-1.5">
          <span class="text-sm font-medium text-text-muted">Rol</span>
          <div class="flex items-center gap-2 px-4 py-3 bg-bg-primary border border-border-dark rounded-lg">
            <span class="px-2 py-0.5 rounded text-xs font-medium bg-bg-elevated text-text-muted">
              usuario
            </span>
            <span class="text-text-muted text-xs">El rol no puede modificarse</span>
          </div>
        </div>

        <AppButton type="submit" :loading="saving">Guardar cambios</AppButton>
      </form>
    </div>

    <!-- Voto actual -->
    <div class="bg-bg-elevated border border-border-dark rounded-xl p-6 flex flex-col gap-4">
      <h2 class="text-lg font-semibold text-white">Tu voto</h2>

      <div v-if="votedTheme" class="flex items-center gap-4">
        <img
          v-if="votedTheme.thumbImg"
          :src="votedTheme.thumbImg"
          :alt="votedTheme.title"
          class="w-16 h-16 rounded-lg object-cover"
        />
        <div>
          <p class="text-white font-semibold">{{ votedTheme.title }}</p>
          <p class="text-text-muted text-sm">{{ votedTheme.likes }} votos</p>
        </div>
        <NuxtLink
          :to="`/theme/${votedTheme.id}`"
          class="ml-auto text-brand text-sm hover:underline"
        >
          Ver theme
        </NuxtLink>
      </div>

      <p v-else class="text-text-muted text-sm">
        Aún no has votado por ningún theme.
        <NuxtLink to="/" class="text-brand hover:underline">Ver themes</NuxtLink>
      </p>
    </div>

    <!-- Zona de peligro -->
    <div class="border border-red-900/50 rounded-xl p-6 flex flex-col gap-4">
      <h2 class="text-lg font-semibold text-red-400">Eliminar cuenta</h2>
      <p class="text-text-muted text-sm">
        Esta acción es permanente. Se eliminarán tu cuenta y tu voto, y se actualizará el contador del theme votado.
      </p>
      <AppButton variant="danger" @click="deleteModalOpen = true">Eliminar mi cuenta</AppButton>
    </div>

    <!-- Modal confirmar eliminación -->
    <AppModal v-model="deleteModalOpen" title="Eliminar cuenta" size="sm">
      <div class="flex flex-col gap-4">
        <p class="text-text-muted">
          ¿Seguro que quieres eliminar tu cuenta?
          <strong class="text-white block mt-1">Esta acción no se puede deshacer.</strong>
        </p>
        <div class="flex gap-3 justify-end">
          <AppButton variant="ghost" @click="deleteModalOpen = false">Cancelar</AppButton>
          <AppButton variant="danger" :loading="deleting" @click="handleDelete">Eliminar</AppButton>
        </div>
      </div>
    </AppModal>
  </div>
</template>

<script setup lang="ts">
import type { Theme } from '~/types'
import type { Database } from '~/types/database.types'

definePageMeta({ layout: 'admin', middleware: 'auth' })
useHead({ title: 'Mi perfil — Refugallo' })

const supabase = useSupabaseClient<Database>()
const { profile, fetchProfile, isAdmin } = useAuth()
const toast = useToastStore()

async function getAuthHeaders() {
  const { data: { session } } = await supabase.auth.getSession()
  return { Authorization: `Bearer ${session?.access_token}` }
}

// Los admins no usan esta página — tienen /admin
onMounted(async () => {
  await fetchProfile()
  if (isAdmin.value) await navigateTo('/admin')
})

// Formulario
const form = reactive({ name: '', photo: '' })
const saving = ref(false)

watch(profile, (p) => {
  if (p) {
    form.name = p.name ?? ''
    form.photo = p.photo ?? ''
  }
}, { immediate: true })

async function handleSave() {
  saving.value = true
  try {
    await $fetch('/api/profile', {
      method: 'PUT',
      headers: await getAuthHeaders(),
      body: { name: form.name.trim(), photo: form.photo || null },
    })
    await fetchProfile()
    toast.show('Perfil actualizado', 'success')
  }
  catch (e: any) {
    toast.show(e?.data?.message ?? e?.message ?? 'Error al guardar', 'error')
  }
  finally {
    saving.value = false
  }
}

// Voto actual

const { getCurrentVote } = useVotes()
const votedTheme = ref<Theme | null>(null)

async function loadVote() {
  const { data: { session } } = await supabase.auth.getSession()
  if (!session?.user) return
  const themeId = await getCurrentVote()
  if (themeId) {
    const { data } = await supabase.from('themes').select('*').eq('id', themeId).single()
    votedTheme.value = data as Theme | null
  }
}

onMounted(loadVote)

// Eliminar cuenta
const deleteModalOpen = ref(false)
const deleting = ref(false)

async function handleDelete() {
  deleting.value = true
  try {
    await $fetch('/api/profile', { method: 'DELETE', headers: await getAuthHeaders() })
    toast.show('Cuenta eliminada', 'info')
    await navigateTo('/')
  }
  catch (e: any) {
    toast.show(e?.data?.message ?? 'Error al eliminar', 'error')
  }
  finally {
    deleting.value = false
  }
}
</script>
