import { describe, it, expect } from 'vitest'
import { createHmac } from 'crypto'
import { verifyWebhookSignature } from '@/lib/webhook/verify'

function createSignature(payload: string, secret: string): string {
  const hmac = createHmac('sha256', secret)
  return `sha256=${hmac.update(payload).digest('hex')}`
}

describe('verifyWebhookSignature', () => {
  const secret = 'test-secret-123'
  const payload = '{"action":"created"}'

  it('should return true for valid signature', () => {
    const signature = createSignature(payload, secret)
    expect(verifyWebhookSignature(payload, signature, secret)).toBe(true)
  })

  it('should return false for invalid signature', () => {
    expect(verifyWebhookSignature(payload, 'sha256=invalid', secret)).toBe(
      false,
    )
  })

  it('should return false for empty signature', () => {
    expect(verifyWebhookSignature(payload, '', secret)).toBe(false)
  })

  it('should return false for empty secret', () => {
    const signature = createSignature(payload, secret)
    expect(verifyWebhookSignature(payload, signature, '')).toBe(false)
  })

  it('should return false for mismatched payload', () => {
    const signature = createSignature(payload, secret)
    expect(verifyWebhookSignature('different-payload', signature, secret)).toBe(
      false,
    )
  })

  it('should return false for mismatched secret', () => {
    const signature = createSignature(payload, secret)
    expect(verifyWebhookSignature(payload, signature, 'wrong-secret')).toBe(
      false,
    )
  })

  it('should handle signature length mismatch gracefully', () => {
    expect(verifyWebhookSignature(payload, 'sha256=ab', secret)).toBe(false)
  })
})
