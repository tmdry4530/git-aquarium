# Phase 1: MVP — "수족관 생성" (4주)

## 1. 개요

**목표:** GitHub 유저네임 입력 → 3D 수족관 렌더링 → 공유 가능한 MVP
**기간:** 4주 (Week 1~4)
**태스크 수:** 41개 | **실행 배치:** 12개
**전제조건:** Phase 0 완료 (프로젝트 셋업, 모든 레퍼런스 문서, 디렉토리 구조)

---

## 2. 환경 사전조건

```bash
# .env.local에 실제 값 설정 필요
GITHUB_TOKEN=ghp_...                  # GitHub PAT (public repo 읽기)
UPSTASH_REDIS_REST_URL=https://...    # Upstash Redis REST URL
UPSTASH_REDIS_REST_TOKEN=...          # Upstash Redis REST Token
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

- GitHub Personal Access Token 발급 (Settings → Developer settings → Fine-grained tokens → public_repo read)
- Upstash Redis 무료 계정 생성 및 DB 생성

---

## 3. TypeScript 인터페이스 참조

Phase 0에서 생성된 타입 파일 참조:

- `src/types/github.ts` — GitHubUser, GitHubRepo, ContributionCalendar
- `src/types/fish.ts` — FishData, FishSpecies, EvolutionStage, SwimPattern
- `src/types/aquarium.ts` — AquariumData, EnvironmentData, AquariumStats
- `src/constants/species-map.ts` — LANGUAGE_TO_SPECIES, SPECIES_CONFIGS, calculateFishSize, calculateSwimSpeed

추가 타입 (Phase 1에서 정의):

```typescript
// src/stores/aquarium-store.ts
interface AquariumState {
  // Data
  data: AquariumData | null
  selectedFishId: string | null
  hoveredFishId: string | null

  // UI state
  isLoading: boolean
  error: string | null

  // Actions
  setData: (data: AquariumData) => void
  selectFish: (id: string | null) => void
  hoverFish: (id: string | null) => void
  setLoading: (loading: boolean) => void
  setError: (error: string | null) => void
  reset: () => void
}

// src/stores/ui-store.ts
interface UIState {
  tooltipVisible: boolean
  tooltipPosition: { x: number; y: number }
  detailPanelOpen: boolean
  settingsOpen: boolean
  isMobile: boolean
  showHUD: boolean

  setTooltip: (visible: boolean, position?: { x: number; y: number }) => void
  toggleDetailPanel: (open?: boolean) => void
  toggleSettings: () => void
  setMobile: (isMobile: boolean) => void
}
```

---

## 4. 실행 배치

### Week 1: 3D Scene + GitHub API

#### Batch 1-1: 기반 레이어 (3개, 병렬)

##### P1-01: GitHub API 클라이언트 (REST + GraphQL)

**파일 (생성):**

- `src/lib/github/client.ts`
- `src/lib/github/graphql.ts`
- `src/lib/github/queries.ts`
- `src/lib/github/types.ts`

**구현 상세:**

```typescript
// src/lib/github/client.ts
import { GitHubUser, GitHubRepo } from '@/types/github'

const GITHUB_API = 'https://api.github.com'
const GITHUB_GRAPHQL = 'https://api.github.com/graphql'

async function fetchGitHubUser(username: string): Promise<GitHubUser> {
  // GraphQL 단일 쿼리로 유저 + 레포 + 컨트리뷰션 일괄 조회
  const query = USER_REPOS_QUERY // queries.ts에서 import
  const response = await fetch(GITHUB_GRAPHQL, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${process.env.GITHUB_TOKEN}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ query, variables: { username } }),
  })

  if (!response.ok) {
    if (response.status === 401) throw new GitHubError('UNAUTHORIZED', 401)
    if (response.status === 403) throw new GitHubError('RATE_LIMITED', 403)
    throw new GitHubError('SERVER_ERROR', response.status)
  }

  const { data, errors } = await response.json()
  if (errors?.[0]?.type === 'NOT_FOUND') {
    throw new GitHubError('USER_NOT_FOUND', 404)
  }

  return transformGraphQLResponse(data.user)
}

// 페이지네이션: GraphQL cursor 기반
async function fetchAllRepos(
  username: string,
  maxPages: number = 10,
): Promise<GitHubRepo[]> {
  const allRepos: GitHubRepo[] = []
  let cursor: string | null = null

  for (let page = 0; page < maxPages; page++) {
    const { repos, pageInfo } = await fetchReposPage(username, cursor)
    allRepos.push(...repos)
    if (!pageInfo.hasNextPage) break
    cursor = pageInfo.endCursor
  }

  return allRepos
}

// 에러 클래스
class GitHubError extends Error {
  constructor(
    public code:
      | 'USER_NOT_FOUND'
      | 'RATE_LIMITED'
      | 'UNAUTHORIZED'
      | 'SERVER_ERROR',
    public statusCode: number,
  ) {
    super(`GitHub API error: ${code}`)
  }
}
```

```typescript
// src/lib/github/queries.ts
const USER_REPOS_QUERY = `
  query UserAquarium($username: String!, $after: String) {
    user(login: $username) {
      login
      name
      avatarUrl
      bio
      followers { totalCount }
      following { totalCount }
      createdAt
      contributionsCollection {
        contributionCalendar {
          totalContributions
          weeks {
            contributionDays {
              contributionCount
              date
            }
          }
        }
      }
      repositories(
        first: 100
        after: $after
        orderBy: { field: UPDATED_AT, direction: DESC }
        ownerAffiliations: OWNER
        privacy: PUBLIC
      ) {
        nodes {
          name
          description
          url
          primaryLanguage { name color }
          stargazerCount
          forkCount
          issues(states: OPEN) { totalCount }
          licenseInfo { spdxId }
          object(expression: "HEAD:README.md") {
            ... on Blob { byteSize }
          }
          defaultBranchRef {
            target {
              ... on Commit {
                history { totalCount }
                committedDate
              }
            }
          }
          pushedAt
          createdAt
        }
        pageInfo {
          hasNextPage
          endCursor
        }
      }
    }
  }
`
```

**Rate Limit 관리 상세 (PRD 12.5):**

```typescript
// src/lib/github/client.ts 확장

// 1. X-RateLimit-Remaining 헤더 모니터링
async function checkRateLimit(response: Response): Promise<void> {
  const remaining = parseInt(
    response.headers.get('X-RateLimit-Remaining') ?? '100',
  )
  const resetAt = parseInt(response.headers.get('X-RateLimit-Reset') ?? '0')

  if (remaining <= 100) {
    // 잔여 100 이하: 캐시 only 모드 전환 (Redis에 플래그 저장)
    await redis.set('github:rate-limit:cache-only', '1', {
      ex: resetAt - Math.floor(Date.now() / 1000),
    })
  }
}

