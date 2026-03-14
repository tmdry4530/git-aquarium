import type { FishData } from './fish'

export type AquariumLoadState = 'idle' | 'loading' | 'ready' | 'error'

export interface AquariumError {
  code: string
  message: string
  status?: number
}

export interface AquariumUser {
  username: string
  displayName: string | null
  avatarUrl: string
  bio: string | null
  followers: number
  accountAge: number // 년 단위
}

export interface EnvironmentData {
  tankSize: 'small' | 'medium' | 'large' | 'vast'
  brightness: number // 0.0 ~ 1.0 (팔로워 기반)
  terrainHeights: number[] // 52주 컨트리뷰션 → 높이 배열
  currentStrength: number // 해류 강도 (streak 기반)
  timeOfDay: 'dawn' | 'day' | 'dusk' | 'night'
  depth: 'shallow' | 'mid' | 'deep' | 'abyss'
}

export interface AquariumStats {
  totalFish: number
  aliveFish: number
  fossilFish: number
  totalStars: number
  languageDistribution: Record<string, number>
  topLanguage: string | null
  largestFish: string | null // repo name
}

export interface AquariumData {
  user: AquariumUser
  fish: FishData[]
  environment: EnvironmentData
  stats: AquariumStats
  generatedAt: string
}
