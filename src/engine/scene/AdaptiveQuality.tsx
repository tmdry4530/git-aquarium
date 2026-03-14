'use client'

import { useRef } from 'react'
import { useFrame, useThree } from '@react-three/fiber'

type QualityLevel = 'high' | 'medium' | 'low'

interface QualityState {
  level: QualityLevel
  fpsAccumulator: number
  frameCount: number
  lastCheck: number
  stabilityTimer: number
}

// Exported for external use (e.g., particle count scaling)
let currentQualityLevel: QualityLevel = 'high'

function getQualityLevel(): QualityLevel {
  return currentQualityLevel
}

function getQualityMultiplier(): number {
  switch (currentQualityLevel) {
    case 'high':
      return 1.0
    case 'medium':
      return 0.6
    case 'low':
      return 0.3
  }
}

function AdaptiveQuality() {
  const { gl } = useThree()

  const state = useRef<QualityState>({
    level: 'high',
    fpsAccumulator: 0,
    frameCount: 0,
    lastCheck: 0,
    stabilityTimer: 0,
  })

  useFrame((r3fState, delta) => {
    const s = state.current
    s.fpsAccumulator += delta
    s.frameCount++

    // Check every 1 second
    if (s.fpsAccumulator < 1) return

    const avgFps = s.frameCount / s.fpsAccumulator
    s.fpsAccumulator = 0
    s.frameCount = 0

    const prevLevel = s.level

    if (avgFps < 25 && s.level !== 'low') {
      s.level = 'low'
      s.stabilityTimer = 0
    } else if (avgFps < 40 && s.level === 'high') {
      s.level = 'medium'
      s.stabilityTimer = 0
    } else if (avgFps > 55 && s.level !== 'high') {
      // Wait 3 seconds of stable high FPS before upgrading
      s.stabilityTimer += 1
      if (s.stabilityTimer >= 3) {
        s.level = s.level === 'low' ? 'medium' : 'high'
        s.stabilityTimer = 0
      }
    } else {
      s.stabilityTimer = 0
    }

    if (prevLevel !== s.level) {
      currentQualityLevel = s.level

      // Adjust pixel ratio based on quality
      switch (s.level) {
        case 'high':
          gl.setPixelRatio(Math.min(window.devicePixelRatio, 2))
          break
        case 'medium':
          gl.setPixelRatio(Math.min(window.devicePixelRatio, 1.5))
          break
        case 'low':
          gl.setPixelRatio(1)
          break
      }
    }
  })

  return null
}

export { AdaptiveQuality, getQualityLevel, getQualityMultiplier }
