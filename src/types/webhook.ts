export type WebhookEventType =
  | 'push'
  | 'star'
  | 'fork'
  | 'issues_opened'
  | 'issues_closed'
  | 'pull_request_merged'
  | 'pull_request_rejected'
  | 'create_repo'
  | 'delete_repo'
  | 'release'

export interface WebhookPayload {
  event: WebhookEventType
  repository: {
    name: string
    full_name: string
    language: string | null
  }
  sender: {
    login: string
    avatar_url: string
  }
  timestamp: string
  details: Record<string, unknown>
}

export type AquariumEventType =
  | 'feed'
  | 'starlight'
  | 'birth'
  | 'ripple'
  | 'heal'
  | 'swim_together'
  | 'flee'
  | 'egg_spawn'
  | 'dissolve'
  | 'level_up'

export interface AquariumEvent {
  id: string
  type: AquariumEventType
  fishId: string | null
  repoName: string
  username: string
  message: string
  timestamp: string
  metadata: Record<string, unknown>
}

export interface EventAnimation {
  type: AquariumEventType
  duration: number
  particleCount: number
  color: string
  intensity: number
  sound: string | null
}

export interface EventFeedItem {
  id: string
  icon: string
  message: string
  timestamp: string
  isNew: boolean
}

export interface LiveModeConfig {
  showClock: boolean
  showEventFeed: boolean
  showMinimalHUD: boolean
  autoHideUI: boolean
  autoHideDelay: number
  obsMode: boolean
  chromaKeyColor: string | null
}

export interface YearRecapData {
  year: number
  username: string
  newFishCount: number
  topGrownFish: {
    fishId: string
    repoName: string
    commitGrowth: number
  }
  totalKudos: number
  languageDistribution: Record<string, number>
  peakActivityMonth: number
  achievementsUnlocked: string[]
  mostActiveRepo: string
}

export interface RecapCard {
  id: string
  title: string
  content: YearRecapData
  shareImageUrl: string | null
}

export interface TimelineSnapshot {
  id: string
  username: string
  timestamp: string
  fishCount: number
  topLanguages: string[]
  totalStars: number
  data: Record<string, unknown>
}

export interface TimeTravelState {
  isActive: boolean
  currentDate: string
  snapshots: TimelineSnapshot[]
  playbackSpeed: number
  isPlaying: boolean
}
