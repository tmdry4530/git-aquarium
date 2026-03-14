# Phase 0: 프로젝트 셋업 & 레퍼런스 문서 (2주)

## 1. 개요

**목표:** Next.js 15 프로젝트 스캐폴딩, 9개 레퍼런스 문서 작성, 개발 컨벤션 확립
**기간:** 2주
**태스크 수:** 16개 | **실행 배치:** 5개
**전제조건:** 없음 (첫 페이즈)

---

## 2. 환경 사전조건

```bash
# 필수 설치
node --version   # v22.x LTS
pnpm --version   # v9.x
git --version    # 2.x+

# 선택 (Phase 1에서 필요)
# GitHub PAT, Upstash Redis, Supabase 계정은 Phase 0에서 .env.example에 명시만
```

---

## 3. 실행 배치

### Batch 0-1: 프로젝트 초기화 (1개, 순차 — 최우선)

#### P0-01: Next.js 15 프로젝트 초기화

**목적:** 모든 후속 작업의 기반이 되는 프로젝트 스캐폴딩

**파일 (생성):**

- `package.json`
- `next.config.ts`
- `tsconfig.json`
- `tailwind.config.ts`
- `postcss.config.mjs`
- `eslint.config.mjs`
- `.prettierrc`
- `.gitignore`
- `.env.example`
- `src/app/layout.tsx`
- `src/app/globals.css`
- `src/app/page.tsx`

**구현 상세:**

1. 프로젝트 생성:

```bash
pnpm create next-app@latest git-aquarium --ts --tailwind --eslint --app --src-dir --import-alias "@/*"
```

2. `tsconfig.json` 강화:

```json
{
  "compilerOptions": {
    "strict": true,
    "noUncheckedIndexedAccess": true,
    "forceConsistentCasingInFileNames": true,
    "paths": { "@/*": ["./src/*"] }
  }
}
```

3. `eslint.config.mjs` (ESLint 9 flat config):

```javascript
import { FlatCompat } from '@eslint/eslintrc'
import tseslint from 'typescript-eslint'
import reactPlugin from 'eslint-plugin-react'
import reactHooksPlugin from 'eslint-plugin-react-hooks'

export default tseslint.config(...tseslint.configs.strictTypeChecked, {
  rules: {
    '@typescript-eslint/no-explicit-any': 'error',
    '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
    'no-console': 'error',
    'react/no-danger': 'error',
  },
})
```

4. `.prettierrc`:

```json
{
  "singleQuote": true,
  "semi": false,
  "trailingComma": "all",
  "printWidth": 80,
  "tabWidth": 2
}
```

5. `tailwind.config.ts` (Tailwind CSS v4):

```typescript
import type { Config } from 'tailwindcss'

const config: Config = {
  content: ['./src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        ocean: {
          50: '#e6f4f9',
          100: '#cce9f3',
          200: '#99d3e7',
          300: '#66bddb',
          400: '#33a7cf',
          500: '#0091c3',
          600: '#00749c',
          700: '#005775',
          800: '#003a4e',
          900: '#0a1628',
          950: '#050b14',
        },
      },
    },
  },
}
export default config
```

6. `.env.example`:

```bash
# Server-only
GITHUB_TOKEN=ghp_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
GITHUB_CLIENT_ID=
GITHUB_CLIENT_SECRET=
UPSTASH_REDIS_REST_URL=
UPSTASH_REDIS_REST_TOKEN=
SUPABASE_URL=
SUPABASE_SERVICE_ROLE_KEY=
SENTRY_DSN=

# Client-accessible
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
```

7. 추가 패키지 설치:

```bash
pnpm add three @react-three/fiber @react-three/drei @react-three/postprocessing
pnpm add zustand immer
pnpm add framer-motion
pnpm add @upstash/redis
pnpm add @supabase/supabase-js
pnpm add @vercel/og
pnpm add zod
pnpm add next-intl
pnpm add -D @types/three
```

8. 폰트 설치/적용 (PRD 5.1):

`next/font/google`으로 Google Fonts 두 종 적용:

- **Orbitron**: 제목 (우주/사이버 느낌)
- **JetBrains Mono**: 본문/코드

