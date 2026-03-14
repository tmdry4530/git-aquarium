'use client'

import { useMemo, useEffect } from 'react'
import * as THREE from 'three'

interface TerrainProps {
  terrainHeights?: number[]
}

function Terrain({ terrainHeights }: TerrainProps) {
  const geometry = useMemo(() => {
    const geo = new THREE.PlaneGeometry(80, 80, 51, 51)
    geo.rotateX(-Math.PI / 2)

    const posAttr = geo.attributes['position'] as THREE.BufferAttribute
    const heights = terrainHeights ?? Array<number>(52).fill(0)
    const maxHeight = Math.max(...heights, 1)
    const count = posAttr.count

    for (let i = 0; i < count; i++) {
      const x = posAttr.getX(i)
      const normalizedX = (x + 40) / 80
      const heightIndex = Math.min(
        Math.floor(normalizedX * (heights.length - 1)),
        heights.length - 1,
      )
      const h = ((heights[heightIndex] ?? 0) / maxHeight) * 2
      posAttr.setY(i, posAttr.getY(i) + h)
    }

    posAttr.needsUpdate = true
    geo.computeVertexNormals()
    return geo
  }, [terrainHeights])

  useEffect(() => {
    return () => {
      geometry.dispose()
    }
  }, [geometry])

  return (
    <mesh geometry={geometry} position={[0, -2, 0]} receiveShadow>
      <meshStandardMaterial color="#1a3a5c" roughness={0.9} metalness={0.0} />
    </mesh>
  )
}

export { Terrain }
