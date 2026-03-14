import { describe, it, expect } from 'vitest'
import {
  ACHIEVEMENTS,
  evaluateCondition,
  checkAchievements,
  buildAchievementProgress,
  getAchievementById,
} from '@/lib/gamification/achievements'
import type { AquariumData } from '@/types/aquarium'
import type { UserStats, UserAchievement } from '@/types/gamification'
import type { FishData } from '@/types/fish'

function makeFish(overrides: Partial<FishData> = {}): FishData {
  return {
    id: 'test-fish',
    repoName: 'test-repo',
    repoUrl: 'https://github.com/test/repo',
    description: null,
    species: 'angelfish',
    evolutionStage: 'adult',
    color: '#F7DF1E',
    size: 1.0,
    swimSpeed: 1.0,
    swimPattern: 'standard',
    stars: 0,
    forks: 0,
    openIssues: 0,
    hasReadme: true,
    hasLicense: true,
    language: 'JavaScript',
    lastCommitAt: '2024-01-01T00:00:00Z',
    totalCommits: 100,
    commitsLast30Days: 10,
    createdAt: '2023-01-01T00:00:00Z',
    ...overrides,
  }
}

function makeAquariumData(fish: FishData[] = []): AquariumData {
  return {
    user: {
      username: 'testuser',
      displayName: 'Test User',
      avatarUrl: 'https://example.com/avatar.png',
      bio: null,
      followers: 10,
      accountAge: 2,
    },
    fish,
    environment: {
      tankSize: 'medium',
      brightness: 0.5,
      terrainHeights: [],
      currentStrength: 0.5,
      timeOfDay: 'day',
      depth: 'mid',
    },
    stats: {
      totalFish: fish.length,
      aliveFish: fish.length,
      fossilFish: 0,
      totalStars: 0,
      languageDistribution: {},
      topLanguage: null,
      largestFish: null,
    },
    generatedAt: '2024-01-01T00:00:00Z',
  }
}

function makeStats(overrides: Partial<UserStats> = {}): UserStats {
  return {
    aquariumsCreated: 0,
    currentStreak: 0,
    totalVisits: 0,
    uniqueAquariumsVisited: 0,
    codexCompletion: 0,
    achievementCount: 0,
    ...overrides,
  }
}

