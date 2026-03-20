<template>
  <footer class="bg-bg-secondary border-t border-border-dark mt-20">
    <div class="max-w-7xl mx-auto px-6 py-16 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10">
      <!-- Col 1: Logo -->
      <div class="flex flex-col gap-4">
        <NuxtLink to="/" class="text-3xl font-headline text-white tracking-widest hover:text-brand transition-colors">
          REFUGALLO
        </NuxtLink>
        <p class="text-text-muted text-sm leading-relaxed">
          Vota por los mejores themes y ayuda a decidir cuál llega al #1.
        </p>
      </div>

      <!-- Col 2: Secciones -->
      <div>
        <h3 class="text-sm font-semibold uppercase tracking-widest text-text-muted mb-4">Secciones</h3>
        <ul class="flex flex-col gap-2">
          <li v-for="link in sectionLinks" :key="link.to">
            <NuxtLink :to="link.to" class="text-sm text-text-muted hover:text-white transition-colors">
              {{ link.label }}
            </NuxtLink>
          </li>
        </ul>
      </div>

      <!-- Col 3: Legal -->
      <div>
        <h3 class="text-sm font-semibold uppercase tracking-widest text-text-muted mb-4">Legal</h3>
        <ul class="flex flex-col gap-2">
          <li>
            <NuxtLink to="/textos-legales" class="text-sm text-text-muted hover:text-white transition-colors">
              Política de privacidad
            </NuxtLink>
          </li>
          <li>
            <NuxtLink to="/politica-de-cookies" class="text-sm text-text-muted hover:text-white transition-colors">
              Gestión de cookies
            </NuxtLink>
          </li>
        </ul>
      </div>

      <!-- Col 4: Redes sociales -->
      <div>
        <h3 class="text-sm font-semibold uppercase tracking-widest text-text-muted mb-4">Síguenos en</h3>
        <div class="flex gap-4">
          <a
            href="https://facebook.com"
            target="_blank"
            rel="noopener noreferrer"
            class="w-10 h-10 rounded-lg bg-bg-elevated border border-border-dark flex items-center justify-center text-text-muted hover:text-brand hover:border-brand transition-all duration-200"
            aria-label="Síguenos en Facebook"
          >
            <FacebookIcon class="w-5 h-5" />
          </a>
          <a
            href="https://instagram.com"
            target="_blank"
            rel="noopener noreferrer"
            class="w-10 h-10 rounded-lg bg-bg-elevated border border-border-dark flex items-center justify-center text-text-muted hover:text-brand hover:border-brand transition-all duration-200"
            aria-label="Síguenos en Instagram"
          >
            <InstagramIcon class="w-5 h-5" />
          </a>
        </div>
      </div>
    </div>

    <div class="border-t border-border-dark py-6 px-6 text-center text-text-muted text-xs">
      © {{ new Date().getFullYear() }} Refugallo. Todos los derechos reservados.
    </div>
  </footer>
</template>

<script setup lang="ts">
import { FacebookIcon, InstagramIcon } from 'lucide-vue-next'

const sectionLinks = [
  { to: '/ranking', label: 'Ranking' },
  { to: '/quienes-somos', label: 'Quiénes somos' },
  { to: '/galeria', label: 'Galería' },
  { to: '/contacto', label: 'Contacto' },
]
</script>
