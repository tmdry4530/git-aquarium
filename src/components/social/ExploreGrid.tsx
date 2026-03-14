import Link from 'next/link'
import type { ExploreEntry } from '@/types/social'

interface ExploreGridProps {
  entries: ExploreEntry[]
}

export function ExploreGrid({ entries }: ExploreGridProps) {
  if (entries.length === 0) {
    return (
      <div className="rounded-xl bg-white/5 p-12 text-center">
        <p className="text-gray-400">
          No aquariums found. Try different filters!
        </p>
      </div>
    )
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {entries.map((entry) => (
        <Link
          key={entry.username}
          href={`/${entry.username}`}
          className="group rounded-xl bg-white/5 p-4 transition-colors hover:bg-white/10"
        >
          <div className="mb-3 flex items-center gap-3">
            {entry.avatarUrl && (
              <img
                src={entry.avatarUrl}
                alt={entry.username}
                className="h-10 w-10 rounded-full"
              />
            )}
            <div>
              <p className="font-medium text-white group-hover:text-cyan-400">
                {entry.username}
              </p>
              <p className="text-xs text-gray-500">{entry.fishCount} fish</p>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-2 text-center text-xs">
            <div>
              <p className="font-mono text-cyan-400">{entry.languageCount}</p>
              <p className="text-gray-500">Languages</p>
            </div>
            <div>
              <p className="font-mono text-yellow-400">
                {entry.totalStars.toLocaleString()}
              </p>
              <p className="text-gray-500">Stars</p>
            </div>
            <div>
              <p className="font-mono text-purple-400">
                {entry.legendaryCount}
              </p>
              <p className="text-gray-500">Legendary</p>
            </div>
          </div>
        </Link>
      ))}
    </div>
  )
}