describe('achievements', () => {
  it('should have exactly 10 achievements defined', () => {
    expect(ACHIEVEMENTS).toHaveLength(10)
  })

  it('should have unique IDs', () => {
    const ids = ACHIEVEMENTS.map((a) => a.id)
    expect(new Set(ids).size).toBe(ids.length)
  })

  describe('evaluateCondition', () => {
    // aquarium_created
    it('aquarium_created: 0 → false', () => {
      const data = makeAquariumData()
      const stats = makeStats({ aquariumsCreated: 0 })
      expect(evaluateCondition('aquarium_created', 1, data, stats)).toBe(false)
    })

    it('aquarium_created: 1 → true', () => {
      const data = makeAquariumData()
      const stats = makeStats({ aquariumsCreated: 1 })
      expect(evaluateCondition('aquarium_created', 1, data, stats)).toBe(true)
    })

    // language_count
    it('language_count: 4 languages → false (need 5)', () => {
      const fish = ['JavaScript', 'Python', 'Go', 'Rust'].map((lang, i) =>
        makeFish({ id: `fish-${i}`, language: lang }),
      )
      const data = makeAquariumData(fish)
      const stats = makeStats()
      expect(evaluateCondition('language_count', 5, data, stats)).toBe(false)
    })

    it('language_count: 5 languages → true', () => {
      const fish = ['JavaScript', 'Python', 'Go', 'Rust', 'Java'].map(
        (lang, i) => makeFish({ id: `fish-${i}`, language: lang }),
      )
      const data = makeAquariumData(fish)
      const stats = makeStats()
      expect(evaluateCondition('language_count', 5, data, stats)).toBe(true)
    })

    it('language_count: ignores null languages', () => {
      const fish = [
        makeFish({ id: 'f1', language: 'JavaScript' }),
        makeFish({ id: 'f2', language: null }),
        makeFish({ id: 'f3', language: 'Python' }),
      ]
      const data = makeAquariumData(fish)
      const stats = makeStats()
      expect(evaluateCondition('language_count', 3, data, stats)).toBe(false)
    })

    // fossil_count
    it('fossil_count: 9 fossils → false (need 10)', () => {
      const fish = Array.from({ length: 9 }, (_, i) =>
        makeFish({ id: `fossil-${i}`, evolutionStage: 'fossil' }),
      )
      const data = makeAquariumData(fish)
      const stats = makeStats()
      expect(evaluateCondition('fossil_count', 10, data, stats)).toBe(false)
    })

    it('fossil_count: 10 fossils → true', () => {
      const fish = Array.from({ length: 10 }, (_, i) =>
        makeFish({ id: `fossil-${i}`, evolutionStage: 'fossil' }),
      )
      const data = makeAquariumData(fish)
      const stats = makeStats()
      expect(evaluateCondition('fossil_count', 10, data, stats)).toBe(true)
    })

    // total_stars
    it('total_stars: 99 → false (need 100)', () => {
      const fish = [
        makeFish({ id: 'f1', stars: 50 }),
        makeFish({ id: 'f2', stars: 49 }),
      ]
      const data = makeAquariumData(fish)
      const stats = makeStats()
      expect(evaluateCondition('total_stars', 100, data, stats)).toBe(false)
    })

    it('total_stars: 100 → true', () => {
      const fish = [
        makeFish({ id: 'f1', stars: 50 }),
        makeFish({ id: 'f2', stars: 50 }),
      ]
      const data = makeAquariumData(fish)
      const stats = makeStats()
      expect(evaluateCondition('total_stars', 100, data, stats)).toBe(true)
    })

    // commit_streak
    it('commit_streak: 29 → false (need 30)', () => {
      const data = makeAquariumData()
      const stats = makeStats({ currentStreak: 29 })
      expect(evaluateCondition('commit_streak', 30, data, stats)).toBe(false)
    })

    it('commit_streak: 30 → true', () => {
      const data = makeAquariumData()
      const stats = makeStats({ currentStreak: 30 })
      expect(evaluateCondition('commit_streak', 30, data, stats)).toBe(true)
    })

    // visit_count
    it('visit_count: 49 → false (need 50)', () => {
      const data = makeAquariumData()
      const stats = makeStats({ totalVisits: 49 })
      expect(evaluateCondition('visit_count', 50, data, stats)).toBe(false)
    })

    it('visit_count: 50 → true', () => {
      const data = makeAquariumData()
      const stats = makeStats({ totalVisits: 50 })
      expect(evaluateCondition('visit_count', 50, data, stats)).toBe(true)
    })

    // social_visits
    it('social_visits: 9 → false (need 10)', () => {
      const data = makeAquariumData()
      const stats = makeStats({ uniqueAquariumsVisited: 9 })
      expect(evaluateCondition('social_visits', 10, data, stats)).toBe(false)
    })

    it('social_visits: 10 → true', () => {
      const data = makeAquariumData()
      const stats = makeStats({ uniqueAquariumsVisited: 10 })
      expect(evaluateCondition('social_visits', 10, data, stats)).toBe(true)
    })

    // legendary_count
    it('legendary_count: 0 legendary → false', () => {
      const fish = [makeFish({ id: 'f1', evolutionStage: 'adult' })]
      const data = makeAquariumData(fish)
      const stats = makeStats()
      expect(evaluateCondition('legendary_count', 1, data, stats)).toBe(false)
    })

    it('legendary_count: 1 legendary → true', () => {
      const fish = [makeFish({ id: 'f1', evolutionStage: 'legendary' })]
      const data = makeAquariumData(fish)
      const stats = makeStats()
      expect(evaluateCondition('legendary_count', 1, data, stats)).toBe(true)
    })

    // codex_percent
    it('codex_percent: 79% → false (need 80)', () => {
      const data = makeAquariumData()
      const stats = makeStats({ codexCompletion: 79 })
      expect(evaluateCondition('codex_percent', 80, data, stats)).toBe(false)
    })

    it('codex_percent: 80% → true', () => {
      const data = makeAquariumData()
      const stats = makeStats({ codexCompletion: 80 })
      expect(evaluateCondition('codex_percent', 80, data, stats)).toBe(true)
    })

    // all_achievements
    it('all_achievements: 8 → false (need 9)', () => {
      const data = makeAquariumData()
      const stats = makeStats({ achievementCount: 8 })
      expect(evaluateCondition('all_achievements', 9, data, stats)).toBe(false)
    })

    it('all_achievements: 9 → true', () => {
      const data = makeAquariumData()
      const stats = makeStats({ achievementCount: 9 })
      expect(evaluateCondition('all_achievements', 9, data, stats)).toBe(true)
    })
  })

  describe('checkAchievements', () => {
    it('should return newly unlocked achievements', () => {
      const data = makeAquariumData()
      const stats = makeStats({ aquariumsCreated: 1 })
      const result = checkAchievements(data, stats, [])
      expect(result.map((a) => a.id)).toContain('first_splash')
    })

    it('should not return already unlocked achievements', () => {
      const data = makeAquariumData()
      const stats = makeStats({ aquariumsCreated: 1 })
      const alreadyUnlocked: UserAchievement[] = [
        { achievementId: 'first_splash', unlockedAt: '2024-01-01T00:00:00Z' },
      ]
      const result = checkAchievements(data, stats, alreadyUnlocked)
      expect(result.map((a) => a.id)).not.toContain('first_splash')
    })

    it('should return multiple achievements when conditions met', () => {
      const fish = ['JavaScript', 'Python', 'Go', 'Rust', 'Java'].map(
        (lang, i) => makeFish({ id: `fish-${i}`, language: lang, stars: 30 }),
      )
      const data = makeAquariumData(fish)
      const stats = makeStats({ aquariumsCreated: 1 })
      const result = checkAchievements(data, stats, [])
      expect(result.length).toBeGreaterThanOrEqual(2) // first_splash + diverse_ocean + total_stars
    })
  })

  describe('buildAchievementProgress', () => {
    it('should build progress for all achievements', () => {
      const data = makeAquariumData()
      const stats = makeStats({ aquariumsCreated: 1 })
      const result = buildAchievementProgress(data, stats, [])
      expect(result.totalCount).toBe(10)
      expect(result.progress).toHaveLength(10)
    })

    it('should show correct current values', () => {
      const data = makeAquariumData()
      const stats = makeStats({ totalVisits: 25 })
      const result = buildAchievementProgress(data, stats, [])
      const deepDiver = result.progress.find(
        (p) => p.achievement.id === 'deep_diver',
      )
      expect(deepDiver?.currentValue).toBe(25)
    })
  })

  describe('getAchievementById', () => {
    it('should return achievement by id', () => {
      const result = getAchievementById('first_splash')
      expect(result?.nameEn).toBe('First Splash')
    })

    it('should return undefined for unknown id', () => {
      expect(getAchievementById('nonexistent')).toBeUndefined()
    })
  })
})
