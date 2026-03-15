'use client'

import { useMemo } from 'react'
import { useAquariumStore } from '@/stores/aquarium'
import { Fish } from './Fish'

function generateInitialPosition(
  index: number,
  total: number,
): [number, number, number] {
  const spread = Math.min(total * 0.4, 20)
  const goldenAngle = 2.399963 // radians
  const angle = index * goldenAngle
  const radius = 2 + (index / Math.max(total, 1)) * spread
  return [
    Math.cos(angle) * radius,
    2 + Math.random() * 5,
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
