import { getSupabaseAdmin } from '@/lib/auth/supabase'

const MAX_MESSAGE_LENGTH = 200
const GUESTBOOK_PAGE_SIZE = 20

const PROFANITY_WORDS = ['spam', 'scam']

function filterProfanity(text: string): string {
  let result = text
  for (const word of PROFANITY_WORDS) {
    const regex = new RegExp(`\\b${word}\\b`, 'gi')
    result = result.replace(regex, '*'.repeat(word.length))
  }
  return result
}

export interface GuestbookResult {
  entries: GuestbookEntry[]
  totalCount: number
  hasMore: boolean
}

export interface GuestbookEntry {
  id: string
  message: string
  created_at: string
  visitor: {
    username: string
    avatar_url: string
    display_name: string
  }
}

export async function getGuestbookEntries(
  hostUsername: string,
  page: number = 1,
): Promise<GuestbookResult> {
  const supabase = getSupabaseAdmin()
  if (!supabase) {
    return { entries: [], totalCount: 0, hasMore: false }
  }

  const offset = (page - 1) * GUESTBOOK_PAGE_SIZE

  const { data, error, count } = await supabase
    .from('visits')
    .select(
      `
      id, message, created_at,
      visitor:users!visitor_id (username, avatar_url, display_name)
    `,
      { count: 'exact' },
    )
    .eq('host_username', hostUsername)
    .not('message', 'is', null)
    .order('created_at', { ascending: false })
    .range(offset, offset + GUESTBOOK_PAGE_SIZE - 1)

  if (error) throw error

  return {
    entries: (data ?? []) as unknown as GuestbookEntry[],
    totalCount: count ?? 0,
    hasMore: (count ?? 0) > offset + GUESTBOOK_PAGE_SIZE,
  }
}

export function validateMessage(message: string): string {
  const trimmed = message.trim()
  if (trimmed.length === 0) throw new Error('Message cannot be empty')
  if (trimmed.length > MAX_MESSAGE_LENGTH) {
    throw new Error(`Message must be ${MAX_MESSAGE_LENGTH} characters or less`)
  }
  return filterProfanity(trimmed)
}
