import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { mapRepoToFish, mapToAquariumData } from '@/lib/aquarium/mapper'
import type { GitHubRepo, GitHubUser } from '@/types/github'

const NOW = new Date('2024-06-01T00:00:00Z')

function daysAgo(days: number): string {
  return new Date(NOW.getTime() - days * 86400000).toISOString()
}

function yearsAgo(years: number): string {
  return new Date(NOW.getTime() - years * 365.25 * 86400000).toISOString()
}

function makeRepo(overrides: Partial<GitHubRepo> = {}): GitHubRepo {
  return {
    name: 'my-repo',
    description: 'A test repo',
    url: 'https://github.com/user/my-repo',
    language: 'TypeScript',
    languageColor: '#3178C6',
    stars: 10,
    forks: 2,
    openIssues: 1,
    hasReadme: true,
    license: 'MIT',
    totalCommits: 20,
    lastPushedAt: daysAgo(10),
    createdAt: yearsAgo(1),
    ...overrides,
  }
}

function makeUser(overrides: Partial<GitHubUser> = {}): GitHubUser {
  return {
    login: 'testuser',
    name: 'Test User',
    avatarUrl: 'https://avatars.githubusercontent.com/u/1',
    bio: 'Developer',
    followers: 500,
    following: 100,
    createdAt: yearsAgo(3),
    contributionCalendar: {
      totalContributions: 1500,
      weeks: Array.from({ length: 52 }, () => ({
        contributionDays: Array.from({ length: 7 }, (_, i) => ({
          contributionCount: i % 2 === 0 ? 3 : 0,
          date: '2023-01-01',
        })),
      })),
    },
    ...overrides,
  }
}

describe('mapRepoToFish', () => {
  beforeEach(() => {
    vi.useFakeTimers()
    vi.setSystemTime(NOW)
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('should set id from repo name', () => {
    const fish = mapRepoToFish(makeRepo({ name: 'cool-repo' }))
    expect(fish.id).toBe('fish-cool-repo')
  })

  it('should map TypeScript to manta species', () => {
    const fish = mapRepoToFish(makeRepo({ language: 'TypeScript' }))
    expect(fish.species).toBe('manta')
  })

  it('should map null language to plankton species', () => {
    const fish = mapRepoToFish(makeRepo({ language: null }))
    expect(fish.species).toBe('plankton')
  })

  it('should set fossil for 180+ days inactive', () => {
    const fish = mapRepoToFish(makeRepo({ lastPushedAt: daysAgo(200) }))
    expect(fish.evolutionStage).toBe('fossil')
  })

  it('should set hasLicense true when license present', () => {
    const fish = mapRepoToFish(makeRepo({ license: 'MIT' }))
    expect(fish.hasLicense).toBe(true)
  })

  it('should set hasLicense false when license null', () => {
    const fish = mapRepoToFish(makeRepo({ license: null }))
    expect(fish.hasLicense).toBe(false)
  })

  it('should size increase with stars', () => {
    const smallFish = mapRepoToFish(makeRepo({ stars: 1 }))
    const largeFish = mapRepoToFish(makeRepo({ stars: 1000 }))
    expect(largeFish.size).toBeGreaterThan(smallFish.size)
  })
})

describe('mapToAquariumData', () => {
  beforeEach(() => {
    vi.useFakeTimers()
    vi.setSystemTime(NOW)
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('should set total fish count', () => {
    const user = makeUser()
    const repos = [
      makeRepo({ name: 'r1' }),
      makeRepo({ name: 'r2' }),
      makeRepo({ name: 'r3' }),
    ]
    const data = mapToAquariumData(user, repos)
    expect(data.stats.totalFish).toBe(3)
  })

  it('should count fossil fish correctly', () => {
    const user = makeUser()
    const repos = [
      makeRepo({ name: 'r1', lastPushedAt: daysAgo(200) }),
      makeRepo({ name: 'r2', lastPushedAt: daysAgo(10) }),
    ]
    const data = mapToAquariumData(user, repos)
    expect(data.stats.fossilFish).toBe(1)
    expect(data.stats.aliveFish).toBe(1)
  })

  it('should compute topLanguage', () => {
    const user = makeUser()
    const repos = [
      makeRepo({ name: 'r1', language: 'TypeScript' }),
      makeRepo({ name: 'r2', language: 'TypeScript' }),
      makeRepo({ name: 'r3', language: 'Python' }),
    ]
    const data = mapToAquariumData(user, repos)
    expect(data.stats.topLanguage).toBe('TypeScript')
  })

  it('should set tankSize based on contributions', () => {
    const user = makeUser({
      contributionCalendar: {
        totalContributions: 6000,
        weeks: [],
      },
    })
    const data = mapToAquariumData(user, [makeRepo()])
    expect(data.environment.tankSize).toBe('vast')
  })

  it('should include generatedAt timestamp', () => {
    const data = mapToAquariumData(makeUser(), [makeRepo()])
    expect(data.generatedAt).toBeDefined()
    expect(new Date(data.generatedAt).toISOString()).toBe(data.generatedAt)
  })
})
