'use client'

import { useAquariumStore } from '@/stores/aquarium'

function CanvasFallback() {
  const data = useAquariumStore((s) => s.data)

  return (
    <div
      className="min-h-screen bg-[#0a1628] text-foreground flex flex-col items-center justify-center p-8"
      role="main"
    >
      <div className="max-w-2xl w-full font-mono">
        <p className="text-foreground/40 text-xs mb-6 uppercase tracking-widest">
          WebGL unavailable — text view
        </p>

        {data ? (
          <>
            <h1 className="text-2xl font-bold text-primary mb-6">
              @{data.user.username}&apos;s Aquarium
            </h1>

            {/* Stats */}
            <dl
              className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8 p-4 rounded-xl border border-primary/20 bg-[rgba(255,255,255,0.03)]"
              aria-label="Aquarium statistics"
            >
              <div>
                <dt className="text-foreground/40 uppercase text-[10px] tracking-wide">
                  Fish
                </dt>
                <dd className="text-primary text-2xl font-bold mt-1">
                  {data.stats.aliveFish}
                </dd>
              </div>
              <div>
                <dt className="text-foreground/40 uppercase text-[10px] tracking-wide">
                  Fossils
                </dt>
                <dd className="text-foreground/50 text-2xl font-bold mt-1">
                  {data.stats.fossilFish}
                </dd>
              </div>
              <div>
                <dt className="text-foreground/40 uppercase text-[10px] tracking-wide">
                  Stars
                </dt>
                <dd className="text-accent text-2xl font-bold mt-1">
                  {data.stats.totalStars.toLocaleString()}
                </dd>
              </div>
              <div>
                <dt className="text-foreground/40 uppercase text-[10px] tracking-wide">
                  Top Lang
                </dt>
                <dd className="text-primary text-2xl font-bold mt-1 truncate">
                  {data.stats.topLanguage ?? '—'}
                </dd>
              </div>
            </dl>

            {/* Fish list */}
            <ul className="space-y-2" aria-label="Repository list">
              {data.fish.slice(0, 25).map((fish) => (
                <li
                  key={fish.id}
                  className="flex items-center justify-between p-3 rounded-lg border border-primary/10 hover:border-primary/30 transition-colors text-sm"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <span
                      className="w-3 h-3 rounded-full flex-shrink-0"
                      style={{ backgroundColor: fish.color }}
                      aria-hidden
                    />
                    <a
                      href={fish.repoUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary hover:underline truncate"
                    >
                      {fish.repoName}
                    </a>
                    {fish.language && (
                      <span className="text-foreground/40 text-xs flex-shrink-0">
                        {fish.language}
                      </span>
                    )}
                  </div>
                  <span className="text-foreground/50 flex-shrink-0 ml-4">
                    ★ {fish.stars.toLocaleString()}
                  </span>
                </li>
              ))}
            </ul>
          </>
        ) : (
          <p className="text-foreground/50">Loading…</p>
        )}
      </div>
    </div>
  )
}

export { CanvasFallback }
