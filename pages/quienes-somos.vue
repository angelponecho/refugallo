<template>
  <div class="bg-bg-primary min-h-screen pt-16">
    <!-- Hero con imagen de fondo -->
    <section class="relative h-[400px] flex items-center justify-center overflow-hidden">
      <img
        src="https://picsum.photos/seed/about-hero/1920/400"
        alt=""
        aria-hidden="true"
        class="absolute inset-0 w-full h-full object-cover opacity-30"
        width="1920"
        height="400"
      />
      <div class="absolute inset-0 bg-gradient-to-b from-bg-primary/60 via-transparent to-bg-primary" aria-hidden="true" />
      <div
        v-motion
        :initial="{ opacity: 0, y: 20 }"
        :enter="{ opacity: 1, y: 0, transition: { duration: 600 } }"
        class="relative z-10 flex flex-col items-center gap-4 text-center px-6"
      >
        <span class="text-4xl font-headline text-white tracking-widest">REFUGALLO</span>
        <h1 class="font-headline text-5xl md:text-6xl text-white tracking-widest">QUIÉNES SOMOS</h1>
      </div>
    </section>

    <!-- Texto explicativo -->
    <section class="max-w-3xl mx-auto px-6 py-20">
      <div
        v-motion
        :initial="{ opacity: 0, y: 30 }"
        :visible-once="{ opacity: 1, y: 0, transition: { duration: 600 } }"
        class="flex flex-col gap-8 text-text-muted text-lg leading-relaxed"
      >
        <p>
          <strong class="text-white">Refugallo</strong> es una plataforma de debate y votación donde las ideas toman el centro del escenario. Creemos que cada opinión cuenta y que el conocimiento compartido es la herramienta más poderosa para transformar el mundo.
        </p>
        <p>
          Nuestro sistema de themes permite explorar los grandes temas de nuestro tiempo: desde la inteligencia artificial hasta el cambio climático, desde la salud mental hasta el futuro de las ciudades. Cada tema está presentado de forma accesible, rigurosa y provocadora.
        </p>
        <p>
          Vota por el tema que más te importe. Comparte tu perspectiva. Únete a una comunidad que cree que pensar juntos nos hace más fuertes.
        </p>

        <div class="grid grid-cols-1 sm:grid-cols-3 gap-6 mt-8">
          <div
            v-for="stat in stats"
            :key="stat.label"
            class="bg-bg-elevated border border-border-dark rounded-xl p-6 text-center"
          >
            <div class="font-headline text-4xl text-brand mb-2">{{ stat.value }}</div>
            <div class="text-sm text-text-muted">{{ stat.label }}</div>
          </div>
        </div>

        <div class="flex justify-center mt-4">
          <NuxtLink to="/registro">
            <AppButton size="lg">Únete a la comunidad</AppButton>
          </NuxtLink>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
useHead({ title: 'Quiénes somos — Refugallo' })

const stats = [
  { value: '6+', label: 'Themes activos' },
  { value: '100%', label: 'Contenido verificado' },
  { value: '1 voto', label: 'Por usuario y tema' },
]
</script>
