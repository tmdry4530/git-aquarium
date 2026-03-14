'use client'

import { useRef, useEffect, useCallback } from 'react'
import { useFrame } from '@react-three/fiber'
import { useAquariumStore } from '@/stores/aquarium'
import {
  updateBoids,
  applyStartle,
  DEFAULT_BOID_CONFIG,
} from '@/lib/aquarium/boids'
import type { BoidState } from '@/lib/aquarium/boids'
import type { FishData } from '@/types/fish'

function fishToBoid(fish: FishData, index: number): BoidState {
  const angle = (index / 20) * Math.PI * 2
  const radius = 3 + Math.random() * 10
  return {
    id: fish.id,
    position: [
      Math.cos(angle) * radius,
      1 + Math.random() * 6,
      Math.sin(angle) * radius,
    ],
    velocity: [
      (Math.random() - 0.5) * 0.5,
      (Math.random() - 0.5) * 0.1,
      (Math.random() - 0.5) * 0.5,
    ],
    species: fish.species,
    size: fish.size,
    stars: fish.stars,
    isFossil: fish.evolutionStage === 'fossil',
  }
}

// Store for boid positions accessible by Fish components
const boidPositions = new Map<string, [number, number, number]>()

function getBoidPosition(fishId: string): [number, number, number] | undefined {
  return boidPositions.get(fishId)
}

function FlockingSystem() {
  const fish = useAquariumStore((s) => s.data?.fish ?? [])
  const boidsRef = useRef<BoidState[]>([])
  const initializedRef = useRef(false)

  // Initialize boids from fish data
  useEffect(() => {
    if (fish.length === 0) return
    boidsRef.current = fish.map((f, i) => fishToBoid(f, i))
    initializedRef.current = true
  }, [fish])

  // Handle click startle
  const handleClick = useCallback(
    (event: { point: { x: number; y: number; z: number } }) => {
      if (boidsRef.current.length === 0) return
      boidsRef.current = applyStartle(boidsRef.current, [
        event.point.x,
        event.point.y,
        event.point.z,
      ])
    },
    [],
  )

  // Update boids each frame (on main thread for simplicity)
  useFrame((_, delta) => {
    if (!initializedRef.current || boidsRef.current.length === 0) return

    // Clamp delta to avoid large jumps
    const clampedDelta = Math.min(delta, 0.05)
    boidsRef.current = updateBoids(
      boidsRef.current,
      DEFAULT_BOID_CONFIG,
      clampedDelta,
    )

    // Publish positions for Fish components
    for (const boid of boidsRef.current) {
      boidPositions.set(boid.id, boid.position)
    }
  })

  return (
    <mesh visible={false} onClick={handleClick}>
      <boxGeometry args={[50, 12, 50]} />
      <meshBasicMaterial transparent opacity={0} />
    </mesh>
  )
}

export { FlockingSystem, getBoidPosition }
