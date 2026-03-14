import type { SeasonConfig, SpecialEventConfig } from '@/types/gamification'

export const SEASONS: SeasonConfig[] = [
  {
    id: 'spring_2026',
    nameEn: 'Spring Bloom',
    nameKo: '봄의 꽃',
    themeId: 'spring',
    startDate: '2026-03-01',
    endDate: '2026-05-31',
    speciesIds: ['cherry_shrimp', 'sakura_jellyfish'],
    isActive: false,
  },
  {
    id: 'summer_2026',
    nameEn: 'Summer Tide',
    nameKo: '여름 조류',
    themeId: 'summer',
    startDate: '2026-06-01',
    endDate: '2026-08-31',
    speciesIds: ['tropical_nemo', 'sun_ray'],
    isActive: false,
  },
  {
    id: 'autumn_2026',
    nameEn: 'Autumn Depths',
    nameKo: '가을 심해',
    themeId: 'autumn',
    startDate: '2026-09-01',
    endDate: '2026-11-30',
    speciesIds: ['deep_anglerfish', 'phantom_ray'],
    isActive: false,
  },
  {
    id: 'winter_2026',
    nameEn: 'Winter Frost',
    nameKo: '겨울 서리',
    themeId: 'winter',
    startDate: '2026-12-01',
    endDate: '2027-02-28',
    speciesIds: ['arctic_whale', 'ice_crystal_fish'],
    isActive: false,
  },
] as const

export const SPECIAL_EVENTS: SpecialEventConfig[] = [
  {
    id: 'hacktoberfest_2026',
    nameEn: 'Hacktoberfest 2026',
    nameKo: 'Hacktoberfest 2026',
    activePeriod: {
      startDate: '2026-10-01',
      endDate: '2026-10-31',
    },
    triggerCondition: {
      type: 'pr_count',
      value: 4,
    },
    rewardSpeciesId: 'hacktoberfest_fish',
    isActive: false,
    speciesRetainedAfterEnd: true,
  },
  {
    id: 'github_universe_2026',
    nameEn: 'GitHub Universe 2026',
    nameKo: 'GitHub Universe 2026',
    activePeriod: {
      startDate: '2026-11-01',
      endDate: '2026-11-15',
    },
    triggerCondition: {
      type: 'flag',
      value: null,
    },
    rewardSpeciesId: 'universe_fish',
    isActive: false,
    speciesRetainedAfterEnd: false,
  },
] as const

export function getActiveSeason(now: Date = new Date()): SeasonConfig | null {
  const dateStr = now.toISOString().slice(0, 10)

  for (const season of SEASONS) {
    if (season.startDate <= dateStr && dateStr <= season.endDate) {
      return { ...season, isActive: true }
    }
  }

  return null
}

export function getActiveSpecialEvents(
  now: Date = new Date(),
): SpecialEventConfig[] {
  const dateStr = now.toISOString().slice(0, 10)

  return SPECIAL_EVENTS.filter((event) => {
    if (!event.isActive && event.triggerCondition.type !== 'flag') {
      return (
        event.activePeriod.startDate <= dateStr &&
        dateStr <= event.activePeriod.endDate
      )
    }
    return event.isActive
  })
}

export function isSeasonActive(
  season: SeasonConfig,
  now: Date = new Date(),
): boolean {
  const dateStr = now.toISOString().slice(0, 10)
  return season.startDate <= dateStr && dateStr <= season.endDate
}

export function isSpecialEventActive(
  event: SpecialEventConfig,
  now: Date = new Date(),
): boolean {
  const dateStr = now.toISOString().slice(0, 10)
  return (
    event.activePeriod.startDate <= dateStr &&
    dateStr <= event.activePeriod.endDate
  )
}

export function checkHacktoberfestEligibility(mergedPrCount: number): boolean {
  const hacktoberfest = SPECIAL_EVENTS.find(
    (e) => e.id === 'hacktoberfest_2026',
  )
  if (!hacktoberfest || hacktoberfest.triggerCondition.type !== 'pr_count') {
    return false
  }
  return mergedPrCount >= (hacktoberfest.triggerCondition.value ?? 0)
}

export function getSeasonalSpeciesIds(now: Date = new Date()): string[] {
  const season = getActiveSeason(now)
  const events = getActiveSpecialEvents(now)

  const speciesIds: string[] = []

  if (season) {
    speciesIds.push(...season.speciesIds)
  }

  for (const event of events) {
    speciesIds.push(event.rewardSpeciesId)
  }

  return speciesIds
}

export function getSeasonById(id: string): SeasonConfig | undefined {
  return SEASONS.find((s) => s.id === id)
}

export function getSpecialEventById(
  id: string,
): SpecialEventConfig | undefined {
  return SPECIAL_EVENTS.find((e) => e.id === id)
}
