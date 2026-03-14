# GitHub API Integration Spec

Git Aquarium의 GitHub API 통합 사양을 정의합니다.

---

## 1. 개요

| 항목          | 값                                     |
| ------------- | -------------------------------------- |
| REST Base URL | `https://api.github.com`               |
| GraphQL URL   | `https://api.github.com/graphql`       |
| 인증 방식     | `Authorization: Bearer {GITHUB_TOKEN}` |
| API 버전 헤더 | `X-GitHub-Api-Version: 2022-11-28`     |
| Accept 헤더   | `application/vnd.github+json`          |

---

## 2. REST 엔드포인트

### 2.1 유저 프로필

```
GET /users/{username}
```

**요청 헤더:**

```
Authorization: Bearer {GITHUB_TOKEN}
Accept: application/vnd.github+json
X-GitHub-Api-Version: 2022-11-28
If-None-Match: {etag}  # ETag 캐싱 시
```

**응답 (200 OK):**

```typescript
interface GitHubUserResponse {
  login: string
  name: string | null
  avatar_url: string
  bio: string | null
  public_repos: number
  followers: number
  following: number
  created_at: string // ISO 8601
  updated_at: string
}
```

**Cache TTL:** 1시간
**ETag 지원:** 예

---

### 2.2 레포지토리 목록

```
GET /users/{username}/repos?per_page=100&sort=updated&type=public
```

**쿼리 파라미터:**

| 파라미터   | 값        | 설명                  |
| ---------- | --------- | --------------------- |
| `per_page` | 100       | 최대 페이지당 항목 수 |
| `sort`     | `updated` | 최근 업데이트 순      |
| `type`     | `public`  | 공개 레포만           |
| `page`     | 1부터     | 페이지네이션          |

**응답 (200 OK):**

```typescript
interface GitHubRepoResponse {
  name: string
  description: string | null
  html_url: string
  language: string | null
  stargazers_count: number
  forks_count: number
  open_issues_count: number
  license: { spdx_id: string } | null
  pushed_at: string // ISO 8601, 마지막 푸시
  created_at: string
  fork: boolean
}
```

**페이지네이션:** `Link` 헤더

```
Link: <https://api.github.com/users/octocat/repos?page=2>; rel="next",
      <https://api.github.com/users/octocat/repos?page=5>; rel="last"
```

**Cache TTL:** 30분

---

### 2.3 마지막 커밋 조회

```
GET /repos/{owner}/{repo}/commits?per_page=1
```

**응답 (200 OK):**

```typescript
interface GitHubCommitResponse {
  sha: string
  commit: {
    author: {
      name: string
      email: string
      date: string // ISO 8601
    }
    message: string
  }
}
```

**Cache TTL:** 30분

---

### 2.4 언어 비율

```
GET /repos/{owner}/{repo}/languages
```

**응답 (200 OK):**

```typescript
// 언어명: 바이트 수
type GitHubLanguagesResponse = Record<string, number>

// 예: { "TypeScript": 45231, "CSS": 8421, "JavaScript": 1203 }
```

**Cache TTL:** 1시간

---

## 3. GraphQL 쿼리

단일 요청으로 유저 프로필 + 레포 목록 + 컨트리뷰션 달력을 가져옵니다.

### 3.1 메인 쿼리

```graphql
query GetUserAquariumData($username: String!, $after: String) {
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
      privacy: PUBLIC
      ownerAffiliations: OWNER
    ) {
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
        isFork
      }
      pageInfo {
        hasNextPage
        endCursor
      }
    }
  }
}
```

**변수:**

```json
{
  "username": "octocat",
  "after": null
}
```

**응답 TypeScript 타입:**

```typescript
interface GraphQLUserData {
  user: {
    login: string
    name: string | null
    avatarUrl: string
    bio: string | null
    followers: { totalCount: number }
    following: { totalCount: number }
    createdAt: string
    contributionsCollection: {
      contributionCalendar: {
        totalContributions: number
        weeks: Array<{
          contributionDays: Array<{
            contributionCount: number
            date: string
          }>
        }>
      }
    }
    repositories: {
      nodes: Array<{
        name: string
        description: string | null
        url: string
        primaryLanguage: { name: string; color: string } | null
        stargazerCount: number
        forkCount: number
        issues: { totalCount: number }
        licenseInfo: { spdxId: string } | null
        object: { byteSize: number } | null
        defaultBranchRef: {
          target: { history: { totalCount: number } } | null
        } | null
        pushedAt: string
        createdAt: string
        isFork: boolean
      }>
      pageInfo: {
        hasNextPage: boolean
        endCursor: string | null
      }
    }
  } | null
}
```

