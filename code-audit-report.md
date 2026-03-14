# Code Quality Audit Report

Date: 2026-03-14
Scope: `src/` and test suite mapping in `tests/`

## 1) TypeScript strict mode (`npx tsc --noEmit`)

- Result: PASS
- Command exited with code `0`.

## 2) `any` type usage (`as any` / `: any` in `src/`)

- Result: PASS
- `rg -n "as any|: any" src/` returned no matches.

## 3) Error handling gaps (fetch/API calls without `try/catch`)

### No `try/catch` around network calls

- [src/app/[locale]/[username]/page.tsx](/home/chamdom/Develop/git-aquarium/src/app/[locale]/[username]/page.tsx):27
- [src/app/[locale]/[username]/live/page.tsx](/home/chamdom/Develop/git-aquarium/src/app/[locale]/[username]/live/page.tsx):29
- [src/lib/cache/redis.ts](/home/chamdom/Develop/git-aquarium/src/lib/cache/redis.ts):46
- [src/lib/github/graphql.ts](/home/chamdom/Develop/git-aquarium/src/lib/github/graphql.ts):21

### `try/finally` only (no `catch`, no user-facing failure path)

- [src/components/social/Guestbook.tsx](/home/chamdom/Develop/git-aquarium/src/components/social/Guestbook.tsx):20
- [src/components/social/KudoButton.tsx](/home/chamdom/Develop/git-aquarium/src/components/social/KudoButton.tsx):34
- [src/components/social/VisitorList.tsx](/home/chamdom/Develop/git-aquarium/src/components/social/VisitorList.tsx):17

Risk: network failures can bubble to error boundaries or fail silently in UI components without actionable feedback.

## 4) Memory leak risks

### Timer/listener cleanup issues

- [src/components/ui/TimeSlider.tsx](/home/chamdom/Develop/git-aquarium/src/components/ui/TimeSlider.tsx):36
  - `setInterval` is created in `togglePlay` and not tied to component lifecycle cleanup.
- [src/components/ui/TimeSlider.tsx](/home/chamdom/Develop/git-aquarium/src/components/ui/TimeSlider.tsx):55
  - `beforeunload` listener is added each play run; never explicitly removed during normal lifecycle.
- [src/components/ui/LiveModeOverlay.tsx](/home/chamdom/Develop/git-aquarium/src/components/ui/LiveModeOverlay.tsx):31
  - `idleTimer` stored in state and referenced by stale closure in mount cleanup; latest timer can remain uncleared.
- [src/components/ui/TimelapseGenerator.tsx](/home/chamdom/Develop/git-aquarium/src/components/ui/TimelapseGenerator.tsx):36
  - `URL.createObjectURL` result is not revoked on replacement/unmount.
- [src/components/ui/RecordButton.tsx](/home/chamdom/Develop/git-aquarium/src/components/ui/RecordButton.tsx):22
  - Captured `MediaStream` tracks are not stopped after recording ends.

## 5) Three.js dispose pattern gaps

No explicit `.dispose()` calls were found in `src/engine/` for manually allocated/replaced resources.

### Manual geometry/material allocation without cleanup

- [src/engine/environment/Bubbles.tsx](/home/chamdom/Develop/git-aquarium/src/engine/environment/Bubbles.tsx):44
  - `SphereGeometry` + `MeshStandardMaterial` allocated via `new THREE.*`; no cleanup effect.
- [src/engine/environment/Particles.tsx](/home/chamdom/Develop/git-aquarium/src/engine/environment/Particles.tsx):37
  - New `BufferGeometry` assigned to `pointsRef.current.geometry`; previous geometry not disposed.
- [src/engine/environment/Plankton.tsx](/home/chamdom/Develop/git-aquarium/src/engine/environment/Plankton.tsx):35
  - Same pattern as `Particles`.
- [src/engine/environment/Terrain.tsx](/home/chamdom/Develop/git-aquarium/src/engine/environment/Terrain.tsx):12
  - `PlaneGeometry` regenerated via `useMemo` on dependency change; no explicit disposal path.

Risk: GPU memory growth during remounts, prop changes, or long sessions.

## 6) Hardcoded API key/secret scan

### Pattern scan

- Searched for: `ghp_`, `sk_`, common provider key prefixes, private key headers.
- Result: no hardcoded credentials detected.

### `secret` keyword hits are env-based usage

- [src/app/api/webhook/github/route.ts](/home/chamdom/Develop/git-aquarium/src/app/api/webhook/github/route.ts):21
- [src/lib/auth/config.ts](/home/chamdom/Develop/git-aquarium/src/lib/auth/config.ts):72
- [src/lib/webhook/verify.ts](/home/chamdom/Develop/git-aquarium/src/lib/webhook/verify.ts):6

## 7) Accessibility gaps (interactive elements / labels)

- [src/components/social/KudoButton.tsx](/home/chamdom/Develop/git-aquarium/src/components/social/KudoButton.tsx):64
  - Emoji-only buttons rely on `title`; missing explicit `aria-label`.
- [src/components/ui/RecapCarousel.tsx](/home/chamdom/Develop/git-aquarium/src/components/ui/RecapCarousel.tsx):204
  - Pagination dot buttons have no accessible labels.
- [src/components/merge/MergeInput.tsx](/home/chamdom/Develop/git-aquarium/src/components/merge/MergeInput.tsx):60
  - Remove-user button with text `x`; lacks descriptive label.
