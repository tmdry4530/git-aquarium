import { describe, it, expect } from 'vitest'
import { THEMES, getTheme } from '@/lib/aquarium/themes'
import type { ThemeId } from '@/lib/aquarium/themes'

describe('Theme System', () => {
  it('should have 4 themes', () => {
    const themeIds = Object.keys(THEMES)
    expect(themeIds.length).toBe(4)
  })

  it('should have required properties for all themes', () => {
    const requiredKeys = [
      'id',
      'nameEn',
      'nameKo',
      'fogColor',
      'fogNear',
      'fogFar',
      'ambientColor',
      'ambientIntensity',
      'sunColor',
      'sunIntensity',
      'sunPosition',
      'backgroundColor',
      'waterColor',
      'particleColor',
    ] as const

    for (const theme of Object.values(THEMES)) {
      for (const key of requiredKeys) {
        expect(theme).toHaveProperty(key)
      }
    }
  })

  it('should return correct theme by ID', () => {
    const theme = getTheme('deep')
    expect(theme.id).toBe('deep')
    expect(theme.nameEn).toBe('Deep Sea')
  })

  it('should have valid fog ranges', () => {
    for (const theme of Object.values(THEMES)) {
      expect(theme.fogNear).toBeLessThan(theme.fogFar)
      expect(theme.fogNear).toBeGreaterThan(0)
    }
  })

  it('should have valid intensity ranges', () => {
    for (const theme of Object.values(THEMES)) {
      expect(theme.ambientIntensity).toBeGreaterThanOrEqual(0)
      expect(theme.ambientIntensity).toBeLessThanOrEqual(1)
      expect(theme.sunIntensity).toBeGreaterThanOrEqual(0)
      expect(theme.sunIntensity).toBeLessThanOrEqual(2)
    }
  })

  it('should have valid sun positions', () => {
    for (const theme of Object.values(THEMES)) {
      expect(theme.sunPosition).toHaveLength(3)
    }
  })

  it('should include all theme IDs', () => {
    const expected: ThemeId[] = ['default', 'coral', 'deep', 'arctic']
    for (const id of expected) {
      expect(THEMES[id]).toBeDefined()
    }
  })
})
