# Phase 6: 플랫폼 확장 (8주)

## 1. 개요

**목표:** GitLab/Bitbucket 지원, Organization 수족관, Public API, PWA, 수익화
**기간:** 8주
**태스크 수:** 12개 | **실행 배치:** 4개
**전제조건:** Phase 5 완료

---

## 2. 환경 사전조건

```bash
# Phase 5까지의 모든 환경 변수 + 아래 추가

# GitLab
GITLAB_TOKEN=glpat-...               # GitLab Personal Access Token
GITLAB_API_URL=https://gitlab.com/api/v4

# Bitbucket
BITBUCKET_USERNAME=...
BITBUCKET_APP_PASSWORD=...
BITBUCKET_API_URL=https://api.bitbucket.org/2.0

# Stripe
STRIPE_SECRET_KEY=sk_...
STRIPE_PUBLISHABLE_KEY=pk_...
STRIPE_WEBHOOK_SECRET=whsec_...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_...

# Public API
API_KEY_SALT=...                     # API 키 해싱용
```

---

## 3. TypeScript 인터페이스

```typescript
// src/types/platform.ts

// ===== 플랫폼 어댑터 (공통 인터페이스) =====
type Platform = 'github' | 'gitlab' | 'bitbucket'

interface PlatformUser {
  platform: Platform
  username: string
  displayName: string
  avatarUrl: string
  bio: string | null
  followers: number
  following: number
  publicRepos: number
  createdAt: string
}

interface PlatformRepo {
  platform: Platform
  id: string
  name: string
  fullName: string
  description: string | null
  language: string | null
  stars: number // GitHub: stargazers, GitLab: star_count, Bitbucket: watchers
  forks: number
  openIssues: number
  hasReadme: boolean
  license: string | null
  lastCommitAt: string
  totalCommits: number
  commitsLast30Days: number
  createdAt: string
  url: string
}

interface PlatformAdapter {
  platform: Platform
  fetchUser(username: string): Promise<PlatformUser>
  fetchRepos(username: string): Promise<PlatformRepo[]>
  fetchContributions(username: string): Promise<ContributionData>
}

// ===== GitLab 전용 =====
interface GitLabProject {
  id: number
  name: string
  path_with_namespace: string
  description: string | null
  default_branch: string
  star_count: number
  forks_count: number
  open_issues_count: number
  last_activity_at: string
  created_at: string
  web_url: string
  // language는 별도 API 호출 필요
}

interface GitLabUser {
  id: number
  username: string
  name: string
  avatar_url: string
  bio: string | null
  followers: number
  following: number
  public_repos: number // projects_count
  created_at: string
}

// ===== Bitbucket 전용 =====
interface BitbucketRepository {
  uuid: string
  slug: string
  full_name: string
  description: string
  language: string
  size: number
  created_on: string
  updated_on: string
  mainbranch: { name: string }
  links: { html: { href: string } }
}

interface BitbucketUser {
  uuid: string
  username: string
  display_name: string
  links: { avatar: { href: string } }
  created_on: string
}

// ===== Organization =====
interface OrgAquariumConfig {
  orgName: string
  platform: Platform
  members: PlatformUser[]
  totalRepos: number
  zones: OrgZone[] // 멤버별 영역
}

interface OrgZone {
  memberId: string
  memberName: string
  position: [number, number, number] // 3D 위치
  radius: number
  fishCount: number
}

// ===== Public API =====
interface APIKey {
  id: string
  userId: string
  key: string // 해시 저장
  name: string
  createdAt: string
  lastUsedAt: string | null
  rateLimit: number // 분당 요청 수
  isActive: boolean
}

interface PublicAPIResponse<T> {
  success: boolean
  data: T
  meta: {
    requestId: string
    timestamp: string
    rateLimit: {
      limit: number
      remaining: number
      reset: string
    }
  }
}

// ===== oEmbed =====
interface OEmbedResponse {
  type: 'rich'
  version: '1.0'
  title: string // "{username}의 Git 수족관"
  provider_name: 'Git Aquarium'
  provider_url: 'https://gitaquarium.com'
  width: number // 기본 800
  height: number // 기본 450
  html: string // <iframe ...> 태그
  thumbnail_url: string // OG 이미지 URL
  thumbnail_width: number
  thumbnail_height: number
}

// ===== 워치 미니 API =====
interface MiniAquariumData {
  username: string
  fish: Array<{
    id: string
    species: string
    rarity: string
    color: string
  }> // 최대 3마리
  stats: {
    totalFish: number
    totalStars: number
    topLanguage: string | null
  }
  lastUpdated: string
}

// ===== 구독 (시즌 패스 확장) =====
type SubscriptionPlan = 'free' | 'pro' | 'team' | 'season_pass'

interface Subscription {
  userId: string
  plan: SubscriptionPlan
  stripeCustomerId: string | null
  stripeSubscriptionId: string | null
  currentPeriodEnd: string | null
  cancelAtPeriodEnd: boolean
  features: PlanFeatures
}

interface PlanFeatures {
  maxPlatforms: number // free: 1, pro: 3, team: 3
  realtimeWebhook: boolean // free: false, pro: true, team: true
  timeTravel: boolean // free: false, pro: true, team: true
  advancedThemes: boolean // free: false, pro: true, team: true
  fullCustomization: boolean // free: false, pro: true, team: true
  orgAquarium: boolean // free: false, pro: false, team: true
  apiAccess: boolean // free: false, pro: false, team: true
  apiRateLimit: number // free: 0, pro: 60, team: 300
}

const PLAN_FEATURES: Record<SubscriptionPlan, PlanFeatures> = {
  free: {
    maxPlatforms: 1,
    realtimeWebhook: false,
    timeTravel: false,
    advancedThemes: false,
    fullCustomization: false,
    orgAquarium: false,
    apiAccess: false,
    apiRateLimit: 0,
  },
  pro: {
    maxPlatforms: 3,
    realtimeWebhook: true,
    timeTravel: true,
    advancedThemes: true,
    fullCustomization: true,
    orgAquarium: false,
    apiAccess: false,
    apiRateLimit: 60,
  },
  team: {
    maxPlatforms: 3,
    realtimeWebhook: true,
    timeTravel: true,
    advancedThemes: true,
    fullCustomization: true,
    orgAquarium: true,
    apiAccess: true,
    apiRateLimit: 300,
  },
  season_pass: {
    // 분기별 한정 종 전체 + 테마 전체 잠금해제. 그 외 기능은 pro와 동일.
    maxPlatforms: 3,
    realtimeWebhook: true,
    timeTravel: true,
    advancedThemes: true,
    fullCustomization: true,
    orgAquarium: false,
    apiAccess: false,
    apiRateLimit: 60,
  },
}
```

