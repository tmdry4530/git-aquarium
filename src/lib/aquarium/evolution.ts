import type { EvolutionStage } from '@/types/fish'

function daysBetween(a: Date, b: Date): number {
  return Math.floor((b.getTime() - a.getTime()) / 86400000)
}

function yearsBetween(a: Date, b: Date): number {
  return (b.getTime() - a.getTime()) / (365.25 * 86400000)
}

export function getEvolutionStage(
  totalCommits: number,
  stars: number,
  createdAt: string,
  lastCommitAt: string,
): EvolutionStage {
  const now = new Date()
  const daysSinceLastCommit = daysBetween(new Date(lastCommitAt), now)
  const accountAgeYears = yearsBetween(new Date(createdAt), now)

  if (daysSinceLastCommit >= 180) return 'fossil'
  if (stars >= 1000) return 'legendary'
  if (totalCommits >= 200 && accountAgeYears >= 1) return 'elder'
  if (totalCommits >= 51) return 'adult'
  if (totalCommits >= 11) return 'juvenile'
  if (totalCommits >= 3) return 'fry'
  return 'egg'
}
