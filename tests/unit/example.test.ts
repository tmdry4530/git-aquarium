import { describe, it, expect } from 'vitest'

describe('Example unit test', () => {
  it('should pass', () => {
    expect(1 + 1).toBe(2)
  })

  it('should handle strings', () => {
    const greeting = 'Git Aquarium'
    expect(greeting).toContain('Aquarium')
  })
})
