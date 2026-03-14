'use client'

import { useRef, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

interface LevelUpEffectProps {
  position: [number, number, number]
  onComplete: () => void
}

const PARTICLE_COUNT = 200
const DURATION = 4

export function LevelUpEffect({ position, onComplete }: LevelUpEffectProps) {
  const pointsRef = useRef<THREE.Points>(null)
  const elapsedRef = useRef(0)

  const particles = useMemo(() => {
    const positions = new Float32Array(PARTICLE_COUNT * 3)
    const velocities = new Float32Array(PARTICLE_COUNT * 3)
    const colors = new Float32Array(PARTICLE_COUNT * 3)
    const goldColor = new THREE.Color('#FFD700')
    const orangeColor = new THREE.Color('#FF6F00')
    for (let i = 0; i < PARTICLE_COUNT; i++) {
      const angle = Math.random() * Math.PI * 2
      const radius = Math.random() * 0.3
      positions[i * 3] = position[0] + Math.cos(angle) * radius
      positions[i * 3 + 1] = position[1]
      positions[i * 3 + 2] = position[2] + Math.sin(angle) * radius
      velocities[i * 3] = (Math.random() - 0.5) * 0.5
      velocities[i * 3 + 1] = Math.random() * 4 + 2
      velocities[i * 3 + 2] = (Math.random() - 0.5) * 0.5
      const t = Math.random()
      const color = goldColor.clone().lerp(orangeColor, t)
      colors[i * 3] = color.r
      colors[i * 3 + 1] = color.g
      colors[i * 3 + 2] = color.b
    }
    return { positions, velocities, colors }
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
    material.opacity = 1 - progress * progress
  })

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          args={[particles.positions, 3]}
        />
        <bufferAttribute
          attach="attributes-color"
          args={[particles.colors, 3]}
        />
      </bufferGeometry>
      <pointsMaterial
        size={0.12}
        transparent
        opacity={1}
        depthWrite={false}
        vertexColors
        blending={THREE.AdditiveBlending}
      />
    </points>
  )
}
