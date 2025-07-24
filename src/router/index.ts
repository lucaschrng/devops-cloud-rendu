import { createRouter, createWebHistory } from 'vue-router'
import Auth from '../pages/Auth.vue'
import CreateProduct from '../pages/CreateProduct.vue'
import ProductList from '../pages/ProductList.vue'
import ProductDetail from '../pages/ProductDetail.vue'
import Profile from '../pages/Profile.vue'

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
  },
  {
    path: '/products',
    name: 'ProductList',
    component: ProductList
  },
  {
    path: '/product/:id',
    name: 'ProductDetail',
    component: ProductDetail
  },
  {
    path: '/profile',
    name: 'Profile',
    component: Profile,
    meta: { requiresAuth: true }
  }
]

// Create router instance
const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router
