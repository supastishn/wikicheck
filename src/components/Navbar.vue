<template>
  <div class="padding">
    <nav class="navbar">
      <router-link to="/" class="navbar-title">WikiCheck</router-link>
      <div class="navbar-links">
        <router-link to="/fact-check">Fact Check</router-link>
        <router-link to="/history">History</router-link>
      </div>
      <div v-if="user" class="user-info">
        <router-link to="/account">
          <div class="profile-circle">
            {{ userInitials }}
          </div>
        </router-link>
      </div>
      <div v-else class="auth-buttons">
        <router-link to="/login" class="auth-btn">Login</router-link>
        <router-link to="/register" class="auth-btn primary">Register</router-link>
      </div>
      <button class="mode-toggle" @click="toggleMode">
        {{ isDark ? '🌙 Dark' : '☀️ Light' }}
      </button>
    </nav>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { account } from '../utils/appwrite'
import { useRouter } from 'vue-router'

const isDark = ref(false)
const user = ref<any>(null)
const router = useRouter()

const userInitials = computed(() => {
  if (!user.value) return ''
  return user.value.name
    ? user.value.name.split(' ').map(n => n[0]).join('').toUpperCase().substring(0,2)
    : user.value.email.substring(0,2).toUpperCase()
})

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

onMounted(async () => {
  const saved = localStorage.getItem('wikicheck-theme')
  if (saved === 'dark') setMode(true)
  else setMode(false)
  try {
    user.value = await account.get()
  } catch {
    user.value = null
  }
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
  border-radius: 100px;
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
  color: #fff;
  text-decoration: none;
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

/* Add after existing styles */
.user-info {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: white;
}

.profile-circle {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background-color: #fff;
  color: #646cff;
  display: flex;
  justify-content: center;
  align-items: center;
  font-weight: bold;
  cursor: pointer;
}

.auth-buttons {
  display: flex;
  gap: 0.5rem;
}

.auth-btn {
  padding: 0.4rem 0.8rem;
  background: transparent;
  color: white;
  border: 1px solid white;
  border-radius: 4px;
  cursor: pointer;
}

.auth-btn.primary {
  background: rgba(255,255,255,0.2);
}
</style>
