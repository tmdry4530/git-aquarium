import type {
  FishSpecies,
  EvolutionStage,
  LegendaryFishType,
} from '@/types/fish'
import type { CodexEntry, CodexEntryStatus, UserCodex } from '@/types/codex'
import type { CodexV2Entry, CodexV2Rarity } from '@/types/gamification'

const ALL_SPECIES: FishSpecies[] = [
  'angelfish',
  'manta',
  'turtle',
  'pufferfish',
  'dolphin',
  'squid',
  'shark',
  'seahorse',
  'goldfish',
  'flyingfish',
  'jellyfish',
  'coral',
  'shell',
  'seaweed',
  'plankton',
]

const REGULAR_STAGES: EvolutionStage[] = [
  'egg',
  'fry',
  'juvenile',
  'adult',
  'elder',
  'fossil',
]

const LEGENDARY_TYPES: LegendaryFishType[] = [
  'leviathan',
  'phoenix_fish',
  'hydra',
  'kraken',
  'narwhal',
]

// Seasonal species (10 total)
const SEASONAL_SPECIES: CodexV2Entry[] = [
  {
    id: 'cherry_shrimp',
    species: 'cherry_shrimp',
    evolutionStage: 'adult',
    rarity: 'epic',
    isSecret: false,
    seasonId: 'spring_2026',
    nameEn: 'Cherry Blossom Shrimp',
    nameKo: '벚꽃 새우',
    descriptionEn:
      'A delicate shrimp with cherry blossom patterns. Spring seasonal.',
    descriptionKo: '벚꽃 무늬의 섬세한 새우. 봄 시즌 한정.',
  },
  {
    id: 'sakura_jellyfish',
    species: 'sakura_jellyfish',
    evolutionStage: 'adult',
    rarity: 'epic',
    isSecret: false,
    seasonId: 'spring_2026',
    nameEn: 'Sakura Jellyfish',
    nameKo: '사쿠라 해파리',
    descriptionEn: 'A pink glowing jellyfish that drifts like falling petals.',
    descriptionKo: '떨어지는 꽃잎처럼 떠다니는 분홍빛 해파리.',
  },
  {
    id: 'tropical_nemo',
    species: 'tropical_nemo',
    evolutionStage: 'adult',
    rarity: 'epic',
    isSecret: false,
    seasonId: 'summer_2026',
    nameEn: 'Tropical Clownfish',
    nameKo: '열대 흰동가리',
    descriptionEn: 'A vibrant clownfish found in tropical summer waters.',
    descriptionKo: '열대 여름 바다에서 발견되는 화려한 흰동가리.',
  },
  {
    id: 'sun_ray',
    species: 'sun_ray',
    evolutionStage: 'adult',
    rarity: 'epic',
    isSecret: false,
    seasonId: 'summer_2026',
    nameEn: 'Sun Ray',
    nameKo: '태양 가오리',
    descriptionEn: 'A golden ray that glides through sunlit shallows.',
    descriptionKo: '햇살 비치는 얕은 바다를 활공하는 금빛 가오리.',
  },
  {
    id: 'hacktoberfest_fish',
    species: 'hacktoberfest_fish',
    evolutionStage: 'adult',
    rarity: 'mythic',
    isSecret: false,
    seasonId: 'autumn_2026',
    nameEn: 'Hacktoberfest Fish',
    nameKo: 'Hacktoberfest 물고기',
    descriptionEn:
      'An orange dotted fish earned by contributing 4+ PRs in October.',
    descriptionKo: '10월에 PR 4개 이상 기여하면 획득하는 주황색 물고기.',
  },
  {
    id: 'deep_anglerfish',
    species: 'deep_anglerfish',
    evolutionStage: 'adult',
    rarity: 'epic',
    isSecret: false,
    seasonId: 'autumn_2026',
    nameEn: 'Deep Anglerfish',
    nameKo: '심해 아귀',
    descriptionEn: 'A bioluminescent anglerfish from the autumn depths.',
    descriptionKo: '가을 심해에서 온 생체발광 아귀.',
  },
  {
    id: 'phantom_ray',
    species: 'phantom_ray',
    evolutionStage: 'adult',
    rarity: 'epic',
    isSecret: false,
    seasonId: 'autumn_2026',
    nameEn: 'Phantom Ray',
    nameKo: '환영 가오리',
    descriptionEn: 'A translucent ray that appears in autumn mists.',
    descriptionKo: '가을 안개 속에 나타나는 반투명 가오리.',
  },
  {
    id: 'universe_fish',
    species: 'universe_fish',
    evolutionStage: 'adult',
    rarity: 'mythic',
    isSecret: false,
    seasonId: 'autumn_2026',
    nameEn: 'Universe Fish',
    nameKo: '우주 물고기',
    descriptionEn: 'A galaxy-patterned fish from GitHub Universe event.',
    descriptionKo: 'GitHub Universe 이벤트의 은하 무늬 물고기.',
  },
  {
    id: 'arctic_whale',
    species: 'arctic_whale',
    evolutionStage: 'adult',
    rarity: 'epic',
    isSecret: false,
    seasonId: 'winter_2026',
    nameEn: 'Arctic Whale',
    nameKo: '북극고래',
    descriptionEn: 'A majestic whale from the frozen northern seas.',
    descriptionKo: '얼어붙은 북쪽 바다의 위엄있는 고래.',
  },
  {
    id: 'ice_crystal_fish',
    species: 'ice_crystal_fish',
    evolutionStage: 'adult',
    rarity: 'epic',
    isSecret: false,
    seasonId: 'winter_2026',
    nameEn: 'Ice Crystal Fish',
    nameKo: '얼음결정 물고기',
    descriptionEn: 'A crystalline fish that sparkles like fresh snow.',
    descriptionKo: '신선한 눈처럼 반짝이는 결정체 물고기.',
  },
]

