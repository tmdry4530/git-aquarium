'use client'

import { Canvas } from '@react-three/fiber'
import { PerspectiveCamera } from '@react-three/drei'
import { Suspense } from 'react'
import type { ReactNode } from 'react'
import { DynamicLighting } from './DynamicLighting'
import { AquariumCameraControls } from './SubmarineControls'

interface AquariumSceneProps {
  children?: ReactNode
}

function AquariumScene({ children }: AquariumSceneProps) {
  return (
    <div className="h-screen w-screen">
      <Canvas
        gl={{
          antialias: true,
          alpha: false,
          powerPreference: 'high-performance',
        }}
        dpr={[1, 2]}
        shadows
      >
        <PerspectiveCamera
          makeDefault
          position={[0, 5, 20]}
          fov={60}
          near={0.1}
          far={200}
        />
        <AquariumCameraControls />

        <color attach="background" args={['#0a1628']} />
        <fog attach="fog" args={['#0a1628', 10, 80]} />

        <DynamicLighting />

        <Suspense fallback={null}>{children}</Suspense>
      </Canvas>
    </div>
  )
}

export { AquariumScene }
