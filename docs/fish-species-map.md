# Fish Species Mapping Table (D5)

## Language → Species Mapping

| Language        | Species      | Color     | Swim Pattern | Notes                 |
| --------------- | ------------ | --------- | ------------ | --------------------- |
| JavaScript      | `angelfish`  | `#F7DF1E` | zigzag       | Energetic, everywhere |
| TypeScript      | `manta`      | `#3178C6` | standard     | Elegant, structured   |
| Python          | `turtle`     | `#3776AB` | slow         | Methodical, reliable  |
| Rust            | `pufferfish` | `#DEA584` | standard     | Defensive, safe       |
| Go              | `dolphin`    | `#00ADD8` | linear       | Fast, concurrent      |
| Java            | `squid`      | `#B07219` | float        | Verbose, enterprise   |
| C / C++ / C#    | `shark`      | `#555555` | linear       | Powerful, low-level   |
| Solidity        | `seahorse`   | `#627EEA` | float        | Crypto, unique        |
| Ruby            | `goldfish`   | `#CC342D` | standard     | Elegant, expressive   |
| Swift           | `flyingfish` | `#FA7343` | zigzag       | Fast, Apple ecosystem |
| Kotlin          | `jellyfish`  | `#7F52FF` | float        | Modern JVM            |
| HTML / CSS      | `coral`      | `#E34F26` | stationary   | Static but beautiful  |
| Shell           | `shell`      | `#89E051` | stationary   | Utility, scripting    |
| Markdown        | `seaweed`    | `#083FA1` | stationary   | Documentation         |
| Other / Unknown | `plankton`   | `#AAAAAA` | float        | Tiny, miscellaneous   |

---

## Species Configuration

| Species    | baseSize | maxSize | scaleFactor |
| ---------- | -------- | ------- | ----------- |
| angelfish  | 0.5      | 2.5     | 0.15        |
| manta      | 0.6      | 3.0     | 0.18        |
| turtle     | 0.5      | 2.0     | 0.12        |
| pufferfish | 0.4      | 2.0     | 0.14        |
| dolphin    | 0.6      | 2.8     | 0.16        |
| squid      | 0.7      | 3.0     | 0.20        |
| shark      | 0.8      | 3.0     | 0.20        |
| seahorse   | 0.3      | 1.5     | 0.10        |
| goldfish   | 0.4      | 2.0     | 0.12        |
| flyingfish | 0.5      | 2.5     | 0.15        |
| jellyfish  | 0.4      | 2.0     | 0.12        |
| coral      | 0.5      | 2.0     | 0.10        |
| shell      | 0.3      | 1.0     | 0.08        |
| seaweed    | 0.4      | 1.5     | 0.08        |
| plankton   | 0.2      | 0.8     | 0.05        |

---

## Size Formula

```
size = min(baseSize + log2(stars + 1) * scaleFactor, maxSize)
```

### Examples

| Species | Stars | Calculation               | Result        |
| ------- | ----- | ------------------------- | ------------- |
| dolphin | 0     | 0.6 + log2(1) \* 0.16     | 0.60          |
| dolphin | 100   | 0.6 + log2(101) \* 0.16   | 1.71          |
| shark   | 10000 | 0.8 + log2(10001) \* 0.20 | 3.00 (capped) |

---

## Evolution Stages

| Stage       | Condition                               | Visual                       |
| ----------- | --------------------------------------- | ---------------------------- |
| `egg`       | totalCommits 0–2                        | Tiny, translucent            |
| `fry`       | totalCommits 3–10                       | Small, basic shape           |
| `juvenile`  | totalCommits 11–50                      | Recognizable species shape   |
| `adult`     | totalCommits 51–200                     | Full size, normal color      |
| `elder`     | totalCommits 200+ AND repo age ≥ 1 year | Slightly larger, aged color  |
| `legendary` | stars ≥ 1000 OR special conditions      | Golden glow, max size        |
| `fossil`    | daysSinceLastCommit ≥ 180               | Gray, slow-floating skeleton |

### Priority Order

`fossil` > `legendary` > `elder` > `adult` > `juvenile` > `fry` > `egg`

---

## Swim Speed Formula

```
swimSpeed = min(0.2 + commitsLast30Days * 0.06, 2.0)
```

| commitsLast30Days | swimSpeed            |
| ----------------- | -------------------- |
| 0                 | 0.20 (barely moving) |
| 5                 | 0.50                 |
| 10                | 0.80                 |
| 20                | 1.40                 |
| 30                | 2.00 (max)           |

---

## Swim Patterns

| Pattern      | Description                      | Species                              |
| ------------ | -------------------------------- | ------------------------------------ |
| `linear`     | Straight lines, turns sharply    | shark, dolphin                       |
| `float`      | Gentle drifting, up/down motion  | squid, seahorse, jellyfish, plankton |
| `slow`       | Very slow circular motion        | turtle                               |
| `standard`   | Curved paths, group behavior     | manta, pufferfish, goldfish          |
| `zigzag`     | Quick direction changes          | angelfish, flyingfish                |
| `stationary` | Attached to terrain, sway gently | coral, shell, seaweed                |

---

## Special Conditions for Legendary

- stars ≥ 1000
- (Future) Featured on GitHub Trending for 7+ days
- (Future) Used by 1000+ dependent repos
