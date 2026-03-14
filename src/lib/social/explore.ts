import { getSupabaseAdmin } from '@/lib/auth/supabase'
import { getCached, setCached } from '@/lib/cache/redis'
import type { ExploreEntry, ExploreFilters } from '@/types/social'

const EXPLORE_CACHE_TTL = 300

export interface ExploreResult {
  entries: ExploreEntry[]
  totalCount: number
  hasMore: boolean
}

export async function getExploreEntries(
  filters: ExploreFilters,
): Promise<ExploreResult> {
  const cacheKey = `explore:${filters.sortBy}:${filters.period}:${filters.language ?? 'all'}:${filters.page}`

  try {
    const cached = await getCached<ExploreResult>(cacheKey)
    if (cached) return cached.data
  } catch {
    // Cache miss
  }

  const supabase = getSupabaseAdmin()
  if (!supabase) {
    return { entries: [], totalCount: 0, hasMore: false }
  }

  const offset = (filters.page - 1) * filters.limit

  let query = supabase
    .from('leaderboard')
    .select('*', { count: 'exact' })
    .eq(
      'period',
      filters.period === 'day'
        ? 'weekly'
        : filters.period === 'week'
          ? 'weekly'
          : filters.period === 'month'
            ? 'monthly'
            : 'all_time',
    )

  if (filters.sortBy === 'most_diverse') {
    query = query.eq('category', 'diversity')
  } else if (filters.sortBy === 'most_stars') {
    query = query.eq('category', 'total_size')
  } else {
    query = query.eq('category', 'diversity')
  }

  query = query
    .order('score', { ascending: false })
    .range(offset, offset + filters.limit - 1)

  const { data, error, count } = await query

  if (error) throw error

  const entries: ExploreEntry[] = (data ?? []).map(
    (row: Record<string, unknown>) => {
      const metadata = (row.metadata as Record<string, unknown>) ?? {}
      return {
        username: row.username as string,
        avatarUrl: (metadata.avatar_url as string) ?? '',
        fishCount: (metadata.fish_count as number) ?? 0,
        languageCount: Number(row.score) || 0,
        totalStars: (metadata.total_stars as number) ?? 0,
        legendaryCount: (metadata.legendary_count as number) ?? 0,
        topSpecies: ((metadata.top_species as string[]) ??
          []) as ExploreEntry['topSpecies'],
        lastUpdated: (row.updated_at as string) ?? new Date().toISOString(),
      }
    },
  )

  const result: ExploreResult = {
    entries,
    totalCount: count ?? 0,
    hasMore: (count ?? 0) > offset + filters.limit,
  }

  try {
    await setCached(cacheKey, result, { ttl: EXPLORE_CACHE_TTL })
  } catch {
    // Non-critical
  }

  return result
}
