import { fetchGitHubData } from '@/lib/github/client'
import { mapToAquariumData } from '@/lib/aquarium/mapper'
import { EmbedScene } from '@/components/embed/EmbedScene'
import { getCached, setCached, CACHE_KEYS, CACHE_TTL } from '@/lib/cache/redis'
import type { AquariumData } from '@/types/aquarium'
import type { EmbedConfig } from '@/types/social'

interface EmbedPageProps {
  params: Promise<{ username: string }>
  searchParams: Promise<{
    theme?: 'light' | 'dark' | 'auto'
    controls?: string
    stats?: string
    interactive?: string
  }>
}

export default async function EmbedPage({
  params,
  searchParams,
}: EmbedPageProps) {
  const { username } = await params
  const query = await searchParams

  let data: AquariumData
  const cached = await getCached<AquariumData>(CACHE_KEYS.aquarium(username))
  if (cached) {
    data = cached.data
  } else {
    const { user, repos } = await fetchGitHubData(username)
    data = mapToAquariumData(user, repos)
    await setCached(CACHE_KEYS.aquarium(username), data, {
      ttl: CACHE_TTL.AQUARIUM,
    })
  }

  const config: EmbedConfig = {
    username,
    theme: query.theme ?? 'dark',
    width: 600,
    height: 400,
    showStats: query.stats !== 'false',
    showControls: query.controls !== 'false',
    interactive: query.interactive !== 'false',
  }

  return (
    <html>
      <body style={{ margin: 0, overflow: 'hidden' }}>
        <EmbedScene data={data} config={config} />
      </body>
    </html>
  )
}
