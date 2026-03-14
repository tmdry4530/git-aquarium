'use client'

import { useRef, useEffect } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { useAquariumStore } from '@/stores/aquarium'

const MIN_COUNT = 50
const MAX_COUNT = 500

function Plankton() {
  const followers = useAquariumStore((s) => s.data?.user.followers ?? 0)
  const count = Math.min(
    Math.max(Math.floor(followers * 0.5), MIN_COUNT),
    MAX_COUNT,
  )

  const pointsRef = useRef<THREE.Points>(null)
  const velocitiesRef = useRef<Float32Array>(new Float32Array(0))

  useEffect(() => {
    if (!pointsRef.current) return
    const positions = new Float32Array(count * 3)
    const vel = new Float32Array(count * 3)

    for (let i = 0; i < count; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 50
      positions[i * 3 + 1] = Math.random() * 12 - 1
      positions[i * 3 + 2] = (Math.random() - 0.5) * 50

      // Very slow drift
      vel[i * 3] = (Math.random() - 0.5) * 0.003
      vel[i * 3 + 1] = (Math.random() - 0.5) * 0.002
      vel[i * 3 + 2] = (Math.random() - 0.5) * 0.003
    }

    velocitiesRef.current = vel
    const geo = new THREE.BufferGeometry()
    geo.setAttribute('position', new THREE.BufferAttribute(positions, 3))
    pointsRef.current.geometry = geo
    return () => {
      geo.dispose()
    }
  }, [count])

  useFrame(() => {
    if (!pointsRef.current) return
    const posAttr = pointsRef.current.geometry.attributes['position'] as
      | THREE.BufferAttribute
      | undefined
    if (!posAttr) return

    const vel = velocitiesRef.current

    for (let i = 0; i < count; i++) {
      const nx = posAttr.getX(i) + (vel[i * 3] ?? 0)
      const ny = posAttr.getY(i) + (vel[i * 3 + 1] ?? 0)
      const nz = posAttr.getZ(i) + (vel[i * 3 + 2] ?? 0)

      if (Math.abs(nx) > 25) vel[i * 3] = -(vel[i * 3] ?? 0)
      if (ny > 11 || ny < -1) vel[i * 3 + 1] = -(vel[i * 3 + 1] ?? 0)
      if (Math.abs(nz) > 25) vel[i * 3 + 2] = -(vel[i * 3 + 2] ?? 0)

      posAttr.setX(i, nx)
      posAttr.setY(i, ny)
      posAttr.setZ(i, nz)
    }

    posAttr.needsUpdate = true
  })

  return (
    <points ref={pointsRef}>
      <pointsMaterial
        color="#88ffdd"
        size={0.02}
        transparent
        opacity={0.7}
        sizeAttenuation
      />
    </points>
  )
}

export { Plankton }
