import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import { createRouter, createWebHistory } from 'vue-router'
import SignupForm from '@/components/auth/SignupForm.vue'

// Mock AWS Amplify
vi.mock('aws-amplify/auth', () => ({
  signUp: vi.fn(),
  confirmSignUp: vi.fn(),
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

describe('SignupForm', () => {
  let router: any

  beforeEach(() => {
    router = createRouter({
      history: createWebHistory(),
      routes: [
        { path: '/', component: { template: '<div>Home</div>' } },
        { path: '/login', component: { template: '<div>Login</div>' } },
        { path: '/signup', component: { template: '<div>Signup</div>' } },
      ],
    })
  })

  it('renders signup form with correct content', () => {
    const wrapper = mount(SignupForm, {
      global: {
        plugins: [router],
      },
    })

    expect(wrapper.text()).toContain('Create an Account')
    expect(wrapper.text()).toContain('Enter your details to create a new account')
    expect(wrapper.find('input[placeholder="johndoe"]').exists()).toBe(true) // username
    expect(wrapper.find('input[type="email"]').exists()).toBe(true)
    expect(wrapper.find('input[type="password"]').exists()).toBe(true)
    expect(wrapper.find('button[type="submit"]').exists()).toBe(true)
  })

  it('shows role selection dropdown', () => {
    const wrapper = mount(SignupForm, {
      global: {
        plugins: [router],
      },
    })

    expect(wrapper.text()).toContain('Role')
    expect(wrapper.text()).toContain('Select your role')
  })

  it('shows validation error when fields are empty', async () => {
    const wrapper = mount(SignupForm, {
      global: {
        plugins: [router],
      },
    })

    const form = wrapper.find('form')
    await form.trigger('submit.prevent')

    expect(wrapper.text()).toContain('Please fill in all required fields')
  })

  it('shows signup button text correctly', () => {
    const wrapper = mount(SignupForm, {
      global: {
        plugins: [router],
      },
    })

    const submitButton = wrapper.find('button[type="submit"]')
    expect(submitButton.text()).toContain('Sign up')
  })

  it('has a link to login page', () => {
    const wrapper = mount(SignupForm, {
      global: {
        plugins: [router],
      },
    })

    expect(wrapper.text()).toContain('Already have an account?')
    expect(wrapper.text()).toContain('Login')
  })

  it('shows password confirmation field', () => {
    const wrapper = mount(SignupForm, {
      global: {
        plugins: [router],
      },
    })

    expect(wrapper.text()).toContain('Confirm Password')
    const passwordFields = wrapper.findAll('input[type="password"]')
    expect(passwordFields.length).toBe(2) // password and confirm password
  })
})
