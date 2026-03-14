# Phase 2: 생태계 — "살아있는 바다" (6주)

## 1. 개요

**목표:** 15종 고유 3D 모델, Boids 군집 행동, 진화 비주얼, 사운드 시스템, 도감(Codex) v1
**기간:** 6주 (Week 5~10)
**태스크 수:** 23개 | **실행 배치:** 8개
**전제조건:** Phase 1 완료 (구체 플레이스홀더 Fish, 자율 수영, 환경, 인터랙션, HUD, API)

---

## 2. 환경 사전조건

```bash
# Phase 1의 모든 환경 + 추가
# 15종 GLB 모델 파일: public/models/*.glb
# Tone.js는 pnpm add로 설치
pnpm add tone
pnpm add -D @types/tone
```

- **15종 GLB 모델**: Low-poly 스타일, 각 파일 < 500KB 권장
  - `public/models/angelfish.glb`
  - `public/models/manta.glb`
  - `public/models/turtle.glb`
  - `public/models/pufferfish.glb`
  - `public/models/dolphin.glb`
  - `public/models/squid.glb`
  - `public/models/shark.glb`
  - `public/models/seahorse.glb`
  - `public/models/goldfish.glb`
  - `public/models/flyingfish.glb`
  - `public/models/jellyfish.glb`
  - `public/models/coral.glb`
  - `public/models/shell.glb`
  - `public/models/seaweed.glb`
  - `public/models/plankton.glb`

---

## 3. TypeScript 인터페이스

```typescript
// src/types/species-model.ts
interface SpeciesModel {
  species: FishSpecies
  modelPath: string
  scale: number
  rotationOffset: [number, number, number]
  animationClips: string[] // GLB 내 애니메이션 클립 이름
}

// src/types/boids.ts
interface BoidConfig {
  separationRadius: number // 이웃 회피 반경
  separationWeight: number // 회피 가중치
  alignmentRadius: number // 정렬 반경
  alignmentWeight: number // 정렬 가중치
  cohesionRadius: number // 응집 반경
  cohesionWeight: number // 응집 가중치
  maxSpeed: number
  maxForce: number
  boundaryRadius: number // 수족관 경계
  boundaryForce: number // 경계 회피 힘
}

interface BoidState {
  id: string
  position: Float32Array // [x, y, z]
  velocity: Float32Array // [vx, vy, vz]
  species: FishSpecies // 같은 종끼리 군집
}

interface FlockingMessage {
  type: 'init' | 'update' | 'result'
  boids?: BoidState[]
  config?: BoidConfig
  delta?: number
}

// src/types/sound.ts
interface SoundConfig {
  masterVolume: number // 0.0 ~ 1.0
  ambientVolume: number
  effectVolume: number
  isMuted: boolean
}

interface AmbientLayer {
  id: string
  url: string | null // null = 프로시저럴 생성
  volume: number
  loop: boolean
}

// src/types/codex.ts
interface CodexEntry {
  id: string // e.g. 'angelfish_adult'
  species: FishSpecies
  evolutionStage: EvolutionStage
  nameEn: string
  nameKo: string
  descriptionEn: string
  descriptionKo: string
  rarity: 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary'
  discoveredAt: string | null // ISO date, null = 미발견
  sightedAt: string | null // 다른 수족관에서 목격
  conditionHint: string // "Python 레포 + 스타 100+"
}

interface CodexState {
  entries: CodexEntry[]
  discoveredCount: number
  sightedCount: number
  totalCount: number
  completionPercent: number
}

// src/types/boids-extended.ts
interface DeadZoneConfig {
  deadZoneRadius: number // 화석 물고기 기피 반경 (기본 3.0)
  deadZoneForce: number // 기피 힘 가중치 (기본 2.0)
}

interface AttractionConfig {
  attractionWeight: number // 큰 물고기 → 작은 물고기 인력 가중치
  attractionRadius: number // 인력 탐지 반경
  starThreshold: number // "큰 물고기" 기준 스타 수 (기본 100)
}

interface StartleConfig {
  startleRadius: number // 놀람 반응 반경 (기본 5.0)
  startleDuration: number // 놀람 지속 시간 ms (기본 2000)
  startleForce: number // 산개 힘 (기본 5.0)
}

interface FoodChainConfig {
  fleeThreshold: number // 크기 비율 (기본 2.0배 이상 차이 시 도주)
  fleeRadius: number // 도주 감지 반경 (기본 4.0)
  fleeForce: number // 도주 힘 가중치 (기본 3.0)
}

// src/types/secret-species.ts
type SecretSpeciesId =
  | 'ghost_fish'
  | 'zombie_fish'
  | 'pirate_fish'
  | 'scholar_fish'
  | 'chameleon_fish'

interface SecretSpeciesCondition {
  id: SecretSpeciesId
  nameEn: string
  nameKo: string
  condition: string // 트리거 조건 설명
  effect: string // 시각 효과 설명
}

// src/types/theme.ts
type ThemeId = 'default' | 'dark' | 'coral' | 'deep' | 'tropical'

interface ThemeConfig {
  id: ThemeId
  nameEn: string
  nameKo: string
  fogColor: string
  fogNear: number
  fogFar: number
  ambientColor: string
  ambientIntensity: number
  sunColor: string
  sunIntensity: number
  sunPosition: [number, number, number]
  backgroundColor: string
  waterColor: string
  particleColor: string
}
```

