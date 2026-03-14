import type { AquariumData } from '@/types/aquarium'
import type {
  MergeOceanConfig,
  MergeOceanData,
  MergedFishData,
} from '@/types/social'

const MAX_MERGE_USERS = 5
const MIN_MERGE_USERS = 2

export function createMergeOcean(
  config: MergeOceanConfig,
  aquariums: AquariumData[],
): MergeOceanData {
  if (
    aquariums.length < MIN_MERGE_USERS ||
    aquariums.length > MAX_MERGE_USERS
  ) {
    throw new Error(
      `Merge ocean requires ${MIN_MERGE_USERS}-${MAX_MERGE_USERS} users`,
    )
  }

  const mergedFish: MergedFishData[] = aquariums.flatMap((aq, index) =>
    aq.fish.map((fish) => ({
      ...fish,
      ownerId: aq.user.username,
      ownerIndex: index,
      zoneOffset:
        config.layout === 'zones'
          ? { x: (index - (aquariums.length - 1) / 2) * 20, z: 0 }
          : { x: 0, z: 0 },
    })),
  )

  const allSpecies = new Set(mergedFish.map((f) => f.species))

  return {
    config,
    aquariums,
    mergedFish,
    totalStats: {
      fishCount: mergedFish.length,
      languageCount: allSpecies.size,
      totalStars: mergedFish.reduce((sum, f) => sum + f.stars, 0),
      uniqueSpecies: allSpecies.size,
    },
  }
}