**Cache TTL:** 24시간 (컨트리뷰션 포함)

---

### 3.2 GraphQL Rate Limit 조회

```graphql
query {
  rateLimit {
    limit
    cost
    remaining
    resetAt
  }
}
```

---

## 4. Rate Limit 전략

### 4.1 REST API Rate Limit

| 인증 상태  | 한도          | 창        |
| ---------- | ------------- | --------- |
| 미인증     | 60 req/hr     | IP 기준   |
| PAT 인증   | 5,000 req/hr  | 토큰 기준 |
| GitHub App | 15,000 req/hr | 설치 기준 |

**헤더 모니터링:**

```
X-RateLimit-Limit: 5000
X-RateLimit-Remaining: 4999
X-RateLimit-Reset: 1372700873  # Unix timestamp
X-RateLimit-Used: 1
X-RateLimit-Resource: core
```

### 4.2 GraphQL Rate Limit

| 항목                | 한도    |
| ------------------- | ------- |
| 포인트/hr           | 5,000   |
| 단일 요청 최대 노드 | 500,000 |

### 4.3 ETag 캐싱 전략

```typescript
// ETag 저장 및 조건부 요청
interface CacheEntry {
  data: unknown
  etag: string
  fetchedAt: number
}

async function fetchWithETag(url: string, cache: Map<string, CacheEntry>) {
  const cached = cache.get(url)
  const headers: Record<string, string> = {
    Authorization: `Bearer ${process.env.GITHUB_TOKEN}`,
    Accept: 'application/vnd.github+json',
  }

  if (cached?.etag) {
    headers['If-None-Match'] = cached.etag
  }

  const res = await fetch(url, { headers })

  // 304 Not Modified → 캐시 데이터 반환
  if (res.status === 304 && cached) {
    return cached.data
  }

  const data = await res.json()
  const etag = res.headers.get('ETag')

  if (etag) {
    cache.set(url, { data, etag, fetchedAt: Date.now() })
  }

  return data
}
```

### 4.4 Exponential Backoff

```typescript
async function fetchWithBackoff(
  url: string,
  options: RequestInit,
  maxRetries = 3,
) {
  for (let attempt = 0; attempt < maxRetries; attempt++) {
    const res = await fetch(url, options)

    // 성공
    if (res.ok) return res

    // Rate limit (403/429) → 대기 후 재시도
    if (res.status === 403 || res.status === 429) {
      const resetAt = res.headers.get('X-RateLimit-Reset')
      const retryAfter = res.headers.get('Retry-After')

      if (resetAt) {
        const waitMs = parseInt(resetAt) * 1000 - Date.now()
        await sleep(Math.max(waitMs, 0))
      } else if (retryAfter) {
        await sleep(parseInt(retryAfter) * 1000)
      } else {
        // 지수 백오프: 1s, 2s, 4s
        await sleep(Math.pow(2, attempt) * 1000)
      }
      continue
    }

    // 그 외 에러는 즉시 throw
    throw new GitHubAPIError(res.status, await res.text())
  }

  throw new Error('Max retries exceeded')
}
```

---

## 5. 에러 시나리오

### 5.1 404 — 유저 없음

```typescript
// 응답
{
  "message": "Not Found",
  "documentation_url": "https://docs.github.com/rest/users/users#get-a-user"
}

// 처리
if (res.status === 404) {
  return { error: 'USER_NOT_FOUND', username }
}
```

**클라이언트 표시:** "존재하지 않는 GitHub 유저입니다"

---

### 5.2 403 — Rate Limit 초과

```typescript
// 응답 헤더 확인
const remaining = res.headers.get('X-RateLimit-Remaining')
const resetAt = res.headers.get('X-RateLimit-Reset')

if (res.status === 403 && remaining === '0') {
  const resetDate = new Date(parseInt(resetAt!) * 1000)
  return {
    error: 'RATE_LIMIT_EXCEEDED',
    resetAt: resetDate.toISOString(),
  }
}
```