```typescript
// src/app/layout.tsx
import { Orbitron, JetBrains_Mono } from 'next/font/google'

const orbitron = Orbitron({
  subsets: ['latin'],
  variable: '--font-orbitron',
  display: 'swap',
})

const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-jetbrains-mono',
  display: 'swap',
})

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${orbitron.variable} ${jetbrainsMono.variable}`}>
      <body>{children}</body>
    </html>
  )
}
```

`tailwind.config.ts` fontFamily 추가:

```typescript
theme: {
  extend: {
    fontFamily: {
      heading: ['var(--font-orbitron)', 'sans-serif'],
      mono: ['var(--font-jetbrains-mono)', 'monospace'],
    },
    // ... colors
  },
},
```

**검증:**

```bash
pnpm dev          # localhost:3000 정상 로드
pnpm build        # 빌드 성공
pnpm lint         # 에러 없음
npx tsc --noEmit  # 타입 에러 없음
```

---

### Batch 0-2: 인프라 + 기본 문서 (4개, 병렬)

#### P0-02: 테스팅 인프라 (Vitest + Playwright)

**파일 (생성):**

- `vitest.config.ts`
- `playwright.config.ts`
- `tests/unit/sample.test.ts`
- `tests/e2e/sample.spec.ts`

**구현 상세:**

```bash
pnpm add -D vitest @vitejs/plugin-react @testing-library/react @testing-library/jest-dom jsdom
pnpm add -D @playwright/test
pnpm add -D msw  # Mock Service Worker
```

```typescript
// vitest.config.ts
import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import { resolve } from 'path'

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    setupFiles: ['./tests/setup.ts'],
    include: ['tests/unit/**/*.test.ts', 'tests/integration/**/*.test.ts'],
    coverage: {
      provider: 'v8',
      include: ['src/lib/**'],
      thresholds: { lines: 80 },
    },
  },
  resolve: {
    alias: { '@': resolve(__dirname, './src') },
  },
})
```

```typescript
// playwright.config.ts
import { defineConfig, devices } from '@playwright/test'

export default defineConfig({
  testDir: './tests/e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  webServer: {
    command: 'pnpm dev',
    port: 3000,
    reuseExistingServer: !process.env.CI,
  },
  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
    { name: 'mobile', use: { ...devices['iPhone 12'] } },
  ],
})
```

`package.json` 스크립트 추가:

```json
{
  "scripts": {
    "test": "vitest run",
    "test:watch": "vitest",
    "test:coverage": "vitest run --coverage",
    "test:e2e": "playwright test",
    "test:e2e:ui": "playwright test --ui"
  }
}
```

**검증:**

```bash
pnpm test         # 샘플 테스트 통과
pnpm test:e2e     # Playwright 샘플 통과 (--headed로 확인)
```

#### P0-03: Husky + lint-staged

**파일 (생성):**

- `.husky/pre-commit`
- `package.json` lint-staged 설정 추가

**구현 상세:**

```bash
pnpm add -D husky lint-staged
pnpm exec husky init
```

```json
// package.json에 추가
{
  "lint-staged": {
    "*.{ts,tsx}": ["eslint --fix", "prettier --write"],
    "*.{json,md,css}": ["prettier --write"]
  }
}
```

```bash
# .husky/pre-commit
pnpm exec lint-staged
```

**검증:**

```bash
git add -A && git commit -m "test: verify husky hook"
# pre-commit 훅이 lint-staged 실행하는지 확인
```

#### P0-04: AGENTS.md / CLAUDE.md

**파일 (생성):**

- `AGENTS.md` (마스터 플랜 Section 1의 전체 내용)
- `CLAUDE.md` (AGENTS.md의 심볼릭 링크)

**구현 상세:**

- 마스터 플랜의 Section 1 "AGENTS.md — Shared Agent Context File" 내용을 그대로 사용
- 포함 섹션: Project Overview, Tech Stack, Architecture Decisions, Directory Structure, Coding Conventions, Forbidden Patterns, Required Patterns, Testing Conventions, Git Commit Format, Environment Variables

```bash
ln -s AGENTS.md CLAUDE.md
```

**검증:**

```bash
cat AGENTS.md | head -5   # 내용 확인
ls -la CLAUDE.md           # symlink 확인
```

#### P0-14: CI/CD GitHub Actions

**파일 (생성):**

- `.github/workflows/ci.yml`
- `.github/workflows/e2e.yml`
- `.github/workflows/visual-regression.yml`
- `.github/workflows/dependency-review.yml`

**구현 상세:**

```yaml
# .github/workflows/ci.yml
name: CI
on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main, develop]

