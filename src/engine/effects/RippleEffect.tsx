'use client'

import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

interface RippleEffectProps {
  position: [number, number, number]
  color?: string
  onComplete: () => void
}

const DURATION = 2

export function RippleEffect({
  position,
  color = '#F44336',
  onComplete,
}: RippleEffectProps) {
  const meshRef = useRef<THREE.Mesh>(null)
  const elapsedRef = useRef(0)

  useFrame((_, delta) => {
    elapsedRef.current += delta
    if (elapsedRef.current >= DURATION) {
      onComplete()
      return
    }

    if (!meshRef.current) return
    const progress = elapsedRef.current / DURATION
    const scale = 1 + progress * 4
    meshRef.current.scale.set(scale, 1, scale)

    const material = meshRef.current.material as THREE.MeshBasicMaterial
    material.opacity = 1 - progress
  })

  return (
    <mesh ref={meshRef} position={position} rotation={[-Math.PI / 2, 0, 0]}>
      <ringGeometry args={[0.3, 0.5, 32]} />
      <meshBasicMaterial
        color={color}
        transparent
        opacity={1}
        side={THREE.DoubleSide}
        depthWrite={false}
      />
    </mesh>
  )
}
