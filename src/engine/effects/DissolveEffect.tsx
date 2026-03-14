'use client'

import { useRef, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

interface DissolveEffectProps {
  position: [number, number, number]
  onComplete: () => void
}

const PARTICLE_COUNT = 100
const DURATION = 3

export function DissolveEffect({ position, onComplete }: DissolveEffectProps) {
  const pointsRef = useRef<THREE.Points>(null)
  const elapsedRef = useRef(0)

  const particles = useMemo(() => {
    const positions = new Float32Array(PARTICLE_COUNT * 3)
    const velocities = new Float32Array(PARTICLE_COUNT * 3)
    for (let i = 0; i < PARTICLE_COUNT; i++) {
      positions[i * 3] = position[0] + (Math.random() - 0.5) * 1
      positions[i * 3 + 1] = position[1] + (Math.random() - 0.5) * 1
      positions[i * 3 + 2] = position[2] + (Math.random() - 0.5) * 1
      const theta = Math.random() * Math.PI * 2
      const phi = Math.random() * Math.PI
      const speed = Math.random() * 2 + 0.5
      velocities[i * 3] = Math.sin(phi) * Math.cos(theta) * speed
      velocities[i * 3 + 1] = Math.sin(phi) * Math.sin(theta) * speed
      velocities[i * 3 + 2] = Math.cos(phi) * speed
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
    material.size = 0.15 * (1 + progress)
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
        color="#FFFFFF"
        size={0.15}
        transparent
        opacity={1}
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </points>
  )
}
