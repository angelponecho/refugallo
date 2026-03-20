<template>
  <div class="bg-bg-primary min-h-screen pt-16">
    <!-- Hero -->
    <section class="py-24 text-center px-6 bg-bg-secondary border-b border-border-dark">
      <div
        v-motion
        :initial="{ opacity: 0, y: 20 }"
        :enter="{ opacity: 1, y: 0, transition: { duration: 500 } }"
      >
        <h1 class="font-headline text-5xl md:text-7xl text-white tracking-widest mb-4">CONTACTO</h1>
        <p class="text-text-muted text-lg max-w-xl mx-auto">
          ¿Tienes ideas, sugerencias o simplemente quieres contarnos qué piensas? Nos encanta escucharte.
        </p>
      </div>
    </section>

    <!-- Formulario -->
    <section class="max-w-2xl mx-auto px-6 py-20">
      <div
        v-motion
        :initial="{ opacity: 0, y: 30 }"
        :visible-once="{ opacity: 1, y: 0, transition: { duration: 600 } }"
        class="bg-bg-elevated border border-border-dark rounded-xl p-8"
      >
        <form v-if="!sent" class="flex flex-col gap-5" @submit.prevent="handleSubmit">
          <AppInput
            v-model="form.name"
            label="Nombre"
            placeholder="Tu nombre"
            required
            autocomplete="name"
            :error="errors.name"
          />
          <AppInput
            v-model="form.email"
            label="Email"
            type="email"
            placeholder="tu@email.com"
            required
            autocomplete="email"
            :error="errors.email"
          />
          <div class="flex flex-col gap-1.5">
            <label for="message" class="text-sm font-medium text-text-muted">
              Mensaje <span class="text-brand" aria-hidden="true">*</span>
            </label>
            <textarea
              id="message"
              v-model="form.message"
              rows="5"
              placeholder="Cuéntanos tus ideas u opiniones..."
              required
              class="w-full bg-bg-primary border border-border-dark rounded-lg px-4 py-3 text-white placeholder-text-muted text-sm transition-colors focus:outline-none focus:border-brand resize-none"
              :class="errors.message ? 'border-red-500' : ''"
            />
            <p v-if="errors.message" class="text-red-400 text-xs" role="alert">{{ errors.message }}</p>
          </div>
          <AppButton type="submit" :loading="sending" class="w-full mt-2">
            Enviar mensaje
          </AppButton>
        </form>

        <!-- Confirmación -->
        <div v-else class="text-center py-8 flex flex-col items-center gap-4">
          <div class="w-16 h-16 rounded-full bg-brand/20 flex items-center justify-center">
            <CheckCircleIcon class="w-8 h-8 text-brand" aria-hidden="true" />
          </div>
          <h2 class="font-headline text-3xl text-white tracking-wide">¡MENSAJE ENVIADO!</h2>
          <p class="text-text-muted">Gracias por escribirnos. Te responderemos lo antes posible.</p>
          <AppButton variant="ghost" @click="resetForm">Enviar otro mensaje</AppButton>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
import { CheckCircleIcon } from 'lucide-vue-next'

useHead({ title: 'Contacto — Refugallo' })

const form = reactive({ name: '', email: '', message: '' })
const errors = reactive({ name: '', email: '', message: '' })
const sending = ref(false)
const sent = ref(false)

function validate() {
  errors.name = form.name.trim() ? '' : 'El nombre es obligatorio'
  errors.email = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email) ? '' : 'Email no válido'
  errors.message = form.message.trim().length >= 10 ? '' : 'El mensaje debe tener al menos 10 caracteres'
  return !errors.name && !errors.email && !errors.message
}

async function handleSubmit() {
  if (!validate()) return
  sending.value = true
  await new Promise(r => setTimeout(r, 1000)) // Simular envío
  sending.value = false
  sent.value = true
}

function resetForm() {
  Object.assign(form, { name: '', email: '', message: '' })
  sent.value = false
}
</script>
