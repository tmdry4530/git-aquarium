export interface FrameConfig {
  id: string
  nameEn: string
  nameKo: string
  borderStyle: string
  borderWidth: number
  borderColor: string
  borderRadius: number
  boxShadow: string
  unlockMethod: 'default' | 'achievement' | 'kudos'
  unlockRef: string | null
}

export const FRAME_CONFIGS: Record<string, FrameConfig> = {
  none: {
    id: 'none',
    nameEn: 'None',
    nameKo: '없음',
    borderStyle: 'none',
    borderWidth: 0,
    borderColor: 'transparent',
    borderRadius: 0,
    boxShadow: 'none',
    unlockMethod: 'default',
    unlockRef: null,
  },
  wood: {
    id: 'wood',
    nameEn: 'Wood',
    nameKo: '나무',
    borderStyle: 'solid',
    borderWidth: 8,
    borderColor: '#8B6914',
    borderRadius: 4,
    boxShadow: 'inset 0 0 10px rgba(139, 105, 20, 0.3)',
    unlockMethod: 'default',
    unlockRef: null,
  },
  metal: {
    id: 'metal',
    nameEn: 'Metal',
    nameKo: '금속',
    borderStyle: 'solid',
    borderWidth: 6,
    borderColor: '#708090',
    borderRadius: 2,
    boxShadow:
      'inset 0 0 8px rgba(112, 128, 144, 0.4), 0 2px 8px rgba(0, 0, 0, 0.3)',
    unlockMethod: 'default',
    unlockRef: null,
  },
  crystal: {
    id: 'crystal',
    nameEn: 'Crystal',
    nameKo: '크리스탈',
    borderStyle: 'solid',
    borderWidth: 6,
    borderColor: '#88ccff',
    borderRadius: 8,
    boxShadow:
      'inset 0 0 15px rgba(136, 204, 255, 0.4), 0 0 20px rgba(136, 204, 255, 0.2)',
    unlockMethod: 'kudos',
    unlockRef: '500',
  },
  golden: {
    id: 'golden',
    nameEn: 'Golden',
    nameKo: '금색',
    borderStyle: 'solid',
    borderWidth: 8,
    borderColor: '#FFD700',
    borderRadius: 6,
    boxShadow:
      'inset 0 0 12px rgba(255, 215, 0, 0.5), 0 0 25px rgba(255, 215, 0, 0.3)',
    unlockMethod: 'achievement',
    unlockRef: 'legendary_tamer',
  },
  ancient: {
    id: 'ancient',
    nameEn: 'Ancient',
    nameKo: '고대',
    borderStyle: 'double',
    borderWidth: 10,
    borderColor: '#556B2F',
    borderRadius: 0,
    boxShadow:
      'inset 0 0 20px rgba(85, 107, 47, 0.3), 0 4px 12px rgba(0, 0, 0, 0.4)',
    unlockMethod: 'achievement',
    unlockRef: 'fossil_hunter',
  },
  typescript_frame: {
    id: 'typescript_frame',
    nameEn: 'TypeScript',
    nameKo: 'TypeScript',
    borderStyle: 'solid',
    borderWidth: 6,
    borderColor: '#3178C6',
    borderRadius: 6,
    boxShadow:
      'inset 0 0 10px rgba(49, 120, 198, 0.3), 0 0 15px rgba(49, 120, 198, 0.2)',
    unlockMethod: 'achievement',
    unlockRef: 'codex_master',
  },
} as const

export function getFrameConfig(id: string): FrameConfig {
  const config = FRAME_CONFIGS[id]
  if (!config) return FRAME_CONFIGS.none as FrameConfig
  return config
}

export function getAllFrames(): FrameConfig[] {
  return Object.values(FRAME_CONFIGS)
}

export function getUnlockedFrames(
  unlockedAchievementIds: Set<string>,
  totalKudos: number,
): FrameConfig[] {
  return getAllFrames().filter((f) =>
    isFrameUnlocked(f, unlockedAchievementIds, totalKudos),
  )
}

export function isFrameUnlocked(
  frame: FrameConfig,
  unlockedAchievementIds: Set<string>,
  totalKudos: number,
): boolean {
  switch (frame.unlockMethod) {
    case 'default':
      return true
    case 'achievement':
      return (
        frame.unlockRef !== null && unlockedAchievementIds.has(frame.unlockRef)
      )
    case 'kudos':
      return (
        frame.unlockRef !== null && totalKudos >= parseInt(frame.unlockRef, 10)
      )
  }
}

export function getFrameCSSProperties(frameId: string): Record<string, string> {
  const config = getFrameConfig(frameId)
  if (config.borderStyle === 'none') return {}

  return {
    borderStyle: config.borderStyle,
    borderWidth: `${config.borderWidth}px`,
    borderColor: config.borderColor,
    borderRadius: `${config.borderRadius}px`,
    boxShadow: config.boxShadow,
  }
}
