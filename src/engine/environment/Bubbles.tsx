'use client'

import { useRef, useMemo, useEffect } from 'react'
import { useFrame } from '@react-three/fiber'
import type { InstancedMesh } from 'three'
import * as THREE from 'three'

const BUBBLE_HEIGHT_MAX = 12
const BUBBLE_HEIGHT_MIN = -2

interface BubbleState {
  x: number
  y: number
  z: number
  speed: number
  drift: number
  phase: number
}

interface BubblesProps {
  count?: number
}

function createBubbleStates(count: number): BubbleState[] {
  return Array.from({ length: count }, () => ({
    x: (Math.random() - 0.5) * 40,
    y:
      Math.random() * (BUBBLE_HEIGHT_MAX - BUBBLE_HEIGHT_MIN) +
      BUBBLE_HEIGHT_MIN,
    z: (Math.random() - 0.5) * 40,
    speed: 0.5 + Math.random() * 1.5,
    drift: (Math.random() - 0.5) * 0.02,
    phase: Math.random() * Math.PI * 2,
  }))
}

function Bubbles({ count = 50 }: BubblesProps) {
  const meshRef = useRef<InstancedMesh>(null)
  const bubbleStates = useRef<BubbleState[]>([])
  const tempMatrix = useRef(new THREE.Matrix4())

  const { geometry, material } = useMemo(
    () => ({
      geometry: new THREE.SphereGeometry(0.05, 8, 8),
      material: new THREE.MeshStandardMaterial({
        color: '#88ccff',
        transparent: true,
        opacity: 0.4,
        roughness: 0.0,
        metalness: 0.1,
      }),
    }),
    [],
  )

  useEffect(() => {
    bubbleStates.current = createBubbleStates(count)
  }, [count])

  useEffect(() => {
    return () => {
      geometry.dispose()
      material.dispose()
    }
  }, [geometry, material])

  useFrame((_, delta) => {
    if (!meshRef.current || bubbleStates.current.length === 0) return

    bubbleStates.current.forEach((b, i) => {
      b.y += b.speed * delta
      b.x += b.drift
      b.phase += delta

      if (b.y > BUBBLE_HEIGHT_MAX) {
        b.y = BUBBLE_HEIGHT_MIN
        b.x = (Math.random() - 0.5) * 40
        b.z = (Math.random() - 0.5) * 40
      }

      tempMatrix.current.setPosition(b.x + Math.sin(b.phase) * 0.1, b.y, b.z)
      meshRef.current!.setMatrixAt(i, tempMatrix.current)
    })

    meshRef.current.instanceMatrix.needsUpdate = true
  })

  return <instancedMesh ref={meshRef} args={[geometry, material, count]} />
}

export { Bubbles }
