import { describe, it, expect } from 'vitest'
import { validateMessage } from '@/lib/social/guestbook'

describe('Guestbook', () => {
  describe('validateMessage', () => {
    it('should accept valid messages', () => {
      const result = validateMessage('Hello, great aquarium!')
      expect(result).toBe('Hello, great aquarium!')
    })

    it('should trim whitespace', () => {
      const result = validateMessage('  hello  ')
      expect(result).toBe('hello')
    })

    it('should reject empty messages', () => {
      expect(() => validateMessage('')).toThrow('Message cannot be empty')
      expect(() => validateMessage('   ')).toThrow('Message cannot be empty')
    })

    it('should reject messages over 200 characters', () => {
      const longMsg = 'a'.repeat(201)
      expect(() => validateMessage(longMsg)).toThrow(
        'Message must be 200 characters or less',
      )
    })

    it('should accept messages at exactly 200 characters', () => {
      const msg = 'a'.repeat(200)
      const result = validateMessage(msg)
      expect(result).toHaveLength(200)
    })
  })
})
