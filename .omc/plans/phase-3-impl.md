# Phase 3: 소셜 — "바다를 공유하다" (6주)

## 1. 개요

**목표:** 혼자 보는 수족관에서 함께 즐기는 바다로 — 비교 모드, 합체 수족관, 방문/쿠도스, 리더보드
**기간:** 6주 (Week 11~16)
**태스크 수:** 15개 | **실행 배치:** 5개
**전제조건:** Phase 2 완료, Supabase 프로젝트 설정 완료

---

## 2. 환경 사전조건

```bash
# Phase 2에서 이미 설정된 항목
GITHUB_TOKEN=...
UPSTASH_REDIS_REST_URL=...
UPSTASH_REDIS_REST_TOKEN=...
NEXT_PUBLIC_APP_URL=...

# Phase 3에서 추가 필요
SUPABASE_URL=...
SUPABASE_ANON_KEY=...
SUPABASE_SERVICE_ROLE_KEY=...
GITHUB_CLIENT_ID=...                # GitHub OAuth App
GITHUB_CLIENT_SECRET=...            # GitHub OAuth App
NEXTAUTH_SECRET=...                 # NextAuth.js 세션 암호화
NEXTAUTH_URL=http://localhost:3000
NEXT_PUBLIC_RECAPTCHA_SITE_KEY=...  # reCAPTCHA v3
RECAPTCHA_SECRET_KEY=...            # reCAPTCHA v3 서버 검증
```

### 패키지 설치

```bash
pnpm add @supabase/supabase-js @supabase/ssr next-auth@5
pnpm add bad-words                    # 욕설 필터
pnpm add -D @types/bad-words
```

### Supabase 데이터베이스 스키마

Phase 3에서 사용하는 모든 테이블을 Supabase SQL Editor에서 생성:

```sql
-- ============================================
-- Phase 3: Social Tables
-- ============================================

-- 1. users 테이블 (GitHub OAuth 로그인 유저)
CREATE TABLE public.users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  github_id BIGINT UNIQUE NOT NULL,
  username TEXT UNIQUE NOT NULL,
  display_name TEXT,
  avatar_url TEXT,
  bio TEXT,
  representative_fish_id TEXT,         -- 대표 물고기 (방문 시 사용)
  settings JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_users_username ON public.users (username);
CREATE INDEX idx_users_github_id ON public.users (github_id);

-- 2. visits 테이블 (방문 기록)
CREATE TABLE public.visits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  visitor_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  host_username TEXT NOT NULL,          -- 방문 대상 유저네임
  visitor_fish JSONB NOT NULL,          -- 방문자 대표 물고기 데이터
  message TEXT,                         -- 게스트북 메시지
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_visits_host ON public.visits (host_username, created_at DESC);
CREATE INDEX idx_visits_visitor ON public.visits (visitor_id, created_at DESC);

-- 3. kudos 테이블 (먹이 주기 / 쿠도스)
CREATE TABLE public.kudos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  giver_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  receiver_username TEXT NOT NULL,      -- 수족관 주인
  fish_id TEXT NOT NULL,                -- 대상 물고기 (레포 이름)
  kudo_type TEXT NOT NULL CHECK (kudo_type IN ('star', 'bug', 'idea')),
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_kudos_receiver ON public.kudos (receiver_username, fish_id);
CREATE INDEX idx_kudos_giver_daily ON public.kudos (giver_id, created_at);

-- 4. leaderboard 테이블 (캐시된 리더보드 스냅샷)
CREATE TABLE public.leaderboard (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  username TEXT NOT NULL,
  category TEXT NOT NULL CHECK (category IN (
    'diversity', 'total_size', 'legendary_count',
    'codex_completion', 'weekly_new'
  )),
  score NUMERIC NOT NULL DEFAULT 0,
  rank INTEGER,
  metadata JSONB DEFAULT '{}',         -- 추가 데이터 (물고기 수, 언어 수 등)
  period TEXT NOT NULL DEFAULT 'all_time', -- 'all_time', 'weekly', 'monthly'
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE UNIQUE INDEX idx_leaderboard_unique ON public.leaderboard (username, category, period);
CREATE INDEX idx_leaderboard_rank ON public.leaderboard (category, period, rank ASC);

-- 5. reports 테이블 (콘텐츠 신고)
CREATE TABLE public.reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  reporter_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  target_type TEXT NOT NULL CHECK (target_type IN ('guestbook', 'username', 'message')),
  target_id TEXT NOT NULL,              -- 신고 대상 ID
  reason TEXT NOT NULL CHECK (reason IN (
    'spam', 'harassment', 'inappropriate', 'other'
  )),
  description TEXT,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'reviewed', 'resolved', 'dismissed')),
  created_at TIMESTAMPTZ DEFAULT now(),
  resolved_at TIMESTAMPTZ
);

CREATE INDEX idx_reports_status ON public.reports (status, created_at DESC);

-- ============================================
-- Row Level Security (RLS) 정책
-- ============================================

ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.visits ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.kudos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.leaderboard ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reports ENABLE ROW LEVEL SECURITY;

-- users: 누구나 읽기, 본인만 수정
CREATE POLICY "users_select" ON public.users FOR SELECT USING (true);
CREATE POLICY "users_update" ON public.users FOR UPDATE USING (
  auth.uid()::text = id::text
);

-- visits: 누구나 읽기, 로그인 유저만 생성
CREATE POLICY "visits_select" ON public.visits FOR SELECT USING (true);
CREATE POLICY "visits_insert" ON public.visits FOR INSERT WITH CHECK (
  auth.uid()::text = visitor_id::text
);

-- kudos: 누구나 읽기, 로그인 유저만 생성
CREATE POLICY "kudos_select" ON public.kudos FOR SELECT USING (true);
CREATE POLICY "kudos_insert" ON public.kudos FOR INSERT WITH CHECK (
  auth.uid()::text = giver_id::text
);

-- leaderboard: 누구나 읽기, service_role만 수정
CREATE POLICY "leaderboard_select" ON public.leaderboard FOR SELECT USING (true);

-- reports: 로그인 유저만 생성, 신고자 본인만 읽기
CREATE POLICY "reports_insert" ON public.reports FOR INSERT WITH CHECK (
  auth.uid()::text = reporter_id::text
);
CREATE POLICY "reports_select" ON public.reports FOR SELECT USING (
  auth.uid()::text = reporter_id::text
);
```

---

## 3. TypeScript 인터페이스

```typescript
// src/types/social.ts

// ===== 비교 모드 =====
interface CompareData {
  users: [AquariumData, AquariumData]
  stats: CompareStats
}

interface CompareStats {
  fishCount: [number, number]
  languageDiversity: [number, number] // 고유 언어 수
  totalStars: [number, number]
  legendaryCount: [number, number]
  activeRatio: [number, number] // 활성 물고기 비율
  oldestRepo: [string, string] // 가장 오래된 레포 이름
}

// ===== 합체 수족관 =====
interface MergeOceanConfig {
  usernames: string[] // 2-5명
  layout: 'merged' | 'zones' // 통합 or 영역 분리
  interactionEnabled: boolean // 물고기 간 상호작용 여부
}

interface MergeOceanData {
  config: MergeOceanConfig
  aquariums: AquariumData[]
  mergedFish: FishData[] // 전체 물고기 배열
  totalStats: {
    fishCount: number
    languageCount: number
    totalStars: number
    uniqueSpecies: number
  }
}

// ===== 방문 시스템 =====
interface Visit {
  id: string
  visitorId: string
  visitorUsername: string
  visitorAvatar: string
  hostUsername: string
  visitorFish: VisitorFishData // 방문자 대표 물고기
  message?: string // 게스트북 메시지
  createdAt: string
}

interface VisitorFishData {
  species: FishSpecies
  size: number
  color: string
  evolutionStage: EvolutionStage
  repoName: string // 출처 레포
}

// ===== 쿠도스 =====
type KudoType = 'star' | 'bug' | 'idea'

interface Kudo {
  id: string
  giverId: string
  giverUsername: string
  giverAvatar: string
  receiverUsername: string
  fishId: string // 레포 이름 = 물고기 ID
  kudoType: KudoType
  createdAt: string
}

interface KudoFeedItem {
  type: KudoType
  emoji: string // ⭐, 🐛, 💡
  label: string
  description: string
}

// ===== 리더보드 =====
type LeaderboardCategory =
  | 'diversity'
  | 'total_size'
  | 'legendary_count'
  | 'codex_completion'
  | 'weekly_new'

type LeaderboardPeriod = 'all_time' | 'weekly' | 'monthly'

interface LeaderboardEntry {
  rank: number
  username: string
  avatarUrl: string
  score: number
  category: LeaderboardCategory
  metadata: Record<string, unknown>
}

interface LeaderboardData {
  category: LeaderboardCategory
  period: LeaderboardPeriod
  entries: LeaderboardEntry[]
  totalCount: number
  userRank?: number // 현재 로그인 유저의 순위
}

// ===== 임베드 =====
interface EmbedConfig {
  username: string
  theme: 'light' | 'dark' | 'auto'
  width: number
  height: number
  showStats: boolean
  showControls: boolean
  interactive: boolean // 마우스 인터랙션 허용 여부
}

interface BadgeConfig {
  username: string
  style: 'flat' | 'flat-square' | 'for-the-badge' | 'plastic'
  label: string
  color: string
  fishCount?: number
  languageCount?: number
}

// ===== 콘텐츠 모더레이션 =====
type ReportReason = 'spam' | 'harassment' | 'inappropriate' | 'other'
type ReportStatus = 'pending' | 'reviewed' | 'resolved' | 'dismissed'

interface ModerationReport {
  id: string
  reporterId: string
  targetType: 'guestbook' | 'username' | 'message'
  targetId: string
  reason: ReportReason
  description?: string
  status: ReportStatus
  createdAt: string
  resolvedAt?: string
}

// ===== 도감 목격 =====
interface CodexVisitEntry {
  speciesId: string // e.g. 'angelfish_adult'
  sourceType: 'owned' | 'visited'
  sourceUsername?: string // 목격한 수족관 주인 (visited 시)
  discoveredAt: string
}

// ===== GitHub Action =====
interface AquariumActionConfig {
  username: string
  badgeStyle: 'flat' | 'flat-square' | 'for-the-badge'
  outputPath: string // README.md 경로
  cronSchedule: string // 기본 '0 0 * * 0' (매주 일요일)
}

// ===== Token 암호화 =====
interface EncryptedToken {
  ciphertext: string // AES-256-GCM 암호화된 값
  iv: string // 초기화 벡터 (hex)
  authTag: string // GCM 인증 태그 (hex)
}

// ===== Explore 페이지 =====
interface ExploreFilters {
  sortBy: 'trending' | 'newest' | 'most_fish' | 'most_diverse' | 'most_stars'
  language?: string // 특정 언어 필터
  period: 'day' | 'week' | 'month' | 'all_time'
  page: number
  limit: number
}

interface ExploreEntry {
  username: string
  avatarUrl: string
  fishCount: number
  languageCount: number
  totalStars: number
  legendaryCount: number
  topSpecies: FishSpecies[] // 상위 3종
  lastUpdated: string
}
```

---