---

## 4. 실행 배치

### Batch 6-1: 멀티플랫폼 + Public API (3개, 병렬)

#### P6-01: GitLab API 통합

**목적:** GitLab 유저/프로젝트 데이터를 GitHub과 동일한 인터페이스로 제공

**파일:**

- `src/lib/gitlab/client.ts` (생성)
- `src/lib/gitlab/types.ts` (생성)
- `src/lib/gitlab/adapter.ts` (생성)
- `tests/unit/gitlab-adapter.test.ts` (생성)

**구현 상세:**

```typescript
// src/lib/gitlab/client.ts
const GITLAB_API = process.env.GITLAB_API_URL || 'https://gitlab.com/api/v4'

async function fetchGitLabUser(username: string): Promise<GitLabUser> {
  const res = await fetch(`${GITLAB_API}/users?username=${username}`, {
    headers: { 'PRIVATE-TOKEN': process.env.GITLAB_TOKEN! },
  })
  if (!res.ok) throw new PlatformError('gitlab', res.status)
  const users = await res.json()
  if (users.length === 0) throw new PlatformError('gitlab', 404)
  return users[0]
}

async function fetchGitLabProjects(userId: number): Promise<GitLabProject[]> {
  // 페이지네이션: per_page=100, 최대 10페이지
  const projects: GitLabProject[] = []
  let page = 1
  while (page <= 10) {
    const res = await fetch(
      `${GITLAB_API}/users/${userId}/projects?per_page=100&page=${page}&visibility=public`,
      { headers: { 'PRIVATE-TOKEN': process.env.GITLAB_TOKEN! } },
    )
    const batch = await res.json()
    projects.push(...batch)
    if (batch.length < 100) break
    page++
  }
  return projects
}

// src/lib/gitlab/adapter.ts — PlatformAdapter 구현
class GitLabAdapter implements PlatformAdapter {
  platform: Platform = 'gitlab'

  async fetchUser(username: string): Promise<PlatformUser> {
    const user = await fetchGitLabUser(username)
    return {
      platform: 'gitlab',
      username: user.username,
      displayName: user.name,
      avatarUrl: user.avatar_url,
      bio: user.bio,
      followers: user.followers,
      following: user.following,
      publicRepos: user.public_repos,
      createdAt: user.created_at,
    }
  }

  async fetchRepos(username: string): Promise<PlatformRepo[]> {
    const user = await fetchGitLabUser(username)
    const projects = await fetchGitLabProjects(user.id)
    return projects.map(projectToRepo)
  }

  async fetchContributions(username: string): Promise<ContributionData> {
    // GitLab Events API로 컨트리뷰션 근사치 계산
    // GET /users/:id/events?action=pushed
  }
}
```

- GitLab star_count → stars 매핑
- GitLab 언어: `GET /projects/:id/languages` (추가 API 호출)
- Rate limit: GitLab은 분당 300회 (인증), 헤더 `RateLimit-Remaining`
- 에러 처리: 404, 401(토큰 만료), 429(rate limit)

**검증:**

```bash
pnpm test -- gitlab
# GitLab 유저 조회 테스트 (MSW mock)
# 프로젝트 → PlatformRepo 변환 테스트
# 페이지네이션 테스트
```

#### P6-02: Bitbucket API 통합

**목적:** Bitbucket 유저/레포 데이터를 공통 인터페이스로 제공

**파일:**

- `src/lib/bitbucket/client.ts` (생성)
- `src/lib/bitbucket/types.ts` (생성)
- `src/lib/bitbucket/adapter.ts` (생성)
- `tests/unit/bitbucket-adapter.test.ts` (생성)

**구현 상세:**

```typescript
// src/lib/bitbucket/client.ts
const BB_API = 'https://api.bitbucket.org/2.0'

async function fetchBBUser(username: string): Promise<BitbucketUser> {
  const res = await fetch(`${BB_API}/users/${username}`, {
    headers: {
      Authorization: `Basic ${btoa(
        `${process.env.BITBUCKET_USERNAME}:${process.env.BITBUCKET_APP_PASSWORD}`
      )}`,
    },
  })
  if (!res.ok) throw new PlatformError('bitbucket', res.status)
  return res.json()
}

async function fetchBBRepos(username: string): Promise<BitbucketRepository[]> {
  // 페이지네이션: pagelen=100, next URL 따라가기
  const repos: BitbucketRepository[] = []
  let url: string | null = `${BB_API}/repositories/${username}?pagelen=100`
  while (url) {
    const res = await fetch(url, { headers: { ... } })
    const data = await res.json()
    repos.push(...data.values)
    url = data.next ?? null
  }
  return repos
}

// src/lib/bitbucket/adapter.ts
class BitbucketAdapter implements PlatformAdapter {
  platform: Platform = 'bitbucket'
  // Bitbucket은 stars 개념 없음 → watchers 수 사용
  // forks_count는 별도 API
  // 컨트리뷰션 데이터 제한적 → 최근 커밋 기반 근사
}
```

- Bitbucket 특이사항: stars 없음 (watchers 사용), 제한적 컨트리뷰션 데이터
- Basic Auth (App Password)
- Rate limit: 분당 1000회
- 페이지네이션: `next` URL 기반 (Link 헤더 아님)

**검증:**

```bash
pnpm test -- bitbucket
```

#### P6-05: Public API v1

**목적:** 외부 개발자가 수족관 데이터를 조회할 수 있는 공개 API

**파일:**

