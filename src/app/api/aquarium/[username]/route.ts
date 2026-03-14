import { NextResponse } from 'next/server'
import { z } from 'zod'
import { fetchGitHubData } from '@/lib/github/client'
import { GitHubError } from '@/lib/github/types'
import { mapToAquariumData } from '@/lib/aquarium/mapper'
import { getCached, setCached, CACHE_KEYS, CACHE_TTL } from '@/lib/cache/redis'
import type { AquariumData } from '@/types/aquarium'

const paramsSchema = z.object({
  username: z
    .string()
    .min(1)
    .max(39)
    .regex(/^[a-zA-Z0-9](?:[a-zA-Z0-9-]*[a-zA-Z0-9])?$/),
})

const ERROR_STATUS: Record<string, number> = {
  USER_NOT_FOUND: 404,
  RATE_LIMITED: 429,
  UNAUTHORIZED: 500,
  SERVER_ERROR: 500,
}

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ username: string }> },
): Promise<NextResponse> {
  const { username: rawUsername } = await params
  const parsed = paramsSchema.safeParse({ username: rawUsername })

  if (!parsed.success) {
    return NextResponse.json({ error: 'Invalid username' }, { status: 400 })
  }

  const { username } = parsed.data

  try {
    const cached = await getCached<AquariumData>(CACHE_KEYS.aquarium(username))
    if (cached) {
      return NextResponse.json(cached.data, {
        headers: { 'X-Cache': 'HIT', 'Cache-Control': 'public, max-age=1800' },
      })
    }

    const { user, repos } = await fetchGitHubData(username)
    const data = mapToAquariumData(user, repos)

    await setCached(CACHE_KEYS.aquarium(username), data, {
      ttl: CACHE_TTL.AQUARIUM,
    })

    return NextResponse.json(data, {
      headers: { 'X-Cache': 'MISS', 'Cache-Control': 'public, max-age=1800' },
    })
  } catch (error) {
    if (error instanceof GitHubError) {
      const status = ERROR_STATUS[error.code] ?? 500
      return NextResponse.json({ error: error.code }, { status })
    }
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 },
    )
  }
}
