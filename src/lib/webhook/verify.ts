import { createHmac, timingSafeEqual } from 'crypto'

export function verifyWebhookSignature(
  payload: string,
  signature: string,
  secret: string,
): boolean {
  if (!signature || !secret) return false

  const hmac = createHmac('sha256', secret)
  const digest = `sha256=${hmac.update(payload).digest('hex')}`

  try {
    return timingSafeEqual(Buffer.from(digest), Buffer.from(signature))
  } catch {
    return false
  }
}