function getV2Rarity(
  stage: EvolutionStage,
  isLegendary: boolean,
): CodexV2Rarity {
  if (isLegendary) return 'legendary'
  switch (stage) {
    case 'elder':
      return 'rare'
    case 'adult':
      return 'uncommon'
    case 'fossil':
      return 'rare'
    default:
      return 'common'
  }
}

function getSpeciesDisplayName(species: FishSpecies): {
  en: string
  ko: string
} {
  const names: Record<string, { en: string; ko: string }> = {
    angelfish: { en: 'Angelfish', ko: '엔젤피시' },
    manta: { en: 'Manta Ray', ko: '만타레이' },
    turtle: { en: 'Sea Turtle', ko: '바다거북' },
    pufferfish: { en: 'Pufferfish', ko: '복어' },
    dolphin: { en: 'Dolphin', ko: '돌고래' },
    squid: { en: 'Squid', ko: '오징어' },
    shark: { en: 'Shark', ko: '상어' },
    seahorse: { en: 'Seahorse', ko: '해마' },
    goldfish: { en: 'Goldfish', ko: '금붕어' },
    flyingfish: { en: 'Flying Fish', ko: '날치' },
    jellyfish: { en: 'Jellyfish', ko: '해파리' },
    coral: { en: 'Coral', ko: '산호' },
    shell: { en: 'Shell', ko: '조개' },
    seaweed: { en: 'Seaweed', ko: '해초' },
    plankton: { en: 'Plankton', ko: '플랑크톤' },
  }
  return names[species] ?? { en: species, ko: species }
}

function getStageDisplayName(stage: EvolutionStage): {
  en: string
  ko: string
} {
  const names: Record<string, { en: string; ko: string }> = {
    egg: { en: 'Egg', ko: '알' },
    fry: { en: 'Fry', ko: '치어' },
    juvenile: { en: 'Juvenile', ko: '유어' },
    adult: { en: 'Adult', ko: '성체' },
    elder: { en: 'Elder', ko: '장로' },
    fossil: { en: 'Fossil', ko: '화석' },
    legendary: { en: 'Legendary', ko: '전설' },
  }
  return names[stage] ?? { en: stage, ko: stage }
}

export function generateV2Catalog(): CodexV2Entry[] {
  const entries: CodexV2Entry[] = []

  // Regular species × stages = 15 × 6 = 90
  for (const species of ALL_SPECIES) {
    const speciesName = getSpeciesDisplayName(species)
    for (const stage of REGULAR_STAGES) {
      const stageName = getStageDisplayName(stage)
      entries.push({
        id: `${species}_${stage}`,
        species,
        evolutionStage: stage,
        rarity: getV2Rarity(stage, false),
        isSecret: false,
        seasonId: null,
        nameEn: `${speciesName.en} (${stageName.en})`,
        nameKo: `${speciesName.ko} (${stageName.ko})`,
        descriptionEn: `${speciesName.en} at ${stageName.en.toLowerCase()} stage`,
        descriptionKo: `${stageName.ko} 단계의 ${speciesName.ko}`,
      })
    }
  }

  // Legendary fish = 5
  const legendaryNames: Record<
    LegendaryFishType,
    { en: string; ko: string; desc: string; descKo: string }
  > = {
    leviathan: {
      en: 'Leviathan',
      ko: '리바이어던',
      desc: 'An ancient sea monster born from a repo with 10,000+ stars',
      descKo: '스타 10,000개 이상 레포에서 태어난 고대 바다 괴물',
    },
    phoenix_fish: {
      en: 'Phoenix Fish',
      ko: '불사조 물고기',
      desc: 'Reborn from a repo inactive 1+ year then reactivated',
      descKo: '1년 이상 비활성 후 재활성화된 레포에서 부활',
    },
    hydra: {
      en: 'Hydra',
      ko: '히드라',
      desc: 'A multi-headed creature from a repo with 1,000+ forks',
      descKo: '포크 1,000개 이상 레포에서 탄생한 다두 생물',
    },
    kraken: {
      en: 'Kraken',
      ko: '크라켄',
      desc: 'A mighty kraken from a repo with 500+ issues all closed',
      descKo: '이슈 500개 이상 모두 클로즈한 레포의 거대 크라켄',
    },
    narwhal: {
      en: 'Narwhal',
      ko: '일각고래',
      desc: 'A mystical narwhal earned by 365-day contribution streak',
      descKo: '365일 연속 기여로 획득한 신비로운 일각고래',
    },
  }

  for (const legendaryType of LEGENDARY_TYPES) {
    const info = legendaryNames[legendaryType]
    entries.push({
      id: `legendary_${legendaryType}`,
      species: legendaryType,
      evolutionStage: 'legendary',
      rarity: 'legendary',
      isSecret: false,
      seasonId: null,
      nameEn: info.en,
      nameKo: info.ko,
      descriptionEn: info.desc,
      descriptionKo: info.descKo,
    })
  }

  // Seasonal + special = 10
  entries.push(...SEASONAL_SPECIES)

  return entries
}

