'use client'

import { useAquariumStore } from '@/stores/aquarium'
import { useUIStore } from '@/stores/ui'

function FishTooltip() {
  const tooltipVisible = useUIStore((s) => s.tooltipVisible)
  const tooltipPosition = useUIStore((s) => s.tooltipPosition)
  const hoveredFishId = useAquariumStore((s) => s.hoveredFishId)
  const fish = useAquariumStore(
    (s) => s.data?.fish.find((f) => f.id === hoveredFishId) ?? null,
  )

  if (!tooltipVisible || !fish) return null

  return (
    <div
      role="tooltip"
      aria-live="polite"
      className="fixed z-40 pointer-events-none select-none"
      style={{ left: tooltipPosition.x + 16, top: tooltipPosition.y - 8 }}
    >
      <div className="rounded-lg border border-primary/30 bg-[rgba(5,15,35,0.92)] backdrop-blur-sm px-3 py-2 text-xs font-mono shadow-lg min-w-[140px]">
        <p className="text-primary font-bold truncate max-w-[200px]">
          {fish.repoName}
        </p>
        {fish.language && (
          <p className="text-foreground/60 mt-0.5">{fish.language}</p>
        )}
        <div className="flex items-center gap-3 mt-1">
          <span className="text-accent">★ {fish.stars.toLocaleString()}</span>
          {fish.forks > 0 && (
            <span className="text-foreground/50">⑂ {fish.forks}</span>
          )}
        </div>
      </div>
    </div>
  )
}

export { FishTooltip }
