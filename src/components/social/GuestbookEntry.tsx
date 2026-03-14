import type { GuestbookEntry as GuestbookEntryType } from '@/lib/social/guestbook'

interface GuestbookEntryProps {
  entry: GuestbookEntryType
}

export function GuestbookEntry({ entry }: GuestbookEntryProps) {
  const timeAgo = getTimeAgo(entry.created_at)

  return (
    <div className="rounded-lg bg-white/5 p-3">
      <div className="mb-1 flex items-center gap-2">
        {entry.visitor?.avatar_url && (
          <img
            src={entry.visitor.avatar_url}
            alt={entry.visitor.username}
            className="h-6 w-6 rounded-full"
          />
        )}
        <span className="text-sm font-medium text-cyan-400">
          {entry.visitor?.username ?? 'Anonymous'}
        </span>
        <span className="text-xs text-gray-500">{timeAgo}</span>
      </div>
      <p className="text-sm text-gray-300">{entry.message}</p>
    </div>
  )
}

function getTimeAgo(dateStr: string): string {
  const seconds = Math.floor((Date.now() - new Date(dateStr).getTime()) / 1000)
  if (seconds < 60) return 'just now'
  const minutes = Math.floor(seconds / 60)
  if (minutes < 60) return `${minutes}m ago`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours}h ago`
  const days = Math.floor(hours / 24)
  return `${days}d ago`
}
