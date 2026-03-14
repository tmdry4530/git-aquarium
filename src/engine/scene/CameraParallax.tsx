'use client'

import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { useUIStore } from '@/stores/ui'

const BASE_POSITION = new THREE.Vector3(0, 5, 20)
const PARALLAX_X = 0.5
const PARALLAX_Y = 0.3
const LERP_FACTOR = 0.02

function CameraParallax() {
  const reducedMotion = useUIStore((s) => s.reducedMotion)
  const offset = useRef(new THREE.Vector2(0, 0))

  useFrame(({ camera, mouse }) => {
    if (reducedMotion) return

    offset.current.x = THREE.MathUtils.lerp(
      offset.current.x,
      mouse.x * PARALLAX_X,
      LERP_FACTOR,
    )
    offset.current.y = THREE.MathUtils.lerp(
      offset.current.y,
      mouse.y * PARALLAX_Y,
      LERP_FACTOR,
    )

    camera.position.x = BASE_POSITION.x + offset.current.x
    camera.position.y = BASE_POSITION.y + offset.current.y
  })

  return null
}

export { CameraParallax }
