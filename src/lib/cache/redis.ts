import { Redis } from '@upstash/redis'

const hasRedisConfig =
  !!process.env['UPSTASH_REDIS_REST_URL'] &&
  !!process.env['UPSTASH_REDIS_REST_TOKEN']

export const redis = hasRedisConfig
  ? new Redis({
      url: process.env['UPSTASH_REDIS_REST_URL']!,
      token: process.env['UPSTASH_REDIS_REST_TOKEN']!,
    })
  : null

interface CacheEntry<T> {
  data: T
  etag?: string
}

interface CacheOptions {
  ttl: number
  etag?: string
}

export async function getCached<T>(key: string): Promise<CacheEntry<T> | null> {
  if (!redis) return null
  try {
    return await redis.get<CacheEntry<T>>(key)
  } catch {
    return null
  }
}

export async function setCached<T>(
  key: string,
  data: T,
  options: CacheOptions,
): Promise<void> {
  if (!redis) return
  try {
    await redis.set<CacheEntry<T>>(
      key,
      { data, etag: options.etag },
      { ex: options.ttl },
    )
  } catch {
    // Redis unavailable — skip cache write
  }
}

export async function invalidate(key: string): Promise<void> {
  if (!redis) return
  try {
    await redis.del(key)
  } catch {
    // Redis unavailable — skip invalidation
  }
}

export async function fetchWithETag<T>(
  url: string,
  cacheKey: string,
  headers: Record<string, string>,
): Promise<T> {
  const cached = await getCached<T>(cacheKey)

  const requestHeaders: Record<string, string> = { ...headers }
  if (cached?.etag) {
    requestHeaders['If-None-Match'] = cached.etag
  }

  const response = await fetch(url, { headers: requestHeaders })

  if (response.status === 304 && cached) {
    return cached.data
  }

  if (!response.ok) throw new Error(`HTTP ${response.status}`)

  const data = (await response.json()) as T
  const newEtag = response.headers.get('etag') ?? undefined

  await setCached(cacheKey, data, { ttl: CACHE_TTL.AQUARIUM, etag: newEtag })

  return data
}

export const CACHE_KEYS = {
  aquarium: (username: string) => `aquarium:${username}`,
  user: (username: string) => `github:user:${username}`,
  deliveryId: (id: string) => `webhook:delivery:${id}`,
  rateLimitCacheOnly: 'github:rate-limit:cache-only',
} as const

export const CACHE_TTL = {
  AQUARIUM: 30 * 60,
  USER: 60 * 60,
  CONTRIBUTION: 24 * 60 * 60,
  DELIVERY_ID: 24 * 60 * 60,
} as const
