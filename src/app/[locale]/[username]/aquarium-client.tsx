'use client'

import { useEffect } from 'react'
import { useAquariumStore } from '@/stores/aquarium'
import { StatsHUD } from '@/components/ui/StatsHUD'
import { FishTooltip } from '@/components/ui/FishTooltip'
import { FishDetailPanel } from '@/components/ui/FishDetailPanel'
import { AquariumScene } from '@/engine/scene/AquariumScene'
import { Environment } from '@/engine/scene/Environment'
import { FishGroup } from '@/engine/fish/FishGroup'
import { CanvasFallback } from '@/engine/fallback/CanvasFallback'
import { useWebGLSupport } from '@/engine/fallback/WebGLDetector'
import type { AquariumData } from '@/types/aquarium'

interface AquariumClientProps {
  data: AquariumData
}

function AquariumClient({ data }: AquariumClientProps) {
  const setData = useAquariumStore((s) => s.setData)
  const reset = useAquariumStore((s) => s.reset)
  const webgl = useWebGLSupport()

  useEffect(() => {
    setData(data)
    return () => reset()
  }, [data, setData, reset])

  if (webgl === 'none' || webgl === 'canvas2d') {
    return <CanvasFallback />
  }

  return (
    <div
      className="relative min-h-screen overflow-hidden"
      aria-label={`${data.user.username}'s Git Aquarium`}
    >
      <AquariumScene>
        <Environment />
        <FishGroup />
      </AquariumScene>

      {/* 2D overlays */}
      <StatsHUD />
      <FishTooltip />
      <FishDetailPanel />
    </div>
  )
}

export { AquariumClient }
