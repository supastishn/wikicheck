<template>
  <ParticleBackground />
  <Navbar />
  <router-view />
</template>

<script setup lang="ts">
import Navbar from './components/Navbar.vue';
import ParticleBackground from './components/ParticleBackground.vue';
</script>

<style scoped>
#app {
  position: relative; /* Ensure content stays above background */
  z-index: 1; /* Content should be above background */
  max-width: 1280px;
  margin: 0 auto;
  padding: 6rem 2rem 2rem;
  text-align: center;
}
</style>
