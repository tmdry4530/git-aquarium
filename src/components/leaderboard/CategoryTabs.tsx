'use client'

import Link from 'next/link'
import type { LeaderboardCategory, LeaderboardPeriod } from '@/types/social'

interface CategoryTabsProps {
  current: LeaderboardCategory
  period: LeaderboardPeriod
}

const CATEGORIES: { key: LeaderboardCategory; label: string }[] = [
  { key: 'diversity', label: 'Diversity' },
  { key: 'total_size', label: 'Total Stars' },
  { key: 'legendary_count', label: 'Legendary' },
  { key: 'codex_completion', label: 'Codex' },
  { key: 'weekly_new', label: 'New' },
]

const PERIODS: { key: LeaderboardPeriod; label: string }[] = [
  { key: 'all_time', label: 'All Time' },
  { key: 'monthly', label: 'Monthly' },
  { key: 'weekly', label: 'Weekly' },
]

export function CategoryTabs({ current, period }: CategoryTabsProps) {
  return (
    <div className="mb-6 space-y-3">
      <div className="flex gap-2">
        {CATEGORIES.map(({ key, label }) => (
          <Link
            key={key}
            href={`/leaderboard?category=${key}&period=${period}`}
            className={`rounded-lg px-3 py-1.5 text-sm font-medium transition-colors ${
              current === key
                ? 'bg-cyan-500/20 text-cyan-400'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            {label}
          </Link>
        ))}
      </div>
      <div className="flex gap-2">
        {PERIODS.map(({ key, label }) => (
          <Link
            key={key}
            href={`/leaderboard?category=${current}&period=${key}`}
            className={`rounded-md px-2 py-1 text-xs transition-colors ${
              period === key
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
