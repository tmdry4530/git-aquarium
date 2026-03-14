export type FishSpecies =
  | 'angelfish' // JavaScript
  | 'manta' // TypeScript
  | 'turtle' // Python
  | 'pufferfish' // Rust
  | 'dolphin' // Go
  | 'squid' // Java
  | 'shark' // C/C++
  | 'seahorse' // Solidity
  | 'goldfish' // Ruby
  | 'flyingfish' // Swift
  | 'jellyfish' // Kotlin
  | 'coral' // HTML/CSS
  | 'shell' // Shell
  | 'seaweed' // Markdown
  | 'plankton' // 기타/Unknown

export type LegendaryFishType =
  | 'leviathan' // 단일 레포 스타 10,000+
  | 'phoenix_fish' // 1년+ 비활성 후 재활성화
  | 'hydra' // 포크 1,000+
  | 'kraken' // 이슈 500+ 모두 클로즈
  | 'narwhal' // 365일 연속 커밋

export type EvolutionStage =
  | 'egg' // 커밋 0-2
  | 'fry' // 커밋 3-10
  | 'juvenile' // 커밋 11-50
  | 'adult' // 커밋 51-200
  | 'elder' // 커밋 200+ AND 1년+
  | 'legendary' // 스타 1000+ OR 특수 조건
  | 'fossil' // 180일+ 비활성

export type SwimPattern =
  | 'linear'
  | 'float'
  | 'slow'
  | 'standard'
  | 'zigzag'
  | 'stationary'

export interface FishData {
  id: string
  repoName: string
  repoUrl: string
  description: string | null
  species: FishSpecies
  evolutionStage: EvolutionStage
  color: string // hex
  size: number // 0.5 ~ 3.0
  swimSpeed: number // 0.0 ~ 2.0
  swimPattern: SwimPattern
  stars: number
  forks: number
  openIssues: number
  hasReadme: boolean
  hasLicense: boolean
  language: string | null
  lastCommitAt: string
  totalCommits: number
  commitsLast30Days: number
  createdAt: string
}