// 2. 캐시 only 모드 확인
async function isCacheOnlyMode(): Promise<boolean> {
  return (await redis.exists('github:rate-limit:cache-only')) === 1
}

// 3. Burst 방지: 동시 요청 큐잉
// - 동시 요청 최대 10개 제한
// - p-limit 라이브러리 활용
import pLimit from 'p-limit'
const githubLimit = pLimit(10)

// 4. Retry 전략: 429 응답 시 Retry-After 헤더 기반 재시도
async function fetchWithRetry(
  url: string,
  options: RequestInit,
  retries = 3,
): Promise<Response> {
  for (let attempt = 0; attempt < retries; attempt++) {
    const response = await fetch(url, options)

    if (response.status === 429) {
      const retryAfter = parseInt(response.headers.get('Retry-After') ?? '60')
      if (attempt < retries - 1) {
        await new Promise((r) => setTimeout(r, retryAfter * 1000))
        continue
      }
    }

    return response
  }
  throw new GitHubError('RATE_LIMITED', 429)
}

// 5. Secondary Rate Limit: 사용자당 직렬 처리
// GraphQL 단일 쿼리로 유저+레포 일괄 조회 (이미 P1-01 구조에 반영됨)
// REST fallback 시 직렬 처리 (Promise.all 사용 금지)
```

추가 패키지:

```bash
pnpm add p-limit
```

**검증:**

```bash
pnpm test -- github
# MSW mock으로:
# - 정상 유저 조회
# - 404 유저
# - 100+ 레포 페이지네이션
# - rate limit 응답 (429 + Retry-After)
# - X-RateLimit-Remaining <= 100 시 cache-only 플래그 설정 확인
```

##### P1-06: R3F 씬 기본 셋업

**파일 (생성):**

- `src/engine/scene/AquariumScene.tsx`

**구현 상세:**

```typescript
// src/engine/scene/AquariumScene.tsx
'use client'

import { Canvas } from '@react-three/fiber'
import { PerspectiveCamera, OrbitControls } from '@react-three/drei'
import { Suspense } from 'react'

interface AquariumSceneProps {
  children?: React.ReactNode
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
      >
        <PerspectiveCamera
          makeDefault
          position={[0, 5, 20]}
          fov={60}
          near={0.1}
          far={200}
        />
        <color attach="background" args={['#0a1628']} />
        <fog attach="fog" args={['#0a1628', 10, 80]} />

        {/* 조명 */}
        <ambientLight intensity={0.4} color="#4488cc" />
        <directionalLight
          position={[10, 20, 10]}
          intensity={1.0}
          color="#ffffff"
          castShadow
        />

        <Suspense fallback={null}>
          {children}
        </Suspense>
      </Canvas>
    </div>
  )
}

export { AquariumScene }
```

**검증:**

```bash
pnpm dev
# Canvas 렌더링, 배경색, 포그 확인
# 콘솔에 WebGL 에러 없음
```

##### P1-08: Zustand 스토어

**파일 (생성):**

- `src/stores/aquarium-store.ts`
- `src/stores/ui-store.ts`

**구현 상세:**

```typescript
// src/stores/aquarium-store.ts
'use client'

import { create } from 'zustand'
import { immer } from 'zustand/middleware/immer'
import { devtools } from 'zustand/middleware'
import type { AquariumData } from '@/types/aquarium'

interface AquariumState {
  data: AquariumData | null
  selectedFishId: string | null
  hoveredFishId: string | null
  isLoading: boolean
  error: string | null

  setData: (data: AquariumData) => void
  selectFish: (id: string | null) => void
  hoverFish: (id: string | null) => void
  setLoading: (loading: boolean) => void
  setError: (error: string | null) => void
  reset: () => void
}

const useAquariumStore = create<AquariumState>()(
  devtools(
    immer((set) => ({
      data: null,
      selectedFishId: null,
      hoveredFishId: null,
      isLoading: false,
      error: null,

      setData: (data) =>
        set((state) => {
          state.data = data
          state.isLoading = false
          state.error = null
        }),
      selectFish: (id) =>
        set((state) => {
          state.selectedFishId = id
        }),
      hoverFish: (id) =>
        set((state) => {
          state.hoveredFishId = id
        }),
      setLoading: (loading) =>
        set((state) => {
          state.isLoading = loading
        }),
      setError: (error) =>
        set((state) => {
          state.error = error
          state.isLoading = false
        }),
      reset: () =>
        set((state) => {
          state.data = null
          state.selectedFishId = null
          state.hoveredFishId = null
          state.isLoading = false
          state.error = null
        }),
    })),
    { name: 'aquarium-store' },
  ),
)

// R3F 최적화: subscribe로 리렌더 방지
const useSelectedFish = () =>
  useAquariumStore(
    (s) => s.data?.fish.find((f) => f.id === s.selectedFishId) ?? null,
  )

const useAliveFish = () =>
  useAquariumStore(
    (s) => s.data?.fish.filter((f) => f.evolutionStage !== 'fossil') ?? [],
  )

export { useAquariumStore, useSelectedFish, useAliveFish }
```

**검증:**

```bash
pnpm test -- stores
```

---

#### Batch 1-2: 컴포넌트 레이어 (5개, 병렬)

##### P1-02: Redis 캐싱 레이어

**파일:** `src/lib/cache/redis.ts`

**구현 상세:**

```typescript
import { Redis } from '@upstash/redis'

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!,
})

interface CacheOptions {
  ttl: number // seconds
  etag?: string // GitHub ETag for conditional requests
}

async function getCached<T>(
  key: string,
): Promise<{ data: T; etag?: string } | null> {
  const cached = await redis.get<{ data: T; etag?: string }>(key)
  return cached
}

async function setCached<T>(
  key: string,
  data: T,
  options: CacheOptions,
): Promise<void> {
  await redis.set(key, { data, etag: options.etag }, { ex: options.ttl })
}

async function invalidate(key: string): Promise<void> {
  await redis.del(key)
}

// 캐시 키 패턴
const CACHE_KEYS = {
  aquarium: (username: string) => `aquarium:${username}`,
  user: (username: string) => `github:user:${username}`,
  deliveryId: (id: string) => `webhook:delivery:${id}`,
} as const