- `src/app/api/v1/aquarium/[username]/route.ts` (생성)
- `src/app/api/v1/auth/route.ts` (생성)
- `src/lib/api/api-key.ts` (생성)
- `src/lib/api/rate-limiter.ts` (생성)
- `src/lib/api/types.ts` (생성)

**구현 상세:**

```typescript
// src/app/api/v1/aquarium/[username]/route.ts
import { validateApiKey, checkRateLimit } from '@/lib/api'

export async function GET(
  request: Request,
  { params }: { params: { username: string } },
): Promise<Response> {
  // 1. API 키 검증
  const apiKey = request.headers.get('X-API-Key')
  if (!apiKey)
    return Response.json({ error: 'API key required' }, { status: 401 })

  const keyData = await validateApiKey(apiKey)
  if (!keyData)
    return Response.json({ error: 'Invalid API key' }, { status: 401 })

  // 2. Rate limit 체크
  const rateLimitResult = await checkRateLimit(keyData.id, keyData.rateLimit)
  if (!rateLimitResult.allowed) {
    return Response.json(
      { error: 'Rate limit exceeded' },
      {
        status: 429,
        headers: {
          'X-RateLimit-Limit': String(keyData.rateLimit),
          'X-RateLimit-Remaining': '0',
          'X-RateLimit-Reset': rateLimitResult.resetAt,
          'Retry-After': String(rateLimitResult.retryAfter),
        },
      },
    )
  }

  // 3. 수족관 데이터 조회 (기존 로직 재사용)
  const data = await fetchAquariumData(params.username)

  // 4. 응답
  return Response.json({
    success: true,
    data,
    meta: {
      requestId: crypto.randomUUID(),
      timestamp: new Date().toISOString(),
      rateLimit: {
        limit: keyData.rateLimit,
        remaining: rateLimitResult.remaining,
        reset: rateLimitResult.resetAt,
      },
    },
  } satisfies PublicAPIResponse<AquariumData>)
}
```

- API 키: SHA-256 해시 저장, `aq_` 프리픽스
- Rate limit: Redis 슬라이딩 윈도우 (분당)
- 응답 헤더: `X-RateLimit-Limit`, `X-RateLimit-Remaining`, `X-RateLimit-Reset`
- CORS: 모든 오리진 허용 (공개 API)
- API 키 발급: 로그인한 Team 플랜 유저만 가능
- 버저닝: URL path `/api/v1/`

**검증:**

```bash
# API 키 없이 요청 → 401
curl http://localhost:3000/api/v1/aquarium/chamdom

# 유효한 API 키 → 200 + AquariumData
curl -H "X-API-Key: aq_test123" http://localhost:3000/api/v1/aquarium/chamdom

# Rate limit 초과 → 429
for i in $(seq 1 65); do
  curl -s -H "X-API-Key: aq_test123" http://localhost:3000/api/v1/aquarium/chamdom > /dev/null
done

pnpm test -- api-v1
```

---

### Batch 6-2: 합산 + Org + 임베드 (3개, 병렬)

#### P6-03: 멀티플랫폼 합산 수족관

**목적:** GitHub + GitLab + Bitbucket 데이터를 하나의 수족관으로 합산

**파일:**

- `src/lib/platform/merger.ts` (생성)
- `src/lib/platform/registry.ts` (생성)
- `src/app/api/aquarium/[username]/route.ts` (업데이트 — platform 쿼리 파라미터)

**구현 상세:**

```typescript
// src/lib/platform/registry.ts
const ADAPTERS: Record<Platform, PlatformAdapter> = {
  github: new GitHubAdapter(),
  gitlab: new GitLabAdapter(),
  bitbucket: new BitbucketAdapter(),
}

function getAdapter(platform: Platform): PlatformAdapter {
  return ADAPTERS[platform]
}

// src/lib/platform/merger.ts
async function fetchMultiPlatformData(
  username: string,
  platforms: Platform[],
): Promise<AquariumData> {
  // 병렬로 모든 플랫폼 데이터 fetch
  const results = await Promise.allSettled(
    platforms.map((p) => getAdapter(p).fetchRepos(username)),
  )

  // 성공한 플랫폼만 합산
  const allRepos = results
    .filter(
      (r): r is PromiseFulfilledResult<PlatformRepo[]> =>
        r.status === 'fulfilled',
    )
    .flatMap((r) => r.value)

  // 중복 제거 (같은 이름의 레포가 여러 플랫폼에 있을 수 있음)
  const deduped = deduplicateRepos(allRepos)

  // 기존 mapper로 변환
  return mapToAquariumData(deduped)
}

function deduplicateRepos(repos: PlatformRepo[]): PlatformRepo[] {
  // 같은 이름 + 같은 언어 → 스타가 더 많은 쪽 유지
  // platform 필드로 원본 추적 가능
}
```

- API: `GET /api/aquarium/{username}?platforms=github,gitlab`
- 기본값: GitHub만 (하위 호환)
- 플랫폼별 아이콘을 물고기 툴팁에 표시
- 에러 격리: 한 플랫폼 실패해도 나머지는 정상 표시

**검증:**

```bash
pnpm test -- platform-merger
# GitHub + GitLab 합산 테스트
# 중복 제거 테스트
# 한 플랫폼 실패 시 격리 테스트
```

#### P6-04: Organization 수족관

**목적:** GitHub Organization 단위의 대형 수족관

**파일:**

- `src/app/[locale]/org/[orgname]/page.tsx` (생성)
- `src/lib/github/org-client.ts` (생성)
- `src/engine/scene/OrgAquariumScene.tsx` (생성)
- `src/engine/org/OrgZones.tsx` (생성)

**구현 상세:**

```typescript
// src/lib/github/org-client.ts
async function fetchOrgData(orgName: string): Promise<OrgAquariumConfig> {
  // 1. Org 정보 조회: GET /orgs/{org}
  // 2. Org 멤버 조회: GET /orgs/{org}/members (공개 멤버만)
  // 3. Org 레포 조회: GET /orgs/{org}/repos
  // 4. 레포별 컨트리뷰터 조회 (상위 10개 레포만)
  // 5. 멤버별 영역(zone) 계산
}

// 영역 배치: 원형 배치, 멤버 수에 따라 반지름 확장
function calculateZones(members: PlatformUser[]): OrgZone[] {
  const angleStep = (2 * Math.PI) / members.length
  return members.map((member, i) => ({
    memberId: member.username,
    memberName: member.displayName,
    position: [
      Math.cos(i * angleStep) * ZONE_RADIUS,
      0,
      Math.sin(i * angleStep) * ZONE_RADIUS,
    ],
    radius: BASE_ZONE_RADIUS,
    fishCount: 0, // 나중에 채움
  }))
}
```

