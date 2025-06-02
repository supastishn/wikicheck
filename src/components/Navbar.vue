<template>
  <div class="padding">
    <nav class="navbar">
      <div class="navbar-title">WikiCheck</div>
      <div class="navbar-links">
        <a href="#" @click.prevent="$emit('navigate', 'home')">Home</a>
        <a href="#" @click.prevent="$emit('navigate', 'history')">History</a>
      </div>
      <button class="mode-toggle" @click="toggleMode">
        {{ isDark ? '🌙 Dark' : '☀️ Light' }}
      </button>
    </nav>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'

const isDark = ref(false)

function setMode(dark: boolean) {
  isDark.value = dark
  if (dark) {
    document.documentElement.classList.add('dark')
  } else {
    document.documentElement.classList.remove('dark')
  }
}

function toggleMode() {
  setMode(!isDark.value)
  localStorage.setItem('wikicheck-theme', isDark.value ? 'dark' : 'light')
}

onMounted(() => {
  const saved = localStorage.getItem('wikicheck-theme')
  if (saved === 'dark') setMode(true)
  else setMode(false)
})
</script>

<style scoped>
.padding {
  position: fixed;
  top: 1.2rem;
  left: 0;
  width: 100vw;
  z-index: 100;
  padding-left: 2vw;
  padding-right: 2vw;
  box-sizing: border-box;
}

.navbar {
  width: 100%;
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: #646cff;
  color: #fff;
  padding: 1rem 2rem;
  margin-bottom: 0;
  box-sizing: border-box;
  border-radius: 8px;
}

.mode-toggle {
  margin-left: 2rem;
  background: transparent;
  color: #fff;
  border: 1px solid #fff;
  border-radius: 6px;
  padding: 0.4em 1em;
  font-size: 1em;
  cursor: pointer;
  transition: background 0.2s, color 0.2s;
}
.mode-toggle:hover {
  background: #fff;
  color: #646cff;
}

.navbar-title {
  font-size: 1.5rem;
  font-weight: bold;
  letter-spacing: 1px;
}

.navbar-links a {
  color: #fff;
  text-decoration: none;
  margin-left: 1.5rem;
  font-weight: 500;
  transition: color 0.2s;
}

.navbar-links a:hover {
  color: #ffd700;
}
</style>
