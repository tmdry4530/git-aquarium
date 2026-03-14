'use client'

import { useRef, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import type { LegendaryFishType } from '@/types/fish'

interface LegendaryEffectsProps {
  type: LegendaryFishType
  position: [number, number, number]
  size: number
}

const PARTICLE_COUNT = 12

function createParticlePositions(count: number): Float32Array {
  const positions = new Float32Array(count * 3)
  for (let i = 0; i < count; i++) {
    const angle = (i / count) * Math.PI * 2
    positions[i * 3] = Math.cos(angle) * 0.5
    positions[i * 3 + 1] = (Math.random() - 0.5) * 0.4
    positions[i * 3 + 2] = Math.sin(angle) * 0.5
  }
  return positions
}

const LEGENDARY_COLORS: Record<LegendaryFishType, string> = {
  leviathan: '#1a0033',
  phoenix_fish: '#ff4400',
  hydra: '#00ff66',
  kraken: '#220044',
  narwhal: '#88ccff',
} as const

const LEGENDARY_PARTICLE_COLORS: Record<LegendaryFishType, string> = {
  leviathan: '#4400aa',
  phoenix_fish: '#ffaa00',
  hydra: '#44ff88',
  kraken: '#6633cc',
  narwhal: '#aaeeff',
} as const

function LegendaryEffects({ type, position, size }: LegendaryEffectsProps) {
  const groupRef = useRef<THREE.Group>(null)
  const particlesRef = useRef<THREE.Points>(null)
  const auraRef = useRef<THREE.Mesh>(null)

  const initialPositions = useMemo(
    () => createParticlePositions(PARTICLE_COUNT),
    [],
  )

  const auraColor = LEGENDARY_COLORS[type]
  const particleColor = LEGENDARY_PARTICLE_COLORS[type]

  useFrame((state) => {
    const t = state.clock.elapsedTime

    // Orbit particles around fish
    if (particlesRef.current) {
      const posAttr = particlesRef.current.geometry.attributes['position'] as
        | THREE.BufferAttribute
        | undefined
      if (posAttr) {
        for (let i = 0; i < PARTICLE_COUNT; i++) {
          const baseAngle = (i / PARTICLE_COUNT) * Math.PI * 2
          const angle = baseAngle + t * 0.5
          const radius = 0.4 + Math.sin(t * 2 + i) * 0.1
          posAttr.setXYZ(
            i,
            Math.cos(angle) * radius * size,
            Math.sin(t * 1.5 + i * 0.5) * 0.2 * size,
            Math.sin(angle) * radius * size,
          )
        }
        posAttr.needsUpdate = true
      }
    }

    // Pulsing aura
    if (auraRef.current) {
      const pulse = Math.sin(t * 1.5) * 0.5 + 0.5
      const mat = auraRef.current.material as THREE.MeshBasicMaterial
      mat.opacity = 0.05 + pulse * 0.1

      // Phoenix fire flicker
      if (type === 'phoenix_fish') {
        mat.opacity = 0.08 + Math.random() * 0.08
      }
    }
  })

  return (
    <group ref={groupRef} position={position}>
      {/* Aura sphere */}
      <mesh ref={auraRef} scale={size * 1.8}>
        <sphereGeometry args={[0.4, 12, 12]} />
        <meshBasicMaterial
          color={auraColor}
          transparent
          opacity={0.08}
          side={THREE.BackSide}
          depthWrite={false}
        />
      </mesh>

      {/* Orbiting particles */}
      <points ref={particlesRef}>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            args={[initialPositions, 3]}
          />
        </bufferGeometry>
        <pointsMaterial
          color={particleColor}
          size={0.06 * size}
          transparent
          opacity={0.8}
          sizeAttenuation
          depthWrite={false}
        />
      </points>
    </group>
  )
}

export { LegendaryEffects, LEGENDARY_COLORS, LEGENDARY_PARTICLE_COLORS }
