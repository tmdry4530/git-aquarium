import { describe, it, expect } from 'vitest'
import {
  generateCodexForUser,
  getCodexStats,
  generateAllEntries,
  ALL_SPECIES,
  EVOLUTION_STAGES,
  LEGENDARY_TYPES,
} from '@/lib/codex/codex'

describe('Codex System', () => {
  describe('generateAllEntries', () => {
    it('should generate entries for all species and evolution stages', () => {
      const entries = generateAllEntries()
      // 15 species × 6 stages (excluding legendary) + 5 legendary = 95
      const expectedCount =
        ALL_SPECIES.length * (EVOLUTION_STAGES.length - 1) +
        LEGENDARY_TYPES.length
      expect(entries.length).toBe(expectedCount)
    })

    it('should have unique IDs for all entries', () => {
      const entries = generateAllEntries()
      const ids = new Set(entries.map((e) => e.id))
      expect(ids.size).toBe(entries.length)
    })

    it('should mark all entries as undiscovered initially', () => {
      const entries = generateAllEntries()
      expect(entries.every((e) => e.status === 'undiscovered')).toBe(true)
    })

    it('should have legendary rarity for legendary entries', () => {
      const entries = generateAllEntries()
      const legendaryEntries = entries.filter((e) => e.legendaryType !== null)
      expect(legendaryEntries.length).toBe(LEGENDARY_TYPES.length)
      expect(legendaryEntries.every((e) => e.rarity === 'legendary')).toBe(true)
    })
  })

  describe('generateCodexForUser', () => {
    it('should mark owned fish as owned', () => {
      const codex = generateCodexForUser('testuser', [
        { species: 'angelfish', evolutionStage: 'adult' },
        { species: 'shark', evolutionStage: 'elder' },
      ])

      const angelfishAdult = codex.entries.find(
        (e) => e.id === 'angelfish_adult',
      )
      expect(angelfishAdult?.status).toBe('owned')

      const sharkElder = codex.entries.find((e) => e.id === 'shark_elder')
      expect(sharkElder?.status).toBe('owned')
    })

    it('should leave unowned fish as undiscovered', () => {
      const codex = generateCodexForUser('testuser', [
        { species: 'angelfish', evolutionStage: 'adult' },
      ])

      const turtleJuvenile = codex.entries.find(
        (e) => e.id === 'turtle_juvenile',
      )
      expect(turtleJuvenile?.status).toBe('undiscovered')
    })

    it('should calculate correct completion percentage', () => {
      const allEntries = generateAllEntries()
      const codex = generateCodexForUser('testuser', [
        { species: 'angelfish', evolutionStage: 'adult' },
      ])

      expect(codex.ownedCount).toBe(1)
      expect(codex.completionPercent).toBe(
        Math.round((1 / allEntries.length) * 100),
      )
    })

    it('should handle empty fish list', () => {
      const codex = generateCodexForUser('testuser', [])
      expect(codex.ownedCount).toBe(0)
      expect(codex.completionPercent).toBe(0)
    })
  })

  describe('getCodexStats', () => {
    it('should return correct counts', () => {
      const codex = generateCodexForUser('testuser', [
        { species: 'angelfish', evolutionStage: 'adult' },
        { species: 'manta', evolutionStage: 'fry' },
        { species: 'shark', evolutionStage: 'elder' },
      ])

      const stats = getCodexStats(codex)
      expect(stats.owned).toBe(3)
      expect(stats.undiscovered).toBe(stats.total - 3)
      expect(stats.total).toBeGreaterThan(0)
    })
  })
})
