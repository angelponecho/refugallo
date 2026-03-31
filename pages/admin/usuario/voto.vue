<template>
  <div class="flex flex-col gap-6 w-full max-w-xl">
    <div>
      <h1 class="font-headline text-4xl text-white tracking-widest">MI VOTO</h1>
      <p class="text-text-muted mt-1">Consulta y cambia el theme por el que has votado.</p>
    </div>

    <!-- Voto actual -->
    <div class="bg-bg-elevated border border-border-dark rounded-xl p-4 sm:p-6 flex flex-col gap-4">
      <h2 class="text-sm font-medium text-text-muted uppercase tracking-wider">Voto actual</h2>

      <div v-if="votedTheme" class="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4">
        <img
          v-if="votedTheme.thumbImg"
          :src="votedTheme.thumbImg"
          :alt="votedTheme.title"
          class="w-16 h-16 rounded-lg object-cover shrink-0"
        />
        <div class="min-w-0 flex-1">
          <p class="text-white font-semibold text-lg truncate">{{ votedTheme.title }}</p>
          <p class="text-text-muted text-sm">{{ votedTheme.likes }} votos</p>
        </div>
        <NuxtLink
          :to="`/theme/${votedTheme.id}`"
          class="text-brand text-sm hover:underline self-start sm:self-auto shrink-0"
        >
          Ver theme
        </NuxtLink>
      </div>

      <div v-else class="flex flex-wrap items-center gap-2 text-text-muted">
        <span class="text-sm">Aún no has votado por ningún theme.</span>
        <NuxtLink to="/" class="text-brand text-sm hover:underline">Ver themes</NuxtLink>
      </div>
    </div>

    <!-- Cambiar voto -->
    <div class="bg-bg-elevated border border-border-dark rounded-xl p-4 sm:p-6 flex flex-col gap-4">
      <h2 class="text-sm font-medium text-text-muted uppercase tracking-wider">
        {{ votedTheme ? 'Cambiar voto' : 'Emitir voto' }}
      </h2>

      <div v-if="loadingThemes" class="text-text-muted text-sm">Cargando themes...</div>

      <template v-else>
        <div class="flex flex-col gap-3">
          <label class="text-sm text-text-muted" for="vote-select">Selecciona un theme</label>
          <select
            id="vote-select"
            v-model="selectedThemeId"
            class="bg-bg-primary border border-border-dark rounded-lg px-4 py-3 text-white text-sm focus:outline-none focus:border-brand transition-colors"
          >
            <option :value="null" disabled>Selecciona un theme...</option>
            <option v-for="t in allThemes" :key="t.id" :value="t.id">
              {{ t.title }}
            </option>
          </select>

          <!-- Preview del theme seleccionado -->
          <div
            v-if="previewTheme && previewTheme.id !== votedTheme?.id"
            class="flex items-center gap-3 p-3 rounded-lg border border-brand/30 bg-brand/5"
          >
            <img
              v-if="previewTheme.thumbImg"
              :src="previewTheme.thumbImg"
              :alt="previewTheme.title"
              class="w-10 h-10 rounded object-cover shrink-0"
            />
            <div class="min-w-0">
              <p class="text-white text-sm font-medium truncate">{{ previewTheme.title }}</p>
              <p class="text-text-muted text-xs">{{ previewTheme.likes }} votos actuales</p>
            </div>
          </div>
        </div>

        <AppButton
          :loading="saving"
          :disabled="!selectedThemeId || selectedThemeId === votedTheme?.id"
          @click="handleSave"
        >
          Guardar voto
        </AppButton>
      </template>
    </div>

    <!-- Volver -->
    <NuxtLink
      to="/admin/usuario"
      class="text-text-muted text-sm hover:text-white transition-colors self-start"
    >
      ← Volver a mi perfil
    </NuxtLink>
  </div>
</template>

<script setup lang="ts">
import type { Theme } from '~/types'
import type { Database } from '~/types/database.types'

definePageMeta({ layout: 'admin', middleware: 'auth', ssr: false })
useHead({ title: 'Mi voto — Refugallo' })

const supabase = useSupabaseClient<Database>()
useAuth()
const { vote } = useVotes()
const { getThemes } = useThemes()

// Voto actual
const votedTheme = ref<Theme | null>(null)
const loading = ref(true)

async function loadVote() {
  const { data: { session } } = await supabase.auth.getSession()
  const userId = session?.user?.id
  if (!userId) return

  const { data: voteData } = await supabase
    .from('votes')
    .select('theme_id')
    .eq('user_id', userId)
    .maybeSingle()

  const themeId = (voteData as { theme_id: number } | null)?.theme_id ?? null
  if (themeId) {
    const { data } = await supabase.from('themes').select('*').eq('id', themeId).single()
    votedTheme.value = data as Theme | null
    selectedThemeId.value = themeId
  }
  else {
    votedTheme.value = null
    selectedThemeId.value = null
  }
  loading.value = false
}

// Todos los themes para el dropdown
const allThemes = ref<Theme[]>([])
const loadingThemes = ref(true)

onMounted(async () => {
  allThemes.value = await getThemes()
  loadingThemes.value = false
  await loadVote()
})

// Theme seleccionado
const selectedThemeId = ref<number | null>(null)

const previewTheme = computed(() =>
  allThemes.value.find(t => t.id === selectedThemeId.value) ?? null,
)

// Guardar
const saving = ref(false)

async function handleSave() {
  if (!selectedThemeId.value) return
  saving.value = true
  try {
    const ok = await vote(selectedThemeId.value)
    if (ok) await loadVote()
  }
  finally {
    saving.value = false
  }
}
</script>
