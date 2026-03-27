<template>
  <div class="flex flex-col gap-6">
    <div>
      <h1 class="font-headline text-4xl text-white tracking-widest">VOTACIONES</h1>
      <p class="text-text-muted mt-1">Gestiona los votos de los usuarios registrados.</p>
    </div>

    <AdminDataTable
      :rows="votes ?? []"
      :columns="columns"
      search-placeholder="Buscar por usuario o theme..."
    >
      <template #cell-theme_title="{ value }">
        <span class="text-brand font-medium">{{ value }}</span>
      </template>

      <template #cell-created_at="{ value }">
        <span class="text-text-muted text-xs">{{ formatDate(value) }}</span>
      </template>

      <template #row-actions="{ row }">
        <button
          class="p-1.5 rounded-lg text-text-muted hover:text-white hover:bg-bg-primary transition-colors"
          :aria-label="`Cambiar voto de ${row.user_name}`"
          @click="openEdit(row as VoteRow)"
        >
          <PencilIcon class="w-4 h-4" />
        </button>
        <button
          class="p-1.5 rounded-lg text-text-muted hover:text-red-400 hover:bg-bg-primary transition-colors"
          :aria-label="`Eliminar voto de ${row.user_name}`"
          @click="confirmDelete(row as VoteRow)"
        >
          <Trash2Icon class="w-4 h-4" />
        </button>
      </template>
    </AdminDataTable>

    <!-- Modal cambiar theme -->
    <AdminModalForm
      v-model="modalOpen"
      title="Cambiar theme votado"
      :loading="saving"
      @submit="handleSave"
    >
      <div class="flex flex-col gap-1.5">
        <span class="text-sm font-medium text-text-muted">Usuario</span>
        <p class="text-white font-medium px-4 py-3 bg-bg-primary border border-border-dark rounded-lg">
          {{ editingVote?.user_name }}
        </p>
      </div>
      <div class="flex flex-col gap-1.5">
        <label class="text-sm font-medium text-text-muted" for="theme-select">Nuevo theme</label>
        <select
          id="theme-select"
          v-model="selectedThemeId"
          class="bg-bg-elevated border border-border-dark rounded-lg px-4 py-3 text-white text-sm focus:outline-none focus:border-brand"
        >
          <option v-for="t in themes" :key="t.id" :value="t.id">{{ t.title }}</option>
        </select>
      </div>
    </AdminModalForm>

    <!-- Modal confirmar eliminar -->
    <AppModal v-model="deleteModalOpen" title="Eliminar voto" size="sm">
      <div class="flex flex-col gap-4">
        <p class="text-text-muted">
          ¿Seguro que quieres eliminar el voto de
          <strong class="text-white">{{ deletingVote?.user_name }}</strong>
          por <strong class="text-white">{{ deletingVote?.theme_title }}</strong>?
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
import type { Theme } from '~/types'

interface VoteRow {
  id: number
  user_id: string
  user_name: string
  theme_id: number
  theme_title: string
  created_at: string
}

definePageMeta({ layout: 'admin', middleware: 'admin' })
useHead({ title: 'Votaciones — Admin Refugallo' })

const toast = useToastStore()
const { getThemes } = useThemes()

const columns = [
  { key: 'user_name', label: 'Usuario' },
  { key: 'theme_title', label: 'Theme votado' },
  { key: 'created_at', label: 'Fecha' },
]

const [{ data: votes, refresh }, themes] = await Promise.all([
  useAsyncData('admin-votes', () => $fetch<VoteRow[]>('/api/admin/votes'), {
    server: false,
    default: () => [] as VoteRow[],
  }),
  getThemes(),
])

// Modal editar
const modalOpen = ref(false)
const editingVote = ref<VoteRow | null>(null)
const selectedThemeId = ref<number | null>(null)
const saving = ref(false)

function openEdit(vote: VoteRow) {
  editingVote.value = vote
  selectedThemeId.value = vote.theme_id
  modalOpen.value = true
}

async function handleSave() {
  if (!editingVote.value || !selectedThemeId.value) return
  saving.value = true
  try {
    await $fetch(`/api/admin/votes/${editingVote.value.id}`, {
      method: 'PUT',
      body: { theme_id: selectedThemeId.value },
    })
    toast.show('Voto actualizado', 'success')
    modalOpen.value = false
    await refresh()
  }
  catch (e: any) {
    toast.show(e?.data?.message ?? 'Error al guardar', 'error')
  }
  finally {
    saving.value = false
  }
}

// Modal eliminar
const deleteModalOpen = ref(false)
const deletingVote = ref<VoteRow | null>(null)
const deleting = ref(false)

function confirmDelete(vote: VoteRow) {
  deletingVote.value = vote
  deleteModalOpen.value = true
}

async function handleDelete() {
  if (!deletingVote.value) return
  deleting.value = true
  try {
    await $fetch(`/api/admin/votes/${deletingVote.value.id}`, { method: 'DELETE' })
    toast.show('Voto eliminado', 'success')
    deleteModalOpen.value = false
    await refresh()
  }
  catch (e: any) {
    toast.show(e?.data?.message ?? 'Error al eliminar', 'error')
  }
  finally {
    deleting.value = false
  }
}

function formatDate(d: string) {
  return new Date(d).toLocaleDateString('es-ES', { day: '2-digit', month: 'short', year: 'numeric' })
}
</script>