## 4. 실행 배치

### Batch 3-1: Supabase Auth — 인증 기반 (1개, 순차)

> Phase 3의 대부분 기능이 로그인에 의존하므로 먼저 인증 인프라를 구축한다.

#### P3-04: Supabase Auth (GitHub OAuth)

**목적:** GitHub OAuth 기반 인증 시스템 구축 (Next.js App Router + NextAuth.js v5)
**에이전트:** CC (Claude Code)

**파일 목록:**

- `src/lib/auth/config.ts` — NextAuth.js 설정
- `src/lib/auth/supabase.ts` — Supabase 클라이언트 (서버/클라이언트)
- `src/lib/auth/session.ts` — 세션 헬퍼 함수
- `src/app/api/auth/[...nextauth]/route.ts` — NextAuth.js API 라우트
- `src/components/auth/LoginButton.tsx` — 로그인/로그아웃 버튼
- `src/components/auth/AuthProvider.tsx` — SessionProvider 래퍼
- `src/app/[locale]/layout.tsx` — AuthProvider 추가 (수정)
- `src/middleware.ts` — 인증 미들웨어 확장 (수정)

**구현 상세:**

```typescript
// src/lib/auth/config.ts
import NextAuth from 'next-auth'
import GitHubProvider from 'next-auth/providers/github'
import { createClient } from '@supabase/supabase-js'

const supabaseAdmin = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
)

export const { handlers, auth, signIn, signOut } = NextAuth({
  providers: [
    GitHubProvider({
      clientId: process.env.GITHUB_CLIENT_ID!,
      clientSecret: process.env.GITHUB_CLIENT_SECRET!,
      authorization: {
        params: {
          scope: 'read:user user:email',
        },
      },
    }),
  ],
  callbacks: {
    async signIn({ user, account, profile }) {
      if (!account || !profile) return false

      // Supabase에 유저 upsert
      const { error } = await supabaseAdmin.from('users').upsert(
        {
          github_id: Number(profile.id),
          username: (profile as { login: string }).login,
          display_name: user.name ?? '',
          avatar_url: user.image ?? '',
          bio: (profile as { bio?: string }).bio ?? '',
          updated_at: new Date().toISOString(),
        },
        { onConflict: 'github_id' },
      )

      if (error) {
        console.error('Failed to upsert user:', error)
        return false
      }
      return true
    },
    async session({ session, token }) {
      if (token.sub) {
        session.user.id = token.sub
        session.user.username = token.username as string
      }
      return session
    },
    async jwt({ token, profile }) {
      if (profile) {
        token.username = (profile as { login: string }).login
      }
      return token
    },
  },
  pages: {
    signIn: '/login',
    error: '/auth/error',
  },
})
```

```typescript
// src/lib/auth/supabase.ts
import { createClient } from '@supabase/supabase-js'
import { createBrowserClient, createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

// 서버 컴포넌트용
export async function createSupabaseServerClient() {
  const cookieStore = await cookies()
  return createServerClient(
    process.env.SUPABASE_URL!,
    process.env.SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => {
            cookieStore.set(name, value, options)
          })
        },
      },
    },
  )
}

// 클라이언트 컴포넌트용
export function createSupabaseBrowserClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  )
}

// 서버 액션/API 라우트용 (관리자 권한)
export const supabaseAdmin = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
)
```

```typescript
// src/lib/auth/session.ts
import { auth } from './config'

export async function getSession() {
  return await auth()
}

export async function requireAuth() {
  const session = await auth()
  if (!session?.user) {
    throw new Error('Authentication required')
  }
  return session
}

export async function getCurrentUser() {
  const session = await auth()
  if (!session?.user?.username) return null
  return {
    id: session.user.id,
    username: session.user.username,
    name: session.user.name,
    image: session.user.image,
  }
}
```

**추가 보안 요구사항 (PRD 14.2):**

```typescript
// src/lib/auth/config.ts — PKCE 설정 추가
export const { handlers, auth, signIn, signOut } = NextAuth({
  providers: [
    GitHubProvider({
      clientId: process.env.GITHUB_CLIENT_ID!,
      clientSecret: process.env.GITHUB_CLIENT_SECRET!,
      authorization: {
        params: {
          scope: 'read:user user:email',
          // PKCE: NextAuth.js v5는 기본적으로 PKCE를 지원하지 않으므로
          // state 파라미터를 통한 CSRF 방지를 명시적으로 활성화
        },
      },
      checks: ['pkce', 'state'], // PKCE + state CSRF 방지 활성화
    }),
  ],
  // ...
})
```

```typescript
// src/lib/auth/token-crypto.ts — Access Token AES-256 암호화
import { createCipheriv, createDecipheriv, randomBytes } from 'crypto'
import type { EncryptedToken } from '@/types/social'

const ALGORITHM = 'aes-256-gcm'
const KEY = Buffer.from(process.env.TOKEN_ENCRYPTION_KEY!, 'hex') // 32 bytes hex

export function encryptToken(plaintext: string): EncryptedToken {
  const iv = randomBytes(12) // GCM 권장 12 bytes
  const cipher = createCipheriv(ALGORITHM, KEY, iv)
  const encrypted = Buffer.concat([
    cipher.update(plaintext, 'utf8'),
    cipher.final(),
  ])
  return {
    ciphertext: encrypted.toString('hex'),
    iv: iv.toString('hex'),
    authTag: cipher.getAuthTag().toString('hex'),
  }
}

export function decryptToken(token: EncryptedToken): string {
  const decipher = createDecipheriv(
    ALGORITHM,
    KEY,
    Buffer.from(token.iv, 'hex'),
  )
  decipher.setAuthTag(Buffer.from(token.authTag, 'hex'))
  return Buffer.concat([
    decipher.update(Buffer.from(token.ciphertext, 'hex')),
    decipher.final(),
  ]).toString('utf8')
}
```

- 환경변수 추가: `TOKEN_ENCRYPTION_KEY` (64자 hex 문자열, 32 bytes)
- NextAuth.js JWT 콜백에서 access token 저장 시 `encryptToken()` 적용
- Supabase users 테이블 `settings` JSONB에 암호화된 토큰 저장 (필요 시)
- 복호화는 서버 사이드 API 라우트에서만 수행

**검증:**

```bash
# GitHub OAuth App 설정 후
# 1. 로그인 플로우 테스트
# localhost:3000 → 로그인 버튼 → GitHub OAuth → 콜백 → 세션 생성
# 2. Supabase users 테이블에 유저 데이터 저장 확인
# 3. 로그아웃 동작 확인
# 4. 세션 만료 후 자동 리프레시 확인
# 5. PKCE/state 파라미터 OAuth URL에 포함 여부 확인 (Network 탭)
# 6. TOKEN_ENCRYPTION_KEY로 암호화/복호화 라운드트립 테스트
pnpm build  # 빌드 에러 없음
```

---

### Batch 3-2: 핵심 소셜 기능 (4개, 병렬)

> Auth 구축 후 병렬로 핵심 소셜 기능 4개를 동시 구현

#### P3-01: 비교 모드 (Split View)

**목적:** 2명의 수족관을 나란히 배치하여 VS 화면으로 비교
**에이전트:** CC (Claude Code)

**파일 목록:**

- `src/app/[locale]/compare/[u1]/[u2]/page.tsx` — 비교 페이지 (Server Component)
- `src/app/[locale]/compare/[u1]/[u2]/loading.tsx` — 로딩 UI
- `src/components/compare/CompareScene.tsx` — 2개 Canvas 나란히 렌더링
- `src/components/compare/CompareInput.tsx` — 2명 유저네임 입력 UI
- `src/lib/aquarium/compare.ts` — 비교 데이터 계산 로직
- `src/app/api/compare/[u1]/[u2]/route.ts` — 비교 API 엔드포인트

**구현 상세:**

```typescript
// src/lib/aquarium/compare.ts
import { AquariumData, FishData } from '@/types/aquarium'

export function calculateCompareStats(
  a: AquariumData,
  b: AquariumData,
): CompareStats {
  const getLanguages = (fish: FishData[]) =>
    new Set(fish.map((f) => f.species)).size

  const getLegendaryCount = (fish: FishData[]) =>
    fish.filter((f) => f.evolutionStage === 'legendary').length

  const getActiveRatio = (fish: FishData[]) => {
    const active = fish.filter((f) => f.evolutionStage !== 'fossil').length
    return fish.length > 0 ? active / fish.length : 0
  }

  const getOldestRepo = (fish: FishData[]) => {
    if (fish.length === 0) return 'N/A'
    const sorted = [...fish].sort(
      (x, y) =>
        new Date(x.createdAt).getTime() - new Date(y.createdAt).getTime(),
    )
    return sorted[0].repoName
  }

  return {
    fishCount: [a.fish.length, b.fish.length],
    languageDiversity: [getLanguages(a.fish), getLanguages(b.fish)],
    totalStars: [
      a.fish.reduce((sum, f) => sum + f.stars, 0),
      b.fish.reduce((sum, f) => sum + f.stars, 0),
    ],
    legendaryCount: [getLegendaryCount(a.fish), getLegendaryCount(b.fish)],
    activeRatio: [getActiveRatio(a.fish), getActiveRatio(b.fish)],
    oldestRepo: [getOldestRepo(a.fish), getOldestRepo(b.fish)],
  }
}
```

```tsx
// src/components/compare/CompareScene.tsx
'use client'

import { Suspense } from 'react'
import { AquariumScene } from '@/engine/scene/AquariumScene'
import type { CompareData, CompareStats } from '@/types/social'

interface CompareSceneProps {
  data: CompareData
}

export function CompareScene({ data }: CompareSceneProps) {
  const { users, stats } = data

  return (
    <div className="flex h-screen w-full">
      {/* Left aquarium */}
      <div className="relative w-1/2 border-r-2 border-cyan-500/30">
        <div className="absolute left-4 top-4 z-10 rounded-lg bg-black/50 px-3 py-1.5 text-sm font-bold text-white backdrop-blur-sm">
          {users[0].username}
        </div>
        <Suspense fallback={<AquariumSkeleton />}>
          <AquariumScene data={users[0]} compact />
        </Suspense>
      </div>

      {/* Center VS badge */}
      <div className="absolute left-1/2 top-1/2 z-20 -translate-x-1/2 -translate-y-1/2">
        <div className="rounded-full bg-gradient-to-br from-cyan-500 to-blue-600 px-4 py-2 text-2xl font-black text-white shadow-lg shadow-cyan-500/50">
          VS
        </div>
      </div>

      {/* Right aquarium */}
      <div className="relative w-1/2">
        <div className="absolute right-4 top-4 z-10 rounded-lg bg-black/50 px-3 py-1.5 text-sm font-bold text-white backdrop-blur-sm">
          {users[1].username}
        </div>
        <Suspense fallback={<AquariumSkeleton />}>
          <AquariumScene data={users[1]} compact />
        </Suspense>
      </div>

      {/* Bottom comparison HUD — P3-02에서 상세 구현 */}
      <CompareHUD
        stats={stats}
        usernames={[users[0].username, users[1].username]}
      />
    </div>
  )
}
```

