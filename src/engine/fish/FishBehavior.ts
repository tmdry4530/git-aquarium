'use client'

import { useRef, useCallback, useEffect } from 'react'
import { useFrame } from '@react-three/fiber'
import type { RefObject } from 'react'
import * as THREE from 'three'
import type { FishData, FishSpecies, SwimPattern } from '@/types/fish'

const BOUNDS = {
  x: 25,
  yMin: 0.5,
  yMax: 9,
  z: 25,
} as const

interface SwimBehaviorConfig {
  turnRate: number
  speedVariation: number
  verticalRange: number
  directionChangeInterval: [number, number]
}

const SWIM_BEHAVIORS: Record<SwimPattern, SwimBehaviorConfig> = {
  linear: {
    turnRate: 0.02,
    speedVariation: 0.1,
    verticalRange: 0.3,
    directionChangeInterval: [8, 15],
  },
  zigzag: {
    turnRate: 0.08,
    speedVariation: 0.3,
    verticalRange: 0.5,
    directionChangeInterval: [2, 5],
  },
  float: {
    turnRate: 0.01,
    speedVariation: 0.05,
    verticalRange: 1.0,
    directionChangeInterval: [10, 20],
  },
  slow: {
    turnRate: 0.03,
    speedVariation: 0.05,
    verticalRange: 0.2,
    directionChangeInterval: [10, 20],
  },
  standard: {
    turnRate: 0.04,
    speedVariation: 0.15,
    verticalRange: 0.5,
    directionChangeInterval: [5, 10],
  },
  stationary: {
    turnRate: 0,
    speedVariation: 0,
    verticalRange: 0,
    directionChangeInterval: [Infinity, Infinity],
  },
} as const

// Species-specific behavior modifiers
interface SpeciesModifier {
  speedMul: number
  bobAmp: number
  bobFreq: number
  yBias: number // vertical position preference (0=bottom, 1=top)
  wobble: number // side-to-side wobble amplitude
}

const SPECIES_MODIFIERS: Record<FishSpecies, SpeciesModifier> = {
  angelfish: {
    speedMul: 1.2,
    bobAmp: 0.3,
    bobFreq: 0.8,
    yBias: 0.6,
    wobble: 0.08,
  },
  manta: {
    speedMul: 0.8,
    bobAmp: 0.15,
    bobFreq: 0.4,
    yBias: 0.7,
    wobble: 0.02,
  },
  turtle: {
    speedMul: 0.5,
    bobAmp: 0.2,
    bobFreq: 0.3,
    yBias: 0.3,
    wobble: 0.01,
  },
  pufferfish: {
    speedMul: 0.7,
    bobAmp: 0.25,
    bobFreq: 0.6,
    yBias: 0.5,
    wobble: 0.05,
  },
  dolphin: {
    speedMul: 1.4,
    bobAmp: 0.4,
    bobFreq: 1.0,
    yBias: 0.8,
    wobble: 0.03,
  },
  squid: { speedMul: 0.4, bobAmp: 0.5, bobFreq: 0.3, yBias: 0.4, wobble: 0.06 },
  shark: { speedMul: 1.3, bobAmp: 0.1, bobFreq: 0.5, yBias: 0.5, wobble: 0.02 },
  seahorse: {
    speedMul: 0.3,
    bobAmp: 0.6,
    bobFreq: 0.4,
    yBias: 0.5,
    wobble: 0.04,
  },
  goldfish: {
    speedMul: 0.8,
    bobAmp: 0.2,
    bobFreq: 0.7,
    yBias: 0.5,
    wobble: 0.05,
  },
  flyingfish: {
    speedMul: 1.5,
    bobAmp: 0.35,
    bobFreq: 1.2,
    yBias: 0.9,
    wobble: 0.07,
  },
  jellyfish: {
    speedMul: 0.3,
    bobAmp: 0.8,
    bobFreq: 0.5,
    yBias: 0.6,
    wobble: 0.03,
  },
  coral: {
    speedMul: 0.0,
    bobAmp: 0.02,
    bobFreq: 0.3,
    yBias: 0.0,
    wobble: 0.01,
  },
  shell: { speedMul: 0.0, bobAmp: 0.01, bobFreq: 0.2, yBias: 0.0, wobble: 0.0 },
  seaweed: {
    speedMul: 0.0,
    bobAmp: 0.03,
    bobFreq: 0.5,
    yBias: 0.0,
    wobble: 0.02,
  },
  plankton: {
    speedMul: 0.2,
    bobAmp: 0.4,
    bobFreq: 0.6,
    yBias: 0.5,
    wobble: 0.1,
  },
} as const

interface SwimState {
  currentPos: THREE.Vector3
  targetPos: THREE.Vector3
  elapsed: number
  changeInterval: number
  bobPhase: number
}

