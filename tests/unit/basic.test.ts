import { describe, it, expect } from 'vitest'

describe('Basic Tests', () => {
  it('should run basic test', () => {
    expect(1 + 1).toBe(2)
  })

  it('should test string operations', () => {
    const message = 'Login'
    expect(message).toBe('Login')
    expect(message.toLowerCase()).toBe('login')
    expect(message.includes('Log')).toBe(true)
  })

  it('should test array operations', () => {
    const roles = ['Admin', 'User']
    expect(roles).toHaveLength(2)
    expect(roles).toContain('Admin')
    expect(roles).toContain('User')
  })

  it('should test object properties', () => {
    const user = {
      username: 'testuser',
      email: 'test@example.com',
      role: 'User'
    }
    
    expect(user).toHaveProperty('username')
    expect(user).toHaveProperty('email')
    expect(user).toHaveProperty('role')
    expect(user.username).toBe('testuser')
  })
})