```tsx
// src/app/[locale]/compare/[u1]/[u2]/page.tsx
import { fetchAquariumData } from '@/lib/aquarium/mapper'
import { calculateCompareStats } from '@/lib/aquarium/compare'
import { CompareScene } from '@/components/compare/CompareScene'
import type { Metadata } from 'next'

interface ComparePageProps {
  params: Promise<{ u1: string; u2: string; locale: string }>
}

export async function generateMetadata({
  params,
}: ComparePageProps): Promise<Metadata> {
  const { u1, u2 } = await params
  return {
    title: `${u1} vs ${u2} — Git Aquarium`,
    description: `Compare the aquariums of ${u1} and ${u2}`,
    openGraph: {
      images: [`/api/og/compare/${u1}/${u2}`],
    },
  }
}

export default async function ComparePage({ params }: ComparePageProps) {
  const { u1, u2 } = await params

  const [aquarium1, aquarium2] = await Promise.all([
    fetchAquariumData(u1),
    fetchAquariumData(u2),
  ])

  const stats = calculateCompareStats(aquarium1, aquarium2)

  return (
    <CompareScene
      data={{
        users: [aquarium1, aquarium2],
        stats,
      }}
    />
  )
}
```

**검증:**

```bash
# /compare/chamdom/torvalds 접속 → 2개 수족관 나란히 표시
# 각 수족관 독립적으로 렌더링 (카메라, 물고기, 환경)
# VS 배지 중앙 표시
pnpm build
pnpm test -- compare
```

---

#### P3-03: 합체 수족관 (Merge Ocean)

**목적:** 2~5명의 수족관을 합쳐서 하나의 거대한 바다를 생성
**에이전트:** CX (OpenAI Codex)

**파일 목록:**

- `src/app/[locale]/merge/page.tsx` — 합체 수족관 페이지
- `src/components/merge/MergeInput.tsx` — 2~5명 유저네임 입력 UI
- `src/components/merge/MergeScene.tsx` — 합체된 3D 씬
- `src/lib/aquarium/merge.ts` — 합체 로직
- `src/app/api/merge/route.ts` — 합체 API (쿼리 파라미터로 유저 목록)

**구현 상세:**

```typescript
// src/lib/aquarium/merge.ts
import { AquariumData, FishData } from '@/types/aquarium'
import type { MergeOceanConfig, MergeOceanData } from '@/types/social'

const MAX_MERGE_USERS = 5
const MIN_MERGE_USERS = 2

export async function createMergeOcean(
  config: MergeOceanConfig,
  aquariums: AquariumData[],
): Promise<MergeOceanData> {
  if (
    aquariums.length < MIN_MERGE_USERS ||
    aquariums.length > MAX_MERGE_USERS
  ) {
    throw new Error(
      `Merge ocean requires ${MIN_MERGE_USERS}-${MAX_MERGE_USERS} users`,
    )
  }

  // 모든 물고기를 합치고, 소유자 태그 부여
  const mergedFish: FishData[] = aquariums.flatMap((aq, index) =>
    aq.fish.map((fish) => ({
      ...fish,
      ownerId: aq.username,
      ownerIndex: index,
      // 합체 시 위치 오프셋 (영역 분리 모드용)
      zoneOffset:
        config.layout === 'zones'
          ? { x: (index - (aquariums.length - 1) / 2) * 20, z: 0 }
          : { x: 0, z: 0 },
    })),
  )

  const allSpecies = new Set(mergedFish.map((f) => f.species))

  return {
    config,
    aquariums,
    mergedFish,
    totalStats: {
      fishCount: mergedFish.length,
      languageCount: allSpecies.size,
      totalStars: mergedFish.reduce((sum, f) => sum + f.stars, 0),
      uniqueSpecies: allSpecies.size,
    },
  }
}
```

```tsx
// src/app/[locale]/merge/[users]/page.tsx
// URL 패턴: /merge/u1+u2+u3 (PRD 6.1 — + 구분자, dynamic segment)
// 예: /merge/chamdom+torvalds+sindresorhus

interface MergePageProps {
  params: Promise<{ users: string; locale: string }>
}

export async function generateMetadata({ params }: MergePageProps) {
  const { users } = await params
  const userList = users.split('+')
  return {
    title: `${userList.join(' + ')} — Merge Ocean | Git Aquarium`,
  }
}

export default async function MergePage({ params }: MergePageProps) {
  const { users } = await params
  const usernames = users.split('+').slice(0, 5) // 최대 5명

  if (usernames.length < 2) {
    // /merge/ 직접 접근 시 입력 폼으로 리다이렉트
    redirect(`/${(await params).locale}/merge`)
  }

  const aquariums = await Promise.all(usernames.map(fetchAquariumData))
  const mergeData = await createMergeOcean(
    { usernames, layout: 'merged', interactionEnabled: true },
    aquariums,
  )
  return <MergeScene data={mergeData} />
}
// 입력 폼 페이지: src/app/[locale]/merge/page.tsx (users 없을 때 MergeInput 표시)
// MergeInput 제출 시 /merge/u1+u2 형태로 라우팅
```

**검증:**

```bash
# /merge/chamdom+torvalds → 합체 수족관 렌더링
# 2-5명 범위 검증 (6명 이상 시 에러)
# 각 유저의 물고기가 구분 가능 (색상/이름표)
# 'zones' 레이아웃: 유저별 영역 구분
# 'merged' 레이아웃: 전체 자유 수영
pnpm build
pnpm test -- merge
```

---

#### P3-05: 방문 시스템 (게스트 물고기)

**목적:** 다른 유저의 수족관에 방문하면 내 대표 물고기가 손님으로 등장
**에이전트:** CC (Claude Code)

**파일 목록:**

- `src/app/api/visit/route.ts` — 방문 기록 API (POST: 방문 등록, GET: 방문자 목록)
- `src/lib/social/visit.ts` — 방문 로직
- `src/engine/fish/GuestFish.tsx` — 게스트 물고기 컴포넌트 (반투명 + 이름표)
- `src/components/social/VisitorList.tsx` — 최근 방문자 목록
- `src/stores/social-store.ts` — 소셜 상태 관리 (Zustand)

**구현 상세:**

```typescript
// src/lib/social/visit.ts
import { supabaseAdmin } from '@/lib/auth/supabase'
import type { Visit, VisitorFishData } from '@/types/social'

const MAX_GUEST_FISH = 5 // 동시에 표시되는 게스트 물고기 최대 수
const VISIT_COOLDOWN_MS = 3600000 // 같은 유저 재방문 쿨다운 (1시간)

export async function recordVisit(
  visitorId: string,
  hostUsername: string,
  visitorFish: VisitorFishData,
  message?: string,
): Promise<Visit> {
  // 쿨다운 체크
  const { data: recentVisit } = await supabaseAdmin
    .from('visits')
    .select('created_at')
    .eq('visitor_id', visitorId)
    .eq('host_username', hostUsername)
    .order('created_at', { ascending: false })
    .limit(1)
    .single()

  if (recentVisit) {
    const elapsed = Date.now() - new Date(recentVisit.created_at).getTime()
    if (elapsed < VISIT_COOLDOWN_MS) {
      throw new Error('Visit cooldown active. Try again later.')
    }
  }

  const { data, error } = await supabaseAdmin
    .from('visits')
    .insert({
      visitor_id: visitorId,
      host_username: hostUsername,
      visitor_fish: visitorFish,
      message: message?.slice(0, 200), // 메시지 길이 제한
    })
    .select()
    .single()

  if (error) throw error
  return data as Visit
}

export async function getRecentVisitors(
  hostUsername: string,
  limit: number = MAX_GUEST_FISH,
): Promise<Visit[]> {
  const { data, error } = await supabaseAdmin
    .from('visits')
    .select(
      `
      *,
      visitor:users!visitor_id (username, avatar_url)
    `,
    )
    .eq('host_username', hostUsername)
    .order('created_at', { ascending: false })
    .limit(limit)

  if (error) throw error
  return (data ?? []) as Visit[]
}
```

```tsx
// src/engine/fish/GuestFish.tsx
'use client'

import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { Text } from '@react-three/drei'
import * as THREE from 'three'
import type { VisitorFishData } from '@/types/social'

interface GuestFishProps {
  visitor: VisitorFishData
  visitorUsername: string
  position: [number, number, number]
}

export function GuestFish({
  visitor,
  visitorUsername,
  position,
}: GuestFishProps) {
  const meshRef = useRef<THREE.Mesh>(null)

  useFrame((state) => {
    if (!meshRef.current) return
    // 게스트 물고기: 느리고 부유하는 움직임
    const t = state.clock.elapsedTime
    meshRef.current.position.y = position[1] + Math.sin(t * 0.5) * 0.3
    meshRef.current.position.x = position[0] + Math.sin(t * 0.3) * 0.5
  })

  return (
    <group position={position}>
      <mesh ref={meshRef}>
        {/* 기본 형태 — 실제 종별 모델은 Phase 2 모델 재사용 */}
        <sphereGeometry args={[visitor.size * 0.3, 16, 16]} />
        <meshStandardMaterial
          color={visitor.color}
          transparent
          opacity={0.6} // 게스트 = 반투명
          emissive={visitor.color}
          emissiveIntensity={0.2}
        />
      </mesh>
      {/* 방문자 이름표 */}
      <Text
        position={[0, visitor.size * 0.5 + 0.3, 0]}
        fontSize={0.15}
        color="white"
        anchorX="center"
        outlineWidth={0.01}
        outlineColor="black"
      >
        {`${visitorUsername}'s ${visitor.repoName}`}
      </Text>
    </group>
  )
}
```

**도감 목격 등록 (PRD P3-F03):**

```typescript
// src/lib/social/visit.ts 에 추가
import { supabaseAdmin } from '@/lib/auth/supabase'

