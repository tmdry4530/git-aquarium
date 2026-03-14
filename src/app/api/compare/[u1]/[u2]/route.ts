import { NextResponse } from 'next/server'
import { z } from 'zod'
import { fetchGitHubData } from '@/lib/github/client'
import { mapToAquariumData } from '@/lib/aquarium/mapper'
import { calculateCompareStats } from '@/lib/aquarium/compare'
import { getCached, setCached, CACHE_KEYS, CACHE_TTL } from '@/lib/cache/redis'
import type { AquariumData } from '@/types/aquarium'

const usernameSchema = z
  .string()
  .min(1)
  .max(39)
  .regex(/^[a-zA-Z0-9](?:[a-zA-Z0-9-]*[a-zA-Z0-9])?$/)

async function fetchAquarium(username: string): Promise<AquariumData> {
  const cached = await getCached<AquariumData>(CACHE_KEYS.aquarium(username))
  if (cached) return cached.data

  const { user, repos } = await fetchGitHubData(username)
  const data = mapToAquariumData(user, repos)
  await setCached(CACHE_KEYS.aquarium(username), data, {
    ttl: CACHE_TTL.AQUARIUM,
  })
  return data
}

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ u1: string; u2: string }> },
): Promise<NextResponse> {
  const { u1, u2 } = await params

  const r1 = usernameSchema.safeParse(u1)
  const r2 = usernameSchema.safeParse(u2)

  if (!r1.success || !r2.success) {
    return NextResponse.json({ error: 'Invalid username' }, { status: 400 })
  }

  try {
    const [aquarium1, aquarium2] = await Promise.all([
      fetchAquarium(u1),
      fetchAquarium(u2),
    ])

    const stats = calculateCompareStats(aquarium1, aquarium2)

    return NextResponse.json({
      users: [aquarium1, aquarium2],
      stats,
    })
  } catch {
    return NextResponse.json(
      { error: 'Failed to fetch aquarium data' },
      { status: 500 },
    )
  }
}
