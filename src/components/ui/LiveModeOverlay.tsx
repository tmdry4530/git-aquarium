'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

interface LiveModeOverlayProps {
  obsMode: boolean
  chromaKeyColor: string | null
}

function Clock() {
  const [time, setTime] = useState(new Date())

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000)
    return () => clearInterval(timer)
  }, [])

  return (
    <div className="text-lg font-mono text-white/80 tabular-nums">
      {time.toLocaleTimeString()}
    </div>
  )
}

export function LiveModeOverlay({
  obsMode,
  chromaKeyColor,
}: LiveModeOverlayProps) {
  const [uiVisible, setUiVisible] = useState(true)
  const idleTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const resetIdleTimer = useCallback(() => {
    setUiVisible(true)
    if (idleTimerRef.current) clearTimeout(idleTimerRef.current)
    idleTimerRef.current = setTimeout(() => setUiVisible(false), 10000)
  }, [])

  useEffect(() => {
    const handleMouseMove = () => resetIdleTimer()

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'f' || e.key === 'F') {
        if (document.fullscreenElement) {
          document.exitFullscreen()
        } else {
          document.documentElement.requestFullscreen()
        }
      }
      if (e.key === 'h' || e.key === 'H') {
        setUiVisible((v) => !v)
      }
    }

    window.addEventListener('mousemove', handleMouseMove)
    window.addEventListener('keydown', handleKeyDown)

    idleTimerRef.current = setTimeout(() => setUiVisible(false), 10000)

    return () => {
      window.removeEventListener('mousemove', handleMouseMove)
      window.removeEventListener('keydown', handleKeyDown)
      if (idleTimerRef.current) clearTimeout(idleTimerRef.current)
    }
  }, [resetIdleTimer])

  useEffect(() => {
    if (chromaKeyColor) {
      document.documentElement.style.background = chromaKeyColor
    }
    return () => {
      document.documentElement.style.background = ''
    }
  }, [chromaKeyColor])

  if (obsMode) return null

  return (
    <AnimatePresence>
      {uiVisible && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
        >
          <div className="fixed right-4 top-4 z-50">
            <Clock />
          </div>
          <div className="fixed bottom-4 right-4 z-50">
            <p className="text-xs text-white/40">
              F: Fullscreen | H: Toggle UI
            </p>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
