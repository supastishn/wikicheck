<template>
  <Navbar />
  <router-view />
</template>

<script setup lang="ts">
// No script needed
</script>

<style scoped>
#app {
  max-width: 1280px;
  margin: 0 auto;
  padding: 5rem 2rem 2rem; /* Add top padding to prevent navbar overlap */
  text-align: center;
}
</style>
