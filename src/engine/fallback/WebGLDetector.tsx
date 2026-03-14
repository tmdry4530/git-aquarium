'use client'

import { useState } from 'react'

type WebGLSupport = 'webgl2' | 'webgl' | 'canvas2d' | 'none' | 'checking'

function detectWebGLSupport(): WebGLSupport {
  try {
    const canvas = document.createElement('canvas')

    const gl2 = canvas.getContext('webgl2')
    if (gl2) {
      gl2.getExtension('WEBGL_lose_context')?.loseContext()
      return 'webgl2'
    }

    const gl =
      canvas.getContext('webgl') ??
      (canvas.getContext('experimental-webgl') as WebGLRenderingContext | null)
    if (gl) return 'webgl'

    if (canvas.getContext('2d')) return 'canvas2d'
  } catch {
    // Detection failed
  }
  return 'none'
}

function useWebGLSupport(): WebGLSupport {
  const [support] = useState<WebGLSupport>(() => {
    if (typeof window === 'undefined') return 'checking'
    return detectWebGLSupport()
  })

  return support
}

export { useWebGLSupport, detectWebGLSupport }
export type { WebGLSupport }