function useSwimBehavior(
  data: FishData,
  initialPosition: [number, number, number],
  meshRef: RefObject<THREE.Mesh | null>,
): void {
  const swimState = useRef<SwimState>({
    currentPos: new THREE.Vector3(...initialPosition),
    targetPos: new THREE.Vector3(...initialPosition),
    elapsed: 0,
    changeInterval: 5,
    bobPhase: 0,
  })

  const speciesMod = SPECIES_MODIFIERS[data.species]

  useEffect(() => {
    const [min, max] = SWIM_BEHAVIORS[data.swimPattern].directionChangeInterval
    swimState.current.changeInterval = min + Math.random() * (max - min)
    swimState.current.bobPhase = Math.random() * Math.PI * 2
  }, [data.swimPattern])

  const tempQuat = useRef(new THREE.Quaternion())
  const tempDir = useRef(new THREE.Vector3())
  const forwardVec = useRef(new THREE.Vector3(0, 0, 1))

  const pickNewTarget = useCallback(
    (from: THREE.Vector3): THREE.Vector3 => {
      const behavior = SWIM_BEHAVIORS[data.swimPattern]
      const spread = behavior.turnRate > 0 ? 4 + behavior.turnRate * 100 : 0
      const vSpread = behavior.verticalRange * 4

      // Apply y-bias based on species
      const preferredY =
        BOUNDS.yMin + speciesMod.yBias * (BOUNDS.yMax - BOUNDS.yMin)

      return new THREE.Vector3(
        THREE.MathUtils.clamp(
          from.x + (Math.random() - 0.5) * spread * 2,
          -BOUNDS.x,
          BOUNDS.x,
        ),
        THREE.MathUtils.clamp(
          preferredY + (Math.random() - 0.5) * vSpread * 2,
          BOUNDS.yMin,
          BOUNDS.yMax,
        ),
        THREE.MathUtils.clamp(
          from.z + (Math.random() - 0.5) * spread * 2,
          -BOUNDS.z,
          BOUNDS.z,
        ),
      )
    },
    [data.swimPattern, speciesMod.yBias],
  )

  useFrame((r3fState, delta) => {
    if (!meshRef.current) return
    if (data.evolutionStage === 'fossil') return

    const behavior = SWIM_BEHAVIORS[data.swimPattern]
    const s = swimState.current
    const t = r3fState.clock.elapsedTime

    // Species-specific bobbing
    const bob =
      Math.sin(t * speciesMod.bobFreq + s.bobPhase) * speciesMod.bobAmp
    const wobble =
      Math.sin(t * speciesMod.bobFreq * 1.3 + s.bobPhase) * speciesMod.wobble

    if (speciesMod.speedMul === 0) {
      // Stationary: gentle vertical bob + sway only
      meshRef.current.position.set(
        initialPosition[0] + wobble,
        initialPosition[1] + bob,
        initialPosition[2],
      )
      // Gentle sway rotation for stationary organisms
      meshRef.current.rotation.z = Math.sin(t * 0.5 + s.bobPhase) * 0.05
      return
    }

    s.elapsed += delta

    // Pick new target direction periodically
    const [min, max] = behavior.directionChangeInterval
    if (s.elapsed >= s.changeInterval) {
      s.elapsed = 0
      s.changeInterval = min + Math.random() * (max - min)
      s.targetPos = pickNewTarget(s.currentPos)
    }

    // Boundary avoidance
    if (Math.abs(s.currentPos.x) > BOUNDS.x * 0.85)
      s.targetPos.x = -Math.sign(s.currentPos.x) * BOUNDS.x * 0.5
    if (s.currentPos.y < BOUNDS.yMin + 0.5) s.targetPos.y = BOUNDS.yMin + 2
    if (s.currentPos.y > BOUNDS.yMax - 0.5) s.targetPos.y = BOUNDS.yMax - 2
    if (Math.abs(s.currentPos.z) > BOUNDS.z * 0.85)
      s.targetPos.z = -Math.sign(s.currentPos.z) * BOUNDS.z * 0.5

    // Smooth position lerp with species speed modifier
    const effectiveSpeed = data.swimSpeed * speciesMod.speedMul
    const lerpFactor = Math.min(effectiveSpeed * delta * 0.5, 0.08)
    s.currentPos.lerp(s.targetPos, lerpFactor)

    meshRef.current.position.set(
      s.currentPos.x + wobble,
      s.currentPos.y + bob,
      s.currentPos.z,
    )

    // Face movement direction (smooth rotation)
    tempDir.current.copy(s.targetPos).sub(s.currentPos)
    if (tempDir.current.lengthSq() > 0.01) {
      tempDir.current.normalize()
      tempQuat.current.setFromUnitVectors(forwardVec.current, tempDir.current)
      meshRef.current.quaternion.slerp(
        tempQuat.current,
        behavior.turnRate + 0.02,
      )
    }

    // Species-specific tail wag
    const wagSpeed = 4 * speciesMod.speedMul
    const wagAmount = 0.05 * speciesMod.speedMul
    meshRef.current.scale.x =
      meshRef.current.scale.x * (1 + Math.sin(t * wagSpeed) * wagAmount)
  })
}

export { useSwimBehavior, SWIM_BEHAVIORS, SPECIES_MODIFIERS }