// 방문 시 호스트 수족관의 희귀 종을 방문자 도감에 '목격'으로 등록
export async function registerCodexSightings(
  visitorId: string,
  visitorUsername: string,
  hostUsername: string,
): Promise<void> {
  // 1. 호스트 수족관 물고기 조회 (GitHub API 캐시 or Supabase)
  const hostFish = await getHostFishSpecies(hostUsername)

  // 2. 방문자가 아직 '소유' 하지 않은 종만 필터
  const { data: ownedEntries } = await supabaseAdmin
    .from('codex_entries')
    .select('species_id')
    .eq('user_id', visitorId)
    .eq('source_type', 'owned')

  const ownedIds = new Set((ownedEntries ?? []).map((e) => e.species_id))

  const newSightings = hostFish.filter((f) => !ownedIds.has(f.speciesId))

  if (newSightings.length === 0) return

  // 3. codex_entries에 'visited' 타입으로 upsert (중복 방지)
  await supabaseAdmin.from('codex_entries').upsert(
    newSightings.map((f) => ({
      user_id: visitorId,
      species_id: f.speciesId,
      source_type: 'visited',
      source_username: hostUsername,
      discovered_at: new Date().toISOString(),
    })),
    { onConflict: 'user_id,species_id,source_type' },
  )
}
```

```sql
-- Supabase 추가 테이블
CREATE TABLE public.codex_entries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  species_id TEXT NOT NULL,             -- e.g. 'angelfish_adult'
  source_type TEXT NOT NULL CHECK (source_type IN ('owned', 'visited')),
  source_username TEXT,                 -- 'visited' 시 방문한 수족관 주인
  discovered_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE (user_id, species_id, source_type)
);
CREATE INDEX idx_codex_user ON public.codex_entries (user_id, source_type);
ALTER TABLE public.codex_entries ENABLE ROW LEVEL SECURITY;
CREATE POLICY "codex_select" ON public.codex_entries FOR SELECT USING (
  auth.uid()::text = user_id::text
);
CREATE POLICY "codex_insert" ON public.codex_entries FOR INSERT WITH CHECK (
  auth.uid()::text = user_id::text
);
```

- 도감 UI: 직접 보유 종은 컬러 카드, 목격 종은 회색 카드 + "목격: @hostname" 뱃지
- `recordVisit()` 완료 후 `registerCodexSightings()` 비동기 호출

**검증:**

```bash
# 로그인 상태에서 다른 유저 수족관 방문
# → 내 대표 물고기가 반투명하게 표시됨
# → visits 테이블에 기록 저장
# → 같은 유저 1시간 내 재방문 차단
# → 방문자 목록 최대 5명 표시
# → 호스트 수족관의 미보유 종이 도감에 '목격'(회색)으로 등록됨
pnpm build
pnpm test -- visit
```

---

#### P3-08: 리더보드

**목적:** 글로벌/카테고리별 리더보드, 주간 신규 수족관 피처
**에이전트:** GC (Gemini CLI)

**파일 목록:**

- `src/app/[locale]/leaderboard/page.tsx` — 리더보드 페이지
- `src/components/leaderboard/LeaderboardTable.tsx` — 순위 테이블 컴포넌트
- `src/components/leaderboard/CategoryTabs.tsx` — 카테고리 탭 (다양성, 크기, 전설급 등)
- `src/lib/social/leaderboard.ts` — 리더보드 데이터 조회/갱신
- `src/app/api/leaderboard/route.ts` — 리더보드 API

**구현 상세:**

```typescript
// src/lib/social/leaderboard.ts
import { supabaseAdmin } from '@/lib/auth/supabase'
import { getCached, setCached } from '@/lib/cache/redis'
import type {
  LeaderboardData,
  LeaderboardCategory,
  LeaderboardPeriod,
} from '@/types/social'

const CACHE_TTL = 300 // 5분 캐시

export async function getLeaderboard(
  category: LeaderboardCategory,
  period: LeaderboardPeriod = 'all_time',
  page: number = 1,
  limit: number = 50,
): Promise<LeaderboardData> {
  const cacheKey = `leaderboard:${category}:${period}:${page}`
  const cached = await getCached<LeaderboardData>(cacheKey)
  if (cached) return cached

  const offset = (page - 1) * limit

  const { data, error, count } = await supabaseAdmin
    .from('leaderboard')
    .select('*', { count: 'exact' })
    .eq('category', category)
    .eq('period', period)
    .order('rank', { ascending: true })
    .range(offset, offset + limit - 1)

  if (error) throw error

  const result: LeaderboardData = {
    category,
    period,
    entries: (data ?? []).map((row) => ({
      rank: row.rank,
      username: row.username,
      avatarUrl: row.metadata?.avatar_url ?? '',
      score: Number(row.score),
      category: row.category,
      metadata: row.metadata ?? {},
    })),
    totalCount: count ?? 0,
  }

  await setCached(cacheKey, result, CACHE_TTL)
  return result
}

// Cron Job 또는 API 호출로 주기적으로 리더보드 갱신
export async function refreshLeaderboard(
  category: LeaderboardCategory,
): Promise<void> {
  // category별로 수족관 데이터를 집계하여 leaderboard 테이블에 upsert
  // 실제 구현은 각 카테고리별 쿼리에 따라 다름
  // diversity: 유저별 고유 종 수
  // total_size: 유저별 물고기 총 크기
  // legendary_count: 유저별 전설급 물고기 수
  // codex_completion: 도감 완성도
  // weekly_new: 최근 1주 신규 생성 수족관
}
```

```tsx
// src/app/[locale]/leaderboard/page.tsx
import { getLeaderboard } from '@/lib/social/leaderboard'
import { LeaderboardTable } from '@/components/leaderboard/LeaderboardTable'
import { CategoryTabs } from '@/components/leaderboard/CategoryTabs'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Leaderboard — Git Aquarium',
  description: 'Top aquariums ranked by diversity, size, and legendary fish',
}

interface LeaderboardPageProps {
  searchParams: Promise<{
    category?: string
    period?: string
    page?: string
  }>
}

export default async function LeaderboardPage({
  searchParams,
}: LeaderboardPageProps) {
  const params = await searchParams
  const category = (params.category ?? 'diversity') as LeaderboardCategory
  const period = (params.period ?? 'all_time') as LeaderboardPeriod
  const page = Number(params.page ?? '1')

  const data = await getLeaderboard(category, period, page)

  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      <h1 className="mb-6 text-3xl font-bold text-white">Leaderboard</h1>
      <CategoryTabs current={category} period={period} />
      <LeaderboardTable data={data} />
    </div>
  )
}
```

**검증:**

```bash
# /leaderboard 접속 → 카테고리별 순위 표시
# 탭 전환 (diversity, total_size, legendary_count 등)
# 기간 전환 (all_time, weekly, monthly)
# 페이지네이션 동작
# 5분 캐시 적용 확인
pnpm build
pnpm test -- leaderboard
```

---

### Batch 3-3: 보조 소셜 기능 (4개, 병렬)

> Batch 3-2의 핵심 기능 위에 구축되는 보조 기능들

#### P3-02: 비교 HUD (통계 비교 오버레이)

**목적:** 비교 모드 하단에 양쪽 수족관 통계를 시각적으로 비교하는 오버레이
**에이전트:** GC (Gemini CLI)

**파일 목록:**

- `src/components/compare/CompareHUD.tsx` — 비교 통계 오버레이
- `src/components/compare/StatBar.tsx` — 통계 비교 바 (프로그레스 바 형태)

**구현 상세:**

```tsx
// src/components/compare/CompareHUD.tsx
'use client'

import type { CompareStats } from '@/types/social'
import { StatBar } from './StatBar'

interface CompareHUDProps {
  stats: CompareStats
  usernames: [string, string]
}

const STAT_CONFIG = [
  { key: 'fishCount', label: 'Fish', icon: '🐟' },
  { key: 'languageDiversity', label: 'Languages', icon: '🌐' },
  { key: 'totalStars', label: 'Stars', icon: '⭐' },
  { key: 'legendaryCount', label: 'Legendary', icon: '👑' },
  { key: 'activeRatio', label: 'Active %', icon: '💚', format: 'percent' },
] as const

export function CompareHUD({ stats, usernames }: CompareHUDProps) {
  return (
    <div className="absolute inset-x-0 bottom-0 z-10 bg-gradient-to-t from-black/80 to-transparent p-6">
      <div className="mx-auto max-w-2xl space-y-3">
        <div className="flex justify-between text-sm font-semibold text-cyan-300">
          <span>{usernames[0]}</span>
          <span>{usernames[1]}</span>
        </div>
        {STAT_CONFIG.map(({ key, label, format }) => {
          const [left, right] = stats[key] as [number, number]
          return (
            <StatBar
              key={key}
              label={label}
              left={left}
              right={right}
              format={format}
            />
          )
        })}
      </div>
    </div>
  )
}
```

```tsx
// src/components/compare/StatBar.tsx
interface StatBarProps {
  label: string
  left: number
  right: number
  format?: 'percent' | 'number'
}

export function StatBar({
  label,
  left,
  right,
  format = 'number',
}: StatBarProps) {
  const total = left + right || 1
  const leftPct = (left / total) * 100
  const rightPct = (right / total) * 100
  const formatValue = (v: number) =>
    format === 'percent' ? `${(v * 100).toFixed(0)}%` : v.toLocaleString()

  return (
    <div className="flex items-center gap-3">
      <span className="w-16 text-right text-sm text-white">
        {formatValue(left)}
      </span>
      <div className="flex h-3 flex-1 overflow-hidden rounded-full bg-gray-700">
        <div
          className="bg-cyan-500 transition-all duration-500"
          style={{ width: `${leftPct}%` }}
        />
        <div
          className="bg-orange-500 transition-all duration-500"
          style={{ width: `${rightPct}%` }}
        />
      </div>
      <span className="w-16 text-sm text-white">{formatValue(right)}</span>
      <span className="w-20 text-xs text-gray-400">{label}</span>
    </div>
  )
}
```

**검증:**

```bash
# /compare/u1/u2 → 하단에 통계 비교 바 표시
# 각 항목 (물고기 수, 언어, 스타, 전설급, 활성 비율) 시각적 비교
pnpm build
```

---

#### P3-06: 게스트북

**목적:** 방문 시 메시지를 남기는 게스트북 기능
**에이전트:** CX (OpenAI Codex)

**파일 목록:**

- `src/components/social/Guestbook.tsx` — 게스트북 UI (메시지 목록 + 입력)
- `src/components/social/GuestbookEntry.tsx` — 개별 메시지 항목
- `src/app/api/guestbook/[username]/route.ts` — 게스트북 API (GET: 목록, POST: 작성)
- `src/lib/social/guestbook.ts` — 게스트북 로직

**구현 상세:**

```typescript
// src/lib/social/guestbook.ts
import { supabaseAdmin } from '@/lib/auth/supabase'
import { Filter } from 'bad-words'

const filter = new Filter()
const MAX_MESSAGE_LENGTH = 200
const GUESTBOOK_PAGE_SIZE = 20

export async function getGuestbookEntries(
  hostUsername: string,
  page: number = 1,
) {
  const offset = (page - 1) * GUESTBOOK_PAGE_SIZE

  const { data, error, count } = await supabaseAdmin
    .from('visits')
    .select(
      `
      id, message, created_at,
      visitor:users!visitor_id (username, avatar_url, display_name)
    `,
      { count: 'exact' },
    )
    .eq('host_username', hostUsername)
    .not('message', 'is', null) // 메시지가 있는 방문만
    .order('created_at', { ascending: false })
    .range(offset, offset + GUESTBOOK_PAGE_SIZE - 1)

  if (error) throw error

  return {
    entries: data ?? [],
    totalCount: count ?? 0,
    hasMore: (count ?? 0) > offset + GUESTBOOK_PAGE_SIZE,
  }
}

