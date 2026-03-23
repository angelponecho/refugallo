<template>
  <div class="flex flex-col gap-6">
    <div class="flex items-center justify-between">
      <div>
        <h1 class="font-headline text-4xl text-white tracking-widest">USUARIOS</h1>
        <p class="text-text-muted mt-1">Gestiona las cuentas registradas.</p>
      </div>
      <AppButton @click="openCreate">Añadir usuario</AppButton>
    </div>
    <AdminDataTable
      :rows="filteredUsers"
      :columns="columns"
      search-placeholder="Buscar por nombre..."
    >
      <template #filters>
        <select
          v-model="roleFilter"
          class="bg-bg-elevated border border-border-dark rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-brand"
          aria-label="Filtrar por rol"
        >
          <option value="">Todos los roles</option>
          <option value="user">Usuario</option>
          <option value="admin">Admin</option>
        </select>
      </template>

      <template #cell-role="{ value }">
        <span
          class="px-2 py-1 rounded text-xs font-medium"
          :class="value === 'admin' ? 'bg-brand/20 text-brand' : 'bg-bg-primary text-text-muted'"
        >
          {{ value }}
        </span>
      </template>

      <template #cell-created_at="{ value }">
        <span class="text-text-muted text-xs">{{ formatDate(value) }}</span>
      </template>

      <template #row-actions="{ row }">
        <button
          class="p-1.5 rounded-lg text-text-muted hover:text-white hover:bg-bg-primary transition-colors"
          :aria-label="`Editar usuario ${row.name}`"
          @click="openEdit(row)"
        >
          <PencilIcon class="w-4 h-4" />
        </button>
        <button
          class="p-1.5 rounded-lg text-text-muted hover:text-red-400 hover:bg-bg-primary transition-colors"
          :aria-label="`Eliminar usuario ${row.name}`"
          @click="confirmDelete(row)"
        >
          <Trash2Icon class="w-4 h-4" />
        </button>
      </template>
    </AdminDataTable>

    <!-- Modal editar/crear -->
    <AdminModalForm
      v-model="modalOpen"
      :title="editingUser ? 'Editar usuario' : 'Nuevo usuario'"
      :loading="saving"
      @submit="handleSave"
    >
      <template v-if="!editingUser">
        <AppInput v-model="form.email" label="Email" type="email" placeholder="email@ejemplo.com" required />
        <AppInput v-model="form.password" label="Contraseña" type="password" placeholder="Mínimo 6 caracteres" required />
      </template>
      <AppInput v-model="form.name" label="Nombre" placeholder="Nombre del usuario" required />
      <div class="flex flex-col gap-1.5">
        <label class="text-sm font-medium text-text-muted" for="role-select">Rol</label>
        <select
          id="role-select"
          v-model="form.role"
          class="bg-bg-elevated border border-border-dark rounded-lg px-4 py-3 text-white text-sm focus:outline-none focus:border-brand"
        >
          <option value="user">Usuario</option>
          <option value="admin">Admin</option>
        </select>
      </div>
    </AdminModalForm>

    <!-- Modal confirmar eliminar -->
    <AppModal v-model="deleteModalOpen" title="Eliminar usuario" size="sm">
      <div class="flex flex-col gap-4">
        <p class="text-text-muted">
          ¿Seguro que quieres eliminar a <strong class="text-white">{{ deletingUser?.name }}</strong>?
          Esta acción eliminará su cuenta y no se puede deshacer.
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
import { PencilIcon, Trash2Icon } from 'lucide-vue-next'
import type { Profile } from '~/types'
import type { Database } from '~/types/database.types'

definePageMeta({ layout: 'admin', middleware: 'admin' })
useHead({ title: 'Usuarios — Admin Refugallo' })

const supabase = useSupabaseClient<Database>()
const toast = useToastStore()

const { data: users, refresh } = await useAsyncData('admin-users', async () => {
  const { data } = await supabase.from('profiles').select('*').order('created_at', { ascending: false })
  return (data as Profile[]) ?? []
}, { server: false, default: () => [] as Profile[] })

const roleFilter = ref('')
const columns = [
  { key: 'name', label: 'Nombre' },
  { key: 'role', label: 'Rol' },
  { key: 'created_at', label: 'Registro' },
]

const filteredUsers = computed(() => {
  if (!roleFilter.value) return users.value ?? []
  return (users.value ?? []).filter(u => u.role === roleFilter.value)
})

// Modal crear/editar
const modalOpen = ref(false)
const editingUser = ref<Profile | null>(null)
const form = reactive({ email: '', password: '', name: '', role: 'user' as 'user' | 'admin' })
const saving = ref(false)

function openCreate() {
  editingUser.value = null
  Object.assign(form, { email: '', password: '', name: '', role: 'user' })
  modalOpen.value = true
}

function openEdit(user: Profile) {
  editingUser.value = user
  Object.assign(form, { email: '', password: '', name: user.name ?? '', role: user.role })
  modalOpen.value = true
}

async function handleSave() {
  saving.value = true
  try {
    if (editingUser.value) {
      // Actualizar nombre y rol en profiles
      const { error } = await supabase
        .from('profiles')
        .update({ name: form.name, role: form.role })
        .eq('id', editingUser.value.id)
      if (error) throw error
      toast.show('Usuario actualizado', 'success')
    } else {
      // Crear usuario via API del servidor (usa service role key)
      await $fetch('/api/admin/users', {
        method: 'POST',
        body: { email: form.email, password: form.password, name: form.name, role: form.role },
      })
      toast.show('Usuario creado', 'success')
    }
    modalOpen.value = false
    await refresh()
  } catch (e: any) {
    toast.show(e?.data?.message ?? e?.message ?? 'Error al guardar', 'error')
  } finally {
    saving.value = false
  }
}

// Eliminar
const deleteModalOpen = ref(false)
const deletingUser = ref<Profile | null>(null)
const deleting = ref(false)

function confirmDelete(user: Profile) {
  deletingUser.value = user
  deleteModalOpen.value = true
}

async function handleDelete() {
  if (!deletingUser.value) return
  deleting.value = true
  try {
    // Eliminar auth user (cascade borra el profile)
    await $fetch(`/api/admin/users/${deletingUser.value.id}`, { method: 'DELETE' as any })
    toast.show('Usuario eliminado', 'success')
    deleteModalOpen.value = false
    await refresh()
  } catch (e: any) {
    toast.show(e?.data?.message ?? e?.message ?? 'Error al eliminar', 'error')
  } finally {
    deleting.value = false
  }
}

function formatDate(d: string) {
  return new Date(d).toLocaleDateString('es-ES', { day: '2-digit', month: 'short', year: 'numeric' })
}
</script>
