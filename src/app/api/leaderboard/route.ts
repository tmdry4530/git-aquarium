import { NextRequest, NextResponse } from 'next/server'
import { getLeaderboard } from '@/lib/social/leaderboard'
import type { LeaderboardCategory, LeaderboardPeriod } from '@/types/social'

const VALID_CATEGORIES: LeaderboardCategory[] = [
  'diversity',
  'total_size',
  'legendary_count',
  'codex_completion',
  'weekly_new',
]
const VALID_PERIODS: LeaderboardPeriod[] = ['all_time', 'weekly', 'monthly']

export async function GET(request: NextRequest): Promise<NextResponse> {
  const searchParams = request.nextUrl.searchParams
  const category = (searchParams.get('category') ??
    'diversity') as LeaderboardCategory
  const period = (searchParams.get('period') ?? 'all_time') as LeaderboardPeriod
  const page = Number(searchParams.get('page') ?? '1')

  if (!VALID_CATEGORIES.includes(category)) {
    return NextResponse.json({ error: 'Invalid category' }, { status: 400 })
  }
  if (!VALID_PERIODS.includes(period)) {
    return NextResponse.json({ error: 'Invalid period' }, { status: 400 })
  }

  try {
    const data = await getLeaderboard(category, period, page)
    return NextResponse.json(data)
  } catch {
    return NextResponse.json(
      { error: 'Failed to fetch leaderboard' },
      { status: 500 },
    )
  }
}
