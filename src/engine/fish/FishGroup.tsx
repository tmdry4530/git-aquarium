'use client'

import { useMemo } from 'react'
import { useAquariumStore } from '@/stores/aquarium'
import { Fish } from './Fish'

function generateInitialPosition(
  index: number,
  total: number,
): [number, number, number] {
  const spread = Math.min(total * 0.5, 25)
  const angle = (index / Math.max(total, 1)) * Math.PI * 2
  const radius = 3 + Math.random() * spread
  return [
    Math.cos(angle) * radius,
    1 + Math.random() * 6,
    Math.sin(angle) * radius,
  ]
}

function FishGroup() {
  const fish = useAquariumStore((s) => s.data?.fish ?? [])

  const fishWithPositions = useMemo(
    () =>
      fish.map((f, i) => ({
        data: f,
        position: generateInitialPosition(i, fish.length),
      })),
    [fish],
  )

  return (
    <group>
      {fishWithPositions.map(({ data, position }) => (
        <Fish key={data.id} data={data} initialPosition={position} />
      ))}
    </group>
  )
}

export { FishGroup }