// TTL 상수
const CACHE_TTL = {
  AQUARIUM: 30 * 60, // 30분
  USER: 60 * 60, // 1시간
  CONTRIBUTION: 24 * 60 * 60, // 24시간
  DELIVERY_ID: 24 * 60 * 60, // 24시간
} as const

export { redis, getCached, setCached, invalidate, CACHE_KEYS, CACHE_TTL }
```

**Conditional Requests — ETag 활용 (PRD 12.1):**

GitHub API 304 Not Modified를 활용해 Rate Limit을 절약:

```typescript
// src/lib/cache/redis.ts 확장

// ETag 저장: 캐시 항목에 etag 포함 (getCached/setCached에 이미 etag 필드 있음)

// GitHub API 요청 시 If-None-Match 헤더 전송
async function fetchWithETag<T>(
  url: string,
  cacheKey: string,
  headers: Record<string, string>,
): Promise<T> {
  const cached = await getCached<T>(cacheKey)

  const requestHeaders: Record<string, string> = { ...headers }
  if (cached?.etag) {
    requestHeaders['If-None-Match'] = cached.etag
  }

  const response = await fetch(url, { headers: requestHeaders })

  // 304: 캐시 데이터 그대로 반환 (API 카운트 절약)
  if (response.status === 304 && cached) {
    return cached.data
  }

  if (!response.ok) throw new Error(`HTTP ${response.status}`)

  const data = (await response.json()) as T
  const newEtag = response.headers.get('etag') ?? undefined

  // 새 ETag와 함께 캐시 갱신
  await setCached(cacheKey, data, { ttl: CACHE_TTL.AQUARIUM, etag: newEtag })

  return data
}

export {
  redis,
  getCached,
  setCached,
  invalidate,
  fetchWithETag,
  CACHE_KEYS,
  CACHE_TTL,
}
```

**검증:**

```bash
pnpm test -- redis
# ETag 관련 테스트:
# - 첫 요청: etag 저장 확인
# - 두 번째 요청: If-None-Match 헤더 전송 확인
# - 304 응답: 캐시 데이터 반환 확인
```

##### P1-03: Repo → Fish 데이터 변환기

**파일 (생성):**

- `src/lib/aquarium/mapper.ts`
- `src/lib/aquarium/evolution.ts`
- `src/lib/aquarium/species.ts`

**구현 상세:**

```typescript
// src/lib/aquarium/mapper.ts
import type { GitHubRepo, GitHubUser } from '@/types/github'
import type { FishData, AquariumData, EnvironmentData } from '@/types/aquarium'
import { getSpeciesForLanguage, getSpeciesColor } from './species'
import { getEvolutionStage } from './evolution'
import {
  calculateFishSize,
  calculateSwimSpeed,
  SPECIES_CONFIGS,
} from '@/constants/species-map'

function repoToFish(repo: GitHubRepo): FishData {
  const species = getSpeciesForLanguage(repo.language)
  const config = SPECIES_CONFIGS[species]

  return {
    id: `fish-${repo.name}`,
    repoName: repo.name,
    repoUrl: repo.url,
    description: repo.description,
    species,
    evolutionStage: getEvolutionStage(
      repo.totalCommits,
      repo.stars,
      repo.createdAt,
      repo.lastPushedAt,
    ),
    color: getSpeciesColor(species),
    size: calculateFishSize(species, repo.stars),
    swimSpeed: calculateSwimSpeed(repo.commitsLast30Days),
    swimPattern: config.swimPattern,
    stars: repo.stars,
    forks: repo.forks,
    openIssues: repo.openIssues,
    hasReadme: repo.hasReadme,
    hasLicense: repo.license !== null,
    language: repo.language,
    lastCommitAt: repo.lastPushedAt,
    totalCommits: repo.totalCommits,
    commitsLast30Days: repo.commitsLast30Days,
    createdAt: repo.createdAt,
  }
}

function userToEnvironment(user: GitHubUser): EnvironmentData {
  const totalContributions = user.contributionCalendar.totalContributions
  const accountAgeYears = yearsSince(user.createdAt)

  return {
    tankSize:
      totalContributions > 5000
        ? 'vast'
        : totalContributions > 1000
          ? 'large'
          : totalContributions > 200
            ? 'medium'
            : 'small',
    brightness: Math.min(user.followers / 1000, 1.0),
    terrainHeights: user.contributionCalendar.weeks.map((w) =>
      w.contributionDays.reduce((sum, d) => sum + d.contributionCount, 0),
    ),
    currentStrength: Math.min(getStreak(user.contributionCalendar) / 30, 1.0),
    timeOfDay: getPeakHour(user.contributionCalendar),
    depth:
      accountAgeYears >= 5
        ? 'abyss'
        : accountAgeYears >= 3
          ? 'deep'
          : accountAgeYears >= 1
            ? 'mid'
            : 'shallow',
  }
}

function mapToAquariumData(
  user: GitHubUser,
  repos: GitHubRepo[],
): AquariumData {
  const fish = repos.map(repoToFish)
  const environment = userToEnvironment(user)

  return {
    user: {
      username: user.login,
      displayName: user.name,
      avatarUrl: user.avatarUrl,
      bio: user.bio,
      followers: user.followers,
      accountAge: yearsSince(user.createdAt),
    },
    fish,
    environment,
    stats: {
      totalFish: fish.length,
      aliveFish: fish.filter((f) => f.evolutionStage !== 'fossil').length,
      fossilFish: fish.filter((f) => f.evolutionStage === 'fossil').length,
      totalStars: fish.reduce((sum, f) => sum + f.stars, 0),
      languageDistribution: countByLanguage(fish),
      topLanguage: getTopLanguage(fish),
      largestFish:
        fish.reduce((max, f) => (f.size > (max?.size ?? 0) ? f : max), fish[0])
          ?.repoName ?? null,
    },
    generatedAt: new Date().toISOString(),
  }
}

export { repoToFish, userToEnvironment, mapToAquariumData }
```

```typescript
// src/lib/aquarium/evolution.ts
import type { EvolutionStage } from '@/types/fish'

function getEvolutionStage(
  totalCommits: number,
  stars: number,
  createdAt: string,
  lastCommitAt: string,
): EvolutionStage {
  const daysSinceLastCommit = daysBetween(new Date(lastCommitAt), new Date())
  const accountAgeYears = yearsBetween(new Date(createdAt), new Date())

  // 우선순위 순서대로 체크
  if (daysSinceLastCommit >= 180) return 'fossil'
  if (stars >= 1000) return 'legendary'
  if (totalCommits >= 200 && accountAgeYears >= 1) return 'elder'
  if (totalCommits >= 51) return 'adult'
  if (totalCommits >= 11) return 'juvenile'
  if (totalCommits >= 3) return 'fry'
  return 'egg'
}

