import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import {
  QUESTS,
  getQuestsByType,
  getActiveQuests,
  getQuestById,
  updateQuestProgress,
  initializeUserQuests,
  shouldResetQuest,
  resetQuest,
} from '@/lib/gamification/quests'
import type { UserQuest } from '@/types/gamification'

const NOW = new Date('2026-03-14T12:00:00Z')

describe('quests', () => {
  beforeEach(() => {
    vi.useFakeTimers()
    vi.setSystemTime(NOW)
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('should have quests defined', () => {
    expect(QUESTS.length).toBeGreaterThan(0)
  })

  it('should have unique quest IDs', () => {
    const ids = QUESTS.map((q) => q.id)
    expect(new Set(ids).size).toBe(ids.length)
  })

  describe('getQuestsByType', () => {
    it('should return daily quests', () => {
      const daily = getQuestsByType('daily')
      expect(daily.length).toBeGreaterThan(0)
      expect(daily.every((q) => q.type === 'daily')).toBe(true)
    })

    it('should return weekly quests', () => {
      const weekly = getQuestsByType('weekly')
      expect(weekly.length).toBeGreaterThan(0)
      expect(weekly.every((q) => q.type === 'weekly')).toBe(true)
    })

    it('should return challenge quests', () => {
      const challenge = getQuestsByType('challenge')
      expect(challenge.length).toBeGreaterThan(0)
      expect(challenge.every((q) => q.type === 'challenge')).toBe(true)
    })
  })

  describe('getActiveQuests', () => {
    it('should return only active quests', () => {
      const active = getActiveQuests()
      expect(active.every((q) => q.isActive)).toBe(true)
    })
  })

  describe('getQuestById', () => {
    it('should return quest by id', () => {
      expect(getQuestById('daily_commit_3')?.nameEn).toBe('Daily Commits')
    })

    it('should return undefined for unknown id', () => {
      expect(getQuestById('nonexistent')).toBeUndefined()
    })
  })

  describe('updateQuestProgress', () => {
    it('should increment progress for matching condition', () => {
      const userQuests: UserQuest[] = [
        {
          questId: 'daily_commit_3',
          progress: 1,
          target: 3,
          completedAt: null,
          resetAt: NOW.toISOString(),
        },
      ]
      const { updated } = updateQuestProgress(userQuests, 'commit_count', 1)
      expect(updated[0]!.progress).toBe(2)
    })

    it('should mark quest completed when target reached', () => {
      const userQuests: UserQuest[] = [
        {
          questId: 'daily_commit_3',
          progress: 2,
          target: 3,
          completedAt: null,
          resetAt: NOW.toISOString(),
        },
      ]
      const { updated, completed } = updateQuestProgress(
        userQuests,
        'commit_count',
        1,
      )
      expect(updated[0]!.progress).toBe(3)
      expect(completed).toHaveLength(1)
      expect(completed[0]!.completedAt).not.toBeNull()
    })

    it('should not exceed target', () => {
      const userQuests: UserQuest[] = [
        {
          questId: 'daily_commit_3',
          progress: 2,
          target: 3,
          completedAt: null,
          resetAt: NOW.toISOString(),
        },
      ]
      const { updated } = updateQuestProgress(userQuests, 'commit_count', 5)
      expect(updated[0]!.progress).toBe(3)
    })

    it('should skip already completed quests', () => {
      const userQuests: UserQuest[] = [
        {
          questId: 'daily_commit_3',
          progress: 3,
          target: 3,
          completedAt: NOW.toISOString(),
          resetAt: NOW.toISOString(),
        },
      ]
      const { updated } = updateQuestProgress(userQuests, 'commit_count', 1)
      expect(updated).toHaveLength(0)
    })

    it('should not update quests with non-matching condition', () => {
      const userQuests: UserQuest[] = [
        {
          questId: 'daily_visit_1',
          progress: 0,
          target: 1,
          completedAt: null,
          resetAt: NOW.toISOString(),
        },
      ]
      const { updated } = updateQuestProgress(userQuests, 'commit_count', 1)
      expect(updated).toHaveLength(0)
    })
  })

  describe('initializeUserQuests', () => {
    it('should create user quests for all active quests', () => {
      const userQuests = initializeUserQuests()
      const activeCount = getActiveQuests().length
      expect(userQuests).toHaveLength(activeCount)
      expect(userQuests.every((q) => q.progress === 0)).toBe(true)
    })
  })

  describe('shouldResetQuest', () => {
    it('should reset daily quest from previous day', () => {
      const quest = QUESTS.find((q) => q.id === 'daily_commit_3')!
      const uq: UserQuest = {
        questId: 'daily_commit_3',
        progress: 2,
        target: 3,
        completedAt: null,
        resetAt: new Date('2026-03-13T12:00:00Z').toISOString(),
      }
      expect(shouldResetQuest(quest, uq, NOW)).toBe(true)
    })

    it('should not reset daily quest from same day', () => {
      const quest = QUESTS.find((q) => q.id === 'daily_commit_3')!
      const uq: UserQuest = {
        questId: 'daily_commit_3',
        progress: 2,
        target: 3,
        completedAt: null,
        resetAt: NOW.toISOString(),
      }
      expect(shouldResetQuest(quest, uq, NOW)).toBe(false)
    })

    it('should reset weekly quest from previous week', () => {
      const quest = QUESTS.find((q) => q.id === 'weekly_new_repo')!
      const uq: UserQuest = {
        questId: 'weekly_new_repo',
        progress: 0,
        target: 1,
        completedAt: null,
        resetAt: new Date('2026-03-02T12:00:00Z').toISOString(), // previous week
      }
      expect(shouldResetQuest(quest, uq, NOW)).toBe(true)
    })

    it('should not reset challenge quest', () => {
      const quest = QUESTS.find((q) => q.id === 'challenge_manta_ray')!
      const uq: UserQuest = {
        questId: 'challenge_manta_ray',
        progress: 0,
        target: 1,
        completedAt: null,
        resetAt: new Date('2026-01-01T00:00:00Z').toISOString(),
      }
      expect(shouldResetQuest(quest, uq, NOW)).toBe(false)
    })
  })

  describe('resetQuest', () => {
    it('should reset progress and completedAt', () => {
      const uq: UserQuest = {
        questId: 'daily_commit_3',
        progress: 3,
        target: 3,
        completedAt: '2026-03-13T12:00:00Z',
        resetAt: '2026-03-13T00:00:00Z',
      }
      const result = resetQuest(uq)
      expect(result.progress).toBe(0)
      expect(result.completedAt).toBeNull()
      expect(result.resetAt).not.toBeNull()
    })
  })
})
