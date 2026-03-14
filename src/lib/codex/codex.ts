import type {
  FishSpecies,
  EvolutionStage,
  LegendaryFishType,
} from '@/types/fish'
import type { CodexEntry, CodexEntryStatus, UserCodex } from '@/types/codex'
import { SPECIES_CONFIGS } from '@/constants/species-map'

const ALL_SPECIES: FishSpecies[] = [
  'angelfish',
  'manta',
  'turtle',
  'pufferfish',
  'dolphin',
  'squid',
  'shark',
  'seahorse',
  'goldfish',
  'flyingfish',
  'jellyfish',
  'coral',
  'shell',
  'seaweed',
  'plankton',
] as const

const EVOLUTION_STAGES: EvolutionStage[] = [
  'egg',
  'fry',
  'juvenile',
  'adult',
  'elder',
  'legendary',
  'fossil',
] as const

const LEGENDARY_TYPES: LegendaryFishType[] = [
  'leviathan',
  'phoenix_fish',
  'hydra',
  'kraken',
  'narwhal',
] as const

function getEntryRarity(
  stage: EvolutionStage | null,
  legendaryType: LegendaryFishType | null,
): CodexEntry['rarity'] {
  if (legendaryType) return 'legendary'
  switch (stage) {
    case 'elder':
      return 'rare'
    case 'adult':
      return 'uncommon'
    case 'fossil':
      return 'rare'
    default:
      return 'common'
  }
}

function getEntryDescription(
  species: FishSpecies,
  stage: EvolutionStage | null,
): string {
  const config = SPECIES_CONFIGS[species]
  const stageDesc = stage ? ` (${stage})` : ''
  return `${species}${stageDesc} — ${config.swimPattern} swimmer, base color ${config.color}`
}

function generateAllEntries(): CodexEntry[] {
  const entries: CodexEntry[] = []

  // Species × evolution stage combinations
  for (const species of ALL_SPECIES) {
    for (const stage of EVOLUTION_STAGES) {
      if (stage === 'legendary') continue // legendary handled separately
      entries.push({
        id: `${species}_${stage}`,
        species,
        evolutionStage: stage,
        legendaryType: null,
        status: 'undiscovered',
        firstSeenAt: null,
        firstSeenInAquarium: null,
        description: getEntryDescription(species, stage),
        rarity: getEntryRarity(stage, null),
        isSeasonalLimited: false,
        seasonTag: null,
      })
    }
  }

  // Legendary fish entries
  for (const legendaryType of LEGENDARY_TYPES) {
    entries.push({
      id: `legendary_${legendaryType}`,
      species: 'shark' as FishSpecies, // placeholder species for display
      evolutionStage: 'legendary',
      legendaryType,
      status: 'undiscovered',
      firstSeenAt: null,
      firstSeenInAquarium: null,
      description: `Legendary ${legendaryType} — extremely rare`,
      rarity: 'legendary',
      isSeasonalLimited: false,
      seasonTag: null,
    })
  }

  return entries
}

export function generateCodexForUser(
  username: string,
  ownedFish: Array<{ species: FishSpecies; evolutionStage: EvolutionStage }>,
): UserCodex {
  const allEntries = generateAllEntries()
  const ownedSet = new Set(
    ownedFish.map((f) => `${f.species}_${f.evolutionStage}`),
  )

  const now = new Date().toISOString()
  const entries: CodexEntry[] = allEntries.map((entry) => {
    const isOwned = ownedSet.has(entry.id)
    const status: CodexEntryStatus = isOwned ? 'owned' : 'undiscovered'
    return {
      ...entry,
      status,
      firstSeenAt: isOwned ? now : null,
      firstSeenInAquarium: isOwned ? username : null,
    }
  })

  const ownedCount = entries.filter((e) => e.status === 'owned').length
  const witnessedCount = entries.filter((e) => e.status === 'witnessed').length

  return {
    userId: username,
    username,
    entries,
    completionPercent:
      entries.length > 0 ? Math.round((ownedCount / entries.length) * 100) : 0,
    totalEntries: entries.length,
    ownedCount,
    witnessedCount,
    lastUpdatedAt: now,
  }
}

export function getCodexStats(codex: UserCodex): {
  total: number
  owned: number
  witnessed: number
  undiscovered: number
  completionPercent: number
} {
  const owned = codex.entries.filter((e) => e.status === 'owned').length
  const witnessed = codex.entries.filter((e) => e.status === 'witnessed').length
  const undiscovered = codex.entries.filter(
    (e) => e.status === 'undiscovered',
  ).length
  return {
    total: codex.totalEntries,
    owned,
    witnessed,
    undiscovered,
    completionPercent: codex.completionPercent,
  }
}

export { generateAllEntries, ALL_SPECIES, EVOLUTION_STAGES, LEGENDARY_TYPES }
