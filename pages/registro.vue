<template>
  <div class="bg-bg-primary min-h-screen pt-16 flex items-center justify-center px-6 py-20">
    <div
      v-motion
      :initial="{ opacity: 0, y: 30 }"
      :enter="{ opacity: 1, y: 0, transition: { duration: 500 } }"
      class="w-full max-w-md"
    >
      <div class="text-center mb-8">
        <NuxtLink to="/" class="text-3xl font-headline text-white tracking-widest hover:text-brand transition-colors">
          REFUGALLO
        </NuxtLink>
        <h1 class="text-text-muted text-sm mt-2">{{ isLogin ? 'Inicia sesión en tu cuenta' : 'Crea tu cuenta gratis' }}</h1>
      </div>

      <div class="bg-bg-elevated border border-border-dark rounded-xl p-8">
        <!-- Toggle -->
        <div class="flex bg-bg-primary rounded-lg p-1 mb-6">
          <button
            class="flex-1 py-2 rounded-md text-sm font-medium transition-all duration-200"
            :class="!isLogin ? 'bg-brand text-white' : 'text-text-muted hover:text-white'"
            @click="isLogin = false"
          >
            Registrarse
          </button>
          <button
            class="flex-1 py-2 rounded-md text-sm font-medium transition-all duration-200"
            :class="isLogin ? 'bg-brand text-white' : 'text-text-muted hover:text-white'"
            @click="isLogin = true"
          >
            Iniciar sesión
          </button>
        </div>

        <!-- Formulario registro -->
        <form v-if="!isLogin && !forgotPassword" class="flex flex-col gap-4" @submit.prevent="handleRegister">
          <AppInput v-model="form.name" label="Nombre" placeholder="Tu nombre" required autocomplete="name" :error="errors.name" />
          <AppInput v-model="form.email" label="Email" type="email" placeholder="tu@email.com" required autocomplete="email" :error="errors.email" />
          <AppInput v-model="form.password" label="Contraseña" type="password" placeholder="Mínimo 6 caracteres" required autocomplete="new-password" :error="errors.password" />
          <p v-if="serverError" class="text-sm text-red-400 text-center" role="alert">{{ serverError }}</p>
          <AppButton type="submit" :loading="loading" class="w-full mt-2">Crear cuenta</AppButton>
          <p class="text-xs text-text-muted text-center">
            Al registrarte aceptas nuestra
            <NuxtLink to="/textos-legales" class="text-brand hover:underline">política de privacidad</NuxtLink>.
          </p>
        </form>

        <!-- Formulario login -->
        <form v-else-if="isLogin && !forgotPassword" class="flex flex-col gap-4" @submit.prevent="handleLogin">
          <AppInput v-model="form.email" label="Email" type="email" placeholder="tu@email.com" required autocomplete="email" :error="errors.email" />
          <AppInput v-model="form.password" label="Contraseña" type="password" placeholder="Tu contraseña" required autocomplete="current-password" :error="errors.password" />
          <button type="button" class="text-sm text-brand hover:underline text-right -mt-2" @click="forgotPassword = true">
            ¿Olvidaste tu contraseña?
          </button>
          <p v-if="serverError" class="text-sm text-red-400 text-center" role="alert">{{ serverError }}</p>
          <AppButton type="submit" :loading="loading" class="w-full mt-2">Iniciar sesión</AppButton>
        </form>

        <!-- Formulario recuperar contraseña -->
        <form v-else class="flex flex-col gap-4" @submit.prevent="handleForgotPassword">
          <div class="text-center mb-2">
            <h2 class="text-white font-semibold">Recuperar contraseña</h2>
            <p class="text-text-muted text-sm mt-1">Te enviaremos un enlace a tu email.</p>
          </div>
          <AppInput v-model="form.email" label="Email" type="email" placeholder="tu@email.com" required autocomplete="email" />
          <p v-if="resetSent" class="text-sm text-brand text-center">¡Email enviado! Revisa tu bandeja de entrada.</p>
          <p v-if="serverError" class="text-sm text-red-400 text-center" role="alert">{{ serverError }}</p>
          <AppButton type="submit" :loading="loading" class="w-full">Enviar enlace</AppButton>
          <button type="button" class="text-sm text-text-muted hover:text-white text-center transition-colors" @click="forgotPassword = false">
            ← Volver
          </button>
        </form>

        <!-- Confirmación registro -->
        <div v-if="registered" class="text-center py-4 flex flex-col items-center gap-3 mt-4 border-t border-border-dark">
          <p class="text-brand text-sm">✓ Cuenta creada. Revisa tu email para confirmar.</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
useHead({ title: 'Acceso — Refugallo' })
definePageMeta({ layout: 'default' })

const { register, login, resetPassword } = useAuth()
const toast = useToastStore()

const isLogin = ref(false)
const forgotPassword = ref(false)
const loading = ref(false)
const registered = ref(false)
const resetSent = ref(false)
const serverError = ref('')

const form = reactive({ name: '', email: '', password: '' })
const errors = reactive({ name: '', email: '', password: '' })

function clearErrors() {
  Object.assign(errors, { name: '', email: '', password: '' })
  serverError.value = ''
}

async function handleRegister() {
  clearErrors()
  if (!form.name.trim()) { errors.name = 'El nombre es obligatorio'; return }
  if (!form.email) { errors.email = 'El email es obligatorio'; return }
  if (form.password.length < 6) { errors.password = 'Mínimo 6 caracteres'; return }
  loading.value = true
  try {
    await register(form.email, form.password, form.name)
    registered.value = true
    toast.show('¡Cuenta creada! Revisa tu email para confirmar.', 'success')
  }
  catch (e: any) {
    serverError.value = e.message ?? 'Error al crear la cuenta'
  }
  finally { loading.value = false }
}

async function handleLogin() {
  clearErrors()
  if (!form.email) { errors.email = 'El email es obligatorio'; return }
  if (!form.password) { errors.password = 'La contraseña es obligatoria'; return }
  loading.value = true
  try {
    await login(form.email, form.password)
    await navigateTo('/')
  }
  catch (e: any) {
    serverError.value = e.message?.includes('Invalid') ? 'Email o contraseña incorrectos' : e.message
  }
  finally { loading.value = false }
}

async function handleForgotPassword() {
  loading.value = true
  serverError.value = ''
  try {
    await resetPassword(form.email)
    resetSent.value = true
  }
  catch (e: any) {
    serverError.value = e.message ?? 'Error al enviar el email'
  }
  finally { loading.value = false }
}
</script>
