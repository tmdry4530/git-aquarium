'use client'

import { useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { RecapCard } from './RecapCard'
import type { YearRecapData } from '@/types/webhook'

interface RecapCarouselProps {
  data: YearRecapData
  username: string
}

const GRADIENTS = [
  'from-blue-900 to-indigo-900',
  'from-purple-900 to-pink-900',
  'from-teal-900 to-cyan-900',
  'from-orange-900 to-red-900',
  'from-green-900 to-emerald-900',
  'from-violet-900 to-purple-900',
  'from-indigo-900 to-blue-900',
]

export function RecapCarousel({ data, username }: RecapCarouselProps) {
  const [current, setCurrent] = useState(0)
  const totalCards = 7

  const handleDragEnd = useCallback(
    (_: unknown, info: { offset: { x: number } }) => {
      if (info.offset.x < -50) {
        setCurrent((c) => Math.min(c + 1, totalCards - 1))
      }
      if (info.offset.x > 50) {
        setCurrent((c) => Math.max(c - 1, 0))
      }
    },
    [],
  )

  const handleShare = useCallback(async () => {
    const shareData = {
      title: `${username}'s ${data.year} Aquarium Recap`,
      text: `Check out my ${data.year} Git Aquarium recap! ${data.newFishCount} new fish, ${data.topGrownFish.commitGrowth} commits on ${data.topGrownFish.repoName}`,
      url: window.location.href,
    }

    if (navigator.share) {
      await navigator.share(shareData)
    } else {
      await navigator.clipboard.writeText(`${shareData.text}\n${shareData.url}`)
    }
  }, [username, data])

  const cards = [
    {
      title: `${data.year} Aquarium`,
      content: (
        <div className="space-y-4">
          <p className="text-6xl font-bold text-white">
            {data.newFishCount >= 0 ? '+' : ''}
            {data.newFishCount}
          </p>
          <p className="text-lg text-white/70">new fish this year</p>
        </div>
      ),
    },
    {
      title: 'Most Grown Fish',
      content: (
        <div className="space-y-4">
          <p className="text-3xl font-bold text-white">
            {data.topGrownFish.repoName}
          </p>
          <p className="text-5xl font-bold text-green-400">
            +{data.topGrownFish.commitGrowth}
          </p>
          <p className="text-lg text-white/70">commits</p>
        </div>
      ),
    },
    {
      title: 'Ocean of Diversity',
      content: (
        <div className="space-y-2">
          {Object.entries(data.languageDistribution)
            .sort(([, a], [, b]) => b - a)
            .slice(0, 5)
            .map(([lang, pct]) => (
              <div key={lang} className="flex items-center gap-3">
                <span className="w-20 text-right text-sm text-white/80">
                  {lang}
                </span>
                <div className="h-3 flex-1 overflow-hidden rounded-full bg-white/10">
                  <div
                    className="h-full rounded-full bg-blue-400"
                    style={{ width: `${pct}%` }}
                  />
                </div>
                <span className="w-12 text-sm text-white/60">{pct}%</span>
              </div>
            ))}
        </div>
      ),
    },
    {
      title: 'Busiest Month',
      content: (
        <div className="space-y-4">
          <p className="text-6xl font-bold text-white">
            {new Date(data.year, data.peakActivityMonth - 1).toLocaleString(
              'en',
              { month: 'long' },
            )}
          </p>
          <p className="text-lg text-white/70">was your most active month</p>
        </div>
      ),
    },
    {
      title: 'Total Kudos',
      content: (
        <div className="space-y-4">
          <p className="text-6xl font-bold text-yellow-400">
            {data.totalKudos}
          </p>
          <p className="text-lg text-white/70">kudos received</p>
        </div>
      ),
    },
    {
      title: 'Achievements',
      content: (
        <div className="space-y-4">
          {data.achievementsUnlocked.length > 0 ? (
            <div className="flex flex-wrap justify-center gap-3">
              {data.achievementsUnlocked.map((achievement) => (
                <span
                  key={achievement}
                  className="rounded-lg bg-white/10 px-3 py-1 text-sm text-white"
                >
                  {achievement}
                </span>
              ))}
            </div>
          ) : (
            <p className="text-lg text-white/50">
              Keep coding to unlock achievements!
            </p>
          )}
        </div>
      ),
    },
    {
      title: `My ${data.year} Aquarium`,
      content: (
        <div className="space-y-6">
          <div className="space-y-2 text-sm text-white/80">
            <p>
              {data.newFishCount} new fish | {data.mostActiveRepo} most active
            </p>
            <p>
              Peak month:{' '}
              {new Date(data.year, data.peakActivityMonth - 1).toLocaleString(
                'en',
                { month: 'short' },
              )}
            </p>
          </div>
          <button
            onClick={handleShare}
            className="rounded-lg bg-white/20 px-6 py-2 text-white hover:bg-white/30"
          >
            Share
          </button>
        </div>
      ),
    },
  ]

  return (
    <div className="flex flex-col items-center gap-6">
      <motion.div
        drag="x"
        dragConstraints={{ left: 0, right: 0 }}
        onDragEnd={handleDragEnd}
        className="cursor-grab active:cursor-grabbing"
      >
        <AnimatePresence mode="wait">
          <RecapCard
            key={current}
            title={cards[current]?.title ?? ''}
            gradient={GRADIENTS[current]}
          >
            {cards[current]?.content}
          </RecapCard>
        </AnimatePresence>
      </motion.div>

      <div className="flex gap-2">
        {cards.map((_, idx) => (
          <button
            key={idx}
            onClick={() => setCurrent(idx)}
            aria-label={`Go to slide ${idx + 1}`}
            className={`h-2 w-2 rounded-full transition-colors ${
              idx === current ? 'bg-white' : 'bg-white/30'
            }`}
          />
        ))}
      </div>

      <p className="text-sm text-white/40">
        {current + 1} / {totalCards} — Swipe to navigate
      </p>
    </div>
  )
}
