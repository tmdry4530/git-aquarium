import { NextRequest, NextResponse } from 'next/server'
import { getExploreEntries } from '@/lib/social/explore'
import type { ExploreFilters } from '@/types/social'

export async function GET(request: NextRequest): Promise<NextResponse> {
  const searchParams = request.nextUrl.searchParams

  const filters: ExploreFilters = {
    sortBy: (searchParams.get('sortBy') ??
      'trending') as ExploreFilters['sortBy'],
    language: searchParams.get('language') ?? undefined,
    period: (searchParams.get('period') ??
      'all_time') as ExploreFilters['period'],
    page: Number(searchParams.get('page') ?? '1'),
    limit: Math.min(Number(searchParams.get('limit') ?? '20'), 50),
  }

  try {
    const result = await getExploreEntries(filters)
    return NextResponse.json(result)
  } catch {
    return NextResponse.json(
      { error: 'Failed to fetch explore data' },
      { status: 500 },
    )
  }
}
