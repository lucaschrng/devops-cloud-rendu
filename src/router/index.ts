import { createRouter, createWebHistory } from 'vue-router'
import CreateProduct from '../pages/CreateProduct.vue'
import ProductList from '../pages/ProductList.vue'
import ProductDetail from '../pages/ProductDetail.vue'
import Profile from '../pages/Profile.vue'
import Login from '../pages/Login.vue'
import Signup from '../pages/Signup.vue'
import RolesInfo from '../pages/RolesInfo.vue'
import { getCurrentUser } from 'aws-amplify/auth'

// Define routes
const routes = [
  {
    path: '/',
    name: 'Home',
    component: () => import('../components/HelloWorld.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/login',
    name: 'Login',
    component: Login
  },
  {
    path: '/signup',
    name: 'Signup',
    component: Signup
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
    component: ProductList,
    meta: { requiresAuth: true }
  },
  {
    path: '/product/:id',
    name: 'ProductDetail',
    component: ProductDetail,
    meta: { requiresAuth: true }
  },
  {
    path: '/profile',
    name: 'Profile',
    component: Profile,
    meta: { requiresAuth: true }
  },
  {
    path: '/roles',
    name: 'RolesInfo',
    component: RolesInfo,
    meta: { requiresAuth: true }
  }
]

// Create router instance
const router = createRouter({
  history: createWebHistory(),
  routes
})

// Global navigation guard
router.beforeEach(async (to, from, next) => {
  // Routes that don't require authentication
  const publicRoutes = ['/login', '/signup']
  
  // Check if route requires authentication
  const requiresAuth = to.matched.some(record => record.meta.requiresAuth)
  
  if (!requiresAuth || publicRoutes.includes(to.path)) {
    // Allow access to public routes
    next()
    return
  }
  
  try {
    // Check if user is authenticated
    await getCurrentUser()
    // User is authenticated, proceed to route
    next()
  } catch (error) {
    // User is not authenticated, redirect to login
    console.log('Authentication required, redirecting to login')
    next('/login')
  }
})

export default router
