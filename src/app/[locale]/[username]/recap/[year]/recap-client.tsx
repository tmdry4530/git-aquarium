'use client'

import { RecapCarousel } from '@/components/ui/RecapCarousel'
import type { YearRecapData } from '@/types/webhook'

interface RecapClientProps {
  data: YearRecapData
  username: string
}

export function RecapClient({ data, username }: RecapClientProps) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-b from-slate-900 via-indigo-950 to-blue-950 p-4">
      <RecapCarousel data={data} username={username} />
    </div>
  )
}
