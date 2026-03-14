'use client'

import { Terrain } from '@/engine/environment/Terrain'
import { Rocks } from '@/engine/environment/Rocks'
import { Seaweed } from '@/engine/environment/Seaweed'
import { Bubbles } from '@/engine/environment/Bubbles'
import { Particles } from '@/engine/environment/Particles'
import { Plankton } from '@/engine/environment/Plankton'
import { Water } from '@/engine/environment/Water'
import { CausticEffect } from '@/engine/effects/CausticEffect'
import { FlockingSystem } from '@/engine/fish/FlockingSystem'
import { AdaptiveQuality } from '@/engine/scene/AdaptiveQuality'
import { useAquariumStore } from '@/stores/aquarium'

function Environment() {
  const terrainHeights = useAquariumStore(
    (s) => s.data?.environment.terrainHeights,
  )
  const depth = useAquariumStore((s) => s.data?.environment.depth ?? 'mid')
  const isAbyss = depth === 'abyss'

  return (
    <group>
      <Terrain terrainHeights={terrainHeights} />
      <CausticEffect />
      <Rocks />
      <Seaweed />
      <Bubbles count={isAbyss ? 30 : 50} />
      <Particles count={isAbyss ? 100 : 200} />
      <Plankton />
      <Water />
      <FlockingSystem />
      <AdaptiveQuality />

      {/* Deep sea layer for 5yr+ accounts */}
      {isAbyss && (
        <group>
          {/* Dark fog overlay at bottom */}
          <mesh position={[0, -1, 0]}>
            <planeGeometry args={[80, 80]} />
            <meshBasicMaterial
              color="#050510"
              transparent
              opacity={0.4}
              side={2}
              depthWrite={false}
            />
          </mesh>
          {/* Bioluminescent point lights */}
          <pointLight
            position={[-8, 1, -5]}
            intensity={0.4}
            color="#00ffaa"
            distance={8}
            decay={2}
          />
          <pointLight
            position={[6, 1.5, 8]}
            intensity={0.3}
            color="#4488ff"
            distance={6}
            decay={2}
          />
          <pointLight
            position={[0, 2, -10]}
            intensity={0.35}
            color="#aa44ff"
            distance={7}
            decay={2}
          />
        </group>
      )}
    </group>
  )
}

export { Environment }