export { getEvolutionStage }
```

```typescript
// src/lib/aquarium/species.ts
import type { FishSpecies } from '@/types/fish'
import { LANGUAGE_TO_SPECIES, SPECIES_CONFIGS } from '@/constants/species-map'

function getSpeciesForLanguage(language: string | null): FishSpecies {
  if (!language) return 'plankton'
  return (
    (LANGUAGE_TO_SPECIES as Record<string, FishSpecies>)[language] ?? 'plankton'
  )
}

function getSpeciesColor(species: FishSpecies): string {
  return SPECIES_CONFIGS[species].color
}

export { getSpeciesForLanguage, getSpeciesColor }
```

**검증:**

```bash
pnpm test -- mapper evolution species
# 경계값 테스트:
# - 커밋 0 → egg, 2 → egg, 3 → fry, 10 → fry, 11 → juvenile
# - 180일 비활성 → fossil
# - 스타 999 → adult/elder, 1000 → legendary
# - 언어 null → plankton
# - 알 수 없는 언어 → plankton
```

##### P1-07: Fish 컴포넌트 (구체 플레이스홀더)

**파일:** `src/engine/fish/Fish.tsx`

**구현 상세:**

```typescript
'use client'

import { useRef, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import type { Mesh } from 'three'
import type { FishData } from '@/types/fish'

interface FishProps {
  data: FishData
  initialPosition: [number, number, number]
}

function Fish({ data, initialPosition }: FishProps) {
  const meshRef = useRef<Mesh>(null)
  const time = useRef(Math.random() * 100)

  const color = useMemo(() => data.color, [data.color])
  const isFossil = data.evolutionStage === 'fossil'

  useFrame((_, delta) => {
    if (!meshRef.current || isFossil) return
    time.current += delta * data.swimSpeed

    // 간단한 사인파 수영
    meshRef.current.position.x = initialPosition[0] + Math.sin(time.current * 0.5) * 3
    meshRef.current.position.y = initialPosition[1] + Math.sin(time.current * 0.7) * 0.5
    meshRef.current.position.z = initialPosition[2] + Math.cos(time.current * 0.3) * 2

    // 꼬리 흔들기 (스케일 변형)
    meshRef.current.scale.x = data.size * (1 + Math.sin(time.current * 4) * 0.05)
  })

  return (
    <mesh
      ref={meshRef}
      position={initialPosition}
    >
      <sphereGeometry args={[data.size * 0.3, 16, 16]} />
      <meshStandardMaterial
        color={isFossil ? '#666666' : color}
        transparent={data.evolutionStage === 'fry'}
        opacity={data.evolutionStage === 'fry' ? 0.7 : 1}
        emissive={data.hasReadme ? color : '#000000'}
        emissiveIntensity={data.hasReadme ? 0.1 : 0}
      />
    </mesh>
  )
}

export { Fish }
```

**검증:**

```bash
pnpm dev
# 구체가 렌더링되고 사인파로 움직이는지 확인
```

##### P1-09: 환경 — 지형 + 바위 + 해초

**파일 (생성):**

- `src/engine/environment/Terrain.tsx`
- `src/engine/scene/Environment.tsx`

**구현 상세:**

- Terrain: PlaneGeometry + 버텍스 높이 변형으로 해저 지형
- 바위: 여러 개의 DodecahedronGeometry 랜덤 배치
- 해초: 얇은 CylinderGeometry, useFrame으로 vertex shader 흔들림
- Environment 컴포넌트가 Terrain + 바위 + 해초를 조합

##### P1-10: 버블 + 파티클 시스템

**파일:** `src/engine/environment/Bubbles.tsx`

**구현 상세:**

- InstancedMesh로 버블 렌더링 (SphereGeometry, 투명)
- 각 버블: 아래에서 위로 상승, 약간의 좌우 드리프트
- 상단 도달 시 하단으로 리사이클
- 버블 수: 데스크탑 50개, 모바일 20개

---

#### Batch 1-3: API 라우트 + 테스트 + 코스틱 (3개, 혼합)

##### P1-04: Aquarium API 라우트

**파일:** `src/app/api/aquarium/[username]/route.ts`

**구현 상세:**

```typescript
import { NextResponse } from 'next/server'
import { z } from 'zod'
import { fetchGitHubUser, fetchAllRepos } from '@/lib/github/client'
import { mapToAquariumData } from '@/lib/aquarium/mapper'
import { getCached, setCached, CACHE_KEYS, CACHE_TTL } from '@/lib/cache/redis'
import type { AquariumData } from '@/types/aquarium'

const paramsSchema = z.object({
  username: z
    .string()
    .min(1)
    .max(39)
    .regex(/^[a-zA-Z0-9](?:[a-zA-Z0-9-]*[a-zA-Z0-9])?$/),
})

export async function GET(
  request: Request,
  { params }: { params: { username: string } },
): Promise<NextResponse> {
  // 1. 입력 검증
  const parsed = paramsSchema.safeParse(params)
  if (!parsed.success) {
    return NextResponse.json({ error: 'Invalid username' }, { status: 400 })
  }
  const { username } = parsed.data

  // 2. 캐시 확인
  const cached = await getCached<AquariumData>(CACHE_KEYS.aquarium(username))
  if (cached) {
    return NextResponse.json(cached.data, {
      headers: { 'X-Cache': 'HIT' },
    })
  }

  // 3. GitHub API 호출
  try {
    const user = await fetchGitHubUser(username)
    const repos = await fetchAllRepos(username)
    const data = mapToAquariumData(user, repos)

    // 4. 캐시 저장
    await setCached(CACHE_KEYS.aquarium(username), data, {
      ttl: CACHE_TTL.AQUARIUM,
    })

    return NextResponse.json(data, {
      headers: { 'X-Cache': 'MISS' },
    })
  } catch (error) {
    if (error instanceof GitHubError) {
      const statusMap = {
        USER_NOT_FOUND: 404,
        RATE_LIMITED: 429,
        UNAUTHORIZED: 500,
        SERVER_ERROR: 500,
      }
      return NextResponse.json(
        { error: error.code },
        { status: statusMap[error.code] },
      )
    }
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 },
    )
  }
}
```

**검증:**

```bash
curl http://localhost:3000/api/aquarium/chamdom | jq .
curl http://localhost:3000/api/aquarium/nonexistent-user-12345  # 404
curl http://localhost:3000/api/aquarium/a  # 정상 (1글자 유저네임)
```

##### P1-05: 매퍼/진화/종 유닛 테스트

**파일 (생성):**

- `tests/unit/mapper.test.ts`
- `tests/unit/evolution.test.ts`
- `tests/unit/species.test.ts`

**테스트 케이스:**

```typescript
// tests/unit/evolution.test.ts
describe('getEvolutionStage', () => {
  it('should return egg for 0-2 commits', () => { ... })
  it('should return fry for 3-10 commits', () => { ... })
  it('should return juvenile for 11-50 commits', () => { ... })
  it('should return adult for 51-200 commits', () => { ... })
  it('should return elder for 200+ commits AND 1+ year', () => { ... })
  it('should return legendary for 1000+ stars', () => { ... })
  it('should return fossil for 180+ days inactive', () => { ... })
  it('should prioritize fossil over legendary', () => { ... })
  it('should prioritize legendary over elder', () => { ... })

  // 경계값
  it('should return egg at 2 commits', () => { ... })
  it('should return fry at 3 commits', () => { ... })
  it('should return adult at 200 commits without 1yr', () => { ... })
  it('should return elder at 200 commits with 1yr', () => { ... })
  it('should return fossil at exactly 180 days', () => { ... })
})
```

**검증:**

```bash
pnpm test -- evolution species mapper --coverage
# 커버리지 90%+ 확인
```

##### P1-11: 코스틱 라이팅 이펙트

**파일:** `src/engine/environment/Caustics.tsx`

**구현 상세:**

- 커스텀 셰이더로 코스틱 패턴 생성
- useFrame으로 시간 기반 애니메이션
- 지형 위에 프로젝션
- 성능: 간단한 noise 함수 사용 (GPU 부하 최소)

---

### Week 2: Fish 시스템 + 데이터 연동

#### Batch 1-4: 핵심 통합 (1개)

##### P1-12: FishGroup — API 데이터 → 3D 렌더링

**파일:** `src/engine/fish/FishGroup.tsx`

**구현 상세:**

```typescript
'use client'

