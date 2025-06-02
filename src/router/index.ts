import { createRouter, createWebHistory } from 'vue-router'
import HomePage from '../components/HomePage.vue'
import LandingPage from '../components/LandingPage.vue'
import Login from '../components/Login.vue'
import Register from '../components/Register.vue'
import HistoryPage from '../components/HistoryPage.vue'
import AccountPage from '../components/AccountPage.vue'

import { account } from '../utils/appwrite'

const routes = [
  { path: '/', name: 'LandingPage', component: LandingPage },
  { 
    path: '/fact-check', 
    name: 'FactCheck', 
    component: HomePage,
    meta: { requiresAuth: true } 
  },
  { 
    path: '/history', 
    name: 'History', 
    component: HistoryPage,
    meta: { requiresAuth: true } 
  },
  { path: '/login', name: 'Login', component: Login },
  { path: '/register', name: 'Register', component: Register },
  { path: '/account', name: 'Account', component: AccountPage }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

// Add route guard for protected routes
router.beforeEach(async (to, from, next) => {
  const requiresAuth = to.meta.requiresAuth;
  
  if (requiresAuth) {
    try {
      await account.get();
      next();
    } catch (error) {
      next('/login');
    }
  } else {
    next();
  }
});

export default router
