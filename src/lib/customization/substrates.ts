import type { SubstrateConfig, SubstrateType } from '@/types/gamification'

export const SUBSTRATE_CONFIGS: Record<SubstrateType, SubstrateConfig> = {
  sand: {
    type: 'sand',
    nameEn: 'Sand',
    nameKo: '모래',
    unlockMethod: 'default',
    unlockRef: null,
    materialKey: 'substrate_sand',
    bumpScale: 0.1,
    color: '#D4B896',
  },
  gravel: {
    type: 'gravel',
    nameEn: 'Gravel',
    nameKo: '자갈',
    unlockMethod: 'achievement',
    unlockRef: 'fossil_hunter',
    materialKey: 'substrate_gravel',
    bumpScale: 0.3,
    color: '#8A8A8A',
  },
  volcanic: {
    type: 'volcanic',
    nameEn: 'Volcanic Rock',
    nameKo: '화산암',
    unlockMethod: 'achievement',
    unlockRef: 'legendary_tamer',
    materialKey: 'substrate_volcanic',
    bumpScale: 0.5,
    color: '#2A1A1A',
  },
} as const

export function getSubstrateConfig(type: SubstrateType): SubstrateConfig {
  return SUBSTRATE_CONFIGS[type]
}

export function getAllSubstrates(): SubstrateConfig[] {
  return Object.values(SUBSTRATE_CONFIGS)
}

export function isSubstrateUnlocked(
  type: SubstrateType,
  unlockedAchievementIds: Set<string>,
): boolean {
  const config = SUBSTRATE_CONFIGS[type]
  if (config.unlockMethod === 'default') return true
  return (
    config.unlockRef !== null && unlockedAchievementIds.has(config.unlockRef)
  )
}

export function getUnlockedSubstrates(
  unlockedAchievementIds: Set<string>,
): SubstrateConfig[] {
  return getAllSubstrates().filter((s) =>
    isSubstrateUnlocked(s.type, unlockedAchievementIds),
  )
}
