import { describe, it, expect } from 'vitest'
import { createMergeOcean } from '@/lib/aquarium/merge'
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

function makeAquarium(username: string, fish: FishData[]): AquariumData {
  return {
    user: {
      username,
      displayName: username,
      avatarUrl: `https://github.com/${username}.png`,
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
      totalStars: fish.reduce((sum, f) => sum + f.stars, 0),
      languageDistribution: {},
      topLanguage: null,
      largestFish: null,
    },
    generatedAt: new Date().toISOString(),
  }
}

describe('Merge Ocean', () => {
  it('should merge two aquariums', () => {
    const aq1 = makeAquarium('user1', [makeFish({ id: 'f1', stars: 100 })])
    const aq2 = makeAquarium('user2', [
      makeFish({ id: 'f2', stars: 50, species: 'manta' }),
    ])

    const result = createMergeOcean(
      {
        usernames: ['user1', 'user2'],
        layout: 'merged',
        interactionEnabled: true,
      },
      [aq1, aq2],
    )

    expect(result.mergedFish).toHaveLength(2)
    expect(result.totalStats.fishCount).toBe(2)
    expect(result.totalStats.totalStars).toBe(150)
    expect(result.totalStats.uniqueSpecies).toBe(2)
  })

  it('should assign owner info to merged fish', () => {
    const aq1 = makeAquarium('alice', [makeFish({ id: 'f1' })])
    const aq2 = makeAquarium('bob', [makeFish({ id: 'f2' })])

    const result = createMergeOcean(
      {
        usernames: ['alice', 'bob'],
        layout: 'merged',
        interactionEnabled: true,
      },
      [aq1, aq2],
    )

    expect(result.mergedFish[0]?.ownerId).toBe('alice')
    expect(result.mergedFish[0]?.ownerIndex).toBe(0)
    expect(result.mergedFish[1]?.ownerId).toBe('bob')
    expect(result.mergedFish[1]?.ownerIndex).toBe(1)
  })

  it('should set zone offsets for zones layout', () => {
    const aq1 = makeAquarium('user1', [makeFish({ id: 'f1' })])
    const aq2 = makeAquarium('user2', [makeFish({ id: 'f2' })])

    const result = createMergeOcean(
      {
        usernames: ['user1', 'user2'],
        layout: 'zones',
        interactionEnabled: true,
      },
      [aq1, aq2],
    )

    expect(result.mergedFish[0]?.zoneOffset.x).not.toBe(0)
    expect(result.mergedFish[1]?.zoneOffset.x).not.toBe(0)
  })

  it('should set zero offsets for merged layout', () => {
    const aq1 = makeAquarium('user1', [makeFish({ id: 'f1' })])
    const aq2 = makeAquarium('user2', [makeFish({ id: 'f2' })])

    const result = createMergeOcean(
      {
        usernames: ['user1', 'user2'],
        layout: 'merged',
        interactionEnabled: true,
      },
      [aq1, aq2],
    )

    expect(result.mergedFish[0]?.zoneOffset).toEqual({ x: 0, z: 0 })
    expect(result.mergedFish[1]?.zoneOffset).toEqual({ x: 0, z: 0 })
  })

  it('should throw for less than 2 users', () => {
    const aq1 = makeAquarium('user1', [makeFish()])

    expect(() =>
      createMergeOcean(
        { usernames: ['user1'], layout: 'merged', interactionEnabled: true },
        [aq1],
      ),
    ).toThrow('Merge ocean requires 2-5 users')
  })

  it('should throw for more than 5 users', () => {
    const aquariums = Array.from({ length: 6 }, (_, i) =>
      makeAquarium(`user${i}`, [makeFish({ id: `f${i}` })]),
    )

    expect(() =>
      createMergeOcean(
        {
          usernames: aquariums.map((a) => a.user.username),
          layout: 'merged',
          interactionEnabled: true,
        },
        aquariums,
      ),
    ).toThrow('Merge ocean requires 2-5 users')
  })
})