import { useMemo } from 'react'
import { useAquariumStore } from '@/stores/aquarium-store'
import { Fish } from './Fish'

function FishGroup() {
  const fish = useAquariumStore((s) => s.data?.fish ?? [])

  const fishWithPositions = useMemo(() =>
    fish.map((f, i) => ({
      data: f,
      position: generateInitialPosition(i, fish.length) as [number, number, number],
    })),
    [fish],
  )

  return (
    <group>
      {fishWithPositions.map(({ data, position }) => (
        <Fish key={data.id} data={data} initialPosition={position} />
      ))}
    </group>
  )
}

// 경계 내 랜덤 분포 (물고기끼리 겹치지 않게)
function generateInitialPosition(
  index: number,
  total: number,
): [number, number, number] {
  const spread = Math.min(total * 0.5, 30)
  const angle = (index / total) * Math.PI * 2
  const radius = 3 + Math.random() * spread
  return [
    Math.cos(angle) * radius,
    1 + Math.random() * 6,        // y: 1~7 (해저 위)
    Math.sin(angle) * radius,
  ]
}

export { FishGroup }
```

**검증:**

```bash
pnpm dev
# /en/chamdom 접근 → 물고기들 렌더링 확인
# 물고기 수 = API 응답 레포 수 일치 확인
```

#### Batch 1-5: 행동 + 환경 통합 (5개, 병렬)

##### P1-13: Fish 자율 수영 행동

**파일:** `src/engine/fish/FishBehavior.ts` (생성), `Fish.tsx` (업데이트)

- 방향 전환: 3-8초마다 새 방향 선택
- 경계 회피: 벽에 가까워지면 반대 방향으로 선회
- 수직 보빙: 느린 사인파
- 부드러운 회전: lerp으로 현재 방향 → 목표 방향 보간
- 종별 패턴: swimPattern에 따라 다른 행동

##### P1-14: 화석 물고기

- 회색 (#666666), 해저 바닥에 위치 (y ≈ 0.5)
- 애니메이션 없음, 약간 기울어짐 (rotation.z = 0.3)
- 투명도 0.6

##### P1-15: 환경 데이터 연동

- 탱크 사이즈: environmentData.tankSize에 따라 경계 조절
- 밝기: ambientLight intensity = 0.2 + brightness \* 0.6
- 지형: terrainHeights 배열로 해저 높이 변형

##### P1-16: 플랑크톤 파티클

- 작은 빛나는 점 (PointsMaterial, size 0.02)
- 느린 부유 (랜덤 드리프트)
- 밀도: follower 수 기반 (50~500개)

##### P1-17: 수면 이펙트

- PlaneGeometry 상단 배치 (y = 10)
- 버텍스 셰이더로 물결 애니메이션
- 반투명 (opacity 0.3), 약간의 굴절 힌트

---

### Week 3: 인터랙션 + UI

#### Batch 1-6: 기반 인터랙션 + UI (4개, 병렬)

##### P1-18: 레이캐스팅 — 호버 하이라이트

- R3F의 `onPointerOver`/`onPointerOut` 이벤트
- 호버 시 emissive 강화, cursor: pointer
- aquariumStore.hoverFish(id) 호출

##### P1-21: 카메라 컨트롤

- drei의 `<OrbitControls>` 사용
- 줌: minDistance=5, maxDistance=50
- 회전: 수평 360°, 수직 제한 (10°~80°)
- 패닝: enablePan, 범위 제한
- 부드러운 댐핑: enableDamping, dampingFactor=0.05

##### P1-23: Stats HUD 오버레이

- 좌측 상단 HTML 오버레이
- 표시: 유저네임, alive/fossil 수, 총 스타, 언어 분포 태그
- Tailwind 스타일링, 반투명 배경
- Zustand 스토어 구독

##### P1-24: 랜딩 페이지

- 유저네임 입력 필드 + "DIVE" 버튼
- GitHub 유저네임 형식 검증 (1-39자, 영숫자/하이픈)
- 폼 제출 시 `/[locale]/[username]`으로 navigate
- i18n: next-intl useTranslations 사용

**인기 수족관 캐러셀 (PRD P1-F01 — social proof):**

- 최근 생성된 인기 수족관 미리보기를 자동 스크롤 캐러셀로 표시
- 각 카드: 유저 아바타, 유저네임, 물고기 수, 총 스타 수
- MVP: 하드코딩 5개 항목, 추후 Supabase에서 동적 로드
- 자동 재생 (3초 간격), 수동 dot 네비게이션 제공
- Framer Motion `AnimatePresence`로 슬라이드 전환

```typescript
// src/components/ui/AquariumCarousel.tsx
'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

