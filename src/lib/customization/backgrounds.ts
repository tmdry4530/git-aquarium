export interface BackgroundConfig {
  id: string
  nameEn: string
  nameKo: string
  fogColor: string
  fogNear: number
  fogFar: number
  ambientColor: string
  ambientIntensity: number
  sunColor: string
  sunIntensity: number
  sunPosition: [number, number, number]
  backgroundColor: string
  unlockMethod: 'default' | 'achievement'
  unlockRef: string | null
}

export const BACKGROUND_CONFIGS: Record<string, BackgroundConfig> = {
  tropical: {
    id: 'tropical',
    nameEn: 'Tropical',
    nameKo: '열대',
    fogColor: '#0d3a4a',
    fogNear: 12,
    fogFar: 80,
    ambientColor: '#66cccc',
    ambientIntensity: 0.5,
    sunColor: '#fff8e0',
    sunIntensity: 1.2,
    sunPosition: [10, 25, 10],
    backgroundColor: '#0d3a4a',
    unlockMethod: 'default',
    unlockRef: null,
  },
  deep_sea: {
    id: 'deep_sea',
    nameEn: 'Deep Sea',
    nameKo: '심해',
    fogColor: '#030310',
    fogNear: 4,
    fogFar: 40,
    ambientColor: '#112244',
    ambientIntensity: 0.12,
    sunColor: '#4466aa',
    sunIntensity: 0.2,
    sunPosition: [0, 30, 0],
    backgroundColor: '#030310',
    unlockMethod: 'achievement',
    unlockRef: 'deep_diver',
  },
  coral_reef: {
    id: 'coral_reef',
    nameEn: 'Coral Reef',
    nameKo: '산호초',
    fogColor: '#0d2a3a',
    fogNear: 8,
    fogFar: 60,
    ambientColor: '#66aacc',
    ambientIntensity: 0.5,
    sunColor: '#fff5e0',
    sunIntensity: 1.2,
    sunPosition: [8, 25, 8],
    backgroundColor: '#0d2a3a',
    unlockMethod: 'achievement',
    unlockRef: 'diverse_ocean',
  },
  shipwreck: {
    id: 'shipwreck',
    nameEn: 'Shipwreck',
    nameKo: '난파선',
    fogColor: '#0a1a20',
    fogNear: 6,
    fogFar: 50,
    ambientColor: '#445566',
    ambientIntensity: 0.3,
    sunColor: '#bbccaa',
    sunIntensity: 0.6,
    sunPosition: [5, 15, 8],
    backgroundColor: '#0a1a20',
    unlockMethod: 'achievement',
    unlockRef: 'star_collector',
  },
  cave: {
    id: 'cave',
    nameEn: 'Underwater Cave',
    nameKo: '수중동굴',
    fogColor: '#080812',
    fogNear: 3,
    fogFar: 35,
    ambientColor: '#223344',
    ambientIntensity: 0.15,
    sunColor: '#557799',
    sunIntensity: 0.3,
    sunPosition: [2, 10, 2],
    backgroundColor: '#080812',
    unlockMethod: 'achievement',
    unlockRef: 'fossil_hunter',
  },
  volcano: {
    id: 'volcano',
    nameEn: 'Underwater Volcano',
    nameKo: '해저화산',
    fogColor: '#120808',
    fogNear: 5,
    fogFar: 45,
    ambientColor: '#442211',
    ambientIntensity: 0.2,
    sunColor: '#ff6633',
    sunIntensity: 0.8,
    sunPosition: [0, 10, 0],
    backgroundColor: '#120808',
    unlockMethod: 'achievement',
    unlockRef: 'legendary_tamer',
  },
} as const

export function getBackgroundConfig(id: string): BackgroundConfig {
  const config = BACKGROUND_CONFIGS[id]
  if (!config) return BACKGROUND_CONFIGS.tropical as BackgroundConfig
  return config
}

export function getAllBackgrounds(): BackgroundConfig[] {
  return Object.values(BACKGROUND_CONFIGS)
}

export function getUnlockedBackgrounds(
  unlockedAchievementIds: Set<string>,
): BackgroundConfig[] {
  return getAllBackgrounds().filter(
    (bg) =>
      bg.unlockMethod === 'default' ||
      (bg.unlockRef !== null && unlockedAchievementIds.has(bg.unlockRef)),
  )
}

export function isBackgroundUnlocked(
  backgroundId: string,
  unlockedAchievementIds: Set<string>,
): boolean {
  const bg = BACKGROUND_CONFIGS[backgroundId]
  if (!bg) return false
  if (bg.unlockMethod === 'default') return true
  return bg.unlockRef !== null && unlockedAchievementIds.has(bg.unlockRef)
}