---

## 4. 실행 배치

### Batch 2-1: 3D 모델 준비 (1개, 외부 작업)

#### P2-01: 15종 3D 모델 (Low-poly GLB)

**외부 아트 작업** — Blender 또는 외주

요구 사항:

- 포맷: GLB (glTF Binary)
- 스타일: Low-poly, 만화풍
- 폴리곤: 각 모델 500~2000 triangles
- 크기: 파일당 < 500KB
- 애니메이션: idle swim (필수), special (선택)
- 원점: 모델 중심, Y-up
- 진화 단계별 변형은 코드에서 처리 (scale, color, opacity)

---

### Batch 2-2: 모델 로더 (1개, 순차)

#### P2-02: 모델 로더 + 종별 렌더러

**파일 (수정/생성):**

- `src/engine/fish/Fish.tsx` (전면 수정)
- `src/engine/fish/species/index.ts` (생성)
- `src/engine/fish/ModelLoader.tsx` (생성)

**구현 상세:**

```typescript
// src/engine/fish/ModelLoader.tsx
'use client'

import { useGLTF } from '@react-three/drei'
import { useRef, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import type { Group } from 'three'
import type { FishData } from '@/types/fish'

const MODEL_PATHS: Record<FishSpecies, string> = {
  angelfish: '/models/angelfish.glb',
  manta: '/models/manta.glb',
  turtle: '/models/turtle.glb',
  pufferfish: '/models/pufferfish.glb',
  dolphin: '/models/dolphin.glb',
  squid: '/models/squid.glb',
  shark: '/models/shark.glb',
  seahorse: '/models/seahorse.glb',
  goldfish: '/models/goldfish.glb',
  flyingfish: '/models/flyingfish.glb',
  jellyfish: '/models/jellyfish.glb',
  coral: '/models/coral.glb',
  shell: '/models/shell.glb',
  seaweed: '/models/seaweed_model.glb',
  plankton: '/models/plankton.glb',
}

// Preload 모든 모델
Object.values(MODEL_PATHS).forEach(useGLTF.preload)

function FishModel({ data }: { data: FishData }) {
  const { scene, animations } = useGLTF(MODEL_PATHS[data.species])
  const groupRef = useRef<Group>(null)

  const clonedScene = useMemo(() => scene.clone(), [scene])

  // 진화 단계별 스케일 조정
  const stageScale = useMemo(() => {
    switch (data.evolutionStage) {
      case 'egg': return 0.2
      case 'fry': return 0.4
      case 'juvenile': return 0.7
      case 'adult': return 1.0
      case 'elder': return 1.3
      case 'legendary': return 1.6
      case 'fossil': return 0.9
      default: return 1.0
    }
  }, [data.evolutionStage])

  return (
    <group ref={groupRef} scale={data.size * stageScale}>
      <primitive object={clonedScene} />
    </group>
  )
}

export { FishModel, MODEL_PATHS }
```

**검증:**

```bash
pnpm dev
# 각 종별 모델 렌더링 확인
# 진화 단계별 크기 변화 확인
# 콘솔에 GLB 로딩 에러 없음
```

---

### Batch 2-3: 종별 수영 + 진화 비주얼 (4개, 병렬)

#### P2-03: 종별 수영 패턴

**파일:** `src/engine/fish/FishBehavior.ts` (업데이트)

**구현 상세:**

| 종         | 패턴       | 속도 | 특성                             |
| ---------- | ---------- | ---- | -------------------------------- |
| angelfish  | zigzag     | 빠름 | 좌우 지그재그, 빈번한 방향 전환  |
| manta      | standard   | 중간 | 우아한 대회전, 넓은 선회반경     |
| turtle     | slow       | 느림 | 일직선 위주, 드문 방향 전환      |
| pufferfish | standard   | 중간 | 위협 시 부풀기 (스케일 증가)     |
| dolphin    | linear     | 빠름 | 직선 돌진 + 점프 (y축 급상승)    |
| squid      | float      | 느림 | 촉수 끌며 부유, 간헐적 빠른 이동 |
| shark      | linear     | 빠름 | 일직선 순찰, 절대 멈추지 않음    |
| seahorse   | float      | 느림 | 수직 부유, 거의 정지 상태        |
| goldfish   | standard   | 중간 | 원형 순회                        |
| flyingfish | zigzag     | 빠름 | 수면 근처, 가끔 수면 위로 점프   |
| jellyfish  | float      | 느림 | 펄싱 (주기적 수축/팽창으로 이동) |
| coral      | stationary | 정지 | 고정 위치, 미세 흔들림만         |
| shell      | stationary | 정지 | 해저 고정, 열림/닫힘 애니메이션  |
| seaweed    | stationary | 정지 | 고정, 해류에 따라 흔들림         |
| plankton   | float      | 느림 | 랜덤 브라운 운동                 |

