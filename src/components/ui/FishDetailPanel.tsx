'use client'

import { useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useAquariumStore } from '@/stores/aquarium'
import { useUIStore } from '@/stores/ui'

function FishDetailPanel() {
  const detailPanelOpen = useUIStore((s) => s.detailPanelOpen)
  const toggleDetailPanel = useUIStore((s) => s.toggleDetailPanel)
  const selectedFishId = useAquariumStore((s) => s.selectedFishId)
  const fish = useAquariumStore(
    (s) => s.data?.fish.find((f) => f.id === s.selectedFishId) ?? null,
  )
  const selectFish = useAquariumStore((s) => s.selectFish)

  const handleClose = useCallback(() => {
    toggleDetailPanel(false)
    selectFish(null)
  }, [toggleDetailPanel, selectFish])

  // Open panel when a fish is selected
  useEffect(() => {
    if (selectedFishId && fish) toggleDetailPanel(true)
  }, [selectedFishId, fish, toggleDetailPanel])

  // Close on ESC
  useEffect(() => {
    if (!detailPanelOpen) return
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') handleClose()
    }
    document.addEventListener('keydown', handler)
    return () => document.removeEventListener('keydown', handler)
  }, [detailPanelOpen, handleClose])

  return (
    <AnimatePresence>
      {detailPanelOpen && fish && (
        <>
          {/* Backdrop */}
          <motion.div
            className="fixed inset-0 z-40 bg-black/20 pointer-events-auto"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleClose}
            onPointerDown={handleClose}
            aria-hidden
          />

          {/* Panel */}
          <motion.aside
            className="fixed right-0 top-0 h-full z-50 w-80 border-l border-primary/20 bg-[rgba(5,15,35,0.96)] backdrop-blur-md p-6 overflow-y-auto"
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
            role="complementary"
            aria-label="Fish detail panel"
          >
            <button
              onClick={handleClose}
              aria-label="Close fish detail panel"
              className="absolute top-4 right-4 w-8 h-8 rounded-full border border-primary/30 text-foreground/60 hover:text-primary hover:border-primary transition-colors flex items-center justify-center text-sm"
            >
              ×
            </button>

            {/* Fish avatar */}
            <div className="mb-5">
              <div
                className="w-10 h-10 rounded-full mb-3 ring-2 ring-primary/30"
                style={{ backgroundColor: fish.color }}
                aria-hidden
              />
              <h2 className="text-primary font-mono font-bold text-base break-all leading-tight">
                {fish.repoName}
              </h2>
              {fish.description && (
                <p className="text-foreground/60 text-xs mt-1.5 leading-relaxed line-clamp-3">
                  {fish.description}
                </p>
              )}
            </div>

            {/* Stats */}
            <dl className="space-y-2.5 text-xs font-mono mb-6 border-t border-primary/10 pt-4">
              <DetailRow label="Species" value={fish.species} />
              <DetailRow label="Evolution" value={fish.evolutionStage} />
              <DetailRow label="Language" value={fish.language ?? 'Unknown'} />
              <DetailRow
                label="Stars"
                value={`★ ${fish.stars.toLocaleString()}`}
              />
              <DetailRow
                label="Forks"
                value={`⑂ ${fish.forks.toLocaleString()}`}
              />
              <DetailRow
                label="Commits"
                value={fish.totalCommits.toLocaleString()}
              />
              <DetailRow
                label="Open Issues"
                value={fish.openIssues.toLocaleString()}
              />
              <DetailRow label="README" value={fish.hasReadme ? 'Yes' : 'No'} />
              <DetailRow
                label="License"
                value={fish.hasLicense ? 'Yes' : 'No'}
              />
            </dl>

            {/* CTA */}
            <a
              href={fish.repoUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="block w-full text-center py-2.5 rounded-lg border border-primary/40 text-primary hover:bg-primary/10 transition-colors font-mono text-sm"
            >
              View on GitHub →
            </a>
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  )
}

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-start justify-between gap-4">
      <dt className="text-foreground/40 uppercase text-[9px] tracking-widest flex-shrink-0 mt-0.5">
        {label}
      </dt>
      <dd className="text-foreground/90 text-right">{value}</dd>
    </div>
  )
}

export { FishDetailPanel }
