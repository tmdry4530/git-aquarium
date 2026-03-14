'use client'

import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import type { Mesh, ShaderMaterial } from 'three'

const VERTEX_SHADER = /* glsl */ `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`

const FRAGMENT_SHADER = /* glsl */ `
  uniform float uTime;
  varying vec2 vUv;

  float hash(vec2 p) {
    return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453);
  }

  float noise(vec2 p) {
    vec2 i = floor(p);
    vec2 f = fract(p);
    f = f * f * (3.0 - 2.0 * f);
    return mix(
      mix(hash(i), hash(i + vec2(1.0, 0.0)), f.x),
      mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), f.x),
      f.y
    );
  }

  void main() {
    vec2 uv = vUv * 6.0;
    float n1 = noise(uv + uTime * 0.25);
    float n2 = noise(uv * 1.4 - uTime * 0.18);
    float n3 = noise(uv * 0.8 + uTime * 0.1);
    float caustic = pow(n1 * n2 * n3, 1.5) * 1.2;
    gl_FragColor = vec4(0.3, 0.6, 1.0, caustic * 0.25);
  }
`

const UNIFORMS = {
  uTime: { value: 0 },
}

function CausticEffect() {
  const meshRef = useRef<Mesh>(null)

  useFrame((state) => {
    if (!meshRef.current) return
    const mat = meshRef.current.material as ShaderMaterial
    mat.uniforms['uTime']!.value = state.clock.elapsedTime
  })

  return (
    <mesh
      ref={meshRef}
      rotation={[-Math.PI / 2, 0, 0]}
      position={[0, -1.89, 0]}
    >
      <planeGeometry args={[80, 80, 1, 1]} />
      <shaderMaterial
        vertexShader={VERTEX_SHADER}
        fragmentShader={FRAGMENT_SHADER}
        uniforms={UNIFORMS}
        transparent
        depthWrite={false}
      />
    </mesh>
  )
}

export { CausticEffect }
