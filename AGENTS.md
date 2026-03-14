# Git Aquarium — Agent Context

## Project Overview

Git Aquarium transforms GitHub user data into a living 3D aquarium ecosystem.
Repositories become fish, commits become vitality, and community becomes an ecosystem.
URL pattern: gitaquarium.com/{username}

## Tech Stack (Exact Versions)

| Layer             | Technology                        | Version  |
| ----------------- | --------------------------------- | -------- |
| Framework         | Next.js (App Router)              | 15.x     |
| React             | React                             | 19.x     |
| 3D Engine         | React Three Fiber                 | 9.x      |
| 3D Core           | Three.js                          | 0.170+   |
| 3D Helpers        | @react-three/drei                 | 9.x      |
| 3D PostProcessing | @react-three/postprocessing       | 3.x      |
| State Management  | Zustand                           | 5.x      |
| Styling           | Tailwind CSS                      | 4.x      |
| Database          | Supabase (PostgreSQL)             | latest   |
| Cache             | Upstash Redis (@upstash/redis)    | latest   |
| OG Images         | @vercel/og (Satori)               | latest   |
| Animation (UI)    | Framer Motion                     | 12.x     |
| Sound (Phase 2)   | Tone.js                           | 15.x     |
| Testing           | Vitest + Playwright               | latest   |
| Linting           | ESLint 9 (flat config) + Prettier | latest   |
| Package Manager   | pnpm                              | 9.x      |
| Node              | Node.js                           | 22.x LTS |
| Deployment        | Vercel                            | —        |

## Architecture Decisions

### Why App Router over Pages Router

- Server Components for GitHub data fetching (no client bundle bloat)
- Built-in streaming for progressive aquarium loading
- Native metadata API for OG tags per username

### Why Zustand over Redux/Jotai

- Minimal boilerplate, works seamlessly inside R3F's render loop
- Can subscribe to slices without re-rendering entire scene
- Mutative updates via immer middleware

### Why React Three Fiber over raw Three.js

- Declarative scene graph = component-based fish/environment
- React lifecycle for mounting/unmounting fish
- Ecosystem: drei helpers, postprocessing, spring animations

### Why Upstash Redis over Vercel KV

- Upstash has REST-based API (works in Edge Runtime)
- Built-in rate limiting utilities
- Cost-effective for caching GitHub API responses

## Directory Structure

