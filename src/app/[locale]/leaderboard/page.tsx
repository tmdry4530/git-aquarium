import { getLeaderboard } from '@/lib/social/leaderboard'
import { LeaderboardTable } from '@/components/leaderboard/LeaderboardTable'
import { CategoryTabs } from '@/components/leaderboard/CategoryTabs'
import type { LeaderboardCategory, LeaderboardPeriod } from '@/types/social'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Leaderboard — Git Aquarium',
  description: 'Top aquariums ranked by diversity, size, and legendary fish',
}

interface LeaderboardPageProps {
  searchParams: Promise<{
    category?: string
    period?: string
    page?: string
  }>
}

export default async function LeaderboardPage({
  searchParams,
}: LeaderboardPageProps) {
  const params = await searchParams
  const category = (params.category ?? 'diversity') as LeaderboardCategory
  const period = (params.period ?? 'all_time') as LeaderboardPeriod
  const page = Number(params.page ?? '1')

  const data = await getLeaderboard(category, period, page)

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-950 to-black">
      <div className="mx-auto max-w-4xl px-4 py-8">
        <h1 className="mb-6 text-3xl font-bold text-white">Leaderboard</h1>
        <CategoryTabs current={category} period={period} />
        <LeaderboardTable data={data} />
      </div>
    </div>
  )
}
