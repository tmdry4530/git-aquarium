import type { FishSpecies, EvolutionStage, LegendaryFishType } from './fish'

export type CodexEntryStatus = 'undiscovered' | 'witnessed' | 'owned'

export interface CodexEntry {
  id: string
  species: FishSpecies
  evolutionStage: EvolutionStage | null
  legendaryType: LegendaryFishType | null
  status: CodexEntryStatus
  firstSeenAt: string | null
  firstSeenInAquarium: string | null // username
  description: string
  rarity: 'common' | 'uncommon' | 'rare' | 'legendary' | 'seasonal'
  isSeasonalLimited: boolean
  seasonTag: string | null // e.g. "halloween_2024"
}

export interface UserCodex {
  userId: string
  username: string
  entries: CodexEntry[]
  completionPercent: number
  totalEntries: number
  ownedCount: number
  witnessedCount: number
  lastUpdatedAt: string
}
