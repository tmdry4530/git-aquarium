import type { KudosMilestone } from '@/types/gamification'

export const KUDOS_MILESTONES: KudosMilestone[] = [
  {
    threshold: 10,
    rewardType: 'decoration',
    rewardId: 'shell_set',
    nameEn: 'Shell Collection',
    nameKo: '조개 세트',
  },
  {
    threshold: 50,
    rewardType: 'decoration',
    rewardId: 'treasure_chest',
    nameEn: 'Treasure Chest',
    nameKo: '보물상자',
  },
  {
    threshold: 100,
    rewardType: 'theme',
    rewardId: 'neon_theme',
    nameEn: 'Neon Theme',
    nameKo: '네온 테마',
  },
  {
    threshold: 500,
    rewardType: 'frame',
    rewardId: 'crystal_frame',
    nameEn: 'Crystal Frame',
    nameKo: '크리스탈 프레임',
  },
  {
    threshold: 1000,
    rewardType: 'decoration',
    rewardId: 'golden_crown',
    nameEn: 'Golden Crown',
    nameKo: '황금 왕관',
  },
] as const

export function getUnlockedMilestones(totalKudos: number): KudosMilestone[] {
  return KUDOS_MILESTONES.filter((m) => totalKudos >= m.threshold)
}

export function getNextMilestone(totalKudos: number): KudosMilestone | null {
  const found = KUDOS_MILESTONES.find((m) => totalKudos < m.threshold)
  return found ?? null
}

export function getMilestoneProgress(totalKudos: number): {
  current: KudosMilestone | null
  next: KudosMilestone | null
  progressPercent: number
} {
  const unlocked = getUnlockedMilestones(totalKudos)
  const current: KudosMilestone | null =
    unlocked.length > 0 ? (unlocked[unlocked.length - 1] ?? null) : null
  const next = getNextMilestone(totalKudos)

  if (!next) {
    return { current, next: null, progressPercent: 100 }
  }

  const prevThreshold = current?.threshold ?? 0
  const range = next.threshold - prevThreshold
  const progress = totalKudos - prevThreshold

  return {
    current,
    next,
    progressPercent: range > 0 ? Math.round((progress / range) * 100) : 0,
  }
}

export function checkNewMilestone(
  previousTotal: number,
  newTotal: number,
): KudosMilestone | null {
  for (const milestone of KUDOS_MILESTONES) {
    if (
      previousTotal < milestone.threshold &&
      newTotal >= milestone.threshold
    ) {
      return milestone
    }
  }
  return null
}
