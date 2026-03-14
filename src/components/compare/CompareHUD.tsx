'use client'

import type { CompareStats } from '@/types/social'
import { StatBar } from './StatBar'

interface CompareHUDProps {
  stats: CompareStats
  usernames: [string, string]
}

const STAT_CONFIG = [
  { key: 'fishCount' as const, label: 'Fish' },
  { key: 'languageDiversity' as const, label: 'Languages' },
  { key: 'totalStars' as const, label: 'Stars' },
  { key: 'legendaryCount' as const, label: 'Legendary' },
  {
    key: 'activeRatio' as const,
    label: 'Active %',
    format: 'percent' as const,
  },
]

export function CompareHUD({ stats, usernames }: CompareHUDProps) {
  return (
    <div className="absolute inset-x-0 bottom-0 z-10 bg-gradient-to-t from-black/80 to-transparent p-6">
      <div className="mx-auto max-w-2xl space-y-3">
        <div className="flex justify-between text-sm font-semibold text-cyan-300">
          <span>{usernames[0]}</span>
          <span>{usernames[1]}</span>
        </div>
        {STAT_CONFIG.map(({ key, label, format }) => {
          const [left, right] = stats[key] as [number, number]
          return (
            <StatBar
              key={key}
              label={label}
              left={left}
              right={right}
              format={format}
            />
          )
        })}
      </div>
    </div>
  )
}
