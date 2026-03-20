<template>
  <div class="flex flex-col gap-4">
    <!-- Filtros y búsqueda -->
    <div class="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
      <div class="flex items-center gap-3">
        <div class="relative">
          <SearchIcon class="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" aria-hidden="true" />
          <input
            v-model="search"
            type="search"
            :placeholder="searchPlaceholder"
            class="bg-bg-elevated border border-border-dark rounded-lg pl-9 pr-4 py-2 text-sm text-white placeholder-text-muted focus:outline-none focus:border-brand transition-colors w-64"
            aria-label="Buscar"
          />
        </div>
        <slot name="filters" />
      </div>
      <slot name="actions" />
    </div>

    <!-- Tabla -->
    <div class="overflow-x-auto rounded-lg border border-border-dark">
      <table class="w-full text-sm" role="grid">
        <thead class="bg-bg-elevated">
          <tr>
            <th
              v-for="col in columns"
              :key="col.key"
              class="text-left px-4 py-3 text-text-muted font-medium uppercase tracking-wider text-xs"
              scope="col"
            >
              {{ col.label }}
            </th>
            <th class="text-left px-4 py-3 text-text-muted font-medium uppercase tracking-wider text-xs" scope="col">
              Acciones
            </th>
          </tr>
        </thead>
        <tbody>
          <tr
            v-for="(row, i) in paginatedRows"
            :key="i"
            class="border-t border-border-dark hover:bg-bg-elevated/50 transition-colors"
          >
            <td v-for="col in columns" :key="col.key" class="px-4 py-3 text-white">
              <slot :name="`cell-${col.key}`" :row="row" :value="row[col.key]">
                {{ row[col.key] }}
              </slot>
            </td>
            <td class="px-4 py-3">
              <div class="flex items-center gap-2">
                <slot name="row-actions" :row="row" />
              </div>
            </td>
          </tr>
          <tr v-if="paginatedRows.length === 0">
            <td :colspan="columns.length + 1" class="px-4 py-12 text-center text-text-muted">
              No hay resultados.
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Paginación -->
    <div v-if="totalPages > 1" class="flex items-center justify-between text-sm text-text-muted">
      <span>{{ filteredRows.length }} resultados · Página {{ currentPage }} de {{ totalPages }}</span>
      <div class="flex items-center gap-1">
        <button
          class="px-3 py-1.5 rounded-lg hover:bg-bg-elevated transition-colors disabled:opacity-40"
          :disabled="currentPage === 1"
          aria-label="Página anterior"
          @click="currentPage--"
        >
          <ChevronLeftIcon class="w-4 h-4" />
        </button>
        <button
          v-for="page in visiblePages"
          :key="page"
          class="px-3 py-1.5 rounded-lg transition-colors"
          :class="page === currentPage ? 'bg-brand text-white' : 'hover:bg-bg-elevated'"
          @click="currentPage = page"
        >
          {{ page }}
        </button>
        <button
          class="px-3 py-1.5 rounded-lg hover:bg-bg-elevated transition-colors disabled:opacity-40"
          :disabled="currentPage === totalPages"
          aria-label="Página siguiente"
          @click="currentPage++"
        >
          <ChevronRightIcon class="w-4 h-4" />
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { SearchIcon, ChevronLeftIcon, ChevronRightIcon } from 'lucide-vue-next'

const props = withDefaults(defineProps<{
  rows: Record<string, any>[]
  columns: { key: string; label: string; searchable?: boolean }[]
  perPage?: number
  searchPlaceholder?: string
}>(), { perPage: 10, searchPlaceholder: 'Buscar...' })

const search = ref('')
const currentPage = ref(1)

const filteredRows = computed(() => {
  if (!search.value.trim()) return props.rows
  const q = search.value.toLowerCase()
  return props.rows.filter(row =>
    props.columns
      .filter(c => c.searchable !== false)
      .some(c => String(row[c.key] ?? '').toLowerCase().includes(q)),
  )
})

const totalPages = computed(() => Math.max(1, Math.ceil(filteredRows.value.length / props.perPage)))

const paginatedRows = computed(() => {
  const start = (currentPage.value - 1) * props.perPage
  return filteredRows.value.slice(start, start + props.perPage)
})

const visiblePages = computed(() => {
  const pages = []
  for (let i = Math.max(1, currentPage.value - 2); i <= Math.min(totalPages.value, currentPage.value + 2); i++) {
    pages.push(i)
  }
  return pages
})

watch(search, () => { currentPage.value = 1 })
</script>
