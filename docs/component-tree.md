# Component Tree

Git Aquarium의 전체 컴포넌트 계층, 데이터 흐름, 라우트 구조를 정의합니다.

---

## 1. 라우트 구조

```
src/app/
├── layout.tsx                          # 루트 레이아웃 (폰트, 전역 CSS)
│
├── [locale]/                           # i18n 라우트 (en | ko)
│   ├── layout.tsx                      # 로케일 레이아웃 (next-intl Provider)
│   │
│   ├── (landing)/                      # 랜딩 페이지 그룹
│   │   └── page.tsx                    # / → 랜딩 (유저명 입력)
│   │
│   └── [username]/                     # 수족관 페이지
│       └── page.tsx                    # /{username} → 수족관
│
└── api/
    └── aquarium/
        └── [username]/
            └── route.ts                # GET /api/aquarium/{username}
```

**라우트 예시:**

- `/` → `/en` (리디렉션, 브라우저 언어 감지)
- `/en` → 영어 랜딩
- `/ko` → 한국어 랜딩
- `/en/torvalds` → torvalds 수족관 (영어)
- `/ko/torvalds` → torvalds 수족관 (한국어)
- `/api/aquarium/torvalds` → JSON 데이터 API

---

## 2. 전체 컴포넌트 계층

### Server / Client 구분 범례

- **[S]** = Server Component (기본값)
- **[C]** = Client Component (`'use client'`)

```
RootLayout [S]
├── html, body
└── [locale]/layout.tsx [S]
    └── NextIntlClientProvider [C]
        ├── (landing)/page.tsx [S]
        │   └── LandingPage [S]
        │       ├── HeroSection [S]
        │       │   ├── Logo [S]
        │       │   ├── Tagline [S]
        │       │   └── UsernameInput [C]         # 입력 + 라우팅
        │       └── RecentAquariums [S]
        │           └── AquariumCard [S]          × N
        │
        └── [username]/page.tsx [S]
            ├── AquariumInitializer [C]            # 스토어 초기화
            └── AquariumPageLayout [C]
                ├── AquariumScene [C]              # 3D 씬 (메인)
                │   └── Canvas [C]
                │       ├── PerspectiveCamera [C]
                │       ├── OrbitControls [C]
                │       ├── AquariumLighting [C]
                │       ├── fog [C]
                │       ├── Suspense
                │       │   ├── Environment [C]
                │       │   │   ├── OceanFloor [C]
                │       │   │   ├── Seaweed [C]
                │       │   │   ├── Bubbles [C]
                │       │   │   ├── Particles [C]
                │       │   │   ├── Water [C]
                │       │   │   └── Caustics [C]
                │       │   └── FishGroup [C]
                │       │       └── Fish [C]  × N
                │       └── EffectComposer [C]
                │           ├── Bloom [C]
                │           └── Vignette [C]
                │
                └── HUD [C]                        # UI 오버레이 레이어
                    ├── UserCard [C]               # 유저 프로필
                    ├── StatsPanel [C]             # 수족관 통계
                    ├── FishTooltip [C]            # 물고기 호버 툴팁
                    ├── FishDetailPanel [C]        # 물고기 상세 패널
                    ├── LanguageLegend [C]         # 언어 범례
                    └── SettingsPanel [C]          # 설정
```

---

## 3. 컴포넌트 상세

### 3.1 LandingPage

```typescript
// src/app/[locale]/(landing)/page.tsx [S]
export default async function LandingPage() {
  return (
    <main>
      <HeroSection />
      <RecentAquariums />
    </main>
  )
}
```

### 3.2 UsernameInput

```typescript
// src/components/ui/UsernameInput.tsx [C]
'use client'

interface UsernameInputProps {
  // 없음 (자체 라우팅)
}

// 역할: 유저명 입력 → /{locale}/{username} 라우팅
export function UsernameInput() {
  const router = useRouter()
  const [username, setUsername] = useState('')

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault()
    if (username.trim()) {
      router.push(`/${username.trim()}`)
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <input value={username} onChange={(e) => setUsername(e.target.value)} />
      <button type="submit">DIVE</button>
    </form>
  )
}
```

### 3.3 AquariumScene

```typescript
// src/engine/scene/AquariumScene.tsx [C]
'use client'

// 역할: R3F Canvas 루트, 3D 씬 전체 관리
export function AquariumScene() {
  return (
    <Canvas
      camera={{ fov: 60, position: [0, 2, 10] }}
      gl={{ antialias: true, alpha: false }}
      dpr={[1, 2]}  // 디바이스 픽셀 비율 상한
    >
      <AquariumCamera />
      <AquariumControls />
      <AquariumLighting />
      <fog attach="fog" args={['#031528', 10, 50]} />
      <Suspense fallback={<FallbackScene />}>
        <Environment />
        <FishGroup />
      </Suspense>
      <AquariumPostProcessing />
    </Canvas>
  )
}
```

### 3.4 Fish

```typescript
// src/engine/fish/Fish.tsx [C]
interface FishProps {
  data: FishData
  onClick: (fish: FishData) => void
}

// 역할: 단일 물고기 3D 메시 + 인터랙션
```

### 3.5 HUD

