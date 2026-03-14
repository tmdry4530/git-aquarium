# Contributing to Git Aquarium

Thank you for your interest in contributing!

## Setup

```bash
# Prerequisites: Node 22.x, pnpm 9.x
git clone https://github.com/your-org/git-aquarium.git
cd git-aquarium
pnpm install
cp .env.example .env.local
# Fill in .env.local with your credentials
pnpm dev
```

## Branch Strategy

- `main` — production, protected
- `develop` — integration branch
- `feat/<scope>/<description>` — feature branches
- `fix/<scope>/<description>` — bug fix branches
- `docs/<description>` — documentation only

Example: `feat/fish/add-dolphin-animation`

## Commit Convention

```
<type>(<scope>): <description>
```

Types: `feat`, `fix`, `refactor`, `test`, `docs`, `chore`, `perf`, `style`
Scopes: `scene`, `fish`, `env`, `api`, `cache`, `ui`, `hud`, `share`, `og`, `deploy`

Examples:

```
feat(fish): add evolution stage calculation
fix(api): handle GitHub 404 for deleted users
docs(contributing): update setup guide
```

## Pull Request Process

1. Fork the repo and create a branch from `develop`
2. Write tests for new functionality
3. Ensure all checks pass:
   ```bash
   pnpm lint
   pnpm exec tsc --noEmit
   pnpm test
   pnpm build
   ```
4. Fill in the PR template
5. Request review from a maintainer

## Code Standards

- TypeScript strict mode — no `any`
- No `console.log` in production code
- Server Components by default, `'use client'` only when needed
- All API inputs validated with Zod
- 80% test coverage for `src/lib/`

## Adding a New Fish Species

1. Add the species to `FishSpecies` type in `src/types/fish.ts`
2. Add config to `SPECIES_CONFIGS` in `src/constants/species-map.ts`
3. Map the language in `LANGUAGE_TO_SPECIES`
4. Create species geometry in `src/engine/fish/species/`
5. Update `docs/fish-species-map.md`
6. Open a PR with screenshots of the new species

See `.github/ISSUE_TEMPLATE/fish_species_proposal.yml` for the proposal template.

## Reporting Issues

Use GitHub Issues with the appropriate template:

- Bug Report: unexpected behavior
- Feature Request: new functionality
- Fish Species Proposal: propose a new language → species mapping
