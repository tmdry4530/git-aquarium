'use client'

import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import type { Group } from 'three'

const SEAWEED_COUNT = 20

interface SeaweedData {
  id: number
  position: [number, number, number]
  height: number
  phase: number
}

interface SeaweedStrandProps {
  position: [number, number, number]
  height: number
  phase: number
}

// Pre-computed at module load time to avoid calling Math.random() during render
const SEAWEED_DATA: SeaweedData[] = Array.from(
  { length: SEAWEED_COUNT },
  (_, i) => ({
    id: i,
    position: [
      (Math.random() - 0.5) * 40,
      -1.5,
      (Math.random() - 0.5) * 40,
    ] as [number, number, number],
    height: 1.5 + Math.random() * 3,
    phase: Math.random() * Math.PI * 2,
  }),
)

function SeaweedStrand({ position, height, phase }: SeaweedStrandProps) {
  const groupRef = useRef<Group>(null)

  useFrame((state) => {
    if (!groupRef.current) return
    const t = state.clock.elapsedTime
    groupRef.current.rotation.z = Math.sin(t * 0.5 + phase) * 0.15
    groupRef.current.rotation.x = Math.sin(t * 0.3 + phase) * 0.05
  })

  return (
    <group ref={groupRef} position={position}>
      <mesh position={[0, height / 2, 0]}>
        <cylinderGeometry args={[0.02, 0.04, height, 4]} />
        <meshStandardMaterial color="#1a6640" roughness={0.8} />
      </mesh>
    </group>
  )
}

function Seaweed() {
  return (
    <group>
      {SEAWEED_DATA.map((s) => (
        <SeaweedStrand
          key={s.id}
          position={s.position}
          height={s.height}
          phase={s.phase}
        />
      ))}
    </group>
  )
}

export { Seaweed }
