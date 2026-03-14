import type {
  FishSpecies,
  SwimPattern,
  EvolutionStage,
  LegendaryFishType,
} from '@/types/fish'

export interface SpeciesConfig {
  species: FishSpecies
  color: string
  swimPattern: SwimPattern
  baseSize: number
  maxSize: number
  scaleFactor: number
}

export const LANGUAGE_TO_SPECIES = {
  JavaScript: 'angelfish',
  TypeScript: 'manta',
  Python: 'turtle',
  Rust: 'pufferfish',
  Go: 'dolphin',
  Java: 'squid',
  C: 'shark',
  'C++': 'shark',
  'C#': 'shark',
  Solidity: 'seahorse',
  Ruby: 'goldfish',
  Swift: 'flyingfish',
  Kotlin: 'jellyfish',
  HTML: 'coral',
  CSS: 'coral',
  Shell: 'shell',
  Markdown: 'seaweed',
} as const satisfies Record<string, FishSpecies>

export const SPECIES_CONFIGS: Record<FishSpecies, SpeciesConfig> = {
  angelfish: {
    species: 'angelfish',
    color: '#F7DF1E',
    swimPattern: 'zigzag',
    baseSize: 0.5,
    maxSize: 2.5,
    scaleFactor: 0.15,
  },
  manta: {
    species: 'manta',
    color: '#3178C6',
    swimPattern: 'standard',
    baseSize: 0.6,
    maxSize: 3.0,
    scaleFactor: 0.18,
  },
  turtle: {
    species: 'turtle',
    color: '#3776AB',
    swimPattern: 'slow',
    baseSize: 0.5,
    maxSize: 2.0,
    scaleFactor: 0.12,
  },
  pufferfish: {
    species: 'pufferfish',
    color: '#DEA584',
    swimPattern: 'standard',
    baseSize: 0.4,
    maxSize: 2.0,
    scaleFactor: 0.14,
  },
  dolphin: {
    species: 'dolphin',
    color: '#00ADD8',
    swimPattern: 'linear',
    baseSize: 0.6,
    maxSize: 2.8,
    scaleFactor: 0.16,
  },
  squid: {
    species: 'squid',
    color: '#B07219',
    swimPattern: 'float',
    baseSize: 0.7,
    maxSize: 3.0,
    scaleFactor: 0.2,
  },
  shark: {
    species: 'shark',
    color: '#555555',
    swimPattern: 'linear',
    baseSize: 0.8,
    maxSize: 3.0,
    scaleFactor: 0.2,
  },
  seahorse: {
    species: 'seahorse',
    color: '#627EEA',
    swimPattern: 'float',
    baseSize: 0.3,
    maxSize: 1.5,
    scaleFactor: 0.1,
  },
  goldfish: {
    species: 'goldfish',
    color: '#CC342D',
    swimPattern: 'standard',
    baseSize: 0.4,
    maxSize: 2.0,
    scaleFactor: 0.12,
  },
  flyingfish: {
    species: 'flyingfish',
    color: '#FA7343',
    swimPattern: 'zigzag',
    baseSize: 0.5,
    maxSize: 2.5,
    scaleFactor: 0.15,
  },
  jellyfish: {
    species: 'jellyfish',
    color: '#7F52FF',
    swimPattern: 'float',
    baseSize: 0.4,
    maxSize: 2.0,
    scaleFactor: 0.12,
  },
  coral: {
    species: 'coral',
    color: '#E34F26',
    swimPattern: 'stationary',
    baseSize: 0.5,
    maxSize: 2.0,
    scaleFactor: 0.1,
  },
  shell: {
    species: 'shell',
    color: '#89E051',
    swimPattern: 'stationary',
    baseSize: 0.3,
    maxSize: 1.0,
    scaleFactor: 0.08,
  },
  seaweed: {
    species: 'seaweed',
    color: '#083FA1',
    swimPattern: 'stationary',
    baseSize: 0.4,
    maxSize: 1.5,
    scaleFactor: 0.08,
  },
  plankton: {
    species: 'plankton',
    color: '#AAAAAA',
    swimPattern: 'float',
    baseSize: 0.2,
    maxSize: 0.8,
    scaleFactor: 0.05,
  },
} as const

export const EVOLUTION_THRESHOLDS: Record<
  EvolutionStage,
  { minCommits: number; minDaysOld?: number; maxInactiveDays?: number }
> = {
  egg: { minCommits: 0 },
  fry: { minCommits: 3 },
  juvenile: { minCommits: 11 },
  adult: { minCommits: 51 },
  elder: { minCommits: 201, minDaysOld: 365 },
  legendary: { minCommits: 0 }, // special conditions apply
  fossil: { minCommits: 0, maxInactiveDays: 180 },
} as const

export const LEGENDARY_CONDITIONS: Record<LegendaryFishType, string> = {
  leviathan: 'Single repo with 10,000+ stars',
  phoenix_fish: 'Inactive 1+ year then reactivated',
  hydra: '1,000+ forks on a single repo',
  kraken: '500+ issues all closed',
  narwhal: '365-day contribution streak',
} as const

export function getEvolutionStage(
  totalCommits: number,
  daysSinceLastCommit: number,
  accountAgeDays: number,
): EvolutionStage {
  if (daysSinceLastCommit > 180) return 'fossil'
  if (totalCommits >= 201 && accountAgeDays >= 365) return 'elder'
  if (totalCommits >= 51) return 'adult'
  if (totalCommits >= 11) return 'juvenile'
  if (totalCommits >= 3) return 'fry'
  return 'egg'
}

export function getSpeciesFromLanguage(language: string | null): FishSpecies {
  if (!language) return 'plankton'
  return (
    (LANGUAGE_TO_SPECIES as Record<string, FishSpecies>)[language] ?? 'plankton'
  )
}

// 크기 공식: min(baseSize + log2(stars + 1) * scaleFactor, maxSize)
export function calculateFishSize(species: FishSpecies, stars: number): number {
  const config = SPECIES_CONFIGS[species]
  return Math.min(
    config.baseSize + Math.log2(stars + 1) * config.scaleFactor,
    config.maxSize,
  )
}

// 수영 속도: 최근 30일 커밋 기반 (0.0 ~ 2.0)
export function calculateSwimSpeed(commitsLast30Days: number): number {
  return Math.min(0.2 + commitsLast30Days * 0.06, 2.0)
}
