import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { getEvolutionStage } from '@/lib/aquarium/evolution'

const NOW = new Date('2024-01-01T00:00:00Z')

// dates relative to NOW
function daysAgo(days: number): string {
  return new Date(NOW.getTime() - days * 86400000).toISOString()
}

function yearsAgo(years: number): string {
  return new Date(NOW.getTime() - years * 365.25 * 86400000).toISOString()
}

describe('getEvolutionStage', () => {
  beforeEach(() => {
    vi.useFakeTimers()
    vi.setSystemTime(NOW)
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  // --- fossil (inactive 180+ days) ---
  it('should return fossil for exactly 180 days inactive', () => {
    expect(getEvolutionStage(100, 0, yearsAgo(2), daysAgo(180))).toBe('fossil')
  })

  it('should return fossil for 200 days inactive', () => {
    expect(getEvolutionStage(500, 999, yearsAgo(3), daysAgo(200))).toBe(
      'fossil',
    )
  })

  it('should NOT return fossil at 179 days inactive', () => {
    expect(getEvolutionStage(0, 0, yearsAgo(1), daysAgo(179))).not.toBe(
      'fossil',
    )
  })

  it('should prioritize fossil over legendary (1000+ stars but inactive)', () => {
    expect(getEvolutionStage(1000, 5000, yearsAgo(3), daysAgo(200))).toBe(
      'fossil',
    )
  })

  // --- legendary (1000+ stars) ---
  it('should return legendary for 1000 stars', () => {
    expect(getEvolutionStage(100, 1000, yearsAgo(2), daysAgo(1))).toBe(
      'legendary',
    )
  })

  it('should return legendary for 10000 stars', () => {
    expect(getEvolutionStage(50, 10000, yearsAgo(1), daysAgo(10))).toBe(
      'legendary',
    )
  })

  it('should NOT return legendary at 999 stars', () => {
    expect(getEvolutionStage(300, 999, yearsAgo(2), daysAgo(1))).not.toBe(
      'legendary',
    )
  })

  it('should prioritize legendary over elder', () => {
    expect(getEvolutionStage(300, 1000, yearsAgo(2), daysAgo(1))).toBe(
      'legendary',
    )
  })

  // --- elder (200+ commits AND 1+ year) ---
  it('should return elder for 200 commits with 1+ year account age', () => {
    expect(getEvolutionStage(200, 0, yearsAgo(1.1), daysAgo(1))).toBe('elder')
  })

  it('should return adult for 200 commits without 1 year', () => {
    expect(getEvolutionStage(200, 0, yearsAgo(0.5), daysAgo(1))).toBe('adult')
  })

  it('should return adult for 201 commits without 1 year', () => {
    expect(getEvolutionStage(201, 0, yearsAgo(0.9), daysAgo(1))).toBe('adult')
  })

  // --- adult (51-200 commits) ---
  it('should return adult for 51 commits', () => {
    expect(getEvolutionStage(51, 0, yearsAgo(0.5), daysAgo(1))).toBe('adult')
  })

  it('should return adult for 200 commits < 1yr', () => {
    expect(getEvolutionStage(200, 0, yearsAgo(0.8), daysAgo(1))).toBe('adult')
  })

  // --- juvenile (11-50 commits) ---
  it('should return juvenile for 11 commits', () => {
    expect(getEvolutionStage(11, 0, yearsAgo(0.5), daysAgo(1))).toBe('juvenile')
  })

  it('should return juvenile for 50 commits', () => {
    expect(getEvolutionStage(50, 0, yearsAgo(0.5), daysAgo(1))).toBe('juvenile')
  })

  // --- fry (3-10 commits) ---
  it('should return fry for 3 commits', () => {
    expect(getEvolutionStage(3, 0, yearsAgo(0.1), daysAgo(1))).toBe('fry')
  })

  it('should return fry for 10 commits', () => {
    expect(getEvolutionStage(10, 0, yearsAgo(0.1), daysAgo(1))).toBe('fry')
  })

  // --- egg (0-2 commits) ---
  it('should return egg for 0 commits', () => {
    expect(getEvolutionStage(0, 0, yearsAgo(0.1), daysAgo(1))).toBe('egg')
  })

  it('should return egg for 2 commits', () => {
    expect(getEvolutionStage(2, 0, yearsAgo(0.1), daysAgo(1))).toBe('egg')
  })
})
