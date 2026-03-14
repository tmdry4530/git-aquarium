// ===== Achievements =====
export type AchievementCondition =
  | 'aquarium_created'
  | 'language_count'
  | 'fossil_count'
  | 'total_stars'
  | 'commit_streak'
  | 'visit_count'
  | 'social_visits'
  | 'legendary_count'
  | 'codex_percent'
  | 'all_achievements'

export type AchievementRewardType =
  | 'theme'
  | 'badge'
  | 'effect'
  | 'frame'
  | 'decoration'

export interface Achievement {
  id: string
  nameEn: string
  nameKo: string
  descriptionEn: string
  descriptionKo: string
  conditionType: AchievementCondition
  conditionValue: number
  rewardType: AchievementRewardType
  rewardId: string
  icon: string
}

export interface UserAchievement {
  achievementId: string
  unlockedAt: string
}

export interface AchievementProgress {
  achievement: Achievement
  currentValue: number
  isUnlocked: boolean
  unlockedAt: string | null
}

export interface UserAchievements {
  unlocked: UserAchievement[]
  progress: AchievementProgress[]
  totalCount: number
  unlockedCount: number
}

// ===== User Stats (for achievement checking) =====
export interface UserStats {
  aquariumsCreated: number
  currentStreak: number
  totalVisits: number
  uniqueAquariumsVisited: number
  codexCompletion: number
  achievementCount: number
}

// ===== Seasons =====
export interface SeasonConfig {
  id: string
  nameEn: string
  nameKo: string
  themeId: string
  startDate: string
  endDate: string
  speciesIds: string[]
  isActive: boolean
}

// ===== Special Events =====
export interface SpecialEventConfig {
  id: string
  nameEn: string
  nameKo: string
  activePeriod: {
    startDate: string
    endDate: string
  }
  triggerCondition: {
    type: 'pr_count' | 'flag'
    value: number | null
  }
  rewardSpeciesId: string
  isActive: boolean
  speciesRetainedAfterEnd: boolean
}

// ===== Quests =====
export type QuestType = 'daily' | 'weekly' | 'challenge'

export type QuestConditionType =
  | 'commit_count'
  | 'new_repo'
  | 'visit_count'
  | 'kudo_given'
  | 'kudo_received'
  | 'species_discovered'
  | 'star_earned'

export interface Quest {
  id: string
  type: QuestType
  nameEn: string
  nameKo: string
  descriptionEn: string
  descriptionKo: string
  conditionType: QuestConditionType
  conditionValue: number
  rewardType: string
  rewardId: string
  seasonId: string | null
  isActive: boolean
}

export interface UserQuest {
  questId: string
  progress: number
  target: number
  completedAt: string | null
  resetAt: string | null
}

// ===== Customization =====
export type CustomizationCategory =
  | 'background'
  | 'decoration'
  | 'lighting'
  | 'frame'

export interface Customization {
  id: string
  category: CustomizationCategory
  nameEn: string
  nameKo: string
  previewUrl: string | null
  unlockMethod: 'achievement' | 'season' | 'kudos' | 'default'
  unlockRef: string | null
}

export interface UserCustomization {
  backgroundId: string
  decorationIds: string[]
  lightingId: string
  frameId: string
}

// ===== Substrates =====
export type SubstrateType = 'sand' | 'gravel' | 'volcanic'

export interface SubstrateConfig {
  type: SubstrateType
  nameEn: string
  nameKo: string
  unlockMethod: 'default' | 'achievement'
  unlockRef: string | null
  materialKey: string
  bumpScale: number
  color: string
}

// ===== Codex v2 =====
export type CodexV2Rarity =
  | 'common'
  | 'uncommon'
  | 'rare'
  | 'epic'
  | 'legendary'
  | 'mythic'

export interface CodexV2Entry {
  id: string
  species: string
  evolutionStage: string
  rarity: CodexV2Rarity
  isSecret: boolean
  seasonId: string | null
  nameEn: string
  nameKo: string
  descriptionEn: string
  descriptionKo: string
}

// ===== Kudos Milestones =====
export interface KudosMilestone {
  threshold: number
  rewardType: CustomizationCategory | 'theme'
  rewardId: string
  nameEn: string
  nameKo: string
}
