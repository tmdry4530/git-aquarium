type AnalyticsEvents = {
  aquarium_created: {
    username: string
    fish_count: number
    load_time: number
  }
  fish_clicked: {
    repo_name: string
    species: string
    evolution_stage: string
  }
  share_initiated: {
    method: 'url' | 'twitter' | 'gif'
  }
  share_completed: {
    method: 'url' | 'twitter' | 'gif'
    success: boolean
  }
  codex_opened: {
    completion_percent: number
  }
  comparison_created: {
    user1: string
    user2: string
  }
  session_duration: {
    seconds: number
    fish_hovered_count: number
  }
  fallback_triggered: {
    type: '2d' | 'static' | 'text'
  }
  error_occurred: {
    error_type: string
    context: string
  }
}

function track<K extends keyof AnalyticsEvents>(
  event: K,
  props: AnalyticsEvents[K],
): void {
  // Placeholder: integrate PostHog or Plausible in Phase 2
  if (process.env.NODE_ENV === 'development') {
    console.warn('[analytics]', event, props)
  }
}

export { track }
export type { AnalyticsEvents }
