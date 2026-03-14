import { describe, it, expect } from 'vitest'
import { calculateCompareStats } from '@/lib/aquarium/compare'
import type { AquariumData } from '@/types/aquarium'
import type { FishData } from '@/types/fish'

function makeFish(overrides: Partial<FishData> = {}): FishData {
  return {
    id: 'fish-test',
    repoName: 'test-repo',
    repoUrl: 'https://github.com/test/test-repo',
    description: null,
    species: 'angelfish',
    evolutionStage: 'adult',
    color: '#ff0000',
    size: 1.0,
    swimSpeed: 1.0,
    swimPattern: 'standard',
    stars: 10,
    forks: 2,
    openIssues: 1,
    hasReadme: true,
    hasLicense: true,
    language: 'JavaScript',
    lastCommitAt: '2025-01-01T00:00:00Z',
    totalCommits: 100,
    commitsLast30Days: 5,
    createdAt: '2020-01-01T00:00:00Z',
    ...overrides,
  }
}

function makeAquarium(fish: FishData[]): AquariumData {
  return {
    user: {
      username: 'testuser',
      displayName: 'Test User',
      avatarUrl: 'https://example.com/avatar.png',
      bio: 'test bio',
      followers: 100,
      accountAge: 3,
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
      aliveFish: fish.filter((f) => f.evolutionStage !== 'fossil').length,
      fossilFish: fish.filter((f) => f.evolutionStage === 'fossil').length,
      totalStars: fish.reduce((sum, f) => sum + f.stars, 0),
      languageDistribution: {},
      topLanguage: null,
      largestFish: null,
    },
    generatedAt: new Date().toISOString(),
  }
}

describe('Compare', () => {
  describe('calculateCompareStats', () => {
    it('should calculate fish count comparison', () => {
      const a = makeAquarium([makeFish(), makeFish({ id: 'fish-2' })])
      const b = makeAquarium([makeFish()])

      const stats = calculateCompareStats(a, b)

      expect(stats.fishCount).toEqual([2, 1])
    })

    it('should calculate language diversity', () => {
      const a = makeAquarium([
        makeFish({ species: 'angelfish' }),
        makeFish({ id: 'fish-2', species: 'manta' }),
      ])
      const b = makeAquarium([makeFish({ species: 'angelfish' })])

      const stats = calculateCompareStats(a, b)

      expect(stats.languageDiversity).toEqual([2, 1])
    })

    it('should calculate total stars', () => {
      const a = makeAquarium([makeFish({ stars: 100 })])
      const b = makeAquarium([
        makeFish({ stars: 50 }),
        makeFish({ id: 'fish-2', stars: 75 }),
      ])

      const stats = calculateCompareStats(a, b)

      expect(stats.totalStars).toEqual([100, 125])
    })

    it('should calculate legendary count', () => {
      const a = makeAquarium([
        makeFish({ evolutionStage: 'legendary' }),
        makeFish({ id: 'fish-2', evolutionStage: 'adult' }),
      ])
      const b = makeAquarium([])

      const stats = calculateCompareStats(a, b)

      expect(stats.legendaryCount).toEqual([1, 0])
    })

    it('should calculate active ratio', () => {
      const a = makeAquarium([
        makeFish({ evolutionStage: 'adult' }),
        makeFish({ id: 'fish-2', evolutionStage: 'fossil' }),
      ])
      const b = makeAquarium([makeFish({ evolutionStage: 'adult' })])

      const stats = calculateCompareStats(a, b)

      expect(stats.activeRatio).toEqual([0.5, 1])
    })

    it('should handle empty aquariums', () => {
      const a = makeAquarium([])
      const b = makeAquarium([])

      const stats = calculateCompareStats(a, b)

      expect(stats.fishCount).toEqual([0, 0])
      expect(stats.activeRatio).toEqual([0, 0])
      expect(stats.oldestRepo).toEqual(['N/A', 'N/A'])
    })

    it('should find oldest repo', () => {
      const a = makeAquarium([
        makeFish({ createdAt: '2020-01-01T00:00:00Z', repoName: 'old-repo' }),
        makeFish({
          id: 'fish-2',
          createdAt: '2023-01-01T00:00:00Z',
          repoName: 'new-repo',
        }),
      ])
      const b = makeAquarium([
        makeFish({ createdAt: '2021-06-15T00:00:00Z', repoName: 'mid-repo' }),
      ])

      const stats = calculateCompareStats(a, b)

      expect(stats.oldestRepo).toEqual(['old-repo', 'mid-repo'])
    })
  })
})
