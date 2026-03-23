<template>
  <div class="flex flex-col gap-6">
    <div class="flex items-center justify-between">
      <div>
        <h1 class="font-headline text-4xl text-white tracking-widest">THEMES</h1>
        <p class="text-text-muted mt-1">Gestiona el contenido de la plataforma.</p>
      </div>
      <AppButton @click="openCreate">Añadir theme</AppButton>
    </div>

    <!-- Tabla -->
    <AdminDataTable
      :rows="themes ?? []"
      :columns="columns"
      search-placeholder="Buscar themes..."
    >
      <template #cell-thumbImg="{ value, row }">
        <img
          :src="value ?? `https://picsum.photos/seed/${row.id}thumb/60/80`"
          :alt="row.title"
          class="w-10 h-14 object-cover rounded"
          width="40"
          height="56"
        />
      </template>

      <template #cell-visible="{ value, row }">
        <button
          class="relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus-visible:ring-2 focus-visible:ring-brand"
          :class="value ? 'bg-brand' : 'bg-border-dark'"
          :aria-label="`${value ? 'Ocultar' : 'Mostrar'} theme ${row.title}`"
          :aria-checked="value"
          role="switch"
          @click="toggleVisible(row)"
        >
          <span
            class="inline-block h-4 w-4 transform rounded-full bg-white transition-transform"
            :class="value ? 'translate-x-6' : 'translate-x-1'"
          />
        </button>
      </template>

      <template #cell-likes="{ value }">
        <span class="text-brand font-semibold">{{ value }}</span>
      </template>

      <template #cell-order="{ value }">
        <span class="text-text-muted text-xs">{{ value }}</span>
      </template>

      <template #row-actions="{ row }">
        <NuxtLink :to="`/theme/${row.id}`" target="_blank">
          <button class="p-1.5 rounded-lg text-text-muted hover:text-white hover:bg-bg-primary transition-colors" :aria-label="`Ver theme ${row.title}`">
            <EyeIcon class="w-4 h-4" />
          </button>
        </NuxtLink>
        <button
          class="p-1.5 rounded-lg text-text-muted hover:text-white hover:bg-bg-primary transition-colors"
          :aria-label="`Editar theme ${row.title}`"
          @click="openEdit(row)"
        >
          <PencilIcon class="w-4 h-4" />
        </button>
        <button
          class="p-1.5 rounded-lg text-text-muted hover:text-brand hover:bg-bg-primary transition-colors"
          :aria-label="`Eliminar theme ${row.title}`"
          @click="confirmDelete(row)"
        >
          <Trash2Icon class="w-4 h-4" />
        </button>
      </template>
    </AdminDataTable>

    <!-- Modal crear/editar -->
    <AdminModalForm
      v-model="modalOpen"
      :title="editingTheme ? `Editar: ${editingTheme.title}` : 'Nuevo theme'"
      :loading="saving"
      @submit="handleSave"
    >
      <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <AppInput v-model="form.title" label="Título" placeholder="Título del theme" required />
        <AppInput v-model="form.subtitle" label="Subtítulo" placeholder="Subtítulo breve" />
        <AppInput v-model="form.heroImg" label="Hero Image URL" placeholder="https://..." />
        <AppInput v-model="form.mainImg" label="Main Image URL" placeholder="https://..." />
        <AppInput v-model="form.thumbImg" label="Thumb Image URL" placeholder="https://..." />
        <div class="flex items-center gap-3 pt-6">
          <label class="text-sm font-medium text-text-muted" for="visible-toggle">Visible</label>
          <button
            id="visible-toggle"
            type="button"
            class="relative inline-flex h-6 w-11 items-center rounded-full transition-colors"
            :class="form.visible ? 'bg-brand' : 'bg-border-dark'"
            role="switch"
            :aria-checked="form.visible"
            @click="form.visible = !form.visible"
          >
            <span class="inline-block h-4 w-4 transform rounded-full bg-white transition-transform" :class="form.visible ? 'translate-x-6' : 'translate-x-1'" />
          </button>
        </div>
      </div>
      <div class="flex flex-col gap-1.5">
        <label class="text-sm font-medium text-text-muted" for="description">Descripción</label>
        <textarea id="description" v-model="form.description" rows="2" placeholder="Descripción breve..." class="bg-bg-primary border border-border-dark rounded-lg px-4 py-3 text-white text-sm focus:outline-none focus:border-brand resize-none" />
      </div>
      <div class="flex flex-col gap-1.5">
        <label class="text-sm font-medium text-text-muted" for="text-content">Texto completo</label>
        <textarea id="text-content" v-model="form.text" rows="8" placeholder="Texto del theme..." class="bg-bg-primary border border-border-dark rounded-lg px-4 py-3 text-white text-sm focus:outline-none focus:border-brand resize-none" />
      </div>

      <!-- Preview imagen -->
      <div v-if="form.heroImg" class="rounded-lg overflow-hidden border border-border-dark">
        <img :src="form.heroImg" alt="Preview" class="w-full h-32 object-cover" />
        <p class="text-xs text-text-muted px-3 py-2">Preview hero</p>
      </div>
    </AdminModalForm>

    <!-- Modal confirmar eliminar -->
    <AppModal v-model="deleteModalOpen" title="Eliminar theme" size="sm">
      <div class="flex flex-col gap-4">
        <p class="text-text-muted">¿Seguro que quieres eliminar <strong class="text-white">{{ deletingTheme?.title }}</strong>? Se eliminarán también todos sus votos.</p>
        <div class="flex gap-3 justify-end">
          <AppButton variant="ghost" @click="deleteModalOpen = false">Cancelar</AppButton>
          <AppButton variant="danger" :loading="deleting" @click="handleDelete">Eliminar</AppButton>
        </div>
      </div>
    </AppModal>
  </div>
