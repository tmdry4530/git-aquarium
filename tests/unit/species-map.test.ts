import { describe, it, expect } from 'vitest'
import {
  getSpeciesFromLanguage,
  calculateFishSize,
  calculateSwimSpeed,
  SPECIES_CONFIGS,
} from '@/constants/species-map'
import { getSpeciesForLanguage, getSpeciesColor } from '@/lib/aquarium/species'

describe('getSpeciesFromLanguage', () => {
  it('should return plankton for null', () => {
    expect(getSpeciesFromLanguage(null)).toBe('plankton')
  })

  it('should return plankton for unknown language', () => {
    expect(getSpeciesFromLanguage('Brainfuck')).toBe('plankton')
  })

  it('should return angelfish for JavaScript', () => {
    expect(getSpeciesFromLanguage('JavaScript')).toBe('angelfish')
  })

  it('should return manta for TypeScript', () => {
    expect(getSpeciesFromLanguage('TypeScript')).toBe('manta')
  })

  it('should return turtle for Python', () => {
    expect(getSpeciesFromLanguage('Python')).toBe('turtle')
  })

  it('should return shark for C++', () => {
    expect(getSpeciesFromLanguage('C++')).toBe('shark')
  })

  it('should return shark for C#', () => {
    expect(getSpeciesFromLanguage('C#')).toBe('shark')
  })
})

describe('getSpeciesForLanguage (aquarium/species)', () => {
  it('should return plankton for null', () => {
    expect(getSpeciesForLanguage(null)).toBe('plankton')
  })

  it('should return manta for TypeScript', () => {
    expect(getSpeciesForLanguage('TypeScript')).toBe('manta')
  })
})

describe('calculateFishSize', () => {
  it('should return base size for 0 stars', () => {
    const config = SPECIES_CONFIGS['angelfish']
    const size = calculateFishSize('angelfish', 0)
    expect(size).toBeCloseTo(
      config.baseSize + Math.log2(1) * config.scaleFactor,
    )
  })

  it('should not exceed maxSize', () => {
    const size = calculateFishSize('manta', 1_000_000)
    expect(size).toBeLessThanOrEqual(SPECIES_CONFIGS['manta'].maxSize)
  })

  it('should increase with more stars', () => {
    const small = calculateFishSize('dolphin', 10)
    const large = calculateFishSize('dolphin', 1000)
    expect(large).toBeGreaterThan(small)
  })
})

describe('calculateSwimSpeed', () => {
  it('should return minimum speed for 0 commits', () => {
    expect(calculateSwimSpeed(0)).toBeCloseTo(0.2)
  })

  it('should increase with more commits', () => {
    expect(calculateSwimSpeed(10)).toBeGreaterThan(calculateSwimSpeed(0))
  })

  it('should not exceed 2.0', () => {
    expect(calculateSwimSpeed(1000)).toBeLessThanOrEqual(2.0)
  })
})

describe('getSpeciesColor', () => {
  it('should return hex color for manta', () => {
    const color = getSpeciesColor('manta')
    expect(color).toMatch(/^#[0-9A-Fa-f]{6}$/)
  })
})
