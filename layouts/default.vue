<template>
  <div class="min-h-screen bg-bg-primary font-body text-white">
    <AppHeader />
    <main>
      <slot />
    </main>
    <AppFooter />
    <AppToast />
  </div>
</template>
