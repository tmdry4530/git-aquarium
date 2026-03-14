# 3D Scene Architecture

Git Aquarium의 React Three Fiber 씬 아키텍처를 정의합니다.

---

## 1. 성능 버짓

| 항목           | 데스크탑 목표 | 모바일 목표 |
| -------------- | ------------- | ----------- |
| 프레임률       | 60fps         | 30fps       |
| Max Draw Calls | 50            | 30          |
| Max Triangles  | 100,000       | 30,000      |
| Max Textures   | 20            | 10          |
| JS 힙 사용량   | < 150MB       | < 80MB      |
| GPU 메모리     | < 512MB       | < 256MB     |

### 1.1 InstancedMesh 전환 임계값

| 조건            | 렌더링 전략   |
| --------------- | ------------- |
| 물고기 수 < 40  | 개별 Mesh     |
| 물고기 수 >= 40 | InstancedMesh |

InstancedMesh 전환으로 40+ 물고기를 단일 draw call로 처리합니다.

### 1.2 LOD (Level of Detail)

| 단계   | 물고기 수 | 지오메트리        | 애니메이션         |
| ------ | --------- | ----------------- | ------------------ |
| High   | < 20      | 완전 메시         | 완전 본 애니메이션 |
| Medium | 20-50     | 간소화 메시       | 절차적 애니메이션  |
| Low    | 50+       | 빌보드 스프라이트 | 단순 이동          |

---

## 2. R3F 컴포넌트 계층

```
<Canvas>
  ├── <PerspectiveCamera />
  ├── <OrbitControls />
  │
  ├── <ambientLight />           # intensity: 0.4
  ├── <directionalLight />       # 태양광 시뮬레이션
  ├── <pointLight />             # 수중 리플렉션
  │
  ├── <fog />                    # 깊이감
  │
  └── <Suspense fallback={<FallbackScene />}>
      ├── <Environment>          # 수중 환경
      │   ├── <OceanFloor />     # 지형 (컨트리뷰션 히트맵)
      │   ├── <Seaweed />        # 해초 (정적)
      │   ├── <Bubbles />        # 기포 파티클
      │   ├── <Particles />      # 먼지/플랑크톤
      │   ├── <Water />          # 수면 효과
      │   └── <Caustics />       # 카우스틱 셰이더
      │
      ├── <FishGroup>            # 물고기 그룹
      │   └── <Fish />  × N      # 개별 물고기
      │
      └── <EffectComposer>       # 포스트프로세싱
          ├── <Bloom />          # 발광
          └── <Vignette />       # 주변부 어둡게
```

---

## 3. 카메라

### 3.1 PerspectiveCamera 설정

```typescript
// src/engine/scene/Camera.tsx
import { PerspectiveCamera } from '@react-three/drei'

export function AquariumCamera() {
  return (
    <PerspectiveCamera
      makeDefault
      fov={60}
      near={0.1}
      far={1000}
      position={[0, 2, 10]}
    />
  )
}
```

### 3.2 OrbitControls 제한

```typescript
// src/engine/scene/Controls.tsx
import { OrbitControls } from '@react-three/drei'

export function AquariumControls() {
  return (
    <OrbitControls
      // 수평 회전 제한 (좌우 45도)
      minAzimuthAngle={-Math.PI / 4}
      maxAzimuthAngle={Math.PI / 4}
      // 수직 회전 제한 (위에서만 내려다보기)
      minPolarAngle={Math.PI / 6}
      maxPolarAngle={Math.PI / 2.5}
      // 줌 제한
      minDistance={3}
      maxDistance={20}
      // 댐핑 (부드러운 감속)
      enableDamping
      dampingFactor={0.05}
      // 패닝 비활성화
      enablePan={false}
    />
  )
}
```

### 3.3 카메라 모드

| 모드        | 설명               | 트리거          |
| ----------- | ------------------ | --------------- |
| `overview`  | 전체 수족관 뷰     | 기본 상태       |
| `focus`     | 선택한 물고기 추적 | 물고기 클릭     |
| `cinematic` | 자동 회전          | 아이들 상태 5분 |

---

## 4. 라이팅

### 4.1 조명 구성

```typescript
// src/engine/scene/Lighting.tsx
export function AquariumLighting() {
  return (
    <>
      {/* 환경광: 수중 산란광 */}
      <ambientLight
        intensity={0.4}
        color="#4FC3F7"  // 바다 시안
      />

      {/* 방향광: 태양광 수중 투과 */}
      <directionalLight
        position={[5, 10, 5]}
        intensity={1.2}
        color="#E3F2FD"
        castShadow
        shadow-mapSize={[1024, 1024]}
      />

      {/* 포인트 라이트: 수면 리플렉션 */}
      <pointLight
        position={[0, 8, 0]}
        intensity={0.5}
        color="#B3E5FC"
        distance={20}
        decay={2}
      />
    </>
  )
}
```

