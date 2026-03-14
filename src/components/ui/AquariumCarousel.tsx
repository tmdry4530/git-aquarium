'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

interface CarouselItem {
  username: string
  avatarUrl: string
  fishCount: number
  totalStars: number
}

const FEATURED_AQUARIUMS: CarouselItem[] = [
  {
    username: 'torvalds',
    avatarUrl: 'https://github.com/torvalds.png',
    fishCount: 87,
    totalStars: 210000,
  },
  {
    username: 'gaearon',
    avatarUrl: 'https://github.com/gaearon.png',
    fishCount: 52,
    totalStars: 95000,
  },
  {
    username: 'yyx990803',
    avatarUrl: 'https://github.com/yyx990803.png',
    fishCount: 63,
    totalStars: 320000,
  },
  {
    username: 'sindresorhus',
    avatarUrl: 'https://github.com/sindresorhus.png',
    fishCount: 140,
    totalStars: 180000,
  },
  {
    username: 'antirez',
    avatarUrl: 'https://github.com/antirez.png',
    fishCount: 38,
    totalStars: 70000,
  },
]

function formatStars(n: number): string {
  if (n >= 1000) return `${(n / 1000).toFixed(0)}k`
  return String(n)
}

function AquariumCarousel() {
  const [index, setIndex] = useState(0)

  useEffect(() => {
    const timer = setInterval(() => {
      setIndex((i) => (i + 1) % FEATURED_AQUARIUMS.length)
    }, 3000)
    return () => clearInterval(timer)
  }, [])

  const item = FEATURED_AQUARIUMS[index]

  if (!item) return null

  return (
    <div className="w-full max-w-sm">
      <div className="relative overflow-hidden rounded-xl border border-primary/20 bg-[rgba(5,15,35,0.85)] p-4">
        <AnimatePresence mode="wait">
          <motion.a
            key={item.username}
            href={`/en/${item.username}`}
            className="flex items-center gap-3"
            initial={{ x: 60, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: -60, opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={item.avatarUrl}
              alt={item.username}
              className="w-10 h-10 rounded-full border border-primary/40"
            />
            <div className="flex flex-col">
              <span className="text-foreground font-mono text-sm font-semibold">
                @{item.username}
              </span>
              <span className="text-primary/70 text-xs">
                {item.fishCount} fish · {formatStars(item.totalStars)} ⭐
              </span>
            </div>
          </motion.a>
        </AnimatePresence>
      </div>

      {/* Dot navigation */}
      <div className="flex justify-center gap-1.5 mt-2">
        {FEATURED_AQUARIUMS.map((_, i) => (
          <button
            key={i}
            onClick={() => setIndex(i)}
            aria-label={`Show aquarium ${i + 1}`}
            className={`w-1.5 h-1.5 rounded-full transition-colors ${
              i === index ? 'bg-primary' : 'bg-primary/30'
            }`}
          />
        ))}
      </div>
    </div>
  )
}

export { AquariumCarousel }
