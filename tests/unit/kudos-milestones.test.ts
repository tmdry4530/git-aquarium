import { describe, it, expect } from 'vitest'
import {
  KUDOS_MILESTONES,
  getUnlockedMilestones,
  getNextMilestone,
  getMilestoneProgress,
  checkNewMilestone,
} from '@/lib/gamification/kudos-milestones'

describe('kudos-milestones', () => {
  it('should have 5 milestones defined', () => {
    expect(KUDOS_MILESTONES).toHaveLength(5)
  })

  it('should be sorted by threshold ascending', () => {
    for (let i = 1; i < KUDOS_MILESTONES.length; i++) {
      expect(KUDOS_MILESTONES[i]!.threshold).toBeGreaterThan(
        KUDOS_MILESTONES[i - 1]!.threshold,
      )
    }
  })

  describe('getUnlockedMilestones', () => {
    it('should return empty for 0 kudos', () => {
      expect(getUnlockedMilestones(0)).toHaveLength(0)
    })

    it('should return first milestone at 10 kudos', () => {
      const result = getUnlockedMilestones(10)
      expect(result).toHaveLength(1)
      expect(result[0]!.rewardId).toBe('shell_set')
    })

    it('should return 3 milestones at 100 kudos', () => {
      expect(getUnlockedMilestones(100)).toHaveLength(3)
    })

    it('should return all milestones at 1000 kudos', () => {
      expect(getUnlockedMilestones(1000)).toHaveLength(5)
    })
  })

  describe('getNextMilestone', () => {
    it('should return first milestone for 0 kudos', () => {
      expect(getNextMilestone(0)?.threshold).toBe(10)
    })

    it('should return second milestone for 10 kudos', () => {
      expect(getNextMilestone(10)?.threshold).toBe(50)
    })

    it('should return null when all milestones reached', () => {
      expect(getNextMilestone(1000)).toBeNull()
    })
  })

  describe('getMilestoneProgress', () => {
    it('should return 0% at 0 kudos', () => {
      const result = getMilestoneProgress(0)
      expect(result.current).toBeNull()
      expect(result.next?.threshold).toBe(10)
      expect(result.progressPercent).toBe(0)
    })

    it('should return 50% at 5 kudos (0→10 range)', () => {
      const result = getMilestoneProgress(5)
      expect(result.progressPercent).toBe(50)
    })

    it('should return 100% when all milestones reached', () => {
      const result = getMilestoneProgress(1500)
      expect(result.progressPercent).toBe(100)
      expect(result.next).toBeNull()
    })
  })

  describe('checkNewMilestone', () => {
    it('should detect crossing threshold', () => {
      const result = checkNewMilestone(9, 10)
      expect(result?.threshold).toBe(10)
    })

    it('should return null when no threshold crossed', () => {
      expect(checkNewMilestone(5, 8)).toBeNull()
    })

    it('should return first crossed threshold when skipping', () => {
      const result = checkNewMilestone(0, 55)
      expect(result).not.toBeNull()
      expect(result!.threshold).toBe(10) // first crossed
    })
  })
})
