import { getSupabaseAdmin } from '@/lib/auth/supabase'
import type { Visit, VisitorFishData } from '@/types/social'

const MAX_GUEST_FISH = 5
const VISIT_COOLDOWN_MS = 3600000

export async function recordVisit(
  visitorId: string,
  hostUsername: string,
  visitorFish: VisitorFishData,
  message?: string,
): Promise<Visit> {
  const supabase = getSupabaseAdmin()
  if (!supabase) throw new Error('Supabase not configured')

  const { data: recentVisit } = await supabase
    .from('visits')
    .select('created_at')
    .eq('visitor_id', visitorId)
    .eq('host_username', hostUsername)
    .order('created_at', { ascending: false })
    .limit(1)
    .single()

  if (recentVisit) {
    const elapsed = Date.now() - new Date(recentVisit.created_at).getTime()
    if (elapsed < VISIT_COOLDOWN_MS) {
      throw new Error('Visit cooldown active. Try again later.')
    }
  }

  const { data, error } = await supabase
    .from('visits')
    .insert({
      visitor_id: visitorId,
      host_username: hostUsername,
      visitor_fish: visitorFish,
      message: message?.slice(0, 200),
    })
    .select()
    .single()

  if (error) throw error
  return data as unknown as Visit
}

export async function getRecentVisitors(
  hostUsername: string,
  limit: number = MAX_GUEST_FISH,
): Promise<Visit[]> {
  const supabase = getSupabaseAdmin()
  if (!supabase) return []

  const { data, error } = await supabase
    .from('visits')
    .select(
      `
      *,
      visitor:users!visitor_id (username, avatar_url)
    `,
    )
    .eq('host_username', hostUsername)
    .order('created_at', { ascending: false })
    .limit(limit)

  if (error) throw error
  return (data ?? []) as unknown as Visit[]
}
