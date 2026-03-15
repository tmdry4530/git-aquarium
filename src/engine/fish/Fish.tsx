'use client'

import { useRef, useMemo, useCallback } from 'react'
import * as THREE from 'three'
import type { ThreeEvent } from '@react-three/fiber'
import { useFrame } from '@react-three/fiber'
import type { FishData } from '@/types/fish'
import { useAquariumStore } from '@/stores/aquarium'
import { useUIStore } from '@/stores/ui'
import { useSwimBehavior } from './FishBehavior'
import { getSpeciesGeometry, SPECIES_SCALE } from './species/geometries'

interface FishProps {
  data: FishData
  initialPosition: [number, number, number]
}

const EVOLUTION_SCALE: Record<string, number> = {
  egg: 0.3,
  fry: 0.5,
  juvenile: 0.75,
  adult: 1.0,
  elder: 1.3,
  legendary: 1.6,
  fossil: 0.9,
} as const

function Fish({ data, initialPosition }: FishProps) {
  const meshRef = useRef<THREE.Mesh>(null)
  const glowRef = useRef<THREE.Mesh>(null)

  const hoverFish = useAquariumStore((s) => s.hoverFish)
  const selectFish = useAquariumStore((s) => s.selectFish)
  const isHovered = useAquariumStore((s) => s.hoveredFishId === data.id)
  const setTooltip = useUIStore((s) => s.setTooltip)

  const isFossil = data.evolutionStage === 'fossil'
  const isEgg = data.evolutionStage === 'egg'
  const isLegendary = data.evolutionStage === 'legendary'
  const isElder = data.evolutionStage === 'elder'
  const isFry = data.evolutionStage === 'fry'

  const geometry = useMemo(
    () =>
      isEgg
        ? new THREE.SphereGeometry(0.15, 10, 10)
        : getSpeciesGeometry(data.species),
    [data.species, isEgg],
  )

  const speciesScale = SPECIES_SCALE[data.species]
  const evolutionScale = EVOLUTION_SCALE[data.evolutionStage] ?? 1.0

  // Fossil fish rest at the bottom
  const effectivePosition = useMemo<[number, number, number]>(
    () =>
      isFossil
        ? [initialPosition[0], 0.5, initialPosition[2]]
        : initialPosition,
    [isFossil, initialPosition],
  )

  // Behavior hook handles all position/rotation/scale updates per frame
  useSwimBehavior(data, effectivePosition, meshRef)

  // Evolution visual effects
  const materialProps = useMemo(() => {
    const color = isFossil ? '#888888' : data.color
    const opacity = isFossil ? 0.6 : isFry ? 0.8 : isEgg ? 0.5 : 1
    const transparent = isFossil || isFry || isEgg
    // All fish get a slight self-illumination so they pop against dark background
    const emissive = isFossil ? '#000000' : data.color
    const emissiveIntensity = isLegendary ? 0.5 : isElder ? 0.3 : 0.2

    return { color, opacity, transparent, emissive, emissiveIntensity }
  }, [isFossil, isFry, isEgg, isLegendary, isElder, data.color])

  // Elder/Legendary glow effect
  const showGlow = isElder || isLegendary
  const glowColor = isLegendary ? '#ffd700' : data.color

  // Animate glow
  useFrame((state) => {
    if (glowRef.current && showGlow) {
      const pulse = Math.sin(state.clock.elapsedTime * 2) * 0.5 + 0.5
      const mat = glowRef.current.material as THREE.MeshBasicMaterial
      mat.opacity = isLegendary ? 0.1 + pulse * 0.1 : 0.05 + pulse * 0.05
    }
  })

  const meshScale = useMemo<[number, number, number]>(() => {
    // Clamp size to prevent giant fish dominating the scene
    const clampedSize = Math.min(data.size, 1.8)
    const s = clampedSize * evolutionScale
    return [s * speciesScale[0], s * speciesScale[1], s * speciesScale[2]]
  }, [data.size, evolutionScale, speciesScale])

  const handlePointerOver = useCallback(
    (e: ThreeEvent<PointerEvent>) => {
      e.stopPropagation()
      hoverFish(data.id)
      setTooltip(true, { x: e.clientX, y: e.clientY })
      document.body.style.cursor = 'pointer'
    },
    [data.id, hoverFish, setTooltip],
  )

  const handlePointerMove = useCallback(
    (e: ThreeEvent<PointerEvent>) => {
      setTooltip(true, { x: e.clientX, y: e.clientY })
    },
    [setTooltip],
  )

  const handlePointerOut = useCallback(() => {
    hoverFish(null)
    setTooltip(false)
    document.body.style.cursor = 'default'
  }, [hoverFish, setTooltip])

  const handleClick = useCallback(
    (e: ThreeEvent<MouseEvent>) => {
      e.stopPropagation()
      selectFish(data.id)
    },
    [data.id, selectFish],
  )

  return (
    <group>
      <mesh
        ref={meshRef}
        position={effectivePosition}
        scale={meshScale}
        rotation={isFossil ? [0.3, 0, 0.3] : [0, 0, 0]}
        onPointerOver={handlePointerOver}
        onPointerMove={handlePointerMove}
        onPointerOut={handlePointerOut}
        onClick={handleClick}
        geometry={geometry}
      >
        <meshStandardMaterial
          color={materialProps.color}
          transparent={materialProps.transparent}
          opacity={materialProps.opacity}
          emissive={isHovered ? data.color : materialProps.emissive}
          emissiveIntensity={isHovered ? 0.5 : materialProps.emissiveIntensity}
          roughness={isFossil ? 0.95 : 0.6}
          metalness={isLegendary ? 0.3 : 0}
        />
      </mesh>

      {/* Elder/Legendary glow aura — small halo around the fish */}
      {showGlow && (
        <mesh ref={glowRef} position={effectivePosition} scale={meshScale}>
          <sphereGeometry args={[0.5, 8, 8]} />
          <meshBasicMaterial
            color={glowColor}
            transparent
            opacity={0.08}
            side={THREE.BackSide}
            depthWrite={false}
          />
        </mesh>
      )}
    </group>
  )
}

export { Fish }
