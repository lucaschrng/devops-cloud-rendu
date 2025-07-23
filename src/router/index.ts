import { createRouter, createWebHistory } from 'vue-router'
import Auth from '../pages/Auth.vue'

// Define routes
const routes = [
  {
    path: '/',
    name: 'Home',
    component: () => import('../components/HelloWorld.vue')
  },
  {
    path: '/auth',
    name: 'Auth',
    component: Auth
  }
]

// Create router instance
const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router
