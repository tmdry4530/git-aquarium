'use client'

import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { Text } from '@react-three/drei'
import * as THREE from 'three'
import type { VisitorFishData } from '@/types/social'

interface GuestFishProps {
  visitor: VisitorFishData
  visitorUsername: string
  position: [number, number, number]
}

export function GuestFish({
  visitor,
  visitorUsername,
  position,
}: GuestFishProps) {
  const meshRef = useRef<THREE.Mesh>(null)

  useFrame((state) => {
    if (!meshRef.current) return
    const t = state.clock.elapsedTime
    meshRef.current.position.y = position[1] + Math.sin(t * 0.5) * 0.3
    meshRef.current.position.x = position[0] + Math.sin(t * 0.3) * 0.5
  })

  return (
    <group position={position}>
      <mesh ref={meshRef}>
        <sphereGeometry args={[visitor.size * 0.3, 16, 16]} />
        <meshStandardMaterial
          color={visitor.color}
          transparent
          opacity={0.6}
          emissive={visitor.color}
          emissiveIntensity={0.2}
        />
      </mesh>
      <Text
        position={[0, visitor.size * 0.5 + 0.3, 0]}
        fontSize={0.15}
        color="white"
        anchorX="center"
        outlineWidth={0.01}
        outlineColor="black"
      >
        {`${visitorUsername}'s ${visitor.repoName}`}
      </Text>
    </group>
  )
}
