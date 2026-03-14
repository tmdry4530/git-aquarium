# Browser QA / UX Report

**Date**: 2026-03-14
**Reviewer**: Worker-1 (Browser QA + PRD Compliance)
**Test Environment**: localhost:3000, Next.js dev server (Turbopack)
**Browser**: Chromium (headless, via agent-browser)
**Viewports Tested**: 1280x720 (desktop), 375x812 (mobile)

---

## Executive Summary

**Overall Status: BLOCKED - All page routes return 500 error**

A critical NextIntl serialization bug prevents **every locale route** from rendering. The entire user-facing application is non-functional. API routes also fail due to missing environment variables (Redis, GitHub token).

---

## BUG-001: NextIntl Message Serialization Error (P0 - BLOCKER)

**Severity**: Critical / Blocker
**Affected Routes**: ALL routes under `/[locale]/` (100% of pages)
**Screenshot**: `dogfood-output/01-landing.png`

### Error Message

```
Only plain objects, and a few built-ins, can be passed to Client Components
from Server Components. Classes or null prototypes are not supported.
<... formats=... locale="en" messages={Module} now=... timeZone=... children=...>
                                        ^^^^^^^^
```

### Root Cause

In `src/app/[locale]/layout.tsx:23-26`:

```typescript
const messages = await getMessages()  // returns Module object, not plain object
return (
  <NextIntlClientProvider messages={messages}>  // Module can't be serialized
```

`getMessages()` from `next-intl/server` returns a **Module object** (ES module namespace) instead of a plain JSON object. React Server Components cannot serialize Module objects to Client Components.

### Fix

```typescript
const messages = await getMessages()
// Serialize to plain object:
const plainMessages = JSON.parse(JSON.stringify(messages))
```

Or configure `next-intl` request config properly via `src/i18n/request.ts`.

### Reproduction

1. Navigate to `http://localhost:3000` (redirects to `/en`)
2. Page shows "Something went wrong" error
3. Same error on ALL locale routes: `/en`, `/en/compare/*`, `/en/leaderboard`, `/en/merge`, `/en/explore`, `/en/privacy`

### Evidence

| Route                          | Status | Screenshot           |
| ------------------------------ | :----: | -------------------- |
| `/en` (landing)                |  500   | `01-landing.png`     |
| `/en/compare/octocat/torvalds` |  500   | `02-compare.png`     |
| `/en/leaderboard`              |  500   | `03-leaderboard.png` |
| `/en/merge`                    |  500   | `04-merge.png`       |
| `/en/explore`                  |  500   | (confirmed via curl) |
| `/en/privacy`                  |  500   | (confirmed via curl) |

---

## BUG-002: Missing Environment Variables (P0 - BLOCKER for API)

**Severity**: Critical
**Affected**: All API routes

### Error Messages (from server logs)

```
[Upstash Redis] The 'url' property is missing or undefined in your Redis config.
[Upstash Redis] The 'token' property is missing or undefined in your Redis config.
[Upstash Redis] Redis client was initialized without url or token. Failed to execute command.
```

### Details

- `GET /api/aquarium/octocat` returns `{"error":"Internal server error"}` (500)
- No `.env.local` file exists with required credentials
- Missing: `UPSTASH_REDIS_REST_URL`, `UPSTASH_REDIS_REST_TOKEN`, `GITHUB_TOKEN`

### Impact

- Aquarium data cannot be fetched
- No GitHub API access
- No caching layer

### Fix

- Create `.env.local` from `.env.example` with valid credentials
- Add graceful fallback when Redis is unavailable (development mode)

---

## BUG-003: Embed Route 404 (P1)

**Severity**: High
**Route**: `/embed/[username]`
**Screenshot**: `05-embed.png`

### Details

- `http://localhost:3000/embed/octocat` redirects to `/en/embed/octocat`
- `/en/embed/octocat` returns 404 "Page Not Found"
- The embed page exists at `src/app/embed/[username]/page.tsx` (outside locale group)
- Middleware redirect forces locale prefix, breaking the non-locale route

### Expected Behavior

Embed route should render without locale prefix (for iframe embedding).

### Fix

Update middleware to exclude `/embed/*` from locale redirection.

---

## BUG-004: URL Parse Error in Pipeline (P2)

**Severity**: Medium
**Source**: Server logs

### Error

```
TypeError: Failed to parse URL from /pipeline
  [cause]: TypeError: Invalid URL
    code: 'ERR_INVALID_URL',
    input: '/pipeline'
```

### Details

Some code is attempting to create a `new URL('/pipeline')` without a base URL. This appears during route rendering and may be related to a proxy or middleware configuration.

---

## BUG-005: Next.js "5 Issues" Indicator (P2)

**Severity**: Medium
**Evidence**: Visible in all screenshots (bottom-left red badge "N 5 Issues x")

### Details

Next.js development overlay shows 5 compilation/runtime issues. These are likely related to the NextIntl error but may include additional warnings about:

- Missing environment variables
- TypeScript compilation warnings
- Module resolution issues

---

## Route Testing Summary

### Page Routes