```
git-aquarium/
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── [locale]/           # i18n locale segment
│   │   │   ├── (landing)/      # Landing page route group
│   │   │   │   └── page.tsx
│   │   │   ├── [username]/     # Dynamic aquarium route
│   │   │   │   ├── page.tsx
│   │   │   │   ├── loading.tsx
│   │   │   │   └── codex/
│   │   │   │       └── page.tsx
│   │   │   ├── compare/
│   │   │   │   └── [u1]/[u2]/
│   │   │   │       └── page.tsx
│   │   │   ├── explore/
│   │   │   │   └── page.tsx
│   │   │   ├── leaderboard/
│   │   │   │   └── page.tsx
│   │   │   ├── privacy/
│   │   │   │   └── page.tsx
│   │   │   └── terms/
│   │   │       └── page.tsx
│   │   ├── api/                # API routes (no locale)
│   │   │   ├── aquarium/
│   │   │   │   └── [username]/
│   │   │   │       └── route.ts
│   │   │   ├── og/
│   │   │   │   └── [username]/
│   │   │   │       └── route.tsx
│   │   │   └── webhook/
│   │   │       └── github/
│   │   │           └── route.ts
│   │   ├── layout.tsx
│   │   └── globals.css
│   ├── engine/                   # Aquarium 3D engine
│   │   ├── scene/
│   │   │   ├── AquariumScene.tsx
│   │   │   ├── Environment.tsx
│   │   │   ├── Camera.tsx
│   │   │   └── PostProcessing.tsx
│   │   ├── fish/
│   │   │   ├── Fish.tsx
│   │   │   ├── FishGroup.tsx
│   │   │   ├── FishBehavior.ts
│   │   │   ├── Boids.ts
│   │   │   ├── Evolution.ts
│   │   │   └── species/
│   │   │       ├── angelfish.ts
│   │   │       ├── manta.ts
│   │   │       ├── shark.ts
│   │   │       └── index.ts
│   │   ├── environment/
│   │   │   ├── Bubbles.tsx
│   │   │   ├── Seaweed.tsx
│   │   │   ├── Particles.tsx
│   │   │   ├── Terrain.tsx
│   │   │   ├── Water.tsx
│   │   │   └── Caustics.tsx
│   │   ├── interaction/
│   │   │   ├── Raycaster.tsx
│   │   │   ├── Tooltip.tsx
│   │   │   └── FishDetail.tsx
│   │   └── sound/
│   │       ├── SoundManager.ts
│   │       └── ambience.ts
│   ├── components/
│   │   ├── ui/                 # 2D overlay UI
│   │   │   ├── StatsHUD.tsx
│   │   │   ├── FishTooltip.tsx
│   │   │   ├── FishDetailPanel.tsx
│   │   │   ├── ShareButton.tsx
│   │   │   └── UsernameInput.tsx
│   │   └── layout/             # App shell
│   │       ├── Header.tsx
│   │       └── Footer.tsx
│   ├── messages/               # i18n translation files
│   │   ├── en/
│   │   │   └── common.json
│   │   └── ko/
│   │       └── common.json
│   ├── lib/                    # Shared utilities
│   │   ├── github/             # GitHub API client
│   │   │   ├── client.ts
│   │   │   ├── graphql.ts
│   │   │   ├── types.ts
│   │   │   └── queries.ts
│   │   ├── aquarium/           # Data transformation
│   │   │   ├── mapper.ts       # Repo → Fish mapping
│   │   │   ├── environment.ts  # Profile → Environment
│   │   │   ├── evolution.ts    # Evolution stage logic
│   │   │   └── species.ts      # Language → Species mapping
│   │   ├── cache/              # Redis caching
│   │   │   └── redis.ts
│   │   └── utils/              # Generic helpers
│   │       └── index.ts
│   ├── stores/                 # Zustand stores
│   │   ├── aquarium-store.ts
│   │   └── ui-store.ts
│   ├── types/                  # Shared TypeScript types
│   │   ├── aquarium.ts
│   │   ├── fish.ts
│   │   └── github.ts
│   └── constants/              # Static data
│       ├── species-map.ts      # Language → species definitions
│       ├── colors.ts           # Design tokens
│       └── config.ts           # App configuration
├── public/
│   ├── models/                 # 3D models (.glb) — Phase 2
│   └── textures/               # Texture files
├── tests/
│   ├── unit/                   # Vitest unit tests
│   ├── integration/            # Vitest integration tests
│   └── e2e/                    # Playwright E2E tests
├── docs/                       # Reference documents
├── AGENTS.md                   # THIS FILE
├── CLAUDE.md                   # Symlink → AGENTS.md
├── .env.example
├── .env.local                  # NEVER commit
├── next.config.ts
├── tailwind.config.ts
├── tsconfig.json
├── vitest.config.ts
├── playwright.config.ts
├── eslint.config.mjs
├── .prettierrc
└── pnpm-lock.yaml
```

## Coding Conventions

### TypeScript

- `strict: true` in tsconfig.json — no exceptions
- No `any` type — use `unknown` + type narrowing
- Prefer `interface` for object shapes, `type` for unions/intersections
- All function parameters and return types must be explicitly typed
- Use `as const` for literal objects (species map, color tokens)

### ESLint / Prettier

- ESLint 9 flat config (`eslint.config.mjs`)
- Plugins: `@typescript-eslint`, `eslint-plugin-react`, `eslint-plugin-react-hooks`, `eslint-plugin-tailwindcss`
- Prettier: single quotes, no semicolons, trailing commas, 80 char width
- Format on save, lint on commit (lint-staged + husky)

### Import Ordering (enforced by ESLint)

```typescript
// 1. React/Next.js
import { useState } from 'react'
import { useRouter } from 'next/navigation'

// 2. Third-party libraries
import { Canvas } from '@react-three/fiber'
import { useGLTF } from '@react-three/drei'
import { create } from 'zustand'

// 3. Internal modules (absolute paths with @/ alias)
import { fetchAquariumData } from '@/lib/github/client'
import { repoToFish } from '@/lib/aquarium/mapper'

// 4. Types (type-only imports)
import type { Fish, AquariumData } from '@/types/aquarium'

// 5. Styles (if any)
import styles from './Component.module.css'
```

