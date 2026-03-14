'use client'

import { Canvas } from '@react-three/fiber'
import { OrbitControls, PerspectiveCamera } from '@react-three/drei'
import { Suspense } from 'react'
import type { ReactNode } from 'react'
import { DynamicLighting } from './DynamicLighting'
import { CameraParallax } from './CameraParallax'

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
        <OrbitControls
          enablePan={false}
          minPolarAngle={Math.PI / 6}
          maxPolarAngle={Math.PI / 2}
          minDistance={5}
          maxDistance={50}
          enableDamping
          dampingFactor={0.05}
        />

        <color attach="background" args={['#0a1628']} />
        <fog attach="fog" args={['#0a1628', 10, 80]} />

        <DynamicLighting />
        <CameraParallax />

        <Suspense fallback={null}>{children}</Suspense>
      </Canvas>
    </div>
  )
}

export { AquariumScene }
