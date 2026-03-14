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
  const shieldRef = useRef<THREE.Mesh>(null)

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
    const color = isFossil ? '#666666' : data.color
    const opacity = isFossil ? 0.6 : isFry ? 0.7 : isEgg ? 0.5 : 1
    const transparent = isFossil || isFry || isEgg
    const emissive = data.hasReadme ? data.color : '#000000'
    const emissiveIntensity = isLegendary
      ? 0.4
      : isElder
        ? 0.2
        : data.hasReadme
          ? 0.15
          : 0

    return { color, opacity, transparent, emissive, emissiveIntensity }
  }, [isFossil, isFry, isEgg, isLegendary, isElder, data.color, data.hasReadme])

  // Elder/Legendary glow effect
  const showGlow = isElder || isLegendary
  const glowColor = isLegendary ? '#ffd700' : data.color

  // License shield aura
  const showShield = data.hasLicense && !isEgg && !isFossil

  // Animate glow and shield
  useFrame((state) => {
    if (glowRef.current && showGlow) {
      const pulse = Math.sin(state.clock.elapsedTime * 2) * 0.5 + 0.5
      const mat = glowRef.current.material as THREE.MeshBasicMaterial
      mat.opacity = isLegendary ? 0.15 + pulse * 0.15 : 0.08 + pulse * 0.08
    }
    if (shieldRef.current) {
      const mat = shieldRef.current.material as THREE.MeshBasicMaterial
      mat.opacity = isHovered ? 0.3 : 0.1
    }
  })

  const meshScale = useMemo<[number, number, number]>(
    () => [
      data.size * evolutionScale * speciesScale[0],
      data.size * evolutionScale * speciesScale[1],
      data.size * evolutionScale * speciesScale[2],
    ],
    [data.size, evolutionScale, speciesScale],
  )

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

      {/* Elder/Legendary glow aura */}
      {showGlow && (
        <mesh
          ref={glowRef}
          position={effectivePosition}
          scale={meshScale.map((s) => s * 1.3) as [number, number, number]}
        >
          <sphereGeometry args={[0.35, 10, 10]} />
          <meshBasicMaterial
            color={glowColor}
            transparent
            opacity={0.1}
            side={THREE.BackSide}
            depthWrite={false}
          />
        </mesh>
      )}

      {/* License shield aura */}
      {showShield && (
        <mesh
          ref={shieldRef}
          position={effectivePosition}
          scale={meshScale.map((s) => s * 1.15) as [number, number, number]}
        >
          <sphereGeometry args={[0.38, 10, 10]} />
          <meshBasicMaterial
            color="#4488ff"
            transparent
            opacity={0.1}
            side={THREE.FrontSide}
            depthWrite={false}
          />
        </mesh>
      )}
    </group>
  )
}

export { Fish }
