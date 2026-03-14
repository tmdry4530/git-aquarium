export interface DecorationConfig {
  id: string
  nameEn: string
  nameKo: string
  category: 'furniture' | 'natural' | 'special'
  defaultPosition: [number, number, number]
  scale: [number, number, number]
  unlockMethod: 'default' | 'achievement' | 'kudos' | 'season'
  unlockRef: string | null
}

export const MAX_DECORATIONS = 5

export const DECORATION_CONFIGS: Record<string, DecorationConfig> = {
  treasure_chest: {
    id: 'treasure_chest',
    nameEn: 'Treasure Chest',
    nameKo: '보물상자',
    category: 'furniture',
    defaultPosition: [-3, -4.5, -2],
    scale: [0.8, 0.8, 0.8],
    unlockMethod: 'kudos',
    unlockRef: '50',
  },
  anchor: {
    id: 'anchor',
    nameEn: 'Old Anchor',
    nameKo: '오래된 닻',
    category: 'furniture',
    defaultPosition: [4, -4.5, -3],
    scale: [1.0, 1.0, 1.0],
    unlockMethod: 'default',
    unlockRef: null,
  },
  coral_formation: {
    id: 'coral_formation',
    nameEn: 'Coral Formation',
    nameKo: '산호 군락',
    category: 'natural',
    defaultPosition: [2, -4.5, 2],
    scale: [1.2, 1.2, 1.2],
    unlockMethod: 'default',
    unlockRef: null,
  },
  castle: {
    id: 'castle',
    nameEn: 'Underwater Castle',
    nameKo: '수중 성',
    category: 'furniture',
    defaultPosition: [0, -4.5, -4],
    scale: [0.6, 0.6, 0.6],
    unlockMethod: 'achievement',
    unlockRef: 'star_collector',
  },
  diver_figure: {
    id: 'diver_figure',
    nameEn: 'Diver Figure',
    nameKo: '다이버 피규어',
    category: 'special',
    defaultPosition: [-2, -4.5, 3],
    scale: [0.5, 0.5, 0.5],
    unlockMethod: 'achievement',
    unlockRef: 'deep_diver',
  },
  pirate_ship: {
    id: 'pirate_ship',
    nameEn: 'Pirate Ship',
    nameKo: '해적선',
    category: 'furniture',
    defaultPosition: [0, -3, -5],
    scale: [0.4, 0.4, 0.4],
    unlockMethod: 'achievement',
    unlockRef: 'fossil_hunter',
  },
  shell_set: {
    id: 'shell_set',
    nameEn: 'Shell Collection',
    nameKo: '조개 세트',
    category: 'natural',
    defaultPosition: [3, -4.5, 0],
    scale: [0.7, 0.7, 0.7],
    unlockMethod: 'kudos',
    unlockRef: '10',
  },
  rainbow_coral: {
    id: 'rainbow_coral',
    nameEn: 'Rainbow Coral',
    nameKo: '무지개 산호',
    category: 'natural',
    defaultPosition: [-4, -4.5, 0],
    scale: [1.0, 1.0, 1.0],
    unlockMethod: 'achievement',
    unlockRef: 'social_butterfly',
  },
  golden_crown: {
    id: 'golden_crown',
    nameEn: 'Golden Crown',
    nameKo: '황금 왕관',
    category: 'special',
    defaultPosition: [0, -4, 0],
    scale: [0.5, 0.5, 0.5],
    unlockMethod: 'kudos',
    unlockRef: '1000',
  },
  crown_skin: {
    id: 'crown_skin',
    nameEn: 'Ocean King Crown',
    nameKo: '바다 왕관',
    category: 'special',
    defaultPosition: [0, -3.5, 0],
    scale: [0.6, 0.6, 0.6],
    unlockMethod: 'achievement',
    unlockRef: 'ocean_king',
  },
} as const

export function getDecorationConfig(id: string): DecorationConfig | undefined {
  return DECORATION_CONFIGS[id]
}

export function getAllDecorations(): DecorationConfig[] {
  return Object.values(DECORATION_CONFIGS)
}

export function getUnlockedDecorations(
  unlockedAchievementIds: Set<string>,
  totalKudos: number,
): DecorationConfig[] {
  return getAllDecorations().filter((d) =>
    isDecorationUnlocked(d, unlockedAchievementIds, totalKudos),
  )
}

export function isDecorationUnlocked(
  decoration: DecorationConfig,
  unlockedAchievementIds: Set<string>,
  totalKudos: number,
): boolean {
  switch (decoration.unlockMethod) {
    case 'default':
      return true
    case 'achievement':
      return (
        decoration.unlockRef !== null &&
        unlockedAchievementIds.has(decoration.unlockRef)
      )
    case 'kudos':
      return (
        decoration.unlockRef !== null &&
        totalKudos >= parseInt(decoration.unlockRef, 10)
      )
    case 'season':
      return false // seasons handled separately
  }
}

export function validateDecorationSelection(decorationIds: string[]): {
  valid: boolean
  error: string | null
} {
  if (decorationIds.length > MAX_DECORATIONS) {
    return {
      valid: false,
      error: `Maximum ${MAX_DECORATIONS} decorations allowed`,
    }
  }

  const uniqueIds = new Set(decorationIds)
  if (uniqueIds.size !== decorationIds.length) {
    return { valid: false, error: 'Duplicate decorations not allowed' }
  }

  for (const id of decorationIds) {
    if (!DECORATION_CONFIGS[id]) {
      return { valid: false, error: `Unknown decoration: ${id}` }
    }
  }

  return { valid: true, error: null }
}
