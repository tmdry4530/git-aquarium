import type { Metadata } from 'next'
import { RecapClient } from './recap-client'
import { buildYearRecap } from '@/lib/timeline/recap'

interface RecapPageProps {
  params: Promise<{ locale: string; username: string; year: string }>
}

export async function generateMetadata({
  params,
}: RecapPageProps): Promise<Metadata> {
  const { username, year } = await params
  return {
    title: `${username}'s ${year} Recap | Git Aquarium`,
    description: `${username}'s year in review - Git Aquarium ${year} Recap`,
    openGraph: {
      images: [`/api/recap/${username}/${year}/share`],
    },
  }
}

export default async function RecapPage({ params }: RecapPageProps) {
  const { username, year: yearStr } = await params
  const year = parseInt(yearStr, 10)

  if (isNaN(year) || year < 2008 || year > new Date().getFullYear()) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-900">
        <p className="text-white/60">Invalid year</p>
      </div>
    )
  }

  const recapData = await buildYearRecap(username, year)

  if (!recapData) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-900">
        <div className="text-center">
          <h1 className="mb-4 text-2xl font-bold text-white">
            No Data Available
          </h1>
          <p className="text-white/60">
            No snapshots found for {username} in {year}.
          </p>
        </div>
      </div>
    )
  }

  return <RecapClient data={recapData} username={username} />
}
