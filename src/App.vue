<template>
  <ParticleBackground />
  <div class="app-container">
    <Navbar />
    <main class="main-content">
      <router-view />
    </main>
  </div>
</template>

<script setup lang="ts">
import Navbar from './components/Navbar.vue';
import ParticleBackground from './components/ParticleBackground.vue';
</script>

<style scoped>
.app-container {
  display: flex;
  min-height: 100vh;
}

.main-content {
  flex: 1;
  padding: 2rem; /* Adjusted padding */
  max-width: calc(100% - 6rem); /* Account for sidebar expanded width */
  margin-left: 6rem; /* More space for collapsed sidebar */
}

html:not(.mobile-open) .main-content {
  transition: margin-left 0.3s ease;
}
</style>