- [src/components/compare/CompareInput.tsx](/home/chamdom/Develop/git-aquarium/src/components/compare/CompareInput.tsx):23
  - Inputs use placeholder only; no associated label/`aria-label`.
- [src/components/merge/MergeInput.tsx](/home/chamdom/Develop/git-aquarium/src/components/merge/MergeInput.tsx):52
  - Same placeholder-only input labeling issue.
- [src/components/ui/FishDetailPanel.tsx](/home/chamdom/Develop/git-aquarium/src/components/ui/FishDetailPanel.tsx):42
  - Clickable backdrop `div` is mouse-interactive only; no keyboard equivalent.
- [src/components/ui/TimeSlider.tsx](/home/chamdom/Develop/git-aquarium/src/components/ui/TimeSlider.tsx):82
  - Icon-symbol controls (`▶`, `⏸`) are not given explicit accessible labels.

## 8) Performance issues (rerender/memoization)

### Over-broad Zustand subscriptions

- [src/components/social/KudoButton.tsx](/home/chamdom/Develop/git-aquarium/src/components/social/KudoButton.tsx):28
  - Uses `useSocialStore()` without selector; rerenders on any social-store change.
- [src/components/social/VisitorList.tsx](/home/chamdom/Develop/git-aquarium/src/components/social/VisitorList.tsx):12
  - Same full-store subscription pattern.
- [src/components/ui/AccessibilityPanel.tsx](/home/chamdom/Develop/git-aquarium/src/components/ui/AccessibilityPanel.tsx):9
  - Full `useUIStore()` subscription rerenders on unrelated UI state updates.

### High-frequency rerender trigger

- [src/components/ui/LiveModeOverlay.tsx](/home/chamdom/Develop/git-aquarium/src/components/ui/LiveModeOverlay.tsx):37
  - Timer handle kept in state and updated during user activity; can force unnecessary rerenders during frequent mouse movement.

### Per-render non-deterministic work

- [src/engine/effects/EventAnimations.tsx](/home/chamdom/Develop/git-aquarium/src/engine/effects/EventAnimations.tsx):36
  - Random positions recalculated each render for active events, causing avoidable churn/visual instability.

## 9) Test coverage gaps (major untested areas)

Existing tests cover many utility modules (`mapper`, `boids`, `evolution`, `compare`, `seasons`, etc.) and some E2E flows.

### Major API routes with no direct unit/integration coverage

- [src/app/api/compare/[u1]/[u2]/route.ts](/home/chamdom/Develop/git-aquarium/src/app/api/compare/[u1]/[u2]/route.ts)
- [src/app/api/explore/route.ts](/home/chamdom/Develop/git-aquarium/src/app/api/explore/route.ts)
- [src/app/api/guestbook/[username]/route.ts](/home/chamdom/Develop/git-aquarium/src/app/api/guestbook/[username]/route.ts)
- [src/app/api/kudos/route.ts](/home/chamdom/Develop/git-aquarium/src/app/api/kudos/route.ts)
- [src/app/api/leaderboard/route.ts](/home/chamdom/Develop/git-aquarium/src/app/api/leaderboard/route.ts)
- [src/app/api/recap/[username]/[year]/route.ts](/home/chamdom/Develop/git-aquarium/src/app/api/recap/[username]/[year]/route.ts)
- [src/app/api/report/route.ts](/home/chamdom/Develop/git-aquarium/src/app/api/report/route.ts)
- [src/app/api/visit/route.ts](/home/chamdom/Develop/git-aquarium/src/app/api/visit/route.ts)
- [src/app/api/webhook/github/route.ts](/home/chamdom/Develop/git-aquarium/src/app/api/webhook/github/route.ts)

### Major interactive/client components with logic but no tests

- [src/components/social/Guestbook.tsx](/home/chamdom/Develop/git-aquarium/src/components/social/Guestbook.tsx)
- [src/components/social/KudoButton.tsx](/home/chamdom/Develop/git-aquarium/src/components/social/KudoButton.tsx)
- [src/components/social/VisitorList.tsx](/home/chamdom/Develop/git-aquarium/src/components/social/VisitorList.tsx)
- [src/components/ui/TimeSlider.tsx](/home/chamdom/Develop/git-aquarium/src/components/ui/TimeSlider.tsx)
- [src/components/ui/LiveModeOverlay.tsx](/home/chamdom/Develop/git-aquarium/src/components/ui/LiveModeOverlay.tsx)
- [src/components/ui/RecapCarousel.tsx](/home/chamdom/Develop/git-aquarium/src/components/ui/RecapCarousel.tsx)

### Engine lifecycle/resource management currently untested

- [src/engine/environment/Bubbles.tsx](/home/chamdom/Develop/git-aquarium/src/engine/environment/Bubbles.tsx)
- [src/engine/environment/Particles.tsx](/home/chamdom/Develop/git-aquarium/src/engine/environment/Particles.tsx)
- [src/engine/environment/Plankton.tsx](/home/chamdom/Develop/git-aquarium/src/engine/environment/Plankton.tsx)
- [src/engine/environment/Terrain.tsx](/home/chamdom/Develop/git-aquarium/src/engine/environment/Terrain.tsx)

## Summary

- Strict typing baseline is strong (`tsc` pass, no `any` in `src`).
- Highest-risk gaps are lifecycle cleanup/disposal (timers, object URLs, media streams, manual Three.js resources), plus partial error handling in UI fetch flows.
- Accessibility and rerender optimizations are mostly incremental but numerous and worth batching.
