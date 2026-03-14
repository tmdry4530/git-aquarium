import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import {
  generateV2Catalog,
  generateV2CodexForUser,
  getV2CodexStats,
  CODEX_V2_TOTAL,
} from '@/lib/codex/codex-v2'

const NOW = new Date('2026-03-14T12:00:00Z')

describe('codex-v2', () => {
  beforeEach(() => {
    vi.useFakeTimers()
    vi.setSystemTime(NOW)
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  describe('generateV2Catalog', () => {
    it('should generate exactly 105 entries', () => {
      const catalog = generateV2Catalog()
      expect(catalog).toHaveLength(CODEX_V2_TOTAL)
    })

    it('should have 90 regular entries (15 species × 6 stages)', () => {
      const catalog = generateV2Catalog()
      const regular = catalog.filter(
        (e) => !e.isSecret && e.seasonId === null && e.rarity !== 'legendary',
      )
      expect(regular).toHaveLength(90)
    })

    it('should have 5 legendary entries', () => {
      const catalog = generateV2Catalog()
      const legendary = catalog.filter((e) => e.rarity === 'legendary')
      expect(legendary).toHaveLength(5)
    })

    it('should have 10 seasonal entries', () => {
      const catalog = generateV2Catalog()
      const seasonal = catalog.filter((e) => e.seasonId !== null)
      expect(seasonal).toHaveLength(10)
    })

    it('should have unique IDs', () => {
      const catalog = generateV2Catalog()
      const ids = catalog.map((e) => e.id)
      expect(new Set(ids).size).toBe(ids.length)
    })

    it('should include hacktoberfest_fish', () => {
      const catalog = generateV2Catalog()
      const hacktoberfest = catalog.find((e) => e.id === 'hacktoberfest_fish')
      expect(hacktoberfest).toBeDefined()
      expect(hacktoberfest?.rarity).toBe('mythic')
    })

    it('should include universe_fish', () => {
      const catalog = generateV2Catalog()
      const universe = catalog.find((e) => e.id === 'universe_fish')
      expect(universe).toBeDefined()
    })
  })

  describe('generateV2CodexForUser', () => {
    it('should return codex with all entries', () => {
      const codex = generateV2CodexForUser('testuser', [])
      expect(codex.totalEntries).toBe(CODEX_V2_TOTAL)
      expect(codex.ownedCount).toBe(0)
      expect(codex.completionPercent).toBe(0)
    })

    it('should mark owned fish correctly', () => {
      const codex = generateV2CodexForUser('testuser', [
        { species: 'angelfish', evolutionStage: 'adult' },
        { species: 'manta', evolutionStage: 'egg' },
      ])
      expect(codex.ownedCount).toBe(2)
      const owned = codex.entries.filter((e) => e.status === 'owned')
      expect(owned).toHaveLength(2)
    })

    it('should mark witnessed species correctly', () => {
      const codex = generateV2CodexForUser('testuser', [], ['shark_adult'])
      const witnessed = codex.entries.filter((e) => e.status === 'witnessed')
      expect(witnessed).toHaveLength(1)
    })

    it('should calculate completion percent correctly', () => {
      const stages = [
        'egg',
        'fry',
        'juvenile',
        'adult',
        'elder',
        'fossil',
      ] as const
      const fish = Array.from({ length: 21 }, (_, i) => ({
        species: 'angelfish',
        evolutionStage: stages[i % 6] as string,
      }))
      const codex = generateV2CodexForUser('testuser', fish)
      expect(codex.completionPercent).toBe(
        Math.round((codex.ownedCount / CODEX_V2_TOTAL) * 100),
      )
    })
  })

  describe('getV2CodexStats', () => {
    it('should return detailed stats', () => {
      const codex = generateV2CodexForUser('testuser', [
        { species: 'angelfish', evolutionStage: 'adult' },
      ])
      const stats = getV2CodexStats(codex)
      expect(stats.total).toBe(CODEX_V2_TOTAL)
      expect(stats.owned).toBe(1)
      expect(stats.regularTotal).toBe(90)
      expect(stats.legendaryTotal).toBe(5)
      expect(stats.seasonalTotal).toBe(10)
    })

    it('should count categories correctly with all types owned', () => {
      const fish = [
        { species: 'angelfish', evolutionStage: 'adult' },
        { species: 'leviathan', evolutionStage: 'legendary' },
      ]
      const codex = generateV2CodexForUser('testuser', fish)
      const stats = getV2CodexStats(codex)
      expect(stats.regularOwned).toBe(1)
      expect(stats.legendaryOwned).toBe(1)
    })
  })
})
