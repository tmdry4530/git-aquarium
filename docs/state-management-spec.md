# State Management Spec

Git Aquarium의 Zustand 기반 상태 관리 아키텍처를 정의합니다.

---

## 1. 개요

| 항목      | 선택                 | 이유                                   |
| --------- | -------------------- | -------------------------------------- |
| 상태 관리 | Zustand              | 경량, R3F 친화적, 불필요한 리렌더 방지 |
| 불변성    | immer 미들웨어       | 안전한 상태 업데이트                   |
| 개발 도구 | devtools 미들웨어    | Redux DevTools 연동                    |
| R3F 통합  | `useStore` subscribe | useFrame 내 구독, 리렌더 없음          |

### 스토어 구성

```
stores/
├── aquariumStore.ts    # 수족관 도메인 데이터
└── uiStore.ts          # UI 상태
```

---

## 2. aquariumStore

### 2.1 상태 정의

```typescript
// src/stores/aquariumStore.ts
import { create } from 'zustand'
import { immer } from 'zustand/middleware/immer'
import { devtools } from 'zustand/middleware'
import type {
  AquariumData,
  FishData,
  EnvironmentData,
  AquariumStats,
  AquariumUser,
} from '@/types/aquarium'

interface AquariumState {
  // 도메인 데이터
  fish: FishData[]
  environment: EnvironmentData | null
  user: AquariumUser | null
  stats: AquariumStats | null

  // 비동기 상태
  loading: boolean
  error: string | null

  // 선택 상태
  selectedFishId: string | null
}
```

### 2.2 Actions

```typescript
interface AquariumActions {
  // 전체 수족관 데이터 설정
  setAquariumData: (data: AquariumData) => void

  // 물고기 선택/해제
  selectFish: (fishId: string) => void
  deselectFish: () => void

  // 로딩/에러 상태
  setLoading: (loading: boolean) => void
  setError: (error: string | null) => void

  // 리셋
  resetAquarium: () => void
}
```

### 2.3 전체 스토어 구현

```typescript
// src/stores/aquariumStore.ts
import { create } from 'zustand'
import { immer } from 'zustand/middleware/immer'
import { devtools } from 'zustand/middleware'

const initialState: AquariumState = {
  fish: [],
  environment: null,
  user: null,
  stats: null,
  loading: false,
  error: null,
  selectedFishId: null,
}

export const useAquariumStore = create<AquariumState & AquariumActions>()(
  devtools(
    immer((set) => ({
      ...initialState,

      setAquariumData: (data) =>
        set((state) => {
          state.fish = data.fish
          state.environment = data.environment
          state.user = data.user
          state.stats = data.stats
          state.loading = false
          state.error = null
        }),

      selectFish: (fishId) =>
        set((state) => {
          state.selectedFishId = fishId
        }),

      deselectFish: () =>
        set((state) => {
          state.selectedFishId = null
        }),

      setLoading: (loading) =>
        set((state) => {
          state.loading = loading
        }),

      setError: (error) =>
        set((state) => {
          state.error = error
          state.loading = false
        }),

      resetAquarium: () => set(initialState),
    })),
    { name: 'AquariumStore' },
  ),
)
```

### 2.4 Selectors

```typescript
// src/stores/aquariumStore.ts (selectors 추가)

// 선택된 물고기 반환
export const useSelectedFish = () =>
  useAquariumStore(
    (state) => state.fish.find((f) => f.id === state.selectedFishId) ?? null,
  )

// 특정 종 물고기 필터
export const useFishBySpecies = (species: FishSpecies) =>
  useAquariumStore((state) => state.fish.filter((f) => f.species === species))

// 살아있는 물고기 (fossil 제외)
export const useAliveFish = () =>
  useAquariumStore((state) =>
    state.fish.filter((f) => f.evolutionStage !== 'fossil'),
  )

// 화석 물고기만
export const useFossilFish = () =>
  useAquariumStore((state) =>
    state.fish.filter((f) => f.evolutionStage === 'fossil'),
  )

// 레전더리 물고기
export const useLegendaryFish = () =>
  useAquariumStore((state) =>
    state.fish.filter((f) => f.evolutionStage === 'legendary'),
  )

// 통계
export const useAquariumStats = () => useAquariumStore((state) => state.stats)

// 로딩/에러
export const useAquariumLoading = () =>
  useAquariumStore((state) => state.loading)

export const useAquariumError = () => useAquariumStore((state) => state.error)
```

---

## 3. uiStore

### 3.1 상태 정의

```typescript
// src/stores/uiStore.ts

type CameraMode = 'overview' | 'focus' | 'cinematic'

interface TooltipData {
  fishId: string
  x: number
  y: number
}

interface UIState {
  // 툴팁
  tooltipData: TooltipData | null

  // 물고기 상세 패널
  detailPanelOpen: boolean

  // 카메라 모드
  cameraMode: CameraMode

  // 설정 모달
  settingsOpen: boolean
}
```

### 3.2 전체 스토어 구현

```typescript
// src/stores/uiStore.ts
import { create } from 'zustand'
import { devtools } from 'zustand/middleware'

interface UIActions {
  showTooltip: (data: TooltipData) => void
  hideTooltip: () => void
  openDetailPanel: () => void
  closeDetailPanel: () => void
  setCameraMode: (mode: CameraMode) => void
  openSettings: () => void
  closeSettings: () => void
}

export const useUIStore = create<UIState & UIActions>()(
  devtools(
    (set) => ({
      // 초기 상태
      tooltipData: null,
      detailPanelOpen: false,
      cameraMode: 'overview',
      settingsOpen: false,

      // Actions
      showTooltip: (data) => set({ tooltipData: data }),
      hideTooltip: () => set({ tooltipData: null }),
      openDetailPanel: () => set({ detailPanelOpen: true }),
      closeDetailPanel: () => set({ detailPanelOpen: false }),
      setCameraMode: (mode) => set({ cameraMode: mode }),
      openSettings: () => set({ settingsOpen: true }),
      closeSettings: () => set({ settingsOpen: false }),
    }),
    { name: 'UIStore' },
  ),
)
```

