'use client'

import { useUIStore } from '@/stores/ui'
import { useReducedMotion } from '@/lib/utils/reduced-motion'

function AccessibilityPanel() {
  const systemReducedMotion = useReducedMotion()
  const {
    reducedMotion,
    colorBlindMode,
    toggleReducedMotion,
    toggleColorBlindMode,
  } = useUIStore()

  const isMotionReduced = systemReducedMotion || reducedMotion

  return (
    <section
      aria-label="Accessibility settings"
      className="flex flex-col gap-3 p-4 rounded-xl border border-primary/20 bg-[rgba(5,15,35,0.85)]"
    >
      <h2 className="text-foreground/60 text-xs font-mono uppercase tracking-widest">
        Accessibility
      </h2>

      {/* Reduced motion toggle */}
      <label className="flex items-center justify-between gap-4 cursor-pointer">
        <span className="text-foreground text-sm font-mono">Reduce motion</span>
        <button
          type="button"
          role="switch"
          aria-checked={isMotionReduced}
          onClick={toggleReducedMotion}
          className={`relative w-10 h-5 rounded-full transition-colors ${
            isMotionReduced ? 'bg-primary' : 'bg-foreground/20'
          }`}
        >
          <span
            className={`absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white transition-transform ${
              isMotionReduced ? 'translate-x-5' : 'translate-x-0'
            }`}
          />
          <span className="sr-only">
            {isMotionReduced ? 'Disable' : 'Enable'} reduced motion
          </span>
        </button>
      </label>

      {systemReducedMotion && (
        <p className="text-foreground/40 text-xs font-mono">
          Enabled by system preference
        </p>
      )}

      {/* Color-blind mode toggle */}
      <label className="flex items-center justify-between gap-4 cursor-pointer">
        <span className="text-foreground text-sm font-mono">
          Color-blind mode
        </span>
        <button
          type="button"
          role="switch"
          aria-checked={colorBlindMode}
          onClick={toggleColorBlindMode}
          className={`relative w-10 h-5 rounded-full transition-colors ${
            colorBlindMode ? 'bg-primary' : 'bg-foreground/20'
          }`}
        >
          <span
            className={`absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white transition-transform ${
              colorBlindMode ? 'translate-x-5' : 'translate-x-0'
            }`}
          />
          <span className="sr-only">
            {colorBlindMode ? 'Disable' : 'Enable'} color-blind mode
          </span>
        </button>
      </label>
    </section>
  )
}

export { AccessibilityPanel }
