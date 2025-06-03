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
router.beforeEach(async (to, _, next) => {
  const requiresAuth = to.meta.requiresAuth;
  const authPages = ['/login', '/register'];

  try {
    // Attempt to get current user session
    await account.get();

    // If authenticated and trying to access auth pages
    if (authPages.includes(to.path)) {
      return next('/fact-check');
    }

    if (requiresAuth) {
      next();
    } else {
      next();
    }
  } catch (error) {
    // If not authenticated and trying to access protected route
    if (requiresAuth) {
      next('/login');
    } else {
      // Allow access to auth pages only when unauthenticated
      if (authPages.includes(to.path)) {
        next();
      } else {
        next(); // Allow access to other public routes
      }
    }
  }
});

export default router
