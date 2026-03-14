import type { AquariumData } from '@/types/aquarium'
import type { FishData } from '@/types/fish'
import type { CompareStats } from '@/types/social'

export function calculateCompareStats(
  a: AquariumData,
  b: AquariumData,
): CompareStats {
  const getLanguages = (fish: FishData[]) =>
    new Set(fish.map((f) => f.species)).size

  const getLegendaryCount = (fish: FishData[]) =>
    fish.filter((f) => f.evolutionStage === 'legendary').length

  const getActiveRatio = (fish: FishData[]) => {
    const active = fish.filter((f) => f.evolutionStage !== 'fossil').length
    return fish.length > 0 ? active / fish.length : 0
  }

  const getOldestRepo = (fish: FishData[]) => {
    if (fish.length === 0) return 'N/A'
    const sorted = [...fish].sort(
      (x, y) =>
        new Date(x.createdAt).getTime() - new Date(y.createdAt).getTime(),
    )
    return sorted[0]?.repoName ?? 'N/A'
  }

  return {
    fishCount: [a.fish.length, b.fish.length],
    languageDiversity: [getLanguages(a.fish), getLanguages(b.fish)],
    totalStars: [
      a.fish.reduce((sum, f) => sum + f.stars, 0),
      b.fish.reduce((sum, f) => sum + f.stars, 0),
    ],
    legendaryCount: [getLegendaryCount(a.fish), getLegendaryCount(b.fish)],
    activeRatio: [getActiveRatio(a.fish), getActiveRatio(b.fish)],
    oldestRepo: [getOldestRepo(a.fish), getOldestRepo(b.fish)],
  }
}
