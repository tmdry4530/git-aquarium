'use client'

import { useCallback } from 'react'
import { useEventStore } from '@/stores/events'
import { StarburstEffect } from './StarburstEffect'
import { BirthEffect } from './BirthEffect'
import { HealEffect } from './HealEffect'
import { LevelUpEffect } from './LevelUpEffect'
import { DissolveEffect } from './DissolveEffect'
import { RippleEffect } from './RippleEffect'
import { FeedEffect } from './FeedEffect'
import type { AquariumEventType } from '@/types/webhook'

function getRandomPosition(): [number, number, number] {
  return [
    (Math.random() - 0.5) * 20,
    Math.random() * 5 + 2,
    (Math.random() - 0.5) * 20,
  ]
}

export function EventAnimations() {
  const activeAnimations = useEventStore((s) => s.activeAnimations)
  const removeAnimation = useEventStore((s) => s.removeAnimation)

  const handleComplete = useCallback(
    (eventId: string) => {
      removeAnimation(eventId)
    },
    [removeAnimation],
  )

  return (
    <group>
      {activeAnimations.map((event) => {
        const position = getRandomPosition()
        return (
          <EventEffect
            key={event.id}
            type={event.type}
            position={position}
            onComplete={() => handleComplete(event.id)}
          />
        )
      })}
    </group>
  )
}

interface EventEffectProps {
  type: AquariumEventType
  position: [number, number, number]
  onComplete: () => void
}

function EventEffect({ type, position, onComplete }: EventEffectProps) {
  switch (type) {
    case 'feed':
      return <FeedEffect position={position} onComplete={onComplete} />
    case 'starlight':
      return <StarburstEffect position={position} onComplete={onComplete} />
    case 'birth':
    case 'egg_spawn':
      return <BirthEffect position={position} onComplete={onComplete} />
    case 'ripple':
      return (
        <RippleEffect
          position={position}
          color="#F44336"
          onComplete={onComplete}
        />
      )
    case 'heal':
      return <HealEffect position={position} onComplete={onComplete} />
    case 'swim_together':
      return (
        <RippleEffect
          position={position}
          color="#42A5F5"
          onComplete={onComplete}
        />
      )
    case 'flee':
      return (
        <RippleEffect
          position={position}
          color="#FF9800"
          onComplete={onComplete}
        />
      )
    case 'dissolve':
      return <DissolveEffect position={position} onComplete={onComplete} />
    case 'level_up':
      return <LevelUpEffect position={position} onComplete={onComplete} />
    default:
      return null
  }
}
