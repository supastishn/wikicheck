<template>
  <!-- Mobile backdrop and hamburger toggle -->
  <div v-if="isMobile && mobileOpen" class="backdrop" @click="mobileOpen = false"></div>
  <button class="mobile-toggle" @click="toggleMobile" v-show="isMobile">☰</button>

  <nav class="sidebar glass" :class="{ 
    'mobile-open': mobileOpen,
    'mobile-collapsed': mobileCollapsed,
    'mobile-expanded': mobileExpanded 
  }">
    <div class="top-section">
      <router-link to="/" class="navbar-title" @click="mobileOpen = false">Wikicheck</router-link>
      
      <button class="mode-toggle" @click="toggleMode">
        {{ isDark ? '🌙' : '☀️' }}
      </button>
    </div>
    
    <div class="user-section" v-if="user">
      <router-link to="/account" @click="mobileOpen = false">
        <div class="profile-circle">
          {{ userInitials }}
        </div>
      </router-link>
      <div class="user-name">{{ user.name || user.email }}</div>
    </div>
    
    <div class="nav-links">
      <router-link to="/fact-check" @click="mobileOpen = false">
        <i>🔍</i> <span>Fact Check</span>
      </router-link>
      <router-link to="/history" @click="mobileOpen = false">
        <i>📋</i> <span>History</span>
      </router-link>
      
      <div v-if="!user" class="auth-links">
        <router-link to="/login" @click="mobileOpen = false">
          <i>🔑</i> <span>Login</span>
        </router-link>
        <router-link to="/register" @click="mobileOpen = false">
          <i>📝</i> <span>Register</span>
        </router-link>
      </div>
    </div>
    <!-- Add collapser button at bottom of nav -->
    <div class="nav-collapser" v-if="isMobile" @click="toggleMobileExpand">
      <i>{{ mobileExpanded ? '⊖' : '⊕' }}</i>
    </div>
  </nav>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { account } from '../utils/appwrite'

const isDark = ref(false)
const user = ref<any>(null)

const mobileOpen = ref(false);
const isMobile = ref(false);

// Add mobileExpanded state
const mobileExpanded = ref(false);
const mobileCollapsed = ref(false);

// Add toggle function for mobile expansion
const toggleMobileExpand = () => {
  mobileExpanded.value = !mobileExpanded.value;
  mobileCollapsed.value = !mobileCollapsed.value;
};

function checkIsMobile() {
  isMobile.value = window.innerWidth <= 768;
  if (!isMobile.value) {
    mobileOpen.value = false;
    mobileExpanded.value = false;
    mobileCollapsed.value = false;
  }
}

function toggleMobile() {
  mobileOpen.value = !mobileOpen.value;
  // Reset collapse/expand state when opening/closing
  if (!mobileOpen.value) {
    mobileExpanded.value = false;
    mobileCollapsed.value = false;
  } else {
    mobileExpanded.value = false;
    mobileCollapsed.value = true;
  }
}

