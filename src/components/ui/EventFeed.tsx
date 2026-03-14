'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useEventStore } from '@/stores/events'
import type { EventFeedItem } from '@/types/webhook'

interface EventFeedProps {
  maxVisible?: number
}

function formatRelativeTime(timestamp: string): string {
  const diff = Date.now() - new Date(timestamp).getTime()
  const seconds = Math.floor(diff / 1000)
  if (seconds < 60) return `${seconds}s ago`
  const minutes = Math.floor(seconds / 60)
  if (minutes < 60) return `${minutes}m ago`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours}h ago`
  return `${Math.floor(hours / 24)}d ago`
}

function EventItem({ item }: { item: EventFeedItem }) {
  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="flex items-start gap-2 rounded-lg bg-black/40 px-3 py-2 backdrop-blur-sm"
    >
      <span className="text-base">{item.icon}</span>
      <div className="min-w-0 flex-1">
        <p className="truncate text-xs text-white/90">{item.message}</p>
        <p className="text-[10px] text-white/50">
          {formatRelativeTime(item.timestamp)}
        </p>
      </div>
    </motion.div>
  )
}

export function EventFeed({ maxVisible = 5 }: EventFeedProps) {
  const feedItems = useEventStore((s) => s.feedItems)
  const [collapsed, setCollapsed] = useState(false)

  if (feedItems.length === 0) return null

  const visibleItems = feedItems.slice(0, maxVisible)

  return (
    <div className="fixed bottom-4 left-4 z-50 w-72">
      <button
        onClick={() => setCollapsed(!collapsed)}
        className="mb-1 rounded px-2 py-0.5 text-xs text-white/60 hover:text-white/90"
      >
        {collapsed ? 'Show Events' : 'Hide Events'} ({feedItems.length})
      </button>
      <AnimatePresence>
        {!collapsed && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="flex flex-col gap-1"
          >
            <AnimatePresence mode="popLayout">
              {visibleItems.map((item) => (
                <EventItem key={item.id} item={item} />
              ))}
            </AnimatePresence>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
