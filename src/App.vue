<template>
  <Navbar />
  <router-view />
</template>

<script setup lang="ts">
import Navbar from './components/Navbar.vue'
</script>

<style scoped>
#app {
  max-width: 1280px;
  margin: 0 auto;
  padding: 6rem 2rem 2rem;
  text-align: center;
}
</style>
