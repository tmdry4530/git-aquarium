'use client'

import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import type { Mesh, ShaderMaterial } from 'three'

const VERTEX_SHADER = /* glsl */ `
  uniform float uTime;
  varying vec2 vUv;
  varying float vElevation;

  void main() {
    vUv = uv;
    vec3 pos = position;
    float wave1 = sin(pos.x * 0.4 + uTime * 0.8) * 0.15;
    float wave2 = cos(pos.z * 0.3 + uTime * 0.6) * 0.12;
    float wave3 = sin(pos.x * 0.15 + pos.z * 0.2 + uTime * 0.4) * 0.08;
    pos.y += wave1 + wave2 + wave3;
    vElevation = pos.y;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
  }
`

const FRAGMENT_SHADER = /* glsl */ `
  uniform float uTime;
  varying vec2 vUv;
  varying float vElevation;

  void main() {
    float brightness = 0.4 + vElevation * 0.5 + 0.1 * sin(uTime * 0.5);
    vec3 color = vec3(0.1, 0.4, 0.8) * brightness;
    gl_FragColor = vec4(color, 0.3);
  }
`

const UNIFORMS = {
  uTime: { value: 0 },
}

function Water() {
  const meshRef = useRef<Mesh>(null)

  useFrame((state) => {
    if (!meshRef.current) return
    const mat = meshRef.current.material as ShaderMaterial
    mat.uniforms['uTime']!.value = state.clock.elapsedTime
  })

  return (
    <mesh ref={meshRef} position={[0, 10, 0]}>
      <planeGeometry args={[80, 80, 32, 32]} />
      <shaderMaterial
        vertexShader={VERTEX_SHADER}
        fragmentShader={FRAGMENT_SHADER}
        uniforms={UNIFORMS}
        transparent
        side={2}
        depthWrite={false}
      />
    </mesh>
  )
}

export { Water }