| Route                    | Expected                         | Actual                    | Status |
| ------------------------ | -------------------------------- | ------------------------- | :----: |
| `/`                      | Redirect to `/en`                | Redirects correctly (307) |  PASS  |
| `/en` (landing)          | Landing page with username input | 500 NextIntl error        |  FAIL  |
| `/en/[username]`         | 3D aquarium                      | 500 (blocked by BUG-001)  |  FAIL  |
| `/en/[username]/codex`   | Codex page                       | No page.tsx exists        |  FAIL  |
| `/en/[username]/live`    | Live mode                        | 500 (blocked by BUG-001)  |  FAIL  |
| `/en/[username]/history` | Time travel                      | 500 (blocked by BUG-001)  |  FAIL  |
| `/en/compare/[u1]/[u2]`  | Split comparison                 | 500 (blocked by BUG-001)  |  FAIL  |
| `/en/merge`              | Merge ocean                      | 500 (blocked by BUG-001)  |  FAIL  |
| `/en/leaderboard`        | Global leaderboard               | 500 (blocked by BUG-001)  |  FAIL  |
| `/en/explore`            | Explore page                     | 500 (blocked by BUG-001)  |  FAIL  |
| `/en/privacy`            | Privacy policy                   | 500 (blocked by BUG-001)  |  FAIL  |
| `/en/terms`              | Terms of service                 | 500 (blocked by BUG-001)  |  FAIL  |
| `/embed/[username]`      | Embed widget                     | 404 after locale redirect |  FAIL  |

### API Routes

| Route                      | Method | Expected        | Actual                     | Status |
| -------------------------- | ------ | --------------- | -------------------------- | :----: |
| `/api/aquarium/[username]` | GET    | Aquarium JSON   | 500 (missing env)          |  FAIL  |
| `/api/webhook/github`      | GET    | 405             | 405 Method Not Allowed     |  PASS  |
| `/api/webhook/github`      | POST   | Webhook handler | Not tested (needs payload) |  N/A   |

### Error Handling

| Scenario             | Expected       | Actual                        | Status  |
| -------------------- | -------------- | ----------------------------- | :-----: |
| Non-existent user    | Friendly error | Cannot test (BUG-001)         | BLOCKED |
| Empty username input | Validation     | Cannot test (BUG-001)         | BLOCKED |
| Invalid route        | 404 page       | 404 with "Return Home" button |  PASS   |

### Mobile Viewport (375px)

| Test                          |          Status           |
| ----------------------------- | :-----------------------: |
| Error page renders on mobile  | PASS (readable, centered) |
| Error text not truncated      |           PASS            |
| "Try again" button accessible |           PASS            |
| Actual page layout responsive | BLOCKED (no pages render) |

---

## Console Errors (from server logs)

1. `TypeError: Only plain objects... messages={Module}` - NextIntl serialization (BUG-001)
2. `[Upstash Redis] url/token missing` - Redis not configured (BUG-002)
3. `TypeError: Failed to parse URL from /pipeline` - Invalid URL (BUG-004)

---

## Positive Observations

1. **404 page**: Custom 404 page works well - clean design, dark theme, "Return Home" button
2. **Locale redirect**: Root `/` correctly redirects to `/en` (307)
3. **Webhook route**: Properly rejects GET with 405
4. **i18n hreflang headers**: Present in HTTP response headers for all locale routes
5. **Font loading**: Preload links for custom fonts present in headers
6. **Dark theme**: Error pages use consistent dark navy background (`#031528`)

---

## Recommendations (Priority Order)

### P0 - Must Fix Before Any Further QA

1. **Fix NextIntl serialization** in `src/app/[locale]/layout.tsx` - convert Module to plain object
2. **Create `.env.local`** with at minimum `GITHUB_TOKEN` and Redis credentials
3. **Add env validation** with graceful fallback for dev mode

### P1 - Fix Before Launch

4. **Fix embed route** middleware to exclude `/embed/*` from locale redirect
5. **Create codex page** (`src/app/[locale]/[username]/codex/page.tsx`)
6. **Fix `/pipeline` URL** parse error

### P2 - Improve

7. **Add loading states** for slow API responses
8. **Add error boundaries** per route (not just global)
9. **Test with real GitHub data** once env vars are configured
10. **Re-run full QA** after P0 fixes are applied

---

## Testing Artifacts

| File                                | Description                             |
| ----------------------------------- | --------------------------------------- |
| `dogfood-output/01-landing.png`     | Landing page (500 error)                |
| `dogfood-output/02-compare.png`     | Compare page (500 error)                |
| `dogfood-output/03-leaderboard.png` | Leaderboard page (500 error)            |
| `dogfood-output/04-merge.png`       | Merge page (500 error - same as others) |
| `dogfood-output/05-embed.png`       | Embed page (404)                        |
| `dogfood-output/06-mobile-375.png`  | Mobile viewport (500 error)             |

---

## Next Steps

This QA session was **severely limited** by the NextIntl blocker (BUG-001). Once fixed, a full re-test should cover:

- Complete landing -> username input -> aquarium flow
- Fish rendering and interaction (hover, click, detail panel)
- Share button and OG image generation
- Mobile touch interactions
- Cross-browser testing
- Performance profiling (FPS, load times)
