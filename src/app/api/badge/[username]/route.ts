import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { generateBadgeSVG } from '@/lib/social/badge'
import { fetchGitHubData } from '@/lib/github/client'
import { mapToAquariumData } from '@/lib/aquarium/mapper'
import { getCached, setCached, CACHE_KEYS, CACHE_TTL } from '@/lib/cache/redis'
import type { AquariumData } from '@/types/aquarium'
import type { BadgeConfig } from '@/types/social'

const usernameSchema = z
  .string()
  .min(1)
  .max(39)
  .regex(/^[a-zA-Z0-9](?:[a-zA-Z0-9-]*[a-zA-Z0-9])?$/)

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ username: string }> },
): Promise<NextResponse> {
  const { username } = await params
  const searchParams = request.nextUrl.searchParams

  if (!usernameSchema.safeParse(username).success) {
    const fallback = generateBadgeSVG({
      username,
      style: 'flat',
      label: 'Git Aquarium',
      color: '#6b7280',
    })
    return new NextResponse(fallback, {
      headers: { 'Content-Type': 'image/svg+xml' },
    })
  }

  try {
    let aquarium: AquariumData
    const cached = await getCached<AquariumData>(CACHE_KEYS.aquarium(username))
    if (cached) {
      aquarium = cached.data
    } else {
      const { user, repos } = await fetchGitHubData(username)
      aquarium = mapToAquariumData(user, repos)
      await setCached(CACHE_KEYS.aquarium(username), aquarium, {
        ttl: CACHE_TTL.AQUARIUM,
      })
    }

    const languages = new Set(aquarium.fish.map((f) => f.species))

    const config: BadgeConfig = {
      username,
      style: (searchParams.get('style') as BadgeConfig['style']) ?? 'flat',
      label: searchParams.get('label') ?? 'Git Aquarium',
      color: searchParams.get('color') ?? '#0891b2',
      fishCount: aquarium.fish.length,
      languageCount: languages.size,
    }

    const svg = generateBadgeSVG(config)

    return new NextResponse(svg, {
      headers: {
        'Content-Type': 'image/svg+xml',
        'Cache-Control': 'public, max-age=3600, s-maxage=3600',
      },
    })
  } catch {
    const fallback = generateBadgeSVG({
      username,
      style: 'flat',
      label: 'Git Aquarium',
      color: '#6b7280',
    })
    return new NextResponse(fallback, {
      headers: { 'Content-Type': 'image/svg+xml' },
    })
  }
}
