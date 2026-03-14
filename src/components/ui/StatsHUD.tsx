'use client'

import { useState } from 'react'
import { useTranslations } from 'next-intl'
import { useAquariumStore } from '@/stores/aquarium'

function StatsHUD() {
  const t = useTranslations('hud')
  const [visible, setVisible] = useState(true)
  const data = useAquariumStore((s) => s.data)

  if (!data) return null

  const { stats, user } = data

  return (
    <>
      {/* Toggle button */}
      <button
        onClick={() => setVisible((v) => !v)}
        aria-label={visible ? 'Hide HUD' : 'Show HUD'}
        className="fixed top-4 left-4 z-30 w-8 h-8 rounded-full border border-primary/40 bg-[rgba(5,15,35,0.85)] text-primary text-xs flex items-center justify-center hover:border-primary transition-colors"
      >
        {visible ? '−' : '+'}
      </button>

      {/* HUD panel */}
      {visible && (
        <aside
          className="fixed top-14 left-4 z-20 rounded-xl border border-primary/20 bg-[rgba(5,15,35,0.85)] backdrop-blur-sm p-3 md:p-4 min-w-[140px] md:min-w-[180px]"
          aria-label="Aquarium stats"
        >
          {/* Username */}
          <p className="text-primary font-mono text-xs md:text-sm font-bold mb-2 truncate">
            @{user.username}
          </p>

          <div className="flex flex-col gap-1 text-xs md:text-sm font-mono">
            <StatRow
              label={t('alive')}
              value={stats.aliveFish}
              color="text-primary"
            />
            <StatRow
              label={t('fossil')}
              value={stats.fossilFish}
              color="text-foreground/50"
            />
            <StatRow
              label={t('stars')}
              value={stats.totalStars}
              color="text-accent"
            />

            {stats.topLanguage && (
              <div className="mt-1 pt-1 border-t border-primary/20">
                <span className="text-foreground/50 text-[10px] uppercase tracking-wide">
                  Top
                </span>
                <p className="text-primary truncate text-xs">
                  {stats.topLanguage}
                </p>
              </div>
            )}
          </div>
        </aside>
      )}
    </>
  )
}

function StatRow({
  label,
  value,
  color,
}: {
  label: string
  value: number
  color: string
}) {
  return (
    <div className="flex items-center justify-between gap-4">
      <span className="text-foreground/60 text-[10px] uppercase tracking-wide">
        {label}
      </span>
      <span className={`${color} font-semibold tabular-nums`}>
        {value.toLocaleString()}
      </span>
    </div>
  )
}

export { StatsHUD }