### 4.2 Caustics 셰이더

수중 빛 굴절 효과 (카우스틱):

```glsl
/* src/engine/scene/caustics.glsl */
uniform float uTime;
uniform sampler2D uCausticTexture;

varying vec2 vUv;

void main() {
  vec2 uv = vUv * 3.0;
  float t = uTime * 0.5;

  // 2중 샘플링으로 자연스러운 물 굴절
  float c1 = texture2D(uCausticTexture, uv + vec2(t * 0.1, t * 0.15)).r;
  float c2 = texture2D(uCausticTexture, uv - vec2(t * 0.12, t * 0.08)).r;

  float caustic = min(c1, c2) * 2.0;
  gl_FragColor = vec4(vec3(caustic), 1.0);
}
```

---

## 5. 포스트프로세싱

```typescript
// src/engine/scene/PostProcessing.tsx
import { EffectComposer, Bloom, Vignette } from '@react-three/postprocessing'

export function AquariumPostProcessing() {
  return (
    <EffectComposer>
      {/* Bloom: 물고기/legendary 발광 */}
      <Bloom
        luminanceThreshold={0.6}
        luminanceSmoothing={0.9}
        intensity={0.8}
        mipmapBlur
      />

      {/* Vignette: 주변부 어둡게 (심해 느낌) */}
      <Vignette
        offset={0.3}
        darkness={0.7}
        eskil={false}
      />
    </EffectComposer>
  )
}
```

**모바일에서 포스트프로세싱 비활성화:**

```typescript
const isMobile = /iPhone|iPad|Android/i.test(navigator.userAgent)

// 모바일에서는 EffectComposer 미렌더링
{!isMobile && <AquariumPostProcessing />}
```

---

## 6. 물고기 시스템

### 6.1 Fish 컴포넌트

```typescript
// src/engine/fish/Fish.tsx
interface FishProps {
  data: FishData
  onClick: (fish: FishData) => void
}

export function Fish({ data, onClick }: FishProps) {
  const meshRef = useRef<THREE.Mesh>(null)
  const { position, rotation } = useFishAnimation(data)

  useFrame((state, delta) => {
    if (!meshRef.current) return
    // 수영 패턴에 따른 애니메이션
    updateFishPosition(meshRef.current, data.swimPattern, state.clock.elapsedTime)
  })

  return (
    <mesh
      ref={meshRef}
      position={position}
      rotation={rotation}
      onClick={() => onClick(data)}
    >
      <FishGeometry species={data.species} evolutionStage={data.evolutionStage} />
      <FishMaterial
        color={data.color}
        isLegendary={data.evolutionStage === 'legendary'}
        isFossil={data.evolutionStage === 'fossil'}
      />
    </mesh>
  )
}
```

### 6.2 FishGroup (InstancedMesh 최적화)

```typescript
// src/engine/fish/FishGroup.tsx
export function FishGroup({ fish }: { fish: FishData[] }) {
  const useInstanced = fish.length >= 40

  if (useInstanced) {
    return <InstancedFishGroup fish={fish} />
  }

  return (
    <>
      {fish.map(f => (
        <Fish key={f.id} data={f} onClick={handleFishClick} />
      ))}
    </>
  )
}

// InstancedMesh 구현
function InstancedFishGroup({ fish }: { fish: FishData[] }) {
  const instancedRef = useRef<THREE.InstancedMesh>(null)
  const count = fish.length

  useFrame(() => {
    if (!instancedRef.current) return

    fish.forEach((f, i) => {
      const matrix = new THREE.Matrix4()
      // 각 인스턴스의 행렬 업데이트
      matrix.setPosition(f.position.x, f.position.y, f.position.z)
      instancedRef.current!.setMatrixAt(i, matrix)
    })

    instancedRef.current.instanceMatrix.needsUpdate = true
  })

  return (
    <instancedMesh ref={instancedRef} args={[undefined, undefined, count]}>
      <boxGeometry />
      <meshStandardMaterial />
    </instancedMesh>
  )
}
```

### 6.3 수영 패턴

| 패턴         | 설명            | 대상 종                    |
| ------------ | --------------- | -------------------------- |
| `linear`     | 직선 이동       | dolphin, shark             |
| `zigzag`     | 지그재그        | angelfish, flyingfish      |
| `float`      | 부유 (위아래)   | squid, jellyfish, seahorse |
| `slow`       | 느린 이동       | turtle                     |
| `standard`   | 기본            | manta, turtle, goldfish    |
| `stationary` | 정지 (흔들림만) | coral, shell, seaweed      |

