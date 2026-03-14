import { describe, it, expect } from 'vitest'

// Mirror the validation logic from the landing page
const USERNAME_RE =
  /^[a-zA-Z0-9](?:[a-zA-Z0-9]|-(?!-))*[a-zA-Z0-9]$|^[a-zA-Z0-9]$/

function validateUsername(value: string): string | null {
  const trimmed = value.trim()
  if (!trimmed) return null
  if (trimmed.length > 39) return 'Username too long (max 39 chars)'
  if (!USERNAME_RE.test(trimmed)) return 'Invalid GitHub username format'
  return null
}

describe('Landing page username validation', () => {
  it('should accept valid alphanumeric usernames', () => {
    expect(validateUsername('octocat')).toBeNull()
    expect(validateUsername('chamdom')).toBeNull()
    expect(validateUsername('user123')).toBeNull()
  })

  it('should accept usernames with hyphens', () => {
    expect(validateUsername('my-username')).toBeNull()
    expect(validateUsername('a-b-c')).toBeNull()
  })

  it('should return null for empty input', () => {
    expect(validateUsername('')).toBeNull()
    expect(validateUsername('   ')).toBeNull()
  })

  it('should reject usernames longer than 39 chars', () => {
    const long = 'a'.repeat(40)
    expect(validateUsername(long)).toMatch(/too long/)
  })

  it('should accept exactly 39 char usernames', () => {
    expect(validateUsername('a'.repeat(39))).toBeNull()
  })

  it('should reject usernames starting with hyphen', () => {
    expect(validateUsername('-username')).toMatch(/Invalid/)
  })

  it('should reject usernames ending with hyphen', () => {
    expect(validateUsername('username-')).toMatch(/Invalid/)
  })

  it('should reject usernames with consecutive hyphens', () => {
    expect(validateUsername('user--name')).toMatch(/Invalid/)
  })

  it('should reject usernames with special characters', () => {
    expect(validateUsername('user@name')).toMatch(/Invalid/)
    expect(validateUsername('user name')).toMatch(/Invalid/)
    expect(validateUsername('user.name')).toMatch(/Invalid/)
  })

  it('should accept single character usernames', () => {
    expect(validateUsername('a')).toBeNull()
    expect(validateUsername('1')).toBeNull()
  })

  it('should trim whitespace before validating', () => {
    expect(validateUsername('  octocat  ')).toBeNull()
  })
})
