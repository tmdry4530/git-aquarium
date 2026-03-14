import type { AquariumData } from './aquarium'
import type { EvolutionStage, FishSpecies } from './fish'

// ===== Compare Mode =====
export interface CompareData {
  users: [AquariumData, AquariumData]
  stats: CompareStats
}

export interface CompareStats {
  fishCount: [number, number]
  languageDiversity: [number, number]
  totalStars: [number, number]
  legendaryCount: [number, number]
  activeRatio: [number, number]
  oldestRepo: [string, string]
}

// ===== Merge Ocean =====
export interface MergeOceanConfig {
  usernames: string[]
  layout: 'merged' | 'zones'
  interactionEnabled: boolean
}

export interface MergeOceanData {
  config: MergeOceanConfig
  aquariums: AquariumData[]
  mergedFish: MergedFishData[]
  totalStats: {
    fishCount: number
    languageCount: number
    totalStars: number
    uniqueSpecies: number
  }
}

export interface MergedFishData {
  id: string
  repoName: string
  repoUrl: string
  description: string | null
  species: FishSpecies
  evolutionStage: EvolutionStage
  color: string
  size: number
  swimSpeed: number
  swimPattern: string
  stars: number
  forks: number
  openIssues: number
  hasReadme: boolean
  hasLicense: boolean
  language: string | null
  lastCommitAt: string
  totalCommits: number
  commitsLast30Days: number
  createdAt: string
  ownerId: string
  ownerIndex: number
  zoneOffset: { x: number; z: number }
}

// ===== Visit System =====
export interface Visit {
  id: string
  visitorId: string
  visitorUsername: string
  visitorAvatar: string
  hostUsername: string
  visitorFish: VisitorFishData
  message?: string
  createdAt: string
}

export interface VisitorFishData {
  species: FishSpecies
  size: number
  color: string
  evolutionStage: EvolutionStage
  repoName: string
}

// ===== Kudos =====
export type KudoType = 'star' | 'bug' | 'idea'

export interface Kudo {
  id: string
  giverId: string
  giverUsername: string
  giverAvatar: string
  receiverUsername: string
  fishId: string
  kudoType: KudoType
  createdAt: string
}

export interface KudoFeedItem {
  type: KudoType
  emoji: string
  label: string
  description: string
}

// ===== Leaderboard =====
export type LeaderboardCategory =
  | 'diversity'
  | 'total_size'
  | 'legendary_count'
  | 'codex_completion'
  | 'weekly_new'

export type LeaderboardPeriod = 'all_time' | 'weekly' | 'monthly'

export interface LeaderboardEntry {
  rank: number
  username: string
  avatarUrl: string
  score: number
  category: LeaderboardCategory
  metadata: Record<string, unknown>
}

export interface LeaderboardData {
  category: LeaderboardCategory
  period: LeaderboardPeriod
  entries: LeaderboardEntry[]
  totalCount: number
  userRank?: number
}

// ===== Embed =====
export interface EmbedConfig {
  username: string
  theme: 'light' | 'dark' | 'auto'
  width: number
  height: number
  showStats: boolean
  showControls: boolean
  interactive: boolean
}

export interface BadgeConfig {
  username: string
  style: 'flat' | 'flat-square' | 'for-the-badge' | 'plastic'
  label: string
  color: string
  fishCount?: number
  languageCount?: number
}

// ===== Content Moderation =====
export type ReportReason = 'spam' | 'harassment' | 'inappropriate' | 'other'
export type ReportStatus = 'pending' | 'reviewed' | 'resolved' | 'dismissed'

export interface ModerationReport {
  id: string
  reporterId: string
  targetType: 'guestbook' | 'username' | 'message'
  targetId: string
  reason: ReportReason
  description?: string
  status: ReportStatus
  createdAt: string
  resolvedAt?: string
}

// ===== Explore Page =====
export interface ExploreFilters {
  sortBy: 'trending' | 'newest' | 'most_fish' | 'most_diverse' | 'most_stars'
  language?: string
  period: 'day' | 'week' | 'month' | 'all_time'
  page: number
  limit: number
}

export interface ExploreEntry {
  username: string
  avatarUrl: string
  fishCount: number
  languageCount: number
  totalStars: number
  legendaryCount: number
  topSpecies: FishSpecies[]
  lastUpdated: string
}

// ===== Token Encryption =====
export interface EncryptedToken {
  ciphertext: string
  iv: string
  authTag: string
}

// ===== GitHub Action =====
export interface AquariumActionConfig {
  username: string
  badgeStyle: 'flat' | 'flat-square' | 'for-the-badge'
  outputPath: string
  cronSchedule: string
}
