'use client'

import type { MergeOceanData } from '@/types/social'

interface MergeSceneProps {
  data: MergeOceanData
}

const OWNER_COLORS = [
  'text-cyan-400',
  'text-orange-400',
  'text-green-400',
  'text-purple-400',
  'text-pink-400',
]

export function MergeScene({ data }: MergeSceneProps) {
  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-950 to-black p-6">
      <div className="mx-auto max-w-6xl">
        {/* Header */}
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-white">Merge Ocean</h1>
          <div className="mt-2 flex items-center justify-center gap-2">
            {data.config.usernames.map((username, i) => (
              <span
                key={username}
                className={`font-semibold ${OWNER_COLORS[i] ?? 'text-white'}`}
              >
                {username}
                {i < data.config.usernames.length - 1 && (
                  <span className="ml-2 text-gray-500">+</span>
                )}
              </span>
            ))}
          </div>
        </div>

        {/* Stats */}
        <div className="mb-8 grid grid-cols-4 gap-4">
          <div className="rounded-xl bg-white/5 p-4 text-center backdrop-blur-sm">
            <p className="text-3xl font-bold text-cyan-400">
              {data.totalStats.fishCount}
            </p>
            <p className="text-sm text-gray-400">Total Fish</p>
          </div>
          <div className="rounded-xl bg-white/5 p-4 text-center backdrop-blur-sm">
            <p className="text-3xl font-bold text-green-400">
              {data.totalStats.languageCount}
            </p>
            <p className="text-sm text-gray-400">Languages</p>
          </div>
          <div className="rounded-xl bg-white/5 p-4 text-center backdrop-blur-sm">
            <p className="text-3xl font-bold text-yellow-400">
              {data.totalStats.totalStars.toLocaleString()}
            </p>
            <p className="text-sm text-gray-400">Stars</p>
          </div>
          <div className="rounded-xl bg-white/5 p-4 text-center backdrop-blur-sm">
            <p className="text-3xl font-bold text-purple-400">
              {data.totalStats.uniqueSpecies}
            </p>
            <p className="text-sm text-gray-400">Species</p>
          </div>
        </div>

        {/* Fish grid by owner */}
        <div className="space-y-6">
          {data.aquariums.map((aq, index) => (
            <div key={aq.user.username}>
              <h3
                className={`mb-3 text-lg font-semibold ${OWNER_COLORS[index] ?? 'text-white'}`}
              >
                {aq.user.username} ({aq.fish.length} fish)
              </h3>
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-4 md:grid-cols-6">
                {aq.fish.slice(0, 12).map((fish) => (
                  <div
                    key={fish.id}
                    className="rounded-lg bg-white/5 p-3 text-center"
                  >
                    <div
                      className="mx-auto mb-1 h-8 w-8 rounded-full"
                      style={{ backgroundColor: fish.color }}
                    />
                    <p className="truncate text-xs text-white">
                      {fish.repoName}
                    </p>
                    <p className="text-xs text-gray-500">{fish.species}</p>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
