'use client'

import type { AquariumData } from '@/types/aquarium'
import type { EmbedConfig } from '@/types/social'

interface EmbedSceneProps {
  data: AquariumData
  config: EmbedConfig
}

export function EmbedScene({ data, config }: EmbedSceneProps) {
  const bgColor =
    config.theme === 'light'
      ? 'bg-blue-50'
      : 'bg-gradient-to-b from-blue-950 to-black'
  const textColor = config.theme === 'light' ? 'text-gray-800' : 'text-white'

  return (
    <div className={`relative h-screen w-screen ${bgColor}`}>
      {/* Fish display */}
      <div className="flex h-full flex-wrap items-center justify-center gap-2 p-4">
        {data.fish.slice(0, 20).map((fish) => (
          <div
            key={fish.id}
            className="flex flex-col items-center"
            title={fish.repoName}
          >
            <div
              className="rounded-full"
              style={{
                backgroundColor: fish.color,
                width: `${Math.max(12, fish.size * 12)}px`,
                height: `${Math.max(12, fish.size * 12)}px`,
                opacity: fish.evolutionStage === 'fossil' ? 0.3 : 0.8,
              }}
            />
          </div>
        ))}
      </div>

      {/* Stats overlay */}
      {config.showStats && (
        <div
          className={`absolute bottom-0 left-0 right-0 bg-black/50 p-3 ${textColor}`}
        >
          <div className="flex items-center justify-between text-xs">
            <span className="font-semibold">{data.user.username}</span>
            <div className="flex gap-3">
              <span>{data.stats.totalFish} fish</span>
              <span>{data.stats.totalStars.toLocaleString()} stars</span>
            </div>
          </div>
        </div>
      )}

      {/* Controls */}
      {config.showControls && (
        <div className="absolute right-2 top-2">
          <a
            href={`/${config.username}`}
            target="_blank"
            rel="noopener noreferrer"
            className="rounded bg-black/50 px-2 py-1 text-xs text-white hover:bg-black/70"
          >
            Open
          </a>
        </div>
      )}
    </div>
  )
}
