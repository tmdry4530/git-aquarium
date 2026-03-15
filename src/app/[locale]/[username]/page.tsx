import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import { AquariumClient } from './aquarium-client'
import { fetchGitHubData } from '@/lib/github/client'
import { mapToAquariumData } from '@/lib/aquarium/mapper'
import { getCached, setCached, CACHE_KEYS, CACHE_TTL } from '@/lib/cache/redis'
import type { AquariumData } from '@/types/aquarium'

interface AquariumPageProps {
  params: Promise<{ locale: string; username: string }>
}

async function getAquariumData(username: string): Promise<AquariumData | null> {
  try {
    const cached = await getCached<AquariumData>(CACHE_KEYS.aquarium(username))
    if (cached) return cached.data
  } catch {
    // Cache miss — continue
  }

  try {
    const { user, repos } = await fetchGitHubData(username)
    const data = mapToAquariumData(user, repos)

    try {
      await setCached(CACHE_KEYS.aquarium(username), data, {
        ttl: CACHE_TTL.AQUARIUM,
      })
    } catch {
      // Cache write failure is non-critical
    }

    return data
  } catch (err) {
    const message = err instanceof Error ? err.message : ''
    if (message.includes('NOT_FOUND')) return null
    throw err
  }
}

export async function generateMetadata({
  params,
}: AquariumPageProps): Promise<Metadata> {
  const { username } = await params
  return {
    title: `${username}'s Aquarium | Git Aquarium`,
    description: `Explore ${username}'s GitHub repositories as a living 3D aquarium`,
    openGraph: {
      images: [`/api/og/${username}`],
    },
  }
}

export default async function AquariumPage({ params }: AquariumPageProps) {
  const { username } = await params
  const data = await getAquariumData(username)

  if (!data) notFound()

  return <AquariumClient data={data} />
}
