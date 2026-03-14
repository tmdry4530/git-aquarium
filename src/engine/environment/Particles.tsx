'use client'

import { useRef, useEffect } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

interface ParticlesProps {
  count?: number
}

function createParticleData(count: number) {
  const positions = new Float32Array(count * 3)
  const velocities = new Float32Array(count * 3)

  for (let i = 0; i < count; i++) {
    positions[i * 3] = (Math.random() - 0.5) * 60
    positions[i * 3 + 1] = Math.random() * 15 - 2
    positions[i * 3 + 2] = (Math.random() - 0.5) * 60

    velocities[i * 3] = (Math.random() - 0.5) * 0.01
    velocities[i * 3 + 1] = (Math.random() - 0.5) * 0.005
    velocities[i * 3 + 2] = (Math.random() - 0.5) * 0.01
  }

  return { positions, velocities }
}

function Particles({ count = 200 }: ParticlesProps) {
  const pointsRef = useRef<THREE.Points>(null)
  const velocitiesRef = useRef<Float32Array>(new Float32Array(0))

  useEffect(() => {
    if (!pointsRef.current) return
    const { positions, velocities } = createParticleData(count)
    velocitiesRef.current = velocities

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

      if (Math.abs(nx) > 30) vel[i * 3] = -(vel[i * 3] ?? 0)
      if (ny > 13 || ny < -2) vel[i * 3 + 1] = -(vel[i * 3 + 1] ?? 0)
      if (Math.abs(nz) > 30) vel[i * 3 + 2] = -(vel[i * 3 + 2] ?? 0)

      posAttr.setX(i, nx)
      posAttr.setY(i, ny)
      posAttr.setZ(i, nz)
    }

    posAttr.needsUpdate = true
  })

  return (
    <points ref={pointsRef}>
      <pointsMaterial
        color="#aaddff"
        size={0.03}
        transparent
        opacity={0.6}
        sizeAttenuation
      />
    </points>
  )
}

export { Particles }
