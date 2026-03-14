export type ThemeId = 'default' | 'coral' | 'deep' | 'arctic'

export interface ThemeConfig {
  id: ThemeId
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
  waterColor: string
  particleColor: string
}

export const THEMES: Record<ThemeId, ThemeConfig> = {
  default: {
    id: 'default',
    nameEn: 'Ocean',
    nameKo: '대양',
    fogColor: '#0a1628',
    fogNear: 10,
    fogFar: 80,
    ambientColor: '#4488cc',
    ambientIntensity: 0.4,
    sunColor: '#ffffff',
    sunIntensity: 1.0,
    sunPosition: [10, 20, 10],
    backgroundColor: '#0a1628',
    waterColor: '#1a4a7a',
    particleColor: '#88ccff',
  },
  coral: {
    id: 'coral',
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
    waterColor: '#1a6a6a',
    particleColor: '#aaffcc',
  },
  deep: {
    id: 'deep',
    nameEn: 'Deep Sea',
    nameKo: '심해',
    fogColor: '#050510',
    fogNear: 5,
    fogFar: 50,
    ambientColor: '#112244',
    ambientIntensity: 0.15,
    sunColor: '#6688bb',
    sunIntensity: 0.3,
    sunPosition: [0, 30, 0],
    backgroundColor: '#050510',
    waterColor: '#0a1030',
    particleColor: '#4466aa',
  },
  arctic: {
    id: 'arctic',
    nameEn: 'Arctic',
    nameKo: '북극해',
    fogColor: '#c8dce8',
    fogNear: 15,
    fogFar: 90,
    ambientColor: '#aaccee',
    ambientIntensity: 0.6,
    sunColor: '#ffffff',
    sunIntensity: 0.8,
    sunPosition: [5, 15, 10],
    backgroundColor: '#c8dce8',
    waterColor: '#8ab4d0',
    particleColor: '#ffffff',
  },
} as const

export function getTheme(id: ThemeId): ThemeConfig {
  return THEMES[id]
}

export function getStoredTheme(): ThemeId {
  if (typeof window === 'undefined') return 'default'
  const stored = localStorage.getItem('aquarium-theme')
  if (stored && stored in THEMES) return stored as ThemeId
  return 'default'
}

export function storeTheme(id: ThemeId): void {
  if (typeof window === 'undefined') return
  localStorage.setItem('aquarium-theme', id)
}
