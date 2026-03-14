# QA Round 2 Report

**Date**: 2026-03-15
**Scope**: P0 수정 검증 + 전체 재테스트
**Environment**: localhost:3000, Next.js dev (Turbopack), Chromium headless

---

## Executive Summary

**P0 블로커 2건 수정 확인 완료.** 핵심 유저 플로우(랜딩 → 수족관 생성)가 정상 동작합니다. 단, NextAuth(AUTH_SECRET 미설정)와 Supabase(미설정) 의존 기능에서 콘솔 에러가 반복 발생합니다.

---

## P0 수정 검증

### BUG-001 (NextIntl 직렬화) — FIXED

- `/en` 랜딩: 정상 로드, 500 에러 해소
- `/ko` 랜딩: 정상 로드, i18n 동작 확인
- **증거**: `screenshots/01-landing-en.png`, `02-landing-ko.png`

### BUG-002 (API env vars) — FIXED

- `/api/aquarium/torvalds`: 정상 응답 (11 fish, 234K stars)
- Redis 미설정 시 graceful fallback (pass-through 모드)

---

## 기능 테스트 결과

### 1. 유저 플로우: 랜딩 → 수족관 생성 — PASS

- 유저네임 `tmdry4530` 입력 → DIVE 클릭 → `/en/tmdry4530` 네비게이션
- 3D 수족관 정상 렌더링: 물고기 56마리 (Alive 21, Fossil 35), TypeScript top language
- HUD 표시: @tmdry4530, ALIVE 21, FOSSIL 35, STARS 0, TOP TypeScript
- **증거**: `screenshots/03-input-filled.png`, `04-aquarium-tmdry4530.png`

### 2. 빈 입력 에러 핸들링 — PASS (기능적)

- DIVE 클릭 시 네비게이션 차단됨
- 주의: 사용자에게 명시적 에러 메시지 미표시 (UX 개선 권장)
- **증거**: `screenshots/08-empty-input.png`

### 3. Compare 라우트 — PASS

- `/en/compare/tmdry4530/torvalds`: 정상 렌더링
- Split view: tmdry4530 (56 fish, 0 stars) vs torvalds (11 fish, 234K stars)
- 비교 바 차트: Fish, Languages, Stars, Legendary, Active % 표시
- **증거**: `screenshots/05-compare.png`

### 4. Leaderboard 라우트 — PARTIAL (Supabase 미설정)

- `/en/leaderboard`: 페이지 로드되지만 "Try again" 에러 상태
- 원인: Supabase 미설정 → 데이터 조회 실패
- ErrorBoundary가 정상 동작하여 앱 크래시 방지
- **증거**: `screenshots/06-leaderboard.png`

### 5. Explore 라우트 — PARTIAL (Supabase 미설정)

- `/en/explore`: 동일하게 "Try again" 에러 상태
- **증거**: `screenshots/07-explore.png`

### 6. 모바일 반응형 — NOT TESTED

- agent-browser가 viewport 리사이즈를 지원하지 않아 테스트 불가
- 수동 테스트 또는 Playwright E2E로 검증 필요

---

## 콘솔 에러 분석

### ERROR-001: NextAuth SessionProvider (반복, P1)

```
ClientFetchError: There was a problem with the server configuration.
```

- **빈도**: 모든 페이지에서 반복 (SessionProvider가 layout에 있음)
- **원인**: AUTH_SECRET / GITHUB_CLIENT_ID / GITHUB_CLIENT_SECRET 미설정
- **영향**: 기능적 영향 없음 (비로그인 상태로 정상 동작), 콘솔 노이즈
- **수정 권장**: SessionProvider에서 env var 체크 후 조건부 렌더링

### ERROR-002: Supabase 연결 실패 (Leaderboard/Explore, P2)

```
Error: {code: ..., details: Null, hint: Null, message: ...}
```

- **영향**: Leaderboard, Explore 페이지 에러 상태
- **원인**: SUPABASE_URL / KEY 미설정
- **수정 권장**: Supabase 미설정 시 mock 데이터 또는 "설정 필요" 안내 표시

### ERROR-003: GlobalError 중첩 html 태그 (P2)

```
In HTML, <html> cannot be a child of <body>
You are mounting a new html component when a previous one has not first unmounted
```

- **원인**: GlobalError 컴포넌트가 `<html>` 태그를 포함하여 중첩 발생
- **수정 권장**: `src/app/error.tsx` 또는 `global-error.tsx`에서 `<html>` 제거

### WARNING-001: THREE.js Deprecation (무시 가능)

```
THREE.Clock: This module has been deprecated. Please use THREE.Timer instead.
THREE.WebGLShadowMap: PCFSoftShadowMap has been deprecated.
```

- **영향**: 없음 (Three.js 내부 경고)

### WARNING-002: metadataBase 미설정 (P3)

```
metadataBase property in metadata export is not set
```

- **수정**: `src/app/layout.tsx`에 `metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL)` 추가

---

## 요약

| 카테고리                    | 결과                          |
| --------------------------- | ----------------------------- |
| P0 수정 검증                | **2/2 FIXED**                 |
| 핵심 플로우 (랜딩 → 수족관) | **PASS**                      |
| Compare                     | **PASS**                      |
| Leaderboard/Explore         | **PARTIAL** (Supabase 미설정) |
| 빈 입력 처리                | **PASS** (UX 개선 권장)       |
| 모바일 반응형               | **NOT TESTED**                |
| 콘솔 에러                   | 3 종류 (env 미설정 관련)      |

### 신규 이슈 (P1-P3)

| #   | 심각도 | 이슈                                    | 수정 방법                           |
| --- | ------ | --------------------------------------- | ----------------------------------- |
| 1   | P1     | NextAuth SessionProvider 콘솔 에러 반복 | env 없으면 SessionProvider 비활성화 |
| 2   | P2     | GlobalError 중첩 html 태그              | global-error.tsx에서 html/body 제거 |
| 3   | P2     | Leaderboard/Explore Supabase 에러       | 미설정 시 안내 UI 표시              |
| 4   | P3     | metadataBase 미설정 경고                | layout.tsx에 metadataBase 추가      |
| 5   | P3     | 빈 입력 시 에러 메시지 없음             | 유효성 검사 피드백 UI 추가          |
