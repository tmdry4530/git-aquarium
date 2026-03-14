import type {
  Achievement,
  AchievementCondition,
  AchievementProgress,
  UserAchievement,
  UserAchievements,
  UserStats,
} from '@/types/gamification'
import type { AquariumData } from '@/types/aquarium'

export const ACHIEVEMENTS: Achievement[] = [
  {
    id: 'first_splash',
    nameEn: 'First Splash',
    nameKo: '첫 물결',
    descriptionEn: 'Create your first aquarium',
    descriptionKo: '첫 수족관을 생성하세요',
    conditionType: 'aquarium_created',
    conditionValue: 1,
    rewardType: 'theme',
    rewardId: 'basic_theme',
    icon: '🌊',
  },
  {
    id: 'diverse_ocean',
    nameEn: 'Diverse Ocean',
    nameKo: '다양한 바다',
    descriptionEn: 'Own fish from 5+ languages',
    descriptionKo: '5개 이상 언어의 물고기를 보유하세요',
    conditionType: 'language_count',
    conditionValue: 5,
    rewardType: 'badge',
    rewardId: 'diversity_badge',
    icon: '🌈',
  },
  {
    id: 'fossil_hunter',
    nameEn: 'Fossil Hunter',
    nameKo: '화석 사냥꾼',
    descriptionEn: 'Have 10+ fossil fish',
    descriptionKo: '화석 물고기 10마리 이상 보유',
    conditionType: 'fossil_count',
    conditionValue: 10,
    rewardType: 'theme',
    rewardId: 'ancient_seabed',
    icon: '🦴',
  },
  {
    id: 'star_collector',
    nameEn: 'Star Collector',
    nameKo: '별빛 수집가',
    descriptionEn: 'Accumulate 100+ total stars',
    descriptionKo: '총 스타 100개 이상 획득',
    conditionType: 'total_stars',
    conditionValue: 100,
    rewardType: 'effect',
    rewardId: 'enhanced_starlight',
    icon: '⭐',
  },
  {
    id: 'commit_streak',
    nameEn: 'Commit Streak',
    nameKo: '연속 커밋',
    descriptionEn: '30-day commit streak',
    descriptionKo: '30일 연속 커밋',
    conditionType: 'commit_streak',
    conditionValue: 30,
    rewardType: 'effect',
    rewardId: 'current_effect',
    icon: '🔥',
  },
  {
    id: 'deep_diver',
    nameEn: 'Deep Diver',
    nameKo: '심해 다이버',
    descriptionEn: 'Visit aquarium 50+ times',
    descriptionKo: '수족관 50회 이상 방문',
    conditionType: 'visit_count',
    conditionValue: 50,
    rewardType: 'theme',
    rewardId: 'deep_sea_theme',
    icon: '🤿',
  },
  {
    id: 'social_butterfly',
    nameEn: 'Social Butterfly',
    nameKo: '사교적 나비',
    descriptionEn: 'Visit 10+ different aquariums',
    descriptionKo: '10명 이상의 수족관 방문',
    conditionType: 'social_visits',
    conditionValue: 10,
    rewardType: 'decoration',
    rewardId: 'rainbow_coral',
    icon: '🦋',
  },
  {
    id: 'legendary_tamer',
    nameEn: 'Legendary Tamer',
    nameKo: '전설의 조련사',
    descriptionEn: 'Own 1+ legendary fish',
    descriptionKo: '전설급 물고기 1마리 이상 보유',
    conditionType: 'legendary_count',
    conditionValue: 1,
    rewardType: 'frame',
    rewardId: 'golden_frame',
    icon: '👑',
  },
  {
    id: 'codex_master',
    nameEn: 'Codex Master',
    nameKo: '도감 마스터',
    descriptionEn: 'Complete 80%+ of the codex',
    descriptionKo: '도감 80% 이상 완성',
    conditionType: 'codex_percent',
    conditionValue: 80,
    rewardType: 'badge',
    rewardId: 'codex_master_title',
    icon: '📖',
  },
  {
    id: 'ocean_king',
    nameEn: 'Ocean King',
    nameKo: '바다의 왕',
    descriptionEn: 'Unlock all other achievements',
    descriptionKo: '모든 업적 달성',
    conditionType: 'all_achievements',
    conditionValue: 9,
    rewardType: 'decoration',
    rewardId: 'crown_skin',
    icon: '🏆',
  },
] as const

