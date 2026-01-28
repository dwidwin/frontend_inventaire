import { describe, it, expect, vi, beforeEach } from 'vitest'
import { logger } from '@/utils/logger'

describe('Logger', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should log debug messages in development', () => {
    const consoleSpy = vi.spyOn(console, 'debug')
    logger.debug('Test debug message')
    expect(consoleSpy).toHaveBeenCalled()
  })

  it('should log info messages', () => {
    const consoleSpy = vi.spyOn(console, 'info')
    logger.info('Test info message')
    expect(consoleSpy).toHaveBeenCalled()
  })

  it('should log warn messages', () => {
    const consoleSpy = vi.spyOn(console, 'warn')
    logger.warn('Test warn message')
    expect(consoleSpy).toHaveBeenCalled()
  })

  it('should log error messages', () => {
    const consoleSpy = vi.spyOn(console, 'error')
    logger.error('Test error message')
    expect(consoleSpy).toHaveBeenCalled()
  })

  it('should handle errors in error method', () => {
    const consoleSpy = vi.spyOn(console, 'error')
    const testError = new Error('Test error')
    logger.error('Error occurred', testError)
    expect(consoleSpy).toHaveBeenCalledWith(
      expect.stringContaining('[ERROR]'),
      'Error occurred',
      testError
    )
  })
})