**클라이언트 표시:** "GitHub API 한도 초과. {시간}에 재시도 가능합니다"

---

### 5.3 429 — 보조 Rate Limit

```typescript
// Retry-After 헤더 기반 대기
if (res.status === 429) {
  const retryAfter = res.headers.get('Retry-After') ?? '60'
  return {
    error: 'SECONDARY_RATE_LIMIT',
    retryAfterSeconds: parseInt(retryAfter),
  }
}
```

---

### 5.4 500/502/503 — 서버 에러

```typescript
if (res.status >= 500) {
  // 3회 재시도 후 실패
  return {
    error: 'GITHUB_SERVER_ERROR',
    status: res.status,
  }
}
```

**클라이언트 표시:** "GitHub 서비스 오류. 잠시 후 다시 시도해주세요"

---

### 5.5 GraphQL 에러

```typescript
interface GraphQLResponse<T> {
  data: T | null
  errors?: Array<{
    message: string
    type: string
    locations: Array<{ line: number; column: number }>
    path: string[]
  }>
}

// 에러 처리
if (response.errors?.length) {
  const notFound = response.errors.some((e) => e.type === 'NOT_FOUND')
  if (notFound) return { error: 'USER_NOT_FOUND' }

  throw new GraphQLError(response.errors)
}
```

---

## 6. Cache TTL 정의

| 데이터             | TTL    | 스토리지      | 키 패턴                              |
| ------------------ | ------ | ------------- | ------------------------------------ |
| 유저 프로필        | 1시간  | Upstash Redis | `github:user:{username}`             |
| 레포 목록          | 30분   | Upstash Redis | `github:repos:{username}`            |
| 컨트리뷰션 달력    | 24시간 | Upstash Redis | `github:contributions:{username}`    |
| 언어 비율          | 1시간  | Upstash Redis | `github:languages:{username}:{repo}` |
| 전체 수족관 데이터 | 30분   | Upstash Redis | `aquarium:{username}`                |
| GraphQL 통합 쿼리  | 1시간  | Upstash Redis | `github:graphql:{username}`          |

```typescript
// Cache 키 상수
const CACHE_KEYS = {
  user: (username: string) => `github:user:${username}`,
  repos: (username: string) => `github:repos:${username}`,
  contributions: (username: string) => `github:contributions:${username}`,
  aquarium: (username: string) => `aquarium:${username}`,
  graphql: (username: string) => `github:graphql:${username}`,
} as const

// TTL 상수 (초)
const CACHE_TTL = {
  user: 3600, // 1시간
  repos: 1800, // 30분
  contributions: 86400, // 24시간
  aquarium: 1800, // 30분
  graphql: 3600, // 1시간
} as const
```

---

## 7. 페이지네이션

### 7.1 REST Link 헤더 파싱

```typescript
function parseLinkHeader(header: string | null): Record<string, string> {
  if (!header) return {}

  const links: Record<string, string> = {}
  const parts = header.split(',')

  for (const part of parts) {
    const match = part.match(/<([^>]+)>;\s*rel="([^"]+)"/)
    if (match) {
      const [, url, rel] = match
      links[rel] = url
    }
  }

  return links
  // { next: "...", last: "..." }
}
```

### 7.2 GraphQL 커서 페이지네이션

```typescript
async function fetchAllRepos(username: string) {
  const allRepos = []
  let cursor: string | null = null

  do {
    const result = await fetchGraphQL(GET_USER_AQUARIUM_DATA, {
      username,
      after: cursor,
    })

    allRepos.push(...result.user.repositories.nodes)
    const pageInfo = result.user.repositories.pageInfo
    cursor = pageInfo.hasNextPage ? pageInfo.endCursor : null
  } while (cursor)

  return allRepos
}
```

---

## 8. 구현 체크리스트

- [ ] `GITHUB_TOKEN` 환경변수 설정
- [ ] Upstash Redis 연결 설정
- [ ] ETag 캐시 구현
- [ ] Rate limit 모니터링 미들웨어
- [ ] 에러 경계 (404, 403, 500) 처리
- [ ] GraphQL 쿼리 최적화 (필요 필드만)
- [ ] 페이지네이션 (레포 100개 초과 시)
- [ ] 캐시 무효화 웹훅 (push 이벤트)