export function validateMessage(message: string): string {
  const trimmed = message.trim()
  if (trimmed.length === 0) throw new Error('Message cannot be empty')
  if (trimmed.length > MAX_MESSAGE_LENGTH) {
    throw new Error(`Message must be ${MAX_MESSAGE_LENGTH} characters or less`)
  }
  // 욕설 필터링
  return filter.clean(trimmed)
}
```

**검증:**

```bash
# 로그인 유저가 다른 수족관 방문 시 메시지 작성
# → 게스트북에 표시
# → 200자 초과 시 에러
# → 욕설 필터링 동작
# → 비로그인 유저는 읽기만 가능
pnpm build
pnpm test -- guestbook
```

---

#### P3-07: 쿠도스 시스템 (먹이 주기)

**목적:** 다른 유저의 물고기에 먹이(쿠도스)를 주면 애니메이션이 재생되는 인터랙션 시스템
**에이전트:** CC (Claude Code)

**파일 목록:**

- `src/app/api/kudos/route.ts` — 쿠도스 API (POST: 먹이 주기, GET: 받은 쿠도스)
- `src/lib/social/kudos.ts` — 쿠도스 로직 (일일 제한, 기록)
- `src/engine/effects/KudoEffect.tsx` — 먹이 주기 3D 이펙트 (파티클)
- `src/components/social/KudoButton.tsx` — 먹이 주기 버튼 (3종류 선택)
- `src/stores/social-store.ts` — 소셜 스토어에 쿠도스 상태 추가 (수정)

**구현 상세:**

```typescript
// src/lib/social/kudos.ts
import { supabaseAdmin } from '@/lib/auth/supabase'
import type { Kudo, KudoType } from '@/types/social'

const DAILY_KUDO_LIMIT = 10
const DAILY_KUDO_PER_RECEIVER_LIMIT = 3 // 동일 유저에게 하루 최대 3회 (PRD 20.1)

export const KUDO_TYPES: Record<
  KudoType,
  { emoji: string; label: string; description: string }
> = {
  star: { emoji: '⭐', label: 'Star', description: 'Great repository!' },
  bug: {
    emoji: '🐛',
    label: 'Bug Report',
    description: 'Found a bug — keep improving!',
  },
  idea: { emoji: '💡', label: 'Idea', description: 'Inspiring project!' },
}

export async function giveKudo(
  giverId: string,
  receiverUsername: string,
  fishId: string,
  kudoType: KudoType,
): Promise<Kudo> {
  // 자기 자신에게 쿠도스 금지
  const { data: giver } = await supabaseAdmin
    .from('users')
    .select('username')
    .eq('id', giverId)
    .single()

  if (giver?.username === receiverUsername) {
    throw new Error('Cannot give kudos to yourself')
  }

  // 일일 제한 확인
  const todayStart = new Date()
  todayStart.setHours(0, 0, 0, 0)

  const { count } = await supabaseAdmin
    .from('kudos')
    .select('*', { count: 'exact', head: true })
    .eq('giver_id', giverId)
    .gte('created_at', todayStart.toISOString())

  if ((count ?? 0) >= DAILY_KUDO_LIMIT) {
    throw new Error(`Daily kudo limit reached (${DAILY_KUDO_LIMIT}/day)`)
  }

  // 동일 유저에게 하루 3회 제한 (PRD 20.1)
  const { count: receiverCount } = await supabaseAdmin
    .from('kudos')
    .select('*', { count: 'exact', head: true })
    .eq('giver_id', giverId)
    .eq('receiver_username', receiverUsername)
    .gte('created_at', todayStart.toISOString())

  if ((receiverCount ?? 0) >= DAILY_KUDO_PER_RECEIVER_LIMIT) {
    throw new Error(
      `Daily kudo limit per user reached (${DAILY_KUDO_PER_RECEIVER_LIMIT}/day per receiver)`,
    )
  }

  const { data, error } = await supabaseAdmin
    .from('kudos')
    .insert({
      giver_id: giverId,
      receiver_username: receiverUsername,
      fish_id: fishId,
      kudo_type: kudoType,
    })
    .select()
    .single()

  if (error) throw error
  return data as Kudo
}

export async function getKudosForFish(
  receiverUsername: string,
  fishId: string,
): Promise<{ total: number; byType: Record<KudoType, number> }> {
  const { data, error } = await supabaseAdmin
    .from('kudos')
    .select('kudo_type')
    .eq('receiver_username', receiverUsername)
    .eq('fish_id', fishId)

  if (error) throw error

  const byType: Record<KudoType, number> = { star: 0, bug: 0, idea: 0 }
  for (const row of data ?? []) {
    byType[row.kudo_type as KudoType]++
  }

  return {
    total: (data ?? []).length,
    byType,
  }
}

export async function getRemainingKudos(giverId: string): Promise<number> {
  const todayStart = new Date()
  todayStart.setHours(0, 0, 0, 0)

  const { count } = await supabaseAdmin
    .from('kudos')
    .select('*', { count: 'exact', head: true })
    .eq('giver_id', giverId)
    .gte('created_at', todayStart.toISOString())

  return DAILY_KUDO_LIMIT - (count ?? 0)
}
```

```tsx
// src/engine/effects/KudoEffect.tsx
'use client'

import { useRef, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import type { KudoType } from '@/types/social'

interface KudoEffectProps {
  type: KudoType
  position: [number, number, number]
  onComplete: () => void
}

const KUDO_COLORS: Record<KudoType, string> = {
  star: '#FFD700',
  bug: '#00FF88',
  idea: '#00BFFF',
}

const PARTICLE_COUNT = 20
const DURATION = 2 // seconds

export function KudoEffect({ type, position, onComplete }: KudoEffectProps) {
  const pointsRef = useRef<THREE.Points>(null)
  const elapsedRef = useRef(0)

  const particles = useMemo(() => {
    const positions = new Float32Array(PARTICLE_COUNT * 3)
    const velocities = new Float32Array(PARTICLE_COUNT * 3)
    for (let i = 0; i < PARTICLE_COUNT; i++) {
      positions[i * 3] = position[0]
      positions[i * 3 + 1] = position[1]
      positions[i * 3 + 2] = position[2]
      // 랜덤 방향 속도
      velocities[i * 3] = (Math.random() - 0.5) * 2
      velocities[i * 3 + 1] = Math.random() * 3 + 1 // 위로 올라감
      velocities[i * 3 + 2] = (Math.random() - 0.5) * 2
    }
    return { positions, velocities }
  }, [position])

  useFrame((_, delta) => {
    elapsedRef.current += delta
    if (elapsedRef.current >= DURATION) {
      onComplete()
      return
    }

    if (!pointsRef.current) return
    const geo = pointsRef.current.geometry
    const pos = geo.attributes.position as THREE.BufferAttribute
    const progress = elapsedRef.current / DURATION

    for (let i = 0; i < PARTICLE_COUNT; i++) {
      pos.array[i * 3] += particles.velocities[i * 3] * delta
      pos.array[i * 3 + 1] += particles.velocities[i * 3 + 1] * delta
      pos.array[i * 3 + 2] += particles.velocities[i * 3 + 2] * delta
    }
    pos.needsUpdate = true

    // 페이드 아웃
    const material = pointsRef.current.material as THREE.PointsMaterial
    material.opacity = 1 - progress
  })

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          array={particles.positions}
          count={PARTICLE_COUNT}
          itemSize={3}
        />
      </bufferGeometry>
      <pointsMaterial
        color={KUDO_COLORS[type]}
        size={0.15}
        transparent
        opacity={1}
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </points>
  )
}
```

**검증:**

```bash
# 로그인 유저가 다른 수족관의 물고기 클릭 → 쿠도스 버튼 표시
# → 먹이 종류 선택 (star/bug/idea)
# → 파티클 애니메이션 재생
# → kudos 테이블에 기록
# → 일일 10회 제한 동작
# → 자기 자신에게 쿠도스 불가
pnpm build
pnpm test -- kudos
```

---

#### P3-10: GitHub README 임베드 위젯 (SVG 배지)

**목적:** `![aquarium](gitaquarium.com/api/badge/username)` 형태로 GitHub README에 삽입 가능한 SVG 배지
**에이전트:** CX (OpenAI Codex)

**파일 목록:**

- `src/app/api/badge/[username]/route.ts` — SVG 배지 생성 API
- `src/lib/social/badge.ts` — SVG 배지 생성 로직

**구현 상세:**

```typescript
// src/lib/social/badge.ts
import type { BadgeConfig } from '@/types/social'

const BADGE_STYLES = {
  flat: { height: 20, borderRadius: 3, fontSize: 11, padding: 6 },
  'flat-square': { height: 20, borderRadius: 0, fontSize: 11, padding: 6 },
  'for-the-badge': { height: 28, borderRadius: 4, fontSize: 10, padding: 9 },
  plastic: { height: 20, borderRadius: 4, fontSize: 11, padding: 6 },
} as const

