# Aquarium Data Schema (D4)

## Overview

The `/api/aquarium/{username}` endpoint returns an `AquariumData` object that drives the 3D scene.

---

## Top-Level Shape

```typescript
interface AquariumData {
  user: AquariumUser
  fish: FishData[]
  environment: EnvironmentData
  stats: AquariumStats
  generatedAt: string // ISO 8601
}
```

---

## AquariumUser

```typescript
interface AquariumUser {
  username: string
  displayName: string | null
  avatarUrl: string
  bio: string | null
  followers: number
  accountAge: number // years since account creation
}
```

---

## FishData

Each GitHub repository maps to one `FishData` object.

```typescript
interface FishData {
  id: string // repo full name (owner/repo)
  repoName: string
  repoUrl: string
  description: string | null
  species: FishSpecies
  evolutionStage: EvolutionStage
  color: string // hex color from SPECIES_CONFIGS
  size: number // 0.5 ~ 3.0
  swimSpeed: number // 0.0 ~ 2.0
  swimPattern: SwimPattern
  stars: number
  forks: number
  openIssues: number
  hasReadme: boolean
  hasLicense: boolean
  language: string | null
  lastCommitAt: string // ISO 8601
  totalCommits: number
  commitsLast30Days: number
  createdAt: string // ISO 8601
}
```

### FishSpecies (15 types)

| Species      | Language        |
| ------------ | --------------- |
| `angelfish`  | JavaScript      |
| `manta`      | TypeScript      |
| `turtle`     | Python          |
| `pufferfish` | Rust            |
| `dolphin`    | Go              |
| `squid`      | Java            |
| `shark`      | C / C++ / C#    |
| `seahorse`   | Solidity        |
| `goldfish`   | Ruby            |
| `flyingfish` | Swift           |
| `jellyfish`  | Kotlin          |
| `coral`      | HTML / CSS      |
| `shell`      | Shell           |
| `seaweed`    | Markdown        |
| `plankton`   | Other / Unknown |

### EvolutionStage (7 stages)

| Stage       | Condition                               |
| ----------- | --------------------------------------- |
| `egg`       | totalCommits 0–2                        |
| `fry`       | totalCommits 3–10                       |
| `juvenile`  | totalCommits 11–50                      |
| `adult`     | totalCommits 51–200                     |
| `elder`     | totalCommits 200+ AND repo age ≥ 1 year |
| `legendary` | stars ≥ 1000 OR special conditions      |
| `fossil`    | daysSinceLastCommit ≥ 180               |

Priority: `fossil` > `legendary` > `elder` > `adult` > `juvenile` > `fry` > `egg`

### Size Formula

```
size = min(baseSize + log2(stars + 1) * scaleFactor, maxSize)
```

### Swim Speed Formula

```
swimSpeed = min(0.2 + commitsLast30Days * 0.06, 2.0)
```

---

## EnvironmentData

Derived from GitHub user profile and contribution history.

```typescript
interface EnvironmentData {
  tankSize: 'small' | 'medium' | 'large' | 'vast'
  brightness: number // 0.0 ~ 1.0, based on followers
  terrainHeights: number[] // 52 values, one per contribution week
  currentStrength: number // 0.0 ~ 1.0, based on commit streak
  timeOfDay: 'dawn' | 'day' | 'dusk' | 'night'
  depth: 'shallow' | 'mid' | 'deep' | 'abyss'
}
```

### Tank Size Mapping

| Repo Count | Tank Size |
| ---------- | --------- |
| 1–10       | `small`   |
| 11–30      | `medium`  |
| 31–80      | `large`   |
| 81+        | `vast`    |

### Depth Mapping

| Account Age | Depth     |
| ----------- | --------- |
| < 1 year    | `shallow` |
| 1–3 years   | `mid`     |
| 3–7 years   | `deep`    |
| 7+ years    | `abyss`   |

---

## AquariumStats

Aggregated statistics for the HUD overlay.

```typescript
interface AquariumStats {
  totalFish: number
  aliveFish: number
  fossilFish: number
  totalStars: number
  languageDistribution: Record<string, number> // language → repo count
  topLanguage: string | null
  largestFish: string | null // repo name of the largest fish
}
```

---

## Cache TTL

| Data                  | TTL        |
| --------------------- | ---------- |
| Full AquariumData     | 30 minutes |
| User profile          | 1 hour     |
| Contribution calendar | 24 hours   |

---

## Example Response (abbreviated)

```json
{
  "user": {
    "username": "torvalds",
    "displayName": "Linus Torvalds",
    "avatarUrl": "https://avatars.githubusercontent.com/u/1024025",
    "bio": "Just a kernel hacker",
    "followers": 230000,
    "accountAge": 14
  },
  "fish": [
    {
      "id": "torvalds/linux",
      "repoName": "linux",
      "species": "shark",
      "evolutionStage": "legendary",
      "color": "#555555",
      "size": 3.0,
      "swimSpeed": 1.8,
      "swimPattern": "linear",
      "stars": 185000
    }
  ],
  "environment": {
    "tankSize": "vast",
    "brightness": 1.0,
    "terrainHeights": [
      /* 52 values */
    ],
    "currentStrength": 0.9,
    "timeOfDay": "day",
    "depth": "abyss"
  },
  "stats": {
    "totalFish": 8,
    "aliveFish": 6,
    "fossilFish": 2,
    "totalStars": 190000,
    "topLanguage": "C",
    "largestFish": "linux"
  },
  "generatedAt": "2026-03-14T00:00:00.000Z"
}
```
