# PRD Compliance Report

**Date**: 2026-03-14
**Reviewer**: Worker-1 (Browser QA + PRD Compliance)
**PRD Version**: PRD.md (root)

---

## 1. Fish Species Mapping (15 Languages)

**Status**: PASS (15/15)

| #   | Language      | PRD Species | Code Species | Implemented |
| --- | ------------- | ----------- | ------------ | :---------: |
| 1   | JavaScript    | Angelfish   | `angelfish`  |    PASS     |
| 2   | TypeScript    | Manta Ray   | `manta`      |    PASS     |
| 3   | Python        | Turtle      | `turtle`     |    PASS     |
| 4   | Rust          | Pufferfish  | `pufferfish` |    PASS     |
| 5   | Go            | Dolphin     | `dolphin`    |    PASS     |
| 6   | Java          | Squid       | `squid`      |    PASS     |
| 7   | C/C++/C#      | Shark       | `shark`      |    PASS     |
| 8   | Solidity      | Seahorse    | `seahorse`   |    PASS     |
| 9   | Ruby          | Goldfish    | `goldfish`   |    PASS     |
| 10  | Swift         | Flying Fish | `flyingfish` |    PASS     |
| 11  | Kotlin        | Jellyfish   | `jellyfish`  |    PASS     |
| 12  | HTML/CSS      | Coral       | `coral`      |    PASS     |
| 13  | Shell         | Shell       | `shell`      |    PASS     |
| 14  | Markdown      | Seaweed     | `seaweed`    |    PASS     |
| 15  | Unknown/Other | Plankton    | `plankton`   |    PASS     |

**Files**: `src/constants/species-map.ts`, `src/types/fish.ts`, `src/lib/aquarium/species.ts`

**Notes**:

