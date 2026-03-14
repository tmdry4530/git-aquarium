export interface SnapshotRow {
  id: string
  username: string
  snapshot_date: string
  fish_count: number
  top_languages: string[]
  total_stars: number
  data: Record<string, unknown>
  created_at: string
}

export interface TimelapseConfig {
  username: string
  startDate: string
  endDate: string
  fps: number
  frameDuration: number
  resolution: {
    width: number
    height: number
  }
}
