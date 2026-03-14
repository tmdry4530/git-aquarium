import { describe, it, expect } from 'vitest'
import {
  SEASONS,
  SPECIAL_EVENTS,
  getActiveSeason,
  isSeasonActive,
  isSpecialEventActive,
  checkHacktoberfestEligibility,
  getSeasonalSpeciesIds,
  getSeasonById,
  getSpecialEventById,
} from '@/lib/gamification/seasons'

describe('seasons', () => {
  it('should have 4 seasons defined', () => {
    expect(SEASONS).toHaveLength(4)
  })

  it('should have unique season IDs', () => {
    const ids = SEASONS.map((s) => s.id)
    expect(new Set(ids).size).toBe(ids.length)
  })

  describe('getActiveSeason', () => {
    it('should return spring season in March 2026', () => {
      const result = getActiveSeason(new Date('2026-03-15'))
      expect(result?.id).toBe('spring_2026')
      expect(result?.isActive).toBe(true)
    })

    it('should return summer season in July 2026', () => {
      const result = getActiveSeason(new Date('2026-07-15'))
      expect(result?.id).toBe('summer_2026')
    })

    it('should return null for dates outside season ranges', () => {
      // between winter end and next spring start
      const result = getActiveSeason(new Date('2027-03-15'))
      expect(result).toBeNull()
    })

    it('should return season on exact start date', () => {
      const result = getActiveSeason(new Date('2026-03-01'))
      expect(result?.id).toBe('spring_2026')
    })

    it('should return season on exact end date', () => {
      const result = getActiveSeason(new Date('2026-05-31'))
      expect(result?.id).toBe('spring_2026')
    })
  })

  describe('isSeasonActive', () => {
    it('should return true for date within season range', () => {
      const spring = SEASONS[0]!
      expect(isSeasonActive(spring, new Date('2026-04-01'))).toBe(true)
    })

    it('should return false for date outside season range', () => {
      const spring = SEASONS[0]!
      expect(isSeasonActive(spring, new Date('2026-06-01'))).toBe(false)
    })
  })

  describe('getSeasonById', () => {
    it('should return season by id', () => {
      expect(getSeasonById('spring_2026')?.nameEn).toBe('Spring Bloom')
    })

    it('should return undefined for unknown id', () => {
      expect(getSeasonById('nonexistent')).toBeUndefined()
    })
  })
})

describe('special events', () => {
  it('should have 2 special events defined', () => {
    expect(SPECIAL_EVENTS).toHaveLength(2)
  })

  describe('isSpecialEventActive', () => {
    it('should return true for Hacktoberfest in October 2026', () => {
      const event = SPECIAL_EVENTS[0]!
      expect(isSpecialEventActive(event, new Date('2026-10-15'))).toBe(true)
    })

    it('should return false for Hacktoberfest in November', () => {
      const event = SPECIAL_EVENTS[0]!
      expect(isSpecialEventActive(event, new Date('2026-11-01'))).toBe(false)
    })
  })

  describe('checkHacktoberfestEligibility', () => {
    it('should return false for 3 PRs', () => {
      expect(checkHacktoberfestEligibility(3)).toBe(false)
    })

    it('should return true for 4 PRs', () => {
      expect(checkHacktoberfestEligibility(4)).toBe(true)
    })

    it('should return true for 10 PRs', () => {
      expect(checkHacktoberfestEligibility(10)).toBe(true)
    })
  })

  describe('getSeasonalSpeciesIds', () => {
    it('should return spring species in March', () => {
      const ids = getSeasonalSpeciesIds(new Date('2026-03-15'))
      expect(ids).toContain('cherry_shrimp')
      expect(ids).toContain('sakura_jellyfish')
    })

    it('should return empty for dates outside seasons', () => {
      const ids = getSeasonalSpeciesIds(new Date('2027-03-15'))
      expect(ids).toHaveLength(0)
    })
  })

  describe('getSpecialEventById', () => {
    it('should return event by id', () => {
      expect(getSpecialEventById('hacktoberfest_2026')?.nameEn).toBe(
        'Hacktoberfest 2026',
      )
    })

    it('should return undefined for unknown id', () => {
      expect(getSpecialEventById('nonexistent')).toBeUndefined()
    })
  })
})