interface CarouselItem {
  username: string
  avatarUrl: string
  fishCount: number
  totalStars: number
}

const FEATURED_AQUARIUMS: CarouselItem[] = [
  // MVP: 하드코딩, Phase 2에서 동적 로드로 교체
]

function AquariumCarousel() {
  const [index, setIndex] = useState(0)

  useEffect(() => {
    const timer = setInterval(() => {
      setIndex((i) => (i + 1) % FEATURED_AQUARIUMS.length)
    }, 3000)
    return () => clearInterval(timer)
  }, [])

  return (
    <div className="relative overflow-hidden">
      <AnimatePresence mode="wait">
        <motion.div
          key={index}
          initial={{ x: 100, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          exit={{ x: -100, opacity: 0 }}
          transition={{ duration: 0.3 }}
        >
          {/* 카드 내용 */}
        </motion.div>
      </AnimatePresence>
      {/* dot 네비게이션 */}
    </div>
  )
}

export { AquariumCarousel }
```

#### Batch 1-7: 세부 UI (4개, 병렬)

##### P1-19: 물고기 툴팁

- 3D 위치를 2D 스크린 좌표로 변환 (project)
- 호버된 물고기 위에 표시
- 내용: 레포 이름, 언어, 스타 수, 마지막 커밋
- 언호버 시 사라짐

##### P1-20: 물고기 디테일 패널

- 우측 슬라이드인 패널
- 내용: 레포 이름, 설명, 스타, 포크, 언어, 커밋 수, 진화 단계, GitHub 링크
- 닫기 버튼, ESC 키, 배경 클릭으로 닫기
- Framer Motion 슬라이드 애니메이션

##### P1-22: 카메라 패럴랙스

- idle 상태에서 마우스 위치에 따라 카메라 미세 이동
- OrbitControls 비활성 시에만 동작
- 이동량: x/y ±0.5 범위, lerp 보간

##### P1-27: API 통합 테스트

- MSW (Mock Service Worker)로 GitHub API mock
- 테스트: 정상 유저, 404, rate limit, 캐시 hit/miss, 100+ 레포

#### Batch 1-8: 페이지 통합 (3개, 순차)

##### P1-25: 수족관 페이지 (데이터 fetch + 씬 마운트)

**파일 (생성):**

- `src/app/[locale]/[username]/page.tsx`
- `src/app/[locale]/[username]/loading.tsx`
- `src/components/ui/DiveTransition.tsx`

**잠수 트랜지션 애니메이션 (PRD P1-F01):**

유저네임 입력 → 수족관 로드 시 수면 아래로 잠수하는 Framer Motion 전환 효과:

```typescript
// src/components/ui/DiveTransition.tsx
'use client'

import { motion, AnimatePresence } from 'framer-motion'

interface DiveTransitionProps {
  isVisible: boolean
}

function DiveTransition({ isVisible }: DiveTransitionProps) {
  return (
    <AnimatePresence>
      {isVisible && (
        <>
          {/* 수면 파문 — 화면 중앙에서 확산 */}
          <motion.div
            className="fixed inset-0 z-50 pointer-events-none"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            {/* 물 색상 오버레이 — 위에서 아래로 채워짐 */}
            <motion.div
              className="absolute inset-0 bg-background"
              initial={{ scaleY: 0, originY: 0 }}
              animate={{ scaleY: 1 }}
              transition={{ duration: 0.6, ease: 'easeIn' }}
            />
            {/* 수면 파문 원형 */}
            <motion.div
              className="absolute inset-0 flex items-center justify-center"
              initial={{ scale: 0, opacity: 1 }}
              animate={{ scale: 4, opacity: 0 }}
              transition={{ duration: 0.8, ease: 'easeOut' }}
            >
              <div className="w-32 h-32 rounded-full border-4 border-primary" />
            </motion.div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}

export { DiveTransition }
```

랜딩 페이지에서 DIVE 버튼 제출 시 `DiveTransition` 표시 후 navigate:

```typescript
// 랜딩 폼 핸들러
const handleDive = async (username: string) => {
  setDiving(true) // DiveTransition 표시
  await new Promise((r) => setTimeout(r, 600)) // 애니메이션 대기
  router.push(`/${locale}/${username}`)
}
```

```typescript
// src/app/[locale]/[username]/page.tsx
import { notFound } from 'next/navigation'
import { AquariumClient } from './aquarium-client'

export default async function AquariumPage({
  params,
}: {
  params: { locale: string; username: string }
}) {
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_APP_URL}/api/aquarium/${params.username}`,
    { next: { revalidate: 1800 } },
  )

  if (res.status === 404) notFound()
  if (!res.ok) throw new Error('Failed to fetch aquarium data')

  const data = await res.json()
  return <AquariumClient data={data} />
}

// 동적 메타데이터
export async function generateMetadata({ params }: { params: { username: string } }) {
  return {
    title: `${params.username}'s Aquarium | Git Aquarium`,
    description: `Explore ${params.username}'s GitHub repositories as a living 3D aquarium`,
    openGraph: {
      images: [`/api/og/${params.username}`],
    },
  }
}
```

##### P1-26: 모바일 반응형

- 터치: 드래그(회전), 핀치(줌)
- 모바일 물고기 수 제한: 최대 20마리 (나머지는 통계만)
- 파티클 감소: 50%
- FPS 모니터링: `useFrame` 내 fps 카운터, 30fps 미만 시 품질 자동 감소

##### P1-38: WebGL 폴백

- 4단계 감지: WebGL2 → WebGL1 → Canvas 2D → 정적 텍스트
- WebGL 미지원 시 수족관 통계 + 물고기 목록 텍스트 표시
- `src/engine/fallback/WebGLDetector.tsx`, `CanvasFallback.tsx`

---

### Week 4: 공유 + 배포 + 폴리시

#### Batch 1-9: 공유 + SEO (6개, 병렬)

##### P1-28: 동적 OG 이미지

```typescript
// src/app/api/og/[username]/route.tsx
import { ImageResponse } from '@vercel/og'

export async function GET(
  request: Request,
  { params }: { params: { username: string } },
) {
  const data = await fetchAquariumData(params.username)

  return new ImageResponse(
    (
      <div style={{
        width: '1200px', height: '630px',
        background: 'linear-gradient(180deg, #0a1628, #1a2744)',
        display: 'flex', flexDirection: 'column',
        padding: '60px', color: 'white',
      }}>
        <h1 style={{ fontSize: '48px' }}>🐠 {params.username}'s Aquarium</h1>
        <p style={{ fontSize: '24px' }}>
          {data.stats.aliveFish} fish | {data.stats.totalStars} ⭐ | {data.stats.topLanguage}
        </p>
      </div>
    ),
    { width: 1200, height: 630 },
  )
}
```

##### P1-29: 공유 버튼

- URL 클립보드 복사 + 토스트 "Copied!"
- Twitter/X 공유 텍스트: "Check out my GitHub aquarium! 🐠🌊"

##### P1-30: GIF/WebM 녹화 (클라이언트)

- MediaRecorder API + canvas.captureStream()
- 5초 루프 녹화 → WebM 다운로드
- 프로그레스 바 표시

##### P1-31: SEO 메타데이터

- 동적 title/description per user
- og:image, Twitter card
- JSON-LD (WebSite schema)

##### P1-39: 애널리틱스

PostHog 또는 Plausible 통합

**핵심 트래킹 이벤트 9종 (PRD 18.1):**

```typescript
// src/lib/analytics/events.ts
type AnalyticsEvents = {
  aquarium_created: {
    username: string
    fish_count: number
    load_time: number // ms
  }
  fish_clicked: {
    repo_name: string
    species: string
    evolution_stage: string
  }
  share_initiated: {
    method: 'url' | 'twitter' | 'gif'
  }
  share_completed: {
    method: 'url' | 'twitter' | 'gif'
    success: boolean
  }
  codex_opened: {
    completion_percent: number
  }
  comparison_created: {
    user1: string
    user2: string
  }
  session_duration: {
    seconds: number
    fish_hovered_count: number
  }
  fallback_triggered: {
    type: '2d' | 'static' | 'text'
  }
  error_occurred: {
    error_type: string
    context: string
  }
}

function track<K extends keyof AnalyticsEvents>(
  event: K,
  props: AnalyticsEvents[K],
): void {
  // PostHog: posthog.capture(event, props)
  // Plausible: plausible(event, { props })
}

export { track }
export type { AnalyticsEvents }
```

사용 예:

```typescript
// 수족관 생성 완료 시
track('aquarium_created', {
  username,
  fish_count: data.stats.totalFish,
  load_time: Date.now() - startTime,
})

// 물고기 클릭 시
track('fish_clicked', {
  repo_name: fish.repoName,
  species: fish.species,
  evolution_stage: fish.evolutionStage,
})

// WebGL 폴백 발동 시
track('fallback_triggered', { type: '2d' })
```

##### P1-40: 법적 페이지

- /privacy, /terms 정적 페이지 (EN/KO)
- GitHub API 데이터 사용 관련 고지

#### Batch 1-10: 에러 + 성능 + 접근성 (4개, 병렬)

##### P1-32: 에러 처리

- `not-found.tsx`: 수중 테마 404 페이지
- `error.tsx`: 3D 크래시 graceful 처리
- ErrorBoundary 래핑

##### P1-33: 렌더링 성능 최적화

**InstancedMesh (기존):**

- 물고기 40마리 이상 시 InstancedMesh로 전환
- 각 인스턴스: position, color, scale을 attribute로 관리
- useFrame에서 matrix 일괄 업데이트
- 벤치마크: 100마리 30fps 이상

**추가 최적화 기법 6종 (PRD 4.4):**

1. **LOD (Level of Detail):**
   - 원거리 물고기(카메라 거리 > 30) 폴리곤 70% 감소
   - `drei`의 `<Detailed>` 컴포넌트 활용
   - High: SphereGeometry(16,16), Medium: (8,8), Low: (4,4)

2. **Object Pooling:**
   - 기포(Bubbles), 파티클 GC 방지
   - 고정 크기 배열 사전 할당, 사용/미사용 인덱스 관리
   - 새 파티클 생성 대신 풀에서 재사용

   ```typescript
   // src/engine/effects/ObjectPool.ts
   class ObjectPool<T> {
     private pool: T[]
     private active: Set<T>

     constructor(factory: () => T, size: number) {
       this.pool = Array.from({ length: size }, factory)
       this.active = new Set()
     }

     acquire(): T | null {
       const item = this.pool.find((i) => !this.active.has(i))
       if (item) this.active.add(item)
       return item ?? null
     }

     release(item: T): void {
       this.active.delete(item)
     }
   }
   ```

3. **Frustum Culling:**
   - Three.js 기본 frustumCulled=true 유지 (기본값)
   - 커스텀 BoundingSphere를 물고기 크기 기반으로 명시 설정
   - `mesh.frustumCulled = true`, `mesh.geometry.computeBoundingSphere()`

4. **GPU 파티클 (플랑크톤, 별빛):**
   - `PointsMaterial` + `BufferGeometry`로 CPU 부하 제거
   - 위치 업데이트를 vertex shader에서 처리 (GLSL `uniform float uTime`)
   - CPU에서 매 프레임 position 배열 수정 금지

   ```glsl
   // 플랑크톤 vertex shader
   uniform float uTime;
   attribute float aOffset;
   void main() {
     vec3 pos = position;
     pos.y += sin(uTime * 0.3 + aOffset) * 0.1;
     pos.x += cos(uTime * 0.2 + aOffset) * 0.05;
     gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
   }
   ```

5. **Texture Atlas:**
   - 물고기 스킨 텍스처를 단일 atlas PNG(2048×2048)로 통합
   - 종별 UV 좌표 매핑 테이블 (`src/constants/texture-atlas.ts`)
   - 텍스처 바인딩 1회로 모든 종 렌더링

6. **추가: React Three Fiber 최적화:**
   - `frameloop="demand"`: 상태 변경 시에만 렌더링 (idle 시 GPU 절약)
   - Zustand subscribe로 R3F 내부 리렌더 방지 (기존 P1-08 참조)
   - `useMemo`로 geometry/material 재생성 방지

##### P1-37: 접근성

**기본 키보드 네비게이션:**

- Canvas에 aria-label
- Tab으로 물고기 탐색, Enter로 디테일 열기

**모션 감소 (PRD 11.2):**

`prefers-reduced-motion` 미디어 쿼리 감지 시 다음을 적용:

- 물고기 수영 → 정적 배치 (useFrame 중단)
- 기포 → 정적 점 (상승 애니메이션 제거)
- 카메라 패럴랙스 → 고정 (P1-22 비활성)
- 코스틱 → 정적 조명 (셰이더 시간 업데이트 중단)
- 수동 토글 버튼도 제공 (설정 패널 내)

```typescript
// src/lib/utils/reduced-motion.ts
import { useEffect, useState } from 'react'

function useReducedMotion(): boolean {
  const [reduced, setReduced] = useState(false)

  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)')
    setReduced(mq.matches)
    const handler = (e: MediaQueryListEvent) => setReduced(e.matches)
    mq.addEventListener('change', handler)
    return () => mq.removeEventListener('change', handler)
  }, [])

  return reduced
}

