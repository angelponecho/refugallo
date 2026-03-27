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
          v-model="form.email"
          label="Email"
          type="email"
          placeholder="tu@email.com"
          required
        />

        <AppButton type="submit" :loading="saving">Guardar cambios</AppButton>
      </form>
    </div>

    <!-- Cambiar contraseña -->
    <div class="bg-bg-elevated border border-border-dark rounded-xl p-6 flex flex-col gap-5">
      <h2 class="text-lg font-semibold text-white">Cambiar contraseña</h2>

      <form class="flex flex-col gap-4" @submit.prevent="handlePasswordChange">
        <AppInput
          v-model="pwForm.newPw"
          label="Nueva contraseña"
          type="password"
          placeholder="Mínimo 6 caracteres"
          required
        />
        <AppInput
          v-model="pwForm.confirm"
          label="Confirmar contraseña"
          type="password"
          placeholder="Repite la nueva contraseña"
          required
        />
        <AppButton type="submit" :loading="savingPw">Cambiar contraseña</AppButton>
      </form>
    </div>

    <!-- Voto actual -->
    <div class="bg-bg-elevated border border-border-dark rounded-xl p-6 flex flex-col gap-4">
      <h2 class="text-lg font-semibold text-white">Tu voto</h2>

      <div v-if="votedTheme" class="flex items-center gap-3">
        <img
          v-if="votedTheme.thumbImg"
          :src="votedTheme.thumbImg"
          :alt="votedTheme.title"
          class="w-12 h-12 rounded-lg object-cover shrink-0"
        />
        <div class="min-w-0">
          <p class="text-white font-semibold truncate">{{ votedTheme.title }}</p>
          <p class="text-text-muted text-sm">{{ votedTheme.likes }} votos</p>
        </div>
        <NuxtLink
          :to="`/theme/${votedTheme.id}`"
          class="ml-auto text-brand text-sm hover:underline shrink-0"
        >
          Ver theme
        </NuxtLink>
      </div>

      <p v-else class="text-text-muted text-sm">
        Aún no has votado por ningún theme.
        <NuxtLink to="/" class="text-brand hover:underline">Ver themes</NuxtLink>
      </p>

      <div class="flex flex-col gap-3 pt-2 border-t border-border-dark">
        <label class="text-sm font-medium text-text-muted" for="vote-select">
          {{ votedTheme ? 'Cambiar voto' : 'Votar por un theme' }}
        </label>
        <select
          id="vote-select"
          v-model="selectedThemeId"
          class="bg-bg-primary border border-border-dark rounded-lg px-4 py-3 text-white text-sm focus:outline-none focus:border-brand"
        >
          <option :value="null" disabled>Selecciona un theme...</option>
          <option v-for="t in allThemes" :key="t.id" :value="t.id">{{ t.title }}</option>
        </select>
        <AppButton
          :loading="savingVote"
          :disabled="!selectedThemeId || selectedThemeId === votedTheme?.id"
          @click="handleVoteChange"
        >
          Guardar voto
        </AppButton>
      </div>
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
const { user, profile, fetchProfile } = useAuth()
const toast = useToastStore()

async function getAuthHeaders() {
  const { data: { session } } = await supabase.auth.getSession()
  return { Authorization: `Bearer ${session?.access_token}` }
}

// Formulario de datos personales
const form = reactive({ name: '', email: '' })
const saving = ref(false)

// Poblar el formulario desde el JWT (disponible inmediatamente)
watch(user, (u) => {
  if (u) {
    form.name = u.user_metadata?.name ?? form.name
    form.email = u.email ?? form.email
  }
}, { immediate: true })

// Refinar con los datos del perfil cuando estén disponibles
watch(profile, (p) => {
  if (p) {
    form.name = p.name ?? form.name
    form.email = p.email ?? form.email
  }
}, { immediate: true })

// Cargar perfil completo al montar
onMounted(async () => {
  if (user.value) await fetchProfile()
  allThemes.value = await getThemes()
})

async function handleSave() {
  saving.value = true
  try {
    const updated = await $fetch('/api/profile', {
      method: 'PUT',
      headers: await getAuthHeaders(),
      body: { name: form.name.trim(), email: form.email.trim() },
    })
    await fetchProfile()
    if ((updated as any).email !== user.value?.email) {
      toast.show('Revisa tu correo para confirmar el cambio de email', 'info')
    }
    else {
      toast.show('Perfil actualizado', 'success')
    }
  }
  catch (e: any) {
    toast.show(e?.data?.message ?? e?.message ?? 'Error al guardar', 'error')
  }
  finally {
    saving.value = false
  }
}

// Formulario de cambio de contraseña
const pwForm = reactive({ newPw: '', confirm: '' })
const savingPw = ref(false)

async function handlePasswordChange() {
  if (pwForm.newPw.length < 6) {
    toast.show('La contraseña debe tener al menos 6 caracteres', 'error')
    return
  }
  if (pwForm.newPw !== pwForm.confirm) {
    toast.show('Las contraseñas no coinciden', 'error')
    return
  }
  savingPw.value = true
  try {
    const { error } = await supabase.auth.updateUser({ password: pwForm.newPw })
    if (error) throw error
    Object.assign(pwForm, { newPw: '', confirm: '' })
    toast.show('Contraseña actualizada', 'success')
  }
  catch (e: any) {
    toast.show(e?.message ?? 'Error al cambiar la contraseña', 'error')
  }
  finally {
    savingPw.value = false
  }
}

// Voto actual
const { getCurrentVote, vote } = useVotes()
const { getThemes } = useThemes()
const votedTheme = ref<Theme | null>(null)
const allThemes = ref<Theme[]>([])
const selectedThemeId = ref<number | null>(null)
const savingVote = ref(false)

async function loadVote() {
  const themeId = await getCurrentVote()
  if (themeId) {
    const { data } = await supabase.from('themes').select('*').eq('id', themeId).single()
    votedTheme.value = data as Theme | null
    selectedThemeId.value = themeId
  }
  else {
    votedTheme.value = null
    selectedThemeId.value = null
  }
}

async function handleVoteChange() {
  if (!selectedThemeId.value) return
  savingVote.value = true
  try {
    const ok = await vote(selectedThemeId.value)
    if (ok) await loadVote()
  }
  finally {
    savingVote.value = false
  }
}

watch(user, (u) => { if (u) loadVote() }, { immediate: true })

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
