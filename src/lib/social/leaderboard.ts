import { getSupabaseAdmin } from '@/lib/auth/supabase'
import { getCached, setCached } from '@/lib/cache/redis'
import type {
  LeaderboardData,
  LeaderboardCategory,
  LeaderboardPeriod,
} from '@/types/social'

const CACHE_TTL = 300

export async function getLeaderboard(
  category: LeaderboardCategory,
  period: LeaderboardPeriod = 'all_time',
  page: number = 1,
  limit: number = 50,
): Promise<LeaderboardData> {
  const cacheKey = `leaderboard:${category}:${period}:${page}`

  try {
    const cached = await getCached<LeaderboardData>(cacheKey)
    if (cached) return cached.data
  } catch {
    // Cache miss or error — continue to DB
  }

  const supabase = getSupabaseAdmin()
  if (!supabase) {
    return {
      category,
      period,
      entries: [],
      totalCount: 0,
    }
  }

  const offset = (page - 1) * limit

  const { data, error, count } = await supabase
    .from('leaderboard')
    .select('*', { count: 'exact' })
    .eq('category', category)
    .eq('period', period)
    .order('rank', { ascending: true })
    .range(offset, offset + limit - 1)

  if (error) throw error

  const result: LeaderboardData = {
    category,
    period,
    entries: (data ?? []).map((row: Record<string, unknown>) => ({
      rank: row.rank as number,
      username: row.username as string,
      avatarUrl:
        ((row.metadata as Record<string, unknown>)?.avatar_url as string) ?? '',
      score: Number(row.score),
      category: row.category as LeaderboardCategory,
      metadata: (row.metadata as Record<string, unknown>) ?? {},
    })),
    totalCount: count ?? 0,
  }

  try {
    await setCached(cacheKey, result, { ttl: CACHE_TTL })
  } catch {
    // Cache write failure is non-critical
  }

  return result
}
