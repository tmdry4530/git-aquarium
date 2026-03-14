import type { GitHubRepo, GitHubUser } from '@/types/github'
import type { FishData } from '@/types/fish'
import type {
  AquariumData,
  AquariumUser,
  EnvironmentData,
  AquariumStats,
} from '@/types/aquarium'
import {
  calculateFishSize,
  calculateSwimSpeed,
  SPECIES_CONFIGS,
} from '@/constants/species-map'
import { getEvolutionStage } from './evolution'
import { getSpeciesForLanguage, getSpeciesColor } from './species'

function countByLanguage(fish: FishData[]): Record<string, number> {
  const dist: Record<string, number> = {}
  for (const f of fish) {
    if (f.language) dist[f.language] = (dist[f.language] ?? 0) + 1
  }
  return dist
}

function getTopLanguage(fish: FishData[]): string | null {
  const dist = countByLanguage(fish)
  return Object.entries(dist).sort(([, a], [, b]) => b - a)[0]?.[0] ?? null
}

function getCurrentStreak(
  weeks: GitHubUser['contributionCalendar']['weeks'],
): number {
  let streak = 0
  const days = weeks.flatMap((w) => w.contributionDays).reverse()
  for (const day of days) {
    if (day.contributionCount > 0) streak++
    else break
  }
  return streak
}

export function mapRepoToFish(repo: GitHubRepo): FishData {
  const species = getSpeciesForLanguage(repo.language)
  const config = SPECIES_CONFIGS[species]
  const evolutionStage = getEvolutionStage(
    repo.totalCommits,
    repo.stars,
    repo.createdAt,
    repo.lastPushedAt,
  )

  return {
    id: `fish-${repo.name}`,
    repoName: repo.name,
    repoUrl: repo.url,
    description: repo.description,
    species,
    evolutionStage,
    color: getSpeciesColor(species),
    size: calculateFishSize(species, repo.stars),
    swimSpeed: calculateSwimSpeed(0),
    swimPattern: config.swimPattern,
    stars: repo.stars,
    forks: repo.forks,
    openIssues: repo.openIssues,
    hasReadme: repo.hasReadme,
    hasLicense: !!repo.license,
    language: repo.language,
    lastCommitAt: repo.lastPushedAt,
    totalCommits: repo.totalCommits,
    commitsLast30Days: 0,
    createdAt: repo.createdAt,
  }
}

export function mapUserToEnvironment(user: GitHubUser): EnvironmentData {
  const totalContributions = user.contributionCalendar.totalContributions
  const accountAgeMs = Date.now() - new Date(user.createdAt).getTime()
  const accountAgeYears = accountAgeMs / (365.25 * 86400000)

  const streak = getCurrentStreak(user.contributionCalendar.weeks)

  return {
    tankSize:
      totalContributions > 5000
        ? 'vast'
        : totalContributions > 1000
          ? 'large'
          : totalContributions > 200
            ? 'medium'
            : 'small',
    brightness: Math.min(user.followers / 1000, 1.0),
    terrainHeights: user.contributionCalendar.weeks.map((w) =>
      w.contributionDays.reduce((sum, d) => sum + d.contributionCount, 0),
    ),
    currentStrength: Math.min(streak / 30, 1.0),
    timeOfDay: 'day',
    depth:
      accountAgeYears >= 5
        ? 'abyss'
        : accountAgeYears >= 3
          ? 'deep'
          : accountAgeYears >= 1
            ? 'mid'
            : 'shallow',
  }
}

export function mapUserToAquarium(
  user: GitHubUser,
  repos: GitHubRepo[],
): AquariumData {
  return mapToAquariumData(user, repos)
}

export function mapToAquariumData(
  user: GitHubUser,
  repos: GitHubRepo[],
): AquariumData {
  const fish = repos.map(mapRepoToFish)
  const environment = mapUserToEnvironment(user)

  const aquariumUser: AquariumUser = {
    username: user.login,
    displayName: user.name,
    avatarUrl: user.avatarUrl,
    bio: user.bio,
    followers: user.followers,
    accountAge: Math.floor(
      (Date.now() - new Date(user.createdAt).getTime()) / (365.25 * 86400000),
    ),
  }

  const stats: AquariumStats = {
    totalFish: fish.length,
    aliveFish: fish.filter((f) => f.evolutionStage !== 'fossil').length,
    fossilFish: fish.filter((f) => f.evolutionStage === 'fossil').length,
    totalStars: fish.reduce((sum, f) => sum + f.stars, 0),
    languageDistribution: countByLanguage(fish),
    topLanguage: getTopLanguage(fish),
    largestFish:
      fish.reduce<FishData | null>(
        (max, f) => (f.size > (max?.size ?? 0) ? f : max),
        null,
      )?.repoName ?? null,
  }

  return {
    user: aquariumUser,
    fish,
    environment,
    stats,
    generatedAt: new Date().toISOString(),
  }
}
