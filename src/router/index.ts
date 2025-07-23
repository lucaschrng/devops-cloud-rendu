import { createRouter, createWebHistory } from 'vue-router'
import Auth from '../pages/Auth.vue'
import CreateProduct from '../pages/CreateProduct.vue'

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
  },
  {
    path: '/create-product',
    name: 'CreateProduct',
    component: CreateProduct,
    meta: { requiresAuth: true }
  }
]

// Create router instance
const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router