export function evaluateCondition(
  type: AchievementCondition,
  value: number,
  data: AquariumData,
  stats: UserStats,
): boolean {
  switch (type) {
    case 'aquarium_created':
      return stats.aquariumsCreated >= value
    case 'language_count': {
      const languages = new Set(
        data.fish.map((f) => f.language).filter(Boolean),
      )
      return languages.size >= value
    }
    case 'fossil_count':
      return (
        data.fish.filter((f) => f.evolutionStage === 'fossil').length >= value
      )
    case 'total_stars':
      return data.fish.reduce((sum, f) => sum + f.stars, 0) >= value
    case 'commit_streak':
      return stats.currentStreak >= value
    case 'visit_count':
      return stats.totalVisits >= value
    case 'social_visits':
      return stats.uniqueAquariumsVisited >= value
    case 'legendary_count':
      return (
        data.fish.filter((f) => f.evolutionStage === 'legendary').length >=
        value
      )
    case 'codex_percent':
      return stats.codexCompletion >= value
    case 'all_achievements':
      return stats.achievementCount >= value
  }
}

export function getConditionCurrentValue(
  type: AchievementCondition,
  data: AquariumData,
  stats: UserStats,
): number {
  switch (type) {
    case 'aquarium_created':
      return stats.aquariumsCreated
    case 'language_count':
      return new Set(data.fish.map((f) => f.language).filter(Boolean)).size
    case 'fossil_count':
      return data.fish.filter((f) => f.evolutionStage === 'fossil').length
    case 'total_stars':
      return data.fish.reduce((sum, f) => sum + f.stars, 0)
    case 'commit_streak':
      return stats.currentStreak
    case 'visit_count':
      return stats.totalVisits
    case 'social_visits':
      return stats.uniqueAquariumsVisited
    case 'legendary_count':
      return data.fish.filter((f) => f.evolutionStage === 'legendary').length
    case 'codex_percent':
      return stats.codexCompletion
    case 'all_achievements':
      return stats.achievementCount
  }
}

export function checkAchievements(
  aquariumData: AquariumData,
  userStats: UserStats,
  alreadyUnlocked: UserAchievement[],
): Achievement[] {
  const unlockedIds = new Set(alreadyUnlocked.map((a) => a.achievementId))
  const newlyUnlocked: Achievement[] = []

  for (const achievement of ACHIEVEMENTS) {
    if (unlockedIds.has(achievement.id)) continue

    const met = evaluateCondition(
      achievement.conditionType,
      achievement.conditionValue,
      aquariumData,
      userStats,
    )

    if (met) {
      newlyUnlocked.push(achievement)
    }
  }

  return newlyUnlocked
}

export function buildAchievementProgress(
  aquariumData: AquariumData,
  userStats: UserStats,
  unlocked: UserAchievement[],
): UserAchievements {
  const unlockedMap = new Map(
    unlocked.map((u) => [u.achievementId, u.unlockedAt]),
  )

  const progress: AchievementProgress[] = ACHIEVEMENTS.map((achievement) => ({
    achievement,
    currentValue: getConditionCurrentValue(
      achievement.conditionType,
      aquariumData,
      userStats,
    ),
    isUnlocked: unlockedMap.has(achievement.id),
    unlockedAt: unlockedMap.get(achievement.id) ?? null,
  }))

  return {
    unlocked,
    progress,
    totalCount: ACHIEVEMENTS.length,
    unlockedCount: unlocked.length,
  }
}

export function getAchievementById(id: string): Achievement | undefined {
  return ACHIEVEMENTS.find((a) => a.id === id)
}