---

## 4. R3F 통합 (useFrame 구독)

`useFrame` 내에서 Zustand를 구독할 때 `subscribe`를 사용하면 리렌더 없이 최신 상태를 읽을 수 있습니다.

### 4.1 useFrame 내 subscribe 패턴

```typescript
// src/engine/fish/Fish.tsx
import { useRef, useEffect } from 'react'
import { useFrame } from '@react-three/fiber'
import { useAquariumStore } from '@/stores/aquariumStore'

export function FishScene() {
  const meshRef = useRef<THREE.Mesh>(null)

  // subscribe: 리렌더 없이 최신 selectedFishId 읽기
  const selectedFishIdRef = useRef<string | null>(null)

  useEffect(() => {
    // 스토어 구독 (컴포넌트 리렌더 없음)
    const unsubscribe = useAquariumStore.subscribe(
      (state) => state.selectedFishId,
      (selectedFishId) => {
        selectedFishIdRef.current = selectedFishId
      },
    )

    return unsubscribe
  }, [])

  useFrame((state, delta) => {
    if (!meshRef.current) return

    // 구독된 최신 값 사용 (리렌더 없음)
    const isSelected = selectedFishIdRef.current === 'my-fish-id'

    if (isSelected) {
      // 선택된 물고기 하이라이트
      meshRef.current.scale.setScalar(1.2)
    }
  })

  return <mesh ref={meshRef}>...</mesh>
}
```

### 4.2 getState 패턴 (최신 스냅샷)

```typescript
// useFrame 내에서 일회성으로 최신 상태 읽기
useFrame(() => {
  // getState()는 항상 최신 상태 반환, 구독 불필요
  const { fish, environment } = useAquariumStore.getState()

  // 물고기 위치 업데이트 등
  fish.forEach((f, i) => {
    updateFishAnimation(f, i)
  })
})
```

### 4.3 어디서 무엇을 쓸지

| 패턴                           | 사용 시점               | 리렌더 |
| ------------------------------ | ----------------------- | ------ |
| `useAquariumStore(selector)`   | React 컴포넌트 (UI)     | 있음   |
| `useAquariumStore.subscribe()` | useEffect + useFrame    | 없음   |
| `useAquariumStore.getState()`  | useFrame 내 일회성 읽기 | 없음   |

---

## 5. immer 미들웨어

immer를 사용하면 불변 업데이트를 직접 변이(mutation) 문법으로 작성할 수 있습니다.

```typescript
// immer 없이 (verbose)
set((state) => ({
  ...state,
  fish: state.fish.map((f) =>
    f.id === fishId ? { ...f, stars: f.stars + 1 } : f,
  ),
}))

// immer 사용 (직관적)
set((state) => {
  const fish = state.fish.find((f) => f.id === fishId)
  if (fish) {
    fish.stars += 1 // 직접 변이 (immer가 불변 처리)
  }
})
```

---

## 6. devtools 미들웨어

개발 환경에서 Redux DevTools로 상태 추적:

```typescript
// 개발 환경에서만 devtools 활성화
const withDevtools =
  process.env.NODE_ENV === 'development' ? devtools : (fn: unknown) => fn

export const useAquariumStore = create<AquariumState & AquariumActions>()(
  withDevtools(
    immer((set) => ({
      /* ... */
    })),
    { name: 'AquariumStore', enabled: process.env.NODE_ENV === 'development' },
  ),
)
```

**Redux DevTools 기능:**

- 타임 트래블 디버깅
- 액션 히스토리
- 상태 diff 보기
- 상태 내보내기/가져오기

---

## 7. 데이터 흐름

```
서버 (Server Component)
    ↓ fetch /api/aquarium/{username}
API Route (src/app/api/aquarium/[username]/route.ts)
    ↓ AquariumData
클라이언트 (Client Component)
    ↓ setAquariumData(data)
aquariumStore
    ↓ useAquariumStore(selector)  →  React UI 컴포넌트 (리렌더 O)
    ↓ subscribe / getState       →  R3F useFrame (리렌더 X)
```

---

## 8. 스토어 초기화 패턴

서버에서 받은 데이터를 클라이언트 스토어에 주입:

```typescript
// src/app/[locale]/[username]/AquariumInitializer.tsx
'use client'

import { useEffect } from 'react'
import { useAquariumStore } from '@/stores/aquariumStore'
import type { AquariumData } from '@/types/aquarium'

interface Props {
  initialData: AquariumData
}

export function AquariumInitializer({ initialData }: Props) {
  const setAquariumData = useAquariumStore((s) => s.setAquariumData)

  useEffect(() => {
    setAquariumData(initialData)
  }, [initialData, setAquariumData])

  return null
}
```

```typescript
// src/app/[locale]/[username]/page.tsx (Server Component)
import { AquariumInitializer } from './AquariumInitializer'
import { AquariumScene } from '@/engine/scene/AquariumScene'

export default async function AquariumPage({ params }) {
  // 서버에서 데이터 페치
  const data = await fetchAquariumData(params.username)

  return (
    <>
      <AquariumInitializer initialData={data} />
      <AquariumScene />
    </>
  )
}
```

---

## 9. 타입 안전성

```typescript
// 스토어 타입 내보내기
export type AquariumStore = AquariumState & AquariumActions
export type UIStore = UIState & UIActions

// 선택자 타입 추론
type SelectedFish = ReturnType<typeof useSelectedFish>
// → FishData | null
```