```typescript
// src/engine/fish/swim-patterns.ts
function updateFishPosition(
  mesh: THREE.Mesh,
  pattern: SwimPattern,
  time: number,
) {
  switch (pattern) {
    case 'zigzag':
      mesh.position.x += Math.sin(time * 2) * 0.02
      mesh.position.z += 0.01
      break
    case 'float':
      mesh.position.y += Math.sin(time) * 0.005
      break
    case 'linear':
      mesh.position.z += 0.015
      break
    case 'stationary':
      mesh.rotation.z = Math.sin(time * 0.5) * 0.05
      break
    // ...
  }
}
```

---

## 7. 환경 컴포넌트

### 7.1 OceanFloor (컨트리뷰션 히트맵)

```typescript
// src/engine/environment/OceanFloor.tsx
// 52주 컨트리뷰션 데이터 → 3D 지형 높이 맵
interface OceanFloorProps {
  terrainHeights: number[]  // 52개 주별 컨트리뷰션
}

export function OceanFloor({ terrainHeights }: OceanFloorProps) {
  const geometry = useMemo(() => {
    const geo = new THREE.PlaneGeometry(20, 10, 51, 1)
    const positions = geo.attributes.position

    // 컨트리뷰션 → 높이 변환
    terrainHeights.forEach((height, i) => {
      const normalizedHeight = (height / maxContributions) * 2
      positions.setY(i, -normalizedHeight)
    })

    geo.computeVertexNormals()
    return geo
  }, [terrainHeights])

  return (
    <mesh geometry={geometry} rotation={[-Math.PI / 2, 0, 0]}>
      <meshStandardMaterial
        color="#003a4e"
        roughness={0.8}
        metalness={0.1}
      />
    </mesh>
  )
}
```

### 7.2 파티클 시스템

```typescript
// 데스크탑: 500개 파티클
// 모바일: 100개 파티클
const PARTICLE_COUNT = isMobile ? 100 : 500
```

---

## 8. 모바일 적응

| 최적화 항목          | 데스크탑 | 모바일 |
| -------------------- | -------- | ------ |
| 파티클 수            | 500      | 100    |
| 그림자               | ON       | OFF    |
| 포스트프로세싱       | ON       | OFF    |
| 셰이더 복잡도        | High     | Low    |
| 텍스처 해상도        | 1024px   | 512px  |
| LOD 기본값           | High     | Low    |
| InstancedMesh 임계값 | 40       | 20     |
| 프레임 목표          | 60fps    | 30fps  |

```typescript
// src/engine/scene/quality-settings.ts
export function getQualitySettings(isMobile: boolean) {
  return {
    particleCount: isMobile ? 100 : 500,
    enableShadows: !isMobile,
    enablePostProcessing: !isMobile,
    textureSize: isMobile ? 512 : 1024,
    instancedThreshold: isMobile ? 20 : 40,
    targetFPS: isMobile ? 30 : 60,
  }
}
```

---

## 9. 성능 모니터링

### 9.1 useFrame 성능 가드

```typescript
// 프레임 드롭 감지 및 품질 자동 조정
function useAdaptiveQuality() {
  const fpsRef = useRef(60)
  const frameCountRef = useRef(0)
  const lastTimeRef = useRef(performance.now())

  useFrame(() => {
    frameCountRef.current++
    const now = performance.now()

    if (now - lastTimeRef.current >= 1000) {
      fpsRef.current = frameCountRef.current
      frameCountRef.current = 0
      lastTimeRef.current = now

      // FPS < 30이면 품질 낮추기
      if (fpsRef.current < 30) {
        reduceQuality()
      }
    }
  })
}
```

### 9.2 메모리 관리

```typescript
// Geometry/Material dispose
useEffect(() => {
  return () => {
    geometry.dispose()
    material.dispose()
    texture.dispose()
  }
}, [])
```

---

## 10. 렌더링 파이프라인

```
GitHub Data
    ↓
AquariumData (서버에서 생성)
    ↓
Zustand aquariumStore
    ↓
FishGroup (React → Three.js)
    ↓
InstancedMesh / Mesh
    ↓
WebGL Renderer
    ↓
EffectComposer (PostProcessing)
    ↓
Canvas DOM
```

---

## 11. 에셋 목록

| 에셋               | 경로                            | 형식     | 크기 목표  |
| ------------------ | ------------------------------- | -------- | ---------- |
| 물고기 모델 (15종) | `public/models/fish/`           | glTF/GLB | < 100KB/종 |
| 환경 텍스처        | `public/textures/environment/`  | WebP     | < 2MB 총합 |
| 카우스틱 텍스처    | `public/textures/caustics.webp` | WebP     | < 500KB    |
| 해저 텍스처        | `public/textures/seafloor.webp` | WebP     | < 1MB      |

```typescript
// DRACO 압축 적용
import { useGLTF } from '@react-three/drei'

// 사전 로드
useGLTF.preload('/models/fish/angelfish.glb')
```
