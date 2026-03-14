import { createSupabaseBrowserClient } from '@/lib/auth/supabase'
import type { AquariumEvent } from '@/types/webhook'
import type { RealtimeChannel } from '@supabase/supabase-js'

let channel: RealtimeChannel | null = null

export function subscribeToAquariumEvents(
  username: string,
  onEvent: (event: AquariumEvent) => void,
): (() => void) | null {
  const supabase = createSupabaseBrowserClient()
  if (!supabase) return null

  channel = supabase
    .channel(`aquarium:${username}`)
    .on(
      'postgres_changes',
      {
        event: 'INSERT',
        schema: 'public',
        table: 'aquarium_events',
        filter: `username=eq.${username}`,
      },
      (payload) => {
        const row = payload.new as Record<string, unknown>
        const event: AquariumEvent = {
          id: String(row['id'] ?? ''),
          type: String(row['type'] ?? '') as AquariumEvent['type'],
          fishId: row['fish_id'] ? String(row['fish_id']) : null,
          repoName: String(row['repo_name'] ?? ''),
          username: String(row['username'] ?? ''),
          message: String(row['message'] ?? ''),
          timestamp: String(row['created_at'] ?? new Date().toISOString()),
          metadata: (row['metadata'] as Record<string, unknown>) ?? {},
        }
        onEvent(event)
      },
    )
    .subscribe()

  return () => {
    if (channel) {
      supabase.removeChannel(channel)
      channel = null
    }
  }
}
