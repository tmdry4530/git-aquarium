'use client'

import { useRef, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

interface HealEffectProps {
  position: [number, number, number]
  onComplete: () => void
}

const PARTICLE_COUNT = 15
const DURATION = 1.5

export function HealEffect({ position, onComplete }: HealEffectProps) {
  const pointsRef = useRef<THREE.Points>(null)
  const elapsedRef = useRef(0)

  const particles = useMemo(() => {
    const positions = new Float32Array(PARTICLE_COUNT * 3)
    const velocities = new Float32Array(PARTICLE_COUNT * 3)
    for (let i = 0; i < PARTICLE_COUNT; i++) {
      positions[i * 3] = position[0] + (Math.random() - 0.5) * 0.5
      positions[i * 3 + 1] = position[1]
      positions[i * 3 + 2] = position[2] + (Math.random() - 0.5) * 0.5
      velocities[i * 3] = (Math.random() - 0.5) * 0.5
      velocities[i * 3 + 1] = Math.random() * 2 + 1
      velocities[i * 3 + 2] = (Math.random() - 0.5) * 0.5
    }
    return { positions, velocities }
  }, [position])

  useFrame((_, delta) => {
    elapsedRef.current += delta
    if (elapsedRef.current >= DURATION) {
      onComplete()
      return
    }

    if (!pointsRef.current) return
    const geo = pointsRef.current.geometry
    const pos = geo.attributes['position'] as THREE.BufferAttribute
    const progress = elapsedRef.current / DURATION

    const posArray = pos.array as unknown as number[]
    const velArray = particles.velocities as unknown as number[]
    for (let i = 0; i < PARTICLE_COUNT; i++) {
      const idx = i * 3
      posArray[idx] = (posArray[idx] ?? 0) + (velArray[idx] ?? 0) * delta
      posArray[idx + 1] =
        (posArray[idx + 1] ?? 0) + (velArray[idx + 1] ?? 0) * delta
      posArray[idx + 2] =
        (posArray[idx + 2] ?? 0) + (velArray[idx + 2] ?? 0) * delta
    }
    pos.needsUpdate = true

    const material = pointsRef.current.material as THREE.PointsMaterial
    material.opacity = 1 - progress
  })

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          args={[particles.positions, 3]}
        />
      </bufferGeometry>
      <pointsMaterial
        color="#81C784"
        size={0.15}
        transparent
        opacity={1}
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </points>
  )
}
