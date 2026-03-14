export interface LightingPreset {
  id: string
  nameEn: string
  nameKo: string
  ambientColor: string
  ambientIntensity: number
  directionalColor: string
  directionalIntensity: number
  directionalPosition: [number, number, number]
  pointLights: PointLightConfig[]
  fogColor: string | null
  fogDensity: number
  bloomIntensity: number
}

export interface PointLightConfig {
  color: string
  intensity: number
  position: [number, number, number]
  distance: number
}

export const LIGHTING_PRESETS: Record<string, LightingPreset> = {
  normal: {
    id: 'normal',
    nameEn: 'Normal',
    nameKo: '일반',
    ambientColor: '#ffffff',
    ambientIntensity: 0.4,
    directionalColor: '#fff8e0',
    directionalIntensity: 1.0,
    directionalPosition: [10, 20, 10],
    pointLights: [],
    fogColor: null,
    fogDensity: 0,
    bloomIntensity: 0,
  },
  neon: {
    id: 'neon',
    nameEn: 'Neon',
    nameKo: '네온',
    ambientColor: '#110022',
    ambientIntensity: 0.2,
    directionalColor: '#6622cc',
    directionalIntensity: 0.3,
    directionalPosition: [0, 15, 0],
    pointLights: [
      { color: '#ff00ff', intensity: 2.0, position: [-5, 3, -5], distance: 15 },
      { color: '#00ffff', intensity: 2.0, position: [5, 5, 5], distance: 15 },
      { color: '#ff4400', intensity: 1.5, position: [0, 2, -8], distance: 12 },
    ],
    fogColor: '#0a0015',
    fogDensity: 0.02,
    bloomIntensity: 1.5,
  },
  moonlight: {
    id: 'moonlight',
    nameEn: 'Moonlight',
    nameKo: '문라이트',
    ambientColor: '#1a2a4a',
    ambientIntensity: 0.1,
    directionalColor: '#8899cc',
    directionalIntensity: 0.5,
    directionalPosition: [5, 25, -5],
    pointLights: [
      { color: '#aabbee', intensity: 0.5, position: [0, 10, 0], distance: 30 },
    ],
    fogColor: '#0a0a1a',
    fogDensity: 0.01,
    bloomIntensity: 0.3,
  },
  caustic: {
    id: 'caustic',
    nameEn: 'Caustic',
    nameKo: '코스틱',
    ambientColor: '#2a4a5a',
    ambientIntensity: 0.3,
    directionalColor: '#66ccff',
    directionalIntensity: 0.8,
    directionalPosition: [8, 20, 3],
    pointLights: [
      { color: '#44aaff', intensity: 1.0, position: [-3, 8, -3], distance: 20 },
      { color: '#22ddff', intensity: 0.8, position: [3, 6, 3], distance: 18 },
    ],
    fogColor: '#0a2030',
    fogDensity: 0.005,
    bloomIntensity: 0.5,
  },
  sunset: {
    id: 'sunset',
    nameEn: 'Sunset',
    nameKo: '석양',
    ambientColor: '#4a2a1a',
    ambientIntensity: 0.3,
    directionalColor: '#ff8844',
    directionalIntensity: 0.9,
    directionalPosition: [-10, 8, 5],
    pointLights: [
      { color: '#ff6622', intensity: 0.6, position: [-8, 5, 0], distance: 25 },
    ],
    fogColor: '#1a0a05',
    fogDensity: 0.008,
    bloomIntensity: 0.4,
  },
  bioluminescent: {
    id: 'bioluminescent',
    nameEn: 'Bioluminescent',
    nameKo: '생체발광',
    ambientColor: '#001122',
    ambientIntensity: 0.08,
    directionalColor: '#224466',
    directionalIntensity: 0.15,
    directionalPosition: [0, 20, 0],
    pointLights: [
      { color: '#00ff88', intensity: 1.2, position: [-4, 3, -4], distance: 10 },
      { color: '#0088ff', intensity: 1.0, position: [4, 5, 2], distance: 12 },
      { color: '#ff44aa', intensity: 0.8, position: [0, 2, 6], distance: 8 },
    ],
    fogColor: '#000510',
    fogDensity: 0.015,
    bloomIntensity: 1.2,
  },
} as const

export function getLightingPreset(id: string): LightingPreset {
  const preset = LIGHTING_PRESETS[id]
  if (!preset) return LIGHTING_PRESETS.normal as LightingPreset
  return preset
}

export function getAllLightingPresets(): LightingPreset[] {
  return Object.values(LIGHTING_PRESETS)
}
