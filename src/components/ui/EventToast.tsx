'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { useEventStore } from '@/stores/events'

export function EventToast() {
  const latestEvent = useEventStore((s) => s.feedItems[0] ?? null)

  return (
    <div className="fixed right-4 top-4 z-50">
      <AnimatePresence>
        {latestEvent && (
          <motion.div
            key={latestEvent.id}
            initial={{ opacity: 0, y: -20, x: 20 }}
            animate={{ opacity: 1, y: 0, x: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
            className="flex items-center gap-2 rounded-lg bg-black/60 px-4 py-3 shadow-lg backdrop-blur-md"
          >
            <span className="text-lg">{latestEvent.icon}</span>
            <p className="max-w-xs truncate text-sm text-white/90">
              {latestEvent.message}
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