```typescript
// 종별 행동 파라미터
const SWIM_BEHAVIORS: Record<SwimPattern, SwimBehaviorConfig> = {
  linear: {
    turnRate: 0.02,
    speedVariation: 0.1,
    verticalRange: 0.3,
    directionChangeInterval: [8, 15], // 초
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
}
```

#### P2-04a: 진화 비주얼 — 수중 생물 5종

대상: angelfish, manta, dolphin, shark, flyingfish

각 진화 단계별:
| 단계 | 시각 효과 |
|------|----------|
| Egg | 반투명 구체, 내부에 작은 실루엣, 해저 위치 |
| Fry | 모델 0.4배, 반투명(0.7), 색상 연함 |
| Juvenile | 모델 0.7배, 색상 선명, 패턴 시작 |
| Adult | 모델 1.0배, 완전한 형태 |
| Elder | 모델 1.3배, 약간의 글로우, 특수 파티클 (2-3개 orbiting) |
| Legendary | 모델 1.6배, 강한 발광, 금색 아우라 |
| Fossil | 회색 (#666), 반투명(0.6), 해저 고정, 기울어짐 |

#### P2-04b: 진화 비주얼 — 육지 적응 4종

대상: turtle, pufferfish, goldfish, seahorse

- turtle Elder: 이끼 낀 등껍질 텍스처
- pufferfish Adult+: 가시 디테일 증가
- goldfish Elder: 꼬리지느러미 확장
- seahorse Legendary: 잎해마 변형 (잎 장식)

#### P2-04c: 진화 비주얼 — 무척추/식물 6종

대상: squid, jellyfish, shell, coral, seaweed, plankton

- coral: 단계별로 가지 수 증가 (Egg=싹, Adult=풍성, Elder=거대 군락)
- plankton: 단계별 군집 크기 증가 (Egg=1개, Adult=10개 클러스터)
- jellyfish: 촉수 길이/수 증가
- seaweed: 높이/밀도 증가

---

### Batch 2-4: 전설급 + Boids + 부가 이펙트 (5개, 병렬)

#### P2-04d: 전설급 비주얼 5종

**파일 (생성):**

- `src/engine/fish/legendary/Leviathan.tsx`
- `src/engine/fish/legendary/PhoenixFish.tsx`
- `src/engine/fish/legendary/Hydra.tsx`
- `src/engine/fish/legendary/Kraken.tsx`
- `src/engine/fish/legendary/Narwhal.tsx`

| 이름         | 조건                  | 비주얼                | VFX                           |
| ------------ | --------------------- | --------------------- | ----------------------------- |
| Leviathan    | 스타 10,000+          | 거대한 용 형태 심해어 | 주변 물 왜곡, 어두운 아우라   |
| Phoenix Fish | 1년+ 방치 후 재활성   | 불꽃 이펙트 물고기    | 불꽃 파티클 트레일, 주황→빨강 |
| Hydra        | 포크 1,000+           | 머리 여러 개          | 각 머리 독립 움직임           |
| Kraken       | 이슈 500+ 모두 클로즈 | 문어 형태             | 촉수 물결, 잉크 파티클        |
| Narwhal      | 365일 연속 커밋       | 뿔 달린 물고기        | 뿔에서 빛 방출, 무지개 트레일 |

- 각 전설급: 고유 VFX 컴포넌트, 성능 < 5ms/프레임
- 동시 2개 이상 전설급 시에도 60fps 유지

#### P2-05: Boids 알고리즘 (Web Worker)

**파일 (생성):**

- `src/lib/aquarium/boids.ts` (알고리즘 핵심)
- `src/lib/aquarium/boids.worker.ts` (Web Worker)
- `src/engine/fish/FlockingSystem.tsx` (R3F 연동)

**구현 상세:**

```typescript
// src/lib/aquarium/boids.ts
// Craig Reynolds Boids 알고리즘

function updateBoids(
  boids: BoidState[],
  config: BoidConfig,
  delta: number,
): BoidState[] {
  return boids.map((boid) => {
    const neighbors = getNeighbors(boid, boids, config)
    const sameSpecies = neighbors.filter((n) => n.species === boid.species)

    // 3대 규칙 (같은 종에만 적용)
    const separation = calculateSeparation(boid, sameSpecies, config)
    const alignment = calculateAlignment(boid, sameSpecies, config)
    const cohesion = calculateCohesion(boid, sameSpecies, config)

    // 경계 회피
    const boundary = calculateBoundaryForce(boid, config)

    // 큰 물고기 회피 (다른 종의 큰 물고기)
    const predatorAvoidance = calculatePredatorAvoidance(boid, neighbors)

    // 합산
    const acceleration = vec3Add(
      vec3Scale(separation, config.separationWeight),
      vec3Scale(alignment, config.alignmentWeight),
      vec3Scale(cohesion, config.cohesionWeight),
      boundary,
      predatorAvoidance,
    )

    // 속도/위치 업데이트
    const newVelocity = vec3Clamp(
      vec3Add(boid.velocity, vec3Scale(acceleration, delta)),
      config.maxSpeed,
    )

    return {
      ...boid,
      velocity: newVelocity,
      position: vec3Add(boid.position, vec3Scale(newVelocity, delta)),
    }
  })
}
```

```typescript
// src/lib/aquarium/boids.worker.ts
self.onmessage = (e: MessageEvent<FlockingMessage>) => {
  const { type, boids, config, delta } = e.data

  if (type === 'update' && boids && config && delta) {
    const updated = updateBoids(boids, config, delta)
    self.postMessage({ type: 'result', boids: updated })
  }
}
```

```typescript
// src/engine/fish/FlockingSystem.tsx
'use client'

function FlockingSystem() {
  const workerRef = useRef<Worker>()
  const fish = useAquariumStore((s) => s.data?.fish ?? [])

  useEffect(() => {
    workerRef.current = new Worker(
      new URL('@/lib/aquarium/boids.worker.ts', import.meta.url),
    )
    return () => workerRef.current?.terminate()
  }, [])

  useFrame((_, delta) => {
    workerRef.current?.postMessage({
      type: 'update',
      boids: fishToBoids(fish),
      config: DEFAULT_BOID_CONFIG,
      delta,
    })
  })
  // ...
}
```

- Web Worker로 메인 스레드 부하 없이 Boids 계산
- 같은 종끼리만 군집 형성
- 화석 물고기는 Boids 제외 (고정)
- 기본 파라미터: separation=1.5, alignment=1.0, cohesion=1.0

**추가 Boids 규칙 (PRD P2-F02/P2-F03):**

```typescript
// updateBoids() 내 추가 힘 계산

// 1. 화석 데드존: 화석 물고기 위치를 repulsion point로 설정
function calculateDeadZoneAvoidance(
  boid: BoidState,
  fossils: BoidState[],
  config: DeadZoneConfig,
): Float32Array {
  let force = new Float32Array(3)
  for (const fossil of fossils) {
    const dist = vec3Distance(boid.position, fossil.position)
    if (dist < config.deadZoneRadius && dist > 0) {
      const repulsion = vec3Scale(
        vec3Normalize(vec3Sub(boid.position, fossil.position)),
        config.deadZoneForce * (1 - dist / config.deadZoneRadius),
      )
      force = vec3Add(force, repulsion)
    }
  }
  return force
}

// 2. 스타 기반 인력: 스타 수 높은 물고기가 주변 작은 물고기를 끌어당김
function calculateStarAttraction(
  boid: BoidState,
  neighbors: BoidState[],
  config: AttractionConfig,
): Float32Array {
  const attractors = neighbors.filter(
    (n) => n.stars >= config.starThreshold && n.stars > boid.stars * 1.5,
  )
  if (attractors.length === 0) return new Float32Array(3)
  const center = averagePosition(attractors)
  const dist = vec3Distance(boid.position, center)
  if (dist > config.attractionRadius) return new Float32Array(3)
  return vec3Scale(
    vec3Normalize(vec3Sub(center, boid.position)),
    config.attractionWeight,
  )
}

// 3. 먹이사슬 도주: 크기 2배 이상 차이 나는 큰 물고기 근처 시 flee
function calculateFoodChainFlee(
  boid: BoidState,
  neighbors: BoidState[],
  config: FoodChainConfig,
): Float32Array {
  let force = new Float32Array(3)
  for (const n of neighbors) {
    if (n.size >= boid.size * config.fleeThreshold) {
      const dist = vec3Distance(boid.position, n.position)
      if (dist < config.fleeRadius && dist > 0) {
        const flee = vec3Scale(
          vec3Normalize(vec3Sub(boid.position, n.position)),
          config.fleeForce,
        )
        force = vec3Add(force, flee)
      }
    }
  }
  return force
}
```

```typescript
// 클릭 이벤트 → 놀람 반응 (FlockingSystem.tsx에 추가)
// startlePoint: 클릭한 3D 위치
function applyStartle(
  boids: BoidState[],
  startlePoint: Float32Array,
  config: StartleConfig,
): BoidState[] {
  return boids.map((boid) => {
    const dist = vec3Distance(boid.position, startlePoint)
    if (dist > config.startleRadius) return boid
    // 클릭 지점에서 멀어지는 방향으로 강한 속도 부여
    const direction = vec3Normalize(vec3Sub(boid.position, startlePoint))
    const startleVelocity = vec3Scale(
      direction,
      config.startleForce * (1 - dist / config.startleRadius),
    )
    return {
      ...boid,
      velocity: vec3Add(boid.velocity, startleVelocity),
      isStartled: true,
      startledAt: Date.now(),
    }
  })
}
// startleDuration(ms) 경과 후 isStartled 해제, 정상 Boids 재개
```

- `DEFAULT_DEAD_ZONE_CONFIG`: deadZoneRadius=3.0, deadZoneForce=2.0
- `DEFAULT_ATTRACTION_CONFIG`: attractionWeight=0.5, attractionRadius=8.0, starThreshold=100
- `DEFAULT_STARTLE_CONFIG`: startleRadius=5.0, startleDuration=2000, startleForce=5.0
- `DEFAULT_FOOD_CHAIN_CONFIG`: fleeThreshold=2.0, fleeRadius=4.0, fleeForce=3.0

**검증:**

```bash
pnpm test -- boids
# 분리/정렬/응집 각 규칙 유닛 테스트
# 경계 회피 테스트
# 50마리 Boids 시 메인 스레드 16ms/frame 이하 확인
```

#### P2-08: 산호/해초 (HTML/CSS/Markdown 레포)

- `coral`, `shell`, `seaweed` 종의 특수 렌더링
- 고정 위치 (stationary), 해저 부착
- 물고기가 아닌 환경 요소로 취급
- 서로 다른 모양/크기로 배치

#### P2-18: README 바이오루미네센스

- `hasReadme === true`인 물고기에 emissive 발광
- emissiveIntensity: 0.15 (은은한 수준)
- 색상: 물고기 고유 색상의 밝은 버전
- 야간 모드에서 더 두드러짐

#### P2-19: 라이선스 쉴드 아우라

- `hasLicense === true`인 물고기에 보호막 이펙트
- 반투명 구체 오버레이 (약간 더 큰 SphereGeometry)
- opacity: 0.1, 은은한 파란 틴트
- 호버 시 쉴드가 더 선명해짐 (opacity 0.3)

---

### Batch 2-5: 떼지어 통합 + 이슈 + 이스터에그 (3개, 혼합)

#### P2-06: 떼지어 통합 — 같은 언어 학교

- Boids 결과를 FishGroup에 반영
- 같은 언어(species) 물고기가 자연스럽게 무리 형성
- 큰 물고기(스타 많은) 주변에 작은 물고기 몰림: cohesion center를 큰 물고기 쪽으로 바이어스
- 화석 근처 데드존: 화석 주변 반경 3 내에서 separation 강화

**소셜 관계 시각화 3종 (PRD 2.1):**

1. **스타를 준 유저 → 플랑크톤 파티클 밀도 증가**
   - `fish.starGivers` 배열에 해당 유저가 있으면 물고기 주변 파티클 밀도 ×2
   - 미세 플랑크톤 파티클 (크기 0.02, 색상 #88ffcc) 5~15개 orbit
   - `StargiverParticles.tsx`: fish 주변 구체 궤도로 천천히 공전

2. **같은 org 소속 → 같은 산호초 영역에 서식**
   - `fish.orgName`이 동일한 물고기들을 같은 zone에 배치
   - 수족관을 최대 5개 zone으로 분할 (org별)
   - `OrgZoneLayout.ts`: org별 중심 좌표 계산, Boids cohesion center를 org zone center로 바이어스
   - 영역 경계는 시각화 안 함 (자연스러운 클러스터링만)

3. **상호 팔로우 → pair swimming**
   - `fish.mutualFollows`: 상호 팔로우 관계의 유저네임 배열
   - 상호 팔로우 물고기 쌍을 pair로 등록, 항상 반경 2 이내 유지
   - `PairSwimmingBehavior.ts`: pair끼리 강한 cohesion (weight=3.0), 함께 이동
   - 각 pair는 서로의 위치를 추적하며 나란히 헤엄

#### P2-20: 오픈 이슈 → 상처/반점

- `openIssues` 수에 비례하여 물고기에 시각적 마크
- 1-5개: 작은 반점 1개 (UV overlay)
- 6-20개: 반점 2-3개
- 21+: 명확한 상처 마크
- 구현: 커스텀 셰이더 또는 데칼 텍스처

#### P2-21: 이스터에그 — 유저네임 + 레포

**파일:** `src/lib/aquarium/easter-eggs.ts`

```typescript
// 유저네임 기반
const USERNAME_EASTER_EGGS: Record<string, EasterEgg> = {
  torvalds: { type: 'leviathan_boss', effect: '거대한 보스 Leviathan 등장' },
  gaearon: {
    type: 'react_phoenix',
    effect: 'Phoenix Fish + React 로고 파티클',
  },
  sindresorhus: { type: 'npm_school', effect: '수백 마리 작은 물고기 떼' },
  DHH: { type: 'ruby_elder', effect: '거대한 금붕어 장로' },
  maboroshi: { type: 'ghost_fish', effect: '유령 물고기 (투명 깜빡임)' },
}

// 레포 이름 기반
const REPO_EASTER_EGGS: Record<string, EasterEgg> = {
  'awesome-*': { type: 'crown', effect: '왕관 장식' },
  dotfiles: { type: 'ghost', effect: '유령 효과' },
  '*-bot': { type: 'robot', effect: '로봇 물고기' },
  'todo*': { type: 'checklist', effect: '체크리스트 버블' },
  '.github': { type: 'octocat', effect: 'Octocat 실루엣' },
  'hello-world': { type: 'baby', effect: '아기 물고기 특별 이펙트' },
}

// 시크릿 종 5종 (PRD 16.5)
const SECRET_SPECIES: SecretSpeciesCondition[] = [
  {
    id: 'ghost_fish',
    nameEn: 'Ghost Fish',
    nameKo: '유령 물고기',
    condition: '레포 1개 & 커밋 0 — 활동 없는 계정',
    effect:
      '완전 반투명 (opacity 0.15), 깜빡이는 outline만 표시, 수족관 구석에 정지',
  },
  {
    id: 'zombie_fish',
    nameEn: 'Zombie Fish',
    nameKo: '좀비 물고기',
    condition: '화석(Fossil) 상태에서 다시 커밋 시작 — 재활성 레포',
    effect:
      '왼쪽 절반 회색(#888) 화석 텍스처, 오른쪽 절반 정상 컬러, 비틀거리는 수영',
  },
  {
    id: 'pirate_fish',
    nameEn: 'Pirate Fish',
    nameKo: '해적 물고기',
    condition: '라이선스 없는 레포 10개 이상 보유',
    effect: '해적 깃발(🏴‍☠️) 장식 overlay, 검은 안대, 불규칙 항해 패턴',
  },
  {
    id: 'scholar_fish',
    nameEn: 'Scholar Fish',
    nameKo: '학자 물고기',
    condition: 'README 5,000자 이상인 레포 보유',
    effect: '안경 장식 overlay, 책 파티클이 주변에 떠다님, 느리고 신중한 수영',
  },
  {
    id: 'chameleon_fish',
    nameEn: 'Chameleon Fish',
    nameKo: '카멜레온 물고기',
    condition: '5개 이상 언어 사용 레포 보유',
    effect: '2초 주기로 색상 전환 (언어별 색상 순환), 혼합 색상 트레일',
  },
]
// 시크릿 종은 일반 도감에 미등장, 별도 '비밀 도감' 섹션에서 조건 충족 시 해금
```

---

### Batch 2-6: 환경 심화 (6개, 병렬)

#### P2-07: 포크/PR 공생 인터랙션

- 포크된 레포: 원본 물고기 근처에 작은 치어 떼 (fry) 렌더링
  - 포크 수만큼 fry (최대 10개)
  - 원본 물고기 반경 3 내에서 군집
- PR 리뷰어: 청소물고기처럼 큰 물고기 주변을 따라다님
  - 리뷰어 관계가 있는 물고기끼리 `swim_together` 패턴

#### P2-09: 시간대별 조명 사이클

- 유저의 커밋 피크 시간 = 수족관 "낮"
- 4단계: dawn(따뜻한 오렌지), day(밝은 백색), dusk(보라), night(어두운 파랑)
- 조명 전환: 부드러운 lerp (10초)
- `environmentData.timeOfDay`에서 결정

#### P2-10: 날씨 시스템

- 최근 30일 커밋 빈도 → 물 투명도
- 높은 활동: 맑은 물 (fog far=100)
- 낮은 활동: 탁한 물 (fog far=40)
- 파티클 밀도도 연동

#### P2-11: 컨트리뷰션 → 지형 하이트맵

- `environmentData.terrainHeights` (52주 데이터)
- 해저 지형의 높이 맵으로 변환
- 높은 기여 주간 → 산호초 솟아오름
- 낮은 기여 주간 → 평탄한 모래

#### P2-12: 심해 레이어 (5yr+ 계정)

- `environmentData.depth === 'abyss'`일 때 활성
- 수족관 하단에 어두운 심해 층 추가
- 발광 생물 (플랑크톤 글로우 강화)
- 앵글러피시 스타일 라이트

#### P2-13: 수면 — 파도 + 굴절

- Phase 1의 Water.tsx 확장
- 파도 시뮬레이션: 여러 사인파 합성 (Gerstner waves 간소화)
- 굴절: 수면 아래 오브젝트 왜곡 효과
- 성능: 모바일에서는 간단한 평면만

---

### Batch 2-7: 사운드 + 도감 + 테마 + 적응형 품질 (5개, 병렬)

#### P2-14: 사운드 시스템 (Tone.js)

**파일 (생성):**

- `src/engine/sound/SoundManager.ts`
- `src/engine/sound/ambience.ts`
- `src/components/ui/VolumeControl.tsx`

**구현 상세:**

```typescript
// src/engine/sound/SoundManager.ts
import * as Tone from 'tone'

class SoundManager {
  private isInitialized = false

  async init(): Promise<void> {
    // 유저 인터랙션 후 AudioContext 시작 (브라우저 정책)
    await Tone.start()
    this.isInitialized = true
    this.startAmbience()
  }

  private startAmbience(): void {
    // 수중 앰비언스: 저주파 필터링된 노이즈
    const noise = new Tone.Noise('brown').start()
    const filter = new Tone.Filter(200, 'lowpass')
    const volume = new Tone.Volume(-20)
    noise.connect(filter).connect(volume).toDestination()

    // 버블 소리: 랜덤 간격의 높은 톤
    const bubbleSynth = new Tone.Synth({
      oscillator: { type: 'sine' },
      envelope: { attack: 0.01, decay: 0.3, sustain: 0, release: 0.1 },
    }).toDestination()

    setInterval(() => {
      if (!this.isInitialized) return
      const freq = 800 + Math.random() * 2000
      bubbleSynth.triggerAttackRelease(freq, '16n', undefined, 0.1)
    }, 2000 + Math.random() * 5000)
  }

  playEffect(type: 'hover' | 'click' | 'swim'): void {
    // 이벤트별 효과음
  }

  setVolume(volume: number): void { ... }
  mute(): void { ... }
  unmute(): void { ... }
}

const soundManager = new SoundManager()
export { soundManager }
```

- 첫 클릭/터치 시 AudioContext 시작
- 음소거/볼륨 컨트롤 UI (우측 하단)
- 설정 localStorage 저장

#### P2-15: 도감 (Codex) v1

**파일 (생성):**

- `src/app/[locale]/[username]/codex/page.tsx`
- `src/lib/codex/codex.ts`
- `src/components/ui/CodexGrid.tsx`
- `src/components/ui/CodexEntryCard.tsx`

**구현 상세:**

```typescript
// src/lib/codex/codex.ts
function generateCodexEntries(fish: FishData[]): CodexEntry[] {
  const allPossible = generateAllPossibleEntries() // 90종 (15 × 6)
  const discovered = new Set(
    fish.map((f) => `${f.species}_${f.evolutionStage}`),
  )

  return allPossible.map((entry) => ({
    ...entry,
    discoveredAt: discovered.has(entry.id) ? new Date().toISOString() : null,
  }))
}
```

- 내 수족관의 종 자동 등록 (discoveredAt 기록)
- 그리드: 컬러(발견) / 흑백(미발견) 카드
- 각 카드: 종 아이콘 + 이름 + 레어리티 표시
- 클릭 시 상세: 출현 조건 힌트, 설명
- 완성도 %: 상단에 프로그레스 바

#### P2-16: 테마 시스템 (4종)

**파일:** `src/lib/aquarium/themes.ts`

```typescript
const THEMES: Record<ThemeId, ThemeConfig> = {
  default: {
    fogColor: '#0a1628', fogNear: 10, fogFar: 80,
    ambientColor: '#4488cc', ambientIntensity: 0.4,
    sunColor: '#ffffff', sunIntensity: 1.0,
    sunPosition: [10, 20, 10],
    backgroundColor: '#0a1628',
    waterColor: '#1a4a7a', particleColor: '#88ccff',
  },
  dark: {
    fogColor: '#050510', fogNear: 5, fogFar: 50,
    ambientColor: '#112244', ambientIntensity: 0.15,
    // ...
  },
  coral: { ... },
  deep: { ... },
  tropical: { ... },
}
```

- 테마 전환: 부드러운 lerp (2초)
- UI 토글: 설정 패널에서 선택
- localStorage 저장

#### P2-17: 적응형 퀄리티

**파일:** `src/engine/scene/AdaptiveQuality.tsx`

```typescript
function AdaptiveQuality() {
  const fpsRef = useRef(60)
  const qualityRef = useRef<'high' | 'medium' | 'low'>('high')

  useFrame((state) => {
    // FPS 측정 (1초 평균)
    fpsRef.current = 1 / state.clock.getDelta()

    if (fpsRef.current < 25 && qualityRef.current !== 'low') {
      qualityRef.current = 'low'
      reducaParticles(0.3)
      reduceFishDetail('low')
    } else if (fpsRef.current < 40 && qualityRef.current === 'high') {
      qualityRef.current = 'medium'
      reduceParticles(0.6)
      reduceFishDetail('medium')
    } else if (fpsRef.current > 55 && qualityRef.current !== 'high') {
      qualityRef.current = 'high'
      restoreFullQuality()
    }
  })

  return null
}
```

- 3단계: High(<20 fish), Medium(20-50), Low(50+)
- 감소 항목: 파티클 수, LOD, 포스트프로세싱, 셰이더 복잡도
- FPS 안정 후 3초 대기 → 복원 시도

#### P2-24: i18n 확장 — 일본어 + 중국어(간체) (PRD 17.1)

**파일 (생성):**

- `messages/ja/common.json`
- `messages/ja/aquarium.json`
- `messages/ja/codex.json`
- `messages/zh/common.json`
- `messages/zh/aquarium.json`
- `messages/zh/codex.json`
- `src/i18n/config.ts` (수정)

**구현 상세:**

```typescript
// src/i18n/config.ts 수정
export const locales = ['en', 'ko', 'ja', 'zh'] as const
export type Locale = (typeof locales)[number]

export const localeNames: Record<Locale, string> = {
  en: 'English',
  ko: '한국어',
  ja: '日本語',
  zh: '简体中文',
}
```

```json
// messages/ja/common.json (예시 키 구조)
{
  "nav": {
    "explore": "探索",
    "leaderboard": "ランキング",
    "compare": "比較"
  },
  "auth": {
    "login": "GitHubでログイン",
    "logout": "ログアウト"
  }
}
```

```json
// messages/zh/common.json
{
  "nav": {
    "explore": "探索",
    "leaderboard": "排行榜",
    "compare": "对比"
  },
  "auth": {
    "login": "使用GitHub登录",
    "logout": "退出登录"
  }
}
```

- 번역 키 구조는 기존 `messages/en/`, `messages/ko/`와 동일하게 유지
- next-intl `routing.ts`의 `locales` 배열에 `ja`, `zh` 추가
- `middleware.ts`의 locale 매칭 업데이트
- Phase 2 완료 시점에 EN/KO 기준 번역 키 추출 후 JA/ZH 작성

**검증:**

```bash
# /ja/username → 일본어 UI 표시
# /zh/username → 중국어(간체) UI 표시
# 언어 전환 UI에서 4개 언어 선택 가능
pnpm build
```

---

#### P2-22: 이스터에그 — 날짜 + 코나미코드

```typescript
// 날짜 기반
const DATE_EASTER_EGGS = {
  '04-01': { effect: 'upside_down', desc: '수족관 뒤집기' }, // 만우절
  '10-31': { effect: 'skeleton', desc: '해골 물고기' }, // 할로윈
  '12-25': { effect: 'santa_hat', desc: '산타 모자' }, // 크리스마스
  '01-01': { effect: 'fireworks', desc: '불꽃놀이 파티클' }, // 새해
  '02-14': { effect: 'hearts', desc: '하트 버블' }, // 발렌타인
}

// 코나미 코드: ↑↑↓↓←→←→BA
// 효과: 30초간 8비트 픽셀 모드 (셰이더 pixelation)
```

---

### Batch 2-8: 비주얼 회귀 테스트 (1개)

#### P2-23: 비주얼 회귀 테스트 인프라

**파일 (생성):**

- `tests/visual/aquarium.visual.ts`
- `.github/workflows/visual-regression.yml` (업데이트)

**구현 상세:**

- Playwright `toHaveScreenshot()` 사용
- 고정 시드 데이터 (MSW mock으로 일관된 응답)
- 스크린샷 대상: 랜딩, 수족관(30마리), 툴팁, HUD, 모바일
- 0.5% 픽셀 차이 임계값
- CI에서 자동 실행

**검증:**

```bash
pnpm test:e2e -- visual
# 베이스라인 스크린샷 생성 (첫 실행)
# 이후 실행에서 diff 비교
```

---

## 5. Quality Gate 체크리스트

### 기능

- [ ] 15종 고유 3D 모델 정상 렌더링
- [ ] 종별 수영 패턴 확인 (상어=직선, 해파리=부유 등)
- [ ] 진화 단계별 시각적 구분 (Egg~Legendary~Fossil)
- [ ] 전설급 5종 고유 VFX 동작
- [ ] Boids 군집: 같은 언어 물고기 떼지어
- [ ] Boids 데드존: 화석 주변 반경 3 내 다른 물고기 기피
- [ ] Boids 인력: 스타 100+ 물고기 주변에 작은 물고기 몰림
- [ ] 놀람 반응: 클릭 시 반경 5 내 물고기 산개 후 2초 내 복귀
- [ ] 먹이사슬: 크기 2배 이상 큰 물고기 근처에서 작은 물고기 flee
- [ ] 소셜 관계 시각화: StargiverParticles, OrgZone 클러스터, PairSwimming 동작
- [ ] 포크 치어 원본 근처 배치
- [ ] 사운드 에러 없이 재생 (앰비언스 + 이펙트)
- [ ] 음소거/볼륨 컨트롤 동작
- [ ] 도감 1종 이상 자동 등록
- [ ] 도감 완성도 % 정확
- [ ] 4종 테마 전환 동작
- [ ] 이스터에그 최소 3개 동작 확인
- [ ] 시크릿 종 5종 조건 매핑 확인 (Ghost/Zombie/Pirate/Scholar/Chameleon)
- [ ] i18n: /ja/, /zh/ 경로에서 해당 언어 UI 표시

### 성능

- [ ] 데스크탑 50fps+ (50마리 + Boids)
- [ ] Web Worker: 메인 스레드 16ms/frame 이하
- [ ] 적응형 퀄리티: FPS < 30 → 자동 감소
- [ ] 전설급 물고기 < 5ms/frame

### 테스트

- [ ] Boids 알고리즘 유닛 테스트 (분리/정렬/응집)
- [ ] 비주얼 회귀 베이스라인 캡처 완료
- [ ] 진화 단계 매핑 테스트

### 검증 명령어

```bash
pnpm check          # lint + format + typecheck
pnpm test           # unit + integration
pnpm test:e2e       # E2E + visual regression
pnpm build          # 빌드 성공
```
