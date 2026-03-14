'use client'

import { useState, useCallback } from 'react'
import { TimeSlider } from '@/components/ui/TimeSlider'
import { TimelapseGenerator } from '@/components/ui/TimelapseGenerator'
import { createTimelapseBlob } from '@/lib/timeline/timelapse'
import type { TimelineSnapshot } from '@/types/webhook'

interface HistoryClientProps {
  username: string
  snapshots: TimelineSnapshot[]
}

export function HistoryClient({ username, snapshots }: HistoryClientProps) {
  const [currentSnapshot, setCurrentSnapshot] =
    useState<TimelineSnapshot | null>(snapshots[snapshots.length - 1] ?? null)

  const handleSnapshotChange = useCallback((snapshot: TimelineSnapshot) => {
    setCurrentSnapshot(snapshot)
  }, [])

  const handleGenerateTimelapse = useCallback(async () => {
    // Client-side timelapse is a stub — returns a placeholder blob
    const textEncoder = new TextEncoder()
    const placeholder = textEncoder.encode('timelapse-placeholder')
    return createTimelapseBlob([placeholder])
  }, [])

  const currentYear = new Date().getFullYear()

  return (
    <div className="relative min-h-screen bg-gradient-to-b from-slate-900 to-blue-950">
      <div className="mx-auto max-w-4xl px-4 py-12">
        <h1 className="mb-8 text-3xl font-bold text-white">
          {username}&apos;s Aquarium History
        </h1>

        {currentSnapshot && (
          <div className="mb-8 rounded-xl bg-black/30 p-6 backdrop-blur-sm">
            <h2 className="mb-4 text-xl font-semibold text-white">
              {currentSnapshot.timestamp}
            </h2>
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <p className="text-3xl font-bold text-blue-400">
                  {currentSnapshot.fishCount}
                </p>
                <p className="text-sm text-white/60">Fish</p>
              </div>
              <div>
                <p className="text-3xl font-bold text-yellow-400">
                  {currentSnapshot.totalStars}
                </p>
                <p className="text-sm text-white/60">Stars</p>
              </div>
              <div>
                <p className="text-3xl font-bold text-green-400">
                  {currentSnapshot.topLanguages.length}
                </p>
                <p className="text-sm text-white/60">Languages</p>
              </div>
            </div>
            {currentSnapshot.topLanguages.length > 0 && (
              <div className="mt-4 flex flex-wrap gap-2">
                {currentSnapshot.topLanguages.map((lang) => (
                  <span
                    key={lang}
                    className="rounded-full bg-white/10 px-3 py-1 text-xs text-white/70"
                  >
                    {lang}
                  </span>
                ))}
              </div>
            )}
          </div>
        )}

        <div className="mb-8">
          <TimelapseGenerator
            username={username}
            year={currentYear}
            onGenerate={handleGenerateTimelapse}
          />
        </div>
      </div>

      {snapshots.length > 0 && (
        <TimeSlider
          snapshots={snapshots}
          onSnapshotChange={handleSnapshotChange}
        />
      )}
    </div>
  )
}
