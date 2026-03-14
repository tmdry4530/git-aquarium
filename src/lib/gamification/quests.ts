import type {
  Quest,
  QuestType,
  QuestConditionType,
  UserQuest,
} from '@/types/gamification'

export const QUESTS: Quest[] = [
  // Daily quests
  {
    id: 'daily_commit_3',
    type: 'daily',
    nameEn: 'Daily Commits',
    nameKo: '오늘의 커밋',
    descriptionEn: 'Make 3 commits today',
    descriptionKo: '오늘 커밋 3개 달성',
    conditionType: 'commit_count',
    conditionValue: 3,
    rewardType: 'effect',
    rewardId: 'feed_bonus',
    seasonId: null,
    isActive: true,
  },
  {
    id: 'daily_visit_1',
    type: 'daily',
    nameEn: 'Daily Visit',
    nameKo: '일일 방문',
    descriptionEn: 'Visit another aquarium',
    descriptionKo: '다른 수족관 1곳 방문',
    conditionType: 'visit_count',
    conditionValue: 1,
    rewardType: 'effect',
    rewardId: 'sparkle_effect',
    seasonId: null,
    isActive: true,
  },
  {
    id: 'daily_kudo_1',
    type: 'daily',
    nameEn: 'Daily Kudos',
    nameKo: '오늘의 칭찬',
    descriptionEn: 'Give a kudo to someone',
    descriptionKo: '다른 사용자에게 쿠도스 1개 전달',
    conditionType: 'kudo_given',
    conditionValue: 1,
    rewardType: 'effect',
    rewardId: 'heart_bubble',
    seasonId: null,
    isActive: true,
  },
  // Weekly quests
  {
    id: 'weekly_new_repo',
    type: 'weekly',
    nameEn: 'New Repository',
    nameKo: '새 레포지토리',
    descriptionEn: 'Create a new repository this week',
    descriptionKo: '이번 주 새 레포지토리 1개 생성',
    conditionType: 'new_repo',
    conditionValue: 1,
    rewardType: 'decoration',
    rewardId: 'egg_decoration',
    seasonId: null,
    isActive: true,
  },
  {
    id: 'weekly_commits_20',
    type: 'weekly',
    nameEn: 'Weekly Grind',
    nameKo: '주간 분투',
    descriptionEn: 'Make 20 commits this week',
    descriptionKo: '이번 주 커밋 20개 달성',
    conditionType: 'commit_count',
    conditionValue: 20,
    rewardType: 'effect',
    rewardId: 'wave_boost',
    seasonId: null,
    isActive: true,
  },
  {
    id: 'weekly_kudos_5',
    type: 'weekly',
    nameEn: 'Generous Spirit',
    nameKo: '관대한 마음',
    descriptionEn: 'Give 5 kudos this week',
    descriptionKo: '이번 주 쿠도스 5개 전달',
    conditionType: 'kudo_given',
    conditionValue: 5,
    rewardType: 'decoration',
    rewardId: 'starfish',
    seasonId: null,
    isActive: true,
  },
  // Challenge quests
  {
    id: 'challenge_manta_ray',
    type: 'challenge',
    nameEn: 'Manta Ray Challenge',
    nameKo: '만타레이 도전',
    descriptionEn: 'Create a TypeScript repo that evolves to adult',
    descriptionKo: 'TypeScript 레포로 성체 만타레이 출현',
    conditionType: 'species_discovered',
    conditionValue: 1,
    rewardType: 'frame',
    rewardId: 'typescript_frame',
    seasonId: null,
    isActive: true,
  },
  {
    id: 'challenge_star_100',
    type: 'challenge',
    nameEn: 'Star Magnet',
    nameKo: '스타 자석',
    descriptionEn: 'Earn 100 total stars across repos',
    descriptionKo: '전체 레포 합산 스타 100개 달성',
    conditionType: 'star_earned',
    conditionValue: 100,
    rewardType: 'decoration',
    rewardId: 'golden_star',
    seasonId: null,
    isActive: true,
  },
] as const

export function getQuestsByType(type: QuestType): Quest[] {
  return QUESTS.filter((q) => q.type === type && q.isActive)
}

export function getActiveQuests(seasonId: string | null = null): Quest[] {
  return QUESTS.filter(
    (q) => q.isActive && (q.seasonId === null || q.seasonId === seasonId),
  )
}

export function getQuestById(id: string): Quest | undefined {
  return QUESTS.find((q) => q.id === id)
}

export function updateQuestProgress(
  userQuests: UserQuest[],
  conditionType: QuestConditionType,
  incrementBy: number = 1,
): { updated: UserQuest[]; completed: UserQuest[] } {
  const matchingQuests = QUESTS.filter(
    (q) => q.conditionType === conditionType && q.isActive,
  )
  const matchingIds = new Set(matchingQuests.map((q) => q.id))

  const updated: UserQuest[] = []
  const completed: UserQuest[] = []

  for (const uq of userQuests) {
    if (!matchingIds.has(uq.questId)) continue
    if (uq.completedAt !== null) continue

    const newProgress = Math.min(uq.progress + incrementBy, uq.target)
    const updatedQuest: UserQuest = {
      ...uq,
      progress: newProgress,
      completedAt: newProgress >= uq.target ? new Date().toISOString() : null,
    }

    updated.push(updatedQuest)
    if (updatedQuest.completedAt !== null) {
      completed.push(updatedQuest)
    }
  }

  return { updated, completed }
}

export function initializeUserQuests(
  seasonId: string | null = null,
): UserQuest[] {
  const activeQuests = getActiveQuests(seasonId)
  const now = new Date().toISOString()

  return activeQuests.map((q) => ({
    questId: q.id,
    progress: 0,
    target: q.conditionValue,
    completedAt: null,
    resetAt: q.type === 'challenge' ? null : now,
  }))
}

export function shouldResetQuest(
  quest: Quest,
  userQuest: UserQuest,
  now: Date = new Date(),
): boolean {
  if (quest.type === 'challenge') return false
  if (!userQuest.resetAt) return true

  const resetDate = new Date(userQuest.resetAt)

  if (quest.type === 'daily') {
    const resetDay = new Date(
      resetDate.getUTCFullYear(),
      resetDate.getUTCMonth(),
      resetDate.getUTCDate(),
    )
    const today = new Date(
      now.getUTCFullYear(),
      now.getUTCMonth(),
      now.getUTCDate(),
    )
    return today > resetDay
  }

  if (quest.type === 'weekly') {
    const resetWeekStart = getWeekStart(resetDate)
    const currentWeekStart = getWeekStart(now)
    return currentWeekStart.getTime() > resetWeekStart.getTime()
  }

  return false
}

function getWeekStart(date: Date): Date {
  const d = new Date(date)
  const day = d.getUTCDay()
  const diff = day === 0 ? 6 : day - 1 // Monday = 0
  d.setUTCDate(d.getUTCDate() - diff)
  d.setUTCHours(0, 0, 0, 0)
  return d
}

export function resetQuest(userQuest: UserQuest): UserQuest {
  return {
    ...userQuest,
    progress: 0,
    completedAt: null,
    resetAt: new Date().toISOString(),
  }
}
