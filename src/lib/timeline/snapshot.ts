import { getSupabaseAdmin } from '@/lib/auth/supabase'
import type { AquariumData } from '@/types/aquarium'
import type { TimelineSnapshot } from '@/types/webhook'
import type { SnapshotRow } from './types'

export async function saveSnapshot(
  username: string,
  data: AquariumData,
): Promise<void> {
  const supabase = getSupabaseAdmin()
  if (!supabase) return

  const topLanguages = Object.entries(data.stats.languageDistribution)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 5)
    .map(([lang]) => lang)

  await supabase.from('aquarium_snapshots').upsert(
    {
      username,
      snapshot_date: new Date().toISOString().split('T')[0],
      fish_count: data.fish.length,
      top_languages: topLanguages,
      total_stars: data.stats.totalStars,
      data,
    },
    { onConflict: 'username,snapshot_date' },
  )
}

export async function getSnapshots(
  username: string,
  startDate: string,
  endDate: string,
): Promise<TimelineSnapshot[]> {
  const supabase = getSupabaseAdmin()
  if (!supabase) return []

  const { data } = await supabase
    .from('aquarium_snapshots')
    .select('*')
    .eq('username', username)
    .gte('snapshot_date', startDate)
    .lte('snapshot_date', endDate)
    .order('snapshot_date', { ascending: true })

  if (!data) return []

  return (data as SnapshotRow[]).map((row) => ({
    id: row.id,
    username: row.username,
    timestamp: row.snapshot_date,
    fishCount: row.fish_count,
    topLanguages: row.top_languages,
    totalStars: row.total_stars,
    data: row.data,
  }))
}