export { useReducedMotion }
```

uiStore에 수동 토글 추가:

```typescript
// src/stores/ui-store.ts 확장
interface UIState {
  // ...기존 필드
  reducedMotion: boolean
  toggleReducedMotion: () => void
}
```

**스크린리더 지원 (PRD 11.5):**

```typescript
// 3D 씬 Canvas
<canvas
  role="img"
  aria-label={`${username}의 Git Aquarium: 물고기 ${aliveFish}마리, 화석 ${fossilFish}마리, 총 스타 ${totalStars}개`}
/>

// 툴팁
<div role="tooltip" aria-live="polite">
  {tooltipContent}
</div>

// HUD — 시맨틱 HTML
<dl>
  <dt>살아있는 물고기</dt>
  <dd>{aliveFish}마리</dd>
  <dt>화석</dt>
  <dd>{fossilFish}마리</dd>
  <dt>총 스타</dt>
  <dd>{totalStars}개</dd>
</dl>

// 이벤트 피드
<div aria-live="polite" aria-atomic="false">
  {events.map((e) => <p key={e.id}>{e.message}</p>)}
</div>
```

##### P1-41: 색맹 모드

- 3종: protanopia, deuteranopia, tritanopia
- 물고기에 패턴 오버레이 (줄무늬, 점, 격자)
- localStorage에 설정 저장

#### Batch 1-11: 배포 (1개)

##### P1-34: Vercel 배포

- 환경변수 설정 (Vercel 대시보드)
- 빌드 확인, 프리뷰 배포 동작
- 커스텀 도메인 설정 (선택)

#### Batch 1-12: E2E 테스트 (1개)

##### P1-35: E2E 테스트

```typescript
// tests/e2e/aquarium.spec.ts
import { test, expect } from '@playwright/test'

