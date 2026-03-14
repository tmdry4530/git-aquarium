'use client'

import { Suspense, useEffect } from 'react'
import { AquariumScene } from '@/engine/scene/AquariumScene'
import { Environment } from '@/engine/scene/Environment'
import { FishGroup } from '@/engine/fish/FishGroup'
import { EventAnimations } from '@/engine/effects/EventAnimations'
import { EventFeed } from '@/components/ui/EventFeed'
import { EventToast } from '@/components/ui/EventToast'
import { LiveModeOverlay } from '@/components/ui/LiveModeOverlay'
import { useAquariumEvents } from '@/lib/realtime/hooks'
import { useAquariumStore } from '@/stores/aquarium'
import type { AquariumData } from '@/types/aquarium'

interface LiveClientProps {
  data: AquariumData
  username: string
  obsMode: boolean
  chromaKeyColor: string | null
}

export function LiveClient({
  data,
  username,
  obsMode,
  chromaKeyColor,
}: LiveClientProps) {
  const setData = useAquariumStore((s) => s.setData)

  useEffect(() => {
    setData(data)
  }, [data, setData])

  useAquariumEvents(username)

  return (
    <div className="h-screen w-screen overflow-hidden">
      <AquariumScene>
        <Suspense fallback={null}>
          <Environment />
          <FishGroup />
          <EventAnimations />
        </Suspense>
      </AquariumScene>

      {!obsMode && (
        <>
          <EventFeed maxVisible={3} />
          <EventToast />
        </>
      )}

      <LiveModeOverlay obsMode={obsMode} chromaKeyColor={chromaKeyColor} />
    </div>
  )
}
