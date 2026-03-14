import { redirect } from 'next/navigation'
import { fetchGitHubData } from '@/lib/github/client'
import { mapToAquariumData } from '@/lib/aquarium/mapper'
import { createMergeOcean } from '@/lib/aquarium/merge'
import { MergeScene } from '@/components/merge/MergeScene'
import { getCached, setCached, CACHE_KEYS, CACHE_TTL } from '@/lib/cache/redis'
import type { AquariumData } from '@/types/aquarium'
import type { Metadata } from 'next'

interface MergePageProps {
  params: Promise<{ users: string; locale: string }>
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
}: MergePageProps): Promise<Metadata> {
  const { users } = await params
  const userList = users.split('+')
  return {
    title: `${userList.join(' + ')} — Merge Ocean | Git Aquarium`,
    description: `Merged aquariums of ${userList.join(', ')}`,
  }
}

export default async function MergePage({ params }: MergePageProps) {
  const { users, locale } = await params
  const usernames = users.split('+').slice(0, 5)

  if (usernames.length < 2) {
    redirect(`/${locale}/merge`)
  }

  const aquariums = await Promise.all(usernames.map(fetchAquarium))
  const mergeData = createMergeOcean(
    { usernames, layout: 'merged', interactionEnabled: true },
    aquariums,
  )

  return <MergeScene data={mergeData} />
}
