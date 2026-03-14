'use client'

import { useState, useCallback, useRef, useEffect } from 'react'
import { motion } from 'framer-motion'
import type { TimelineSnapshot } from '@/types/webhook'

interface TimeSliderProps {
  snapshots: TimelineSnapshot[]
  onSnapshotChange: (snapshot: TimelineSnapshot) => void
}

export function TimeSlider({ snapshots, onSnapshotChange }: TimeSliderProps) {
  const [currentIndex, setCurrentIndex] = useState(snapshots.length - 1)
  const [isPlaying, setIsPlaying] = useState(false)
  const [speed, setSpeed] = useState(1)
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const beforeUnloadRef = useRef<(() => void) | null>(null)

  useEffect(() => {
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current)
      if (beforeUnloadRef.current) {
        window.removeEventListener('beforeunload', beforeUnloadRef.current)
      }
    }
  }, [])

  const handleSliderChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const idx = Number(e.target.value)
      setCurrentIndex(idx)
      const snapshot = snapshots[idx]
      if (snapshot) {
        onSnapshotChange(snapshot)
      }
    },
    [snapshots, onSnapshotChange],
  )

  const togglePlay = useCallback(() => {
    if (isPlaying) {
      if (intervalRef.current) clearInterval(intervalRef.current)
      if (beforeUnloadRef.current) {
        window.removeEventListener('beforeunload', beforeUnloadRef.current)
      }
      intervalRef.current = null
      beforeUnloadRef.current = null
      setIsPlaying(false)
      return
    }
    setIsPlaying(true)
    let idx = currentIndex
    intervalRef.current = setInterval(() => {
      idx += 1
      if (idx >= snapshots.length) {
        if (intervalRef.current) clearInterval(intervalRef.current)
        if (beforeUnloadRef.current) {
          window.removeEventListener('beforeunload', beforeUnloadRef.current)
        }
        intervalRef.current = null
        beforeUnloadRef.current = null
        setIsPlaying(false)
        return
      }
      setCurrentIndex(idx)
      const snapshot = snapshots[idx]
      if (snapshot) {
        onSnapshotChange(snapshot)
      }
    }, 1000 / speed)

    const cleanup = () => {
      if (intervalRef.current) clearInterval(intervalRef.current)
      intervalRef.current = null
      beforeUnloadRef.current = null
      setIsPlaying(false)
    }
    beforeUnloadRef.current = cleanup
    window.addEventListener('beforeunload', cleanup, { once: true })
  }, [isPlaying, currentIndex, snapshots, onSnapshotChange, speed])

  const cycleSpeed = useCallback(() => {
    setSpeed((s) => {
      if (s === 1) return 2
      if (s === 2) return 4
      return 1
    })
  }, [])

  const currentSnapshot = snapshots[currentIndex]
  if (snapshots.length === 0) {
    return (
      <div className="rounded-lg bg-black/40 p-4 text-center text-white/60">
        No snapshots available
      </div>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="fixed bottom-0 left-0 right-0 z-50 bg-gradient-to-t from-black/80 to-transparent p-4"
    >
      <div className="mx-auto flex max-w-3xl items-center gap-4">
        <button
          onClick={togglePlay}
          className="flex h-10 w-10 items-center justify-center rounded-full bg-white/20 text-white hover:bg-white/30"
        >
          {isPlaying ? '\u23F8' : '\u25B6'}
        </button>

        <button
          onClick={cycleSpeed}
          className="rounded px-2 py-1 text-xs text-white/70 hover:text-white"
        >
          {speed}x
        </button>

        <input
          type="range"
          min={0}
          max={snapshots.length - 1}
          value={currentIndex}
          onChange={handleSliderChange}
          className="flex-1"
        />

        <div className="min-w-[100px] text-right text-sm text-white/80">
          {currentSnapshot?.timestamp ?? ''}
        </div>
      </div>

      <div className="mx-auto mt-2 flex max-w-3xl justify-between text-xs text-white/50">
        <span>{snapshots[0]?.timestamp ?? ''}</span>
        <span>
          {currentSnapshot
            ? `${currentSnapshot.fishCount} fish | ${currentSnapshot.totalStars} stars`
            : ''}
        </span>
        <span>{snapshots[snapshots.length - 1]?.timestamp ?? ''}</span>
      </div>
    </motion.div>
  )
}
