export default function AquariumLoading() {
  return (
    <div
      className="min-h-screen bg-background flex flex-col items-center justify-center gap-6"
      role="status"
      aria-label="Loading aquarium"
    >
      {/* Pulsing orb */}
      <div className="relative">
        <div className="w-16 h-16 rounded-full bg-primary/20 animate-ping absolute inset-0" />
        <div className="w-16 h-16 rounded-full bg-primary/10 border border-primary/30 flex items-center justify-center relative">
          <span className="text-2xl" aria-hidden="true">
            🐠
          </span>
        </div>
      </div>

      {/* Skeleton bars */}
      <div className="flex flex-col gap-2 w-48">
        <div className="h-2 rounded bg-primary/10 animate-pulse" />
        <div className="h-2 rounded bg-primary/10 animate-pulse w-3/4" />
        <div className="h-2 rounded bg-primary/10 animate-pulse w-1/2" />
      </div>

      <p className="text-primary/50 text-xs font-mono tracking-widest uppercase animate-pulse">
        Diving in...
      </p>
    </div>
  )
}
