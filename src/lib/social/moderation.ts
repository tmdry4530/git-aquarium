import { getSupabaseAdmin } from '@/lib/auth/supabase'
import type { ReportReason } from '@/types/social'

const VALID_REASONS: ReportReason[] = [
  'spam',
  'harassment',
  'inappropriate',
  'other',
]

export async function createReport(
  reporterId: string,
  targetType: 'guestbook' | 'username' | 'message',
  targetId: string,
  reason: ReportReason,
  description?: string,
): Promise<{ id: string }> {
  if (!VALID_REASONS.includes(reason)) {
    throw new Error('Invalid report reason')
  }

  const supabase = getSupabaseAdmin()
  if (!supabase) throw new Error('Supabase not configured')

  const { data, error } = await supabase
    .from('reports')
    .insert({
      reporter_id: reporterId,
      target_type: targetType,
      target_id: targetId,
      reason,
      description: description?.slice(0, 500),
    })
    .select('id')
    .single()

  if (error) throw error
  return { id: (data as { id: string }).id }
}