</template>

<script setup lang="ts">
import { PencilIcon, Trash2Icon, EyeIcon } from 'lucide-vue-next'
import type { Theme } from '~/types'

definePageMeta({ layout: 'admin', middleware: 'admin' })
useHead({ title: 'Themes — Admin Refugallo' })

const { getAllThemes, createTheme, updateTheme, deleteTheme } = useThemes()
const toast = useToastStore()

const { data: themes, refresh } = await useAsyncData('admin-themes', getAllThemes, {
  default: () => [] as Theme[],
  server: false,
})
console.log('los themes son ',themes.value)

const columns = [
  { key: 'order', label: '#' },
  { key: 'thumbImg', label: 'Imagen' },
  { key: 'title', label: 'Título' },
  { key: 'likes', label: 'Votos' },
  { key: 'visible', label: 'Visible' },
]

// Toggle visible
async function toggleVisible(theme: Theme) {
  try {
    await updateTheme(theme.id, { visible: !theme.visible })
    theme.visible = !theme.visible
    toast.show('Visibilidad actualizada', 'success')
  }
  catch { toast.show('Error al actualizar', 'error') }
}

// Modal
const modalOpen = ref(false)
const editingTheme = ref<Theme | null>(null)
const saving = ref(false)

const emptyForm = () => ({
  title: '', subtitle: '', description: '', text: '',
  heroImg: '', mainImg: '', thumbImg: '', visible: true,
})
const form = reactive(emptyForm())

function openCreate() {
  editingTheme.value = null
  Object.assign(form, emptyForm())
  modalOpen.value = true
}

function openEdit(theme: Theme) {
  editingTheme.value = theme
  Object.assign(form, {
    title: theme.title,
    subtitle: theme.subtitle ?? '',
    description: theme.description ?? '',
    text: theme.text ?? '',
    heroImg: theme.heroImg ?? '',
    mainImg: theme.mainImg ?? '',
    thumbImg: theme.thumbImg ?? '',
    visible: theme.visible,
  })
  modalOpen.value = true
}

async function handleSave() {
  if (!form.title.trim()) { toast.show('El título es obligatorio', 'error'); return }
  saving.value = true
  try {
    const payload = {
      title: form.title,
      subtitle: form.subtitle || null,
      description: form.description || null,
      text: form.text || null,
      heroImg: form.heroImg || null,
      mainImg: form.mainImg || null,
      thumbImg: form.thumbImg || null,
      visible: form.visible,
    }
    if (editingTheme.value) {
      await updateTheme(editingTheme.value.id, payload)
      toast.show('Theme actualizado', 'success')
    }
    else {
      const count = (themes.value?.length ?? 0) + 1
      await createTheme({ ...payload, order: count, likes: 0 })
      toast.show('Theme creado', 'success')
    }
    modalOpen.value = false
    await refresh()
  }
  catch { toast.show('Error al guardar', 'error') }
  finally { saving.value = false }
}

// Eliminar
const deleteModalOpen = ref(false)
const deletingTheme = ref<Theme | null>(null)
const deleting = ref(false)

function confirmDelete(theme: Theme) {
  deletingTheme.value = theme
  deleteModalOpen.value = true
}

async function handleDelete() {
  if (!deletingTheme.value) return
  deleting.value = true
  try {
    await deleteTheme(deletingTheme.value.id)
    toast.show('Theme eliminado', 'success')
    deleteModalOpen.value = false
    await refresh()
  }
  catch { toast.show('Error al eliminar', 'error') }
  finally { deleting.value = false }
}
</script>