- `LANGUAGE_TO_SPECIES` maps all 15 languages (C, C++, C# all map to `shark`)
- `SPECIES_CONFIGS` defines all 15 species with color, swimPattern, baseSize, maxSize, scaleFactor
- `getSpeciesFromLanguage()` returns `plankton` for null/unknown languages (correct)
- Fish size formula matches PRD: `min(baseSize + log2(stars+1) * scaleFactor, maxSize)`
- Swim speed formula implemented: `min(0.2 + commitsLast30Days * 0.06, 2.0)`

---

## 2. Evolution System

**Status**: PASS (7/7 stages)

| Stage     | PRD Condition          | Code Condition                                | Match |
| --------- | ---------------------- | --------------------------------------------- | :---: |
| Egg       | Commits 0-2            | `totalCommits < 3`                            | PASS  |
| Fry       | Commits 3-10           | `totalCommits >= 3`                           | PASS  |
| Juvenile  | Commits 11-50          | `totalCommits >= 11`                          | PASS  |
| Adult     | Commits 51-200         | `totalCommits >= 51`                          | PASS  |
| Elder     | Commits 200+ & 1yr+    | `totalCommits >= 200 && accountAgeYears >= 1` | PASS  |
| Legendary | Stars 1000+ or special | `stars >= 1000`                               | PASS  |
| Fossil    | 6mo+ inactive          | `daysSinceLastCommit >= 180`                  | PASS  |

**Files**: `src/lib/aquarium/evolution.ts`, `src/constants/species-map.ts`

**Notes**:

- Two implementations exist: `species-map.ts:getEvolutionStage()` and `evolution.ts:getEvolutionStage()`
- `species-map.ts` version uses raw numeric params; `evolution.ts` uses date strings and includes stars-based legendary check
- **Minor discrepancy**: `species-map.ts` uses `>= 201` for elder, `evolution.ts` uses `>= 200`. PRD says "200+". The `evolution.ts` version (>= 200) is correct per PRD
- Fossil check correctly takes priority (checked first before other stages)

### Legendary Fish Conditions

| Legendary    | PRD Condition                  | Code Condition                    |      Implemented       |
| ------------ | ------------------------------ | --------------------------------- | :--------------------: |
| Leviathan    | Stars 10,000+                  | Defined in `LEGENDARY_CONDITIONS` | PASS (definition only) |
| Phoenix Fish | 1yr+ inactive then reactivated | Defined                           | PASS (definition only) |
| Hydra        | 1,000+ forks                   | Defined                           | PASS (definition only) |
| Kraken       | 500+ issues all closed         | Defined                           | PASS (definition only) |
| Narwhal      | 365-day streak                 | Defined                           | PASS (definition only) |

**WARNING**: Legendary conditions are defined as string descriptions in `LEGENDARY_CONDITIONS` but **no runtime evaluation logic** exists. The `evolution.ts:getEvolutionStage()` only checks `stars >= 1000` for legendary. Individual legendary type detection (leviathan vs hydra vs kraken etc.) is **NOT implemented** as executable code.

---

## 3. Codex (Pokedex) System

**Status**: PARTIAL PASS

### 3.1 Codex V1 (`src/lib/codex/codex.ts`)

- Species: 15, Stages: 6 (egg, fry, juvenile, adult, elder, fossil; legendary excluded from regular combos)
- Total entries: 15 x 6 + 5 legendary = **95 entries**
- **DOES NOT match PRD target of 105** (missing 10 seasonal/special entries)
- No seasonal species support

### 3.2 Codex V2 (`src/lib/codex/codex-v2.ts`)

- Regular: 15 species x 6 stages = **90 entries**
- Legendary: **5 entries** (leviathan, phoenix_fish, hydra, kraken, narwhal)
- Seasonal/Special: **10 entries** (cherry_shrimp, sakura_jellyfish, tropical_nemo, sun_ray, hacktoberfest_fish, deep_anglerfish, phantom_ray, universe_fish, arctic_whale, ice_crystal_fish)
- Total: **105 entries** (matches `CODEX_V2_TOTAL = 105`)
- **PASS**: 105 species definition matches PRD

### 3.3 Codex Features

| Feature                             | PRD Requirement                              |  Status   |
| ----------------------------------- | -------------------------------------------- | :-------: |
| 105 entries total                   | 90 regular + 5 legendary + 10 seasonal = 105 | PASS (V2) |
| Completion % calculation            | `generateV2CodexForUser()` calculates %      |   PASS    |
| Owned/Witnessed/Undiscovered states | 3 states implemented                         |   PASS    |
| Codex page route                    | `src/app/[locale]/[username]/codex/`         | **FAIL**  |
| Codex UI component                  | No component found                           | **FAIL**  |

**CRITICAL**: The codex route directory exists (`codex/.gitkeep`) but has **NO page.tsx**. The codex system is fully implemented in business logic but has **no user-facing UI**.

---

## 4. Achievement System

**Status**: PASS (10/10 achievements)

| #   | Achievement      | PRD Condition         | Code Condition          | Match |
| --- | ---------------- | --------------------- | ----------------------- | :---: |
| 1   | First Splash     | Create first aquarium | `aquarium_created >= 1` | PASS  |
| 2   | Diverse Ocean    | 5+ language fish      | `language_count >= 5`   | PASS  |
| 3   | Fossil Hunter    | 10+ fossil fish       | `fossil_count >= 10`    | PASS  |
| 4   | Star Collector   | 100+ total stars      | `total_stars >= 100`    | PASS  |
| 5   | Commit Streak    | 30-day streak         | `commit_streak >= 30`   | PASS  |
| 6   | Deep Diver       | 50+ visits            | `visit_count >= 50`     | PASS  |
| 7   | Social Butterfly | 10+ aquarium visits   | `social_visits >= 10`   | PASS  |
| 8   | Legendary Tamer  | 1+ legendary fish     | `legendary_count >= 1`  | PASS  |
| 9   | Codex Master     | 80%+ codex            | `codex_percent >= 80`   | PASS  |
| 10  | Ocean King       | All achievements      | `all_achievements >= 9` | PASS  |

**File**: `src/lib/gamification/achievements.ts`

**Notes**:

- All 10 achievements match PRD exactly (names, conditions, rewards)
- `evaluateCondition()` correctly checks each condition type
- `buildAchievementProgress()` provides progress tracking
- EN/KO names and descriptions included in achievement definitions

---

## 5. Easter Eggs

**Status**: PASS

### 5.1 Username Easter Eggs

| Username       | PRD Requirement | Code Implementation                              | Status |
| -------------- | --------------- | ------------------------------------------------ | :----: |
| `torvalds`     | Special effect  | `leviathan_boss` - Giant Leviathan boss          |  PASS  |
| `gaearon`      | (bonus)         | `react_phoenix` - Phoenix Fish + React particles |  PASS  |
| `sindresorhus` | (bonus)         | `npm_school` - Hundreds of schooling fish        |  PASS  |
| `DHH`          | (bonus)         | `ruby_elder` - Giant goldfish elder              |  PASS  |
| `maboroshi`    | (bonus)         | `ghost_fish` - Ghost fish                        |  PASS  |

### 5.2 Konami Code

| Feature                 |                Status                |
| ----------------------- | :----------------------------------: |
| Konami sequence defined |    PASS (`KONAMI_SEQUENCE` array)    |
| Detector function       |   PASS (`createKonamiDetector()`)    |
| Activation callback     | PASS (accepts `onActivate` callback) |

### 5.3 Additional Easter Eggs

| Type               | Count | Details                                                                                    |
| ------------------ | :---: | ------------------------------------------------------------------------------------------ |
| Repo name patterns |   6   | awesome-_, dotfiles, _-bot, todo\*, .github, hello-world                                   |
| Secret species     |   5   | ghost_fish, zombie_fish, pirate_fish, scholar_fish, chameleon_fish                         |
| Date-based         |   5   | Apr 1 (upside down), Oct 31 (skeleton), Dec 25 (santa), Jan 1 (fireworks), Feb 14 (hearts) |

**File**: `src/lib/aquarium/easter-eggs.ts`

---

## 6. i18n (EN/KO Translation)

**Status**: PARTIAL FAIL

### 6.1 Existing Translation Keys

| Section     | EN Keys | KO Keys | Parity |
| ----------- | :-----: | :-----: | :----: |
| landing     |    5    |    5    |  PASS  |
| hud         |    3    |    3    |  PASS  |
| auth        |    3    |    3    |  PASS  |
| compare     |   10    |   10    |  PASS  |
| merge       |    7    |    7    |  PASS  |
| leaderboard |   12    |   12    |  PASS  |
| explore     |   11    |   11    |  PASS  |
| social      |   11    |   11    |  PASS  |
| embed       |    3    |    3    |  PASS  |

**EN/KO parity**: All existing keys match 1:1. No missing keys within existing sections.

### 6.2 Missing Translation Sections

| Missing Section              | Required By                            | Severity |
| ---------------------------- | -------------------------------------- | :------: |
| `codex`                      | Codex page (PRD P2-F06)                |   HIGH   |
| `achievements`               | Achievement system (PRD P5-F01)        |   HIGH   |
| `fish` / `fishDetail`        | Fish tooltip/detail panel (PRD P1-F03) |  MEDIUM  |
| `quests`                     | Quest system (PRD P5-F03)              |  MEDIUM  |
| `seasons`                    | Season events (PRD P5-F02)             |  MEDIUM  |
| `customization`              | Customization UI (PRD P5-F04)          |   LOW    |
| `errors`                     | Error messages                         |  MEDIUM  |
| `history` / `live` / `recap` | Time travel pages (PRD P4-F04)         |   LOW    |
| `privacy` / `terms`          | Legal pages                            |   LOW    |

**Note**: Many components (fish detail, codex, achievements, quests) have EN/KO strings embedded directly in TypeScript files (`nameEn`/`nameKo` pattern) rather than in the i18n JSON files. This is a **hybrid approach** - functional but inconsistent with the `next-intl` pattern used elsewhere. Only `landing` and `hud` sections actually use `useTranslations()`.

---

## Summary

| Category                       |   Status    |                 Score                  |
| ------------------------------ | :---------: | :------------------------------------: |
| Species Mapping (15 languages) |    PASS     |                 15/15                  |
| Evolution Stages (7 stages)    |    PASS     |                  7/7                   |
| Legendary Fish (5 types)       |   PARTIAL   | Defined but no runtime detection logic |
| Codex - Business Logic         |    PASS     |           105 entries in V2            |
| Codex - UI Page                |  **FAIL**   |       No page.tsx, only .gitkeep       |
| Achievements (10)              |    PASS     |                 10/10                  |
| Easter Eggs (torvalds, Konami) |    PASS     |        All implemented + extras        |
| i18n Key Parity (EN=KO)        |    PASS     |        All existing keys match         |
| i18n Coverage                  | **PARTIAL** | 9/18+ sections missing from i18n JSON  |

### Critical Issues

1. **Codex page missing**: `src/app/[locale]/[username]/codex/page.tsx` does not exist (only `.gitkeep`). Users cannot view their codex.
2. **Legendary fish detection incomplete**: Individual legendary types (Leviathan, Hydra, Kraken, Phoenix Fish, Narwhal) are defined as strings but no runtime evaluation code maps repo data to specific legendary types.
3. **Dual evolution logic**: Two `getEvolutionStage()` functions exist with slightly different threshold values (201 vs 200 for elder). Should consolidate.

### Recommendations

1. Create `codex/page.tsx` with codex V2 integration
2. Implement `evaluateLegendaryType()` function that checks actual repo data against legendary conditions
3. Consolidate evolution logic into single source of truth (`evolution.ts`)
4. Migrate embedded `nameEn`/`nameKo` strings to i18n JSON files for consistency
5. Add missing i18n sections (codex, achievements, fish, quests, errors)
