'use client'

import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { useAquariumStore } from '@/stores/aquarium'

type TimeOfDay = 'dawn' | 'day' | 'dusk' | 'night'

interface LightingPreset {
  ambientColor: THREE.Color
  ambientIntensity: number
  sunColor: THREE.Color
  sunIntensity: number
  sunPosition: [number, number, number]
  fillColor: THREE.Color
  fillIntensity: number
}

const LIGHTING_PRESETS: Record<TimeOfDay, LightingPreset> = {
  dawn: {
    ambientColor: new THREE.Color('#cc7744'),
    ambientIntensity: 0.35,
    sunColor: new THREE.Color('#ffaa66'),
    sunIntensity: 0.7,
    sunPosition: [15, 10, 10],
    fillColor: new THREE.Color('#442200'),
    fillIntensity: 0.2,
  },
  day: {
    ambientColor: new THREE.Color('#4488cc'),
    ambientIntensity: 0.5,
    sunColor: new THREE.Color('#ffffff'),
    sunIntensity: 1.0,
    sunPosition: [10, 20, 10],
    fillColor: new THREE.Color('#0044aa'),
    fillIntensity: 0.3,
  },
  dusk: {
    ambientColor: new THREE.Color('#6633aa'),
    ambientIntensity: 0.3,
    sunColor: new THREE.Color('#cc6688'),
    sunIntensity: 0.5,
    sunPosition: [-15, 8, 10],
    fillColor: new THREE.Color('#220044'),
    fillIntensity: 0.15,
  },
  night: {
    ambientColor: new THREE.Color('#112244'),
    ambientIntensity: 0.15,
    sunColor: new THREE.Color('#4466aa'),
    sunIntensity: 0.2,
    sunPosition: [0, 25, 0],
    fillColor: new THREE.Color('#001133'),
    fillIntensity: 0.1,
  },
}

function DynamicLighting() {
  const brightness = useAquariumStore(
    (s) => s.data?.environment.brightness ?? 0.5,
  )
  const timeOfDay = useAquariumStore(
    (s) => s.data?.environment.timeOfDay ?? 'day',
  )

  const ambientRef = useRef<THREE.AmbientLight>(null)
  const sunRef = useRef<THREE.DirectionalLight>(null)
  const fillRef = useRef<THREE.PointLight>(null)

  // Smooth transition colors
  const currentAmbientColor = useRef(new THREE.Color('#4488cc'))
  const currentSunColor = useRef(new THREE.Color('#ffffff'))
  const currentFillColor = useRef(new THREE.Color('#0044aa'))

  useFrame((_, delta) => {
    const preset = LIGHTING_PRESETS[timeOfDay]
    const lerpSpeed = delta * 0.1 // ~10 second transition

    if (ambientRef.current) {
      currentAmbientColor.current.lerp(preset.ambientColor, lerpSpeed)
      ambientRef.current.color.copy(currentAmbientColor.current)
      ambientRef.current.intensity = THREE.MathUtils.lerp(
        ambientRef.current.intensity,
        preset.ambientIntensity * (0.5 + brightness * 0.5),
        lerpSpeed,
      )
    }

    if (sunRef.current) {
      currentSunColor.current.lerp(preset.sunColor, lerpSpeed)
      sunRef.current.color.copy(currentSunColor.current)
      sunRef.current.intensity = THREE.MathUtils.lerp(
        sunRef.current.intensity,
        preset.sunIntensity,
        lerpSpeed,
      )
      sunRef.current.position.lerp(
        new THREE.Vector3(...preset.sunPosition),
        lerpSpeed,
      )
    }

    if (fillRef.current) {
      currentFillColor.current.lerp(preset.fillColor, lerpSpeed)
      fillRef.current.color.copy(currentFillColor.current)
      fillRef.current.intensity = THREE.MathUtils.lerp(
        fillRef.current.intensity,
        preset.fillIntensity,
        lerpSpeed,
      )
    }
  })

  return (
    <>
      <ambientLight ref={ambientRef} intensity={0.4} color="#4488cc" />
      <directionalLight
        ref={sunRef}
        position={[10, 20, 10]}
        intensity={1.0}
        color="#ffffff"
        castShadow
      />
      <pointLight
        ref={fillRef}
        position={[0, -1, 0]}
        intensity={0.3}
        color="#0044aa"
        distance={30}
        decay={2}
      />
    </>
  )
}

export { DynamicLighting }
