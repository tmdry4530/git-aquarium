# Git Aquarium — Master Implementation Plan

> Phase 1 MVP → Phase 6 Platform Expansion
> Solo developer with multi-agent workflow (Claude Code, OpenAI Codex, Gemini CLI)

---

## Table of Contents

1. [AGENTS.md — Shared Agent Context File](#1-agentsmd--shared-agent-context-file)
2. [Pre-requisite Reference Documents](#2-pre-requisite-reference-documents--list--writing-order)
3. [Phase-by-Phase Task Breakdown](#3-phase-by-phase-task-breakdown)
4. [Agent Task Prompt Examples](#4-agent-task-prompt-examples)
5. [Multi-Agent Coordination Strategy](#5-multi-agent-coordination-strategy)
6. [Quality Gates & Checkpoints](#6-quality-gates--checkpoints)

---

## 1. AGENTS.md — Shared Agent Context File

This file should be placed at the project root as `AGENTS.md` (readable by all agents) AND symlinked/copied as `CLAUDE.md` for Claude Code.

```markdown
# Git Aquarium — Agent Context

## Project Overview
Git Aquarium transforms GitHub user data into a living 3D aquarium ecosystem.
Repositories become fish, commits become vitality, and community becomes an ecosystem.
URL pattern: gitaquarium.com/{username}

## Tech Stack (Exact Versions)
| Layer | Technology | Version |
|-------|-----------|---------|
| Framework | Next.js (App Router) | 15.x |
| React | React | 19.x |
| 3D Engine | React Three Fiber | 9.x |
| 3D Core | Three.js | 0.170+ |
| 3D Helpers | @react-three/drei | 9.x |
| 3D PostProcessing | @react-three/postprocessing | 3.x |
| State Management | Zustand | 5.x |
| Styling | Tailwind CSS | 4.x |
| Database | Supabase (PostgreSQL) | latest |
| Cache | Upstash Redis (@upstash/redis) | latest |
| OG Images | @vercel/og (Satori) | latest |
| Animation (UI) | Framer Motion | 12.x |
| Sound (Phase 2) | Tone.js | 15.x |
| Testing | Vitest + Playwright | latest |
| Linting | ESLint 9 (flat config) + Prettier | latest |
| Package Manager | pnpm | 9.x |
| Node | Node.js | 22.x LTS |
| Deployment | Vercel | — |

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
| Item | Convention | Example |
|------|-----------|---------|
| Files (components) | PascalCase.tsx | `FishGroup.tsx` |
| Files (utilities) | kebab-case.ts | `species-map.ts` |
| Files (API routes) | route.ts inside kebab-case dirs | `api/aquarium/[username]/route.ts` |
| Components | PascalCase | `AquariumScene` |
| Hooks | camelCase with `use` prefix | `useAquariumStore` |
| Variables | camelCase | `fishCount` |
| Constants | SCREAMING_SNAKE_CASE | `MAX_FISH_COUNT` |
| Types/Interfaces | PascalCase | `FishData`, `EvolutionStage` |
| Zustand stores | camelCase with `Store` suffix | `aquariumStore` |
| CSS classes | Tailwind utilities only (no custom class names) | — |
| Test files | `*.test.ts` / `*.test.tsx` | `mapper.test.ts` |
| Env variables | NEXT_PUBLIC_ prefix for client, plain for server | `GITHUB_TOKEN`, `NEXT_PUBLIC_APP_URL` |

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
```

---

## 2. Pre-requisite Reference Documents — List & Writing Order

### Document Dependency Graph

```
[D1] AGENTS.md (Agent Context)
  │
  ├──► [D2] Design Tokens & Style Guide
  │      │
  │      └──► [D7] Component Tree & Design Doc
  │
  ├──► [D3] GitHub API Integration Spec
  │      │
  │      ├──► [D4] Aquarium Data Schema
  │      │      │
  │      │      └──► [D6] State Management Spec (Zustand)
  │      │
  │      └──► [D5] Fish Species Mapping Table
  │
  ├──► [D8] 3D Scene Architecture Doc
  │      │
  │      └──► [D7] Component Tree (cross-dependency)
  │
  └──► [D9] Supabase DB Schema
         │
         └──► [D4] Aquarium Data Schema (cross-dependency)
```

### Writing Priority Order

| Priority | Doc ID | Document | Description | Depends On | Est. Size |
|----------|--------|----------|-------------|------------|-----------|
| 1 | D1 | `docs/AGENTS.md` | Agent context file (Section 1 above) | Nothing | ~300 lines |
| 2 | D2 | `docs/design-tokens.md` | Colors, typography, spacing, breakpoints | D1 | ~100 lines |
| 3 | D3 | `docs/github-api-spec.md` | REST + GraphQL endpoints, rate limit strategy, error codes, pagination, ETag caching, response shapes | D1 | ~250 lines |
| 4 | D4 | `docs/aquarium-data-schema.md` | Full JSON schema for Aquarium API response (`/api/aquarium/{username}`), TypeScript types | D3 | ~200 lines |
| 5 | D5 | `docs/fish-species-map.md` | Language → species, star → size formula, commit → evolution stage, special conditions | D3 | ~150 lines |
| 6 | D6 | `docs/state-management-spec.md` | Zustand store shape, slices, actions, selectors, R3F integration | D4 | ~120 lines |
| 7 | D7 | `docs/component-tree.md` | Full component hierarchy (3D + UI), props flow, data flow, route structure | D2, D4, D8 | ~200 lines |
| 8 | D8 | `docs/3d-scene-architecture.md` | R3F component hierarchy, performance budget, InstancedMesh strategy, camera, lighting, post-processing | D1 | ~200 lines |
| 9 | D9 | `docs/supabase-schema.md` | DB tables, RLS policies, indexes — Phase 1 only needs users + snapshots | D4 | ~100 lines |

### Parallelism

- **Batch 1 (sequential, must be first):** D1
- **Batch 2 (parallel after D1):** D2, D3, D8
- **Batch 3 (parallel after D3):** D4, D5
- **Batch 4 (after D4):** D6, D9
- **Batch 5 (after D2 + D4 + D8):** D7

### What Each Doc Must Contain

**D3: GitHub API Integration Spec**
- Exact REST endpoints with parameters
- Full GraphQL query (already in PRD Section 12.2)
- Response type definitions (TypeScript)
- Rate limit handling: ETag caching, X-RateLimit headers, backoff strategy
- Error scenarios: 404 user, 403 rate limit, 500 server error
- Pagination: Link header parsing, max 10 pages
- Cache TTLs per endpoint

**D5: Fish Species Mapping Table**
- Language → species mapping (15 species from PRD)
- Size formula: `baseSize + log2(stars + 1) * scaleFactor`, capped at maxSize
- Evolution stages with exact thresholds:
  - Egg: 0–2 commits
  - Fry: 3–10 commits
  - Juvenile: 11–50 commits
  - Adult: 51–200 commits
  - Elder: 200+ commits AND 1+ year
  - Legendary: 1000+ stars OR special conditions
  - Fossil: 180+ days since last commit
- Swim speed formula: based on commits in last 30 days
- Special fish conditions (Leviathan, Phoenix, Hydra, etc.)

**D8: 3D Scene Architecture Doc**
- Performance budget: 60fps desktop / 30fps mobile
- Max draw calls: 50
- Max triangles: 100K (desktop), 30K (mobile)
- InstancedMesh threshold: 40+ fish
- Camera: PerspectiveCamera, FOV 60, orbit controls (limited)
- Lighting: ambient + directional (sun) + caustic shader
- Post-processing: bloom (for bioluminescence), fog
- LOD levels: High (< 20 fish), Medium (20–50), Low (50+)
- Mobile adaptations: reduce particle count, simpler shaders

---

## 3. Phase-by-Phase Task Breakdown

### Legend

- **Agent suitability**: CC = Claude Code, CX = OpenAI Codex, GC = Gemini CLI
- **Complexity**: S = Small (< 1hr), M = Medium (1–3hr), L = Large (3–6hr)
- **║** = Can run in parallel, **→** = Must be sequential

---

### Phase 0: Project Setup & Reference Docs

> Goal: Scaffold project, write all reference docs, establish conventions.

| Task ID | Title | Agent | Why This Agent | Prerequisites | Deliverables | Acceptance Criteria | Complexity |
|---------|-------|-------|---------------|---------------|--------------|-------------------|------------|
| P0-01 | Initialize Next.js 15 project with pnpm | CC | Claude Code excels at project scaffolding with exact config | None | `package.json`, `next.config.ts`, `tsconfig.json`, `tailwind.config.ts`, `eslint.config.mjs`, `.prettierrc`, `.gitignore`, `.env.example` | `pnpm dev` runs without errors, TypeScript strict mode, Tailwind works | M |
| P0-02 | Configure testing infrastructure | CC | Needs to integrate vitest + playwright with Next.js | P0-01 | `vitest.config.ts`, `playwright.config.ts`, sample test passes | `pnpm test` and `pnpm test:e2e` both run | S |
| P0-03 | Set up husky + lint-staged | CC | Git hooks config | P0-01 | `.husky/`, `lint-staged` in package.json | Pre-commit runs ESLint + Prettier on staged files | S |
| P0-04 | Write AGENTS.md / CLAUDE.md | CC | Large structured doc, Claude handles long-form well | P0-01 | `AGENTS.md`, `CLAUDE.md` (symlink) | Contains all sections from Section 1 above | M |
| P0-05 | Write Design Tokens doc (D2) | GC | Gemini good at structured reference docs | P0-04 | `docs/design-tokens.md` | Color palette, typography, spacing, breakpoints from PRD §5.1 | S |
| P0-06 | Write GitHub API Spec (D3) | CC | Needs deep understanding of GitHub API + caching strategy | P0-04 | `docs/github-api-spec.md` | REST endpoints, GraphQL query, rate limit strategy, TypeScript types | M |
| P0-07 | Write 3D Scene Architecture doc (D8) | CC | R3F architecture requires strong 3D understanding | P0-04 | `docs/3d-scene-architecture.md` | Component hierarchy, performance budget, LOD strategy | M |
| P0-08 | Write Aquarium Data Schema (D4) | CX | Codex good at generating JSON schemas from specs | P0-06 | `docs/aquarium-data-schema.md`, `src/types/aquarium.ts`, `src/types/fish.ts` | Full JSON schema, TypeScript types, matches PRD §12.4 | M |
| P0-09 | Write Fish Species Mapping Table (D5) | GC | Structured data table, Gemini handles well | P0-06 | `docs/fish-species-map.md`, `src/constants/species-map.ts` | 15 species, evolution formulas, size formulas | M |
| P0-10 | Write State Management Spec (D6) | CC | Zustand store design needs careful architecture | P0-08 | `docs/state-management-spec.md` | Store shape, slices, actions, R3F integration patterns | S |
| P0-11 | Write Component Tree doc (D7) | CC | Full architecture overview | P0-05, P0-08, P0-07 | `docs/component-tree.md` | All components listed with props, data flow diagram | M |
| P0-12 | Write Supabase Schema doc (D9) | CX | SQL schema generation | P0-08 | `docs/supabase-schema.md` | Tables, RLS policies, indexes for Phase 1 | S |
| P0-13 | Set up directory structure with placeholder files | CC | Scaffold all directories per AGENTS.md | P0-04 | All directories created with `.gitkeep` or placeholder files | Directory structure matches AGENTS.md exactly | S |
| P0-14 | Set up CI/CD: GitHub Actions workflows | CX | CI/CD infrastructure, yaml config | P0-01 | `.github/workflows/ci.yml`, `visual-regression.yml`, `e2e.yml`, `dependency-review.yml` | `ci.yml` runs lint→typecheck→test→build on push/PR. E2E runs on PR to main. Dependency review on PR | M |
| P0-15 | Set up i18n: next-intl + locale routing | CC | Routing architecture, must be early | P0-01 | `src/app/[locale]/` route segment, `src/messages/en/common.json`, `src/messages/ko/common.json`, `next-intl` config in `next.config.ts`, middleware for locale detection | All routes under `[locale]`, EN default, KO available, URL pattern `/{locale}/{username}` | M |
| P0-16 | Community docs: CONTRIBUTING, CODE_OF_CONDUCT, templates | GC | Documentation, Gemini handles well | P0-04 | `CONTRIBUTING.md`, `CODE_OF_CONDUCT.md`, `.github/ISSUE_TEMPLATE/bug_report.yml`, `.github/ISSUE_TEMPLATE/feature_request.yml`, `.github/ISSUE_TEMPLATE/fish_species_proposal.yml`, `.github/PULL_REQUEST_TEMPLATE.md` | All templates render correctly in GitHub UI | S |

**Parallelism:**
```
P0-01 → P0-02 ║ P0-03 ║ P0-04 ║ P0-14 (CX)
                              → P0-05 (GC) ║ P0-06 (CC) ║ P0-07 (CC) ║ P0-15 (CC) ║ P0-16 (GC)
                                             → P0-08 (CX) ║ P0-09 (GC)
                                               → P0-10 (CC) ║ P0-12 (CX)
                              → P0-13 (CC)
P0-05 + P0-08 + P0-07 → P0-11 (CC)
```

---

### Phase 1: MVP — "수족관 생성" (4 weeks)

#### Week 1: Project Setup + 3D Scene + GitHub API

| Task ID | Title | Agent | Why | Prerequisites | Deliverables | Acceptance Criteria | Complexity |
|---------|-------|-------|-----|---------------|--------------|-------------------|------------|
| P1-01 | GitHub API client (REST + GraphQL) | CX | API client with caching, error handling, pagination | D3, D4 | `src/lib/github/client.ts`, `graphql.ts`, `queries.ts`, `types.ts` | Fetches user data, handles pagination (100+ repos), returns typed response, handles 404/403/429 | L |
| P1-02 | Redis caching layer | CX | Upstash Redis integration with ETag support | D3, P0-01 | `src/lib/cache/redis.ts` | Cache get/set with TTL, ETag storage, conditional requests, cache-only fallback mode | M |
| P1-03 | Repo → Fish data transformer | CX | Pure mapping logic, Codex good at data transforms | D4, D5 | `src/lib/aquarium/mapper.ts`, `evolution.ts`, `species.ts` | Maps all 15 languages to species, calculates size/speed/evolution, handles edge cases (no language, no commits) | M |
| P1-04 | Aquarium API route | CX | Next.js API route with caching + transformation pipeline | P1-01, P1-02, P1-03 | `src/app/api/aquarium/[username]/route.ts` | Returns valid AquariumData JSON, Redis cached, proper error responses (400/404/429/500) | M |
| P1-05 | Unit tests for mapper/evolution/species | CX | Codex excellent at generating comprehensive test cases | P1-03 | `tests/unit/mapper.test.ts`, `evolution.test.ts`, `species.test.ts` | Boundary value tests for all thresholds (evolution, size, fossil), 90%+ coverage of lib/aquarium/ | M |
| P1-06 | Basic R3F scene setup | CC | R3F boilerplate with Canvas, camera, lights | D8 | `src/engine/scene/AquariumScene.tsx` | Canvas renders, camera positioned, ambient + directional light, fog enabled | M |
| P1-07 | Basic Fish component (sphere placeholder) | CC | R3F mesh with animation | D8, P1-06 | `src/engine/fish/Fish.tsx` | Colored sphere, tail oscillation via `useFrame`, autonomous swimming (simple sine path), size from data | M |
| P1-08 | Zustand aquarium store | CC | Store setup with typed slices | D6/P0-10 | `src/stores/aquarium-store.ts`, `ui-store.ts` | Stores fish array, environment data, selected fish, loading state. Works inside R3F | S |
| P1-09 | Environment: terrain + rocks + seaweed | CC | 3D objects, R3F scene components | D8, P1-06 | `src/engine/environment/Terrain.tsx`, `src/engine/scene/Environment.tsx` | Procedural sea floor, scattered rocks, swaying seaweed (simple vertex animation) | M |
| P1-10 | Bubbles + particle system | CC | 3D GPU particles, R3F component | D8, P1-06 | `src/engine/environment/Bubbles.tsx` | Rising bubbles (instanced spheres), slight random drift, recycled at top | M |
| P1-11 | Caustic lighting effect | CC | Shader work, Claude handles GLSL | D8, P1-06 | `src/engine/environment/Caustics.tsx` | Animated caustic pattern projected on terrain, subtle and performant | M |

**Parallelism (Week 1):**
```
P1-01 (CX) ║ P1-06 (CC, after D8) ║ P1-08 (CC, after D6/P0-10)
P1-02 (CX) ║ P1-07 (CC, after P1-06)
P1-03 (CX) ║ P1-09 (CC) ║ P1-10 (CC)
P1-01 + P1-02 + P1-03 → P1-04 (CX)
P1-03 → P1-05 (CX)
P1-06 → P1-11 (CC)
```

#### Week 2: Fish System + Data Integration

| Task ID | Title | Agent | Why | Prerequisites | Deliverables | Acceptance Criteria | Complexity |
|---------|-------|-------|-----|---------------|--------------|-------------------|------------|
| P1-12 | FishGroup: render fish from API data | CC | Connects API data → 3D scene via Zustand | P1-04, P1-07, P1-08 | `src/engine/fish/FishGroup.tsx` | Renders correct number of fish, colored by language, sized by stars | L |
| P1-13 | Fish swim behavior (autonomous) | CC | Complex animation: direction changes, vertical bobbing, turn radius | P1-12 | Updated `Fish.tsx` with behavior system | Fish swim naturally — change direction periodically, avoid boundaries, bob vertically, smooth turning | L |
| P1-14 | Fossil fish (dead repos) | CC | 3D variant of Fish with grayscale + sinking | P1-12 | Fossil variant in `Fish.tsx` | Grey color, rests on sea floor, no animation, slight tilt | S |
| P1-15 | Environment data integration | CC | Connect profile data → 3D environment visuals | P1-08, P1-09 | Updated `Environment.tsx` | Tank size scales with total commits, brightness with followers, terrain from contribution data | M |
| P1-16 | Plankton particles (background life) | CC | 3D ambient floating particles | P1-10 | `src/engine/environment/Particles.tsx` | Tiny floating specks, slight glow, density based on follower count | S |
| P1-17 | Water surface effect | CC | Shader-based water surface | P1-06 | `src/engine/environment/Water.tsx` | Animated water surface with refraction hint, visible from below | M |

**Parallelism (Week 2):**
```
P1-12 (CC) → P1-13 (CC) → P1-14 (CC)
P1-15 (CC) ║ P1-16 (CC) ║ P1-17 (CC)
```

#### Week 3: Interaction + UI

| Task ID | Title | Agent | Why | Prerequisites | Deliverables | Acceptance Criteria | Complexity |
|---------|-------|-------|-----|---------------|--------------|-------------------|------------|
| P1-18 | Raycasting: mouse hover → fish highlight | CC | R3F raycasting with pointer events | P1-12 | Updated `Fish.tsx` with hover glow | Hovered fish gets emissive highlight, cursor changes to pointer | M |
| P1-19 | Fish tooltip on hover | CC | 3D overlay coordination | P1-18 | `src/components/ui/FishTooltip.tsx` | Shows repo name, language, stars, last commit. Follows fish position. Disappears on unhover | M |
| P1-20 | Fish click → detail panel | GC | Pure UI side panel with repo details | P1-18 | `src/components/ui/FishDetailPanel.tsx` | Slide-in panel: repo name, description, stars, forks, language, commits, link to GitHub. Close button | M |
| P1-21 | Camera controls (orbit, zoom, pan) | CC | OrbitControls from drei with limits | P1-06 | Updated `AquariumScene.tsx` | Mouse drag = orbit, scroll = zoom (clamped), right-drag = pan. Smooth damping. Touch support | M |
| P1-22 | Camera parallax on mouse move | CC | Subtle camera shift following cursor | P1-21 | Updated camera system | When not actively controlling, camera shifts slightly with mouse position (idle parallax) | S |
| P1-23 | Stats HUD overlay | GC | HTML overlay with stats | P1-08 | `src/components/ui/StatsHUD.tsx` | Top-left: username, alive count, fossil count, total stars, language distribution tags | M |
| P1-24 | Landing page with username input | GC | UI page + form + navigation | P0-01 | `src/app/[locale]/(landing)/page.tsx`, `src/components/ui/UsernameInput.tsx` | Input field, "DIVE" button, validates username format, navigates to /[username], recent aquariums carousel (hardcoded for MVP) | M |
| P1-25 | Aquarium page (data fetching + scene mount) | CC | Server Component data fetching + client scene | P1-04, P1-12 | `src/app/[locale]/[username]/page.tsx`, `loading.tsx` | Server-fetches aquarium data, passes to client AquariumScene, loading state with dive animation, error boundary | L |
| P1-26 | Responsive: mobile touch + performance | CC | Touch events + adaptive quality | P1-21, P1-12 | Updated scene components | Touch drag/pinch works, fish count limited on mobile (20), particle reduction, FPS monitoring | M |
| P1-27 | Integration tests for API route | CX | MSW mocks + API route testing | P1-04 | `tests/integration/aquarium-api.test.ts` | Tests: valid user, 404 user, rate limited, cache hit/miss, large repo count | M |
| P1-38 | WebGL fallback detection + cascade | CC | WebGL detection, canvas fallback, needs 3D knowledge | P1-25 | `src/engine/fallback/WebGLDetector.tsx`, `CanvasFallback.tsx` | 4-tier detection: WebGL2→WebGL1→Canvas 2D→static SVG/text. Shows appropriate fallback per capability | M |

**Parallelism (Week 3):**
```
P1-18 (CC) → P1-19 (CC) → P1-20 (GC)
P1-21 (CC) → P1-22 (CC)
P1-23 (GC) ║ P1-24 (GC)
P1-24 → P1-25 (CC) → P1-26 (CC) → P1-38 (CC)
P1-27 (CX) — independent
```

#### Week 4: Share + Deploy + Polish

| Task ID | Title | Agent | Why | Prerequisites | Deliverables | Acceptance Criteria | Complexity |
|---------|-------|-------|-----|---------------|--------------|-------------------|------------|
| P1-28 | Dynamic OG image generation | CX | API route, Satori + @vercel/og integration | P1-04 | `src/app/api/og/[username]/route.tsx` | Generates PNG with aquarium stats, fish count, top species. Proper og:image meta tags | M |
| P1-29 | Share button (URL copy + Twitter text) | GC | UI component with clipboard API | P1-25 | `src/components/ui/ShareButton.tsx` | "Share" button → copies URL, opens Twitter with pre-filled text. Toast notification on copy | S |
| P1-30 | GIF/WebM recording (client-side) | CC | MediaRecorder + canvas capture | P1-25 | `src/components/ui/RecordButton.tsx` | Records 5-second loop of canvas, downloads as WebM. Progress indicator | L |
| P1-31 | SEO: metadata, sitemap, robots | GC | Next.js metadata API | P1-25 | Updated `layout.tsx`, `[locale]/[username]/page.tsx` metadata | Dynamic title/description per user, og:image, Twitter card, JSON-LD | S |
| P1-32 | Error handling: 404 page, error boundary | CC | Global error handling | P1-25 | `src/app/not-found.tsx`, `src/app/error.tsx`, `src/app/[locale]/[username]/error.tsx` | Custom 404 (underwater theme), error boundary catches 3D crashes gracefully | M |
| P1-33 | Performance: InstancedMesh for 40+ fish | CC | Critical performance optimization | P1-12 | Updated `FishGroup.tsx` | When fish > 40, switch to InstancedMesh. Benchmark: 100 fish at 30fps | L |
| P1-34 | Vercel deployment + env setup | CC | Deployment config | P1-25 | `vercel.json` (if needed), env vars configured | Production deploy works, env vars set, preview deploys on PR | M |
| P1-35 | E2E tests (core flows) | CX | Playwright E2E | P1-34 | `tests/e2e/aquarium.spec.ts` | Tests: landing → input → aquarium loads, fish hover tooltip, share button, 404 user, mobile viewport | M |
| P1-37 | Accessibility: aria labels, keyboard nav | GC | a11y compliance | P1-23, P1-20 | Updated UI components | Scene has aria-label, Tab navigates fish, Enter opens detail, reduced motion support | M |
| P1-39 | Analytics integration (PostHog/Plausible) | CX | Tracking infrastructure, event schema | P1-25 | `src/lib/analytics/tracker.ts`, PostHog/Plausible SDK integration, tracking events: `aquarium_created`, `fish_clicked`, `share_initiated`, `share_completed`, `session_duration`, `error_occurred`, `fallback_triggered` | Events fire correctly, privacy-friendly (no PII), works with CSP headers | M |
| P1-40 | Legal pages: Privacy Policy + Terms of Service | GC | Static content pages, Gemini handles docs | P0-15 | `src/app/[locale]/privacy/page.tsx`, `src/app/[locale]/terms/page.tsx`, i18n EN+KO | Pages render, linked from footer, cover GitHub API data usage, GDPR/PIPA essentials | S |
| P1-41 | Color-blind mode + high-contrast toggle | GC | Accessibility UI, patterns on fish | P1-12, P1-23 | `src/components/ui/AccessibilitySettings.tsx`, fish pattern overlays (stripes, dots, grid per species), settings persisted in localStorage | 3 color-blind types addressed (protanopia, deuteranopia, tritanopia), toggle in settings panel, patterns distinguishable | M |

**Parallelism (Week 4):**
```
P1-28 (CX) ║ P1-29 (GC) ║ P1-30 (CC) ║ P1-31 (GC) ║ P1-39 (CX)
P1-32 (CC) ║ P1-33 (CC) ║ P1-37 (GC) ║ P1-40 (GC) ║ P1-41 (GC)
P1-34 (CC) — after all features done
P1-35 (CX) — after P1-34
```

---

### Phase 2: Ecosystem — "살아있는 바다" (6 weeks)

| Task ID | Title | Agent | Prerequisites | Deliverables | Complexity |
|---------|-------|-------|---------------|--------------|------------|
| P2-01 | 15 species 3D models (low-poly GLB) | External / Manual | D5 | `public/models/*.glb` (15 files) | L (art) |
| P2-02 | Model loader + species renderer | CC | P2-01 | Updated `Fish.tsx` with `useGLTF` per species | L |
| P2-03 | Species-specific swim patterns | CC | P2-02, D5 | Swim behavior per species (shark=linear, jellyfish=float, turtle=slow) | M |
| P2-04a | Evolution visuals: water creatures (angelfish, manta, dolphin, shark, flying fish) | CC | P2-02 | Egg/Fry/Juvenile/Adult/Elder/Legendary variants for 5 water species. Each stage visually distinct, smooth transition, size scaling correct | M |
| P2-04b | Evolution visuals: land-adapted creatures (turtle, pufferfish, goldfish, seahorse) | CC | P2-02 | Egg→Legendary variants for 4 land-adapted species. Each stage visually distinct, species-specific traits visible at Adult+ | M |
| P2-04c | Evolution visuals: invertebrates & flora (squid, jellyfish, shell, coral, seaweed, plankton) | CC | P2-02 | Egg→Legendary variants for 6 invertebrate/flora species. Non-fish types have appropriate stage representations (coral grows, plankton clusters) | M |
| P2-04d | Evolution visuals: legendary forms (Leviathan, Phoenix Fish, Hydra, Kraken, Narwhal) | CC | P2-04a | 5 legendary-tier unique models with special effects (fire, multi-head, glow, horn). Each legendary has unique VFX, unmistakable visual identity, performance acceptable (< 5ms per legendary) | L |
| P2-05 | Boids flocking algorithm (Web Worker) | CC | P1-13 | `src/lib/aquarium/boids.ts`, `boids.worker.ts` | L |
| P2-06 | Flocking integration: same-language schools | CC | P2-05 | Fish of same language flock together | M |
| P2-07 | Ecosystem interactions: fork fish, PR symbiosis | CC | P2-06, P1-04 | Fork = small fry near parent, PR reviewer = cleaner fish following | L |
| P2-08 | Coral/seaweed for HTML/CSS/Markdown repos | CC | P2-02 | Non-fish repos rendered as coral/seaweed | M |
| P2-09 | Time-of-day lighting cycle | CC | P1-11, P1-04 | Lighting changes based on user's commit peak hours | M |
| P2-10 | Weather system (commit activity → clarity) | CC | P1-11 | Recent high activity = clear water, low = murky | S |
| P2-11 | Contribution graph → terrain heightmap | CC | P1-09, P1-04 | Yearly contribution data maps to coral reef heights | M |
| P2-12 | Deep sea layer (5yr+ accounts) | CC | P1-09, P2-04a | Dark deep zone with bioluminescent creatures | M |
| P2-13 | Water surface: waves + refraction | CC | P1-17 | Enhanced water with wave simulation, light refraction | M |
| P2-14 | Sound system (Tone.js) | CC | P0-01 | `src/lib/audio/ambient.ts` — underwater ambience, bubbles, fish whoosh | L |
| P2-15 | Codex (Pokédex) v1 | CC | P2-04a, D5 | `src/app/[locale]/[username]/codex/page.tsx` — discovered species, completion %, hints | L |
| P2-16 | Theme system (dark/coral/deep/tropical) | CC | P2-09 | `src/lib/aquarium/themes.ts` — 4 visual themes | M |
| P2-17 | Performance: adaptive quality | CC | P2-02 | FPS monitor → auto-reduce quality (particles, LOD, fish limit) | M |
| P2-18 | README bioluminescence effect | CC | P2-02 | Fish with README glow softly | S |
| P2-19 | License shield aura effect | CC | P2-02 | Fish with license show protective aura | S |
| P2-20 | Open issues → scars/marks on fish | CC | P2-02 | Visual damage marks proportional to open issue count | S |
| P2-21 | Easter eggs: username-based + repo-name-based | CC | P2-02, P1-03 | `src/lib/aquarium/easter-eggs.ts`, username map (torvalds→Leviathan Boss, etc.), repo-name patterns (awesome-*→crown, dotfiles→ghost, *-bot→robot). 5 username + 6 repo-name easter eggs from PRD §16.1-16.2 | M |
| P2-22 | Easter eggs: date-based + Konami code | CC | P2-21 | Date-based events (Apr 1→upside-down, Oct 31→skeleton, Dec 25→santa hats), Konami code (↑↑↓↓←→←→BA → 8-bit mode 30s). All 5 date triggers + Konami retro mode | M |
| P2-23 | Visual regression test infrastructure | CX | P0-14, P1-35 | `tests/visual/`, Playwright `toHaveScreenshot()` config, fixed-seed data, 0.5% pixel diff threshold, CI in `visual-regression.yml`. Screenshots: landing, aquarium, tooltip, HUD, mobile | M |

**Parallelism:**
```
Week 5-6: P2-01 (external) → P2-02 (CC) → P2-03 (CC) ║ P2-04a (CC) ║ P2-04b (CC) ║ P2-04c (CC)
          P2-04a → P2-04d (CC)
Week 7-8: P2-05 (CC) → P2-06 (CC) → P2-07 (CC)
          P2-08 (CC) ║ P2-18 (CC) ║ P2-19 (CC) ║ P2-20 (CC)
          P2-21 (CC) → P2-22 (CC)
Week 9-10: P2-09 (CC) ║ P2-10 (CC) ║ P2-11 (CC) ║ P2-12 (CC) ║ P2-13 (CC)
           P2-14 (CC) ║ P2-15 (CC) ║ P2-16 (CC) ║ P2-17 (CC)
           P2-23 (CX)
```

---

### Phase 3: Social — "바다를 공유하다" (6 weeks)

| Task ID | Title | Agent | Prerequisites | Deliverables | Complexity |
|---------|-------|-------|---------------|--------------|------------|
| P3-01 | Comparison mode (split view) | CC | P1-25 | `src/app/[locale]/compare/[u1]/[u2]/page.tsx` — side-by-side aquariums | L |
| P3-02 | Comparison HUD (stats diff) | GC | P3-01 | Fish count, diversity, stars comparison overlay | M |
| P3-03 | Merge Ocean (2-5 users combined) | CC | P1-25 | `src/app/[locale]/merge/page.tsx` — combined aquarium with interactions | L |
| P3-04 | Supabase Auth (GitHub OAuth) | CC | D9 | `src/lib/auth/` — login, session, token storage | L |
| P3-05 | Visit system (guest fish) | CC | P3-04 | Visit endpoint, guest fish appears in host aquarium | M |
| P3-06 | Guestbook | CX | P3-05 | `src/app/[locale]/[username]/guestbook/` — visit history | M |
| P3-07 | Kudos system (feed fish) | CC | P3-04 | Feed animation, kudo types (star/bug/idea), daily limits | L |
| P3-08 | Leaderboard | GC | P3-04 | `src/app/[locale]/leaderboard/page.tsx` — global, weekly, per-language | M |
| P3-09 | Enhanced sharing: Lottie/WebM cards | CC | P1-30 | Story format (vertical), landscape (horizontal), animated | L |
| P3-10 | GitHub README embed widget | CX | P1-04 | SVG badge endpoint: `/api/badge/[username]` | M |
| P3-11 | Embed iframe | GC | P1-25 | `src/app/embed/[username]/page.tsx` — minimal UI, iframe-friendly | M |
| P3-12 | Comparison share cards | GC | P3-01 | OG image for comparison pages | S |
| P3-13 | Content moderation: profanity filter + report system | CX | P3-04 | `src/lib/moderation/profanity-filter.ts`, `src/app/api/report/route.ts`, `src/components/ui/ReportButton.tsx`, report queue in Supabase. Profanity filtered, reports stored with type, daily kudos limit (10/day, 3/day per user) | M |
| P3-14 | Anti-bot: reCAPTCHA v3 + rate limiting | CX | P3-04 | reCAPTCHA v3 on aquarium creation, rate limit middleware (100 req/min/IP), leaderboard anti-manipulation. Bot detection, 429 on rate limit | M |
| P3-15 | Explore page: popular aquariums discovery | GC | P3-04, P1-04 | `src/app/[locale]/explore/page.tsx` — featured aquariums, trending, search by username, language filter. Responsive | M |

---

### Phase 4: Real-time — "바다가 숨 쉰다" (6 weeks)

| Task ID | Title | Agent | Prerequisites | Deliverables | Complexity |
|---------|-------|-------|---------------|--------------|------------|
| P4-01 | GitHub Webhook receiver | CC | P3-04 | `src/app/api/webhook/github/route.ts` — verify signature, parse events | L |
| P4-02 | Webhook → aquarium event mapping | CC | P4-01 | Push → feed, Star → sparkle, Fork → birth, etc. (10 event types from PRD) | L |
| P4-03 | Real-time event animations | CC | P4-02 | Visual effects: star burst, egg birth, healing, escape | L |
| P4-04 | Event feed timeline | GC | P4-02 | `src/components/ui/EventFeed.tsx` — toast notifications + scrollable log | M |
| P4-05 | Live mode (fullscreen dashboard) | CC | P4-03 | `src/app/[locale]/[username]/live/page.tsx` — minimal UI, clock, fullscreen | M |
| P4-06 | Time travel slider | CC | D9 | `src/app/[locale]/[username]/history/page.tsx` — slider for past snapshots | L |
| P4-07 | Timelapse video generation | CC | P4-06 | Auto-generate evolution timelapse from snapshots | L |
| P4-08 | Supabase Realtime subscription | CC | P4-02 | Supabase Realtime for pushing events to connected clients | M |

---

### Phase 5: Gamification — "바다를 키우다" (8 weeks)

| Task ID | Title | Agent | Prerequisites | Deliverables | Complexity |
|---------|-------|-------|---------------|--------------|------------|
| P5-01 | Achievement system (10 achievements) | CC | P3-04, D9 | `src/lib/gamification/achievements.ts`, DB table, unlock triggers | L |
| P5-02 | Achievement UI + unlock animation | CC | P5-01 | Toast animation on unlock, achievement gallery page | M |
| P5-03 | Season event framework | CC | P5-01 | Season config, limited-time species, themed environments | L |
| P5-04 | Quest system (daily/weekly/challenge) | CC | P3-04 | Quest engine, progress tracking, reward distribution | L |
| P5-05 | Customization: backgrounds | GC | P3-04 | 6 background themes (tropical, deep sea, shipwreck, etc.) | M |
| P5-06 | Customization: decorations | GC | P5-05 | Treasure chest, diver figure, castle — placed in scene | M |
| P5-07 | Customization: lighting presets | GC | P5-05 | Normal, neon, moonlight, caustic options | S |
| P5-08 | Customization: aquarium frames | GC | P5-05 | Decorative border around viewport | S |
| P5-09 | Kudos milestone rewards | CX | P3-07, P5-05 | Accumulated kudos → unlock decorations | M |
| P5-10 | Codex v2 (full 105 species) | CC | P2-15, P5-03 | Complete codex with seasons, secret fish, rarity tiers | L |

---

### Phase 6: Platform Expansion (8 weeks)

| Task ID | Title | Agent | Prerequisites | Deliverables | Complexity |
|---------|-------|-------|---------------|--------------|------------|
| P6-01 | GitLab API integration | CC | P1-01 | `src/lib/gitlab/` — parallel to GitHub client | L |
| P6-02 | Bitbucket API integration | CX | P1-01 | `src/lib/bitbucket/` | L |
| P6-03 | Multi-platform merged aquarium | CC | P6-01, P6-02 | Combined GitHub + GitLab data in one aquarium | M |
| P6-04 | Organization aquarium | CC | P3-04 | `src/app/[locale]/org/[orgname]/page.tsx` — org-wide ocean with member zones | L |
| P6-05 | Public API v1 | CC | P1-04 | `src/app/api/v1/aquarium/[username]/route.ts` — rate-limited, API key auth | L |
| P6-06 | Notion/blog embed widget | GC | P6-05 | Embeddable iframe + JS widget | M |
| P6-07 | Slack bot integration | CC | P6-05 | `/aquarium username` → preview card in Slack | M |
| P6-08 | PWA + mobile optimization | CC | P1-26 | Service worker, manifest, installable, push notifications | L |
| P6-09 | Stripe payment integration | CC | P3-04 | Pro subscription ($4.99/mo), Team ($9.99/mo), decoration shop | L |
| P6-10 | Admin dashboard | CC | P3-04 | Analytics, user management, season management | L |

---

## 4. Agent Task Prompt Examples

### 4.1 Prompt Templates

#### Template: New Component (R3F 3D)

```
## Task
Create the [ComponentName] React Three Fiber component.

## Context
- Read AGENTS.md for project conventions
- Read docs/3d-scene-architecture.md for performance budget
- This component is part of the aquarium 3D scene

## Requirements
- [Specific behavior/visual description]
- Must work within the R3F Canvas context
- Use `useFrame` for animations (not requestAnimationFrame)
- Performance: max [X] draw calls, must maintain 60fps with [Y] instances

## Interfaces
[Paste relevant TypeScript types from src/types/]

## File Location
src/engine/[subdir]/[ComponentName].tsx

## Acceptance Criteria
- [ ] Component renders without errors in the scene
- [ ] Animation is smooth at 60fps
- [ ] Props are fully typed (no `any`)
- [ ] Follows AGENTS.md naming/import conventions

## Reference
- PRD Section [X.Y] for visual spec
- docs/3d-scene-architecture.md for hierarchy
```

#### Template: New API Route

```
## Task
Create the API route at [path].

## Context
- Read AGENTS.md for project conventions
- Read docs/github-api-spec.md for GitHub API details
- Read docs/aquarium-data-schema.md for response format

## Requirements
- Method: [GET/POST]
- Input: [params/body description]
- Output: [JSON schema reference]
- Caching: [Redis TTL strategy]
- Error handling: [400/404/429/500 responses]

## File Location
src/app/api/[path]/route.ts

## Acceptance Criteria
- [ ] Returns correct JSON matching AquariumData schema
- [ ] Redis caching works (verify with cache hit header)
- [ ] Handles errors gracefully (404 user, rate limit)
- [ ] Input validated with Zod
- [ ] No secrets exposed to client
```

#### Template: New Test Suite

```
## Task
Write tests for [module/function].

## Context
- Read AGENTS.md for testing conventions
- Read the source file: [path to source]
- Test runner: Vitest

## Requirements
- Test file: tests/[unit|integration]/[name].test.ts
- Cover: happy path, edge cases, error cases
- For API tests: use MSW to mock GitHub responses
- Boundary values: [list specific thresholds to test]

## Acceptance Criteria
- [ ] All tests pass with `pnpm test`
- [ ] Coverage > 80% for target module
- [ ] No test depends on network/external services
- [ ] Descriptive test names: "should [behavior] when [condition]"
```

### 4.2 Good vs Bad Prompt Comparison

**Task: Create the Fish species mapper**

❌ **Bad prompt:**
```
Create a function that maps GitHub repos to fish species. Use TypeScript.
```
Why bad: No context about species mapping rules, no types, no file location, no test expectations.

✅ **Good prompt:**
```
## Task
Create the species mapping module at src/lib/aquarium/species.ts

## Context
- Read AGENTS.md for conventions (strict TypeScript, no `any`)
- Read docs/fish-species-map.md for the full mapping table
- Read src/types/fish.ts for the FishSpecies type

## Requirements
1. Export function `getSpecies(language: string | null): FishSpecies`
2. Map 15 languages to species per docs/fish-species-map.md:
   - JavaScript → angelfish, TypeScript → mantaray, Python → turtle, etc.
3. Unknown/null language → 'plankton'
4. Export function `getSpeciesColor(species: FishSpecies): string`
   - Returns hex color per species
5. Export function `getSwimPattern(species: FishSpecies): SwimPattern`
   - Returns 'linear' | 'float' | 'slow' | 'standard' | 'zigzag'
6. All data should be in a const map (not switch/case)

## File
src/lib/aquarium/species.ts

## Acceptance Criteria
- [ ] All 15 languages map correctly
- [ ] Unknown language returns plankton
- [ ] No `any` types
- [ ] Exported as named exports (no default export)
- [ ] Map uses `as const` for type safety
```

### 4.3 Agent-Specific Tips

| Agent | Strengths | Weaknesses | Prompt Tips |
|-------|-----------|------------|-------------|
| **Claude Code** | Complex architecture, R3F/Three.js, multi-file refactors, long context | Can over-engineer, verbose | Give clear scope boundaries. Say "only modify these files". Use AGENTS.md reference |
| **OpenAI Codex** | Test generation, data transforms, boilerplate, JSON schemas | Less context window, can hallucinate APIs | Paste relevant types inline. Be explicit about function signatures. Keep scope small |
| **Gemini CLI** | UI components, structured docs, Tailwind styling, reference tables | Less strong at complex 3D logic | Provide design tokens inline. Reference existing components for style consistency |

### 4.4 Context Handoff Protocol

When Agent A built something and Agent B needs to consume it:

```
## Context from Previous Work

### What was built
[Agent A] created [component/module] at [file path].

### Key interfaces
[Paste the relevant TypeScript types/interfaces]

### How to use it
[1-2 code examples of how the module is called]

### Important constraints
- [Any non-obvious decisions that were made]
- [Performance considerations]
- [Error cases to handle]

### Files to read before starting
1. [file1.ts] — the module you'll consume
2. [types.ts] — shared types
3. AGENTS.md — project conventions
```

---

## 5. Multi-Agent Coordination Strategy

### 5.0 Agent Role Assignment

Each agent has a dedicated domain to maximize parallelism and prevent conflicts:

| Agent | Domain | Scope |
|-------|--------|-------|
| **Claude Code (CC)** | 3D Engine + Core Logic | `src/engine/`, `src/lib/aquarium/`, `src/stores/`, `src/app/[locale]/[username]/`, R3F components, shader work, Boids algorithm, Zustand stores |
| **OpenAI Codex (CX)** | API Routes + Data Layer + Tests | `src/app/api/`, `src/lib/github/`, `src/lib/cache/`, `src/types/`, `tests/`, GitHub API client, Redis caching, data transforms, all test suites |
| **Gemini CLI (GC)** | UI Components + Styling + Docs | `src/components/ui/`, `src/components/layout/`, `src/messages/`, `docs/`, Tailwind styling, i18n translation files, reference documents, accessibility |

**Parallelism model:** All three agents run as separate simultaneous sessions. Each agent owns its directory scope — no two agents modify the same file at the same time. When a task crosses boundaries (e.g., a CC component consuming CX types), the upstream task must merge first.

### 5.1 Shared Linting / Formatting

All agents must produce code that passes the same checks:

```json
// package.json scripts
{
  "lint": "eslint . --fix",
  "format": "prettier --write .",
  "typecheck": "tsc --noEmit",
  "check": "pnpm lint && pnpm format && pnpm typecheck"
}
```

**Pre-commit hook (husky + lint-staged):**
```json
{
  "*.{ts,tsx}": ["eslint --fix", "prettier --write"],
  "*.{json,md,css}": ["prettier --write"]
}
```

**Post-agent workflow:** After ANY agent produces code, run `pnpm check` before committing. This auto-fixes formatting differences between agents.

### 5.2 Branch Strategy

```
main
 ├── develop              (integration branch)
 │   ├── feat/P1-01-github-api-client     (per-task branches)
 │   ├── feat/P1-06-r3f-scene-setup
 │   ├── feat/P1-03-fish-mapper
 │   └── ...
 ```

**Rules:**
- One branch per task ID (e.g., `feat/P1-01-github-api-client`)
- Branch name includes task ID for traceability
- All branches created from `develop`
- Merge to `develop` via squash merge after review
- `develop` → `main` at phase gates only

### 5.3 File Ownership to Prevent Conflicts

| Module / Directory | Primary Agent | Rationale |
|-------------------|---------------|-----------|
| `src/engine/` | CC | R3F/Three.js expertise, shader work |
| `src/lib/aquarium/` | CC | Core mapping logic, Boids algorithm |
| `src/lib/github/` | CX | API client, data fetching, error handling |
| `src/lib/cache/` | CX | Redis infrastructure |
| `src/lib/auth/` | CX | OAuth, session management |
| `src/lib/audio/` | CC | Tone.js, procedural audio |
| `src/app/api/` | CX | Server-side API routes |
| `src/app/[locale]/` (pages) | CC | Route architecture, scene mounting |
| `src/components/ui/` | GC | Tailwind UI components |
| `src/components/layout/` | GC | App shell, header, footer |
| `src/stores/` | CC | Zustand state architecture |
| `src/types/` | CX | Type definitions |
| `src/constants/` | GC | Static data tables |
| `src/messages/` | GC | i18n translation files |
| `tests/unit/` | CX | Unit test generation |
| `tests/integration/` | CX | Integration tests |
| `tests/e2e/` | CX | E2E test generation |
| `docs/` | GC | Reference documents |
| `.github/workflows/` | CX | CI/CD pipeline |
| Config files | CC | Project setup |

**Conflict prevention rule:** Two agents should NEVER work on the same file simultaneously. If Agent B needs to modify a file Agent A created, Agent A's task must be merged first.

### 5.4 Code Review Workflow

```
Agent produces code
       │
       ▼
pnpm check (auto-fix formatting)
       │
       ▼
Developer reviews diff (manual)
       │
       ├── Simple changes (S tasks): self-review → merge
       │
       └── Complex changes (M/L tasks): ask Claude Code to review
           │
           ▼
     Claude Code review (read PR diff, check against AGENTS.md)
           │
           ▼
     Fix issues → merge to develop
```

**Review checklist:**
- [ ] Follows AGENTS.md conventions (imports, naming, types)
- [ ] No `any` types
- [ ] No `console.log`
- [ ] Error handling present
- [ ] Tests included (for `lib/` changes)
- [ ] Performance impact considered (for 3D changes)

### 5.5 Context Handoff Protocol

When switching a task from one agent to another:

1. **Document the state:** Comment on the task with what's done, what's pending, and any gotchas
2. **Include file list:** List all files the new agent needs to read
3. **Paste interfaces:** Include relevant TypeScript types in the prompt (don't assume the new agent will read all files)
4. **Describe decisions:** Explain WHY certain approaches were chosen (not just what was built)

---

## 6. Quality Gates & Checkpoints

### Phase 1 → Phase 2 Gate

| Category | Criterion | Target | Measurement |
|----------|----------|--------|-------------|
| **Functionality** | Username → aquarium renders | 100% of tested users | Manual: test 10 different GitHub users |
| **Functionality** | Fish count matches repo count | Exact match | Automated: compare API response vs scene |
| **Functionality** | Fossil fish for inactive repos | Correct for 6mo+ inactive | Unit test boundary values |
| **Functionality** | Share URL works | /username loads correctly | E2E test |
| **Functionality** | OG image generates | Valid PNG for any user | Integration test |
| **Performance** | Desktop FPS | ≥ 55fps with 30 fish | Chrome DevTools FPS meter |
| **Performance** | Mobile FPS | ≥ 25fps with 20 fish | Real device test (iPhone 12) |
| **Performance** | LCP | < 3.0s | Lighthouse |
| **Performance** | TTI | < 4.0s | Lighthouse |
| **Performance** | 100 fish stress test | ≥ 30fps (InstancedMesh) | Custom benchmark |
| **Quality** | Unit test coverage (lib/) | ≥ 80% lines | Vitest coverage report |
| **Quality** | E2E tests pass | 100% pass rate | Playwright CI |
| **Quality** | Zero TypeScript errors | `tsc --noEmit` clean | CI check |
| **Quality** | Zero ESLint errors | `eslint .` clean | CI check |
| **Accessibility** | Scene aria-label | Present and accurate | Manual check |
| **Accessibility** | Keyboard navigation | Tab through fish | Manual check |
| **Accessibility** | Reduced motion | Animations stop | Manual check |
| **Deploy** | Vercel production deploy | No build errors | Vercel dashboard |
| **Deploy** | Environment variables | All set in Vercel | Checklist |
| **Deploy** | Custom domain (if ready) | HTTPS works | Browser check |
| **CI/CD** | GitHub Actions CI passes | All checks green | Push to any branch triggers ci.yml |
| **CI/CD** | E2E workflow runs on PR | Playwright passes | PR to main triggers e2e.yml |
| **i18n** | EN + KO routes work | Both locales render | Manual: visit /en/{user} and /ko/{user} |
| **Analytics** | Tracking events fire | Events in PostHog/Plausible | Verify aquarium_created, fish_clicked events |
| **Legal** | Privacy Policy + ToS pages | Pages accessible | Manual: navigate from footer |
| **Accessibility** | Color-blind mode toggle | Patterns visible | Manual: enable mode, verify fish patterns |
| **Manual QA** | Test with 0 repos user | Shows empty aquarium message | Manual |
| **Manual QA** | Test with 200+ repos user | Renders, performant | Manual |
| **Manual QA** | Test with private-only user | Shows public repos only | Manual |
| **Manual QA** | Non-existent username | 404 page | Manual |
| **Manual QA** | Mobile Safari | Touch works, scene renders | Real device |
| **Manual QA** | Firefox | Scene renders correctly | Browser test |

### Phase 2 → Phase 3 Gate

| Category | Criterion | Target |
|----------|----------|--------|
| Functionality | 15 species render correctly | Visual QA per species |
| Functionality | Evolution stages visible | Egg → Fry → Adult visible |
| Functionality | Boids flocking works | Same-language fish school |
| Functionality | Sound plays without errors | Ambience + effects |
| Functionality | Codex shows discovered species | ≥ 1 species auto-registered |
| Performance | Desktop FPS with 50 fish + boids | ≥ 50fps |
| Performance | Web Worker for boids | Main thread < 16ms/frame |
| Performance | Adaptive quality triggers | FPS < 30 → auto-reduce |
| Quality | Unit tests for boids algorithm | Coverage ≥ 80% |
| Quality | Visual regression baselines | Screenshots captured |

### Phase 3 → Phase 4 Gate

| Category | Criterion | Target |
|----------|----------|--------|
| Functionality | GitHub OAuth login works | Login → token → session |
| Functionality | Compare mode renders 2 aquariums | Side-by-side correct |
| Functionality | Merge ocean works (2-5 users) | Combined aquarium renders |
| Functionality | Kudos system works | Feed animation plays |
| Functionality | Leaderboard populates | Data from real users |
| Security | OAuth token stored server-side only | No client exposure |
| Security | CSRF protection on mutations | Verified |
| Performance | Compare mode FPS | ≥ 30fps (2 scenes) |

### Phase 4 → Phase 5 Gate

| Category | Criterion | Target |
|----------|----------|--------|
| Functionality | Webhook receives GitHub events | All 10 event types |
| Functionality | Real-time animations fire | Visual per event type |
| Functionality | Live mode fullscreen | Clock, minimal UI |
| Functionality | Time travel slider works | Past snapshots render |
| Security | Webhook signature verification | SHA-256 verified |
| Reliability | Webhook retry handling | Idempotent processing |

### Phase 5 → Phase 6 Gate

| Category | Criterion | Target |
|----------|----------|--------|
| Functionality | 10 achievements unlock correctly | All conditions verified |
| Functionality | Season event framework works | 1 test season deployed |
| Functionality | Quest system tracks progress | Daily/weekly/challenge |
| Functionality | Customization applies visually | All decoration types |
| Functionality | Codex v2 complete (105 species) | All cataloged |
| Performance | Customization doesn't degrade FPS | ≥ 50fps desktop |

### Deployment Verification (Every Phase)

- [ ] `pnpm build` succeeds locally
- [ ] `pnpm test` passes (unit + integration)
- [ ] `pnpm test:e2e` passes
- [ ] `pnpm check` (lint + format + typecheck) clean
- [ ] Vercel preview deploy works
- [ ] Vercel production deploy works
- [ ] No Sentry errors in first 24 hours
- [ ] Redis cache hit rate > 80% after warm-up
- [ ] GitHub API rate limit headroom > 50%

---

## Appendix: Task Count Summary

| Phase | Tasks | Parallelizable | Sequential | Estimated Sessions |
|-------|-------|---------------|------------|-------------------|
| Phase 0 | 16 | 10 | 6 | ~10 sessions |
| Phase 1 | 41 | 24 | 17 | ~28 sessions |
| Phase 2 | 23 | 14 | 9 | ~17 sessions |
| Phase 3 | 15 | 9 | 6 | ~12 sessions |
| Phase 4 | 8 | 3 | 5 | ~8 sessions |
| Phase 5 | 10 | 6 | 4 | ~8 sessions |
| Phase 6 | 10 | 5 | 5 | ~10 sessions |
| **Total** | **123** | **71** | **52** | **~93 sessions** |

With 3 agents (CC, CX, GC) running as parallel sessions in dedicated domains, effective throughput increases ~2x (accounting for coordination overhead and cross-agent dependencies), reducing wall-clock sessions to approximately **45-50 sessions**.