export function generateBadgeSVG(config: BadgeConfig): string {
  const style = BADGE_STYLES[config.style]
  const label = config.label || 'Git Aquarium'
  const value =
    config.fishCount !== undefined
      ? `${config.fishCount} fish | ${config.languageCount} languages`
      : config.username
  const color = config.color || '#0891b2' // cyan-600

  const labelWidth = label.length * 7 + style.padding * 2
  const valueWidth = value.length * 6.5 + style.padding * 2
  const totalWidth = labelWidth + valueWidth

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${totalWidth}" height="${style.height}" role="img" aria-label="${label}: ${value}">
  <title>${label}: ${value}</title>
  <linearGradient id="s" x2="0" y2="100%">
    <stop offset="0" stop-color="#bbb" stop-opacity=".1"/>
    <stop offset="1" stop-opacity=".1"/>
  </linearGradient>
  <clipPath id="r">
    <rect width="${totalWidth}" height="${style.height}" rx="${style.borderRadius}" fill="#fff"/>
  </clipPath>
  <g clip-path="url(#r)">
    <rect width="${labelWidth}" height="${style.height}" fill="#555"/>
    <rect x="${labelWidth}" width="${valueWidth}" height="${style.height}" fill="${color}"/>
    <rect width="${totalWidth}" height="${style.height}" fill="url(#s)"/>
  </g>
  <g fill="#fff" text-anchor="middle" font-family="Verdana,Geneva,DejaVu Sans,sans-serif" text-rendering="geometricPrecision" font-size="${style.fontSize}">
    <text x="${labelWidth / 2}" y="${style.height / 2 + 4}" fill="#010101" fill-opacity=".3">${escapeXml(label)}</text>
    <text x="${labelWidth / 2}" y="${style.height / 2 + 3}">${escapeXml(label)}</text>
    <text x="${labelWidth + valueWidth / 2}" y="${style.height / 2 + 4}" fill="#010101" fill-opacity=".3">${escapeXml(value)}</text>
    <text x="${labelWidth + valueWidth / 2}" y="${style.height / 2 + 3}">${escapeXml(value)}</text>
  </g>
</svg>`
}

function escapeXml(s: string): string {
  return s.replace(/[&<>"']/g, (c) => {
    const map: Record<string, string> = {
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#39;',
    }
    return map[c] ?? c
  })
}
```

```typescript
// src/app/api/badge/[username]/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { generateBadgeSVG } from '@/lib/social/badge'
import { fetchAquariumData } from '@/lib/aquarium/mapper'
import type { BadgeConfig } from '@/types/social'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ username: string }> },
) {
  const { username } = await params
  const searchParams = request.nextUrl.searchParams

  try {
    const aquarium = await fetchAquariumData(username)
    const languages = new Set(aquarium.fish.map((f) => f.species))

    const config: BadgeConfig = {
      username,
      style: (searchParams.get('style') as BadgeConfig['style']) ?? 'flat',
      label: searchParams.get('label') ?? 'Git Aquarium',
      color: searchParams.get('color') ?? '#0891b2',
      fishCount: aquarium.fish.length,
      languageCount: languages.size,
    }

    const svg = generateBadgeSVG(config)

    return new NextResponse(svg, {
      headers: {
        'Content-Type': 'image/svg+xml',
        'Cache-Control': 'public, max-age=3600, s-maxage=3600',
      },
    })
  } catch {
    // 에러 시 기본 배지 반환
    const fallback = generateBadgeSVG({
      username,
      style: 'flat',
      label: 'Git Aquarium',
      color: '#6b7280',
    })
    return new NextResponse(fallback, {
      headers: { 'Content-Type': 'image/svg+xml' },
    })
  }
}
```

**검증:**

```bash
# /api/badge/chamdom → SVG 이미지 반환
# 쿼리 파라미터: ?style=for-the-badge&label=My%20Ocean&color=0ea5e9
# GitHub README에 ![](https://gitaquarium.com/api/badge/username) 삽입 → 배지 렌더링
# 캐시 헤더 1시간 설정 확인
curl -v localhost:3000/api/badge/chamdom
```

---

### Batch 3-4: 공유 & 임베드 (4개, 병렬)

#### P3-09: 공유 고도화 (Lottie/WebM)

**목적:** 움직이는 공유 카드 (Lottie/WebM 10초 클립), 스토리/가로 형식
**에이전트:** GC (Gemini CLI)

**파일 목록:**

- `src/components/share/AnimatedShareCard.tsx` — 움직이는 공유 카드 생성
- `src/components/share/ShareFormatSelector.tsx` — 포맷 선택 (세로 스토리, 가로 소셜)
- `src/lib/social/share-recorder.ts` — Canvas → WebM 녹화 유틸
- `src/app/api/share/[username]/route.ts` — 공유 카드 API

**구현 상세:**

```typescript
// src/lib/social/share-recorder.ts
interface ShareRecordingConfig {
  format: 'story' | 'landscape' | 'square'
  duration: number // ms (기본 10000)
  fps: number // 기본 30
  quality: number // 0-1 (기본 0.8)
}

const FORMAT_DIMENSIONS: Record<string, { width: number; height: number }> = {
  story: { width: 1080, height: 1920 }, // 9:16 (Instagram/TikTok)
  landscape: { width: 1200, height: 630 }, // Twitter/LinkedIn OG
  square: { width: 1080, height: 1080 }, // Instagram 피드
}

export function createShareRecorder(
  canvas: HTMLCanvasElement,
  config: ShareRecordingConfig,
): {
  start: () => void
  stop: () => Promise<Blob>
} {
  const stream = canvas.captureStream(config.fps)
  const recorder = new MediaRecorder(stream, {
    mimeType: 'video/webm;codecs=vp9',
    videoBitsPerSecond: 2500000,
  })
  const chunks: Blob[] = []

  recorder.ondataavailable = (e) => {
    if (e.data.size > 0) chunks.push(e.data)
  }

  return {
    start: () => {
      chunks.length = 0
      recorder.start()
      // 자동 중지
      setTimeout(() => recorder.stop(), config.duration)
    },
    stop: () =>
      new Promise<Blob>((resolve) => {
        recorder.onstop = () => {
          resolve(new Blob(chunks, { type: 'video/webm' }))
        }
        if (recorder.state === 'recording') recorder.stop()
      }),
  }
}
```

**검증:**

```bash
# 수족관 페이지에서 공유 버튼 → 포맷 선택 (스토리/가로/정사각형)
# → 10초 WebM 녹화 → 다운로드 or 클립보드
# 각 포맷별 해상도 정확 (1080x1920, 1200x630, 1080x1080)
pnpm build
```

---

#### P3-11: 임베드 iframe

**목적:** 외부 사이트에 수족관을 iframe으로 삽입 가능한 경량 페이지
**에이전트:** CC (Claude Code)

**파일 목록:**

- `src/app/embed/[username]/page.tsx` — 임베드용 경량 페이지 (locale 없음)
- `src/components/embed/EmbedScene.tsx` — 임베드용 경량 3D 씬
- `src/components/embed/EmbedControls.tsx` — 최소 컨트롤 (풀스크린, 링크)
- `src/app/api/embed/config/route.ts` — 임베드 설정 API

**구현 상세:**

```tsx
// src/app/embed/[username]/page.tsx
import { fetchAquariumData } from '@/lib/aquarium/mapper'
import { EmbedScene } from '@/components/embed/EmbedScene'

interface EmbedPageProps {
  params: Promise<{ username: string }>
  searchParams: Promise<{
    theme?: 'light' | 'dark' | 'auto'
    controls?: string
    stats?: string
    interactive?: string
  }>
}

export default async function EmbedPage({
  params,
  searchParams,
}: EmbedPageProps) {
  const { username } = await params
  const query = await searchParams

  const data = await fetchAquariumData(username)

  const config: EmbedConfig = {
    username,
    theme: query.theme ?? 'dark',
    width: 800,
    height: 600,
    showStats: query.stats !== 'false',
    showControls: query.controls !== 'false',
    interactive: query.interactive !== 'false',
  }

  return (
    <html>
      <body style={{ margin: 0, overflow: 'hidden' }}>
        <EmbedScene data={data} config={config} />
      </body>
    </html>
  )
}

// 임베드 코드 생성 도우미
export function generateEmbedCode(
  username: string,
  config?: Partial<EmbedConfig>,
): string {
  const params = new URLSearchParams()
  if (config?.theme) params.set('theme', config.theme)
  if (config?.showControls === false) params.set('controls', 'false')
  if (config?.showStats === false) params.set('stats', 'false')
  if (config?.interactive === false) params.set('interactive', 'false')

  const query = params.toString() ? `?${params.toString()}` : ''
  const width = config?.width ?? 800
  const height = config?.height ?? 600

  return `<iframe src="https://gitaquarium.com/embed/${username}${query}" width="${width}" height="${height}" frameborder="0" allowfullscreen></iframe>`
}
```

**검증:**

```bash
# /embed/chamdom → 경량 수족관 렌더링 (헤더/푸터 없음)
# ?theme=light → 밝은 테마
# ?controls=false → 컨트롤 숨김
# ?interactive=false → 마우스 인터랙션 비활성
# iframe 삽입 테스트: 외부 HTML에서 <iframe> 렌더링
pnpm build
```

---

#### P3-12: 비교 공유 카드

**목적:** 비교 모드 결과를 OG 이미지로 생성하여 공유
**에이전트:** CX (OpenAI Codex)

**파일 목록:**

- `src/app/api/og/compare/[u1]/[u2]/route.tsx` — 비교 OG 이미지 생성

**구현 상세:**

```tsx
// src/app/api/og/compare/[u1]/[u2]/route.tsx
import { ImageResponse } from '@vercel/og'
import { fetchAquariumData } from '@/lib/aquarium/mapper'
import { calculateCompareStats } from '@/lib/aquarium/compare'

export const runtime = 'edge'

export async function GET(
  request: Request,
  { params }: { params: Promise<{ u1: string; u2: string }> },
) {
  const { u1, u2 } = await params

  const [aq1, aq2] = await Promise.all([
    fetchAquariumData(u1),
    fetchAquariumData(u2),
  ])
  const stats = calculateCompareStats(aq1, aq2)

  return new ImageResponse(
    <div
      style={{
        width: '1200px',
        height: '630px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background:
          'linear-gradient(135deg, #0a1628 0%, #1a365d 50%, #0a1628 100%)',
        fontFamily: 'sans-serif',
        color: 'white',
      }}
    >
      {/* Left user */}
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          width: '400px',
        }}
      >
        <div style={{ fontSize: 48, fontWeight: 'bold' }}>{u1}</div>
        <div style={{ fontSize: 24, color: '#67e8f9', marginTop: 12 }}>
          {stats.fishCount[0]} fish
        </div>
        <div style={{ fontSize: 20, color: '#a5b4fc', marginTop: 8 }}>
          {stats.languageDiversity[0]} languages
        </div>
        <div style={{ fontSize: 20, color: '#fbbf24', marginTop: 8 }}>
          {stats.totalStars[0]} stars
        </div>
      </div>

      {/* VS */}
      <div
        style={{
          fontSize: 64,
          fontWeight: 'bold',
          background: 'linear-gradient(to bottom, #06b6d4, #3b82f6)',
          borderRadius: '50%',
          width: 100,
          height: 100,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        VS
      </div>

      {/* Right user */}
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          width: '400px',
        }}
      >
        <div style={{ fontSize: 48, fontWeight: 'bold' }}>{u2}</div>
        <div style={{ fontSize: 24, color: '#67e8f9', marginTop: 12 }}>
          {stats.fishCount[1]} fish
        </div>
        <div style={{ fontSize: 20, color: '#a5b4fc', marginTop: 8 }}>
          {stats.languageDiversity[1]} languages
        </div>
        <div style={{ fontSize: 20, color: '#fbbf24', marginTop: 8 }}>
          {stats.totalStars[1]} stars
        </div>
      </div>

      {/* Footer */}
      <div
        style={{
          position: 'absolute',
          bottom: 20,
          fontSize: 18,
          color: '#94a3b8',
        }}
      >
        gitaquarium.com
      </div>
    </div>,
    { width: 1200, height: 630 },
  )
}
```

**검증:**

```bash
# /api/og/compare/chamdom/torvalds → 1200x630 PNG 이미지 반환
# 양쪽 유저 이름, 물고기 수, 언어 수, 스타 수 표시
# VS 배지 중앙
curl -o compare.png localhost:3000/api/og/compare/chamdom/torvalds
```

---

#### P3-13: 콘텐츠 모더레이션

**목적:** 게스트북 욕설 필터, 콘텐츠 신고 시스템
**에이전트:** CC (Claude Code)

**파일 목록:**

- `src/lib/social/moderation.ts` — 모더레이션 로직 (필터링, 신고 처리)
- `src/app/api/report/route.ts` — 신고 API
- `src/components/social/ReportButton.tsx` — 신고 버튼

**구현 상세:**

```typescript
// src/lib/social/moderation.ts
import { Filter } from 'bad-words'
import { supabaseAdmin } from '@/lib/auth/supabase'
import type { ModerationReport, ReportReason } from '@/types/social'

const filter = new Filter()

// 한국어 욕설 추가 (기본 bad-words는 영어만)
const koreanBadWords = ['욕설1', '욕설2'] // 실제 운영 시 확장
filter.addWords(...koreanBadWords)

export function filterContent(text: string): string {
  return filter.clean(text)
}

export function containsBadWords(text: string): boolean {
  return filter.isProfane(text)
}

const REPORT_DAILY_LIMIT = 10

export async function submitReport(
  reporterId: string,
  targetType: ModerationReport['targetType'],
  targetId: string,
  reason: ReportReason,
  description?: string,
): Promise<ModerationReport> {
  // 일일 신고 제한
  const todayStart = new Date()
  todayStart.setHours(0, 0, 0, 0)

  const { count } = await supabaseAdmin
    .from('reports')
    .select('*', { count: 'exact', head: true })
    .eq('reporter_id', reporterId)
    .gte('created_at', todayStart.toISOString())

  if ((count ?? 0) >= REPORT_DAILY_LIMIT) {
    throw new Error('Daily report limit reached')
  }

  // 중복 신고 방지
  const { data: existing } = await supabaseAdmin
    .from('reports')
    .select('id')
    .eq('reporter_id', reporterId)
    .eq('target_id', targetId)
    .eq('status', 'pending')
    .single()

  if (existing) {
    throw new Error('Already reported this content')
  }

  const { data, error } = await supabaseAdmin
    .from('reports')
    .insert({
      reporter_id: reporterId,
      target_type: targetType,
      target_id: targetId,
      reason,
      description: description?.slice(0, 500),
    })
    .select()
    .single()

  if (error) throw error
  return data as ModerationReport
}
```

**검증:**

```bash
# 게스트북 메시지에 욕설 포함 시 자동 필터링
# 게스트북 항목에 신고 버튼 표시
# → 신고 사유 선택 (spam, harassment, inappropriate, other)
# → reports 테이블에 기록
# → 중복 신고 차단
# → 일일 신고 10회 제한
pnpm build
pnpm test -- moderation
```

---

#### P3-16: GitHub Action — README 자동 업데이트 (PRD P3-F06)

**목적:** 매주 자동으로 GitHub README에 수족관 배지 SVG를 업데이트하는 GitHub Marketplace Action
**에이전트:** CC (Claude Code)

**파일 목록:**

- `action/action.yml` — GitHub Action 메타데이터
- `action/src/index.ts` — Action 진입점
- `action/src/updater.ts` — README 업데이트 로직
- `action/dist/index.js` — 번들된 Action (ncc 빌드)
- `.github/workflows/aquarium-example.yml` — 사용 예시 워크플로우

**구현 상세:**

```yaml
# action/action.yml
name: 'Git Aquarium Badge'
description: 'Automatically update your GitHub README with your Git Aquarium badge'
author: 'git-aquarium'
branding:
  icon: 'anchor'
  color: 'blue'

inputs:
  github-token:
    description: 'GitHub token for committing changes'
    required: true
  username:
    description: 'GitHub username (defaults to repository owner)'
    required: false
    default: ''
  readme-path:
    description: 'Path to README file'
    required: false
    default: 'README.md'
  badge-style:
    description: 'Badge style: flat, flat-square, for-the-badge, plastic'
    required: false
    default: 'flat'
  aquarium-url:
    description: 'Git Aquarium base URL'
    required: false
    default: 'https://gitaquarium.com'

runs:
  using: 'node20'
  main: 'dist/index.js'
```

```typescript
// action/src/updater.ts
import * as core from '@actions/core'
import * as github from '@actions/github'
import * as fs from 'fs'

const BADGE_START = '<!-- git-aquarium-badge-start -->'
const BADGE_END = '<!-- git-aquarium-badge-end -->'

export async function updateReadme(
  config: AquariumActionConfig,
): Promise<void> {
  const { username, outputPath, badgeStyle } = config
  const aquariumUrl = core.getInput('aquarium-url')

  const badgeUrl = `${aquariumUrl}/api/badge/${username}?style=${badgeStyle}`
  const profileUrl = `${aquariumUrl}/${username}`

  const badgeMarkdown =
    `${BADGE_START}\n` +
    `[![Git Aquarium](${badgeUrl})](${profileUrl})\n` +
    `${BADGE_END}`

  const readmeContent = fs.readFileSync(outputPath, 'utf8')

  let updatedContent: string
  if (readmeContent.includes(BADGE_START)) {
    // 기존 배지 교체
    const regex = new RegExp(`${BADGE_START}[\\s\\S]*?${BADGE_END}`)
    updatedContent = readmeContent.replace(regex, badgeMarkdown)
  } else {
    // 파일 끝에 추가
    updatedContent = `${readmeContent}\n\n${badgeMarkdown}\n`
  }

  fs.writeFileSync(outputPath, updatedContent)
  core.info(`Updated ${outputPath} with Git Aquarium badge for @${username}`)
}
```

```yaml
# .github/workflows/aquarium-example.yml (사용 예시 — 레포에 복사하여 사용)
name: Update Git Aquarium Badge

on:
  schedule:
    - cron: '0 0 * * 0' # 매주 일요일 00:00 UTC
  workflow_dispatch: # 수동 실행 가능

jobs:
  update-badge:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: git-aquarium/badge-action@v1
        with:
          github-token: ${{ secrets.GITHUB_TOKEN }}
          badge-style: flat
      - name: Commit changes
        run: |
          git config --local user.email 'action@github.com'
          git config --local user.name 'Git Aquarium Bot'
          git diff --quiet || (git add README.md && git commit -m 'chore: update git aquarium badge')
          git push
```

- `ncc` 로 `action/src/index.ts` → `action/dist/index.js` 번들
- GitHub Marketplace 배포: `action/` 디렉토리를 별도 public repo로 분리 권장
- 배지 URL은 1시간 캐시 (`Cache-Control: public, max-age=3600`)

**검증:**

```bash
# action/ 디렉토리 빌드
cd action && pnpm build  # → dist/index.js 생성
# 로컬 act 실행 (선택)
act -j update-badge --secret GITHUB_TOKEN=xxx
# aquarium-example.yml을 테스트 레포에 추가 후 workflow_dispatch 실행
```

---

### Batch 3-5: 보안 & 탐색 (2개, 병렬)

#### P3-14: 안티봇 (reCAPTCHA + rate limiting)

**목적:** 봇 감지 및 API rate limiting으로 남용 방지
**에이전트:** CC (Claude Code)

**파일 목록:**

- `src/lib/security/recaptcha.ts` — reCAPTCHA v3 검증
- `src/lib/security/rate-limit.ts` — API rate limiting (Upstash Redis 기반)
- `src/middleware.ts` — rate limit 미들웨어 추가 (수정)

**구현 상세:**

```typescript
// src/lib/security/recaptcha.ts
const RECAPTCHA_VERIFY_URL = 'https://www.google.com/recaptcha/api/siteverify'
const MIN_SCORE = 0.5 // 0.5 이상이면 사람으로 판단

export async function verifyRecaptcha(token: string): Promise<{
  success: boolean
  score: number
  action?: string
}> {
  const response = await fetch(RECAPTCHA_VERIFY_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      secret: process.env.RECAPTCHA_SECRET_KEY!,
      response: token,
    }),
  })

  const data = await response.json()

  return {
    success: data.success && (data.score ?? 0) >= MIN_SCORE,
    score: data.score ?? 0,
    action: data.action,
  }
}
```

```typescript
// src/lib/security/rate-limit.ts
import { Ratelimit } from '@upstash/ratelimit'
import { Redis } from '@upstash/redis'

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!,
})

// API별 rate limit 설정
export const rateLimiters = {
  // 일반 API: 60 req/min per IP
  api: new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(60, '1 m'),
    prefix: 'rl:api',
  }),
  // 인증 필요 API: 30 req/min per user
  auth: new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(30, '1 m'),
    prefix: 'rl:auth',
  }),
  // 쿠도스: 하루 10회 per user (추가 보호)
  kudos: new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(10, '1 d'),
    prefix: 'rl:kudos',
  }),
  // 방문: 분당 5회 per user
  visit: new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(5, '1 m'),
    prefix: 'rl:visit',
  }),
} as const

export async function checkRateLimit(
  limiter: keyof typeof rateLimiters,
  identifier: string,
): Promise<{ success: boolean; remaining: number; reset: number }> {
  const rl = rateLimiters[limiter]
  const { success, remaining, reset } = await rl.limit(identifier)
  return { success, remaining, reset }
}
```

```typescript
// middleware.ts에 추가할 rate limit 로직
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// API 라우트에 rate limiting 적용
const RATE_LIMITED_PATHS = [
  '/api/kudos',
  '/api/visit',
  '/api/guestbook',
  '/api/report',
  '/api/badge',
]

export async function applyRateLimit(request: NextRequest) {
  const path = request.nextUrl.pathname

  if (!RATE_LIMITED_PATHS.some((p) => path.startsWith(p))) {
    return null // rate limit 대상 아님
  }

  const ip = request.headers.get('x-forwarded-for')?.split(',')[0] ?? 'unknown'

  // 동적 import로 Edge Runtime 호환
  const { checkRateLimit } = await import('@/lib/security/rate-limit')
  const result = await checkRateLimit('api', ip)

  if (!result.success) {
    return NextResponse.json(
      { error: 'Too many requests' },
      {
        status: 429,
        headers: {
          'Retry-After': String(Math.ceil((result.reset - Date.now()) / 1000)),
          'X-RateLimit-Remaining': String(result.remaining),
        },
      },
    )
  }

  return null
}
```

**검증:**

```bash
# reCAPTCHA: 쿠도스/방문/게스트북 API에서 토큰 검증
# Rate limit: 60 req/min 초과 시 429 반환
# 429 응답에 Retry-After 헤더 포함
# 쿠도스 rate limit: 일일 10회 초과 시 차단
pnpm build
pnpm test -- rate-limit
pnpm test -- recaptcha
```

---

#### P3-15: 탐색 페이지 (Explore)

**목적:** 트렌딩/신규/인기 수족관 탐색, 검색, 필터링
**에이전트:** GC (Gemini CLI)

**파일 목록:**

- `src/app/[locale]/explore/page.tsx` — 탐색 페이지
- `src/components/explore/AquariumCard.tsx` — 수족관 미리보기 카드
- `src/components/explore/ExploreFilters.tsx` — 정렬/필터 UI
- `src/components/explore/SearchBar.tsx` — 유저네임 검색
- `src/lib/social/explore.ts` — 탐색 데이터 조회
- `src/app/api/explore/route.ts` — 탐색 API

**구현 상세:**

```typescript
// src/lib/social/explore.ts
import { supabaseAdmin } from '@/lib/auth/supabase'
import { getCached, setCached } from '@/lib/cache/redis'
import type { ExploreFilters, ExploreEntry } from '@/types/social'

const EXPLORE_CACHE_TTL = 180 // 3분

export async function getExploreEntries(
  filters: ExploreFilters,
): Promise<{ entries: ExploreEntry[]; totalCount: number }> {
  const cacheKey = `explore:${JSON.stringify(filters)}`
  const cached = await getCached<{
    entries: ExploreEntry[]
    totalCount: number
  }>(cacheKey)
  if (cached) return cached

  const offset = (filters.page - 1) * filters.limit

  let query = supabaseAdmin
    .from('leaderboard')
    .select('*', { count: 'exact' })
    .eq('period', filters.period === 'all_time' ? 'all_time' : filters.period)

  // 카테고리별 정렬
  switch (filters.sortBy) {
    case 'trending':
      query = query
        .eq('category', 'weekly_new')
        .order('score', { ascending: false })
      break
    case 'newest':
      query = query
        .eq('category', 'weekly_new')
        .order('updated_at', { ascending: false })
      break
    case 'most_fish':
      query = query
        .eq('category', 'total_size')
        .order('score', { ascending: false })
      break
    case 'most_diverse':
      query = query
        .eq('category', 'diversity')
        .order('score', { ascending: false })
      break
    case 'most_stars':
      query = query
        .eq('category', 'total_size')
        .order('score', { ascending: false })
      break
  }

  const { data, error, count } = await query.range(
    offset,
    offset + filters.limit - 1,
  )

  if (error) throw error

  const entries: ExploreEntry[] = (data ?? []).map((row) => ({
    username: row.username,
    avatarUrl: row.metadata?.avatar_url ?? '',
    fishCount: row.metadata?.fish_count ?? 0,
    languageCount: row.metadata?.language_count ?? 0,
    totalStars: row.metadata?.total_stars ?? 0,
    legendaryCount: row.metadata?.legendary_count ?? 0,
    topSpecies: row.metadata?.top_species ?? [],
    lastUpdated: row.updated_at,
  }))

  const result = { entries, totalCount: count ?? 0 }
  await setCached(cacheKey, result, EXPLORE_CACHE_TTL)
  return result
}
```

```tsx
// src/app/[locale]/explore/page.tsx
import { getExploreEntries } from '@/lib/social/explore'
import { AquariumCard } from '@/components/explore/AquariumCard'
import { ExploreFilters } from '@/components/explore/ExploreFilters'
import { SearchBar } from '@/components/explore/SearchBar'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Explore Aquariums — Git Aquarium',
  description: 'Discover trending, popular, and new aquariums',
}

interface ExplorePageProps {
  searchParams: Promise<{
    sort?: string
    language?: string
    period?: string
    page?: string
    q?: string
  }>
}

export default async function ExplorePage({ searchParams }: ExplorePageProps) {
  const params = await searchParams
  const filters = {
    sortBy: (params.sort ?? 'trending') as ExploreFilters['sortBy'],
    language: params.language,
    period: (params.period ?? 'week') as ExploreFilters['period'],
    page: Number(params.page ?? '1'),
    limit: 24,
  }

  const { entries, totalCount } = await getExploreEntries(filters)

  return (
    <div className="mx-auto max-w-7xl px-4 py-8">
      <h1 className="mb-6 text-3xl font-bold text-white">Explore Aquariums</h1>
      <SearchBar />
      <ExploreFilters current={filters} />
      <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {entries.map((entry) => (
          <AquariumCard key={entry.username} entry={entry} />
        ))}
      </div>
      {/* 페이지네이션 */}
      {totalCount > filters.limit && (
        <Pagination
          current={filters.page}
          total={Math.ceil(totalCount / filters.limit)}
        />
      )}
    </div>
  )
}
```

**검증:**

```bash
# /explore → 트렌딩 수족관 카드 그리드 표시
# 정렬: trending, newest, most_fish, most_diverse, most_stars
# 기간 필터: day, week, month, all_time
# 검색: 유저네임 입력 → 결과 표시
# 페이지네이션 동작
# 3분 캐시 적용
pnpm build
pnpm test -- explore
```

---

## 5. Quality Gate 체크리스트

### 기능 검증

- [ ] GitHub OAuth 로그인 정상 (로그인 → 토큰 → 세션 → Supabase users 저장)
- [ ] PKCE + state 파라미터 OAuth URL에 포함 확인 (Network 탭)
- [ ] 비교 모드: 2개 수족관 나란히 표시 (각각 독립 렌더링)
- [ ] 비교 HUD: 5개 항목 (물고기 수, 언어, 스타, 전설급, 활성 비율) 시각적 비교
- [ ] 합체 수족관: URL 패턴 /merge/u1+u2+u3 동작, 6명 이상 에러
- [ ] 방문 시스템: 게스트 물고기 반투명 표시, 1시간 쿨다운
- [ ] 방문 후 호스트 수족관 미보유 종이 방문자 도감에 '목격'(회색) 등록
- [ ] 게스트북: 메시지 작성/목록, 200자 제한, 욕설 필터
- [ ] 쿠도스: 3종류 먹이 선택, 파티클 애니메이션, 일일 10회 제한
- [ ] 쿠도스: 동일 유저에게 하루 3회 이상 시 차단 (PRD 20.1)
- [ ] 리더보드: 카테고리별/기간별 순위, 페이지네이션
- [ ] SVG 배지: GitHub README에 삽입 가능
- [ ] GitHub Action: 워크플로우 실행 시 README 배지 자동 갱신
- [ ] 공유 고도화: WebM 10초 녹화 (스토리/가로/정사각형)
- [ ] 임베드 iframe: 경량 페이지, 테마/컨트롤 쿼리 파라미터
- [ ] 비교 공유 카드: OG 이미지 1200x630
- [ ] 탐색 페이지: 카드 그리드, 정렬/필터/검색/페이지네이션

### 보안 검증

- [ ] OAuth 토큰 서버 사이드만 저장 (클라이언트 노출 없음)
- [ ] PKCE (checks: ['pkce', 'state']) 활성화 확인
- [ ] Access Token AES-256-GCM 암호화 저장, 복호화 라운드트립 테스트
- [ ] TOKEN_ENCRYPTION_KEY 환경변수 설정 (64자 hex)
- [ ] CSRF 보호 동작 (NextAuth.js 내장 + state 파라미터)
- [ ] RLS 정책: 본인 데이터만 수정, 다른 유저 데이터는 읽기만
- [ ] codex_entries RLS: 본인 데이터만 읽기/쓰기
- [ ] reCAPTCHA v3: 쿠도스/방문/게스트북에서 봇 차단
- [ ] Rate limiting: 60 req/min (일반), 30 req/min (인증), 429 응답
- [ ] 콘텐츠 모더레이션: 욕설 필터, 신고 시스템, 일일 신고 제한
- [ ] XSS 방지: 게스트북 메시지 이스케이프
- [ ] SQL Injection 방지: Supabase SDK 파라미터화 쿼리

### 성능 검증

- [ ] 비교 모드: 30fps+ (2개 Canvas 동시 렌더링)
- [ ] 합체 수족관: 100마리+ 상태에서 25fps+
- [ ] 리더보드/탐색 페이지: LCP < 2.0s
- [ ] SVG 배지 API: 응답 시간 < 500ms (캐시 적용)
- [ ] 임베드 페이지: 번들 크기 < 300KB (경량)

### 테스트 검증

- [ ] 소셜 기능 유닛 테스트: 커버리지 80%+
- [ ] API 라우트 통합 테스트: 모든 엔드포인트
- [ ] E2E 테스트: 로그인 → 방문 → 쿠도스 → 게스트북 플로우
- [ ] `tsc --noEmit` 클린
- [ ] `eslint .` 클린
- [ ] `pnpm build` 성공

---

## 6. 에이전트 프롬프트 템플릿

### P3-04 (Supabase Auth) — CC 프롬프트

```
Context: Git Aquarium 프로젝트 Phase 3 시작. GitHub OAuth 인증 시스템을 구축해야 합니다.

Task: NextAuth.js v5 + Supabase를 사용한 GitHub OAuth 인증 시스템 구현

Requirements:
1. NextAuth.js v5 설정 (src/lib/auth/config.ts)
   - GitHub Provider (scope: read:user, user:email)
   - signIn 콜백에서 Supabase users 테이블에 upsert
   - JWT 콜백에서 username 추가
   - session 콜백에서 user.id, user.username 추가
2. Supabase 클라이언트 (src/lib/auth/supabase.ts)
   - createSupabaseServerClient (서버 컴포넌트용, cookies 기반)
   - createSupabaseBrowserClient (클라이언트 컴포넌트용)
   - supabaseAdmin (서비스 롤, API 라우트용)
3. 세션 헬퍼 (src/lib/auth/session.ts)
   - getSession, requireAuth, getCurrentUser
4. LoginButton 컴포넌트 (GitHub 로고 + 로그인/로그아웃)
5. AuthProvider (SessionProvider 래퍼)
6. API 라우트: src/app/api/auth/[...nextauth]/route.ts

Security:
- OAuth 토큰은 서버에서만 저장
- CSRF 보호 (NextAuth.js 내장)
- 세션 쿠키: httpOnly, secure, sameSite: 'lax'

Env vars needed: GITHUB_CLIENT_ID, GITHUB_CLIENT_SECRET, SUPABASE_URL, SUPABASE_ANON_KEY, SUPABASE_SERVICE_ROLE_KEY, NEXTAUTH_SECRET, NEXTAUTH_URL

Verify: pnpm build 성공, 로그인 플로우 동작, Supabase users 테이블 저장 확인
```

### P3-07 (쿠도스) — CC 프롬프트

```
Context: Git Aquarium Phase 3. 인증 시스템(P3-04)이 완료된 상태입니다.

Task: 쿠도스 시스템 (물고기에 먹이 주기) 구현

Requirements:
1. 쿠도스 API (src/app/api/kudos/route.ts)
   - POST: { receiverUsername, fishId, kudoType, recaptchaToken }
   - GET: /api/kudos?username=x&fishId=y → 받은 쿠도스 통계
2. 쿠도스 로직 (src/lib/social/kudos.ts)
   - 3종류 쿠도스: star(⭐), bug(🐛), idea(💡)
   - 일일 10회 제한 (per user)
   - 자기 자신에게 쿠도스 불가
   - getRemainingKudos, getKudosForFish, giveKudo
3. 3D 이펙트 (src/engine/effects/KudoEffect.tsx)
   - 파티클 시스템: 20개 파티클, 2초 지속, 위로 분산
   - 종류별 색상: star=#FFD700, bug=#00FF88, idea=#00BFFF
   - AdditiveBlending, 페이드 아웃
4. KudoButton 컴포넌트
   - 물고기 디테일 패널 내에 배치
   - 3종류 선택 드롭다운
   - 남은 횟수 표시
5. social-store에 쿠도스 상태 추가

DB: kudos 테이블 (giver_id, receiver_username, fish_id, kudo_type)
Rate limit: kudos limiter (10/day)
reCAPTCHA: POST 요청 시 토큰 검증

Verify: pnpm build, pnpm test -- kudos
```

### P3-15 (Explore) — GC 프롬프트

```
Context: Git Aquarium Phase 3. 리더보드(P3-08)와 인증(P3-04)이 완료된 상태입니다.

Task: 수족관 탐색 페이지 (Explore) 구현

Requirements:
1. 탐색 페이지 (src/app/[locale]/explore/page.tsx)
   - Server Component, searchParams로 필터/정렬/페이지 관리
   - 반응형 그리드: 1-4열 (sm:2, lg:3, xl:4)
2. AquariumCard 컴포넌트
   - 유저 아바타, 이름
   - 물고기 수, 언어 수, 스타 수 표시
   - 상위 3종 아이콘
   - hover 시 미리보기 효과
   - 클릭 → /{username} 이동
3. ExploreFilters 컴포넌트
   - 정렬: trending, newest, most_fish, most_diverse, most_stars
   - 기간: day, week, month, all_time
   - URL searchParams 기반 (서버 사이드)
4. SearchBar: 유저네임 검색 (debounce 300ms)
5. 탐색 API (src/app/api/explore/route.ts)
6. 탐색 데이터 조회 (src/lib/social/explore.ts)
   - leaderboard 테이블 기반 조회
   - Redis 캐시 3분
   - 페이지네이션 (24개/페이지)

Design: Tailwind CSS, 어두운 테마 기반 (bg-gray-900/950), cyan/blue 액센트
Verify: pnpm build, /explore 접속 → 카드 그리드 표시
```