- 멤버별 영역: 원형 배치, 각 영역 내 해당 멤버의 물고기 배치
- 영역 경계: 반투명 원형 바닥 마커 + 멤버 이름 라벨
- 팀 간 인터랙션: 같은 레포 컨트리뷰터의 물고기는 영역 사이를 오감
- 가장 활발한 레포 = 가장 큰 물고기 (영역 중앙)
- 성능: 멤버 20명+ 시 InstancedMesh 필수

**검증:**

```bash
pnpm dev
# /en/org/{orgname} 접근
# 멤버별 영역 확인
# 영역 간 물고기 이동 확인
```

#### P6-06: Notion/블로그 임베드 위젯 + oEmbed

**목적:** 외부 사이트에 수족관 미니 뷰를 임베드, Notion 자동 감지 지원

**파일:**

- `src/app/embed/[username]/page.tsx` (업데이트 — Phase 3 기반 확장)
- `src/app/api/oembed/route.ts` (생성)
- `public/widget.js` (생성)

**구현 상세:**

```javascript
// public/widget.js — 외부 사이트에서 로드하는 스크립트
;(function () {
  const container = document.querySelector('[data-gitaquarium]')
  if (!container) return

  const username = container.dataset.gitaquarium
  const width = container.dataset.width || '100%'
  const height = container.dataset.height || '400px'
  const theme = container.dataset.theme || 'default'

  const iframe = document.createElement('iframe')
  iframe.src = `https://gitaquarium.com/embed/${username}?theme=${theme}`
  iframe.style.width = width
  iframe.style.height = height
  iframe.style.border = 'none'
  iframe.style.borderRadius = '12px'
  iframe.allow = 'autoplay'

  container.appendChild(iframe)
})()
```

사용법:

```html
<!-- 블로그/Notion에 삽입 -->
<div
  data-gitaquarium="chamdom"
  data-width="100%"
  data-height="400px"
  data-theme="dark"
></div>
<script src="https://gitaquarium.com/widget.js"></script>
```

- 위젯: 경량 모드 (파티클 감소, 인터랙션 제한)
- 테마 지원: default, dark, minimal
- CSP 호환: `frame-ancestors *`

**oEmbed 프로토콜 지원 (PRD P6-F03 — Notion 자동 감지):**

```typescript
// src/app/api/oembed/route.ts
// GET /api/oembed?url=https://gitaquarium.com/chamdom&format=json