```typescript
// src/components/ui/HUD.tsx [C]
// 역할: 3D Canvas 위에 절대 위치로 오버레이된 UI 레이어
// 구성: position: fixed, z-index: 100

interface HUDProps {
  // Zustand에서 직접 읽음
}
```

### 3.6 FishDetailPanel

```typescript
// src/components/ui/FishDetailPanel.tsx [C]
// 역할: 선택된 물고기의 레포 상세 정보 표시
// 트리거: Fish 클릭 → selectFish() → selectedFishId → useSelectedFish()
```

---

## 4. Props 흐름

```
서버에서 받은 AquariumData
         ↓
   AquariumInitializer
         ↓ setAquariumData()
   aquariumStore (Zustand)
         ↓
   ┌─────┴─────┐
   ↓           ↓
FishGroup    HUD
(useFrame)   (useAquariumStore)
   ↓           ↓
Fish ×N     UserCard
            StatsPanel
            FishDetailPanel
```

**Props 전달 원칙:**

- 3D 씬: Zustand `getState()` / `subscribe()` 사용 (리렌더 방지)
- UI HUD: Zustand `useAquariumStore(selector)` 사용
- 서버 데이터는 Server Component에서 직접 props로 전달 (hydration)

---

## 5. 데이터 흐름

```
1. URL 접근: /en/torvalds
          ↓
2. [Server] page.tsx
   - fetchAquariumData('torvalds') 호출
   - GitHub API → 데이터 변환 → AquariumData 생성
          ↓
3. [Server → Client] AquariumInitializer props
   - initialData: AquariumData
          ↓
4. [Client] AquariumInitializer useEffect
   - setAquariumData(initialData) 호출
          ↓
5. [Zustand] aquariumStore 업데이트
   - fish[], environment, user, stats 저장
          ↓
6. [분기]
   ├── [UI] HUD 컴포넌트들이 useAquariumStore()로 구독 → 리렌더
   └── [3D] FishGroup이 subscribe/getState로 읽기 → 리렌더 없음
```

---

## 6. API 라우트

### GET /api/aquarium/[username]

```typescript
// src/app/api/aquarium/[username]/route.ts [S]

export async function GET(
  request: Request,
  { params }: { params: { username: string } },
) {
  try {
    // 1. 캐시 확인 (Upstash Redis)
    const cached = await redis.get(`aquarium:${params.username}`)
    if (cached) return Response.json(cached)

    // 2. GitHub API 호출
    const githubData = await fetchGitHubData(params.username)

    // 3. 수족관 데이터 변환
    const aquariumData = transformToAquarium(githubData)

    // 4. 캐시 저장 (30분)
    await redis.set(`aquarium:${params.username}`, aquariumData, { ex: 1800 })

    return Response.json(aquariumData)
  } catch (error) {
    if (error instanceof GitHubNotFoundError) {
      return Response.json({ error: 'USER_NOT_FOUND' }, { status: 404 })
    }
    return Response.json({ error: 'INTERNAL_ERROR' }, { status: 500 })
  }
}
```

---

## 7. 의존성 그래프

```
aquariumStore ←── AquariumInitializer
      ↑                    ↑
  FishGroup            page.tsx [S]
  UserCard               ↑
  StatsPanel         fetchAquariumData
  FishDetailPanel        ↑
                   GitHub API + transformer

uiStore ←── FishTooltip
    ↑   ←── FishDetailPanel
    └── ←── Fish (클릭 이벤트)
```

---

## 8. 코드 분할 전략

```typescript
// 3D 씬은 동적 임포트 (SSR 불가)
const AquariumScene = dynamic(
  () => import('@/engine/scene/AquariumScene').then((m) => m.AquariumScene),
  {
    ssr: false,
    loading: () => <AquariumSkeleton />,
  },
)
```

**이유:** Three.js / R3F는 `window`, `WebGL` 등 브라우저 API 필요 → SSR 불가

---

## 9. 컴포넌트 파일 위치

```
src/
├── app/
│   ├── [locale]/
│   │   ├── (landing)/page.tsx
│   │   └── [username]/page.tsx
│   └── api/aquarium/[username]/route.ts
│
├── engine/                        # 3D 전용 (Three.js / R3F)
│   ├── scene/
│   │   ├── AquariumScene.tsx
│   │   ├── Camera.tsx
│   │   ├── Controls.tsx
│   │   ├── Lighting.tsx
│   │   └── PostProcessing.tsx
│   ├── fish/
│   │   ├── Fish.tsx
│   │   ├── FishGroup.tsx
│   │   └── swim-patterns.ts
│   └── environment/
│       ├── OceanFloor.tsx
│       ├── Seaweed.tsx
│       ├── Bubbles.tsx
│       └── Caustics.tsx
│
└── components/                    # UI 전용 (React DOM)
    ├── ui/
    │   ├── HUD.tsx
    │   ├── UserCard.tsx
    │   ├── StatsPanel.tsx
    │   ├── FishTooltip.tsx
    │   ├── FishDetailPanel.tsx
    │   ├── LanguageLegend.tsx
    │   ├── UsernameInput.tsx
    │   └── SettingsPanel.tsx
    └── layout/
        ├── LandingLayout.tsx
        └── AquariumLayout.tsx
```
