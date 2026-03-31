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

watch(user, (u) => {
  if (u) {
    form.name = u.user_metadata?.name ?? form.name
    form.email = u.email ?? form.email
  }
}, { immediate: true })

watch(profile, (p) => {
  if (p) {
    form.name = p.name ?? form.name
    form.email = p.email ?? form.email
  }
}, { immediate: true })

onMounted(async () => {
  if (user.value) await fetchProfile()
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