export async function GET(request: Request): Promise<Response> {
  const { searchParams } = new URL(request.url)
  const url = searchParams.get('url')
  if (!url) return Response.json({ error: 'url required' }, { status: 400 })

  // URL에서 username 추출: gitaquarium.com/{username}
  const match = url.match(/gitaquarium\.com\/([^/?#]+)/)
  if (!match) return Response.json({ error: 'Invalid URL' }, { status: 404 })

  const username = match[1]
  const data = await fetchAquariumData(username)

  return Response.json({
    type: 'rich',
    version: '1.0',
    title: `${username}의 Git 수족관`,
    provider_name: 'Git Aquarium',
    provider_url: 'https://gitaquarium.com',
    width: 800,
    height: 450,
    html: `<iframe src="https://gitaquarium.com/embed/${username}" width="800" height="450" frameborder="0" allowfullscreen></iframe>`,
    thumbnail_url: `https://gitaquarium.com/api/og/${username}`,
    thumbnail_width: 1200,
    thumbnail_height: 630,
  } satisfies OEmbedResponse)
}
```

oEmbed 자동 감지 메타태그 (`src/app/[locale]/[username]/page.tsx`에 추가):

```html
<link
  rel="alternate"
  type="application/json+oembed"
  href="https://gitaquarium.com/api/oembed?url=https://gitaquarium.com/{username}"
  title="{username}의 Git 수족관"
/>
```

- Notion이 페이지 URL을 붙여넣을 때 `<link>` 메타태그를 감지 → `/api/oembed` 자동 호출 → iframe 블록 자동 생성
- `format=json` (기본) 및 `format=xml` 지원
- 캐시: `Cache-Control: public, max-age=3600`

**검증:**

```bash
# oEmbed 엔드포인트 테스트
curl "http://localhost:3000/api/oembed?url=https://gitaquarium.com/chamdom"
# → OEmbedResponse JSON 확인

# 외부 HTML 파일에서 위젯 로드 테스트
# iframe 렌더링 확인
# 테마 파라미터 동작 확인
# Notion 페이지에 URL 붙여넣기 → 임베드 자동 감지 확인
```

---

### Batch 6-3: Slack + PWA (2개, 병렬)

#### P6-07: Slack 봇 통합

**목적:** Slack에서 `/aquarium username` 명령으로 수족관 미리보기

**파일:**

- `src/app/api/slack/command/route.ts` (생성)
- `src/app/api/slack/interactive/route.ts` (생성)
- `src/lib/slack/types.ts` (생성)

**구현 상세:**

```typescript
// src/app/api/slack/command/route.ts
export async function POST(request: Request): Promise<Response> {
  const formData = await request.formData()
  const command = formData.get('command') as string // '/aquarium'
  const text = formData.get('text') as string // 'chamdom'
  const token = formData.get('token') as string

  // 1. Slack 토큰 검증
  if (token !== process.env.SLACK_VERIFICATION_TOKEN) {
    return new Response('Unauthorized', { status: 401 })
  }

  // 2. 수족관 데이터 조회
  const data = await fetchAquariumData(text.trim())

  // 3. Slack Block Kit 메시지 구성
  return Response.json({
    response_type: 'in_channel',
    blocks: [
      {
        type: 'section',
        text: {
          type: 'mrkdwn',
          text: `🐠 *${text}의 수족관*\n물고기: ${data.fish.length}마리 | 화석: ${data.fossilCount} | 스타: ${data.totalStars}⭐`,
        },
        accessory: {
          type: 'image',
          image_url: `https://gitaquarium.com/api/og/${text}`,
          alt_text: `${text}'s aquarium`,
        },
      },
      {
        type: 'actions',
        elements: [
          {
            type: 'button',
            text: { type: 'plain_text', text: '🌊 수족관 보기' },
            url: `https://gitaquarium.com/${text}`,
          },
        ],
      },
    ],
  })
}
```

- Slack App 설정: Slash Command `/aquarium` 등록
- 응답: Block Kit 메시지 (OG 이미지 + 통계 + 버튼)
- 에러: 유저 없음 → "해당 유저를 찾을 수 없습니다" 메시지
- 응답 시간: 3초 이내 (Slack 제한)

**검증:**

```bash
# Slack slash command 시뮬레이션
curl -X POST http://localhost:3000/api/slack/command \
  -d "command=/aquarium&text=chamdom&token=test_token"
```

#### P6-08: PWA + 모바일 최적화

**목적:** 설치 가능한 PWA, 푸시 알림, 오프라인 지원

**파일:**

- `public/manifest.json` (생성)
- `src/app/sw.ts` (생성) — Service Worker
- `src/lib/pwa/push.ts` (생성)
- `src/lib/pwa/offline.ts` (생성)
- `next.config.ts` (업데이트)

**구현 상세:**

```json
// public/manifest.json
{
  "name": "Git Aquarium",
  "short_name": "GitAquarium",
  "description": "Your GitHub repos, alive and swimming",
  "start_url": "/",
  "display": "standalone",
  "background_color": "#0a1628",
  "theme_color": "#1e40af",
  "icons": [
    { "src": "/icons/icon-192.png", "sizes": "192x192", "type": "image/png" },
    { "src": "/icons/icon-512.png", "sizes": "512x512", "type": "image/png" },
    {
      "src": "/icons/icon-maskable.png",
      "sizes": "512x512",
      "type": "image/png",
      "purpose": "maskable"
    }
  ]
}
```

- Service Worker: next-pwa 또는 수동 구현
- 캐시 전략: 수족관 데이터 → stale-while-revalidate, 정적 에셋 → cache-first
- 오프라인: 마지막으로 본 수족관 캐시에서 표시
- 푸시 알림: "새 물고기 탄생!", "전설급 물고기 출현!", "업적 해제!"
- Web Push: VAPID 키 기반
- 설치 프롬프트: 3회 방문 후 표시

**홈 화면 미니 수족관 위젯 (PRD P6-F04):**

PWA Widgets API는 아직 실험적(Chrome 플래그)이므로 단계적 접근:

- **iOS**: Web App manifest `shortcuts` 배열로 홈화면 아이콘 등록

  ```json
  // public/manifest.json에 추가
  "shortcuts": [
    {
      "name": "내 수족관",
      "url": "/{username}",
      "icons": [{ "src": "/icons/shortcut-fish.png", "sizes": "96x96" }]
    }
  ]
  ```

  → 홈화면 아이콘 탭 시 수족관 바로 열림 (위젯 대신 앱 실행)

- **Android**: TWA(Trusted Web Activity) 기반 위젯은 제한적 → 대신 PWA 설치 + 푸시 알림으로 대체
  - 설치 후 푸시 알림 카드에 수족관 스냅샷 이미지 포함 (`notification.image`)
  - 알림 클릭 시 수족관 페이지로 딥링크

- **위젯 대안 — 정적 스냅샷 알림 카드**:

  ```typescript
  // src/lib/pwa/push.ts
  async function sendDailySnapshotNotification(userId: string): Promise<void> {
    const subscription = await getPushSubscription(userId)
    const snapshot = await getLatestSnapshot(userId)

    await webpush.sendNotification(
      subscription,
      JSON.stringify({
        title: '오늘의 수족관',
        body: `물고기 ${snapshot.fishCount}마리 | 스타 ${snapshot.totalStars}개`,
        image: `https://gitaquarium.com/api/og/${snapshot.username}`,
        icon: '/icons/icon-192.png',
        data: { url: `/${snapshot.username}` },
      }),
    )
  }
  ```

  - 매일 오전 9시(유저 타임존) cron으로 일일 스냅샷 알림 발송
  - 알림 주기는 유저 설정에서 조정 가능 (매일/주간/끄기)

- **워치 앱용 미니 API 엔드포인트** (`GET /api/v1/aquarium/{username}/mini`):
  - `MiniAquariumData` 타입 반환 (물고기 3마리 + 미니 통계)
  - 실제 워치 앱은 Phase 7+ 별도 프로젝트 (Apple Watch/WearOS 네이티브)
  - 이 엔드포인트는 향후 워치 앱이 소비할 수 있도록 준비만 함
  - 파일: `src/app/api/v1/aquarium/[username]/mini/route.ts` (생성)

**검증:**

```bash
pnpm build && pnpm start
# Chrome DevTools > Application > Manifest 확인
# 설치 프롬프트 확인
# Service Worker 등록 확인
# 오프라인 모드 테스트 (Network tab에서 Offline 체크)
# Lighthouse PWA 점수 확인
```

---

### Batch 6-4: 수익화 + 어드민 (2개, 병렬)

#### P6-09: Stripe 결제 통합

**목적:** Pro/Team 구독, 장식품 개별 구매

**파일:**

- `src/lib/stripe/client.ts` (생성)
- `src/lib/stripe/webhook.ts` (생성)
- `src/app/api/stripe/checkout/route.ts` (생성)
- `src/app/api/stripe/webhook/route.ts` (생성)
- `src/app/api/stripe/portal/route.ts` (생성)
- `src/app/[locale]/pricing/page.tsx` (생성)
- `src/components/ui/PricingCard.tsx` (생성)

**구현 상세:**

```typescript
// src/app/api/stripe/checkout/route.ts
import Stripe from 'stripe'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!)

export async function POST(request: Request): Promise<Response> {
  const { priceId, userId } = await request.json()

  // 기존 Stripe Customer 조회 또는 생성
  let customerId = await getStripeCustomerId(userId)
  if (!customerId) {
    const customer = await stripe.customers.create({
      metadata: { userId },
    })
    customerId = customer.id
    await saveStripeCustomerId(userId, customerId)
  }

  // Checkout Session 생성
  const session = await stripe.checkout.sessions.create({
    customer: customerId,
    mode: 'subscription',
    line_items: [{ price: priceId, quantity: 1 }],
    success_url: `${process.env.NEXT_PUBLIC_APP_URL}/pricing?success=true`,
    cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/pricing?canceled=true`,
    metadata: { userId },
  })

  return Response.json({ url: session.url })
}
```

가격 플랜:
| 플랜 | 가격 | Stripe Price ID | 결제 주기 |
|------|------|----------------|-----------|
| Pro | $4.99/월 | `price_pro_monthly` | monthly recurring |
| Team | $9.99/월/팀 | `price_team_monthly` | monthly recurring |
| Season Pass | $2.99/분기 | `price_season_pass_quarterly` | quarterly recurring |

- Webhook: `checkout.session.completed`, `customer.subscription.updated`, `customer.subscription.deleted`
- 구독 상태를 Supabase `subscriptions` 테이블에 동기화
- Customer Portal: 구독 관리 (변경/취소)

**시즌 패스 상세 (PRD P6-F05):**

- Stripe 분기 recurring 상품 (`interval: 'month', interval_count: 3`)
- 혜택: 해당 분기 한정 종 전체 + 모든 테마 잠금해제
- `subscriptions` 테이블 `plan` 컬럼에 `'season_pass'` 값 추가
- 시즌 패스 전용 UI: 잠금된 한정 종/테마에 "Season Pass로 해제" 배지 표시
- 구독 만료 시 한정 종은 도감에 유지, 신규 출현은 중단

**장식품 숍 (PRD P6-F05):**

```typescript
// src/app/api/stripe/checkout/route.ts — one-time payment 분기 추가
if (mode === 'payment') {
  const session = await stripe.checkout.sessions.create({
    customer: customerId,
    mode: 'payment',
    line_items: [{ price: priceId, quantity: 1 }],
    success_url: `${process.env.NEXT_PUBLIC_APP_URL}/shop?success=true&item=${itemId}`,
    cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/shop`,
    metadata: { userId, itemId },
  })
  return Response.json({ url: session.url })
}
```

장식품 카탈로그:
| 아이템 | 가격 | Stripe Price ID |
|--------|------|----------------|
| 조개 세트 | $0.99 | `price_deco_shell` |
| 보물상자 (프리미엄) | $1.99 | `price_deco_chest` |
| 다이버 피규어 | $1.99 | `price_deco_diver` |
| 해적선 | $2.99 | `price_deco_ship` |
| 성 | $4.99 | `price_deco_castle` |

- 장식품 숍 UI 페이지: `/shop` (`src/app/[locale]/shop/page.tsx` 생성)
- 구매 완료 후 `user_customizations` 테이블에 `unlocked_items` 배열에 아이템 ID 추가
- Webhook `checkout.session.completed` 에서 `mode === 'payment'` 분기로 처리
- 이미 구매한 아이템: "소유 중" 배지, 재구매 불가

**Supabase 마이그레이션:**

```sql
-- subscriptions 테이블 plan_type 확장
ALTER TABLE subscriptions
  ADD COLUMN IF NOT EXISTS plan_type TEXT DEFAULT 'monthly';
  -- 값: 'monthly' | 'quarterly' (시즌 패스)

-- user_customizations에 구매 장식품 목록 추가
ALTER TABLE user_customizations
  ADD COLUMN IF NOT EXISTS purchased_item_ids TEXT[] DEFAULT '{}';
```

**Supabase 테이블:**

```sql
CREATE TABLE subscriptions (
  user_id UUID REFERENCES auth.users(id) PRIMARY KEY,
  plan TEXT NOT NULL DEFAULT 'free',
  stripe_customer_id TEXT,
  stripe_subscription_id TEXT,
  current_period_end TIMESTAMPTZ,
  cancel_at_period_end BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);
```

**검증:**

```bash
# Stripe CLI로 로컬 테스트
stripe listen --forward-to localhost:3000/api/stripe/webhook
stripe trigger checkout.session.completed

pnpm test -- stripe
```

#### P6-10: 어드민 대시보드

**목적:** 유저 관리, 시즌 관리, 애널리틱스 확인

**파일:**

- `src/app/[locale]/admin/page.tsx` (생성)
- `src/app/[locale]/admin/users/page.tsx` (생성)
- `src/app/[locale]/admin/seasons/page.tsx` (생성)
- `src/app/[locale]/admin/analytics/page.tsx` (생성)
- `src/lib/admin/auth.ts` (생성)
- `src/components/admin/AdminLayout.tsx` (생성)
- `src/components/admin/UserTable.tsx` (생성)
- `src/components/admin/SeasonEditor.tsx` (생성)

**구현 상세:**

```typescript
// src/lib/admin/auth.ts
const ADMIN_EMAILS = process.env.ADMIN_EMAILS?.split(',') ?? []

async function isAdmin(userId: string): Promise<boolean> {
  const { data } = await supabase.auth.admin.getUserById(userId)
  return ADMIN_EMAILS.includes(data.user?.email ?? '')
}

// 미들웨어로 어드민 라우트 보호
```

페이지 구성:

- `/admin`: 대시보드 (총 유저, 활성 유저, 수족관 생성 수, 구독자 수)
- `/admin/users`: 유저 테이블 (검색, 필터, 구독 상태, 정지/해제)
- `/admin/seasons`: 시즌 생성/편집/활성화 폼
- `/admin/analytics`: 차트 (일별 방문, 수족관 생성, 구독 전환율)

- 어드민 인증: 이메일 화이트리스트 기반
- Supabase RLS로 어드민 테이블 접근 제어
- 차트: recharts 또는 chart.js

**검증:**

```bash
pnpm dev
# /en/admin 접근 (어드민 이메일 로그인)
# 비-어드민 접근 시 403 리디렉션 확인
# 유저 테이블 렌더링
# 시즌 생성/편집 동작
```

---

## 5. Quality Gate 체크리스트

### 기능

- [ ] GitLab 유저 수족관 정상 생성
- [ ] Bitbucket 유저 수족관 정상 생성
- [ ] 멀티플랫폼 합산 수족관 (GitHub + GitLab) 정상 렌더링
- [ ] Organization 수족관: 멤버별 영역 표시, 영역 간 물고기 이동
- [ ] Public API: API 키 인증, rate limit, 정상 응답
- [ ] Public API 미니 엔드포인트: `GET /api/v1/aquarium/{username}/mini` 정상 응답
- [ ] oEmbed: `/api/oembed?url=...` → OEmbedResponse JSON 반환
- [ ] oEmbed 메타태그: `<link rel="alternate" type="application/json+oembed" ...>` 확인
- [ ] Slack 봇: `/aquarium username` → 미리보기 카드
- [ ] PWA 설치 가능, 오프라인 동작
- [ ] PWA: iOS manifest shortcuts 홈화면 아이콘 등록
- [ ] PWA: 일일 스냅샷 푸시 알림 발송 (이미지 포함)
- [ ] Stripe: checkout → 구독 활성 → 기능 해제, 취소 동작
- [ ] Stripe: 시즌 패스 분기 결제 → 한정 종/테마 전체 해제
- [ ] Stripe: 장식품 숍 one-time payment → `purchased_item_ids` 갱신
- [ ] 장식품 숍 `/shop` 페이지: 카탈로그, 구매, "소유 중" 상태
- [ ] 어드민: 유저/시즌/애널리틱스 관리

### 보안

- [ ] API 키 해시 저장 (평문 노출 없음)
- [ ] Stripe Webhook 서명 검증
- [ ] 어드민 라우트 접근 제어
- [ ] CORS 설정 적절 (Public API)

### 성능

- [ ] GitLab/Bitbucket API 응답 Redis 캐싱
- [ ] Org 수족관 20명+ 멤버 시 60fps 유지 (InstancedMesh)
- [ ] PWA Lighthouse 점수 90+

### 테스트

- [ ] GitLab/Bitbucket 어댑터 유닛 테스트
- [ ] 멀티플랫폼 합산/중복제거 테스트
- [ ] API 키 검증/rate limit 테스트
- [ ] oEmbed URL 파싱 및 응답 형식 테스트
- [ ] Stripe Webhook 핸들러 테스트 (subscription + payment 분기)
- [ ] 시즌 패스 혜택 활성/만료 테스트
- [ ] 장식품 중복 구매 방지 테스트

### 검증 명령어

```bash
pnpm check          # lint + format + typecheck
pnpm test           # unit + integration
pnpm test:e2e       # E2E
pnpm build          # 빌드 성공
```

---

## 6. 에이전트 프롬프트 템플릿

### Batch 6-1 프롬프트 (P6-01 GitLab)

```
## Task
GitLab API 통합 클라이언트를 구현하세요.

## Context
- Read AGENTS.md for project conventions
- Read src/lib/github/client.ts for GitHub adapter pattern (동일 인터페이스로 구현)
- Read src/types/platform.ts for PlatformAdapter interface

## Requirements
1. GitLab REST API v4 사용
2. PlatformAdapter 인터페이스 구현
3. 유저 조회: GET /users?username={username}
4. 프로젝트 조회: GET /users/{id}/projects (페이지네이션)
5. 언어 조회: GET /projects/{id}/languages
6. star_count → stars 매핑
7. 에러 처리: 404, 401, 429
8. MSW 기반 유닛 테스트

## Files
- src/lib/gitlab/client.ts
- src/lib/gitlab/types.ts
- src/lib/gitlab/adapter.ts
- tests/unit/gitlab-adapter.test.ts

## Acceptance Criteria
- [ ] PlatformAdapter 인터페이스 완전 구현
- [ ] 페이지네이션 동작 (100+ 프로젝트)
- [ ] GitHub adapter와 동일한 출력 형태
- [ ] 유닛 테스트 통과
```

### Batch 6-4 프롬프트 (P6-09 Stripe)

```
## Task
Stripe 결제 통합을 구현하세요.

## Context
- Read AGENTS.md for project conventions
- Read src/types/platform.ts for Subscription, PlanFeatures types
- Pro: $4.99/mo, Team: $9.99/mo

## Requirements
1. Checkout Session 생성 API
2. Webhook 핸들러: checkout.session.completed, subscription.updated, subscription.deleted
3. Customer Portal API (구독 관리)
4. Supabase subscriptions 테이블 동기화
5. 프라이싱 페이지 UI
6. Webhook 서명 검증 (stripe-signature 헤더)

## Files
- src/lib/stripe/client.ts
- src/app/api/stripe/checkout/route.ts
- src/app/api/stripe/webhook/route.ts
- src/app/api/stripe/portal/route.ts
- src/app/[locale]/pricing/page.tsx

## Acceptance Criteria
- [ ] Stripe CLI로 로컬 테스트 통과
- [ ] checkout → 구독 활성 → subscriptions 테이블 갱신
- [ ] 취소 시 cancel_at_period_end = true
- [ ] Webhook 서명 검증 실패 시 400
```

---

## 7. 추가 태스크 (Batch 6-5, 순차)

### P6-11: 커뮤니티 물고기 공모 시스템 (PRD 15.2)

**목적:** 커뮤니티가 새로운 물고기 종을 제안하고 투표로 공식 채택하는 시스템

**파일:**

- `fish-species/schema.json` (생성) — 종 정의 JSON 스키마
- `fish-species/README.md` (생성) — 공모 가이드
- `.github/ISSUE_TEMPLATE/fish_species_proposal.yml` (생성) — GitHub Issue 템플릿
- `.github/DISCUSSION_TEMPLATE/fish-vote.yml` (생성) — Discussion 투표 템플릿

**구현 상세:**

```json
// fish-species/schema.json
{
  "$schema": "http://json-schema.org/draft-07/schema",
  "title": "Fish Species Proposal",
  "type": "object",
  "required": [
    "id",
    "name_en",
    "name_ko",
    "trigger",
    "rarity",
    "color_primary"
  ],
  "properties": {
    "id": {
      "type": "string",
      "pattern": "^[a-z][a-z0-9_]*$",
      "description": "고유 종 ID (소문자, 언더스코어)"
    },
    "name_en": { "type": "string" },
    "name_ko": { "type": "string" },
    "trigger": {
      "type": "string",
      "description": "출현 조건 (예: 'TypeScript repos >= 5')"
    },
    "rarity": {
      "type": "string",
      "enum": ["common", "uncommon", "rare", "epic", "legendary"]
    },
    "color_primary": {
      "type": "string",
      "pattern": "^#[0-9A-Fa-f]{6}$"
    },
    "color_secondary": { "type": "string" },
    "description_en": { "type": "string" },
    "description_ko": { "type": "string" },
    "proposed_by": { "type": "string", "description": "GitHub username" }
  }
}
```

```yaml
# .github/ISSUE_TEMPLATE/fish_species_proposal.yml
name: 'Fish Species Proposal'
description: '새로운 물고기 종을 제안하세요'
labels: ['fish-proposal', 'community']
body:
  - type: input
    id: species_id
    attributes:
      label: '종 ID (영문 소문자, 언더스코어)'
      placeholder: 'rust_crab'
    validations:
      required: true
  - type: input
    id: name_en
    attributes:
      label: '영문 이름'
    validations:
      required: true
  - type: input
    id: name_ko
    attributes:
      label: '한국어 이름'
    validations:
      required: true
  - type: textarea
    id: trigger
    attributes:
      label: '출현 조건'
      placeholder: 'Rust 레포 3개 이상 보유 시'
    validations:
      required: true
  - type: dropdown
    id: rarity
    attributes:
      label: '희귀도'
      options: ['common', 'uncommon', 'rare', 'epic', 'legendary']
    validations:
      required: true
  - type: input
    id: color_primary
    attributes:
      label: '주 색상 (hex)'
      placeholder: '#B7410E'
    validations:
      required: true
  - type: textarea
    id: description
    attributes:
      label: '종 설명 (한/영)'
```

채택 프로세스:

1. GitHub Issue로 종 제안 제출
2. 메인테이너가 `fish-proposal` 라벨 검토 후 Discussion으로 이동
3. Discussion에서 커뮤니티 투표 (👍 반응)
4. **30개 이상 👍** 획득 시 메인테이너가 공식 채택 결정
5. 채택 시 `fish-species/approved/` 디렉토리에 JSON 파일 추가 + 개발팀이 3D 모델 제작

**검증:**

```bash
# JSON 스키마 유효성 검사
npx ajv validate -s fish-species/schema.json -d fish-species/examples/rust_crab.json

# GitHub Issue 템플릿 렌더링 확인 (GitHub UI에서)
```

---

### P6-12: 운영 가이드 — Disaster Recovery (PRD 19)

**목적:** 장애 대응 절차, 백업 전략, 포스트모템 템플릿 문서화

**파일:**

- `docs/ops/disaster-recovery.md` (생성)
- `docs/ops/postmortem-template.md` (생성)
- `.github/ISSUE_TEMPLATE/postmortem.yml` (생성)

**구현 상세:**

장애 심각도 분류:
| 등급 | 기준 | 대응 목표 |
|------|------|-----------|
| SEV1 | 전체 서비스 다운, 모든 유저 영향 | 15분 내 대응 시작, 1시간 내 복구 |
| SEV2 | 주요 기능 장애 (수족관 로딩 불가 등), 50%+ 유저 영향 | 30분 내 대응, 2시간 내 복구 |
| SEV3 | 부분 기능 장애 (Webhook 지연 등), 일부 유저 영향 | 2시간 내 대응, 24시간 내 복구 |

시나리오별 대응:

| 시나리오         | 감지               | 즉각 조치                                                 | 복구                            |
| ---------------- | ------------------ | --------------------------------------------------------- | ------------------------------- |
| GitHub API 다운  | Uptime 모니터 알림 | Redis 캐시 폴백 활성화, "GitHub API 일시 점검" 배너 표시  | GitHub 복구 대기, 캐시 TTL 연장 |
| Vercel 배포 다운 | Vercel Status 알림 | Vercel 상태 페이지 확인, 이전 배포로 롤백                 | `vercel rollback` 실행          |
| Redis 다운       | 헬스체크 실패      | 인메모리 폴백 또는 캐시 없이 직접 API 호출                | Upstash 재시작 또는 새 인스턴스 |
| Supabase 다운    | DB 쿼리 타임아웃   | 읽기 전용 모드 (캐시 데이터만), 쓰기 작업 큐잉            | Supabase 복구 대기, PITR 활용   |
| DDoS             | 비정상 트래픽 급증 | Vercel Edge Rate Limiting 강화, Cloudflare DDoS 보호 활성 | IP 차단, WAF 룰 추가            |

백업 전략:

- **Supabase**: 일일 자동 백업 (Pro 플랜), PITR(Point-in-Time Recovery) 7일 보존
- **Redis**: Upstash는 영속성 데이터 없음 (캐시만 사용) → 장애 시 재구축 허용
- **Static Assets (GLB, 텍스처)**: Vercel CDN + GitHub 저장소 원본 보존
- **환경 변수**: 1Password Teams 또는 Vercel 환경 변수 백업

```markdown
# docs/ops/postmortem-template.md

## 포스트모템: [장애 제목]

**날짜:** YYYY-MM-DD
**심각도:** SEV1 / SEV2 / SEV3
**지속 시간:** X시간 Y분
**영향 범위:** 유저 N명, 기능 O

### 타임라인

| 시각 (UTC) | 이벤트         |
| ---------- | -------------- |
| HH:MM      | 장애 최초 감지 |
| HH:MM      | 대응 시작      |
| HH:MM      | 원인 파악      |
| HH:MM      | 복구 완료      |

### 근본 원인

### 즉각 조치

### 재발 방지 계획

- [ ] 액션 아이템 1 (담당자, 기한)
- [ ] 액션 아이템 2
```

**검증:**

```bash
# 문서 링크 유효성
# 마크다운 렌더링 확인 (GitHub에서)
```