test('landing page → input → aquarium loads', async ({ page }) => {
  await page.goto('/')
  await page.fill('[data-testid="username-input"]', 'chamdom')
  await page.click('[data-testid="dive-button"]')
  await expect(page).toHaveURL(/\/chamdom/)
  await expect(page.locator('canvas')).toBeVisible()
})

test('404 for nonexistent user', async ({ page }) => {
  await page.goto('/en/nonexistent-user-xyz-12345')
  await expect(page.locator('text=not found')).toBeVisible()
})

test('share button copies URL', async ({ page }) => {
  await page.goto('/en/chamdom')
  await page.click('[data-testid="share-button"]')
  // 클립보드 확인
})

test('mobile viewport', async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 812 })
  await page.goto('/en/chamdom')
  await expect(page.locator('canvas')).toBeVisible()
})
```

**검증:**

```bash
pnpm test:e2e
```

---

## 5. Quality Gate 체크리스트

### 기능

- [ ] 10개 GitHub 유저 테스트 → 수족관 렌더링 100%
- [ ] 물고기 수 = 레포 수 (정확 일치)
- [ ] 6개월+ 비활성 레포 → 화석 물고기 표시
- [ ] 공유 URL 동작 (`/{username}`)
- [ ] OG 이미지 생성 (유효 PNG)
- [ ] 랜딩 → 입력 → 수족관 전체 플로우

### 성능

- [ ] 데스크탑 55fps+ (30마리)
- [ ] 모바일 25fps+ (20마리)
- [ ] LCP < 3.0s
- [ ] TTI < 4.0s
- [ ] 100마리 스트레스 테스트 30fps+ (InstancedMesh)

### 테스트

- [ ] `lib/` 유닛 테스트 커버리지 80%+
- [ ] E2E 테스트 100% 통과
- [ ] `tsc --noEmit` 클린
- [ ] `eslint .` 클린

### 배포

- [ ] Vercel 프로덕션 배포 성공
- [ ] 환경변수 설정 완료
- [ ] 프리뷰 배포 동작

### i18n & 접근성

- [ ] EN/KO 라우트 동작
- [ ] 색맹 모드 토글 동작
- [ ] 키보드 네비게이션 동작
- [ ] `prefers-reduced-motion` 감지 시 수영/기포/패럴랙스/코스틱 정지 확인
- [ ] 수동 모션 토글 버튼 동작 확인
- [ ] Canvas `role="img"` + `aria-label` 포함 (물고기 수/화석 수/스타 수)
- [ ] HUD `<dl>/<dt>/<dd>` 시맨틱 마크업 적용
- [ ] 툴팁 `role="tooltip"` + `aria-live="polite"` 적용

### 성능 최적화

- [ ] LOD: 원거리 물고기 폴리곤 감소 (Detailed 컴포넌트 동작)
- [ ] Object Pooling: 버블/파티클 GC 방지 확인 (메모리 프로파일러)
- [ ] Frustum Culling: `frustumCulled=true` + BoundingSphere 설정 확인
- [ ] GPU 파티클: 플랑크톤 vertex shader CPU 업데이트 없음 확인
- [ ] Texture Atlas: 단일 텍스처 바인딩으로 모든 종 렌더링 확인

### Rate Limit & 캐싱

- [ ] ETag 저장 → 다음 요청 `If-None-Match` 전송 → 304 시 캐시 반환 확인
- [ ] `X-RateLimit-Remaining <= 100` 시 cache-only 모드 전환 확인
- [ ] 429 응답 시 `Retry-After` 헤더 기반 재시도 동작 확인
- [ ] 동시 GitHub API 요청 최대 10개 제한 확인 (p-limit)

### 애널리틱스

- [ ] 9종 이벤트 타입 (`aquarium_created`, `fish_clicked`, `share_initiated`, `share_completed`, `codex_opened`, `comparison_created`, `session_duration`, `fallback_triggered`, `error_occurred`) 트래킹 확인
- [ ] `fallback_triggered` 이벤트: WebGL 폴백 시 자동 발화 확인

### 랜딩 & 트랜지션

- [ ] 인기 수족관 캐러셀 3초 자동 재생 동작
- [ ] dot 네비게이션 수동 조작 동작
- [ ] DIVE 버튼 → 잠수 트랜지션 → 수족관 페이지 이동 플로우 확인
- [ ] `DiveTransition` 수면 파문 + 오버레이 애니메이션 600ms 내 완료

### 검증 명령어

```bash
pnpm check          # lint + format + typecheck
pnpm test           # unit + integration (coverage 확인)
pnpm test:e2e       # E2E
pnpm build          # 빌드 성공
```