export function generateV2CodexForUser(
  username: string,
  ownedFish: Array<{ species: string; evolutionStage: string }>,
  witnessedSpecies: string[] = [],
): UserCodex {
  const catalog = generateV2Catalog()
  const ownedSet = new Set(
    ownedFish.map((f) => {
      if (f.evolutionStage === 'legendary') {
        return `legendary_${f.species}`
      }
      return `${f.species}_${f.evolutionStage}`
    }),
  )
  const witnessedSet = new Set(witnessedSpecies)
  const now = new Date().toISOString()

  const entries: CodexEntry[] = catalog.map((entry) => {
    const isOwned = ownedSet.has(entry.id)
    const isWitnessed = witnessedSet.has(entry.id)
    let status: CodexEntryStatus = 'undiscovered'
    if (isOwned) status = 'owned'
    else if (isWitnessed) status = 'witnessed'

    return {
      id: entry.id,
      species: entry.species as FishSpecies,
      evolutionStage: (entry.evolutionStage as EvolutionStage) ?? null,
      legendaryType:
        entry.rarity === 'legendary'
          ? (entry.species as LegendaryFishType)
          : null,
      status,
      firstSeenAt: isOwned || isWitnessed ? now : null,
      firstSeenInAquarium: isOwned ? username : null,
      description: entry.descriptionEn,
      rarity:
        entry.rarity === 'mythic'
          ? 'legendary'
          : entry.rarity === 'epic'
            ? 'rare'
            : (entry.rarity as CodexEntry['rarity']),
      isSeasonalLimited: entry.seasonId !== null,
      seasonTag: entry.seasonId,
    }
  })

  const ownedCount = entries.filter((e) => e.status === 'owned').length
  const witnessedCount = entries.filter((e) => e.status === 'witnessed').length

  return {
    userId: username,
    username,
    entries,
    completionPercent:
      entries.length > 0 ? Math.round((ownedCount / entries.length) * 100) : 0,
    totalEntries: entries.length,
    ownedCount,
    witnessedCount,
    lastUpdatedAt: now,
  }
}

export function getV2CodexStats(codex: UserCodex): {
  total: number
  owned: number
  witnessed: number
  undiscovered: number
  completionPercent: number
  regularOwned: number
  regularTotal: number
  legendaryOwned: number
  legendaryTotal: number
  seasonalOwned: number
  seasonalTotal: number
} {
  const seasonal = codex.entries.filter((e) => e.isSeasonalLimited)
  const legendary = codex.entries.filter(
    (e) => e.rarity === 'legendary' && !e.isSeasonalLimited,
  )
  const regular = codex.entries.filter(
    (e) => !e.isSeasonalLimited && e.rarity !== 'legendary',
  )

  return {
    total: codex.totalEntries,
    owned: codex.ownedCount,
    witnessed: codex.witnessedCount,
    undiscovered: codex.entries.filter((e) => e.status === 'undiscovered')
      .length,
    completionPercent: codex.completionPercent,
    regularOwned: regular.filter((e) => e.status === 'owned').length,
    regularTotal: regular.length,
    legendaryOwned: legendary.filter((e) => e.status === 'owned').length,
    legendaryTotal: legendary.length,
    seasonalOwned: seasonal.filter((e) => e.status === 'owned').length,
    seasonalTotal: seasonal.length,
  }
}

export const CODEX_V2_TOTAL = 105 // 90 regular + 5 legendary + 10 seasonal

export { ALL_SPECIES, REGULAR_STAGES, LEGENDARY_TYPES, SEASONAL_SPECIES }