const userInitials = computed(() => {
  if (!user.value) return ''
  return user.value.name
    ? user.value.name.split(' ').map((n: string) => n[0]).join('').toUpperCase().substring(0,2)
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
  checkIsMobile();
  window.addEventListener('resize', checkIsMobile);

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
.sidebar {
  position: fixed;
  top: 0;
  left: 0;
  height: 100vh;
  width: 5rem;
  padding: 1.5rem 1rem;
  background: var(--card-bg);
  backdrop-filter: blur(10px);
  display: flex;
  flex-direction: column;
  align-items: center;
  box-shadow: var(--shadow-md);
  border-right: 1px solid rgba(255, 255, 255, 0.18);
  z-index: 500;
  transition: width 0.3s ease;
  overflow: hidden;
}

/* Hide text content when sidebar is not hovered (desktop) */
.sidebar:not(:hover) {
  width: 5rem;
}

.sidebar:not(:hover):not(.mobile-open) .nav-links a > span,
.sidebar:not(:hover):not(.mobile-open) .auth-links a > span {
  display: none;
}

.sidebar:not(:hover) .user-section .user-name {
  display: none;
}

.sidebar:not(:hover) .navbar-title {
  font-size: 0.8rem;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 100%;
}

.sidebar:hover {
  width: 18rem;
}

.top-section {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
  margin-bottom: 2rem;
  width: 100%;
}

.navbar-title {
  text-align: center;
  font-size: 1.2rem;
  font-weight: bold;
}

.mode-toggle {
  /* Updated */
  background: rgba(255, 255, 255, 0.1);
  border: none;
  color: var(--text-dark);
  border-radius: 4px;
  padding: 0.4rem 0;
  cursor: pointer;
  width: 80%;
}

.user-section {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-bottom: 2rem;
  width: 100%;
}

.user-name {
  font-size: 0.85rem;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 0;
  transition: max-width 0.3s ease;
}

.user-section {
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 100%;
  opacity: 1;
}

.profile-circle {
  width: 3rem;
  height: 3rem;
  border-radius: 50%;
  background-color: #fff;
  color: #646cff;
  display: flex;
  justify-content: center;
  align-items: center;
  font-weight: bold;
  cursor: pointer;
  transition: transform 0.3s;
}
.sidebar:not(:hover) .profile-circle {
  min-width: 2rem;
  min-height: 2rem;
}

.nav-links {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  width: 100%;
}

.nav-links a,
.auth-links a {
  display: flex;
  align-items: center;
  padding: 0.8rem 1rem;
  border-radius: var(--rounded-sm);
  color: var(--text-dark);
  text-decoration: none;
  transition: background 0.2s;
}

/* Center icons perfectly when sidebar is collapsed on PC */
.sidebar:not(:hover):not(.mobile-open) .nav-links a,
.sidebar:not(:hover):not(.mobile-open) .auth-links a {
  display: flex;
  justify-content: center;
  align-items: center; /* Ensure vertical centering too */
  padding-left: 0;
  padding-right: 0;
}

.sidebar:not(:hover):not(.mobile-open) .nav-links a i,
.sidebar:not(:hover):not(.mobile-open) .auth-links a i {
  margin-right: 0;
  margin-left: 0;
  position: relative; /* Add relative positioning */
  left: auto; /* Reset any potential shifts */
  transform: none; /* Ensure no transforms interfere */
}

.nav-links a:not(.router-link-exact-active):hover {
  background: rgba(255, 255, 255, 0.1);
}

.nav-links a.router-link-exact-active {
  background: linear-gradient(to right, var(--primary), var(--secondary));
  color: white;
}

.auth-links {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  margin-top: 2rem;
  width: 100%;
}

.nav-links a i {
  /* New - add icons */
  margin-right: 1rem;
  font-size: 1.2rem;
  width: 1.5rem;
  text-align: center;
}
</style>
<style scoped>
@media (max-width: 768px) {
  .sidebar {
    width: 5rem !important;
    height: 100%;
    left: 0;
    transform: translateX(-100%);
    transition: transform 0.3s ease;
    z-index: 1000;
  }

  .sidebar.mobile-open {
    transform: translateX(0);
  }

  .sidebar.mobile-open.mobile-collapsed {
    height: 80px;
    width: 5rem !important;
    overflow: hidden;
    bottom: 0;
  }

  .mobile-open.mobile-expanded {
    height: 100vh;
    width: 250px !important;
  }

  /* Hide sidebar completely when not open on mobile */
  .sidebar:not(.mobile-open) {
    visibility: hidden;
    pointer-events: none;
  }
  
  .sidebar.mobile-open {
    visibility: visible;
    pointer-events: all;
  }

  .mobile-expand-button {
    display: none;
  }

  .nav-collapser {
    position: absolute;
    bottom: 0;
    left: 0;
    width: 100%;
    text-align: center;
    padding: 1rem;
    background: rgba(255, 255, 255, 0.1);
    border-top: 1px solid rgba(255, 255, 255, 0.18);
    cursor: pointer;
    font-size: 1.5rem;
    transition: all 0.3s;
  }

  .mobile-collapsed .nav-collapser i {
    transform: rotate(180deg);
  }

  .sidebar .user-name {
    display: none;
  }

  .sidebar.mobile-open .user-name {
    display: block;
    margin-top: 0.5rem;
  }

  .mobile-toggle {
    display: block;
    position: fixed;
    top: 1rem;
    left: 1rem;
    z-index: 1010;
    background: rgba(0, 0, 0, 0.7);
    color: white;
    border: none;
    border-radius: 4px;
    padding: 8px;
    font-size: 1.5rem;
  }
  
  .backdrop {
    display: block;
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(0, 0, 0, 0.5);
    z-index: 990;
  }
}
</style>
