import { fetchGitHubData } from '@/lib/github/client'
import { mapToAquariumData } from '@/lib/aquarium/mapper'
import { calculateCompareStats } from '@/lib/aquarium/compare'
import { CompareScene } from '@/components/compare/CompareScene'
import { getCached, setCached, CACHE_KEYS, CACHE_TTL } from '@/lib/cache/redis'
import type { AquariumData } from '@/types/aquarium'
import type { Metadata } from 'next'

interface ComparePageProps {
  params: Promise<{ u1: string; u2: string; locale: string }>
}

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

export async function generateMetadata({
  params,
}: ComparePageProps): Promise<Metadata> {
  const { u1, u2 } = await params
  return {
    title: `${u1} vs ${u2} — Git Aquarium`,
    description: `Compare the aquariums of ${u1} and ${u2}`,
    openGraph: {
      images: [`/api/og/compare/${u1}/${u2}`],
    },
  }
}

export default async function ComparePage({ params }: ComparePageProps) {
  const { u1, u2 } = await params

  const [aquarium1, aquarium2] = await Promise.all([
    fetchAquarium(u1),
    fetchAquarium(u2),
  ])

  const stats = calculateCompareStats(aquarium1, aquarium2)

  return (
    <CompareScene
      data={{
        users: [aquarium1, aquarium2],
        stats,
      }}
    />
  )
}
