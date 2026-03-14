export interface ApiResponse<T> {
  data: T
  error: null
  status: number
}

export interface ApiErrorResponse {
  data: null
  error: {
    code: string
    message: string
    details?: unknown
  }
  status: number
}

export type ApiResult<T> = ApiResponse<T> | ApiErrorResponse

export interface PaginatedResponse<T> {
  items: T[]
  total: number
  page: number
  perPage: number
  hasNextPage: boolean
}

export interface LeaderboardEntry {
  rank: number
  username: string
  displayName: string | null
  avatarUrl: string
  totalStars: number
  totalFish: number
  legendaryCount: number
  codexCompletionPercent: number
}

export interface OgImageParams {
  username: string
  stats: {
    totalFish: number
    totalStars: number
    topLanguage: string | null
    legendaryCount: number
  }
}
