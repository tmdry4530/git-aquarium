'use client'

import Link from 'next/link'
import type { ExploreFilters as ExploreFiltersType } from '@/types/social'

interface ExploreFiltersProps {
  current: ExploreFiltersType
}

const SORT_OPTIONS = [
  { key: 'trending', label: 'Trending' },
  { key: 'newest', label: 'Newest' },
  { key: 'most_fish', label: 'Most Fish' },
  { key: 'most_diverse', label: 'Most Diverse' },
  { key: 'most_stars', label: 'Most Stars' },
] as const

const PERIOD_OPTIONS = [
  { key: 'all_time', label: 'All Time' },
  { key: 'month', label: 'Month' },
  { key: 'week', label: 'Week' },
  { key: 'day', label: 'Today' },
] as const

export function ExploreFilters({ current }: ExploreFiltersProps) {
  return (
    <div className="mb-6 flex flex-wrap gap-4">
      <div className="flex gap-1">
        {SORT_OPTIONS.map(({ key, label }) => (
          <Link
            key={key}
            href={`/explore?sortBy=${key}&period=${current.period}`}
            className={`rounded-lg px-3 py-1.5 text-sm transition-colors ${
              current.sortBy === key
                ? 'bg-cyan-500/20 text-cyan-400'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            {label}
          </Link>
        ))}
      </div>
      <div className="flex gap-1">
        {PERIOD_OPTIONS.map(({ key, label }) => (
          <Link
            key={key}
            href={`/explore?sortBy=${current.sortBy}&period=${key}`}
            className={`rounded-md px-2 py-1 text-xs transition-colors ${
              current.period === key
                ? 'bg-white/10 text-white'
                : 'text-gray-500 hover:text-gray-300'
            }`}
          >
            {label}
          </Link>
        ))}
      </div>
    </div>
  )
}
