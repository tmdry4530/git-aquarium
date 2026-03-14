import { getExploreEntries } from '@/lib/social/explore'
import { ExploreGrid } from '@/components/social/ExploreGrid'
import { ExploreFilters } from '@/components/social/ExploreFilters'
import type { ExploreFilters as ExploreFiltersType } from '@/types/social'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Explore — Git Aquarium',
  description: 'Discover amazing aquariums from developers around the world',
}

interface ExplorePageProps {
  searchParams: Promise<{
    sortBy?: string
    language?: string
    period?: string
    page?: string
  }>
}

export default async function ExplorePage({ searchParams }: ExplorePageProps) {
  const params = await searchParams

  const filters: ExploreFiltersType = {
    sortBy: (params.sortBy ?? 'trending') as ExploreFiltersType['sortBy'],
    language: params.language ?? undefined,
    period: (params.period ?? 'all_time') as ExploreFiltersType['period'],
    page: Number(params.page ?? '1'),
    limit: 20,
  }

  const result = await getExploreEntries(filters)

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-950 to-black">
      <div className="mx-auto max-w-6xl px-4 py-8">
        <h1 className="mb-2 text-3xl font-bold text-white">Explore</h1>
        <p className="mb-6 text-gray-400">
          Discover amazing aquariums from developers around the world
        </p>
        <ExploreFilters current={filters} />
        <ExploreGrid entries={result.entries} />
        {result.hasMore && (
          <div className="mt-8 text-center">
            <a
              href={`/explore?sortBy=${filters.sortBy}&period=${filters.period}&page=${filters.page + 1}`}
              className="rounded-lg border border-white/20 px-6 py-2 text-sm text-white hover:border-cyan-500"
            >
              Load More
            </a>
          </div>
        )}
      </div>
    </div>
  )
}
