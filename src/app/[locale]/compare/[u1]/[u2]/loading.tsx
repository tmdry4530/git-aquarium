export default function CompareLoading() {
  return (
    <div className="flex h-screen w-full items-center justify-center bg-gradient-to-b from-blue-950 to-black">
      <div className="flex flex-col items-center gap-4">
        <div className="flex items-center gap-8">
          <div className="h-32 w-48 animate-pulse rounded-xl bg-white/5" />
          <div className="rounded-full bg-gradient-to-br from-cyan-500 to-blue-600 px-4 py-2 text-2xl font-black text-white">
            VS
          </div>
          <div className="h-32 w-48 animate-pulse rounded-xl bg-white/5" />
        </div>
        <p className="animate-pulse text-sm text-cyan-300/60">
          Loading aquariums...
        </p>
      </div>
    </div>
  )
}
