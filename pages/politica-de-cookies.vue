<template>
  <div class="bg-bg-primary min-h-screen pt-16">
    <div class="max-w-3xl mx-auto px-6 py-20">
      <h1 class="font-headline text-5xl text-white tracking-widest mb-12">POLÍTICA DE COOKIES</h1>
      <div class="flex flex-col gap-8 text-text-muted leading-relaxed">

        <section>
          <h2 class="font-headline text-2xl text-white tracking-wide mb-4">¿QUÉ SON LAS COOKIES?</h2>
          <p>Las cookies son pequeños ficheros de texto que se almacenan en el dispositivo del usuario cuando visita un sitio web. Permiten que el sitio recuerde información sobre tu visita, como tu idioma preferido u otras opciones de configuración.</p>
        </section>

        <section>
          <h2 class="font-headline text-2xl text-white tracking-wide mb-4">COOKIES QUE UTILIZAMOS</h2>
          <p>Esta plataforma <strong class="text-white">únicamente utiliza cookies estrictamente necesarias</strong> para el funcionamiento del servicio. No se utilizan cookies de seguimiento, publicidad ni análisis de terceros.</p>

          <div class="mt-6 border border-border-dark rounded-lg overflow-hidden">
            <table class="w-full text-sm" role="grid">
              <thead class="bg-bg-elevated">
                <tr>
                  <th class="text-left px-4 py-3 text-text-muted font-medium" scope="col">Cookie</th>
                  <th class="text-left px-4 py-3 text-text-muted font-medium" scope="col">Finalidad</th>
                  <th class="text-left px-4 py-3 text-text-muted font-medium" scope="col">Duración</th>
                </tr>
              </thead>
              <tbody>
                <tr class="border-t border-border-dark">
                  <td class="px-4 py-3 text-white font-mono text-xs">sb-access-token</td>
                  <td class="px-4 py-3">Mantener la sesión del usuario iniciada</td>
                  <td class="px-4 py-3">Sesión</td>
                </tr>
                <tr class="border-t border-border-dark">
                  <td class="px-4 py-3 text-white font-mono text-xs">sb-refresh-token</td>
                  <td class="px-4 py-3">Renovar automáticamente la sesión activa</td>
                  <td class="px-4 py-3">7 días</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        <section>
          <h2 class="font-headline text-2xl text-white tracking-wide mb-4">BASE LEGAL</h2>
          <p>El uso de estas cookies está justificado por el interés legítimo del prestador del servicio, ya que son imprescindibles para que el usuario pueda hacer uso de las funcionalidades de la plataforma (inicio de sesión, votación). Su uso no requiere consentimiento expreso conforme al artículo 22.2 de la LSSICE.</p>
        </section>

        <section>
          <h2 class="font-headline text-2xl text-white tracking-wide mb-4">DESACTIVACIÓN</h2>
          <p>Puedes configurar tu navegador para bloquear o eliminar las cookies. Ten en cuenta que si bloqueas las cookies necesarias para la sesión, no podrás iniciar sesión ni votar en la plataforma.</p>
        </section>

        <p class="text-sm border-t border-border-dark pt-6">
          Última actualización: marzo de 2026
        </p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
useHead({ title: 'Política de cookies — Refugallo' })
</script>
