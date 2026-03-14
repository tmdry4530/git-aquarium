'use client'

import { useRef, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import type { KudoType } from '@/types/social'

interface KudoEffectProps {
  type: KudoType
  position: [number, number, number]
  onComplete: () => void
}

const KUDO_COLORS: Record<KudoType, string> = {
  star: '#FFD700',
  bug: '#00FF88',
  idea: '#00BFFF',
}

const PARTICLE_COUNT = 20
const DURATION = 2

export function KudoEffect({ type, position, onComplete }: KudoEffectProps) {
  const pointsRef = useRef<THREE.Points>(null)
  const elapsedRef = useRef(0)

  const particles = useMemo(() => {
    const positions = new Float32Array(PARTICLE_COUNT * 3)
    const velocities = new Float32Array(PARTICLE_COUNT * 3)
    for (let i = 0; i < PARTICLE_COUNT; i++) {
      positions[i * 3] = position[0]
      positions[i * 3 + 1] = position[1]
      positions[i * 3 + 2] = position[2]
      velocities[i * 3] = (Math.random() - 0.5) * 2
      velocities[i * 3 + 1] = Math.random() * 3 + 1
      velocities[i * 3 + 2] = (Math.random() - 0.5) * 2
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
    const pos = geo.attributes.position as THREE.BufferAttribute
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
        color={KUDO_COLORS[type]}
        size={0.15}
        transparent
        opacity={1}
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </points>
  )
}
