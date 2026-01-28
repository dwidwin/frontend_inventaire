import { describe, it, expect, beforeEach } from 'vitest'
import { useToast } from '@/composables/useToast'

describe('useToast', () => {
  beforeEach(() => {
    // Reset toasts before each test
    const { toasts, clear } = useToast()
    clear()
  })

  it('should add a toast', () => {
    const { toasts, success } = useToast()
    success('Test message')
    expect(toasts.value.length).toBe(1)
    expect(toasts.value[0].message).toBe('Test message')
    expect(toasts.value[0].type).toBe('success')
  })

  it('should remove a toast', () => {
    const { toasts, success, removeToast } = useToast()
    const id = success('Test message')
    expect(toasts.value.length).toBe(1)
    removeToast(id)
    expect(toasts.value.length).toBe(0)
  })

  it('should clear all toasts', () => {
    const { toasts, success, clear } = useToast()
    success('Message 1')
    success('Message 2')
    expect(toasts.value.length).toBe(2)
    clear()
    expect(toasts.value.length).toBe(0)
  })

  it('should create different toast types', () => {
    const { toasts, success, error, warning, info } = useToast()
    success('Success')
    error('Error')
    warning('Warning')
    info('Info')
    
    expect(toasts.value.length).toBe(4)
    expect(toasts.value[0].type).toBe('success')
    expect(toasts.value[1].type).toBe('error')
    expect(toasts.value[2].type).toBe('warning')
    expect(toasts.value[3].type).toBe('info')
  })
})
