import { NextResponse } from 'next/server'
import { verifyWebhookSignature } from '@/lib/webhook/verify'
import { mapWebhookToAquariumEvent } from '@/lib/webhook/event-mapper'
import { SUPPORTED_EVENTS } from '@/lib/webhook/types'
import { redis, CACHE_KEYS, CACHE_TTL } from '@/lib/cache/redis'
import { getSupabaseAdmin } from '@/lib/auth/supabase'
import type { SupportedGitHubEvent } from '@/lib/webhook/types'

export async function POST(request: Request): Promise<NextResponse> {
  const signature = request.headers.get('x-hub-signature-256')
  const eventType = request.headers.get('x-github-event')
  const deliveryId = request.headers.get('x-github-delivery')

  if (!signature || !eventType || !deliveryId) {
    return NextResponse.json(
      { error: 'Missing required headers' },
      { status: 400 },
    )
  }

  const secret = process.env['GITHUB_WEBHOOK_SECRET']
  if (!secret) {
    return NextResponse.json(
      { error: 'Webhook not configured' },
      { status: 500 },
    )
  }

  const body = await request.text()

  if (!verifyWebhookSignature(body, signature, secret)) {
    return NextResponse.json({ error: 'Invalid signature' }, { status: 401 })
  }

  // Idempotency check (skipped when Redis is unavailable)
  const deliveryKey = CACHE_KEYS.deliveryId(deliveryId)
  if (redis) {
    const alreadyProcessed = await redis.get(deliveryKey)
    if (alreadyProcessed) {
      return NextResponse.json({ status: 'already_processed' })
    }
    await redis.set(deliveryKey, '1', { ex: CACHE_TTL.DELIVERY_ID })
  }

  if (!SUPPORTED_EVENTS.includes(eventType as SupportedGitHubEvent)) {
    return NextResponse.json({ status: 'ignored', event: eventType })
  }

  let payload: unknown
  try {
    payload = JSON.parse(body)
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 })
  }

  const aquariumEvent = mapWebhookToAquariumEvent(eventType, payload)
  if (!aquariumEvent) {
    return NextResponse.json({ status: 'unmapped', event: eventType })
  }

  // Store event in Supabase if available
  const supabase = getSupabaseAdmin()
  if (supabase) {
    await supabase.from('aquarium_events').insert({
      id: aquariumEvent.id,
      username: aquariumEvent.username,
      type: aquariumEvent.type,
      fish_id: aquariumEvent.fishId,
      repo_name: aquariumEvent.repoName,
      message: aquariumEvent.message,
      metadata: aquariumEvent.metadata,
    })
  }

  return NextResponse.json({ status: 'processed', event: aquariumEvent })
}
