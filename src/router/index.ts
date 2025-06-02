import { createRouter, createWebHistory } from 'vue-router'
import Home from '../App.vue'  // Changed from '@/App.vue'
import Login from '../components/Login.vue'  // Changed from '@/components/Login.vue'
import Register from '../components/Register.vue'  // Changed from '@/components/Register.vue'
import HistoryPage from '../components/HistoryPage.vue'  // Changed from '@/components/HistoryPage.vue'

const routes = [
  { path: '/', name: 'Home', component: Home },
  { path: '/login', name: 'Login', component: Login },
  { path: '/register', name: 'Register', component: Register },
  { path: '/history', name: 'History', component: HistoryPage }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router
