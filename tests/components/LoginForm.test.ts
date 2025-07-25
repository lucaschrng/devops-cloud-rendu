import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import LoginForm from '../../src/components/auth/LoginForm.vue'
import { createRouter, createWebHistory } from 'vue-router'
import { signIn } from 'aws-amplify/auth'

// Mock AWS Amplify
vi.mock('aws-amplify/auth', () => ({
  signIn: vi.fn(),
}))

// Mock vue-sonner
vi.mock('vue-sonner', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}))

// Mock @tanstack/vue-query
vi.mock('@tanstack/vue-query', () => ({
  useQueryClient: () => ({
    invalidateQueries: vi.fn(),
  }),
}))

// Mock auth utils
vi.mock('../../src/utils/auth-utils', () => ({
  ensureUserExists: vi.fn(),
}))

const router = createRouter({
  history: createWebHistory(),
  routes: [
    { path: '/login', component: { template: '<div>Login</div>' } },
    { path: '/signup', component: { template: '<div>Signup</div>' } },
    { path: '/profile', component: { template: '<div>Profile</div>' } },
  ],
})

describe('LoginForm', () => {
  let wrapper

  beforeEach(() => {
    wrapper = mount(LoginForm, {
      global: {
        plugins: [router],
      },
    })
  })

  it('shows login button text correctly', () => {
    const button = wrapper.find('button[type="submit"]')
    expect(button.text()).toBe('Login')
  })

  it('has a link to signup page', () => {
    const signupLink = wrapper.find('a')
    expect(signupLink.exists()).toBe(true)
    expect(signupLink.text()).toBe('Sign up')
  })

  it('does not allow login with invalid email format', async () => {
    const usernameInput = wrapper.find('#username')
    const passwordInput = wrapper.find('#password')
    const form = wrapper.find('form')

    // Fill with invalid email format
    await usernameInput.setValue('invalid-email')
    await passwordInput.setValue('password123')
    
    // Mock signIn to reject with email format error
    vi.mocked(signIn).mockRejectedValue(new Error('Invalid email format'))
    
    await form.trigger('submit.prevent')
    await wrapper.vm.$nextTick()
    
    // Should show error message
    expect(wrapper.text()).toContain('Invalid email format')
  })

  it('allows login attempt with valid email format', async () => {
    const usernameInput = wrapper.find('#username')
    const passwordInput = wrapper.find('#password')
    const form = wrapper.find('form')

    // Fill with valid email format
    await usernameInput.setValue('user@example.com')
    await passwordInput.setValue('password123')
    
    // Mock signIn to resolve successfully
    vi.mocked(signIn).mockResolvedValue({})
    
    await form.trigger('submit.prevent')
    
    // Should call signIn with correct parameters
    expect(signIn).toHaveBeenCalledWith({
      username: 'user@example.com',
      password: 'password123',
    })
  })
})
