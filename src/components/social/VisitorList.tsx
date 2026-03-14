'use client'

import { useEffect } from 'react'
import { useSocialStore } from '@/stores/social'

interface VisitorListProps {
  username: string
}

export function VisitorList({ username }: VisitorListProps) {
  const { visitors, visitLoading, setVisitors, setVisitLoading } =
    useSocialStore()

  useEffect(() => {
    async function fetchVisitors() {
      setVisitLoading(true)
      try {
        const res = await fetch(`/api/visit?username=${username}`)
        if (res.ok) {
          const data = await res.json()
          setVisitors(data.visitors ?? [])
        }
      } finally {
        setVisitLoading(false)
      }
    }
    fetchVisitors()
  }, [username, setVisitors, setVisitLoading])

  if (visitLoading) {
    return (
      <div className="flex gap-2">
        {Array.from({ length: 3 }).map((_, i) => (
          <div
            key={i}
            className="h-8 w-8 animate-pulse rounded-full bg-white/10"
          />
        ))}
      </div>
    )
  }

  if (visitors.length === 0) return null

  return (
    <div className="space-y-2">
      <h4 className="text-xs font-medium uppercase tracking-wider text-gray-500">
        Recent Visitors
      </h4>
      <div className="flex -space-x-2">
        {visitors.slice(0, 5).map((visitor) => (
          <div
            key={visitor.id}
            className="relative h-8 w-8 rounded-full border-2 border-black bg-gray-700"
            title={visitor.visitorUsername}
          >
            {visitor.visitorAvatar && (
              <img
                src={visitor.visitorAvatar}
                alt={visitor.visitorUsername}
                className="h-full w-full rounded-full"
              />
            )}
          </div>
        ))}
        {visitors.length > 5 && (
          <div className="flex h-8 w-8 items-center justify-center rounded-full border-2 border-black bg-gray-700 text-xs text-gray-400">
            +{visitors.length - 5}
          </div>
        )}
      </div>
    </div>
  )
}