### Naming Conventions

| Item               | Convention                                       | Example                               |
| ------------------ | ------------------------------------------------ | ------------------------------------- |
| Files (components) | PascalCase.tsx                                   | `FishGroup.tsx`                       |
| Files (utilities)  | kebab-case.ts                                    | `species-map.ts`                      |
| Files (API routes) | route.ts inside kebab-case dirs                  | `api/aquarium/[username]/route.ts`    |
| Components         | PascalCase                                       | `AquariumScene`                       |
| Hooks              | camelCase with `use` prefix                      | `useAquariumStore`                    |
| Variables          | camelCase                                        | `fishCount`                           |
| Constants          | SCREAMING_SNAKE_CASE                             | `MAX_FISH_COUNT`                      |
| Types/Interfaces   | PascalCase                                       | `FishData`, `EvolutionStage`          |
| Zustand stores     | camelCase with `Store` suffix                    | `aquariumStore`                       |
| CSS classes        | Tailwind utilities only (no custom class names)  | —                                     |
| Test files         | `*.test.ts` / `*.test.tsx`                       | `mapper.test.ts`                      |
| Env variables      | NEXT*PUBLIC* prefix for client, plain for server | `GITHUB_TOKEN`, `NEXT_PUBLIC_APP_URL` |

### Forbidden Patterns

- ❌ `any` type anywhere
- ❌ `dangerouslySetInnerHTML`
- ❌ `useEffect` for data fetching (use Server Components or React Query)
- ❌ Default exports (except page.tsx, layout.tsx, route.ts — Next.js requires it)
- ❌ `var` keyword
- ❌ CSS-in-JS (styled-components, emotion) — use Tailwind only
- ❌ Direct DOM manipulation in React components
- ❌ Storing secrets in client-side code
- ❌ `console.log` in production code (use structured logger)
- ❌ Barrel files (`index.ts` re-exports) — causes tree-shaking issues
- ❌ Relative imports crossing module boundaries (use `@/` alias)
- ❌ `fetch()` without error handling
- ❌ `React.FC` type — use plain function with typed props

### Required Patterns

- ✅ Error boundaries around 3D scene (`<ErrorBoundary>`)
- ✅ Suspense boundaries with loading fallbacks
- ✅ Server Components by default, 'use client' only when needed
- ✅ `useCallback`/`useMemo` inside R3F render loop components
- ✅ `useFrame` for per-frame updates (never `requestAnimationFrame` directly)
- ✅ Zod for runtime validation of API inputs
- ✅ Type-safe environment variables (via `@t3-oss/env-nextjs` or manual Zod)

### Testing Conventions

- Test runner: Vitest
- E2E: Playwright
- Naming: `describe('moduleName')` → `it('should do X when Y')`
- Mock GitHub API responses with MSW (Mock Service Worker)
- Each mapper function has boundary-value tests
- Minimum coverage: 80% lines for `lib/` directory
- No snapshot tests for 3D components (too brittle)

### Git Commit Format

```
<type>(<scope>): <description>

[optional body]

[optional footer]
```

Types: `feat`, `fix`, `refactor`, `test`, `docs`, `chore`, `perf`, `style`
Scopes: `scene`, `fish`, `env`, `api`, `cache`, `ui`, `hud`, `share`, `og`, `deploy`

Examples:

- `feat(fish): add evolution stage calculation based on commit count`
- `fix(api): handle GitHub 404 for deleted users`
- `perf(scene): switch to InstancedMesh for 40+ fish`

### Environment Variables

```bash
# Server-only
GITHUB_TOKEN=ghp_...              # GitHub PAT for API calls
GITHUB_CLIENT_ID=...              # OAuth App ID
GITHUB_CLIENT_SECRET=...          # OAuth App Secret
UPSTASH_REDIS_REST_URL=...        # Redis endpoint
UPSTASH_REDIS_REST_TOKEN=...      # Redis auth
SUPABASE_URL=...                  # Supabase project URL
SUPABASE_SERVICE_ROLE_KEY=...     # Supabase admin key
SENTRY_DSN=...                    # Error tracking

# Client-accessible
NEXT_PUBLIC_APP_URL=https://gitaquarium.com
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
```