jobs:
  lint-typecheck-test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v4
        with: { version: 9 }
      - uses: actions/setup-node@v4
        with: { node-version: 22, cache: 'pnpm' }
      - run: pnpm install --frozen-lockfile
      - run: pnpm lint
      - run: pnpm exec tsc --noEmit
      - run: pnpm test --coverage
      - run: pnpm build
```

```yaml
# .github/workflows/e2e.yml
name: E2E Tests
on:
  pull_request:
    branches: [main]

jobs:
  e2e:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v4
      - uses: actions/setup-node@v4
        with: { node-version: 22, cache: 'pnpm' }
      - run: pnpm install --frozen-lockfile
      - run: pnpm exec playwright install --with-deps
      - run: pnpm test:e2e
      - uses: actions/upload-artifact@v4
        if: failure()
        with:
          name: playwright-report
          path: playwright-report/
```

**검증:**

```bash
# YAML 구문 검증
npx yaml-lint .github/workflows/*.yml
```

---

### Batch 0-3: 레퍼런스 문서 Batch A (5개, 병렬)

#### P0-05: Design Tokens 문서 (D2)

**파일:** `docs/design-tokens.md`

**포함 내용:**

- 색상 팔레트: ocean 10단계, 종별 15색, 상태색 (alive/fossil/legendary)
- 타이포그래피: 폰트 패밀리 (Orbitron, JetBrains Mono), 크기 (xs~4xl)
- 스페이싱: 4px 기반 시스템 (0, 1, 2, 3, 4, 6, 8, 12, 16, 20, 24)
- 브레이크포인트: sm(640), md(768), lg(1024), xl(1280), 2xl(1536)
- 그림자, 라운딩, 트랜지션 타이밍

**PRD 5.1 정확한 컬러 팔레트 (tailwind.config.ts 및 design tokens에 반영):**

| 토큰         | HEX / 값                | 용도                            |
| ------------ | ----------------------- | ------------------------------- |
| `background` | `#031528`               | 심해 네이비, 씬 배경            |
| `primary`    | `#4FC3F7`               | 바다 시안, 주요 액션/하이라이트 |
| `accent`     | `#FFD54F`               | 별빛 골드, 강조/legendary       |
| `danger`     | `#FF6B6B`               | 산호 레드, 에러/경고            |
| `surface`    | `rgba(5, 15, 35, 0.85)` | 유리 패널, HUD/모달 배경        |

`tailwind.config.ts` 컬러 확장:

```typescript
colors: {
  background: '#031528',
  primary: '#4FC3F7',
  accent: '#FFD54F',
  danger: '#FF6B6B',
  surface: 'rgba(5, 15, 35, 0.85)',
  ocean: {
    50: '#e6f4f9',
    // ... (기존 10단계)
    900: '#0a1628',
    950: '#050b14',
  },
},
```

#### P0-06: GitHub API Spec 문서 (D3)

**파일:** `docs/github-api-spec.md`

**포함 내용:**

- REST 엔드포인트:
  - `GET /users/{username}` → 유저 프로필
  - `GET /users/{username}/repos?per_page=100&sort=updated` → 레포 목록
  - `GET /repos/{owner}/{repo}/commits?per_page=1` → 마지막 커밋
  - `GET /repos/{owner}/{repo}/languages` → 언어 비율
- GraphQL 쿼리 (단일 요청으로 유저+레포+컨트리뷰션):

```graphql
query ($username: String!) {
  user(login: $username) {
    login
    name
    avatarUrl
    bio
    followers {
      totalCount
    }
    following {
      totalCount
    }
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
    repositories(first: 100, orderBy: { field: UPDATED_AT, direction: DESC }) {
      nodes {
        name
        description
        url
        primaryLanguage {
          name
          color
        }
        stargazerCount
        forkCount
        issues(states: OPEN) {
          totalCount
        }
        licenseInfo {
          spdxId
        }
        object(expression: "HEAD:README.md") {
          ... on Blob {
            byteSize
          }
        }
        defaultBranchRef {
          target {
            ... on Commit {
              history {
                totalCount
              }
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
```

- Rate limit 전략: ETag 캐싱, X-RateLimit 헤더, exponential backoff
- 에러 시나리오: 404(유저 없음), 403(rate limit), 500(서버 에러)
- Cache TTL: 유저 데이터 1시간, 레포 데이터 30분, 컨트리뷰션 24시간

#### P0-07: 3D Scene Architecture 문서 (D8)

**파일:** `docs/3d-scene-architecture.md`

**포함 내용:**

- 성능 버짓: 60fps desktop / 30fps mobile
- Max draw calls: 50
- Max triangles: 100K (desktop), 30K (mobile)
- InstancedMesh 전환: 40+ 물고기
- 카메라: PerspectiveCamera, FOV 60, OrbitControls (제한)
- 라이팅: ambient(0.4) + directional(sun) + caustic shader
- 포스트프로세싱: bloom (발광), fog (깊이감)
- LOD: High(<20 fish), Medium(20-50), Low(50+)
- 모바일 적응: 파티클 감소, 간단한 셰이더
- R3F 컴포넌트 계층:

```
<Canvas>
  <PerspectiveCamera />
  <OrbitControls />
  <ambientLight />
  <directionalLight />
  <fog />
  <Suspense>
    <Environment>
      <Terrain />
      <Seaweed />
      <Bubbles />
      <Particles />
      <Water />
      <Caustics />
    </Environment>
    <FishGroup>
      <Fish /> (× N)
    </FishGroup>
  </Suspense>
  <PostProcessing>
    <Bloom />
  </PostProcessing>
</Canvas>
```

#### P0-15: i18n 설정 (next-intl + locale routing)

**파일 (생성):**

- `src/i18n/config.ts`
- `src/i18n/request.ts`
- `src/middleware.ts`
- `src/app/[locale]/layout.tsx`
- `src/app/[locale]/(landing)/page.tsx`
- `src/messages/en/common.json`
- `src/messages/ko/common.json`

**구현 상세:**

```typescript
// src/i18n/config.ts
export const locales = ['en', 'ko'] as const
export type Locale = (typeof locales)[number]
export const defaultLocale: Locale = 'en'
```

```typescript
// src/middleware.ts
import createMiddleware from 'next-intl/middleware'
import { locales, defaultLocale } from './i18n/config'

export default createMiddleware({
  locales,
  defaultLocale,
  localeDetection: true,
})

export const config = {
  matcher: ['/((?!api|_next|_vercel|.*\\..*).*)'],
}
```

```json
// src/messages/en/common.json
{
  "landing": {
    "title": "Git Aquarium",
    "subtitle": "Your GitHub repos, alive and swimming",
    "inputPlaceholder": "Enter GitHub username",
    "diveButton": "DIVE",
    "recentTitle": "Recent Aquariums"
  },
  "hud": {
    "alive": "Alive",
    "fossil": "Fossil",
    "stars": "Stars"
  }
}
```

```json
// src/messages/ko/common.json
{
  "landing": {
    "title": "깃 아쿠아리움",
    "subtitle": "당신의 GitHub 레포, 살아서 헤엄칩니다",
    "inputPlaceholder": "GitHub 유저네임 입력",
    "diveButton": "다이브",
    "recentTitle": "최근 수족관"
  },
  "hud": {
    "alive": "살아있는",
    "fossil": "화석",
    "stars": "스타"
  }
}
```

**검증:**

```bash
pnpm dev
# http://localhost:3000/en → 영어
# http://localhost:3000/ko → 한국어
# http://localhost:3000 → 브라우저 언어 감지 리디렉션
```

#### P0-16: 커뮤니티 문서

**파일 (생성):**

- `CONTRIBUTING.md`
- `CODE_OF_CONDUCT.md`
- `.github/ISSUE_TEMPLATE/bug_report.yml`
- `.github/ISSUE_TEMPLATE/feature_request.yml`
- `.github/ISSUE_TEMPLATE/fish_species_proposal.yml`
- `.github/PULL_REQUEST_TEMPLATE.md`

**구현 상세:**

- CONTRIBUTING: 셋업 가이드, 브랜치 전략, 커밋 컨벤션, PR 프로세스
- CODE_OF_CONDUCT: Contributor Covenant v2.1
- Issue templates: YAML 형식 (GitHub 폼 UI)
- PR template: 체크리스트 (테스트, 타입체크, 스크린샷)

**검증:**

```bash
# GitHub에 push 후 Issue/PR 템플릿 렌더링 확인
```

---

### Batch 0-4: 레퍼런스 문서 Batch B (4개, 병렬)

#### P0-08: Aquarium Data Schema 문서 (D4) + TypeScript 타입

**파일 (생성):**

- `docs/aquarium-data-schema.md`
- `src/types/aquarium.ts`
- `src/types/fish.ts`
- `src/types/github.ts`

**구현 상세 — TypeScript 타입:**

```typescript
// src/types/github.ts
interface GitHubUser {
  login: string
  name: string | null
  avatarUrl: string
  bio: string | null
  followers: number
  following: number
  createdAt: string
  contributionCalendar: ContributionCalendar
}

interface GitHubRepo {
  name: string
  description: string | null
  url: string
  language: string | null
  languageColor: string | null
  stars: number
  forks: number
  openIssues: number
  hasReadme: boolean
  license: string | null
  totalCommits: number
  lastPushedAt: string
  createdAt: string
}

interface ContributionCalendar {
  totalContributions: number
  weeks: ContributionWeek[]
}

interface ContributionWeek {
  contributionDays: ContributionDay[]
}

interface ContributionDay {
  contributionCount: number
  date: string
}
```

```typescript
// src/types/fish.ts
type FishSpecies =
  | 'angelfish' // JavaScript
  | 'manta' // TypeScript
  | 'turtle' // Python
  | 'pufferfish' // Rust
  | 'dolphin' // Go
  | 'squid' // Java
  | 'shark' // C/C++
  | 'seahorse' // Solidity
  | 'goldfish' // Ruby
  | 'flyingfish' // Swift
  | 'jellyfish' // Kotlin
  | 'coral' // HTML/CSS
  | 'shell' // Shell
  | 'seaweed' // Markdown
  | 'plankton' // 기타/Unknown

type EvolutionStage =
  | 'egg' // 커밋 0-2
  | 'fry' // 커밋 3-10
  | 'juvenile' // 커밋 11-50
  | 'adult' // 커밋 51-200
  | 'elder' // 커밋 200+ AND 1년+
  | 'legendary' // 스타 1000+ OR 특수 조건
  | 'fossil' // 180일+ 비활성

type SwimPattern =
  | 'linear'
  | 'float'
  | 'slow'
  | 'standard'
  | 'zigzag'
  | 'stationary'

interface FishData {
  id: string
  repoName: string
  repoUrl: string
  description: string | null
  species: FishSpecies
  evolutionStage: EvolutionStage
  color: string // hex
  size: number // 0.5 ~ 3.0
  swimSpeed: number // 0.0 ~ 2.0
  swimPattern: SwimPattern
  stars: number
  forks: number
  openIssues: number
  hasReadme: boolean
  hasLicense: boolean
  language: string | null
  lastCommitAt: string
  totalCommits: number
  commitsLast30Days: number
  createdAt: string
}
```

```typescript
// src/types/aquarium.ts
interface AquariumData {
  user: AquariumUser
  fish: FishData[]
  environment: EnvironmentData
  stats: AquariumStats
  generatedAt: string
}

interface AquariumUser {
  username: string
  displayName: string | null
  avatarUrl: string
  bio: string | null
  followers: number
  accountAge: number // 년 단위
}

interface EnvironmentData {
  tankSize: 'small' | 'medium' | 'large' | 'vast'
  brightness: number // 0.0 ~ 1.0 (팔로워 기반)
  terrainHeights: number[] // 52주 컨트리뷰션 → 높이 배열
  currentStrength: number // 해류 강도 (streak 기반)
  timeOfDay: 'dawn' | 'day' | 'dusk' | 'night'
  depth: 'shallow' | 'mid' | 'deep' | 'abyss'
}

interface AquariumStats {
  totalFish: number
  aliveFish: number
  fossilFish: number
  totalStars: number
  languageDistribution: Record<string, number>
  topLanguage: string | null
  largestFish: string | null // repo name
}
```

#### P0-09: Fish Species Mapping Table 문서 (D5) + species-map.ts

**파일 (생성):**

- `docs/fish-species-map.md`
- `src/constants/species-map.ts`

**구현 상세:**

```typescript
// src/constants/species-map.ts
import type { FishSpecies, SwimPattern } from '@/types/fish'

interface SpeciesConfig {
  species: FishSpecies
  color: string
  swimPattern: SwimPattern
  baseSize: number
  maxSize: number
  scaleFactor: number
}

const LANGUAGE_TO_SPECIES = {
  JavaScript: 'angelfish',
  TypeScript: 'manta',
  Python: 'turtle',
  Rust: 'pufferfish',
  Go: 'dolphin',
  Java: 'squid',
  C: 'shark',
  'C++': 'shark',
  'C#': 'shark',
  Solidity: 'seahorse',
  Ruby: 'goldfish',
  Swift: 'flyingfish',
  Kotlin: 'jellyfish',
  HTML: 'coral',
  CSS: 'coral',
  Shell: 'shell',
  Markdown: 'seaweed',
} as const satisfies Record<string, FishSpecies>

const SPECIES_CONFIGS: Record<FishSpecies, SpeciesConfig> = {
  angelfish: {
    species: 'angelfish',
    color: '#F7DF1E',
    swimPattern: 'zigzag',
    baseSize: 0.5,
    maxSize: 2.5,
    scaleFactor: 0.15,
  },
  manta: {
    species: 'manta',
    color: '#3178C6',
    swimPattern: 'standard',
    baseSize: 0.6,
    maxSize: 3.0,
    scaleFactor: 0.18,
  },
  turtle: {
    species: 'turtle',
    color: '#3776AB',
    swimPattern: 'slow',
    baseSize: 0.5,
    maxSize: 2.0,
    scaleFactor: 0.12,
  },
  pufferfish: {
    species: 'pufferfish',
    color: '#DEA584',
    swimPattern: 'standard',
    baseSize: 0.4,
    maxSize: 2.0,
    scaleFactor: 0.14,
  },
  dolphin: {
    species: 'dolphin',
    color: '#00ADD8',
    swimPattern: 'linear',
    baseSize: 0.6,
    maxSize: 2.8,
    scaleFactor: 0.16,
  },
  squid: {
    species: 'squid',
    color: '#B07219',
    swimPattern: 'float',
    baseSize: 0.7,
    maxSize: 3.0,
    scaleFactor: 0.2,
  },
  shark: {
    species: 'shark',
    color: '#555555',
    swimPattern: 'linear',
    baseSize: 0.8,
    maxSize: 3.0,
    scaleFactor: 0.2,
  },
  seahorse: {
    species: 'seahorse',
    color: '#627EEA',
    swimPattern: 'float',
    baseSize: 0.3,
    maxSize: 1.5,
    scaleFactor: 0.1,
  },
  goldfish: {
    species: 'goldfish',
    color: '#CC342D',
    swimPattern: 'standard',
    baseSize: 0.4,
    maxSize: 2.0,
    scaleFactor: 0.12,
  },
  flyingfish: {
    species: 'flyingfish',
    color: '#FA7343',
    swimPattern: 'zigzag',
    baseSize: 0.5,
    maxSize: 2.5,
    scaleFactor: 0.15,
  },
  jellyfish: {
    species: 'jellyfish',
    color: '#7F52FF',
    swimPattern: 'float',
    baseSize: 0.4,
    maxSize: 2.0,
    scaleFactor: 0.12,
  },
  coral: {
    species: 'coral',
    color: '#E34F26',
    swimPattern: 'stationary',
    baseSize: 0.5,
    maxSize: 2.0,
    scaleFactor: 0.1,
  },
  shell: {
    species: 'shell',
    color: '#89E051',
    swimPattern: 'stationary',
    baseSize: 0.3,
    maxSize: 1.0,
    scaleFactor: 0.08,
  },
  seaweed: {
    species: 'seaweed',
    color: '#083FA1',
    swimPattern: 'stationary',
    baseSize: 0.4,
    maxSize: 1.5,
    scaleFactor: 0.08,
  },
  plankton: {
    species: 'plankton',
    color: '#AAAAAA',
    swimPattern: 'float',
    baseSize: 0.2,
    maxSize: 0.8,
    scaleFactor: 0.05,
  },
} as const

// 크기 공식: min(baseSize + log2(stars + 1) * scaleFactor, maxSize)
function calculateFishSize(species: FishSpecies, stars: number): number {
  const config = SPECIES_CONFIGS[species]
  return Math.min(
    config.baseSize + Math.log2(stars + 1) * config.scaleFactor,
    config.maxSize,
  )
}

// 수영 속도: 최근 30일 커밋 기반 (0.0 ~ 2.0)
function calculateSwimSpeed(commitsLast30Days: number): number {
  return Math.min(0.2 + commitsLast30Days * 0.06, 2.0)
}

export {
  LANGUAGE_TO_SPECIES,
  SPECIES_CONFIGS,
  calculateFishSize,
  calculateSwimSpeed,
}
```

진화 단계 공식:

```typescript
// src/lib/aquarium/evolution.ts에서 사용 (Phase 1에서 구현)
function getEvolutionStage(
  totalCommits: number,
  stars: number,
  createdAt: string,
  lastCommitAt: string,
): EvolutionStage {
  const daysSinceLastCommit = daysBetween(new Date(lastCommitAt), new Date())
  const accountAgeYears = yearsBetween(new Date(createdAt), new Date())

  if (daysSinceLastCommit >= 180) return 'fossil'
  if (stars >= 1000) return 'legendary'
  if (totalCommits >= 200 && accountAgeYears >= 1) return 'elder'
  if (totalCommits >= 51) return 'adult'
  if (totalCommits >= 11) return 'juvenile'
  if (totalCommits >= 3) return 'fry'
  return 'egg'
}
```

#### P0-10: State Management Spec 문서 (D6)

**파일:** `docs/state-management-spec.md`

**포함 내용:**

- Zustand 스토어 설계:
  - `aquariumStore`: fish[], environment, user, stats, loading, error, selectedFishId
  - `uiStore`: tooltipData, detailPanelOpen, cameraMode, settingsOpen
- Actions: setAquariumData, selectFish, deselectFish, setLoading, setError
- Selectors: useSelectedFish, useFishBySpecies, useAliveFish, useFossilFish
- R3F 통합: useFrame 내에서 subscribe 사용 (re-render 방지)
- immer 미들웨어로 불변 업데이트
- devtools 미들웨어 (개발 환경)

#### P0-13: 디렉토리 구조 생성

**목적:** AGENTS.md에 정의된 전체 디렉토리 구조를 생성

**구현:**

```bash
mkdir -p src/{app/{api/{aquarium/'[username]',og/'[username]',webhook/github},'[locale]'/{'{landing}','[username]'/{codex},compare/'[u1]'/'[u2]',explore,leaderboard,privacy,terms}},engine/{scene,fish/species,environment,interaction,sound,fallback,effects,customization},components/{ui,layout,admin},messages/{en,ko},lib/{github,aquarium,cache,utils,auth,analytics,api,stripe,slack,pwa,realtime,timeline,webhook,moderation,gamification,codex,customization,platform,gitlab,bitbucket},stores,types,constants,i18n}
mkdir -p public/{models,textures,icons}
mkdir -p tests/{unit,integration,e2e,visual}
mkdir -p docs
mkdir -p .github/{workflows,ISSUE_TEMPLATE}
```

- 빈 디렉토리에는 `.gitkeep` 생성
- AGENTS.md의 Directory Structure와 정확히 일치

**검증:**

```bash
find src -type d | sort
# AGENTS.md의 디렉토리 구조와 비교
```

---

### Batch 0-5: 최종 문서 (2개, 병렬)

#### P0-11: Component Tree 문서 (D7)

**파일:** `docs/component-tree.md`

**포함 내용:**

- 전체 컴포넌트 계층 (3D + UI)
- Props 흐름 다이어그램
- 데이터 흐름: Server Component → Client → Zustand → R3F
- 라우트 구조: [locale]/(landing), [locale]/[username], api/aquarium/[username]
- 각 컴포넌트의 Server/Client 구분
- 의존성 그래프

#### P0-12: Supabase Schema 문서 (D9)

**파일:** `docs/supabase-schema.md`

**포함 내용 (Phase 1 최소):**

```sql
-- Phase 1: 최소 스키마
CREATE TABLE users (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  github_username TEXT UNIQUE NOT NULL,
  display_name TEXT,
  avatar_url TEXT,
  last_fetched_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE aquarium_snapshots (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  username TEXT NOT NULL,
  snapshot_date DATE NOT NULL,
  fish_count INTEGER NOT NULL,
  total_stars INTEGER DEFAULT 0,
  data JSONB NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(username, snapshot_date)
);

CREATE INDEX idx_users_username ON users(github_username);
CREATE INDEX idx_snapshots_user ON aquarium_snapshots(username, snapshot_date);
```

- RLS 정책: 공개 읽기, 서비스 역할만 쓰기
- Phase별 확장 테이블 로드맵

---

## 4. Quality Gate 체크리스트

### 빌드 & 실행

- [ ] `pnpm dev` 정상 실행
- [ ] `pnpm build` 성공
- [ ] `pnpm test` 샘플 테스트 통과
- [ ] `pnpm lint` 에러 없음
- [ ] `npx tsc --noEmit` 클린

### 문서

- [ ] 9개 레퍼런스 문서 완성 (D1~D9)
- [ ] AGENTS.md 전체 섹션 포함
- [ ] CLAUDE.md → AGENTS.md 심볼릭 링크

### 인프라

- [ ] 디렉토리 구조 AGENTS.md와 일치
- [ ] pre-commit 훅 동작 (lint-staged)
- [ ] CI 워크플로우 YAML 유효
- [ ] i18n: EN/KO 라우트 동작 (/en, /ko)

### 코드 품질

- [ ] TypeScript strict mode 활성
- [ ] ESLint 9 flat config 동작
- [ ] Prettier 포맷팅 적용
- [ ] `@/` 경로 alias 동작

### 폰트 & 디자인 토큰

- [ ] Orbitron 폰트 `--font-orbitron` CSS 변수로 로드 확인
- [ ] JetBrains Mono 폰트 `--font-jetbrains-mono` CSS 변수로 로드 확인
- [ ] `tailwind.config.ts`에 `font-heading`, `font-mono` 클래스 동작 확인
- [ ] PRD 5.1 컬러 5종 (`background`, `primary`, `accent`, `danger`, `surface`) tailwind에 등록 확인
- [ ] `docs/design-tokens.md`에 정확한 HEX값 문서화 완료

---

## 5. 에이전트 프롬프트 템플릿

### P0-01 프롬프트

```
## Task
Next.js 15 프로젝트를 pnpm으로 초기화하세요.

## Requirements
1. pnpm create next-app@latest으로 생성 (--ts --tailwind --eslint --app --src-dir)
2. React 19, Next.js 15, Tailwind CSS 4
3. tsconfig.json: strict: true, @/ path alias
4. ESLint 9 flat config (eslint.config.mjs): @typescript-eslint strict, no-any, no-console
5. Prettier: single quotes, no semicolons, trailing commas, 80 char
6. .env.example: 모든 환경변수 키 나열 (값은 빈칸)
7. 추가 패키지 설치: three, @react-three/fiber, @react-three/drei, zustand, framer-motion, @upstash/redis, @supabase/supabase-js, zod, next-intl 등

## Acceptance Criteria
- [ ] pnpm dev → localhost:3000 정상
- [ ] pnpm build → 성공
- [ ] pnpm lint → 에러 없음
- [ ] tsc --noEmit → 클린
- [ ] TypeScript strict mode 동작
```

### P0-06 프롬프트

```
## Task
GitHub API Integration Spec 문서를 docs/github-api-spec.md에 작성하세요.

## Requirements
1. REST 엔드포인트 (users, repos, commits, languages) 상세
2. GraphQL 쿼리 (유저+레포+컨트리뷰션 일괄 조회) 전문
3. 응답 TypeScript 타입 정의
4. Rate limit 전략: ETag 캐싱, X-RateLimit 헤더, exponential backoff
5. 에러 시나리오: 404, 403, 429, 500
6. 페이지네이션: Link 헤더 + GraphQL cursor
7. Cache TTL: 엔드포인트별 정의

## Reference
- PRD Section 4.3 (GitHub API 사용 계획)
- 마스터 플랜 D3 명세

## Acceptance Criteria
- [ ] 모든 REST/GraphQL 엔드포인트 문서화
- [ ] TypeScript 타입 정의 포함
- [ ] Rate limit 전략 구체적
- [ ] 에러 처리 시나리오 완전
```
