import { getSnapshots } from './snapshot'
import type { YearRecapData, TimelineSnapshot } from '@/types/webhook'
import type { AquariumData } from '@/types/aquarium'

export async function buildYearRecap(
  username: string,
  year: number,
): Promise<YearRecapData | null> {
  const startDate = `${year}-01-01`
  const endDate = `${year}-12-31`

  const snapshots = await getSnapshots(username, startDate, endDate)
  if (snapshots.length === 0) return null

  const firstSnapshot = snapshots[0]
  const lastSnapshot = snapshots[snapshots.length - 1]
  if (!firstSnapshot || !lastSnapshot) return null

  const newFishCount = lastSnapshot.fishCount - firstSnapshot.fishCount

  const topGrownFish = findTopGrownFish(snapshots)
  const monthlyActivity = aggregateMonthlyActivity(snapshots)
  const peakIdx = monthlyActivity.indexOf(Math.max(...monthlyActivity))
  const peakActivityMonth = peakIdx + 1

  const lastData = lastSnapshot.data as unknown as AquariumData | undefined
  const languageDistribution = lastData?.stats?.languageDistribution ?? {}

  return {
    year,
    username,
    newFishCount: Math.max(0, newFishCount),
    topGrownFish,
    totalKudos: 0,
    languageDistribution,
    peakActivityMonth,
    achievementsUnlocked: [],
    mostActiveRepo: findMostActiveRepo(snapshots),
  }
}

function findTopGrownFish(
  snapshots: TimelineSnapshot[],
): YearRecapData['topGrownFish'] {
  if (snapshots.length < 2) {
    return { fishId: '', repoName: 'N/A', commitGrowth: 0 }
  }

  const first = snapshots[0]
  const last = snapshots[snapshots.length - 1]
  if (!first || !last) {
    return { fishId: '', repoName: 'N/A', commitGrowth: 0 }
  }

  const firstData = first.data as Record<string, unknown>
  const lastData = last.data as Record<string, unknown>
  const firstFish = (firstData['fish'] as Array<Record<string, unknown>>) ?? []
  const lastFish = (lastData['fish'] as Array<Record<string, unknown>>) ?? []

  let maxGrowth = 0
  let topRepo = 'N/A'
  let topId = ''

  for (const fish of lastFish) {
    const repoName = String(fish['repoName'] ?? '')
    const lastCommits = Number(fish['totalCommits'] ?? 0)
    const firstMatch = firstFish.find((f) => f['repoName'] === repoName)
    const firstCommits = Number(firstMatch?.['totalCommits'] ?? 0)
    const growth = lastCommits - firstCommits
    if (growth > maxGrowth) {
      maxGrowth = growth
      topRepo = repoName
      topId = String(fish['id'] ?? '')
    }
  }

  return { fishId: topId, repoName: topRepo, commitGrowth: maxGrowth }
}

function aggregateMonthlyActivity(snapshots: TimelineSnapshot[]): number[] {
  const monthly = Array.from({ length: 12 }, () => 0)
  for (const snap of snapshots) {
    const month = new Date(snap.timestamp).getMonth()
    monthly[month] = (monthly[month] ?? 0) + snap.fishCount
  }
  return monthly
}

function findMostActiveRepo(snapshots: TimelineSnapshot[]): string {
  const last = snapshots[snapshots.length - 1]
  if (!last) return 'N/A'

  const data = last.data as Record<string, unknown>
  const fish = (data['fish'] as Array<Record<string, unknown>>) ?? []
  if (fish.length === 0) return 'N/A'

  let maxCommits = 0
  let topRepo = 'N/A'
  for (const f of fish) {
    const commits = Number(f['totalCommits'] ?? 0)
    if (commits > maxCommits) {
      maxCommits = commits
      topRepo = String(f['repoName'] ?? 'N/A')
    }
  }
  return topRepo
}
