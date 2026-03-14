import { getSupabaseAdmin } from '@/lib/auth/supabase'
import type { Kudo, KudoType } from '@/types/social'

const DAILY_KUDO_LIMIT = 10
const DAILY_KUDO_PER_RECEIVER_LIMIT = 3

export const KUDO_TYPES: Record<
  KudoType,
  { emoji: string; label: string; description: string }
> = {
  star: { emoji: '\u2B50', label: 'Star', description: 'Great repository!' },
  bug: {
    emoji: '\uD83D\uDC1B',
    label: 'Bug Report',
    description: 'Found a bug - keep improving!',
  },
  idea: {
    emoji: '\uD83D\uDCA1',
    label: 'Idea',
    description: 'Inspiring project!',
  },
}

export async function giveKudo(
  giverId: string,
  receiverUsername: string,
  fishId: string,
  kudoType: KudoType,
): Promise<Kudo> {
  const supabase = getSupabaseAdmin()
  if (!supabase) throw new Error('Supabase not configured')

  const { data: giver } = await supabase
    .from('users')
    .select('username')
    .eq('id', giverId)
    .single()

  if (giver?.username === receiverUsername) {
    throw new Error('Cannot give kudos to yourself')
  }

  const todayStart = new Date()
  todayStart.setHours(0, 0, 0, 0)

  const { count } = await supabase
    .from('kudos')
    .select('*', { count: 'exact', head: true })
    .eq('giver_id', giverId)
    .gte('created_at', todayStart.toISOString())

  if ((count ?? 0) >= DAILY_KUDO_LIMIT) {
    throw new Error(`Daily kudo limit reached (${DAILY_KUDO_LIMIT}/day)`)
  }

  const { count: receiverCount } = await supabase
    .from('kudos')
    .select('*', { count: 'exact', head: true })
    .eq('giver_id', giverId)
    .eq('receiver_username', receiverUsername)
    .gte('created_at', todayStart.toISOString())

  if ((receiverCount ?? 0) >= DAILY_KUDO_PER_RECEIVER_LIMIT) {
    throw new Error(
      `Daily kudo limit per user reached (${DAILY_KUDO_PER_RECEIVER_LIMIT}/day per receiver)`,
    )
  }

  const { data, error } = await supabase
    .from('kudos')
    .insert({
      giver_id: giverId,
      receiver_username: receiverUsername,
      fish_id: fishId,
      kudo_type: kudoType,
    })
    .select()
    .single()

  if (error) throw error
  return data as unknown as Kudo
}

export async function getKudosForFish(
  receiverUsername: string,
  fishId: string,
): Promise<{ total: number; byType: Record<KudoType, number> }> {
  const supabase = getSupabaseAdmin()
  if (!supabase) return { total: 0, byType: { star: 0, bug: 0, idea: 0 } }

  const { data, error } = await supabase
    .from('kudos')
    .select('kudo_type')
    .eq('receiver_username', receiverUsername)
    .eq('fish_id', fishId)

  if (error) throw error

  const byType: Record<KudoType, number> = { star: 0, bug: 0, idea: 0 }
  for (const row of data ?? []) {
    byType[row.kudo_type as KudoType]++
  }

  return {
    total: (data ?? []).length,
    byType,
  }
}

export async function getRemainingKudos(giverId: string): Promise<number> {
  const supabase = getSupabaseAdmin()
  if (!supabase) return DAILY_KUDO_LIMIT

  const todayStart = new Date()
  todayStart.setHours(0, 0, 0, 0)

  const { count } = await supabase
    .from('kudos')
    .select('*', { count: 'exact', head: true })
    .eq('giver_id', giverId)
    .gte('created_at', todayStart.toISOString())

  return DAILY_KUDO_LIMIT - (count ?? 0)
}
