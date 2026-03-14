'use client'

import { useState, useEffect } from 'react'
import { GuestbookEntry } from './GuestbookEntry'
import type { GuestbookEntry as GuestbookEntryType } from '@/lib/social/guestbook'

interface GuestbookProps {
  username: string
}

export function Guestbook({ username }: GuestbookProps) {
  const [entries, setEntries] = useState<GuestbookEntryType[]>([])
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)
  const [hasMore, setHasMore] = useState(false)

  useEffect(() => {
    async function fetchEntries() {
      setLoading(true)
      try {
        const res = await fetch(`/api/guestbook/${username}?page=${page}`)
        if (res.ok) {
          const data = await res.json()
          setEntries((prev) =>
            page === 1 ? data.entries : [...prev, ...data.entries],
          )
          setHasMore(data.hasMore)
        }
      } finally {
        setLoading(false)
      }
    }
    fetchEntries()
  }, [username, page])

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-white">Guestbook</h3>

      {entries.length === 0 && !loading && (
        <p className="text-sm text-gray-500">
          No messages yet. Visit and leave a message!
        </p>
      )}

      <div className="space-y-2">
        {entries.map((entry) => (
          <GuestbookEntry key={entry.id} entry={entry} />
        ))}
      </div>

      {loading && (
        <div className="flex justify-center py-4">
          <div className="h-6 w-6 animate-spin rounded-full border-2 border-cyan-500 border-t-transparent" />
        </div>
      )}

      {hasMore && !loading && (
        <button
          onClick={() => setPage((p) => p + 1)}
          className="w-full rounded-lg border border-white/20 py-2 text-sm text-gray-400 hover:border-cyan-500 hover:text-cyan-400"
        >
          Load More
        </button>
      )}
    </div>
  )
}
